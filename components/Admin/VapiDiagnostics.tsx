"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

type DiagnosticStatus = {
  status: 'ok' | 'error';
  mongodbStatus: {
    readyState: number;
    connected: boolean;
    statusText: string;
  };
  vapiConfig: {
    serverApiKeyConfigured: boolean;
    clientApiKeyConfigured: boolean;
    webhookSecretConfigured: boolean;
    assistantIdConfigured: boolean;
    baseUrlConfigured: boolean;
  };
  environment: {
    nodeEnv: string;
    nextPublicEnv: string;
    mongooseVersion: string;
    timestamp: string;
  };
  issues?: Array<{
    severity: 'critical' | 'warning';
    message: string;
    fix: string;
  }>;
  message: string;
};

export const VapiDiagnostics: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/voice-ai/admin/diagnostics');
      setDiagnostics(response.data);
    } catch (err: any) {
      console.error('Error running diagnostics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  // Determine MongoDB connection status indicator color
  const getMongoStatusColor = (connected: boolean) => {
    return connected ? 'bg-green-500' : 'bg-red-500';
  };

  // Get status indicator for config items
  const getConfigStatusIndicator = (configured: boolean) => {
    return configured ? 
      <span className="flex items-center">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>
        Configured
      </span> : 
      <span className="flex items-center">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>
        Missing
      </span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vapi Integration Diagnostics</h2>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className={`px-4 py-2 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
        >
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {diagnostics && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Status Overview */}
          <div className={`p-4 ${diagnostics.issues?.length ? 'bg-yellow-50' : 'bg-green-50'} border-b`}>
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${diagnostics.issues?.length ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'} mr-3`}>
                {diagnostics.issues?.length ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  :
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                }
              </div>
              <div>
                <h3 className="font-medium">{diagnostics.message}</h3>
                <p className="text-sm text-gray-600">Last checked: {new Date(diagnostics.environment.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* MongoDB Status */}
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">MongoDB Connection</h3>
              <div className="flex items-center">
                <span className={`inline-block h-3 w-3 rounded-full ${getMongoStatusColor(diagnostics.mongodbStatus.connected)} mr-2`}></span>
                <span className="font-medium">{diagnostics.mongodbStatus.statusText}</span>
                <span className="text-sm text-gray-600 ml-2">(State: {diagnostics.mongodbStatus.readyState})</span>
              </div>
            </div>

            {/* Vapi Config Status */}
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Vapi Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Server API Key:</span>
                    {getConfigStatusIndicator(diagnostics.vapiConfig.serverApiKeyConfigured)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Client API Key:</span>
                    {getConfigStatusIndicator(diagnostics.vapiConfig.clientApiKeyConfigured)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Default Assistant ID:</span>
                    {getConfigStatusIndicator(diagnostics.vapiConfig.assistantIdConfigured)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Webhook Secret:</span>
                    {getConfigStatusIndicator(diagnostics.vapiConfig.webhookSecretConfigured)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Base URL:</span>
                    {getConfigStatusIndicator(diagnostics.vapiConfig.baseUrlConfigured)}
                  </div>
                </div>
              </div>
            </div>

            {/* Environment */}
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Environment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Node Environment:</span> {diagnostics.environment.nodeEnv}</div>
                <div><span className="font-medium">Public Environment:</span> {diagnostics.environment.nextPublicEnv}</div>
                <div><span className="font-medium">Mongoose Version:</span> {diagnostics.environment.mongooseVersion}</div>
              </div>
            </div>

            {/* Issues */}
            {diagnostics.issues && diagnostics.issues.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-2 text-red-700">Configuration Issues</h3>
                <div className="border border-red-200 rounded-md divide-y divide-red-200">
                  {diagnostics.issues.map((issue, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start">
                        <div className="mr-3">
                          <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${issue.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {issue.severity === 'critical' ? '!' : '⚠'}
                          </span>
                        </div>
                        <div>
                          <h4 className={`font-medium ${issue.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'}`}>
                            {issue.severity === 'critical' ? 'Critical Issue' : 'Warning'}
                          </h4>
                          <p className="mt-1">{issue.message}</p>
                          {issue.fix && (
                            <div className="mt-2 p-2 bg-gray-50 text-gray-700 rounded text-sm">
                              <span className="font-medium">Fix: </span>{issue.fix}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentation Link */}
            <div className="mt-6 bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-700">Need Help?</h4>
              <p className="text-sm text-blue-600">
                Refer to the <a href="/docs/vapi-troubleshooting.md" className="underline hover:text-blue-800">Vapi Integration Troubleshooting Guide</a> for detailed instructions on fixing common issues.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
