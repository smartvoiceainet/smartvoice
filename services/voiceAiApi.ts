import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_VOICE_AI_API_URL || 'http://localhost:8000';

class VoiceAiApiService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests from NextAuth session
    this.api.interceptors.request.use((config) => {
      // For NextAuth - token is handled by the session
      return config;
    });
  }

  // Call management
  async getCalls(filters = {}) {
    const response = await this.api.get('/api/calls', { params: filters });
    return response.data;
  }

  async getCall(callId: string) {
    const response = await this.api.get(`/api/calls/${callId}`);
    return response.data;
  }

  async getCallTranscript(callId: string) {
    const response = await this.api.get(`/api/calls/${callId}/transcript`);
    return response.data;
  }

  // Analytics
  async getAnalytics(options: { dateRange?: string, clientId?: string, assistantId?: string } = {}) {
    const { dateRange = '30d', clientId, assistantId } = options;
    
    const params: Record<string, string> = { range: dateRange };
    
    if (clientId) {
      params.clientId = clientId;
    }
    
    if (assistantId) {
      params.assistantId = assistantId;
    }
    
    const response = await this.api.get('/api/analytics', { params });
    return response.data;
  }

  async getQualificationMetrics() {
    const response = await this.api.get('/api/analytics/qualification');
    return response.data;
  }

  // Engagement letters
  async getEngagementLetters(filters = {}) {
    const response = await this.api.get('/api/engagement-letters', { 
      params: filters 
    });
    return response.data;
  }

  async resendEngagementLetter(letterId: string) {
    const response = await this.api.post(`/api/engagement-letters/${letterId}/resend`);
    return response.data;
  }
}

export default new VoiceAiApiService();
