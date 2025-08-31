# MongoDB Integration Guide for Existing React Voice AI System

**Author:** Manus AI  
**Date:** June 29, 2025  
**Version:** 1.0

## Overview

This guide shows how to integrate the advanced voice AI features into your existing React website that uses Google authentication, email authentication, MongoDB database, and already has a voice AI analytics page. We'll enhance your current system rather than replacing it.

## Integration Strategy

### Enhance Existing Architecture
- **Keep Current Auth**: Extend your Google/email auth with voice AI permissions
- **Enhance MongoDB**: Add new collections for advanced voice AI features
- **Upgrade Analytics**: Enhance your existing voice AI analytics page
- **Seamless Integration**: Build on your current foundation

## MongoDB Schema Enhancement

### Step 1: New MongoDB Collections

```javascript
// MongoDB Collections for Voice AI Enhancement

// 1. Enhanced Users Collection (extend existing)
// Add these fields to your existing users collection
{
  _id: ObjectId,
  // ... your existing user fields ...
  
  // Voice AI specific fields
  voiceAI: {
    role: {
      type: String,
      enum: ['admin', 'attorney', 'paralegal', 'staff', 'client'],
      default: 'staff'
    },
    hasVoiceAIAccess: {
      type: Boolean,
      default: false
    },
    voiceAIActivatedAt: Date,
    voiceAIActivatedBy: ObjectId,
    permissions: [{
      type: String,
      enum: ['view_analytics', 'manage_calls', 'view_cases', 'manage_users', 'manage_system']
    }],
    clientId: ObjectId, // For client users
    isClientUser: {
      type: Boolean,
      default: false
    }
  },
  
  // Existing fields remain unchanged
  createdAt: Date,
  updatedAt: Date
}

// 2. Clients Collection (new)
{
  _id: ObjectId,
  name: String,
  companyName: String,
  email: String,
  phone: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'trial'],
    default: 'trial'
  },
  subscription: {
    plan: String,
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  branding: {
    logoUrl: String,
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    companyWebsite: String
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}

// 3. Vapi Assistants Collection (new)
{
  _id: ObjectId,
  vapiAssistantId: {
    type: String,
    unique: true,
    required: true
  },
  vapiPhoneNumber: String,
  clientId: {
    type: ObjectId,
    ref: 'Client',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  configuration: {
    voiceModel: String,
    language: {
      type: String,
      default: 'en'
    },
    personalityPrompt: String,
    practiceArea: String,
    qualificationCriteria: Object,
    maxCallDuration: {
      type: Number,
      default: 1800
    },
    businessHours: {
      start: String,
      end: String
    }
  },
  performance: {
    totalCalls: {
      type: Number,
      default: 0
    },
    successfulCalls: {
      type: Number,
      default: 0
    },
    qualifiedCalls: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastCallAt: Date
}

// 4. Enhanced Calls Collection (extend existing or create new)
{
  _id: ObjectId,
  vapiCallId: {
    type: String,
    unique: true,
    required: true
  },
  clientId: {
    type: ObjectId,
    ref: 'Client',
    required: true
  },
  assistantId: {
    type: ObjectId,
    ref: 'VapiAssistant',
    required: true
  },
  phoneNumber: String,
  status: {
    type: String,
    enum: ['queued', 'ringing', 'in-progress', 'forwarding', 'completed', 'busy', 'no-answer', 'failed', 'canceled'],
    required: true
  },
  timing: {
    createdAt: {
      type: Date,
      required: true
    },
    startedAt: Date,
    endedAt: Date,
    durationSeconds: {
      type: Number,
      default: 0
    }
  },
  content: {
    transcript: String,
    summary: String,
    recording: {
      url: String,
      duration: Number
    }
  },
  analysis: {
    isQualified: {
      type: Boolean,
      default: false
    },
    caseType: String,
    estimatedValue: Number,
    qualificationScore: Number,
    sentiment: String,
    keywords: [String]
  },
  cost: Number,
  rawData: Object, // Store full Vapi response
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}

// 5. Daily Metrics Collection (new)
{
  _id: ObjectId,
  date: {
    type: Date,
    required: true
  },
  clientId: {
    type: ObjectId,
    ref: 'Client'
  },
  assistantId: {
    type: ObjectId,
    ref: 'VapiAssistant'
  },
  metrics: {
    totalCalls: {
      type: Number,
      default: 0
    },
    successfulCalls: {
      type: Number,
      default: 0
    },
    failedCalls: {
      type: Number,
      default: 0
    },
    qualifiedCalls: {
      type: Number,
      default: 0
    },
    totalDurationSeconds: {
      type: Number,
      default: 0
    },
    averageDurationSeconds: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    estimatedRevenue: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    qualificationRate: {
      type: Number,
      default: 0
    }
  },
  hourlyBreakdown: [{
    hour: Number,
    calls: Number,
    qualified: Number
  }],
  caseTypeBreakdown: [{
    caseType: String,
    count: Number,
    qualifiedCount: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}

// 6. Engagement Letters Collection (new)
{
  _id: ObjectId,
  callId: {
    type: ObjectId,
    ref: 'Call',
    required: true
  },
  clientId: {
    type: ObjectId,
    ref: 'Client',
    required: true
  },
  filevineProjectId: String,
  documentName: String,
  status: {
    type: String,
    enum: ['pending', 'generated', 'sent', 'signed', 'failed'],
    default: 'pending'
  },
  recipientInfo: {
    name: String,
    email: String,
    phone: String,
    address: Object
  },
  documentData: {
    templateId: String,
    generatedUrl: String,
    signedUrl: String,
    variables: Object
  },
  timeline: {
    generatedAt: Date,
    sentAt: Date,
    signedAt: Date,
    failedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Step 2: MongoDB Service Layer

```javascript
// src/services/mongoDBService.js - MongoDB service layer
import mongoose from 'mongoose';

// Define Mongoose schemas based on the collections above
const UserSchema = new mongoose.Schema({
  // Your existing user fields
  email: { type: String, required: true, unique: true },
  googleId: String,
  firstName: String,
  lastName: String,
  profilePicture: String,
  
  // Enhanced voice AI fields
  voiceAI: {
    role: {
      type: String,
      enum: ['admin', 'attorney', 'paralegal', 'staff', 'client'],
      default: 'staff'
    },
    hasVoiceAIAccess: { type: Boolean, default: false },
    voiceAIActivatedAt: Date,
    voiceAIActivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: [String],
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    isClientUser: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'trial'],
    default: 'trial'
  },
  subscription: {
    plan: String,
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  branding: {
    logoUrl: String,
    primaryColor: { type: String, default: '#3B82F6' },
    companyWebsite: String
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' }
  },
  lastLogin: Date
}, {
  timestamps: true
});

const VapiAssistantSchema = new mongoose.Schema({
  vapiAssistantId: { type: String, unique: true, required: true },
  vapiPhoneNumber: String,
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  configuration: {
    voiceModel: String,
    language: { type: String, default: 'en' },
    personalityPrompt: String,
    practiceArea: String,
    qualificationCriteria: mongoose.Schema.Types.Mixed,
    maxCallDuration: { type: Number, default: 1800 },
    businessHours: {
      start: String,
      end: String
    }
  },
  performance: {
    totalCalls: { type: Number, default: 0 },
    successfulCalls: { type: Number, default: 0 },
    qualifiedCalls: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 }
  },
  lastCallAt: Date
}, {
  timestamps: true
});

const CallSchema = new mongoose.Schema({
  vapiCallId: { type: String, unique: true, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  assistantId: { type: mongoose.Schema.Types.ObjectId, ref: 'VapiAssistant', required: true },
  phoneNumber: String,
  status: {
    type: String,
    enum: ['queued', 'ringing', 'in-progress', 'forwarding', 'completed', 'busy', 'no-answer', 'failed', 'canceled'],
    required: true
  },
  timing: {
    createdAt: { type: Date, required: true },
    startedAt: Date,
    endedAt: Date,
    durationSeconds: { type: Number, default: 0 }
  },
  content: {
    transcript: String,
    summary: String,
    recording: {
      url: String,
      duration: Number
    }
  },
  analysis: {
    isQualified: { type: Boolean, default: false },
    caseType: String,
    estimatedValue: Number,
    qualificationScore: Number,
    sentiment: String,
    keywords: [String]
  },
  cost: Number,
  rawData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const DailyMetricsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  assistantId: { type: mongoose.Schema.Types.ObjectId, ref: 'VapiAssistant' },
  metrics: {
    totalCalls: { type: Number, default: 0 },
    successfulCalls: { type: Number, default: 0 },
    failedCalls: { type: Number, default: 0 },
    qualifiedCalls: { type: Number, default: 0 },
    totalDurationSeconds: { type: Number, default: 0 },
    averageDurationSeconds: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    estimatedRevenue: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    qualificationRate: { type: Number, default: 0 }
  },
  hourlyBreakdown: [{
    hour: Number,
    calls: Number,
    qualified: Number
  }],
  caseTypeBreakdown: [{
    caseType: String,
    count: Number,
    qualifiedCount: Number
  }]
}, {
  timestamps: true
});

// Create indexes for performance
ClientSchema.index({ email: 1 });
VapiAssistantSchema.index({ clientId: 1, vapiAssistantId: 1 });
CallSchema.index({ clientId: 1, 'timing.createdAt': -1 });
CallSchema.index({ assistantId: 1, 'timing.createdAt': -1 });
DailyMetricsSchema.index({ date: 1, clientId: 1 });

// Export models
export const User = mongoose.model('User', UserSchema);
export const Client = mongoose.model('Client', ClientSchema);
export const VapiAssistant = mongoose.model('VapiAssistant', VapiAssistantSchema);
export const Call = mongoose.model('Call', CallSchema);
export const DailyMetrics = mongoose.model('DailyMetrics', DailyMetricsSchema);
```

### Step 3: Enhanced Authentication Middleware

```javascript
// src/middleware/authMiddleware.js - Enhanced auth for existing system
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

// Enhance your existing auth middleware
export const enhancedAuthMiddleware = async (req, res, next) => {
  try {
    // Your existing auth logic here
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    // Decode token (adapt to your existing token structure)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with voice AI fields
    const user = await User.findById(decoded.userId).populate('voiceAI.clientId');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Add user to request
    req.user = user;
    req.userVoiceAI = user.voiceAI;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Voice AI permission middleware
export const requireVoiceAIAccess = (req, res, next) => {
  if (!req.userVoiceAI?.hasVoiceAIAccess) {
    return res.status(403).json({ 
      error: 'Voice AI access required',
      requiresApproval: true 
    });
  }
  next();
};

// Permission-based middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.userVoiceAI?.permissions?.includes(permission)) {
      return res.status(403).json({ 
        error: `Permission required: ${permission}` 
      });
    }
    next();
  };
};

// Client-specific middleware
export const requireClientAccess = async (req, res, next) => {
  try {
    const clientId = req.params.clientId || req.body.clientId;
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID required' });
    }

    // Check if user has access to this client
    if (req.userVoiceAI?.isClientUser) {
      // Client user can only access their own client
      if (req.userVoiceAI.clientId.toString() !== clientId) {
        return res.status(403).json({ error: 'Access denied to this client' });
      }
    } else {
      // Internal users need appropriate permissions
      if (!req.userVoiceAI?.permissions?.includes('view_all')) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};
```

### Step 4: Enhanced API Routes for Existing System

```javascript
// src/routes/voiceAIRoutes.js - Enhanced routes for your existing system
import express from 'express';
import { 
  enhancedAuthMiddleware, 
  requireVoiceAIAccess, 
  requirePermission,
  requireClientAccess 
} from '../middleware/authMiddleware.js';
import { 
  Client, 
  VapiAssistant, 
  Call, 
  DailyMetrics 
} from '../models/index.js';

const router = express.Router();

// Enhance your existing voice AI analytics endpoint
router.get('/analytics/dashboard', 
  enhancedAuthMiddleware,
  requireVoiceAIAccess,
  requirePermission('view_analytics'),
  async (req, res) => {
    try {
      const { range = '30d', clientId, assistantId } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (range) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Build query filters
      const filters = {
        'timing.createdAt': { $gte: startDate, $lte: endDate }
      };

      // Add client filter if specified or if user is client user
      if (clientId || req.userVoiceAI?.isClientUser) {
        const targetClientId = clientId || req.userVoiceAI.clientId;
        filters.clientId = targetClientId;
      }

      // Add assistant filter if specified
      if (assistantId) {
        filters.assistantId = assistantId;
      }

      // Get calls data
      const calls = await Call.find(filters)
        .populate('clientId', 'name companyName')
        .populate('assistantId', 'name vapiPhoneNumber')
        .sort({ 'timing.createdAt': -1 })
        .limit(100);

      // Calculate metrics
      const totalCalls = calls.length;
      const successfulCalls = calls.filter(call => call.status === 'completed').length;
      const qualifiedCalls = calls.filter(call => call.analysis.isQualified).length;
      const totalDuration = calls.reduce((sum, call) => sum + (call.timing.durationSeconds || 0), 0);
      const totalCost = calls.reduce((sum, call) => sum + (call.cost || 0), 0);

      // Calculate rates
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls * 100) : 0;
      const qualificationRate = totalCalls > 0 ? (qualifiedCalls / totalCalls * 100) : 0;
      const avgDuration = totalCalls > 0 ? (totalDuration / totalCalls) : 0;

      // Get daily breakdown
      const dailyBreakdown = await Call.aggregate([
        { $match: filters },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timing.createdAt" } },
            totalCalls: { $sum: 1 },
            successfulCalls: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
            },
            qualifiedCalls: {
              $sum: { $cond: ["$analysis.isQualified", 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get hourly breakdown for today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const hourlyBreakdown = await Call.aggregate([
        {
          $match: {
            ...filters,
            'timing.createdAt': { $gte: todayStart, $lte: todayEnd }
          }
        },
        {
          $group: {
            _id: { $hour: "$timing.createdAt" },
            calls: { $sum: 1 },
            qualified: { $sum: { $cond: ["$analysis.isQualified", 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get case type breakdown
      const caseTypeBreakdown = await Call.aggregate([
        { $match: { ...filters, 'analysis.caseType': { $ne: null } } },
        {
          $group: {
            _id: "$analysis.caseType",
            totalCalls: { $sum: 1 },
            qualifiedCalls: { $sum: { $cond: ["$analysis.isQualified", 1, 0] } }
          }
        },
        { $sort: { totalCalls: -1 } }
      ]);

      // Get recent calls
      const recentCalls = calls.slice(0, 10);

      res.json({
        metrics: {
          totalCalls,
          successfulCalls,
          qualifiedCalls,
          successRate: Math.round(successRate * 10) / 10,
          qualificationRate: Math.round(qualificationRate * 10) / 10,
          totalDurationSeconds: totalDuration,
          averageDurationSeconds: Math.round(avgDuration),
          totalCost: Math.round(totalCost * 100) / 100
        },
        charts: {
          dailyBreakdown: dailyBreakdown.map(item => ({
            date: item._id,
            totalCalls: item.totalCalls,
            successfulCalls: item.successfulCalls,
            qualifiedCalls: item.qualifiedCalls
          })),
          hourlyBreakdown: hourlyBreakdown.map(item => ({
            hour: item._id,
            calls: item.calls,
            qualified: item.qualified
          })),
          caseTypeBreakdown: caseTypeBreakdown.map(item => ({
            caseType: item._id,
            totalCalls: item.totalCalls,
            qualifiedCalls: item.qualifiedCalls,
            qualificationRate: item.totalCalls > 0 ? (item.qualifiedCalls / item.totalCalls * 100) : 0
          }))
        },
        recentCalls: recentCalls.map(call => ({
          id: call._id,
          vapiCallId: call.vapiCallId,
          phoneNumber: call.phoneNumber,
          status: call.status,
          createdAt: call.timing.createdAt,
          durationSeconds: call.timing.durationSeconds,
          isQualified: call.analysis.isQualified,
          caseType: call.analysis.caseType,
          estimatedValue: call.analysis.estimatedValue,
          client: call.clientId ? {
            name: call.clientId.name,
            companyName: call.clientId.companyName
          } : null,
          assistant: call.assistantId ? {
            name: call.assistantId.name,
            phoneNumber: call.assistantId.vapiPhoneNumber
          } : null
        })),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          range
        }
      });

    } catch (error) {
      console.error('Dashboard analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  }
);

// Client-specific analytics
router.get('/analytics/client/:clientId',
  enhancedAuthMiddleware,
  requireVoiceAIAccess,
  requireClientAccess,
  async (req, res) => {
    try {
      const { clientId } = req.params;
      const { range = '30d' } = req.query;

      // Get client
      const client = await Client.findById(clientId);
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      // Get client's assistants
      const assistants = await VapiAssistant.find({ clientId });

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(range.replace('d', '')));

      // Get calls for this client
      const calls = await Call.find({
        clientId,
        'timing.createdAt': { $gte: startDate, $lte: endDate }
      }).populate('assistantId', 'name vapiPhoneNumber');

      // Calculate metrics (similar to above)
      const totalCalls = calls.length;
      const successfulCalls = calls.filter(call => call.status === 'completed').length;
      const qualifiedCalls = calls.filter(call => call.analysis.isQualified).length;
      
      res.json({
        client: {
          id: client._id,
          name: client.name,
          companyName: client.companyName,
          branding: client.branding
        },
        assistants: assistants.map(assistant => ({
          id: assistant._id,
          name: assistant.name,
          vapiAssistantId: assistant.vapiAssistantId,
          vapiPhoneNumber: assistant.vapiPhoneNumber,
          isActive: assistant.isActive,
          practiceArea: assistant.configuration.practiceArea
        })),
        metrics: {
          totalCalls,
          successfulCalls,
          qualifiedCalls,
          successRate: totalCalls > 0 ? (successfulCalls / totalCalls * 100) : 0,
          qualificationRate: totalCalls > 0 ? (qualifiedCalls / totalCalls * 100) : 0
        },
        // ... additional analytics data
      });

    } catch (error) {
      console.error('Client analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch client analytics' });
    }
  }
);

// Voice AI access request
router.post('/request-access',
  enhancedAuthMiddleware,
  async (req, res) => {
    try {
      const user = req.user;
      
      if (user.voiceAI?.hasVoiceAIAccess) {
        return res.json({ message: 'You already have voice AI access' });
      }

      // Update user to request access
      await User.findByIdAndUpdate(user._id, {
        'voiceAI.role': 'staff',
        'voiceAI.hasVoiceAIAccess': false // Will be approved by admin
      });

      // TODO: Send notification to admins
      // You can implement email notification or in-app notification here

      res.json({
        message: 'Voice AI access request submitted. An administrator will review your request.'
      });

    } catch (error) {
      console.error('Access request error:', error);
      res.status(500).json({ error: 'Failed to submit access request' });
    }
  }
);

export default router;
```

### Step 5: Enhanced Frontend Components

```javascript
// src/components/VoiceAI/EnhancedAnalyticsDashboard.jsx
// Enhancement for your existing voice AI analytics page
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Your existing auth context

const EnhancedAnalyticsDashboard = () => {
  const { user, token } = useAuth(); // Your existing auth
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedAssistant, setSelectedAssistant] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [assistants, setAssistants] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
    if (user?.voiceAI?.role === 'admin') {
      loadClients();
    }
  }, [selectedClient, selectedAssistant, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        range: dateRange,
        ...(selectedClient !== 'all' && { clientId: selectedClient }),
        ...(selectedAssistant !== 'all' && { assistantId: selectedAssistant })
      });

      const response = await fetch(`/api/voice-ai/analytics/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch('/api/voice-ai/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  // Check if user has voice AI access
  if (!user?.voiceAI?.hasVoiceAIAccess) {
    return <VoiceAIAccessRequest />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced header with filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Voice AI Analytics</h2>
            <p className="text-gray-600">Enhanced analytics with client and assistant filtering</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Client Filter (for admins) */}
            {user?.voiceAI?.role === 'admin' && (
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.companyName || client.name}
                  </option>
                ))}
              </select>
            )}
            
            {/* Assistant Filter */}
            <select
              value={selectedAssistant}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Assistants</option>
              {assistants.map(assistant => (
                <option key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </option>
              ))}
            </select>
            
            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Calls"
          value={analyticsData?.metrics?.totalCalls || 0}
          icon="📞"
          color="blue"
        />
        <MetricCard
          title="Success Rate"
          value={`${analyticsData?.metrics?.successRate || 0}%`}
          icon="📈"
          color="green"
        />
        <MetricCard
          title="Qualified Leads"
          value={analyticsData?.metrics?.qualifiedCalls || 0}
          icon="👥"
          color="purple"
          subtitle={`${analyticsData?.metrics?.qualificationRate || 0}% rate`}
        />
        <MetricCard
          title="Total Cost"
          value={`$${analyticsData?.metrics?.totalCost || 0}`}
          icon="💰"
          color="orange"
        />
      </div>

      {/* Enhanced charts with your existing chart components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Call Volume Trend</h3>
          {/* Your existing chart component with enhanced data */}
          <YourExistingLineChart data={analyticsData?.charts?.dailyBreakdown} />
        </div>

        {/* Case Types Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Case Types</h3>
          {/* Your existing pie chart component */}
          <YourExistingPieChart data={analyticsData?.charts?.caseTypeBreakdown} />
        </div>
      </div>

      {/* Enhanced calls table */}
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
                {user?.voiceAI?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assistant
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
              {analyticsData?.recentCalls?.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(call.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.phoneNumber || 'Unknown'}
                  </td>
                  {user?.voiceAI?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.client?.companyName || call.client?.name || 'Unknown'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {call.assistant?.name || 'Unknown'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Voice AI Access Request Component
const VoiceAIAccessRequest = () => {
  const { user, token } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequestAccess = async () => {
    try {
      setRequesting(true);
      
      const response = await fetch('/api/voice-ai/request-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setRequested(true);
      }
    } catch (error) {
      console.error('Error requesting access:', error);
    } finally {
      setRequesting(false);
    }
  };

  if (requested) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-800 mb-2">Access Request Submitted</h3>
        <p className="text-green-700">
          Your request for voice AI access has been submitted. An administrator will review and approve your access shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Voice AI Access Required</h3>
      <p className="text-blue-700 mb-4">
        Welcome {user?.firstName}! To access the enhanced voice AI features, you need approval from an administrator.
      </p>
      <button
        onClick={handleRequestAccess}
        disabled={requesting}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {requesting ? 'Submitting Request...' : 'Request Voice AI Access'}
      </button>
    </div>
  );
};

// Helper components (adapt your existing ones)
const MetricCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`text-2xl mr-3`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusColors = {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'failed': 'bg-red-100 text-red-800',
    'queued': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const QualificationBadge = ({ qualified }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
    qualified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {qualified ? 'Qualified' : 'Not Qualified'}
  </span>
);

const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

export default EnhancedAnalyticsDashboard;
```

### Step 6: Integration with Your Existing Auth Context

```javascript
// Enhance your existing AuthContext
// src/contexts/AuthContext.js - Enhancement for existing context

// Add these methods to your existing AuthContext
const enhanceExistingAuthContext = {
  // Add voice AI specific methods to your existing context
  
  hasVoiceAIAccess: () => {
    return user?.voiceAI?.hasVoiceAIAccess || false;
  },

  hasVoiceAIPermission: (permission) => {
    if (!user?.voiceAI?.hasVoiceAIAccess) return false;
    return user?.voiceAI?.permissions?.includes(permission) || false;
  },

  isClientUser: () => {
    return user?.voiceAI?.isClientUser || false;
  },

  getClientId: () => {
    return user?.voiceAI?.clientId || null;
  },

  requestVoiceAIAccess: async () => {
    try {
      const response = await fetch('/api/voice-ai/request-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Add these to your existing AuthContext provider value
```

## Integration Summary

### ✅ **Seamless Enhancement**
- **Keeps Your Current System**: All existing functionality remains unchanged
- **Enhances MongoDB**: Adds new collections without affecting existing data
- **Extends Authentication**: Builds on your Google/email auth system
- **Upgrades Analytics**: Enhances your existing voice AI analytics page

### ✅ **New Capabilities**
- **Client Management**: Multi-tenant system with client-specific dashboards
- **Assistant Linking**: Connect Vapi assistants to specific clients
- **Enhanced Analytics**: Advanced filtering and reporting
- **Role-Based Access**: Granular permissions for different user types

### ✅ **Professional Features**
- **White-Label Ready**: Client-specific branding and portals
- **Real-Time Data**: Live synchronization with Vapi API
- **Comprehensive Reporting**: Detailed analytics and performance metrics
- **Secure Multi-Tenancy**: Complete data isolation between clients

This integration enhances your existing React/MongoDB/Auth system with professional-grade voice AI management capabilities while maintaining all your current functionality!

