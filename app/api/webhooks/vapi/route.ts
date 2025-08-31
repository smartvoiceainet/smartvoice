import { NextRequest, NextResponse } from "next/server";
import vapiAssistantSyncService from "@/services/vapiAssistantSyncService";
import { headers } from "next/headers";
import crypto from "crypto";
import { vapiConfig } from "@/config/vapi";

/**
 * Webhook handler for Vapi events
 * This endpoint receives events from Vapi when assistants are created, updated, or deleted
 * It also receives call events that we can use to update metrics
 */
export async function POST(req: NextRequest) {
  try {
    // Get the Vapi webhook signature
    const signature = headers().get('vapi-signature');
    const timestamp = headers().get('vapi-timestamp');
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    // Verify signature if webhook secret is configured
    if (vapiConfig.webhook.enabled && vapiConfig.webhook.secret) {
      if (!signature || !timestamp) {
        console.warn('Missing Vapi signature or timestamp headers');
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
      }
      
      // Verify timestamp is recent (within 5 minutes)
      const timestampDate = new Date(Number(timestamp) * 1000);
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      if (timestampDate < fiveMinutesAgo) {
        console.warn('Webhook timestamp too old');
        return NextResponse.json({ error: 'Webhook timestamp expired' }, { status: 401 });
      }
      
      // Compute expected signature
      const signaturePayload = `${timestamp}.${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', vapiConfig.webhook.secret)
        .update(signaturePayload)
        .digest('hex');
      
      // Compare signatures
      if (signature !== expectedSignature) {
        console.warn('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    
    // Log the webhook for debugging (but only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Received Vapi webhook:', JSON.stringify(body));
    }
    
    // Handle different event types
    const eventType = body.event_type;
    
    if (eventType?.startsWith('assistant.')) {
      // Assistant events (created, updated, deleted)
      await vapiAssistantSyncService.handleAssistantWebhook(body);
    } else if (eventType?.startsWith('call.')) {
      // Call events - could update assistant metrics after calls
      if (eventType === 'call.completed' && body.call?.assistant_id) {
        await vapiAssistantSyncService.syncAssistantMetrics(body.call.assistant_id);
      }
    }
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Vapi webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
