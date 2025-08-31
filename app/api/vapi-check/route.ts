import { NextResponse } from 'next/server';
import { vapiConfig } from '@/config/vapi';

export async function GET() {
  try {
    // Check that we have required values
    const { apiKey, assistantId } = vapiConfig;
    
    if (!apiKey || !assistantId) {
      return NextResponse.json({
        success: false,
        error: 'Missing API key or Assistant ID',
        config: { 
          apiKeyProvided: !!apiKey,
          assistantIdProvided: !!assistantId,
          assistantIdValue: assistantId 
        }
      }, { status: 400 });
    }

    // Validate format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isAssistantIdUuid = uuidRegex.test(assistantId);
    
    return NextResponse.json({
      success: true,
      config: {
        apiKeyProvided: true,
        assistantIdProvided: true,
        assistantIdValue: assistantId,
        isAssistantIdUuid,
        formatWarning: !isAssistantIdUuid ? 
          "Assistant ID doesn't appear to be in UUID format. Vapi typically requires UUID format." : 
          undefined
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
