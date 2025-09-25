'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Clock, TrendingUp, Users, RefreshCw, Activity, PhoneCall, Timer, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CallAnalytics {
  timeRange: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalCalls: number;
    completedCalls: number;
    qualifiedCalls: number;
    totalDuration: number;
    avgDuration: number;
    successRate: number;
    qualificationRate: number;
  };
  todayMetrics: {
    totalCalls: number;
    qualifiedCalls: number;
    avgDuration: number;
    successRate: number;
  };
  hourlyData: Array<{
    hour: number;
    calls: number;
    qualified: number;
  }>;
  dailyData: Array<{
    date: string;
    totalCalls: number;
    qualifiedCalls: number;
    avgDuration: number;
  }>;
  recentCalls: Array<{
    id: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
    startedAt?: string;
    endedAt?: string;
    durationSeconds: number;
    isQualified: boolean;
    caseType?: string;
    estimatedValue?: number;
    cost: number;
    clientName: string;
    assistantName: string;
  }>;
  assistantAnalytics: Array<{
    assistantId: string;
    name: string;
    totalCalls: number;
    qualifiedCalls: number;
    completedCalls: number;
    successRate: number;
    qualificationRate: number;
    avgDuration: number;
  }>;
  vapiLiveData?: {
    totalCalls: number;
    recentCalls: Array<{
      id: string;
      phoneNumber: string;
      status: string;
      createdAt: string;
      endedAt?: string;
      durationSeconds: number;
    }>;
  };
}

const CustomerCallAnalytics = () => {
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [includeVapi, setIncludeVapi] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        timeRange,
        includeVapi: includeVapi.toString()
      });
      
      const response = await fetch(`/api/voice-ai/customer-analytics?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, includeVapi]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleRefresh}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Voice AI Call Analytics</h2>
            <p className="text-gray-600 mt-1">
              Call data from your Vapi AI assistants
              {lastUpdated && (
                <span className="ml-2 text-sm">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={includeVapi}
                onChange={(e) => setIncludeVapi(e.target.checked)}
                className="mr-2"
              />
              Include Live Vapi Data
            </label>
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Calls"
          value={analytics.summary.totalCalls}
          icon={Phone}
          color="blue"
          subtitle={`${analytics.todayMetrics.totalCalls} today`}
        />
        <MetricCard
          title="Success Rate"
          value={`${analytics.summary.successRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="green"
          subtitle={`${analytics.summary.completedCalls} completed`}
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(analytics.summary.avgDuration)}
          icon={Clock}
          color="purple"
          subtitle={`${formatDuration(analytics.todayMetrics.avgDuration)} today`}
        />
        <MetricCard
          title="Qualified Calls"
          value={analytics.summary.qualifiedCalls}
          icon={Users}
          color="orange"
          subtitle={`${analytics.summary.qualificationRate.toFixed(1)}% rate`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly call volume */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Call Volume by Hour</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatHourlyData(analytics.hourlyData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="#3B82F6" name="Total Calls" />
                <Bar dataKey="qualified" fill="#10B981" name="Qualified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">7-Day Call Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalCalls" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Total Calls"
                />
                <Line 
                  type="monotone" 
                  dataKey="qualifiedCalls" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Qualified Calls"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Assistant Performance */}
      {analytics.assistantAnalytics.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Assistant Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assistant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualification Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.assistantAnalytics.map((assistant) => (
                  <tr key={assistant.assistantId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {assistant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assistant.totalCalls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assistant.successRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assistant.qualificationRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(assistant.avgDuration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent calls table */}
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
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assistant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentCalls.length > 0 ? (
                analytics.recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{new Date(call.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(call.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {call.phoneNumber || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(call.durationSeconds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <QualificationBadge qualified={call.isQualified} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.assistantName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${call.cost.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent calls found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Vapi Data */}
      {analytics.vapiLiveData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Live Vapi Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">
                <strong>Total Calls from Vapi API:</strong> {analytics.vapiLiveData.totalCalls}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <strong>Recent Calls:</strong> {analytics.vapiLiveData.recentCalls.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
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
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColors: Record<string, string> = {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'ringing': 'bg-blue-100 text-blue-800',
    'queued': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800',
    'busy': 'bg-red-100 text-red-800',
    'no-answer': 'bg-red-100 text-red-800',
    'canceled': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

interface QualificationBadgeProps {
  qualified: boolean;
}

const QualificationBadge: React.FC<QualificationBadgeProps> = ({ qualified }) => {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      qualified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {qualified ? 'Qualified' : 'Not Qualified'}
    </span>
  );
};

// Helper functions
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

const formatHourlyData = (hourlyData: { hour: number, calls: number, qualified: number }[]) => {
  return hourlyData.map(data => ({
    hour: `${data.hour}:00`,
    calls: data.calls,
    qualified: data.qualified
  }));
};

export default CustomerCallAnalytics;
