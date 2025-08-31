'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/models/User';

interface VoiceAIAccessContextType {
  hasVoiceAiAccess: boolean;
  isLoading: boolean;
  requestStatus: 'not_requested' | 'pending' | 'approved' | 'denied';
  userRole: UserRole | null;
  requestAccess: () => Promise<void>;
  checkAccessStatus: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const VoiceAIAccessContext = createContext<VoiceAIAccessContextType | undefined>(undefined);

export const useVoiceAIAccess = () => {
  const context = useContext(VoiceAIAccessContext);
  if (context === undefined) {
    throw new Error('useVoiceAIAccess must be used within a VoiceAIAccessProvider');
  }
  return context;
};

interface VoiceAIAccessProviderProps {
  children: ReactNode;
}

export const VoiceAIAccessProvider = ({ children }: VoiceAIAccessProviderProps) => {
  const { data: session, status } = useSession();
  const [hasVoiceAiAccess, setHasVoiceAiAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requestStatus, setRequestStatus] = useState<'not_requested' | 'pending' | 'approved' | 'denied'>('not_requested');
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Permission mappings for different roles
  const rolePermissions: Record<string, string[]> = {
    [UserRole.ADMIN]: ['view_all', 'manage_users', 'manage_system', 'view_analytics', 'manage_calls'],
    [UserRole.ATTORNEY]: ['view_analytics', 'manage_calls', 'view_cases'],
    [UserRole.PARALEGAL]: ['view_analytics', 'view_calls', 'view_cases'],
    [UserRole.STAFF]: ['view_calls'],
    [UserRole.PENDING]: [],
    [UserRole.USER]: []
  };

  // Check if user has a specific permission based on their role
  const hasPermission = (permission: string): boolean => {
    if (!hasVoiceAiAccess || !userRole) return false;
    return rolePermissions[userRole]?.includes(permission) || false;
  };

  // Request Voice AI access
  const requestAccess = async () => {
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/voice-ai/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setRequestStatus('pending');
        console.log('Access request response:', data);
      } else {
        console.error('Failed to request access:', await response.json());
      }
    } catch (error) {
      console.error('Error requesting Voice AI access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check user's current Voice AI access status
  const checkAccessStatus = async () => {
    if (!session?.user) {
      setHasVoiceAiAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/voice-ai/request-access');
      
      if (response.ok) {
        const data = await response.json();
        setHasVoiceAiAccess(data.hasAccess);
        setRequestStatus(data.status);
        setUserRole(data.role);
      } else {
        console.error('Failed to check access status:', await response.json());
        setHasVoiceAiAccess(false);
      }
    } catch (error) {
      console.error('Error checking Voice AI access:', error);
      setHasVoiceAiAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check initial access status when session is loaded
  useEffect(() => {
    if (status === 'loading') return;
    
    // Check access status if user is authenticated
    if (session?.user) {
      checkAccessStatus();
    } else {
      setHasVoiceAiAccess(false);
      setIsLoading(false);
    }
  }, [session, status]);

  // Also check for hasVoiceAiAccess from session directly
  useEffect(() => {
    if (session?.user) {
      // If already set by API, don't override
      if (isLoading) {
        setHasVoiceAiAccess(!!session.user.hasVoiceAiAccess);
        setUserRole((session.user.role as UserRole) || null);
      }
    }
  }, [session, isLoading]);

  const value = {
    hasVoiceAiAccess,
    isLoading,
    requestStatus,
    userRole,
    requestAccess,
    checkAccessStatus,
    hasPermission
  };

  return (
    <VoiceAIAccessContext.Provider value={value}>
      {children}
    </VoiceAIAccessContext.Provider>
  );
};
