import { NextRequest, NextResponse } from "next/server";
import vapiAssistantSyncService from "@/services/vapiAssistantSyncService";

/**
 * API endpoint for scheduled sync of Vapi assistants
 * This endpoint can be called by a cron job service like Vercel Cron
 * It's protected by a secret key to prevent unauthorized access
 */
export async function GET(req: NextRequest) {
  try {
    // Verify the request is authorized with a secret key
    const authHeader = req.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET_TOKEN}`;
    
    if (authHeader !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Perform the sync
    const syncedAssistants = await vapiAssistantSyncService.syncAllAssistants();
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${syncedAssistants.length} assistants`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in scheduled Vapi assistant sync:", error);
    return NextResponse.json({ 
      error: "Sync failed",
      message: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
