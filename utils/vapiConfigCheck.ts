/**
 * Utility to check Vapi configuration
 * This can help diagnose issues with the Vapi integration
 */
import { vapiConfig } from '@/config/vapi';

export function checkVapiConfig() {
  const configStatus = {
    baseUrlConfigured: !!vapiConfig.baseUrl,
    clientApiKeyConfigured: !!vapiConfig.apiKey,
    serverApiKeyConfigured: !!vapiConfig.serverApiKey,
    serverApiKeyPresent: vapiConfig.serverApiKey ? 'Yes' : 'No',
    serverApiKeyLength: vapiConfig.serverApiKey ? vapiConfig.serverApiKey.length : 0,
    webhookEnabled: vapiConfig.webhook.enabled,
    webhookSecretConfigured: !!vapiConfig.webhook.secret,
    cronSecretConfigured: !!vapiConfig.cron.secret,
  };
  
  // Log configuration status
  console.log('=== VAPI CONFIGURATION STATUS ===');
  Object.entries(configStatus).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('===============================');
  
  // Return configuration issues that need attention
  const issues = [];
  
  if (!vapiConfig.serverApiKey) {
    issues.push({
      severity: 'critical',
      message: 'Missing server API key (VAPI_API_KEY) - Required for sync and webhook functions',
      fix: 'Add VAPI_API_KEY=your_api_key to your .env.local file'
    });
  }
  
  if (!vapiConfig.apiKey) {
    issues.push({
      severity: 'warning',
      message: 'Missing client API key (NEXT_PUBLIC_VAPI_API_KEY) - Required for client-side features',
      fix: 'Add NEXT_PUBLIC_VAPI_API_KEY=your_client_api_key to your .env.local file'
    });
  }
  
  if (!vapiConfig.webhook.secret && vapiConfig.webhook.enabled) {
    issues.push({
      severity: 'warning',
      message: 'Webhook is enabled but no webhook secret is configured',
      fix: 'Add VAPI_WEBHOOK_SECRET=your_webhook_secret to your .env.local file'
    });
  }
  
  return { configStatus, issues };
}

/**
 * Check if MongoDB is connected
 */
export async function checkMongoDBConnection() {
  try {
    const mongoose = await import('mongoose');
    
    const status = {
      readyState: mongoose.connection.readyState,
      connected: mongoose.connection.readyState === 1,
      statusText: getMongoReadyStateText(mongoose.connection.readyState)
    };
    
    console.log('=== MONGODB CONNECTION STATUS ===');
    Object.entries(status).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.log('================================');
    
    return status;
  } catch (error) {
    console.error('Error checking MongoDB connection:', error);
    return {
      readyState: -1,
      connected: false,
      statusText: 'Error checking connection',
      error
    };
  }
}

/**
 * Get readable text for MongoDB connection state
 */
function getMongoReadyStateText(state: number): string {
  switch (state) {
    case 0:
      return 'Disconnected';
    case 1:
      return 'Connected';
    case 2:
      return 'Connecting';
    case 3:
      return 'Disconnecting';
    default:
      return 'Unknown';
  }
}
