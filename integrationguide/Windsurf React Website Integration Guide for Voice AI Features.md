# Windsurf React Website Integration Guide for Voice AI Features

**Author:** Manus AI  
**Date:** June 29, 2025  
**Version:** 1.0

## Overview

This guide provides specific instructions for integrating the voice AI legal practice management features into your existing React website built with Windsurf. Instead of creating a separate dashboard, we'll add the necessary components and functionality to your current website.

## Integration Approach

### 1. Backend API Integration
Your existing Windsurf React website will connect to the Flask backend API we designed, which handles:
- Vapi webhook processing
- Call data management
- Filevine integration
- Engagement letter generation

### 2. Frontend Components to Add
We'll add specific components to your existing React structure:
- Call metrics dashboard section
- Call history and transcript viewer
- Analytics charts and reports
- Admin panel for system management

## Step-by-Step Integration

### Step 1: Install Required Dependencies

Add these packages to your existing Windsurf React project:

```bash
npm install axios recharts lucide-react date-fns
```

### Step 2: API Service Layer

Create an API service to connect to your Flask backend:

```javascript
// src/services/voiceAiApi.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_VOICE_AI_API_URL || 'http://localhost:8000';

class VoiceAiApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Call management
  async getCalls(filters = {}) {
    const response = await this.api.get('/api/calls', { params: filters });
    return response.data;
  }

  async getCall(callId) {
    const response = await this.api.get(`/api/calls/${callId}`);
    return response.data;
  }

  async getCallTranscript(callId) {
    const response = await this.api.get(`/api/calls/${callId}/transcript`);
    return response.data;
  }

  // Analytics
  async getAnalytics(dateRange = '30d') {
    const response = await this.api.get('/api/analytics', { 
      params: { range: dateRange } 
    });
    return response.data;
  }

  async getQualificationMetrics() {
    const response = await this.api.get('/api/analytics/qualification');
    return response.data;
  }

  // Engagement letters
  async getEngagementLetters(filters = {}) {
    const response = await this.api.get('/api/engagement-letters', { 
      params: filters 
    });
    return response.data;
  }

  async resendEngagementLetter(letterId) {
    const response = await this.api.post(`/api/engagement-letters/${letterId}/resend`);
    return response.data;
  }
}

export default new VoiceAiApiService();
```

### Step 3: Add Voice AI Dashboard Section

Create a new section in your existing website for voice AI features:

```javascript
// src/components/VoiceAI/VoiceAIDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Phone, Users, FileText, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import voiceAiApi from '../../services/voiceAiApi';

const VoiceAIDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, callsData] = await Promise.all([
        voiceAiApi.getAnalytics(),
        voiceAiApi.getCalls({ limit: 10, sort: 'created_at', order: 'desc' })
      ]);
      
      setAnalytics(analyticsData);
      setRecentCalls(callsData.calls);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
              <Tooltip />
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
              <Tooltip />
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => {
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

const StatusBadge = ({ status }) => {
  const statusColors = {
    'completed': 'bg-green-100 text-green-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const QualificationBadge = ({ qualified }) => {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      qualified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {qualified ? 'Qualified' : 'Not Qualified'}
    </span>
  );
};

export default VoiceAIDashboard;
```

### Step 4: Add Call Details Modal

Create a modal component to view call details and transcripts:

```javascript
// src/components/VoiceAI/CallDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Phone, Clock, User, FileText } from 'lucide-react';
import voiceAiApi from '../../services/voiceAiApi';

const CallDetailsModal = ({ callId, isOpen, onClose }) => {
  const [call, setCall] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && callId) {
      loadCallDetails();
    }
  }, [isOpen, callId]);

  const loadCallDetails = async () => {
    try {
      setLoading(true);
      const [callData, transcriptData] = await Promise.all([
        voiceAiApi.getCall(callId),
        voiceAiApi.getCallTranscript(callId)
      ]);
      
      setCall(callData);
      setTranscript(transcriptData);
    } catch (error) {
      console.error('Error loading call details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Call Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Call Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Call Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="ml-2 text-sm font-medium">{call?.phone_number}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="ml-2 text-sm font-medium">{call?.duration_seconds}s</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Case Type:</span>
                      <span className="ml-2 text-sm font-medium">{call?.case_type || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Qualification</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <QualificationBadge qualified={call?.is_qualified} />
                    </div>
                    {call?.estimated_value && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Estimated Value:</span>
                        <span className="ml-2 text-sm font-medium">
                          ${call.estimated_value.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div>
                <h3 className="text-lg font-medium mb-4">Call Transcript</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {transcript.length > 0 ? (
                    <div className="space-y-3">
                      {transcript.map((entry, index) => (
                        <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            entry.speaker === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white text-gray-900'
                          }`}>
                            <div className="text-xs opacity-75 mb-1">
                              {entry.speaker === 'user' ? 'Caller' : 'AI Assistant'}
                            </div>
                            <div className="text-sm">{entry.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No transcript available</p>
                  )}
                </div>
              </div>

              {/* Engagement Letter Status */}
              {call?.engagement_letters && call.engagement_letters.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Engagement Letters</h3>
                  <div className="space-y-2">
                    {call.engagement_letters.map((letter, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium">{letter.document_name}</span>
                        </div>
                        <StatusBadge status={letter.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallDetailsModal;
```

### Step 5: Integration into Your Existing Windsurf App

Add the voice AI section to your existing app structure. Here's how to integrate it:

```javascript
// In your main App.jsx or routing component
import VoiceAIDashboard from './components/VoiceAI/VoiceAIDashboard';

// Add a new route or section for voice AI
const App = () => {
  return (
    <div className="App">
      {/* Your existing Windsurf components */}
      
      {/* Add Voice AI section */}
      <section className="voice-ai-section py-12">
        <div className="container mx-auto px-4">
          <VoiceAIDashboard />
        </div>
      </section>
      
      {/* Rest of your existing components */}
    </div>
  );
};
```

### Step 6: Environment Configuration

Add these environment variables to your `.env` file:

```env
REACT_APP_VOICE_AI_API_URL=https://your-api-domain.com
REACT_APP_VOICE_AI_WS_URL=wss://your-api-domain.com/ws
```

### Step 7: Navigation Integration

Add voice AI navigation to your existing menu:

```javascript
// Add to your existing navigation component
const navigationItems = [
  // Your existing nav items
  {
    name: 'Voice AI Analytics',
    href: '#voice-ai',
    icon: Phone
  }
];
```

## Benefits of This Integration

1. **Seamless User Experience**: Voice AI features integrated into your existing website
2. **Consistent Branding**: Maintains your current design and branding
3. **Single Platform**: No need for users to switch between different applications
4. **Easy Maintenance**: All features in one codebase

## Next Steps

1. Install the backend Flask API (use the backend implementation guide)
2. Add the frontend components to your existing Windsurf React app
3. Configure the API connections
4. Test the integration
5. Deploy both frontend and backend

The backend API remains the same as designed in the previous guides - only the frontend integration approach changes to work with your existing Windsurf website.

