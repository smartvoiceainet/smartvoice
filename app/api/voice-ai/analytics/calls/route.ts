import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import Call from '@/models/Call';
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
      console.log('MongoDB connected in calls API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has Voice AI access
    const hasAccess = session.user?.hasVoiceAiAccess || 
                     session.user?.role === UserRole.ADMIN;
                     
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    let clientId = searchParams.get('clientId');
    let assistantId = searchParams.get('assistantId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '10', 10);
    const status = searchParams.get('status');
    const isQualified = searchParams.get('qualified');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // For client users, enforce their own clientId and ignore any attempts to view other clients' data
    if (session.user?.isClientUser && session.user?.clientId) {
      // Force the clientId to be the one associated with the user
      clientId = session.user.clientId;
      
      // If they have a default assistant and no specific one was requested, use their default
      if (!assistantId && session.user.defaultAssistantId) {
        assistantId = session.user.defaultAssistantId;
      }
    }
    
    // Check client access permissions if clientId is provided
    if (clientId) {
      const accessResponse = await requireClientAccess(req, NextResponse.next(), clientId);
      if (accessResponse.status !== 200) {
        return accessResponse;
      }
    }
    
    // Force client filtering if user is a client user
    const clientIdToUse = session.user?.isClientUser ? 
      session.user?.clientId?.toString() : 
      clientId || null;
      
    // Connect to database
    await connectToDatabase();
    
    // Build filter
    const filter: any = {};
    
    // Apply client/assistant filters
    if (clientIdToUse) {
      filter.clientId = new mongoose.Types.ObjectId(clientIdToUse);
    }
    
    if (assistantId) {
      filter.assistantId = new mongoose.Types.ObjectId(assistantId);
    }
    
    // Apply other filters
    if (status) {
      filter.status = status;
    }
    
    if (isQualified === 'true') {
      filter.isQualified = true;
    } else if (isQualified === 'false') {
      filter.isQualified = false;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }
    
    // Execute query with pagination
    const skip = (page - 1) * perPage;
    const [calls, total] = await Promise.all([
      Call.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),
      Call.countDocuments(filter)
    ]);
    
    // Calculate pagination info
    const pages = Math.ceil(total / perPage);
    const hasNext = page < pages;
    const hasPrev = page > 1;
    
    // Format calls for frontend
    const formattedCalls = calls.map((call: any) => ({
      id: call.vapiId,
      assistantId: call.assistantId,
      phoneNumber: call.phoneNumber,
      status: call.status,
      createdAt: call.createdAt.toISOString(),
      startedAt: call.startedAt ? call.startedAt.toISOString() : call.createdAt.toISOString(),
      endedAt: call.endedAt ? call.endedAt.toISOString() : undefined,
      durationSeconds: call.durationSeconds || 0,
      cost: call.cost || 0,
      isQualified: call.isQualified || false,
      caseType: call.caseType || 'Unknown',
      estimatedValue: call.estimatedValue || 0,
    }));
    
    // Return paginated results
    return NextResponse.json({
      calls: formattedCalls,
      pagination: {
        page,
        perPage,
        total,
        pages,
        hasNext,
        hasPrev
      }
    });
    
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
