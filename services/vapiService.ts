import axios from 'axios';

/**
 * Service to interact with the Vapi API
 * Handles authentication and provides methods to fetch call data and metrics
 */
class VapiService {
  private apiKey: string;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || '';
    this.baseUrl = 'https://api.vapi.ai';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Get recent calls from Vapi API
   * @param limit Maximum number of calls to retrieve
   */
  async getRecentCalls(limit: number = 100): Promise<any[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Vapi API key is not configured');
      }
      
      const response = await axios.get(`${this.baseUrl}/v1/calls`, {
        headers: this.headers,
        params: {
          limit,
          sort: 'desc'
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching recent calls from Vapi:', error);
      throw error;
    }
  }

  /**
   * Get details for a specific call
   * @param callId The ID of the call to retrieve
   */
  async getCallDetails(callId: string): Promise<any> {
    try {
      if (!this.apiKey) {
        throw new Error('Vapi API key is not configured');
      }
      
      const response = await axios.get(`${this.baseUrl}/v1/calls/${callId}`, {
        headers: this.headers
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching call details for ${callId}:`, error);
      throw error;
    }
  }

  /**
   * Get call statistics for a specific date range
   * @param startDate Start date in YYYY-MM-DD format
   * @param endDate End date in YYYY-MM-DD format
   */
  async getCallStatistics(startDate?: string, endDate?: string): Promise<any> {
    try {
      if (!this.apiKey) {
        throw new Error('Vapi API key is not configured');
      }
      
      const params: Record<string, string> = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await axios.get(`${this.baseUrl}/v1/statistics/calls`, {
        headers: this.headers,
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching call statistics from Vapi:', error);
      throw error;
    }
  }

  /**
   * Get daily metrics for a specific date
   * @param date Date in YYYY-MM-DD format
   */
  async getDailyMetrics(date?: string): Promise<any> {
    try {
      // If no date is provided, use today
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const stats = await this.getCallStatistics(targetDate, targetDate);
      
      // Calculate metrics
      const totalCalls = stats.total_calls || 0;
      const successfulCalls = stats.completed_calls || 0;
      const failedCalls = totalCalls - successfulCalls;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
      
      // Process hourly breakdown
      const hourlyBreakdown: Record<number, number> = {};
      if (stats.hourly_data) {
        for (const hour of stats.hourly_data) {
          hourlyBreakdown[hour.hour] = hour.count;
        }
      }
      
      return {
        date: targetDate,
        total_calls: totalCalls,
        successful_calls: successfulCalls,
        failed_calls: failedCalls,
        total_duration_seconds: stats.total_duration_seconds || 0,
        average_duration_seconds: stats.average_duration_seconds || 0,
        success_rate: successRate,
        hourly_breakdown: hourlyBreakdown
      };
    } catch (error) {
      console.error(`Error fetching daily metrics for ${date}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
const vapiService = new VapiService();
export default vapiService;
