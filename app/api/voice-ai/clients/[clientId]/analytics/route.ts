import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import Client from '@/models/Client';
import VapiAssistant from '@/models/VapiAssistant';
import requireClientAccess from '@/middleware/requireClientAccess';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in client analytics API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// Helper function to generate sample daily call data for a client
function generateSampleClientDailyData(days: number) {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      calls: Math.floor(Math.random() * 25), // Random number of calls between 0-24
      successRate: 85 + Math.floor(Math.random() * 15), // Random success rate between 85-99%
      avgDuration: Math.floor(Math.random() * 120) + 60, // 60-180 seconds
      cost: (Math.random() * 0.5 + 0.2).toFixed(2) // Cost between $0.20-$0.70
    });
  }
  
  return result.reverse(); // Return chronological order
}

// GET analytics for a specific client
export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user has Voice AI access
  const hasAccess = session.user.hasVoiceAiAccess || 
                    session.user.role === UserRole.ADMIN;
                    
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { clientId } = params;
  
  // Check client access
  const clientAccessResponse = await requireClientAccess(req, NextResponse.next(), clientId);
  if (clientAccessResponse.status !== 200) {
    return clientAccessResponse;
  }
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate client ID format
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }
    
    const url = new URL(req.url);
    
    // Extract query parameters
    const timeRange = url.searchParams.get('timeRange') || '30d'; // default to 30 days
    
    // Get client
    const client = await Client.findById(clientId).select('name branding');
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Get all assistants for this client to aggregate their metrics
    const assistants = await VapiAssistant.find({ 
      clientId: new mongoose.Types.ObjectId(clientId)
    }).select('_id name performance');
    
    // Aggregate metrics across all assistants
    let totalCalls = 0;
    let successfulCalls = 0;
    let totalDuration = 0;
    let totalCost = 0;
    
    assistants.forEach(assistant => {
      if (assistant.performance) {
        totalCalls += assistant.performance.totalCalls || 0;
        successfulCalls += assistant.performance.successfulCalls || 0;
        totalDuration += assistant.performance.totalDuration || 0;
        totalCost += assistant.performance.totalCost || 0;
      }
    });
    
    // Calculate days for time range
    let days = 30;
    if (timeRange === '7d') days = 7;
    if (timeRange === '90d') days = 90;
    
    // Generate sample daily data
    const dailyData = generateSampleClientDailyData(days);
    
    // Calculate averages
    const avgCallDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
    const costPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;
    
    // Prepare response
    const analytics = {
      client: {
        _id: client._id,
        name: client.name,
        branding: client.branding
      },
      summary: {
        totalCalls,
        successfulCalls,
        failedCalls: totalCalls - successfulCalls,
        successRate,
        avgCallDuration,
        totalCost,
        costPerCall,
        assistantCount: assistants.length
      },
      timeRange,
      dailyData,
      // Top assistants by call volume
      topAssistants: assistants
        .sort((a, b) => {
          const aCount = a.performance?.totalCalls || 0;
          const bCount = b.performance?.totalCalls || 0;
          return bCount - aCount;
        })
        .slice(0, 5)
        .map(a => ({
          _id: a._id,
          name: a.name,
          totalCalls: a.performance?.totalCalls || 0,
          successRate: a.performance?.totalCalls > 0 ? 
            (a.performance.successfulCalls / a.performance.totalCalls) * 100 : 0
        }))
    };
    
    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error fetching client analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
