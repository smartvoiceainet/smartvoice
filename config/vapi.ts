/**
 * Vapi configuration
 * 
 * This file exposes environment variables safely for client-side components
 */

// Log configuration during development
if (process.env.NODE_ENV === 'development') {
  console.log('Vapi configuration loaded with:', { 
    apiKeyProvided: !!process.env.NEXT_PUBLIC_VAPI_API_KEY,
    assistantIdProvided: !!process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
    assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
  });
}

export const vapiConfig = {
  apiKey: process.env.NEXT_PUBLIC_VAPI_API_KEY?.trim() || '',
  assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID?.trim() || '',
  
  // Webhook configuration
  webhook: {
    secret: process.env.VAPI_WEBHOOK_SECRET || '',
    enabled: !!process.env.VAPI_WEBHOOK_SECRET,
  },
  
  // Cron job configuration
  cron: {
    secret: process.env.CRON_SECRET_TOKEN || '',
    syncInterval: process.env.VAPI_SYNC_INTERVAL || '6h',
  },
  
  // Server-only API key (not exposed to client)
  serverApiKey: process.env.VAPI_API_KEY || '',
  
  // Base URL for Vapi API
  baseUrl: 'https://api.vapi.ai',
  
  // Additional configuration options
  options: {
    maxRetries: 3,
    timeout: 30000, // 30 seconds
  }
};
