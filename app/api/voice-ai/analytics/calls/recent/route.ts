import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import Call from '@/models/Call';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in recent calls API');
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

    // Connect to MongoDB
    await connectToDatabase();
    
    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '20');
    
    // Get filters
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');
    const qualified = url.searchParams.get('qualified');
    
    // Build query filters
    const filter: any = {};
    
    // Apply status filter
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Apply date filters
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      
      if (dateFrom) {
        filter.createdAt.$gte = startOfDay(parseISO(dateFrom));
      }
      
      if (dateTo) {
        filter.createdAt.$lte = endOfDay(parseISO(dateTo));
      }
    }
    
    // Apply qualification filter
    if (qualified !== null && qualified !== undefined) {
      filter.isQualified = qualified === 'true';
    }
    
    // Calculate pagination
    const skip = (page - 1) * perPage;
    
    // Get calls with filters and pagination
    const calls = await Call.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();
    
    // Get total count for pagination
    const totalCalls = await Call.countDocuments(filter);
    const totalPages = Math.ceil(totalCalls / perPage);
    
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
      transcript: call.transcript || undefined,
      summary: call.summary || undefined,
      isQualified: call.isQualified || false,
      caseType: call.caseType || undefined
    }));
    
    return NextResponse.json({
      calls: formattedCalls,
      pagination: {
        page,
        perPage,
        total: totalCalls,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching recent calls:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
