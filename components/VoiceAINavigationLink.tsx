"use client";

import React from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/models/User';

interface VoiceAINavigationLinkProps {
  className?: string;
}

/**
 * A navigation link component for Voice AI features
 * Only shown to users with appropriate access rights
 */
const VoiceAINavigationLink: React.FC<VoiceAINavigationLinkProps> = ({ className = '' }) => {
  const { data: session } = useSession();
  
  // Only display the link if user has Voice AI access
  if (!session?.user?.hasVoiceAiAccess && session?.user?.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <Link
      href="/dashboard/voice-ai-analytics"
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 ${className}`}
    >
      <Phone className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
      <span>Voice AI Analytics</span>
    </Link>
  );
};

export default VoiceAINavigationLink;
