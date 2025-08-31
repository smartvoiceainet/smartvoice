import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { UserRole } from "@/models/User";
import mongoose from "mongoose";
import { checkVapiConfig, checkMongoDBConnection } from "@/utils/vapiConfigCheck";
import { vapiConfig } from "@/config/vapi";

/**
 * API endpoint to diagnose Vapi integration configuration
 * Only accessible to admin users
 */
export async function GET(req: NextRequest) {
  try {
    // Get user session and verify they're an admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check MongoDB connection status
    const mongoStatus = await checkMongoDBConnection();
    
    // Check Vapi configuration
    const { configStatus, issues } = checkVapiConfig();
    
    // Get runtime environment information
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      nextPublicEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      mongooseVersion: mongoose.version,
      timestamp: new Date().toISOString()
    };
    
    // Redact sensitive information before returning
    const redactedVapiConfig = {
      serverApiKeyConfigured: !!vapiConfig.serverApiKey,
      clientApiKeyConfigured: !!vapiConfig.apiKey,
      webhookSecretConfigured: !!vapiConfig.webhook.secret,
      assistantIdConfigured: !!vapiConfig.assistantId,
      baseUrlConfigured: !!vapiConfig.baseUrl
    };
    
    // Return diagnostics data
    return NextResponse.json({
      status: 'ok',
      mongodbStatus: mongoStatus,
      vapiConfig: redactedVapiConfig, // Keep for backward compatibility
      voiceConfig: redactedVapiConfig, // Add generic property
      environment,
      issues: issues.length > 0 ? issues : undefined,
      message: issues.length > 0 
        ? `Found ${issues.length} configuration issue(s) that need attention` 
        : 'All configuration checks passed'
    });
    
  } catch (error: any) {
    console.error('Error in diagnostics endpoint:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to run diagnostics',
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
