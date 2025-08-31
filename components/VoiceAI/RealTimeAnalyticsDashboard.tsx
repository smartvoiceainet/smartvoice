'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Clock, TrendingUp, Users, RefreshCw, Activity } from 'lucide-react';
import vapiAnalyticsService, { RealTimeData, DashboardData } from '@/services/vapiAnalyticsService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useClientContext } from './ClientContextProvider';

const RealTimeAnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  
  // Get client and assistant IDs from context
  const { selectedClientId, selectedAssistantId } = useClientContext();

  // Load initial dashboard data when client or assistant selection changes
  useEffect(() => {
    loadDashboardData();
  }, [selectedClientId, selectedAssistantId]);

  // Set up real-time updates with client/assistant filtering
  useEffect(() => {
    if (isLive) {
      const handleRealTimeUpdate = (data: RealTimeData) => {
        setRealTimeData(data);
        setLastUpdated(new Date());
      };

      // Pass client and assistant IDs for filtering
      vapiAnalyticsService.startRealTimeUpdates(
        handleRealTimeUpdate, 
        30000,
        selectedClientId,
        selectedAssistantId
      );

      return () => {
        vapiAnalyticsService.stopRealTimeUpdates(handleRealTimeUpdate);
      };
    }
  }, [isLive, selectedClientId, selectedAssistantId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Pass client and assistant IDs for filtering
      const data = await vapiAnalyticsService.getDashboardData(selectedClientId, selectedAssistantId);
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    await loadDashboardData();
    
    // Also refresh real-time data if needed
    try {
      const data = await vapiAnalyticsService.getRealTimeData(selectedClientId, selectedAssistantId);
      setRealTimeData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing real-time data:', error);
    }
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const todayMetrics = realTimeData?.currentMetrics || dashboardData?.todayMetrics;
  const recentCalls = realTimeData?.recentCalls || dashboardData?.recentCalls || [];

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Voice AI Analytics</h2>
            <p className="text-gray-600 mt-1">
              Live data from your Vapi AI assistants
              {lastUpdated && (
                <span className="ml-2 text-sm">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLiveUpdates}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                isLive 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <Activity className={`h-4 w-4 mr-2 ${isLive ? 'animate-pulse' : ''}`} />
              {isLive ? 'Live' : 'Paused'}
            </button>
            <button
              onClick={handleManualRefresh}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Real-time metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Calls Today"
          value={todayMetrics?.totalCalls || 0}
          icon={Phone}
          color="blue"
          trend={realTimeData?.syncInfo?.syncedCount || 0}
          trendLabel="new"
        />
        <MetricCard
          title="Success Rate"
          value={`${(todayMetrics?.successRate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(todayMetrics?.averageDurationSeconds || 0)}
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Qualified Calls"
          value={todayMetrics?.qualifiedCalls || 0}
          icon={Users}
          color="orange"
          trend={`${(todayMetrics?.qualificationRate || 0).toFixed(1)}%`}
          trendLabel="rate"
        />
      </div>

      {/* Charts */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly call volume */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Call Volume</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatHourlyData(dashboardData.hourlyData || [])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">7-Day Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.weekMetrics || []}>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentCalls.length > 0 ? (
                recentCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(call.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent calls found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper components
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string | number;
  trendLabel?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, trend, trendLabel }) => {
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
          {trend !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              {trend} {trendLabel}
            </p>
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

const formatHourlyData = (hourlyData: { hour: number, calls: number }[]) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map(hour => ({
    hour: `${hour}:00`,
    calls: hourlyData.find(d => d.hour === hour)?.calls || 0
  }));
};

export default RealTimeAnalyticsDashboard;
