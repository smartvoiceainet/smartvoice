"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Phone, UserCheck, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface WidgetStats {
  totalCalls: number;
  qualifiedLeads: number;
  avgCallDuration: string;
  conversionRate: string;
}

const VoiceAIWidget = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<WidgetStats>({
    totalCalls: 0,
    qualifiedLeads: 0,
    avgCallDuration: '0m 0s',
    conversionRate: '0%'
  });
  const [loading, setLoading] = useState(true);

  // Check if user has access
  const hasAccess = session?.user?.hasVoiceAiAccess || session?.user?.role === 'admin';

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a production app, this would call your API
        // For now, using mock data
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        setStats({
          totalCalls: 128,
          qualifiedLeads: 42,
          avgCallDuration: '2m 45s',
          conversionRate: '32.8%'
        });
      } catch (error) {
        console.error('Failed to fetch Voice AI stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      fetchStats();
    }
  }, [hasAccess]);

  if (!hasAccess) return null;

  return (
    <div className="bg-base-100 rounded-lg shadow-md overflow-hidden border border-base-300">
      <div className="p-4 bg-primary text-primary-content flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          Voice AI Overview
        </h3>
        <Link 
          href="/dashboard/voice-ai-analytics"
          className="text-xs underline hover:opacity-90"
        >
          View Details
        </Link>
      </div>
      
      {loading ? (
        <div className="p-6 flex justify-center items-center">
          <div className="loading loading-spinner loading-md"></div>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3">
            <div className="text-3xl font-bold text-primary mb-1">{stats.totalCalls}</div>
            <div className="text-xs text-center flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              Total Calls
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3">
            <div className="text-3xl font-bold text-success mb-1">{stats.qualifiedLeads}</div>
            <div className="text-xs text-center flex items-center">
              <UserCheck className="h-3 w-3 mr-1" />
              Qualified Leads
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3">
            <div className="text-2xl font-bold text-info mb-1">{stats.avgCallDuration}</div>
            <div className="text-xs text-center flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Avg Duration
            </div>
          </div>
          
          <div className="flex flex-col items-center p-3">
            <div className="text-2xl font-bold text-warning mb-1">{stats.conversionRate}</div>
            <div className="text-xs text-center flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Conversion
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-base-200 p-3 text-center">
        <Link 
          href="/dashboard/voice-ai-admin" 
          className="text-xs text-primary hover:underline"
        >
          Manage Voice AI Settings
        </Link>
      </div>
    </div>
  );
};

export default VoiceAIWidget;
