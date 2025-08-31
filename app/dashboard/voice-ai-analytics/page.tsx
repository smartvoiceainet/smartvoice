import React from 'react';
import dynamic from 'next/dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from 'next/navigation';
import { UserRole } from '@/models/User';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceAIMenu from '@/components/VoiceAI/VoiceAIMenu';

// Import client assistant filter
const ClientAssistantFilterProvider = dynamic(
  () => import('@/components/VoiceAI/ClientAssistantFilter').then(mod => mod.ClientAssistantFilterProvider),
  { ssr: false }
);

// Dynamically import client components with no SSR
const RealTimeAnalyticsDashboard = dynamic(
  () => import('@/components/VoiceAI/RealTimeAnalyticsDashboard'),
  { ssr: false }
);

const CallHistoryTable = dynamic(
  () => import('@/components/VoiceAI/CallHistoryTable'),
  { ssr: false }
);

const VoiceAIDashboard = dynamic(
  () => import('@/components/VoiceAI/VoiceAIDashboard'),
  { ssr: false }
);

const VoiceAISyncControls = dynamic(
  () => import('@/components/VoiceAI/VoiceAISyncControls'),
  { ssr: false }
);

// Server component for auth-protected page
export default async function VoiceAIAnalyticsPage({
  searchParams
}: {
  searchParams: { tab?: string }
}) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Check if user has Voice AI access
  const hasAccess = session.user.hasVoiceAiAccess || 
                    session.user.role === UserRole.ADMIN;

  // Redirect if no access
  if (!hasAccess) {
    redirect('/dashboard');
  }

  // Determine active tab from URL params or default to realtime
  const activeTab = searchParams.tab || 'realtime';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Link 
            href="/dashboard"
            className="btn btn-outline btn-sm mr-4 flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path 
                fillRule="evenodd" 
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Voice AI Analytics</h1>
        </div>
        <div className="md:hidden">
          <VoiceAIMenu session={session} />
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar - only on medium screens and up */}
        <div className="hidden md:block col-span-3 lg:col-span-2">
          <VoiceAIMenu session={session} />
        </div>
        
        {/* Main content */}
        <div className="col-span-12 md:col-span-9 lg:col-span-10">
          <Tabs defaultValue={activeTab} className="space-y-6">
            <TabsList className="bg-white border rounded-lg shadow-sm p-1 mb-4 flex flex-wrap gap-1">
              <Link href="/dashboard/voice-ai-analytics?tab=realtime" passHref className="min-w-[100px]">
                <TabsTrigger value="realtime" className="w-full px-2 whitespace-nowrap">Real-Time</TabsTrigger>
              </Link>
              <Link href="/dashboard/voice-ai-analytics?tab=calls" passHref className="min-w-[110px]">
                <TabsTrigger value="calls" className="w-full px-2 whitespace-nowrap">Call History</TabsTrigger>
              </Link>
              <Link href="/dashboard/voice-ai-analytics?tab=legacy" passHref className="min-w-[140px]">
                <TabsTrigger value="legacy" className="w-full px-2 whitespace-nowrap">Legacy Dashboard</TabsTrigger>
              </Link>
              {session.user.role === UserRole.ADMIN && (
                <Link href="/dashboard/voice-ai-analytics?tab=sync" passHref className="min-w-[100px]">
                  <TabsTrigger value="sync" className="w-full px-2 whitespace-nowrap">Data Sync</TabsTrigger>
                </Link>
              )}
            </TabsList>
            
            <ClientAssistantFilterProvider>
              <TabsContent value="realtime" className="mt-0">
                <RealTimeAnalyticsDashboard />
              </TabsContent>
              
              <TabsContent value="calls" className="mt-0">
                <CallHistoryTable />
              </TabsContent>
              
              <TabsContent value="legacy" className="mt-0">
                <VoiceAIDashboard />
              </TabsContent>
              
              <TabsContent value="sync" className="mt-0">
                {session.user.role === UserRole.ADMIN ? (
                  <VoiceAISyncControls />
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          You don't have permission to access this section.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </ClientAssistantFilterProvider>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
