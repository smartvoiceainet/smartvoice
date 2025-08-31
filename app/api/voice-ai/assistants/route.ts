import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import VapiAssistant from '@/models/VapiAssistant';
import Client from '@/models/Client';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in assistants API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// GET all assistants or just client-specific ones
export async function GET(req: NextRequest) {
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
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    const url = new URL(req.url);
    
    // Extract query parameters
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortDirection = url.searchParams.get('sortDirection') || 'asc';
    const isActive = url.searchParams.get('isActive');
    let clientId = url.searchParams.get('clientId') || '';
    
    // If user is a client user, force them to only view their client's assistants
    if (session.user.isClientUser) {
      if (session.user.clientId) {
        clientId = session.user.clientId;
      } else {
        // Client users without a clientId shouldn't see any assistants
        return NextResponse.json({ 
          assistants: [],
          pagination: { total: 0, page, limit, pages: 0 }
        });
      }
    }
    
    // Build query
    const query: any = {};
    
    // Add clientId filter
    if (clientId) {
      query.clientId = new mongoose.Types.ObjectId(clientId);
    }
    
    // Add active filter
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    } else if (session.user.isClientUser) {
      // For client users, only return active assistants by default
      query.isActive = true;
    }
    
    // Add search
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
      .populate('clientId', 'name');
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
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
    console.error('Error fetching assistants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new assistant (admin only)
export async function POST(req: NextRequest) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only admin can create assistants
  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    await connectToDatabase();
    
    const data = await req.json();
    const { name, vapiPhoneNumber, vapiAssistantId, clientId, description, settings, isActive } = data;
    
    // Basic validation
    if (!name || !vapiPhoneNumber || !vapiAssistantId) {
      return NextResponse.json({ 
        error: 'Name, Vapi phone number, and Vapi assistant ID are required' 
      }, { status: 400 });
    }
    
    // Check if client exists if clientId is provided
    if (clientId) {
      const client = await Client.findById(clientId);
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
    }
    
    // Create the assistant
    const assistant = new VapiAssistant({
      name,
      vapiPhoneNumber,
      vapiAssistantId,
      clientId: clientId || null,
      description: description || '',
      settings: settings || {},
      isActive: isActive !== undefined ? isActive : true
    });
    
    await assistant.save();
    
    return NextResponse.json({ success: true, assistant });
  } catch (error) {
    console.error('Error creating assistant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
