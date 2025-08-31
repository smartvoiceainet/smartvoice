'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/models/User';
import VoiceAIProtectedFeature from '@/components/VoiceAIProtectedFeature';
import { VapiAssistantManagement } from '@/components/Admin/VapiAssistantManagement';
import { VapiDiagnostics } from '@/components/Admin/VapiDiagnostics';
import Link from 'next/link';

const VapiManagementPage = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'assistants' | 'diagnostics'>('assistants');

  // Only allow admin users
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <VoiceAIProtectedFeature>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vapi Integration Management</h1>
          <Link href="/dashboard/voice-ai-admin" className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800">
            Back to Admin Dashboard
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab('assistants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assistants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assistant Management
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'diagnostics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Diagnostics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {activeTab === 'assistants' ? (
            <VapiAssistantManagement />
          ) : (
            <VapiDiagnostics />
          )}
        </div>

        {/* Documentation Card */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Documentation & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Troubleshooting Guide</h3>
              <p className="text-gray-600 mb-3">
                Having issues with Vapi integration? Check our troubleshooting guide for common solutions.
              </p>
              <Link href="/docs/vapi-troubleshooting.md" className="text-blue-600 hover:underline">
                View Troubleshooting Guide →
              </Link>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Vapi API Documentation</h3>
              <p className="text-gray-600 mb-3">
                Learn more about the Vapi API capabilities and how to configure assistants.
              </p>
              <a 
                href="https://docs.vapi.ai/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
              >
                Visit Vapi Documentation →
              </a>
            </div>
          </div>
        </div>
      </div>
    </VoiceAIProtectedFeature>
  );
};

export default VapiManagementPage;
