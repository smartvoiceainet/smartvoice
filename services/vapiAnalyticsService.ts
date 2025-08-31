/**
 * Vapi Analytics Service - Provides methods for fetching analytics data from Vapi API
 */
import axios from 'axios';

// Types for analytics data
export interface CallData {
  id: string;
  assistantId?: string;
  phoneNumber?: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'completed' | 'busy' | 'no-answer' | 'failed' | 'canceled';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds: number;
  cost?: number;
  transcript?: string;
  summary?: string;
  isQualified: boolean;
  caseType?: string;
  estimatedValue?: number;
}

export interface DailyMetrics {
  date: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  qualifiedCalls: number;
  totalDurationSeconds: number;
  averageDurationSeconds: number;
  totalCost: number;
  estimatedRevenue: number;
  successRate: number;
  qualificationRate: number;
  hourlyBreakdown: Record<number, number>;
}

export interface DashboardData {
  todayMetrics: DailyMetrics;
  recentCalls: CallData[];
  hourlyData: {hour: number, calls: number}[];
  weekMetrics: DailyMetrics[];
  lastUpdated: string;
}

export interface RealTimeData {
  currentMetrics: DailyMetrics;
  recentCalls: CallData[];
  syncInfo: {
    syncedCount: number;
    updatedCount: number;
    totalProcessed: number;
  };
  timestamp: string;
}

class VapiAnalyticsService {
  private baseURL: string;
  private refreshInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(data: RealTimeData) => void> = new Set();

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_VOICE_AI_API_URL || 'http://localhost:3000/api/voice-ai';
  }

  /**
   * Get dashboard data including today's metrics, recent calls, and trends
   * @param clientId Optional client ID to filter data
   * @param assistantId Optional assistant ID to filter data
   */
  async getDashboardData(clientId?: string | null, assistantId?: string | null): Promise<DashboardData> {
    try {
      const params: Record<string, string> = {};
      
      if (clientId) {
        params.clientId = clientId;
      }
      
      if (assistantId) {
        params.assistantId = assistantId;
      }
      
      const response = await axios.get(`${this.baseURL}/analytics/dashboard`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get real-time data for live updates
   * @param clientId Optional client ID to filter data
   * @param assistantId Optional assistant ID to filter data
   */
  async getRealTimeData(clientId?: string | null, assistantId?: string | null): Promise<RealTimeData> {
    try {
      const params: Record<string, string> = {};
      
      if (clientId) {
        params.clientId = clientId;
      }
      
      if (assistantId) {
        params.assistantId = assistantId;
      }
      
      const response = await axios.get(`${this.baseURL}/analytics/real-time`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      throw error;
    }
  }

  /**
   * Get recent calls with optional filtering
   */
  async getRecentCalls(filters: Record<string, any> = {}): Promise<{
    calls: CallData[],
    pagination: {
      page: number;
      perPage: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    }
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/analytics/calls/recent`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent calls:', error);
      throw error;
    }
  }

  /**
   * Start real-time updates with a callback
   * @param callback Function to call with updated data
   * @param interval Interval in milliseconds between updates
   * @param clientId Optional client ID to filter data
   * @param assistantId Optional assistant ID to filter data
   */
  startRealTimeUpdates(
    callback: (data: RealTimeData) => void, 
    interval: number = 30000,
    clientId?: string | null,
    assistantId?: string | null
  ): void {
    // Create a wrapped callback that includes the filters
    const wrappedCallback = async () => {
      try {
        const data = await this.getRealTimeData(clientId, assistantId);
        callback(data);
      } catch (error) {
        console.error('Error in real-time update:', error);
      }
    };
    
    // Store both the original callback and the wrapped version
    const listenerInfo = { 
      original: callback, 
      wrapped: wrappedCallback,
      clientId,
      assistantId
    };
    
    // Add to our internal tracking
    this.listeners.add(callback);
    
    // If no interval is already running, start one
    if (!this.refreshInterval) {
      this.refreshInterval = setInterval(async () => {
        // For each listener, fetch data with their specific filters
        for (const listener of this.listeners) {
          const info = Array.from(this.listeners).find(l => l === listener) as any;
          if (info && info.wrapped) {
            info.wrapped();
          }
        }
      }, interval);
    }
    
    // Immediately fetch data for this listener
    wrappedCallback().catch(error => {
      console.error('Error fetching initial real-time data:', error);
    });
  }

  /**
   * Stop real-time updates for a specific callback
   */
  stopRealTimeUpdates(callback: (data: RealTimeData) => void): void {
    this.listeners.delete(callback);
    
    if (this.listeners.size === 0 && this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Manually trigger a data sync
   */
  async triggerSync(type: 'calls' | 'metrics' | 'all' = 'calls'): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}/analytics/sync`, { type });
      return response.data;
    } catch (error) {
      console.error('Error triggering sync:', error);
      throw error;
    }
  }
}

// Export singleton instance
const vapiAnalyticsService = new VapiAnalyticsService();
export default vapiAnalyticsService;
