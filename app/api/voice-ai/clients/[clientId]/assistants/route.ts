import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
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
      console.log('MongoDB connected in client assistants API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// GET assistants for a specific client
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
    
    // Extract query parameters for pagination, sorting, and filtering
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortDirection = url.searchParams.get('sortDirection') || 'asc';
    const isActive = url.searchParams.get('isActive');
    
    // Build query
    const query: any = { clientId: new mongoose.Types.ObjectId(clientId) };
    
    // Add active filter if specified
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    // Add search if specified
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { vapiPhoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Create sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortDirection === 'desc' ? -1 : 1;
    
    // Count total documents for pagination info
    const total = await VapiAssistant.countDocuments(query);
    
    // Get assistants based on query with pagination and sorting
    const assistants = await VapiAssistant.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('_id name description isActive clientId vapiAssistantId vapiPhoneNumber configuration performance lastCallAt createdAt');
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    // Return in the expected format with pagination data
    return NextResponse.json({
      assistants,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    });
  } catch (error) {
    console.error('Error fetching client assistants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
