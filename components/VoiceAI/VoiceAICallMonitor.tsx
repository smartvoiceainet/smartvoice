"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PhoneCall, Mic, MicOff, UserPlus, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface CallData {
  id: string;
  status: 'active' | 'onhold' | 'completed';
  phoneNumber: string;
  startTime: Date;
  duration: number; // in seconds
  agentAssigned: boolean;
  notes: string;
  transcriptAvailable: boolean;
}

const VoiceAICallMonitor = () => {
  const { data: session } = useSession();
  const [activeCalls, setActiveCalls] = useState<CallData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user has access
  const hasAccess = session?.user?.hasVoiceAiAccess || session?.user?.role === 'admin';
  
  // Format seconds to mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch active calls and set up WebSocket connection
  useEffect(() => {
    // Initial data fetch
    const fetchActiveCalls = async () => {
      try {
        setLoading(true);
        
        // Simulate API call - in production this would fetch from your Voice AI API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockCalls: CallData[] = [
          {
            id: 'call-1',
            status: 'active',
            phoneNumber: '(555) 123-4567',
            startTime: new Date(),
            duration: 75, // 1:15
            agentAssigned: false,
            notes: 'Potential client calling about a personal injury case',
            transcriptAvailable: true
          },
          {
            id: 'call-2',
            status: 'onhold',
            phoneNumber: '(555) 987-6543',
            startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            duration: 312, // 5:12
            agentAssigned: true,
            notes: 'Client discussing case details, waiting for attorney',
            transcriptAvailable: true
          }
        ];
        
        setActiveCalls(mockCalls);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to fetch active calls:', error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      fetchActiveCalls();
      
      // Simulate WebSocket connection for real-time updates
      const timer = setInterval(() => {
        setActiveCalls(prev => 
          prev.map(call => ({
            ...call,
            duration: call.duration + 1
          }))
        );
      }, 1000);
      
      // Simulate occasional new calls (for demo purposes)
      const newCallTimer = setInterval(() => {
        if (Math.random() > 0.95) {
          const newCall: CallData = {
            id: `call-${Date.now()}`,
            status: 'active',
            phoneNumber: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            startTime: new Date(),
            duration: 0,
            agentAssigned: false,
            notes: 'New incoming call',
            transcriptAvailable: false
          };
          
          setActiveCalls(prev => [...prev, newCall]);
        }
      }, 30000); // Check every 30 seconds
      
      return () => {
        clearInterval(timer);
        clearInterval(newCallTimer);
      };
    }
  }, [hasAccess]);

  if (!hasAccess) return null;

  return (
    <div className="bg-base-100 rounded-lg shadow-md border border-base-300 overflow-hidden">
      <div className="p-4 bg-accent text-accent-content flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center">
          <PhoneCall className="mr-2 h-5 w-5" />
          Live Call Monitor
        </h3>
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-success' : 'bg-error'}`}></div>
          <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      {loading ? (
        <div className="p-6 flex justify-center items-center">
          <div className="loading loading-spinner loading-md"></div>
        </div>
      ) : activeCalls.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th>Status</th>
                <th>Phone</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Agent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCalls.map((call) => (
                <tr key={call.id} className={call.status === 'onhold' ? 'bg-warning bg-opacity-10' : ''}>
                  <td>
                    <span className={`badge ${
                      call.status === 'active' ? 'badge-success' : 
                      call.status === 'onhold' ? 'badge-warning' : 
                      'badge-info'
                    }`}>
                      {call.status === 'active' ? 'Active' : 
                       call.status === 'onhold' ? 'On Hold' : 
                       'Completed'}
                    </span>
                  </td>
                  <td>{call.phoneNumber}</td>
                  <td className="text-xs">{format(call.startTime, 'h:mm a')}</td>
                  <td>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDuration(call.duration)}
                    </span>
                  </td>
                  <td>
                    {call.agentAssigned ? (
                      <span className="badge badge-sm badge-success">Assigned</span>
                    ) : (
                      <span className="badge badge-sm badge-error">Unassigned</span>
                    )}
                  </td>
                  <td className="flex gap-2">
                    <button className="btn btn-xs btn-ghost" title="Toggle mute">
                      {Math.random() > 0.5 ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                    </button>
                    {!call.agentAssigned && (
                      <button className="btn btn-xs btn-ghost" title="Assign agent">
                        <UserPlus className="h-3 w-3" />
                      </button>
                    )}
                    {call.transcriptAvailable && (
                      <button className="btn btn-xs btn-ghost" title="View transcript">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className="w-3 h-3"
                        >
                          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <AlertTriangle className="h-8 w-8 text-warning mb-2" />
          <p className="text-base-content">No active calls at this moment</p>
          <p className="text-xs text-base-content/70 mt-1">New calls will appear here automatically</p>
        </div>
      )}
      
      <div className="bg-base-200 p-2 text-center">
        <a 
          href="/dashboard/voice-ai-analytics?tab=calls" 
          className="text-xs text-primary hover:underline"
        >
          View Call History
        </a>
      </div>
    </div>
  );
};

export default VoiceAICallMonitor;
