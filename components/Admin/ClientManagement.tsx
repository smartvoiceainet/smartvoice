"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IClient } from '@/models/Client';
import { IUser } from '@/models/User';
import { IVapiAssistant as IAssistant } from '@/models/VapiAssistant';
import { ClientModal } from './ClientModal';

export const ClientManagement = () => {
  const { data: session } = useSession();
  const [clients, setClients] = useState<IClient[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [assistants, setAssistants] = useState<IAssistant[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
    loadUsers();
    loadAssistants();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/voice-ai/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get('/api/voice-ai/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAssistants = async () => {
    try {
      const response = await axios.get('/api/voice-ai/assistants');
      setAssistants(response.data.assistants || []);
    } catch (error) {
      console.error('Error loading assistants:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="spinner">Loading...</div></div>;
  }

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
            {clients.filter(client => client && client._id).map((client) => (
              <ClientRow 
                key={client._id?.toString() || `client-${Math.random()}`} 
                client={client}
                users={users.filter(u => u.clientId?.toString() === client._id?.toString())}
                assistants={assistants.filter(a => a.clientId?.toString() === client._id?.toString())}
                onEdit={() => setSelectedClient(client)}
                onRefresh={loadClients}
              />
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No clients found. Create your first client to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || selectedClient) && (
        <ClientModal
          client={selectedClient}
          users={users}
          vapiAssistants={assistants}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedClient(null);
          }}
          onSave={() => {
            loadClients();
            loadUsers();
            loadAssistants();
            setShowCreateModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

interface ClientRowProps {
  client: IClient;
  users: IUser[];
  assistants: IAssistant[];
  onEdit: () => void;
  onRefresh: () => void;
}

const ClientRow = ({ client, users, assistants, onEdit, onRefresh }: ClientRowProps) => {
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
        {users.length > 0 && (
          <div className="text-xs text-gray-500">
            {users.map(u => `${u.firstName || ''} ${u.lastName || ''}`).join(', ')}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {assistants.length} assistant{assistants.length !== 1 ? 's' : ''}
        </div>
        {assistants.length > 0 && (
          <div className="text-xs text-gray-500">
            {assistants.map(a => a.name).join(', ')}
          </div>
        )}
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
