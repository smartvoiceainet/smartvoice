# Complete Admin Interface Setup Guide

**Author:** Manus AI  
**Date:** June 29, 2025  
**Version:** 1.0

## Overview

You're absolutely right! The admin interface needs additional setup to actually display assistant and client information. Here's everything you need to make it fully functional with real data.

## Missing Pieces Checklist

### ✅ **1. Vapi Assistant Sync Setup**
### ✅ **2. Complete API Endpoints** 
### ✅ **3. Data Loading Logic**
### ✅ **4. Initial Database Population**
### ✅ **5. Error Handling & Loading States**

## Step 1: Complete Backend API Setup

### Enhanced Admin Routes with Full Data Loading

```javascript
// src/routes/adminRoutes.js - Complete implementation
import express from 'express';
import mongoose from 'mongoose';
import { User, Client, VapiAssistant, Call } from '../models/index.js';
import { enhancedAuthMiddleware, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all clients with full relationship data
router.get('/clients', 
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      // Get all clients
      const clients = await Client.find().sort({ createdAt: -1 });
      
      // Get all users linked to clients
      const clientUsers = await User.find({
        'voiceAI.isClientUser': true,
        'voiceAI.clientId': { $exists: true }
      }).select('firstName lastName email voiceAI');

      // Get all assistants linked to clients
      const clientAssistants = await VapiAssistant.find({
        clientId: { $exists: true }
      });

      // Get call counts for each client (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const callCounts = await Call.aggregate([
        {
          $match: {
            'timing.createdAt': { $gte: thirtyDaysAgo },
            clientId: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$clientId',
            totalCalls: { $sum: 1 },
            qualifiedCalls: {
              $sum: { $cond: ['$analysis.isQualified', 1, 0] }
            }
          }
        }
      ]);

      // Combine all data
      const clientsWithData = clients.map(client => {
        const users = clientUsers.filter(user => 
          user.voiceAI?.clientId?.toString() === client._id.toString()
        );
        
        const assistants = clientAssistants.filter(assistant => 
          assistant.clientId?.toString() === client._id.toString()
        );

        const callData = callCounts.find(count => 
          count._id.toString() === client._id.toString()
        );

        return {
          ...client.toObject(),
          linkedUsers: users.map(user => ({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.voiceAI?.role
          })),
          linkedAssistants: assistants.map(assistant => ({
            _id: assistant._id,
            name: assistant.name,
            vapiAssistantId: assistant.vapiAssistantId,
            vapiPhoneNumber: assistant.vapiPhoneNumber,
            isActive: assistant.isActive,
            practiceArea: assistant.configuration?.practiceArea
          })),
          stats: {
            totalCalls: callData?.totalCalls || 0,
            qualifiedCalls: callData?.qualifiedCalls || 0,
            qualificationRate: callData?.totalCalls > 0 
              ? Math.round((callData.qualifiedCalls / callData.totalCalls) * 100) 
              : 0
          }
        };
      });

      res.json({ 
        clients: clientsWithData,
        summary: {
          totalClients: clients.length,
          activeClients: clients.filter(c => c.status === 'active').length,
          totalUsers: clientUsers.length,
          totalAssistants: clientAssistants.length
        }
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  }
);

// Get all users with client information
router.get('/users',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const users = await User.find()
        .select('firstName lastName email voiceAI createdAt lastLogin')
        .sort({ createdAt: -1 });

      // Get client information for linked users
      const clientIds = users
        .filter(user => user.voiceAI?.clientId)
        .map(user => user.voiceAI.clientId);

      const clients = await Client.find({
        _id: { $in: clientIds }
      }).select('name companyName');

      const usersWithClientInfo = users.map(user => {
        const userObj = user.toObject();
        
        if (user.voiceAI?.clientId) {
          const client = clients.find(c => 
            c._id.toString() === user.voiceAI.clientId.toString()
          );
          userObj.clientInfo = client ? {
            id: client._id,
            name: client.name,
            companyName: client.companyName
          } : null;
        }

        return userObj;
      });
      
      res.json({ 
        users: usersWithClientInfo,
        summary: {
          totalUsers: users.length,
          clientUsers: users.filter(u => u.voiceAI?.isClientUser).length,
          adminUsers: users.filter(u => u.voiceAI?.role === 'admin').length,
          pendingAccess: users.filter(u => !u.voiceAI?.hasVoiceAIAccess).length
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Get all Vapi assistants with client and performance data
router.get('/vapi-assistants',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const assistants = await VapiAssistant.find().sort({ createdAt: -1 });

      // Get client information
      const clientIds = assistants
        .filter(assistant => assistant.clientId)
        .map(assistant => assistant.clientId);

      const clients = await Client.find({
        _id: { $in: clientIds }
      }).select('name companyName');

      // Get performance data for each assistant (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const performanceData = await Call.aggregate([
        {
          $match: {
            'timing.createdAt': { $gte: thirtyDaysAgo },
            assistantId: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$assistantId',
            totalCalls: { $sum: 1 },
            successfulCalls: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            qualifiedCalls: {
              $sum: { $cond: ['$analysis.isQualified', 1, 0] }
            },
            totalDuration: { $sum: '$timing.durationSeconds' },
            totalCost: { $sum: '$cost' },
            lastCall: { $max: '$timing.createdAt' }
          }
        }
      ]);

      const assistantsWithData = assistants.map(assistant => {
        const assistantObj = assistant.toObject();
        
        // Add client info
        if (assistant.clientId) {
          const client = clients.find(c => 
            c._id.toString() === assistant.clientId.toString()
          );
          assistantObj.clientInfo = client ? {
            id: client._id,
            name: client.name,
            companyName: client.companyName
          } : null;
        }

        // Add performance data
        const performance = performanceData.find(p => 
          p._id.toString() === assistant._id.toString()
        );

        assistantObj.performance = performance ? {
          totalCalls: performance.totalCalls,
          successfulCalls: performance.successfulCalls,
          qualifiedCalls: performance.qualifiedCalls,
          successRate: Math.round((performance.successfulCalls / performance.totalCalls) * 100),
          qualificationRate: Math.round((performance.qualifiedCalls / performance.totalCalls) * 100),
          totalDuration: performance.totalDuration,
          averageDuration: Math.round(performance.totalDuration / performance.totalCalls),
          totalCost: Math.round(performance.totalCost * 100) / 100,
          lastCall: performance.lastCall
        } : {
          totalCalls: 0,
          successfulCalls: 0,
          qualifiedCalls: 0,
          successRate: 0,
          qualificationRate: 0,
          totalDuration: 0,
          averageDuration: 0,
          totalCost: 0,
          lastCall: null
        };

        return assistantObj;
      });
      
      res.json({ 
        assistants: assistantsWithData,
        summary: {
          totalAssistants: assistants.length,
          activeAssistants: assistants.filter(a => a.isActive).length,
          linkedAssistants: assistants.filter(a => a.clientId).length,
          unlinkedAssistants: assistants.filter(a => !a.clientId).length
        }
      });
    } catch (error) {
      console.error('Error fetching assistants:', error);
      res.status(500).json({ error: 'Failed to fetch assistants' });
    }
  }
);

// Sync Vapi assistants from Vapi platform
router.post('/sync-vapi-assistants',
  enhancedAuthMiddleware,
  requirePermission('manage_system'),
  async (req, res) => {
    try {
      console.log('Starting Vapi assistant sync...');
      
      // Fetch assistants from Vapi API
      const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!vapiResponse.ok) {
        const errorText = await vapiResponse.text();
        console.error('Vapi API error:', errorText);
        throw new Error(`Failed to fetch assistants from Vapi: ${vapiResponse.status}`);
      }

      const vapiAssistants = await vapiResponse.json();
      console.log(`Found ${vapiAssistants.length} assistants in Vapi`);

      let syncedCount = 0;
      let updatedCount = 0;
      const syncResults = [];

      for (const vapiAssistant of vapiAssistants) {
        try {
          // Check if assistant already exists
          const existingAssistant = await VapiAssistant.findOne({
            vapiAssistantId: vapiAssistant.id
          });

          if (existingAssistant) {
            // Update existing assistant
            existingAssistant.name = vapiAssistant.name || existingAssistant.name;
            existingAssistant.vapiPhoneNumber = vapiAssistant.phoneNumber?.number || existingAssistant.vapiPhoneNumber;
            existingAssistant.configuration = {
              ...existingAssistant.configuration,
              voiceModel: vapiAssistant.voice?.provider || existingAssistant.configuration?.voiceModel,
              language: vapiAssistant.voice?.language || existingAssistant.configuration?.language || 'en',
              personalityPrompt: vapiAssistant.model?.messages?.[0]?.content || existingAssistant.configuration?.personalityPrompt
            };
            existingAssistant.updatedAt = new Date();

            await existingAssistant.save();
            updatedCount++;
            
            syncResults.push({
              id: vapiAssistant.id,
              name: vapiAssistant.name,
              action: 'updated'
            });
          } else {
            // Create new assistant record
            const newAssistant = new VapiAssistant({
              vapiAssistantId: vapiAssistant.id,
              vapiPhoneNumber: vapiAssistant.phoneNumber?.number,
              name: vapiAssistant.name || `Assistant ${vapiAssistant.id}`,
              description: vapiAssistant.model?.messages?.[0]?.content,
              isActive: true,
              configuration: {
                voiceModel: vapiAssistant.voice?.provider,
                language: vapiAssistant.voice?.language || 'en',
                personalityPrompt: vapiAssistant.model?.messages?.[0]?.content,
                practiceArea: 'General', // Default, can be updated later
                maxCallDuration: 1800
              }
            });

            await newAssistant.save();
            syncedCount++;
            
            syncResults.push({
              id: vapiAssistant.id,
              name: vapiAssistant.name,
              action: 'created'
            });
          }
        } catch (assistantError) {
          console.error(`Error processing assistant ${vapiAssistant.id}:`, assistantError);
          syncResults.push({
            id: vapiAssistant.id,
            name: vapiAssistant.name,
            action: 'error',
            error: assistantError.message
          });
        }
      }

      console.log(`Sync completed: ${syncedCount} new, ${updatedCount} updated`);

      res.json({
        message: `Sync completed: ${syncedCount} new assistants created, ${updatedCount} existing assistants updated`,
        syncedCount,
        updatedCount,
        totalProcessed: vapiAssistants.length,
        results: syncResults
      });
    } catch (error) {
      console.error('Error syncing Vapi assistants:', error);
      res.status(500).json({ 
        error: 'Failed to sync Vapi assistants',
        details: error.message 
      });
    }
  }
);

// Get unlinked users (not associated with any client)
router.get('/unlinked-users',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const unlinkedUsers = await User.find({
        $or: [
          { 'voiceAI.clientId': { $exists: false } },
          { 'voiceAI.clientId': null },
          { 'voiceAI.isClientUser': false }
        ]
      }).select('firstName lastName email voiceAI createdAt');

      res.json({ users: unlinkedUsers });
    } catch (error) {
      console.error('Error fetching unlinked users:', error);
      res.status(500).json({ error: 'Failed to fetch unlinked users' });
    }
  }
);

// Get unlinked assistants (not associated with any client)
router.get('/unlinked-assistants',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const unlinkedAssistants = await VapiAssistant.find({
        $or: [
          { clientId: { $exists: false } },
          { clientId: null }
        ]
      });

      res.json({ assistants: unlinkedAssistants });
    } catch (error) {
      console.error('Error fetching unlinked assistants:', error);
      res.status(500).json({ error: 'Failed to fetch unlinked assistants' });
    }
  }
);

export default router;
```

## Step 2: Enhanced Frontend Components with Real Data

### Complete Client Management Component

```javascript
// src/components/Admin/ClientManagement.jsx - Complete implementation
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ClientManagement = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/clients', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.status}`);
      }

      const data = await response.json();
      setClients(data.clients || []);
      setSummary(data.summary || {});
    } catch (error) {
      console.error('Error loading clients:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAssistants = async () => {
    try {
      setSyncing(true);
      
      const response = await fetch('/api/admin/sync-vapi-assistants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to sync assistants');
      }

      const result = await response.json();
      alert(`${result.message}\n\nNew: ${result.syncedCount}\nUpdated: ${result.updatedCount}`);
      
      // Reload clients to show updated assistant data
      loadClients();
    } catch (error) {
      console.error('Error syncing assistants:', error);
      alert(`Failed to sync assistants: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading clients...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Clients</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadClients}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
            <p className="text-gray-600">Manage clients, users, and Vapi assistants</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncAssistants}
              disabled={syncing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Vapi Assistants'}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create New Client
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Clients"
            value={summary.totalClients || 0}
            icon="🏢"
            color="blue"
          />
          <SummaryCard
            title="Active Clients"
            value={summary.activeClients || 0}
            icon="✅"
            color="green"
          />
          <SummaryCard
            title="Client Users"
            value={summary.totalUsers || 0}
            icon="👥"
            color="purple"
          />
          <SummaryCard
            title="Assistants"
            value={summary.totalAssistants || 0}
            icon="🤖"
            color="orange"
          />
        </div>
      </div>

      {/* Clients Table */}
      {clients.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Clients</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assistants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance (30d)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <ClientRow 
                    key={client._id} 
                    client={client}
                    onEdit={() => setSelectedClient(client)}
                    onRefresh={loadClients}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first client or syncing Vapi assistants.</p>
          <div className="space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create First Client
            </button>
            <button
              onClick={handleSyncAssistants}
              disabled={syncing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Vapi Assistants'}
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || selectedClient) && (
        <ClientModal
          client={selectedClient}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedClient(null);
          }}
          onSave={() => {
            loadClients();
            setShowCreateModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const ClientRow = ({ client, onEdit, onRefresh }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {client.branding?.logoUrl && (
            <img 
              src={client.branding.logoUrl} 
              alt={client.companyName}
              className="h-10 w-10 rounded-lg mr-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {client.companyName || client.name}
            </div>
            <div className="text-sm text-gray-500">{client.email}</div>
            <div className="text-xs text-gray-400">
              Created: {formatDate(client.createdAt)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {client.linkedUsers?.length || 0} user{(client.linkedUsers?.length || 0) !== 1 ? 's' : ''}
        </div>
        {client.linkedUsers && client.linkedUsers.length > 0 && (
          <div className="text-xs text-gray-500 max-w-xs truncate">
            {client.linkedUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {client.linkedAssistants?.length || 0} assistant{(client.linkedAssistants?.length || 0) !== 1 ? 's' : ''}
        </div>
        {client.linkedAssistants && client.linkedAssistants.length > 0 && (
          <div className="text-xs text-gray-500 max-w-xs">
            {client.linkedAssistants.map(a => (
              <div key={a._id} className="truncate">
                {a.name} ({a.vapiPhoneNumber})
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {client.stats?.totalCalls || 0} calls
        </div>
        <div className="text-xs text-gray-500">
          {client.stats?.qualifiedCalls || 0} qualified ({client.stats?.qualificationRate || 0}%)
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          client.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : client.status === 'trial'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {client.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-900"
        >
          Edit
        </button>
        <button
          onClick={() => window.open(`/client/${client._id}/dashboard`, '_blank')}
          className="text-green-600 hover:text-green-900"
        >
          Dashboard
        </button>
      </td>
    </tr>
  );
};

export default ClientManagement;
```

## Step 3: Enhanced Client Modal with Real Data Loading

```javascript
// src/components/Admin/ClientModal.jsx - Complete implementation with data loading
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ClientModal = ({ client, onClose, onSave }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    status: 'trial',
    branding: {
      logoUrl: '',
      primaryColor: '#3B82F6',
      companyWebsite: ''
    }
  });
  
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [linkedAssistants, setLinkedAssistants] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadModalData();
  }, [client]);

  const loadModalData = async () => {
    try {
      setDataLoading(true);
      
      // Load available users and assistants
      const [usersResponse, assistantsResponse] = await Promise.all([
        fetch('/api/admin/unlinked-users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/unlinked-assistants', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usersData = await usersResponse.json();
      const assistantsData = await assistantsResponse.json();

      if (client) {
        // Editing existing client
        setFormData({
          name: client.name || '',
          companyName: client.companyName || '',
          email: client.email || '',
          phone: client.phone || '',
          status: client.status || 'trial',
          branding: {
            logoUrl: client.branding?.logoUrl || '',
            primaryColor: client.branding?.primaryColor || '#3B82F6',
            companyWebsite: client.branding?.companyWebsite || ''
          }
        });
        
        setLinkedUsers(client.linkedUsers || []);
        setLinkedAssistants(client.linkedAssistants || []);
        setAvailableUsers(usersData.users || []);
        setAvailableAssistants(assistantsData.assistants || []);
      } else {
        // Creating new client
        setLinkedUsers([]);
        setLinkedAssistants([]);
        setAvailableUsers(usersData.users || []);
        setAvailableAssistants(assistantsData.assistants || []);
      }
    } catch (error) {
      console.error('Error loading modal data:', error);
      alert('Failed to load user and assistant data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const clientData = {
        ...formData,
        linkedUsers: linkedUsers.map(u => u._id),
        linkedAssistants: linkedAssistants.map(a => a._id)
      };

      const url = client ? `/api/admin/clients/${client._id}` : '/api/admin/clients';
      const method = client ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save client');
      }

      const result = await response.json();
      alert(result.message || 'Client saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving client:', error);
      alert(`Failed to save client: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addUserToClient = (user) => {
    setLinkedUsers([...linkedUsers, user]);
    setAvailableUsers(availableUsers.filter(u => u._id !== user._id));
  };

  const removeUserFromClient = (user) => {
    setLinkedUsers(linkedUsers.filter(u => u._id !== user._id));
    setAvailableUsers([...availableUsers, user]);
  };

  const addAssistantToClient = (assistant) => {
    setLinkedAssistants([...linkedAssistants, assistant]);
    setAvailableAssistants(availableAssistants.filter(a => a._id !== assistant._id));
  };

  const removeAssistantFromClient = (assistant) => {
    setLinkedAssistants(linkedAssistants.filter(a => a._id !== assistant._id));
    setAvailableAssistants([...availableAssistants, assistant]);
  };

  if (dataLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {client ? 'Edit Client' : 'Create New Client'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Client Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ABC Personal Injury Law"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@abclaw.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Branding Section */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Branding</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.branding.logoUrl}
                    onChange={(e) => setFormData({
                      ...formData, 
                      branding: {...formData.branding, logoUrl: e.target.value}
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.branding.primaryColor}
                      onChange={(e) => setFormData({
                        ...formData, 
                        branding: {...formData.branding, primaryColor: e.target.value}
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.branding.primaryColor}
                      onChange={(e) => setFormData({
                        ...formData, 
                        branding: {...formData.branding, primaryColor: e.target.value}
                      })}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={formData.branding.companyWebsite}
                    onChange={(e) => setFormData({
                      ...formData, 
                      branding: {...formData.branding, companyWebsite: e.target.value}
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.abclaw.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User and Assistant Linking */}
          <div className="space-y-6">
            {/* Linked Users Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Linked Users</h4>
              
              {linkedUsers.length > 0 ? (
                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {linkedUsers.map(user => (
                    <div key={user._id} className="flex items-center justify-between bg-blue-50 p-2 rounded border">
                      <span className="text-sm">
                        {user.firstName} {user.lastName} ({user.email})
                      </span>
                      <button
                        onClick={() => removeUserFromClient(user)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-3 italic">No users linked</p>
              )}

              {availableUsers.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add User
                  </label>
                  <select
                    onChange={(e) => {
                      const user = availableUsers.find(u => u._id === e.target.value);
                      if (user) {
                        addUserToClient(user);
                        e.target.value = '';
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No available users to link</p>
              )}
            </div>

            {/* Linked Assistants Section */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Linked Vapi Assistants</h4>
              
              {linkedAssistants.length > 0 ? (
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {linkedAssistants.map(assistant => (
                    <div key={assistant._id} className="flex items-center justify-between bg-green-50 p-2 rounded border">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {assistant.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {assistant.vapiPhoneNumber} • {assistant.vapiAssistantId}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAssistantFromClient(assistant)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-3 italic">No assistants linked</p>
              )}

              {availableAssistants.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Vapi Assistant
                  </label>
                  <select
                    onChange={(e) => {
                      const assistant = availableAssistants.find(a => a._id === e.target.value);
                      if (assistant) {
                        addAssistantToClient(assistant);
                        e.target.value = '';
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an assistant...</option>
                    {availableAssistants.map(assistant => (
                      <option key={assistant._id} value={assistant._id}>
                        {assistant.name} ({assistant.vapiPhoneNumber || 'No phone'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">No available assistants to link</p>
              )}

              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> To add new Vapi assistants, first create them in your Vapi dashboard, 
                  then use the "Sync Vapi Assistants" button in the main admin panel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !formData.companyName || !formData.name || !formData.email}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
```

## Step 4: Environment Variables Setup

```bash
# Add to your .env file
VAPI_API_KEY=your_vapi_api_key_here
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Step 5: Initial Setup Steps

### 1. **First Time Setup**
```bash
# 1. Make sure your MongoDB is running
# 2. Add the environment variables
# 3. Start your backend server
# 4. Go to the admin interface
```

### 2. **Sync Vapi Assistants**
```
1. Go to /admin/clients
2. Click "Sync Vapi Assistants" button
3. This will import all assistants from your Vapi dashboard
4. You should now see assistants available for linking
```

### 3. **Create Your First Client**
```
1. Click "Create New Client"
2. Fill in client information
3. Link users and assistants
4. Save the client
5. Test the client dashboard
```

## Step 6: Testing the Setup

### Verify Everything Works
1. **Check Admin Interface**: Should show clients, users, and assistants
2. **Test Sync**: Sync button should import your Vapi assistants
3. **Create Client**: Should be able to link users and assistants
4. **View Dashboard**: Client dashboard should show their data only

### Troubleshooting
- **No assistants showing**: Run the sync first
- **No users available**: Make sure users exist in your system
- **API errors**: Check your VAPI_API_KEY is correct
- **Database errors**: Verify MongoDB connection

This complete setup will give you a fully functional admin interface that displays real client and assistant information!

