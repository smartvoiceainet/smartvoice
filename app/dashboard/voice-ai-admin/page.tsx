'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/models/User';
import VoiceAIProtectedFeature from '@/components/VoiceAIProtectedFeature';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  hasVoiceAiAccess: boolean;
  isVoiceAiEnabled: boolean;
  createdAt: string;
  lastLogin: string | null;
}

const VoiceAIAdminPage = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Map<string, { role: UserRole, grant: boolean }>>(new Map());
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/voice-ai/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = (userId: string, role: UserRole) => {
    const currentChanges = new Map(pendingChanges);
    const userChanges = currentChanges.get(userId) || { 
      role, 
      grant: users.find(u => u.id === userId)?.isVoiceAiEnabled || false 
    };
    
    currentChanges.set(userId, { ...userChanges, role });
    setPendingChanges(currentChanges);
  };

  // Handle grant access change
  const handleGrantChange = (userId: string, grant: boolean) => {
    const currentChanges = new Map(pendingChanges);
    const userChanges = currentChanges.get(userId) || { 
      role: users.find(u => u.id === userId)?.role || UserRole.USER, 
      grant 
    };
    
    currentChanges.set(userId, { ...userChanges, grant });
    setPendingChanges(currentChanges);
  };

  // Apply changes for a specific user
  const applyChanges = async (userId: string) => {
    const changes = pendingChanges.get(userId);
    if (!changes) return;

    try {
      setProcessingUsers(prev => new Set(prev).add(userId));
      
      const response = await fetch(`/api/voice-ai/admin/users/${userId}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: changes.role,
          grant: changes.grant
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Access updated:', data);
        
        // Update user in the list
        setUsers(prevUsers => prevUsers.map(user => 
          user.id === userId 
            ? {
                ...user, 
                role: data.user.role,
                isVoiceAiEnabled: data.user.isVoiceAiEnabled,
                hasVoiceAiAccess: data.user.hasVoiceAiAccess
              }
            : user
        ));
        
        // Remove from pending changes
        const newChanges = new Map(pendingChanges);
        newChanges.delete(userId);
        setPendingChanges(newChanges);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update user access');
      }
    } catch (err) {
      setError('An error occurred while updating user access');
      console.error(err);
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  // Filter users based on selected filter
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'pending') return user.role === UserRole.PENDING;
    if (filter === 'active') return user.hasVoiceAiAccess;
    return true;
  });

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <VoiceAIProtectedFeature requiredPermission="manage_users">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Voice AI Administration</h1>

        {/* Management Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 4V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium">Voice Assistant Management</h3>
              </div>
              <p className="mt-4 text-gray-600">
                Configure, sync and manage voice assistants. Run diagnostics to troubleshoot integration issues.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/voice-ai-admin/assistant-management" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Manage Assistants
                  <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button className="btn btn-sm" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">User Access Management</h2>
          <p className="mb-4 text-gray-600">Manage user roles and voice AI access permissions for your organization.</p>
        </div>
        
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="tabs tabs-boxed">
            <button 
              className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Users
            </button>
            <button 
              className={`tab ${filter === 'pending' ? 'tab-active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending Requests
            </button>
            <button 
              className={`tab ${filter === 'active' ? 'tab-active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active Users
            </button>
          </div>
          
          <button 
            className="btn btn-outline"
            onClick={fetchUsers}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Role</th>
                <th>Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span className="text-xs">{user.name?.substring(0, 2) || user.email.substring(0, 2)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name || 'No Name'}</div>
                          <div className="text-sm opacity-70">{user.email}</div>
                          <div className="text-xs text-gray-500">
                            {user.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleDateString()}` : 'Never logged in'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.role === UserRole.PENDING ? (
                        <div className="badge badge-warning">Pending</div>
                      ) : user.hasVoiceAiAccess ? (
                        <div className="badge badge-success">Active</div>
                      ) : (
                        <div className="badge badge-error">Inactive</div>
                      )}
                    </td>
                    <td>
                      <select 
                        className="select select-bordered select-sm w-full max-w-xs"
                        value={pendingChanges.get(user.id)?.role || user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        disabled={processingUsers.has(user.id)}
                      >
                        <option value={UserRole.ATTORNEY}>Attorney</option>
                        <option value={UserRole.PARALEGAL}>Paralegal</option>
                        <option value={UserRole.STAFF}>Staff</option>
                        <option value={UserRole.USER}>Basic User</option>
                        <option value={UserRole.PENDING}>Pending</option>
                      </select>
                    </td>
                    <td>
                      <label className="cursor-pointer label">
                        <input 
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={pendingChanges.get(user.id)?.grant ?? user.isVoiceAiEnabled}
                          onChange={(e) => handleGrantChange(user.id, e.target.checked)}
                          disabled={processingUsers.has(user.id)}
                        />
                      </label>
                    </td>
                    <td>
                      {pendingChanges.has(user.id) && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => applyChanges(user.id)}
                          disabled={processingUsers.has(user.id)}
                        >
                          {processingUsers.has(user.id) ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </VoiceAIProtectedFeature>
  );
};

export default VoiceAIAdminPage;
