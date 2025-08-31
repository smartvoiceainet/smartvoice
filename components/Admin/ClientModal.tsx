"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IClient } from '@/models/Client';
import { IUser } from '@/models/User';
import { IVapiAssistant } from '@/models/VapiAssistant';
import { Dialog } from '@/components/ui/dialog';

interface ClientModalProps {
  client: IClient | null;
  users: IUser[];
  vapiAssistants: IVapiAssistant[];
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  status: string;
  branding: {
    logoUrl: string;
    primaryColor: string;
    companyWebsite: string;
  };
}

export const ClientModal = ({ client, users, vapiAssistants, onClose, onSave }: ClientModalProps) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
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
  
  const [linkedUsers, setLinkedUsers] = useState<IUser[]>([]);
  const [linkedAssistants, setLinkedAssistants] = useState<IVapiAssistant[]>([]);
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
  const [availableAssistants, setAvailableAssistants] = useState<IVapiAssistant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setLinkedUsers(users.filter(u => u.clientId?.toString() === client._id.toString()));
      setLinkedAssistants(vapiAssistants.filter(a => a.clientId?.toString() === client._id.toString()));
    }
    
    // Load available users (not linked to any client)
    setAvailableUsers(users.filter(u => !u.clientId));
    
    // Load available assistants (not linked to any client)
    setAvailableAssistants(vapiAssistants.filter(a => !a.clientId));
  }, [client, users, vapiAssistants]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!formData.companyName) {
        setError('Company name is required');
        setLoading(false);
        return;
      }
      
      const clientData = {
        ...formData,
        linkedUsers: linkedUsers.map(u => u._id),
        linkedAssistants: linkedAssistants.map(a => a._id)
      };

      const url = client ? `/api/voice-ai/clients/${client._id}` : '/api/voice-ai/clients';
      const method = client ? 'PUT' : 'POST';

      await axios({
        method,
        url,
        data: clientData
      });

      onSave();
    } catch (error) {
      console.error('Error saving client:', error);
      setError('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addUserToClient = (user: IUser) => {
    setLinkedUsers([...linkedUsers, user]);
    setAvailableUsers(availableUsers.filter(u => u._id !== user._id));
  };

  const removeUserFromClient = (user: IUser) => {
    setLinkedUsers(linkedUsers.filter(u => u._id !== user._id));
    setAvailableUsers([...availableUsers, user]);
  };

  const addAssistantToClient = (assistant: IVapiAssistant) => {
    setLinkedAssistants([...linkedAssistants, assistant]);
    setAvailableAssistants(availableAssistants.filter(a => a._id !== assistant._id));
  };

  const removeAssistantFromClient = (assistant: IVapiAssistant) => {
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Client Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="https://abclaw.com"
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
                    <div key={user._id.toString()} className="flex items-center justify-between bg-blue-50 p-2 rounded">
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    onChange={(e) => {
                      const userId = e.target.value;
                      if (userId) {
                        const selectedUser = availableUsers.find(u => u._id.toString() === userId);
                        if (selectedUser) {
                          addUserToClient(selectedUser);
                        }
                        e.target.value = ''; // Reset select
                      }
                    }}
                    value=""
                  >
                    <option value="">Select user to add</option>
                    {availableUsers.map(user => (
                      <option key={user._id.toString()} value={user._id.toString()}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Linked Assistants */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Linked Assistants</h4>
              
              {linkedAssistants.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {linkedAssistants.map(assistant => (
                    <div key={assistant._id.toString()} className="flex items-center justify-between bg-green-50 p-2 rounded">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{assistant.name}</span>
                        <span className="text-xs text-gray-500">Phone: {assistant.vapiPhoneNumber}</span>
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
                    Add Assistant
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    onChange={(e) => {
                      const assistantId = e.target.value;
                      if (assistantId) {
                        const selectedAssistant = availableAssistants.find(a => a._id.toString() === assistantId);
                        if (selectedAssistant) {
                          addAssistantToClient(selectedAssistant);
                        }
                        e.target.value = ''; // Reset select
                      }
                    }}
                    value=""
                  >
                    <option value="">Select assistant to add</option>
                    {availableAssistants.map(assistant => (
                      <option key={assistant._id.toString()} value={assistant._id.toString()}>
                        {assistant.name} (Phone: {assistant.vapiPhoneNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
