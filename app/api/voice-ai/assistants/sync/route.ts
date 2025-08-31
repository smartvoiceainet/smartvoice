import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { UserRole } from "@/models/User";
import mongoose from "mongoose";
import vapiAssistantSyncService from "@/services/vapiAssistantSyncService";
import { checkVapiConfig, checkMongoDBConnection } from "@/utils/vapiConfigCheck";
import { vapiConfig } from "@/config/vapi";

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in assistants sync API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

/**
 * API endpoint to manually trigger a sync of Vapi assistants
 * Only accessible to admin users
 */
export async function POST(req: NextRequest) {
  try {
    // Get user session and verify they're an admin
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Ensure database connection
    await connectToDatabase();
    
    // Check database connection
    const dbStatus = await checkMongoDBConnection();
    if (!dbStatus.connected) {
      console.error('MongoDB is not connected:', dbStatus.statusText);
      return NextResponse.json({ 
        error: `Database connection error: ${dbStatus.statusText}. Please check your MongoDB configuration.`
      }, { status: 500 });
    }
    
    // Check Vapi configuration
    const { configStatus, issues } = checkVapiConfig();
    
    // If there are any critical issues, return an error
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.error('Critical Vapi configuration issues found:', criticalIssues);
      return NextResponse.json({ 
        error: criticalIssues[0].message,
        issues: criticalIssues,
        configStatus
      }, { status: 500 });
    }
    
    console.log('Starting Vapi assistant sync process...');
    
    try {
      // Log API key information for debugging (redacted for security)
      const apiKey = vapiConfig.serverApiKey || '';
      console.log(`Using Vapi API key: ${apiKey.substring(0, 4)}...${apiKey.length > 4 ? apiKey.substring(apiKey.length - 4) : ''}`);
      console.log(`API key length: ${apiKey.length} characters`);
      
      // Trigger the sync process
      const syncedAssistants = await vapiAssistantSyncService.syncAllAssistants();
      
      console.log(`Successfully synced ${syncedAssistants.length} Vapi assistants`);
      
      // Check for warnings to include in response
      const warnings = issues.filter(issue => issue.severity === 'warning');
      
      // Return the synced assistants
      return NextResponse.json({ 
        success: true, 
        message: `Successfully synced ${syncedAssistants.length} assistants`,
        count: syncedAssistants.length,
        warnings: warnings.length > 0 ? warnings : undefined
      });
    } catch (syncError: any) {
      console.error('Error during sync process:', syncError);
      
      // Enhanced error logging
      if (syncError.response) {
        console.error('API Response Error:', {
          status: syncError.response.status,
          statusText: syncError.response.statusText,
          data: syncError.response.data,
          headers: syncError.response.headers
        });
      }
      
      return NextResponse.json({ 
        error: 'Failed to sync assistants',
        message: syncError.message || 'An error occurred during the sync process',
        details: syncError.response ? {
          status: syncError.response.status,
          statusText: syncError.response.statusText,
          data: syncError.response.data
        } : undefined,
        configStatus
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error syncing Vapi assistants:', error);
    
    // Provide detailed error for development environment
    const errorDetails = process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      name: error.name,
      code: error.code
    } : {};
    
    return NextResponse.json({ 
      error: 'Failed to sync assistants',
      message: error instanceof Error ? error.message : 'Unknown error',
      ...errorDetails
    }, { status: 500 });
  }
}
