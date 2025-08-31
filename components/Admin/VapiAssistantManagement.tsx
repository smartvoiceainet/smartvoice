"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IVapiAssistant } from '@/models/VapiAssistant';
import { IClient } from '@/models/Client';
import { VapiAssistantModal } from './VapiAssistantModal';

export const VapiAssistantManagement = () => {
  const { data: session } = useSession();
  const [assistants, setAssistants] = useState<IVapiAssistant[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<IVapiAssistant | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ 
    success?: boolean; 
    message?: string; 
    warnings?: Array<{severity: string; message: string; fix: string}>
  } | null>(null);

  useEffect(() => {
    loadAssistants();
    loadClients();
  }, []);

  const loadAssistants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/voice-ai/assistants');
      setAssistants(response.data.assistants || []);
    } catch (error) {
      console.error('Error loading assistants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await axios.get('/api/voice-ai/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleDelete = async (assistantId: string) => {
    if (!window.confirm('Are you sure you want to delete this assistant? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`/api/voice-ai/assistants/${assistantId}`);
      loadAssistants();
    } catch (error) {
      console.error('Error deleting assistant:', error);
      alert('Failed to delete assistant. Please try again.');
    }
  };

  const syncAssistants = async () => {
    setSyncLoading(true);
    setSyncStatus(null);
    
    try {
      const response = await axios.post('/api/voice-ai/assistants/sync');
      
      // Handle successful response with potential warnings
      setSyncStatus({ 
        success: true, 
        message: response.data.message || `Successfully synced ${response.data.count} assistants`,
        warnings: response.data.warnings // Include any warnings from the API
      });
      
      // Reload assistants after successful sync
      await loadAssistants();
    } catch (error) {
      console.error('Error syncing assistants with Vapi:', error);
      
      // Extract detailed error information if available
      const errorResponse = error.response?.data;
      
      setSyncStatus({ 
        success: false, 
        message: errorResponse?.message || errorResponse?.error || 'Failed to sync assistants with Vapi',
        warnings: errorResponse?.issues // Include any configuration issues
      });
    } finally {
      setSyncLoading(false);
      
      // Clear success status after 5 seconds, keep error messages until dismissed
      if (syncStatus?.success) {
        setTimeout(() => setSyncStatus(null), 5000);
      }
    }
  };

  if (loading && assistants.length === 0) {
    return <div className="flex justify-center p-8"><div className="spinner">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vapi Assistant Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={syncAssistants}
            disabled={syncLoading}
            className={`flex items-center px-4 py-2 rounded-lg ${syncLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {syncLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync with Vapi
              </>
            )}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create New Assistant
          </button>
        </div>
      </div>
      
      {/* Sync Status Message */}
      {syncStatus && (
        <div className={`p-4 rounded-md ${syncStatus.success ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {syncStatus.success ? (
                <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 w-full">
              <h3 className={`text-sm font-medium ${syncStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                {syncStatus.success ? 'Success' : 'Error'}
              </h3>
              <div className={`mt-1 text-sm ${syncStatus.success ? 'text-green-700' : 'text-red-700'}`}>
                <p>{syncStatus.message}</p>
              </div>
              
              {/* Display warnings */}
              {syncStatus.warnings && syncStatus.warnings.length > 0 && (
                <div className="mt-3 border-t border-yellow-200 pt-3">
                  <h4 className="text-sm font-medium text-yellow-800">Configuration Warnings</h4>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-yellow-700">
                    {syncStatus.warnings.map((warning, idx) => (
                      <li key={idx}>
                        <p>{warning.message}</p>
                        {warning.fix && (
                          <p className="text-xs italic mt-1">Fix: {warning.fix}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Dismiss button for errors only */}
              {!syncStatus.success && (
                <div className="mt-4">
                  <button 
                    type="button" 
                    onClick={() => setSyncStatus(null)}
                    className="text-sm font-medium text-red-700 hover:text-red-900 focus:outline-none"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assistants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assistant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Client
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
            {assistants.filter(assistant => assistant && assistant._id).map((assistant) => {
              // Find the client for this assistant
              const client = clients.find(c => c && c._id && assistant.clientId && c._id.toString() === assistant.clientId.toString());
              
              return (
                <tr key={assistant._id?.toString() || `assistant-${Math.random()}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assistant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assistant.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assistant.vapiPhoneNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {assistant.vapiAssistantId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {client ? (
                      <div className="text-sm text-gray-900">
                        {client.companyName || client.name}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      assistant.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assistant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedAssistant(assistant)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assistant._id.toString())}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {assistants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No assistants found. Create your first assistant to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || selectedAssistant) && (
        <VapiAssistantModal
          assistant={selectedAssistant}
          clients={clients}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedAssistant(null);
          }}
          onSave={() => {
            loadAssistants();
            loadClients();
            setShowCreateModal(false);
            setSelectedAssistant(null);
          }}
        />
      )}
    </div>
  );
};

export default VapiAssistantManagement;
