"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IVapiAssistant } from '@/models/VapiAssistant';
import { IClient } from '@/models/Client';

interface VapiAssistantModalProps {
  assistant: IVapiAssistant | null;
  clients: IClient[];
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  description: string;
  vapiPhoneNumber: string;
  vapiAssistantId: string;
  clientId: string | null;
  isActive: boolean;
  configuration: {
    voiceModel: string;
    language?: string;
    personalityPrompt?: string;
    practiceArea?: string;
    maxCallDuration?: number;
  }
}

export const VapiAssistantModal = ({ assistant, clients, onClose, onSave }: VapiAssistantModalProps) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    vapiPhoneNumber: '',
    vapiAssistantId: '',
    clientId: null,
    isActive: true,
    configuration: {
      voiceModel: 'nova',
      language: 'en-US',
      personalityPrompt: 'You are a helpful assistant.',
      maxCallDuration: 300
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assistant) {
      setFormData({
        name: assistant.name || '',
        description: assistant.description || '',
        vapiPhoneNumber: assistant.vapiPhoneNumber || '',
        vapiAssistantId: assistant.vapiAssistantId || '',
        clientId: assistant.clientId ? assistant.clientId.toString() : null,
        isActive: assistant.isActive !== undefined ? assistant.isActive : true,
        configuration: {
          voiceModel: assistant.configuration?.voiceModel || 'nova',
          language: assistant.configuration?.language || 'en-US',
          personalityPrompt: assistant.configuration?.personalityPrompt || 'You are a helpful assistant.',
          maxCallDuration: assistant.configuration?.maxCallDuration || 300
        }
      });
    }
  }, [assistant]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!formData.name || !formData.vapiPhoneNumber || !formData.vapiAssistantId) {
        setError('Name, phone number, and Vapi assistant ID are required');
        setLoading(false);
        return;
      }
      
      const assistantData = {
        ...formData
      };

      const url = assistant ? `/api/voice-ai/assistants/${assistant._id}` : '/api/voice-ai/assistants';
      const method = assistant ? 'PUT' : 'POST';

      await axios({
        method,
        url,
        data: assistantData
      });

      onSave();
    } catch (error) {
      console.error('Error saving assistant:', error);
      setError('Failed to save assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {assistant ? 'Edit Assistant' : 'Create New Assistant'}
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

        <div className="space-y-4">
          {/* Assistant Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assistant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Customer Service Assistant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
              placeholder="Describe the purpose and capabilities of this assistant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vapi Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.vapiPhoneNumber}
              onChange={(e) => setFormData({...formData, vapiPhoneNumber: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="+1 (555) 123-4567"
            />
            <p className="text-xs text-gray-500 mt-1">The phone number provided by Vapi</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vapi Assistant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vapiAssistantId}
              onChange={(e) => setFormData({...formData, vapiAssistantId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="asst_123abc456def"
            />
            <p className="text-xs text-gray-500 mt-1">The unique ID from the Vapi dashboard</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Client
            </label>
            <select
              value={formData.clientId || ''}
              onChange={(e) => setFormData({
                ...formData, 
                clientId: e.target.value ? e.target.value : null
              })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Not assigned to any client</option>
              {clients.filter(client => client && client._id).map(client => (
                <option key={client._id?.toString() || `client-${Math.random()}`} value={client._id?.toString() || ""}>
                  {client.companyName || client.name || "Unknown Client"}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Link this assistant to a specific client
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active (available for calls)
            </label>
          </div>

          {/* Assistant Configuration */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-medium mb-3">Assistant Configuration</h4>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personality Prompt
              </label>
              <textarea
                value={formData.configuration.personalityPrompt || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  configuration: {...formData.configuration, personalityPrompt: e.target.value}
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px]"
                placeholder="You are a helpful assistant."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Voice Model
              </label>
              <select
                value={formData.configuration.voiceModel}
                onChange={(e) => setFormData({
                  ...formData, 
                  configuration: {...formData.configuration, voiceModel: e.target.value}
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="nova">Nova</option>
                <option value="shimmer">Shimmer</option>
                <option value="echo">Echo</option>
                <option value="fable">Fable</option>
                <option value="onyx">Onyx</option>
              </select>
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
            {loading ? 'Saving...' : assistant ? 'Update Assistant' : 'Create Assistant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VapiAssistantModal;
