"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { IClient } from '@/models/Client';

interface Assistant {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const AssistantManagement = () => {
  const { data: session } = useSession();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title text-2xl">Voice Assistants</h2>
            <div>
              <button
                className="btn btn-primary"
                onClick={() => alert("Feature coming soon")}
              >
                Add New Assistant
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center my-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : assistants.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📣</div>
              <h3 className="text-xl font-semibold mb-2">No assistants found</h3>
              <p className="text-base-content/70">
                Assistants will appear here when they are created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assistants.map((assistant) => (
                    <tr key={assistant._id}>
                      <td>{assistant.name}</td>
                      <td>{assistant.description || "No description"}</td>
                      <td>{new Date(assistant.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => alert("Edit feature coming soon")}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-error btn-outline"
                            onClick={() => alert("Delete feature coming soon")}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Configuration</h2>
          <p className="py-4 text-base-content/70">
            Voice assistant integration is being reconfigured. The management interface will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantManagement;
