'use client';

import { useState } from 'react';
import { useVoiceAIAccess } from '@/contexts/VoiceAIAccessContext';
import { UserRole } from '@/models/User';

const VoiceAIAccessRequestBanner = () => {
  const { hasVoiceAiAccess, isLoading, requestStatus, userRole, requestAccess } = useVoiceAIAccess();
  const [requesting, setRequesting] = useState(false);

  // Don't show if user already has access or component is still loading
  if (hasVoiceAiAccess || isLoading) return null;

  const handleRequestAccess = async () => {
    setRequesting(true);
    await requestAccess();
    setRequesting(false);
  };

  return (
    <div className="w-full mb-6 rounded-lg p-4 shadow-sm bg-base-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-medium text-lg">Voice AI Access</h3>
          {requestStatus === 'not_requested' && (
            <p className="text-sm">
              You need to request access to use the Voice AI features.
            </p>
          )}
          
          {requestStatus === 'pending' && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
              <p className="text-sm">
                Your access request is pending approval from an administrator.
              </p>
            </div>
          )}
          
          {requestStatus === 'denied' && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <p className="text-sm">
                Your access request was denied. Please contact an administrator.
              </p>
            </div>
          )}
        </div>
        
        <div>
          {requestStatus === 'not_requested' && (
            <button 
              className="btn btn-primary"
              onClick={handleRequestAccess}
              disabled={requesting}
            >
              {requesting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Requesting...
                </>
              ) : (
                'Request Access'
              )}
            </button>
          )}
          
          {requestStatus === 'pending' && (
            <button 
              className="btn btn-outline btn-disabled"
              disabled
            >
              Pending Approval
            </button>
          )}
          
          {requestStatus === 'denied' && (
            <button
              className="btn btn-outline btn-error"
              onClick={handleRequestAccess}
              disabled={requesting}
            >
              Request Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAIAccessRequestBanner;
