import mongoose from 'mongoose';
import { format, subDays } from 'date-fns';
import vapiService from './vapiService';
import Call, { CallStatus, ICall } from '@/models/Call';
import DailyMetrics, { IDailyMetrics } from '@/models/DailyMetrics';

/**
 * Service responsible for synchronizing data between Vapi API and local database
 */
class SyncService {
  private syncInProgress: boolean = false;
  private lastSyncTime: Date | null = null;
  
  constructor() {
    // Ensure MongoDB connection
    this.ensureDbConnection();
  }

  /**
   * Ensure MongoDB connection is established
   */
  private async ensureDbConnection() {
    if (mongoose.connection.readyState !== 1) {
      try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
          throw new Error('MongoDB connection string is not defined');
        }
        
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected in SyncService');
      } catch (error) {
        console.error('MongoDB connection error:', error);
      }
    }
  }

  /**
   * Sync recent calls from Vapi API to local database
   * @returns Object with sync results
   */
  async syncCalls(): Promise<{ 
    success: boolean; 
    message: string; 
    newCalls?: number; 
    updatedCalls?: number; 
  }> {
    if (this.syncInProgress) {
      return { success: false, message: 'Sync already in progress' };
    }

    try {
      this.syncInProgress = true;
      
      // Get recent calls from Vapi API
      const recentCalls = await vapiService.getRecentCalls(200);
      
      let newCalls = 0;
      let updatedCalls = 0;
      
      // Process each call
      for (const callData of recentCalls) {
        const callId = callData.id;
        
        // Check if call already exists in database
        const existingCall = await Call.findOne({ vapiId: callId });
        
        if (existingCall) {
          // Update existing call
          await Call.updateOne(
            { vapiId: callId },
            {
              $set: {
                status: this.mapCallStatus(callData.status),
                startedAt: callData.started_at ? new Date(callData.started_at) : undefined,
                endedAt: callData.ended_at ? new Date(callData.ended_at) : undefined,
                durationSeconds: callData.duration_seconds || 0,
                cost: callData.cost || 0,
                transcript: callData.transcript || '',
                summary: callData.summary || '',
                // For demo purposes, mark calls with duration > 60 seconds as qualified
                isQualified: (callData.duration_seconds || 0) > 60,
                rawData: callData
              }
            }
          );
          updatedCalls++;
        } else {
          // Create new call record
          const newCall = new Call({
            vapiId: callId,
            assistantId: callData.assistant_id || '',
            phoneNumber: callData.from || '',
            status: this.mapCallStatus(callData.status),
            createdAt: callData.created_at ? new Date(callData.created_at) : new Date(),
            startedAt: callData.started_at ? new Date(callData.started_at) : undefined,
            endedAt: callData.ended_at ? new Date(callData.ended_at) : undefined,
            durationSeconds: callData.duration_seconds || 0,
            cost: callData.cost || 0,
            transcript: callData.transcript || '',
            summary: callData.summary || '',
            isQualified: (callData.duration_seconds || 0) > 60, // Simple demo qualification
            rawData: callData
          });
          
          await newCall.save();
          newCalls++;
        }
      }
      
      this.lastSyncTime = new Date();
      
      return {
        success: true,
        message: `Successfully synced ${newCalls + updatedCalls} calls`,
        newCalls,
        updatedCalls
      };
    } catch (error) {
      console.error('Error syncing calls:', error);
      return { 
        success: false, 
        message: `Error syncing calls: ${error instanceof Error ? error.message : String(error)}` 
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync daily metrics from Vapi API to local database
   * @returns Object with sync results
   */
  async syncMetrics(): Promise<{
    success: boolean;
    message: string;
    daysProcessed?: number;
  }> {
    if (this.syncInProgress) {
      return { success: false, message: 'Sync already in progress' };
    }

    try {
      this.syncInProgress = true;
      
      // Sync today and past 7 days
      const datesToSync: string[] = [];
      
      for (let i = 0; i <= 7; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        datesToSync.push(date);
      }
      
      let daysProcessed = 0;
      
      // Process each day
      for (const date of datesToSync) {
        try {
          const dailyData = await vapiService.getDailyMetrics(date);
          
          // Calculate additional metrics from call data
          const callsForDay = await Call.find({
            createdAt: {
              $gte: new Date(`${date}T00:00:00Z`),
              $lt: new Date(`${date}T23:59:59Z`)
            }
          });
          
          const qualifiedCalls = callsForDay.filter(call => call.isQualified).length;
          const qualificationRate = callsForDay.length > 0 ? 
            (qualifiedCalls / callsForDay.length) * 100 : 0;
            
          // Calculate estimated revenue (for demo: $500 per qualified lead)
          const estimatedRevenue = qualifiedCalls * 500;
          
          // Update or create daily metrics
          await DailyMetrics.updateOne(
            { date: new Date(date) },
            {
              $set: {
                totalCalls: dailyData.total_calls,
                successfulCalls: dailyData.successful_calls,
                failedCalls: dailyData.failed_calls,
                totalDurationSeconds: dailyData.total_duration_seconds,
                averageDurationSeconds: dailyData.average_duration_seconds,
                totalCost: callsForDay.reduce((sum, call) => sum + call.cost, 0),
                successRate: dailyData.success_rate,
                qualifiedCalls,
                qualificationRate,
                estimatedRevenue,
                hourlyBreakdown: dailyData.hourly_breakdown
              }
            },
            { upsert: true }
          );
          
          daysProcessed++;
        } catch (error) {
          console.error(`Error processing metrics for ${date}:`, error);
        }
      }
      
      this.lastSyncTime = new Date();
      
      return {
        success: true,
        message: `Successfully synced metrics for ${daysProcessed} days`,
        daysProcessed
      };
    } catch (error) {
      console.error('Error syncing metrics:', error);
      return { 
        success: false, 
        message: `Error syncing metrics: ${error instanceof Error ? error.message : String(error)}` 
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get the status of the sync service
   */
  getStatus(): { 
    isSyncing: boolean; 
    lastSyncTime: Date | null;
  } {
    return {
      isSyncing: this.syncInProgress,
      lastSyncTime: this.lastSyncTime
    };
  }

  /**
   * Map Vapi call status to our internal enum
   */
  private mapCallStatus(vapiStatus: string): CallStatus {
    switch (vapiStatus.toLowerCase()) {
      case 'queued': return CallStatus.QUEUED;
      case 'ringing': return CallStatus.RINGING;
      case 'in-progress': return CallStatus.IN_PROGRESS;
      case 'forwarding': return CallStatus.FORWARDING;
      case 'completed': return CallStatus.COMPLETED;
      case 'busy': return CallStatus.BUSY;
      case 'no-answer': return CallStatus.NO_ANSWER;
      case 'failed': return CallStatus.FAILED;
      case 'canceled': return CallStatus.CANCELED;
      default: return CallStatus.FAILED;
    }
  }
}

// Create singleton instance
const syncService = new SyncService();
export default syncService;
