'use client';

import { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { vapiConfig } from '@/config/vapi';

interface VapiVoiceChatProps {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onTranscript?: (role: string, transcript: string) => void;
}

const VapiVoiceChat = ({
  onCallStart,
  onCallEnd,
  onTranscript
}: VapiVoiceChatProps) => {
  const [vapi, setVapi] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [transcripts, setTranscripts] = useState<{role: string, text: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Use the config values instead of accessing env vars directly
      const { apiKey, assistantId } = vapiConfig;
      
      if (!apiKey) {
        setError('Vapi API key not found in configuration');
        console.error('Vapi API key not found in configuration');
        return;
      }

      console.log('Initializing Vapi with API key:', apiKey);
      // Initialize with proper configuration
      const vapiInstance = new Vapi(apiKey.trim());
      setVapi(vapiInstance);

      // Set up event listeners
      vapiInstance.on('call-start', () => {
        setIsActive(true);
        onCallStart && onCallStart();
        console.log('Call started');
      });

      vapiInstance.on('call-end', () => {
        setIsActive(false);
        onCallEnd && onCallEnd();
        console.log('Call ended');
      });

      vapiInstance.on('error', (err: any) => {
        console.error('Vapi error:', err);
        setError(`Error: ${err?.message || 'Unknown error occurred'}`);
      });

      vapiInstance.on('message', (message: any) => {
        if (message.type === 'transcript') {
          onTranscript && onTranscript(message.role, message.transcript);
          console.log(`${message.role}: ${message.transcript}`);
          
          setTranscripts(prev => [
            ...prev, 
            { role: message.role, text: message.transcript }
          ]);
        }
      });

      // Cleanup on component unmount
      return () => {
        if (vapiInstance) {
          try {
            if (isActive) {
              vapiInstance.stop();
            }
            // Only call destroy if it exists
            // Using type assertion to handle potential API changes
            const vapiAny = vapiInstance as any;
            if (typeof vapiAny.destroy === 'function') {
              vapiAny.destroy();
            }
          } catch (err) {
            console.error('Error during cleanup:', err);
          }
        }
      };
    } catch (err) {
      console.error('Error setting up Vapi:', err);
      setError(`Failed to initialize voice assistant: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [onCallStart, onCallEnd, onTranscript, isActive]);

  const startCall = () => {
    try {
      if (!vapi) {
        setError('Voice assistant not initialized yet');
        return;
      }
      
      const { assistantId } = vapiConfig;
      if (!assistantId) {
        setError('Assistant ID not found in configuration');
        return;
      }

      console.log('Starting call with assistant ID:', assistantId);
      
      // Configure options based on Vapi requirements
      const options = {
        // Add any additional options from Vapi docs if needed
        // For example, recording settings or specific parameters
      };
      
      // Start the call with the assistant ID and options
      vapi.start(assistantId.trim(), options);
    } catch (err) {
      console.error('Error starting call:', err);
      setError(`Failed to start call: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const endCall = () => {
    try {
      if (vapi) {
        vapi.stop();
      }
    } catch (err) {
      console.error('Error ending call:', err);
    }
  };

  return (
    <div className="vapi-voice-chat">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <button 
        onClick={isActive ? endCall : startCall}
        className={`btn ${isActive ? 'btn-error' : 'btn-primary'} mb-4`}
        disabled={!vapi}
      >
        {isActive ? 'End Voice Chat' : 'Start Voice Chat with Madison'}
      </button>
      
      {isActive && (
        <div className="mt-4 p-3 bg-base-200 rounded-box mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <p>Voice chat is active - speak to interact with Madison</p>
          </div>
        </div>
      )}

      {transcripts.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Conversation</h3>
          <div className="bg-base-100 p-4 rounded-box max-h-80 overflow-y-auto">
            {transcripts.map((item, index) => (
              <div key={index} className={`mb-2 ${item.role === 'assistant' ? 'text-primary' : ''}`}>
                <strong>{item.role === 'assistant' ? 'Madison' : 'You'}:</strong> {item.text}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isActive && (<small className="mt-3 block text-sm text-gray-500">Click the button above to start a voice conversation with our AI assistant.</small>)}
    </div>
  );
};

export default VapiVoiceChat;
