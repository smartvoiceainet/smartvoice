import React from 'react';
import dynamicImport from 'next/dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from 'next/navigation';
import { UserRole } from '@/models/User';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceAIMenu from '@/components/VoiceAI/VoiceAIMenu';

// Page config for dynamic data fetching
export const dynamic = "force-dynamic";

// Import client assistant filter
const ClientAssistantFilterProvider = dynamicImport(
  () => import('@/components/VoiceAI/ClientAssistantFilter').then(mod => mod.ClientAssistantFilterProvider),
  { ssr: false }
);

// Dynamically import client components with no SSR
const RealTimeAnalyticsDashboard = dynamicImport(
  () => import('@/components/VoiceAI/RealTimeAnalyticsDashboard'),
  { ssr: false }
);

const CustomerCallAnalytics = dynamicImport(
  () => import('@/components/VoiceAI/CustomerCallAnalytics'),
  { ssr: false }
);

const CallHistoryTable = dynamicImport(
  () => import('@/components/VoiceAI/CallHistoryTable'),
  { ssr: false }
);

const VoiceAIDashboard = dynamicImport(
  () => import('@/components/VoiceAI/VoiceAIDashboard'),
  { ssr: false }
);

const VoiceAISyncControls = dynamicImport(
  () => import('@/components/VoiceAI/VoiceAISyncControls'),
  { ssr: false }
);

// Server component for auth-protected page
export default async function Dashboard({
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
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don't have access to Voice AI features. Please contact support to upgrade your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine active tab from URL params or default to realtime
  const activeTab = searchParams.tab || 'realtime';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Voice AI Dashboard</h1>
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
              <Link href="/dashboard?tab=realtime" passHref className="min-w-[100px]">
                <TabsTrigger value="realtime" className="w-full px-2 whitespace-nowrap">Real-Time</TabsTrigger>
              </Link>
              <Link href="/dashboard?tab=calls" passHref className="min-w-[110px]">
                <TabsTrigger value="calls" className="w-full px-2 whitespace-nowrap">Call History</TabsTrigger>
              </Link>
              <Link href="/dashboard?tab=legacy" passHref className="min-w-[140px]">
                <TabsTrigger value="legacy" className="w-full px-2 whitespace-nowrap">Legacy Dashboard</TabsTrigger>
              </Link>
              {session.user.role === UserRole.ADMIN && (
                <Link href="/dashboard?tab=sync" passHref className="min-w-[100px]">
                  <TabsTrigger value="sync" className="w-full px-2 whitespace-nowrap">Data Sync</TabsTrigger>
                </Link>
              )}
            </TabsList>
            
            <ClientAssistantFilterProvider>
              <TabsContent value="realtime" className="mt-0">
                <CustomerCallAnalytics />
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
