'use client';

import { ReactNode } from 'react';
import { useVoiceAIAccess } from '@/contexts/VoiceAIAccessContext';
import VoiceAIAccessRequestBanner from './VoiceAIAccessRequestBanner';

interface VoiceAIProtectedFeatureProps {
  children: ReactNode;
  requiredPermission?: string;
  fallback?: ReactNode;
}

/**
 * Wrapper component that only renders its children if the user has Voice AI access
 * and the required permission (if specified).
 * 
 * @param children - The protected content to render if the user has access
 * @param requiredPermission - Optional specific permission required to access the feature
 * @param fallback - Optional fallback UI to display if the user doesn't have access
 */
const VoiceAIProtectedFeature = ({ 
  children, 
  requiredPermission,
  fallback
}: VoiceAIProtectedFeatureProps) => {
  const { hasVoiceAiAccess, isLoading, hasPermission } = useVoiceAIAccess();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  
  // Check if user has Voice AI access
  if (!hasVoiceAiAccess) {
    return fallback || <VoiceAIAccessRequestBanner />;
  }
  
  // Check for specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 className="font-bold">Permission Required</h3>
          <p className="text-sm">You don't have the required permission to access this feature.</p>
        </div>
      </div>
    );
  }
  
  // User has access, render the children
  return <>{children}</>;
};

export default VoiceAIProtectedFeature;
