import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import Call, { CallStatus } from '@/models/Call';
import DailyMetrics from '@/models/DailyMetrics';
import { startOfDay, endOfDay, formatISO, subHours } from 'date-fns';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in real-time API');
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
    
    // Get clientId and assistantId from query parameters
    const searchParams = req.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    const assistantId = searchParams.get('assistantId');
    
    // Restrict client access if user is a client user
    if (session.user?.isClientUser && session.user?.clientId) {
      // If client user is trying to access data not for their client, deny access
      if (clientId && clientId !== session.user.clientId.toString()) {
        return NextResponse.json({ error: 'Access denied to requested client data' }, { status: 403 });
      }
      
      // Force client filter to be the user's client
      const clientIdToUse = session.user.clientId.toString();
    }

    // Connect to MongoDB
    await connectToDatabase();
    
    const now = new Date();
    const today = startOfDay(now);
    const lastHour = subHours(now, 1);
    
    // Determine the client ID to use based on user role
    const clientIdToUse = session.user?.isClientUser ? session.user?.clientId?.toString() : clientId || null;
    
    // Build query filters for MongoDB
    const metricsFilter: any = { date: formatISO(today, { representation: 'date' }) };
    const callsFilter: any = {
      createdAt: { $gte: today, $lte: endOfDay(now) }
    };
    
    // Add client and assistant filters if provided
    if (clientIdToUse) {
      metricsFilter.clientId = new mongoose.Types.ObjectId(clientIdToUse);
      callsFilter.clientId = new mongoose.Types.ObjectId(clientIdToUse);
    }
    
    if (assistantId) {
      metricsFilter.assistantId = new mongoose.Types.ObjectId(assistantId);
      callsFilter.assistantId = new mongoose.Types.ObjectId(assistantId);
    }
    
    // Get today's metrics - either from DailyMetrics or calculate from calls
    const todayMetrics = await DailyMetrics.findOne(metricsFilter);
    
    // Get calls from the last hour with client/assistant filters applied
    const hourlyCallsFilter = { ...callsFilter, createdAt: { $gte: lastHour } };
    const recentCalls = await Call.find(hourlyCallsFilter).sort({ createdAt: -1 }).limit(5).lean();
    
    // Format recent calls for frontend
    const formattedRecentCalls = recentCalls.map((call: any) => ({
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
    }));
    
    // Calculate real-time metrics
    let currentMetrics: any;
    
    if (todayMetrics) {
      // Use existing metrics
      currentMetrics = {
        date: formatISO(today, { representation: 'date' }),
        totalCalls: todayMetrics.metrics.totalCalls,
        successfulCalls: todayMetrics.metrics.successfulCalls,
        failedCalls: todayMetrics.metrics.failedCalls,
        qualifiedCalls: todayMetrics.metrics.qualifiedCalls,
        totalDurationSeconds: todayMetrics.metrics.totalDurationSeconds,
        averageDurationSeconds: todayMetrics.metrics.averageDurationSeconds,
        totalCost: todayMetrics.metrics.totalCost,
        estimatedRevenue: todayMetrics.metrics.estimatedRevenue,
        successRate: todayMetrics.metrics.successRate,
        qualificationRate: todayMetrics.metrics.qualificationRate,
        hourlyBreakdown: todayMetrics.hourlyBreakdown || {}
      };
    } else {
      // Calculate from call data with client/assistant filters
      const todayCalls = await Call.find(callsFilter);
      
      const totalCalls = todayCalls.length;
      const successfulCalls = todayCalls.filter(
        (call: any) => call.status === CallStatus.COMPLETED
      ).length;
      const failedCalls = todayCalls.filter(
        (call: any) => call.status === CallStatus.FAILED
      ).length;
      
      const qualifiedCalls = todayCalls.filter((call: any) => call.isQualified).length;
      
      const completedCalls = todayCalls.filter(
        (call: any) => call.status === CallStatus.COMPLETED && call.durationSeconds > 0
      );
      
      const totalDuration = completedCalls.reduce(
        (sum: number, call: any) => sum + call.durationSeconds, 0
      );
      
      const avgDuration = completedCalls.length > 0 ?
        totalDuration / completedCalls.length : 0;
      
      const totalCost = todayCalls.reduce(
        (sum: number, call: any) => sum + (call.cost || 0), 0
      );
      
      // Estimated revenue based on qualified leads
      const estimatedRevenue = qualifiedCalls * 100; // $100 per qualified lead
      
      const successRate = totalCalls > 0 ? 
        (successfulCalls / totalCalls) * 100 : 0;
      
      const qualificationRate = successfulCalls > 0 ? 
        (qualifiedCalls / successfulCalls) * 100 : 0;
      
      // Create hourly breakdown
      const hourlyBreakdown: Record<string, number> = {};
      const currentHour = now.getHours();
      
      for (let i = 0; i <= currentHour; i++) {
        const callsThisHour = todayCalls.filter(
          (call: any) => call.createdAt.getHours() === i
        ).length;
        hourlyBreakdown[i.toString()] = callsThisHour;
      }
      
      currentMetrics = {
        date: formatISO(today, { representation: 'date' }),
        totalCalls,
        successfulCalls,
        failedCalls,
        qualifiedCalls,
        totalDurationSeconds: totalDuration,
        averageDurationSeconds: avgDuration,
        totalCost,
        estimatedRevenue,
        successRate,
        qualificationRate,
        hourlyBreakdown
      };
    }
    
    // Get sync info from the last sync operation
    // This would normally come from a sync log, but we'll use placeholder data for now
    const syncInfo: {
      syncedCount: number;
      updatedCount: number;
      totalProcessed: number;
      lastSyncAt: Date | null;
    } = {
      syncedCount: 0,
      updatedCount: 0,
      totalProcessed: 0,
      lastSyncAt: null
    };
    
    // Return real-time data
    return NextResponse.json({
      currentMetrics,
      recentCalls: formattedRecentCalls,
      syncInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
