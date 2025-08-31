'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useVoiceAIAccess } from '@/contexts/VoiceAIAccessContext';
import { UserRole } from '@/models/User';

const VoiceAIAccessStatus = () => {
  const { data: session } = useSession();
  const { 
    hasVoiceAiAccess, 
    isLoading, 
    requestStatus, 
    userRole, 
    requestAccess 
  } = useVoiceAIAccess();
  const [requesting, setRequesting] = useState(false);

  // Handle access request
  const handleRequestAccess = async () => {
    setRequesting(true);
    await requestAccess();
    setRequesting(false);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title flex items-center">
            <div className="loading loading-spinner loading-sm mr-2"></div>
            Loading Voice AI Status...
          </h2>
        </div>
      </div>
    );
  }

  // If the user is not logged in with Google
  if (!session) {
    return (
      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Voice AI Access</h2>
          <p>Sign in with Google to use Voice AI features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <h2 className="card-title">Voice AI Access</h2>
        
        {/* Status indicator */}
        <div className="flex items-center mb-4">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${
              hasVoiceAiAccess 
                ? 'bg-success' 
                : requestStatus === 'pending' 
                  ? 'bg-warning' 
                  : 'bg-error'
            }`}
          ></div>
          <span>
            {hasVoiceAiAccess 
              ? 'Active' 
              : requestStatus === 'pending' 
                ? 'Pending Approval' 
                : requestStatus === 'denied'
                  ? 'Access Denied'
                  : 'Not Active'}
          </span>
        </div>
        
        {/* User details */}
        <div className="text-sm">
          <p><span className="font-medium">Email:</span> {session.user?.email}</p>
          <p><span className="font-medium">Role:</span> {userRole || 'Not assigned'}</p>
        </div>

        {/* Access explanation */}
        {hasVoiceAiAccess ? (
          <div className="mt-4 p-3 bg-base-100 rounded-md text-sm">
            <p className="font-medium">Your Voice AI permissions:</p>
            <ul className="list-disc list-inside mt-1">
              {userRole === UserRole.ADMIN && (
                <>
                  <li>Manage Voice AI users and permissions</li>
                  <li>Access all Voice AI features</li>
                  <li>View analytics and system settings</li>
                </>
              )}
              {userRole === UserRole.ATTORNEY && (
                <>
                  <li>Full access to Voice AI legal assistant</li>
                  <li>Document analysis and generation</li>
                  <li>Case research and preparation</li>
                </>
              )}
              {userRole === UserRole.PARALEGAL && (
                <>
                  <li>Access to Voice AI legal research</li>
                  <li>Document preparation assistance</li>
                  <li>Case information retrieval</li>
                </>
              )}
              {userRole === UserRole.STAFF && (
                <>
                  <li>Basic Voice AI assistant features</li>
                  <li>Administrative task automation</li>
                </>
              )}
              {userRole === UserRole.USER && (
                <li>Basic Voice AI features</li>
              )}
            </ul>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-base-100 rounded-md text-sm">
            <p>
              {requestStatus === 'pending' 
                ? 'Your access request is being reviewed by an administrator. You will be notified when a decision is made.'
                : requestStatus === 'denied'
                  ? 'Your access request was denied. You can request access again or contact an administrator for assistance.'
                  : 'Voice AI features provide AI-powered voice assistance for legal workflows. Request access to use these features.'}
            </p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="card-actions justify-end mt-4">
          {!hasVoiceAiAccess && requestStatus !== 'pending' && (
            <button 
              className="btn btn-primary"
              onClick={handleRequestAccess}
              disabled={requesting}
            >
              {requesting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Requesting...
                </>
              ) : (
                'Request Access'
              )}
            </button>
          )}
          
          {requestStatus === 'pending' && (
            <button className="btn btn-outline btn-disabled">Pending Approval</button>
          )}
          
          {hasVoiceAiAccess && (
            <button 
              className="btn btn-outline btn-success"
              onClick={() => window.location.href = '/dashboard/voice-ai'}
            >
              Go to Voice AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAIAccessStatus;
