import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import DailyMetrics from '@/models/DailyMetrics';
import Call, { CallStatus } from '@/models/Call';
import { startOfDay, endOfDay, format, subDays } from 'date-fns';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in dashboard API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

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
  
  // Extract client and assistant filtering parameters
  const clientId = req.nextUrl.searchParams.get('clientId');
  const assistantId = req.nextUrl.searchParams.get('assistantId');
  
  // If user is a client user, enforce their client ID
  const effectiveClientId = session.user.isClientUser ? 
    session.user.clientId?.toString() : 
    clientId || null;
    
  // Check client access permissions if user is trying to access specific client data
  if (effectiveClientId && session.user.isClientUser && 
      session.user.clientId?.toString() !== effectiveClientId) {
    return NextResponse.json({ error: 'Access denied to requested client data' }, { status: 403 });
  }
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    // Build query filters for client/assistant
    const metricsFilter: any = {
      date: {
        $gte: todayStart,
        $lte: todayEnd
      }
    };
    
    const callsFilter: any = {
      'timing.createdAt': {
        $gte: todayStart,
        $lte: todayEnd
      }
    };
    
    // Apply client filter if available
    if (effectiveClientId) {
      metricsFilter.clientId = new mongoose.Types.ObjectId(effectiveClientId);
      callsFilter.clientId = new mongoose.Types.ObjectId(effectiveClientId);
    }
    
    // Apply assistant filter if available
    if (assistantId) {
      metricsFilter.assistantId = new mongoose.Types.ObjectId(assistantId);
      callsFilter.assistantId = new mongoose.Types.ObjectId(assistantId);
    }
    
    // Get today's metrics from database
    const todayMetrics = await DailyMetrics.findOne(metricsFilter);
    
    // If no metrics exist, calculate from raw call data
    let metricsData: any = {};
    
    if (todayMetrics) {
      metricsData = {
        total_calls: todayMetrics.metrics.totalCalls,
        successful_calls: todayMetrics.metrics.successfulCalls,
        failed_calls: todayMetrics.metrics.failedCalls,
        success_rate: todayMetrics.metrics.successRate.toFixed(1),
        average_duration: Math.round(todayMetrics.metrics.averageDurationSeconds),
        qualified_calls: todayMetrics.metrics.qualifiedCalls
      };
    } else {
      // Calculate from call data
      const todayCalls = await Call.find(callsFilter);
      
      const totalCalls = todayCalls.length;
      const successfulCalls = todayCalls.filter(
        (call) => call.status === CallStatus.COMPLETED
      ).length;
      const failedCalls = totalCalls - successfulCalls;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
      
      const completedCalls = todayCalls.filter(
        (call: any) => call.status === CallStatus.COMPLETED && call.timing.durationSeconds > 0
      );
      
      const avgDuration = completedCalls.length > 0 ?
        completedCalls.reduce((sum: number, call: any) => sum + (call.timing?.durationSeconds || 0), 0) / completedCalls.length :
        0;
      
      // Check for qualification in the analysis field
      const qualifiedCalls = todayCalls.filter((call: any) => 
        call.analysis?.qualification?.isQualified || 
        call.analysis?.isQualified
      ).length;
      
      metricsData = {
        total_calls: totalCalls,
        successful_calls: successfulCalls,
        failed_calls: failedCalls,
        success_rate: successRate.toFixed(1),
        average_duration: Math.round(avgDuration),
        qualified_calls: qualifiedCalls
      };
    }
    
    // Get hourly data from database or calculate it
    let hourlyData = [];
    
    if (todayMetrics && todayMetrics.hourlyBreakdown) {
      // Convert Map to array format expected by frontend
      const hourlyMap = todayMetrics.hourlyBreakdown instanceof Map ? 
        todayMetrics.hourlyBreakdown : 
        new Map(Object.entries(todayMetrics.hourlyBreakdown));
      
      hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        calls: hourlyMap.get(i.toString()) || 0
      }));
    } else {
      // Aggregate calls by hour
      const callsByHour = await Call.aggregate([
        {
          $match: {
            createdAt: {
              $gte: todayStart,
              $lte: todayEnd
            }
          }
        },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      const hourMap = new Map();
      callsByHour.forEach((entry: any) => hourMap.set(entry._id, entry.count));
      
      hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        calls: hourMap.get(i) || 0
      }));
    }
    
    // Get weekly data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Build filter for the date with client/assistant filters
      const dayMetricsFilter = {
        date: {
          $gte: startOfDay(date),
          $lte: endOfDay(date)
        },
        ...metricsFilter.clientId ? { clientId: metricsFilter.clientId } : {},
        ...metricsFilter.assistantId ? { assistantId: metricsFilter.assistantId } : {}
      };
      
      // Try to get from DailyMetrics
      const dayMetrics = await DailyMetrics.findOne(dayMetricsFilter);
      
      if (dayMetrics && dayMetrics.metrics) {
        weeklyData.push({
          date: formattedDate,
          calls: dayMetrics.metrics.totalCalls || 0,
          qualified_leads: dayMetrics.metrics.qualifiedCalls || 0
        });
      } else {
        // Calculate from call data with client/assistant filtering
        const dayCallsFilter = {
          'timing.createdAt': {
            $gte: startOfDay(date),
            $lte: endOfDay(date)
          },
          ...callsFilter.clientId ? { clientId: callsFilter.clientId } : {},
          ...callsFilter.assistantId ? { assistantId: callsFilter.assistantId } : {}
        };
        
        const dayCalls = await Call.find(dayCallsFilter);
        
        const totalCallsDay = dayCalls.length;
        const qualifiedCallsDay = dayCalls.filter((call: any) => 
          call.analysis?.qualification?.isQualified || 
          call.analysis?.isQualified
        ).length;
        
        weeklyData.push({
          date: formattedDate,
          calls: totalCallsDay,
          qualified_leads: qualifiedCallsDay
        });
      }
    }
    
    // Get recent calls
    const recentCalls = await Call.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Format recent calls for frontend
    const formattedRecentCalls = recentCalls.map((call: any) => ({
      id: call.vapiId,
      status: call.status,
      duration_seconds: call.durationSeconds,
      from: call.phoneNumber,
      created_at: call.createdAt.toISOString(),
      is_qualified: call.isQualified,
      case_type: call.caseType || null
    }));
    
    return NextResponse.json({
      metrics: {
        today: metricsData,
        hourly_data: hourlyData,
        weekly_data: weeklyData
      },
      recent_calls: formattedRecentCalls
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
