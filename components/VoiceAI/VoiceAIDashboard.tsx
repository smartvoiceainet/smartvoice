"use client";

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Users, 
  FileText, 
  TrendingUp 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import voiceAiApi from '@/services/voiceAiApi';
import dynamic from 'next/dynamic';
import { StatusBadge, QualificationBadge } from './VoiceAIShared';
import { useClientContext } from './ClientContextProvider';

// Dynamic import with proper type definitions to avoid circular dependencies
interface CallDetailsModalProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CallDetailsModal = dynamic<CallDetailsModalProps>(
  () => import('./CallDetailsModal'),
  { ssr: false }
);

// Types for the API responses
interface CallVolumeData {
  date: string;
  calls: number;
}

interface CaseTypeData {
  case_type: string;
  count: number;
}

interface AnalyticsData {
  daily_calls: number;
  qualified_calls: number;
  engagement_letters_sent: number;
  qualification_rate: number;
  call_volume_chart: CallVolumeData[];
  case_types_chart: CaseTypeData[];
}

interface Call {
  id: string;
  created_at: string;
  phone_number: string;
  case_type?: string;
  status: 'completed' | 'in_progress' | 'failed';
  is_qualified: boolean;
  duration_seconds: number;
}

const VoiceAIDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get client and assistant IDs from context
  const { selectedClientId, selectedAssistantId } = useClientContext();

  // Reload data when client or assistant selection changes
  useEffect(() => {
    loadDashboardData();
  }, [selectedClientId, selectedAssistantId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, callsData] = await Promise.all([
        voiceAiApi.getAnalytics({
          clientId: selectedClientId || undefined,
          assistantId: selectedAssistantId || undefined
        }),
        voiceAiApi.getCalls({ 
          limit: 10, 
          sort: 'created_at', 
          order: 'desc',
          clientId: selectedClientId || undefined,
          assistantId: selectedAssistantId || undefined
        })
      ]);
      
      setAnalytics(analyticsData);
      setRecentCalls(callsData.calls);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCallDetails = (callId: string) => {
    setSelectedCallId(callId);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice AI Analytics</h2>
        <p className="text-gray-600">Monitor your automated client intake performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Calls Today"
          value={analytics?.daily_calls || 0}
          icon={Phone}
          color="blue"
        />
        <MetricCard
          title="Qualified Calls"
          value={analytics?.qualified_calls || 0}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Engagement Letters Sent"
          value={analytics?.engagement_letters_sent || 0}
          icon={FileText}
          color="purple"
        />
        <MetricCard
          title="Qualification Rate"
          value={`${((analytics?.qualification_rate || 0) * 100).toFixed(1)}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Volume Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Call Volume (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.call_volume_chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="calls" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Case Types Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Qualified Cases by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.case_types_chart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="case_type" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Calls Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Calls</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(call.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.case_type || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <QualificationBadge qualified={call.is_qualified} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleViewCallDetails(call.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Details Modal */}
      <CallDetailsModal 
        callId={selectedCallId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
}

// Components moved to VoiceAIShared.tsx

export default VoiceAIDashboard;
