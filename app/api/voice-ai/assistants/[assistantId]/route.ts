import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import VapiAssistant from '@/models/VapiAssistant';
import Client from '@/models/Client';
import requireClientAccess from '@/middleware/requireClientAccess';

// Helper function to generate sample daily call data
function generateSampleDailyData(days: number) {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      calls: Math.floor(Math.random() * 10), // Random number of calls between 0-9
      successRate: 85 + Math.floor(Math.random() * 15) // Random success rate between 85-99%
    });
  }
  
  return result.reverse(); // Return chronological order
}

// Helper function to generate sample call history
function generateSampleCallHistory(vapiAssistantId: string) {
  const calls = [];
  const today = new Date();
  
  // Generate 10 sample calls
  for (let i = 0; i < 10; i++) {
    const callTime = new Date(today);
    callTime.setHours(callTime.getHours() - i * 3); // Calls separated by 3 hours
    
    calls.push({
      callId: `call_${Math.random().toString(36).substring(2, 10)}`,
      timestamp: callTime.toISOString(),
      duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      status: Math.random() > 0.1 ? 'completed' : 'failed', // 90% success rate
      cost: (Math.random() * 0.1 + 0.05).toFixed(4), // Cost between $0.05-$0.15
      caller: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      assistantId: vapiAssistantId
    });
  }
  
  return calls;
}

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in assistant detail API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// GET specific assistant by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { assistantId: string } }
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
  
  const { assistantId } = params;
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate assistant ID format
    if (!mongoose.Types.ObjectId.isValid(assistantId)) {
      return NextResponse.json({ error: 'Invalid assistant ID' }, { status: 400 });
    }
    
    // Get additional data flag
    const url = new URL(req.url);
    const includeStats = url.searchParams.get('includeStats') === 'true';
    const includeCallHistory = url.searchParams.get('includeCallHistory') === 'true';
    
    // Fetch assistant with detailed info
    const assistant = await VapiAssistant.findById(assistantId).populate('clientId', 'name logo branding')
      .select('_id name description configuration performance clientId vapiAssistantId vapiPhoneNumber isActive createdAt updatedAt lastCallAt')
      .lean();
    
    if (!assistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }
    
    // Check client access permissions for this assistant's client
    const clientAccessResponse = await requireClientAccess(req, NextResponse.next(), assistant.clientId.toString());
    if (clientAccessResponse.status !== 200) {
      return clientAccessResponse;
    }
    
    // Check if client user has access to this assistant
    if (session.user.isClientUser && session.user.clientId) {
      // User can only access assistants from their client
      if (assistant.clientId.toString() !== session.user.clientId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    // Prepare response object
    const response: any = { assistant };
    
    // Include additional data if requested and user is admin
    if (session.user.role === UserRole.ADMIN) {
      // Include detailed stats if requested
      if (includeStats) {
        // Get aggregated call stats for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // In a real implementation, this would query a calls collection
        // For now, we'll just return sample stats
        response.stats = {
          last30Days: {
            totalCalls: assistant.performance?.totalCalls || 0,
            successRate: assistant.performance?.totalCalls > 0 ?
              (assistant.performance.successfulCalls / assistant.performance.totalCalls) * 100 : 0,
            avgDuration: assistant.performance?.totalCalls > 0 ? 
              assistant.performance.totalDuration / assistant.performance.totalCalls : 0,
            callsByDay: generateSampleDailyData(30)
          },
          costBreakdown: {
            totalCost: assistant.performance?.totalCost || 0,
            averageCostPerCall: assistant.performance?.totalCalls > 0 ?
              assistant.performance.totalCost / assistant.performance.totalCalls : 0
          }
        };
      }
      
      // Include call history if requested
      if (includeCallHistory) {
        // In a real implementation, this would query a calls collection
        // For now, we'll just return sample call history
        response.callHistory = generateSampleCallHistory(assistant.vapiAssistantId);
      }
    }
    
    // Get client information to include with assistant
    const client = await Client.findById(assistant.clientId)
      .select('_id name branding')
      .lean();
      
    return NextResponse.json({
      ...assistant,
      client: client || null
    });
  } catch (error) {
    console.error('Error fetching assistant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update assistant by ID (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only admin can update assistants
  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { assistantId } = params;
  
  try {
    await connectToDatabase();
    
    // Validate assistant ID format
    if (!mongoose.Types.ObjectId.isValid(assistantId)) {
      return NextResponse.json({ error: 'Invalid assistant ID' }, { status: 400 });
    }
    
    // Check if assistant exists
    const existingAssistant = await VapiAssistant.findById(assistantId);
    
    if (!existingAssistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }
    
    const data = await req.json();
    const { name, description, vapiPhoneNumber, vapiAssistantId, clientId, settings, isActive } = data;
    
    // Basic validation
    if (!name || !vapiPhoneNumber || !vapiAssistantId) {
      return NextResponse.json({ 
        error: 'Name, Vapi phone number, and Vapi assistant ID are required' 
      }, { status: 400 });
    }
    
    // Check if client exists if clientId is provided
    if (clientId && mongoose.Types.ObjectId.isValid(clientId)) {
      const client = await Client.findById(clientId);
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
    }
    
    // Update the assistant
    const updateData: any = {
      name,
      description: description || '',
      vapiPhoneNumber,
      vapiAssistantId,
      settings: settings || {},
      isActive: isActive !== undefined ? isActive : existingAssistant.isActive,
      updatedAt: new Date()
    };
    
    // Set or unset clientId based on the input
    if (clientId) {
      updateData.clientId = clientId;
    } else if (clientId === null || clientId === '') {
      // If explicitly set to null or empty string, remove the client association
      updateData.$unset = { clientId: 1 };
    }
    
    const updatedAssistant = await VapiAssistant.findByIdAndUpdate(
      assistantId,
      { $set: updateData },
      { new: true }
    );
    
    return NextResponse.json({ success: true, assistant: updatedAssistant });
  } catch (error) {
    console.error('Error updating assistant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove assistant by ID (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { assistantId: string } }
) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only admin can delete assistants
  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { assistantId } = params;
  
  try {
    await connectToDatabase();
    
    // Validate assistant ID format
    if (!mongoose.Types.ObjectId.isValid(assistantId)) {
      return NextResponse.json({ error: 'Invalid assistant ID' }, { status: 400 });
    }
    
    // Check if assistant exists
    const existingAssistant = await VapiAssistant.findById(assistantId);
    
    if (!existingAssistant) {
      return NextResponse.json({ error: 'Assistant not found' }, { status: 404 });
    }
    
    // Delete the assistant
    await VapiAssistant.findByIdAndDelete(assistantId);
    
    return NextResponse.json({ success: true, message: 'Assistant deleted successfully' });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
