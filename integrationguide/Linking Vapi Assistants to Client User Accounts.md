# Linking Vapi Assistants to Client User Accounts

**Author:** Manus AI  
**Date:** June 29, 2025  
**Version:** 1.0

## Overview

This guide shows you exactly how to link Vapi assistants to client user accounts in your dashboard, creating a seamless connection between your clients and their dedicated AI assistants.

## Database Relationship Structure

### MongoDB Schema Relationships

```javascript
// User Collection (Enhanced)
{
  _id: ObjectId("user123"),
  email: "john@lawfirm.com",
  firstName: "John",
  lastName: "Smith",
  // ... existing fields ...
  
  voiceAI: {
    role: "client", // or "admin", "attorney", etc.
    hasVoiceAIAccess: true,
    clientId: ObjectId("client456"), // Links to Client collection
    isClientUser: true,
    permissions: ["view_analytics", "view_calls"]
  }
}

// Client Collection
{
  _id: ObjectId("client456"),
  name: "ABC Personal Injury Law",
  companyName: "ABC Personal Injury Law",
  email: "contact@abclaw.com",
  // ... other client fields ...
}

// Vapi Assistant Collection
{
  _id: ObjectId("assistant789"),
  vapiAssistantId: "asst_vapi_12345", // From Vapi platform
  vapiPhoneNumber: "+1234567890",
  clientId: ObjectId("client456"), // Links to Client collection
  name: "ABC Law Assistant",
  // ... other assistant fields ...
}
```

## Step-by-Step Linking Process

### Step 1: Admin Interface for Client Management

```javascript
// src/components/Admin/ClientManagement.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ClientManagement = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [vapiAssistants, setVapiAssistants] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    loadClients();
    loadUsers();
    loadVapiAssistants();
  }, []);

  const loadClients = async () => {
    try {
      const response = await fetch('/api/admin/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setClients(data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadVapiAssistants = async () => {
    try {
      const response = await fetch('/api/admin/vapi-assistants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVapiAssistants(data.assistants || []);
    } catch (error) {
      console.error('Error loading assistants:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                users={users.filter(u => u.voiceAI?.clientId === client._id)}
                assistants={vapiAssistants.filter(a => a.clientId === client._id)}
                onEdit={() => setSelectedClient(client)}
                onRefresh={loadClients}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || selectedClient) && (
        <ClientModal
          client={selectedClient}
          users={users}
          vapiAssistants={vapiAssistants}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedClient(null);
          }}
          onSave={() => {
            loadClients();
            loadUsers();
            setShowCreateModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

const ClientRow = ({ client, users, assistants, onEdit, onRefresh }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">
            {client.companyName || client.name}
          </div>
          <div className="text-sm text-gray-500">{client.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {users.length} user{users.length !== 1 ? 's' : ''}
        </div>
        <div className="text-xs text-gray-500">
          {users.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {assistants.length} assistant{assistants.length !== 1 ? 's' : ''}
        </div>
        <div className="text-xs text-gray-500">
          {assistants.map(a => a.name).join(', ')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {client.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-900 mr-3"
        >
          Edit
        </button>
        <button
          onClick={() => window.open(`/client/${client._id}/dashboard`, '_blank')}
          className="text-green-600 hover:text-green-900"
        >
          View Dashboard
        </button>
      </td>
    </tr>
  );
};

export default ClientManagement;
```

### Step 2: Client Creation/Editing Modal

```javascript
// src/components/Admin/ClientModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ClientModal = ({ client, users, vapiAssistants, onClose, onSave }) => {
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

  useEffect(() => {
    if (client) {
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
      
      // Load linked users and assistants
      setLinkedUsers(users.filter(u => u.voiceAI?.clientId === client._id));
      setLinkedAssistants(vapiAssistants.filter(a => a.clientId === client._id));
    }
    
    // Load available users (not linked to any client)
    setAvailableUsers(users.filter(u => !u.voiceAI?.clientId));
    
    // Load available assistants (not linked to any client)
    setAvailableAssistants(vapiAssistants.filter(a => !a.clientId));
  }, [client, users, vapiAssistants]);

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
        throw new Error('Failed to save client');
      }

      onSave();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {client ? 'Edit Client' : 'Create New Client'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="ABC Personal Injury Law"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="contact@abclaw.com"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Branding */}
            <h4 className="font-medium text-gray-900 mt-6">Branding</h4>
            
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.branding.primaryColor}
                onChange={(e) => setFormData({
                  ...formData, 
                  branding: {...formData.branding, primaryColor: e.target.value}
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-10"
              />
            </div>
          </div>

          {/* User and Assistant Linking */}
          <div className="space-y-6">
            {/* Linked Users */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Linked Users</h4>
              
              {linkedUsers.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {linkedUsers.map(user => (
                    <div key={user._id} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                      <span className="text-sm">
                        {user.firstName} {user.lastName} ({user.email})
                      </span>
                      <button
                        onClick={() => removeUserFromClient(user)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-3">No users linked</p>
              )}

              {availableUsers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add User
                  </label>
                  <select
                    onChange={(e) => {
                      const user = availableUsers.find(u => u._id === e.target.value);
                      if (user) addUserToClient(user);
                      e.target.value = '';
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Linked Assistants */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Linked Vapi Assistants</h4>
              
              {linkedAssistants.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {linkedAssistants.map(assistant => (
                    <div key={assistant._id} className="flex items-center justify-between bg-green-50 p-2 rounded">
                      <div>
                        <div className="text-sm font-medium">{assistant.name}</div>
                        <div className="text-xs text-gray-500">
                          {assistant.vapiPhoneNumber} • {assistant.vapiAssistantId}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAssistantFromClient(assistant)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-3">No assistants linked</p>
              )}

              {availableAssistants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Vapi Assistant
                  </label>
                  <select
                    onChange={(e) => {
                      const assistant = availableAssistants.find(a => a._id === e.target.value);
                      if (assistant) addAssistantToClient(assistant);
                      e.target.value = '';
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select an assistant...</option>
                    {availableAssistants.map(assistant => (
                      <option key={assistant._id} value={assistant._id}>
                        {assistant.name} ({assistant.vapiPhoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> To add new Vapi assistants, first create them in your Vapi dashboard, 
                  then sync them using the "Sync Vapi Assistants" button in the admin panel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

### Step 3: Backend API Endpoints

```javascript
// src/routes/adminRoutes.js - Admin endpoints for client management
import express from 'express';
import { User, Client, VapiAssistant } from '../models/index.js';
import { enhancedAuthMiddleware, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all clients
router.get('/clients', 
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const clients = await Client.find().sort({ createdAt: -1 });
      res.json({ clients });
    } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  }
);

// Create new client
router.post('/clients',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const { linkedUsers, linkedAssistants, ...clientData } = req.body;

      // Create client
      const client = new Client(clientData);
      await client.save();

      // Link users to client
      if (linkedUsers && linkedUsers.length > 0) {
        await User.updateMany(
          { _id: { $in: linkedUsers } },
          {
            $set: {
              'voiceAI.clientId': client._id,
              'voiceAI.isClientUser': true,
              'voiceAI.hasVoiceAIAccess': true,
              'voiceAI.role': 'client',
              'voiceAI.permissions': ['view_analytics', 'view_calls']
            }
          }
        );
      }

      // Link assistants to client
      if (linkedAssistants && linkedAssistants.length > 0) {
        await VapiAssistant.updateMany(
          { _id: { $in: linkedAssistants } },
          { $set: { clientId: client._id } }
        );
      }

      res.status(201).json({ 
        message: 'Client created successfully',
        client 
      });
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ error: 'Failed to create client' });
    }
  }
);

// Update client
router.put('/clients/:clientId',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const { clientId } = req.params;
      const { linkedUsers, linkedAssistants, ...clientData } = req.body;

      // Update client
      const client = await Client.findByIdAndUpdate(
        clientId,
        clientData,
        { new: true }
      );

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      // Remove all existing user links for this client
      await User.updateMany(
        { 'voiceAI.clientId': clientId },
        {
          $unset: { 'voiceAI.clientId': 1 },
          $set: { 'voiceAI.isClientUser': false }
        }
      );

      // Add new user links
      if (linkedUsers && linkedUsers.length > 0) {
        await User.updateMany(
          { _id: { $in: linkedUsers } },
          {
            $set: {
              'voiceAI.clientId': client._id,
              'voiceAI.isClientUser': true,
              'voiceAI.hasVoiceAIAccess': true,
              'voiceAI.role': 'client',
              'voiceAI.permissions': ['view_analytics', 'view_calls']
            }
          }
        );
      }

      // Remove all existing assistant links for this client
      await VapiAssistant.updateMany(
        { clientId: clientId },
        { $unset: { clientId: 1 } }
      );

      // Add new assistant links
      if (linkedAssistants && linkedAssistants.length > 0) {
        await VapiAssistant.updateMany(
          { _id: { $in: linkedAssistants } },
          { $set: { clientId: client._id } }
        );
      }

      res.json({ 
        message: 'Client updated successfully',
        client 
      });
    } catch (error) {
      console.error('Error updating client:', error);
      res.status(500).json({ error: 'Failed to update client' });
    }
  }
);

// Get all users
router.get('/users',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const users = await User.find()
        .select('firstName lastName email voiceAI createdAt')
        .populate('voiceAI.clientId', 'name companyName')
        .sort({ createdAt: -1 });
      
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Get all Vapi assistants
router.get('/vapi-assistants',
  enhancedAuthMiddleware,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const assistants = await VapiAssistant.find()
        .populate('clientId', 'name companyName')
        .sort({ createdAt: -1 });
      
      res.json({ assistants });
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
      // Fetch assistants from Vapi API
      const vapiResponse = await fetch('https://api.vapi.ai/assistant', {
        headers: {
          'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!vapiResponse.ok) {
        throw new Error('Failed to fetch assistants from Vapi');
      }

      const vapiAssistants = await vapiResponse.json();
      let syncedCount = 0;

      for (const vapiAssistant of vapiAssistants) {
        // Check if assistant already exists
        const existingAssistant = await VapiAssistant.findOne({
          vapiAssistantId: vapiAssistant.id
        });

        if (!existingAssistant) {
          // Create new assistant record
          const newAssistant = new VapiAssistant({
            vapiAssistantId: vapiAssistant.id,
            vapiPhoneNumber: vapiAssistant.phoneNumber?.number,
            name: vapiAssistant.name || `Assistant ${vapiAssistant.id}`,
            description: vapiAssistant.model?.messages?.[0]?.content,
            configuration: {
              voiceModel: vapiAssistant.voice?.provider,
              language: vapiAssistant.voice?.language || 'en',
              personalityPrompt: vapiAssistant.model?.messages?.[0]?.content
            }
          });

          await newAssistant.save();
          syncedCount++;
        }
      }

      res.json({
        message: `Synced ${syncedCount} new assistants from Vapi`,
        syncedCount
      });
    } catch (error) {
      console.error('Error syncing Vapi assistants:', error);
      res.status(500).json({ error: 'Failed to sync Vapi assistants' });
    }
  }
);

export default router;
```

### Step 4: Client Dashboard Access

```javascript
// src/components/ClientPortal/ClientDashboardWrapper.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ClientDashboard from './ClientDashboard';

const ClientDashboardWrapper = () => {
  const { clientId } = useParams();
  const { user, token } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      
      // Check if user has access to this client
      const hasAccess = 
        user?.voiceAI?.role === 'admin' || 
        user?.voiceAI?.clientId === clientId;

      if (!hasAccess) {
        setError('Access denied to this client dashboard');
        return;
      }

      const response = await fetch(`/api/client/${clientId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load client data');
      }

      const data = await response.json();
      setClientData(data.client);
    } catch (error) {
      console.error('Error loading client data:', error);
      setError(error.message);
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-2">Access Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Client-specific styling */}
      <style>
        {`
          :root {
            --client-primary-color: ${clientData?.branding?.primaryColor || '#3B82F6'};
          }
        `}
      </style>
      
      <ClientDashboard 
        clientId={clientId} 
        clientData={clientData}
      />
    </div>
  );
};

export default ClientDashboardWrapper;
```

### Step 5: Navigation and Access Control

```javascript
// Add to your existing App.js routing
import ClientDashboardWrapper from './components/ClientPortal/ClientDashboardWrapper';
import ClientManagement from './components/Admin/ClientManagement';

// Add these routes to your existing router
<Route 
  path="/admin/clients" 
  element={
    <ProtectedRoute requiredPermission="manage_users">
      <ClientManagement />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/client/:clientId/dashboard" 
  element={
    <ProtectedRoute requiredPermission="view_analytics">
      <ClientDashboardWrapper />
    </ProtectedRoute>
  } 
/>

// Enhanced ProtectedRoute component
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user } = useAuth();
  
  if (!user?.voiceAI?.hasVoiceAIAccess) {
    return <VoiceAIAccessRequest />;
  }
  
  if (requiredPermission && !user?.voiceAI?.permissions?.includes(requiredPermission)) {
    return <AccessDenied />;
  }
  
  return children;
};
```

## Complete Workflow

### 1. **Admin Creates Client**
- Admin goes to `/admin/clients`
- Clicks "Create New Client"
- Fills in client information and branding
- Links existing users to the client
- Links Vapi assistants to the client
- Saves the client

### 2. **User Gets Client Access**
- User account is automatically updated with:
  - `voiceAI.clientId` set to the client ID
  - `voiceAI.isClientUser` set to true
  - `voiceAI.hasVoiceAIAccess` set to true
  - Appropriate permissions granted

### 3. **Assistant Gets Linked**
- Vapi assistant record is updated with:
  - `clientId` set to the client ID
  - All calls from this assistant are automatically associated with the client

### 4. **Client Accesses Dashboard**
- User logs in with their existing Google/email auth
- Navigates to `/client/{clientId}/dashboard`
- Sees their branded dashboard with data from their linked assistants
- All analytics are filtered to show only their data

### 5. **Data Flow**
- Vapi webhooks receive call data
- Calls are automatically associated with the correct client based on assistant
- Analytics are calculated per client
- Users see only their client's data

This creates a complete system where each client has their own branded dashboard showing analytics for their specific Vapi assistants, while maintaining secure data isolation between clients!

