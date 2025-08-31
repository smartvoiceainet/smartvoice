"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, Check, X } from 'lucide-react';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'new_call' | 'engagement_letter' | 'qualified_lead';
  title: string;
  message: string;
  callId?: string;
  timestamp: Date;
  read: boolean;
}

const VoiceAINotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch notifications from API
  const fetchNotifications = async () => {
    try {
      // In a real implementation, this would fetch from your API
      // For now, simulate some sample notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'new_call',
          title: 'New Potential Client Call',
          message: 'A new call from (555) 123-4567 was just recorded.',
          callId: 'call-123456',
          timestamp: new Date(),
          read: false
        },
        {
          id: '2',
          type: 'qualified_lead',
          title: 'Qualified Lead Detected',
          message: 'A new qualified lead for Personal Injury case has been identified.',
          callId: 'call-234567',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false
        },
        {
          id: '3',
          type: 'engagement_letter',
          title: 'Engagement Letter Generated',
          message: 'An engagement letter has been generated and is ready for review.',
          callId: 'call-345678',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  // Initialize notifications
  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  // In a real implementation, you would set up a WebSocket connection here
  // to listen for new notifications
  useEffect(() => {
    // Mock WebSocket connection
    const timer = setInterval(() => {
      // Simulate occasional new notifications (for demo purposes)
      if (Math.random() > 0.95) {
        const newNotification: Notification = {
          id: `new-${Date.now()}`,
          type: 'new_call',
          title: 'New Incoming Call',
          message: 'A new call just came in and was handled by Voice AI.',
          callId: `call-${Date.now()}`,
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timer);
  }, []);

  if (!session?.user?.hasVoiceAiAccess && session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-circle relative"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-error text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-3 border-b hover:bg-base-200 ${!notification.read ? 'bg-base-200' : ''}`}
                >
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-gray-500 hover:text-primary"
                      aria-label="Mark as read"
                    >
                      {notification.read ? null : <Check className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {format(notification.timestamp, 'MMM d, h:mm a')}
                    </span>
                    {notification.callId && (
                      <Link
                        href={`/dashboard/voice-ai-analytics?callId=${notification.callId}`}
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            )}
          </div>
          
          <div className="p-2 border-t text-center">
            <Link 
              href="/dashboard/voice-ai-analytics"
              className="text-xs text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              View All Activity
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAINotifications;
