'use client';

import React, { useState } from 'react';
import { RefreshCw, PhoneCall, ChartBar, Loader2, Database } from 'lucide-react';
import vapiAnalyticsService from '@/services/vapiAnalyticsService';

interface VoiceAISyncControlsProps {
  onSyncComplete?: (result: any) => void;
}

const VoiceAISyncControls: React.FC<VoiceAISyncControlsProps> = ({ onSyncComplete }) => {
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    calls: false,
    metrics: false,
    all: false
  });
  const [lastSync, setLastSync] = useState<{[key: string]: string | null}>({
    calls: null,
    metrics: null,
    all: null
  });
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async (type: 'calls' | 'metrics' | 'all') => {
    try {
      setIsLoading(prev => ({ ...prev, [type]: true }));
      
      const result = await vapiAnalyticsService.triggerSync(type);
      
      setLastSync(prev => ({ 
        ...prev, 
        [type]: new Date().toLocaleTimeString() 
      }));
      setSyncResult(result);
      
      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error) {
      console.error(`Error syncing ${type}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Data Synchronization</h3>
      <p className="text-sm text-gray-600 mb-4">
        Manually trigger data sync from Vapi API to update your analytics data.
      </p>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={() => handleSync('calls')}
          disabled={isLoading.calls || isLoading.all}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading.calls ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PhoneCall className="h-4 w-4 mr-2" />
          )}
          Sync Recent Calls
          {lastSync.calls && (
            <span className="ml-2 text-xs opacity-70">
              Last: {lastSync.calls}
            </span>
          )}
        </button>
        
        <button
          onClick={() => handleSync('metrics')}
          disabled={isLoading.metrics || isLoading.all}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
        >
          {isLoading.metrics ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ChartBar className="h-4 w-4 mr-2" />
          )}
          Sync Daily Metrics
          {lastSync.metrics && (
            <span className="ml-2 text-xs opacity-70">
              Last: {lastSync.metrics}
            </span>
          )}
        </button>
      </div>
      
      <div>
        <button
          onClick={() => handleSync('all')}
          disabled={isLoading.all || isLoading.calls || isLoading.metrics}
          className="flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed w-full justify-center"
        >
          {isLoading.all ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Sync All Data
          {lastSync.all && (
            <span className="ml-2 text-xs opacity-70">
              Last: {lastSync.all}
            </span>
          )}
        </button>
      </div>
      
      {syncResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium">Last Sync Result:</p>
          <pre className="mt-1 whitespace-pre-wrap text-xs">
            {JSON.stringify(syncResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default VoiceAISyncControls;
