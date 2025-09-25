import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import Call from '@/models/Call';
import Client from '@/models/Client';
import VapiAssistant from '@/models/VapiAssistant';
import vapiService from '@/services/vapiService';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in customer analytics API');
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
    
    await connectToDatabase();
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d'; // 1d, 7d, 30d
    const includeVapiData = searchParams.get('includeVapi') === 'true';
    
    // Determine date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Build filter based on user role
    let filter: any = {
      'timing.createdAt': { $gte: startDate }
    };
    
    // For client users, filter by their clientId
    if (session.user?.isClientUser && session.user?.clientId) {
      filter.clientId = new mongoose.Types.ObjectId(session.user.clientId);
    }
    
    // Get calls from database
    const calls = await Call.find(filter)
      .populate('clientId', 'name')
      .populate('assistantId', 'name vapiAssistantId')
      .sort({ 'timing.createdAt': -1 })
      .limit(1000)
      .lean();
    
    // Calculate analytics
    const totalCalls = calls.length;
    const completedCalls = calls.filter(call => call.status === 'completed').length;
    const qualifiedCalls = calls.filter(call => call.analysis.isQualified).length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.timing.durationSeconds || 0), 0);
    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
    const successRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;
    const qualificationRate = totalCalls > 0 ? (qualifiedCalls / totalCalls) * 100 : 0;
    
    // Group calls by hour for today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCalls = calls.filter(call => 
      new Date(call.timing.createdAt) >= today
    );
    
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourCalls = todayCalls.filter(call => {
        const callHour = new Date(call.timing.createdAt).getHours();
        return callHour === hour;
      });
      return {
        hour,
        calls: hourCalls.length,
        qualified: hourCalls.filter(call => call.analysis.isQualified).length
      };
    });
    
    // Group calls by day for trend data
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayCalls = calls.filter(call => {
        const callDate = new Date(call.timing.createdAt);
        return callDate >= date && callDate < nextDate;
      });
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        totalCalls: dayCalls.length,
        qualifiedCalls: dayCalls.filter(call => call.analysis.isQualified).length,
        avgDuration: dayCalls.length > 0 ? 
          Math.round(dayCalls.reduce((sum, call) => sum + (call.timing.durationSeconds || 0), 0) / dayCalls.length) : 0
      });
    }
    
    // Format recent calls for display
    const recentCalls = calls.slice(0, 50).map((call: any) => ({
      id: call.vapiCallId,
      phoneNumber: call.phoneNumber,
      status: call.status,
      createdAt: call.timing.createdAt,
      startedAt: call.timing.startedAt,
      endedAt: call.timing.endedAt,
      durationSeconds: call.timing.durationSeconds || 0,
      isQualified: call.analysis.isQualified,
      caseType: call.analysis.caseType,
      estimatedValue: call.analysis.estimatedValue,
      cost: call.cost,
      clientName: call.clientId?.name || 'Unknown',
      assistantName: call.assistantId?.name || 'Unknown'
    }));
    
    // Get assistant-specific data
    const assistantStats: Record<string, any> = {};
    calls.forEach((call: any) => {
      const assistantId = call.assistantId?._id?.toString();
      const assistantName = call.assistantId?.name || 'Unknown';
      
      if (!assistantStats[assistantId]) {
        assistantStats[assistantId] = {
          name: assistantName,
          totalCalls: 0,
          qualifiedCalls: 0,
          totalDuration: 0,
          completedCalls: 0
        };
      }
      
      assistantStats[assistantId].totalCalls++;
      if (call.analysis.isQualified) assistantStats[assistantId].qualifiedCalls++;
      if (call.status === 'completed') assistantStats[assistantId].completedCalls++;
      assistantStats[assistantId].totalDuration += call.timing.durationSeconds || 0;
    });
    
    // Convert assistant stats to array
    const assistantAnalytics = Object.entries(assistantStats).map(([id, stats]: [string, any]) => ({
      assistantId: id,
      name: stats.name,
      totalCalls: stats.totalCalls,
      qualifiedCalls: stats.qualifiedCalls,
      completedCalls: stats.completedCalls,
      successRate: stats.totalCalls > 0 ? (stats.completedCalls / stats.totalCalls) * 100 : 0,
      qualificationRate: stats.totalCalls > 0 ? (stats.qualifiedCalls / stats.totalCalls) * 100 : 0,
      avgDuration: stats.totalCalls > 0 ? Math.round(stats.totalDuration / stats.totalCalls) : 0
    }));
    
    // Optionally fetch live data from Vapi API
    let vapiLiveData = null;
    if (includeVapiData) {
      try {
        const vapiCalls = await vapiService.getRecentCalls(100);
        vapiLiveData = {
          totalCalls: vapiCalls.length,
          recentCalls: vapiCalls.slice(0, 10).map(call => ({
            id: call.id,
            phoneNumber: call.customer?.number || 'Unknown',
            status: call.status,
            createdAt: call.createdAt,
            endedAt: call.endedAt,
            durationSeconds: call.endedAt && call.startedAt ? 
              Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000) : 0
          }))
        };
      } catch (error) {
        console.error('Error fetching Vapi live data:', error);
        // Continue without live data
      }
    }
    
    const responseData = {
      timeRange,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      },
      summary: {
        totalCalls,
        completedCalls,
        qualifiedCalls,
        totalDuration,
        avgDuration,
        successRate: Math.round(successRate * 100) / 100,
        qualificationRate: Math.round(qualificationRate * 100) / 100
      },
      todayMetrics: {
        totalCalls: todayCalls.length,
        qualifiedCalls: todayCalls.filter(call => call.analysis.isQualified).length,
        avgDuration: todayCalls.length > 0 ? 
          Math.round(todayCalls.reduce((sum, call) => sum + (call.timing.durationSeconds || 0), 0) / todayCalls.length) : 0,
        successRate: todayCalls.length > 0 ? 
          (todayCalls.filter(call => call.status === 'completed').length / todayCalls.length) * 100 : 0
      },
      hourlyData,
      dailyData,
      recentCalls,
      assistantAnalytics,
      vapiLiveData
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
