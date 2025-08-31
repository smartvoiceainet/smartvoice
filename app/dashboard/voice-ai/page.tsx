'use client';

import { useSession } from 'next-auth/react';
import { useVoiceAIAccess } from '@/contexts/VoiceAIAccessContext';
import VoiceAIAccessStatus from '@/components/VoiceAIAccessStatus';
import VoiceAIProtectedFeature from '@/components/VoiceAIProtectedFeature';
import Link from 'next/link';

export default function VoiceAIDashboardPage() {
  const { data: session } = useSession();
  const { hasVoiceAiAccess, hasPermission, userRole } = useVoiceAIAccess();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Voice AI Dashboard</h1>
          <p className="text-gray-500">
            Manage your Voice AI settings and access
          </p>
        </div>
        
        {/* Admin link, only shown to users with manage_users permission */}
        {hasPermission('manage_users') && (
          <Link 
            href="/dashboard/voice-ai-admin" 
            className="btn btn-outline btn-primary"
          >
            Manage Voice AI Users
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          {/* Show access status card */}
          <VoiceAIAccessStatus />
          
          {/* Admin quick stats */}
          {hasPermission('manage_users') && (
            <div className="card bg-base-200 shadow-md mt-6">
              <div className="card-body">
                <h2 className="card-title">Admin Quick Access</h2>
                <div className="flex flex-col gap-3 mt-2">
                  <Link 
                    href="/dashboard/voice-ai-admin"
                    className="btn btn-sm btn-outline w-full justify-between"
                  >
                    User Management
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  <Link 
                    href="#" /* Link to future analytics page */
                    className="btn btn-sm btn-outline w-full justify-between"
                  >
                    Analytics
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="md:col-span-8">
          {/* Protected Voice AI Features */}
          <VoiceAIProtectedFeature>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Voice AI Features</h2>
                <p>Welcome to the Voice AI Dashboard. Your access is active, and you can use the following features:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Voice Assistant Feature Card */}
                  <div className="card bg-base-200 shadow-sm">
                    <div className="card-body">
                      <h3 className="card-title text-lg">Voice Assistant</h3>
                      <p className="text-sm">Interact with your AI assistant using voice commands and receive voice responses.</p>
                      <div className="card-actions justify-end mt-4">
                        <Link href="/voice-chat" className="btn btn-primary btn-sm">
                          Open Voice Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Analysis Feature Card */}
                  <div className="card bg-base-200 shadow-sm">
                    <div className="card-body">
                      <h3 className="card-title text-lg">Document Analysis</h3>
                      <p className="text-sm">Upload legal documents for AI analysis, summarization, and key point extraction.</p>
                      <div className="card-actions justify-end mt-4">
                        <Link href="#" className="btn btn-primary btn-sm">
                          Upload Documents
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legal Research Feature Card - Only for attorney and paralegal roles */}
                  {(userRole === 'attorney' || userRole === 'paralegal') && (
                    <div className="card bg-base-200 shadow-sm">
                      <div className="card-body">
                        <h3 className="card-title text-lg">Legal Research</h3>
                        <p className="text-sm">AI-powered legal research assistant with case law and precedent analysis.</p>
                        <div className="card-actions justify-end mt-4">
                          <Link href="#" className="btn btn-primary btn-sm">
                            Start Research
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Settings Feature Card */}
                  <div className="card bg-base-200 shadow-sm">
                    <div className="card-body">
                      <h3 className="card-title text-lg">Voice AI Settings</h3>
                      <p className="text-sm">Customize your Voice AI experience with personal preferences.</p>
                      <div className="card-actions justify-end mt-4">
                        <Link href="#" className="btn btn-primary btn-sm">
                          Settings
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </VoiceAIProtectedFeature>
        </div>
      </div>
    </div>
  );
}
