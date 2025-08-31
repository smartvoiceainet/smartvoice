"use client";

import React, { useState, useEffect } from 'react';
import { X, Phone, Clock, User, FileText } from 'lucide-react';
import voiceAiApi from '@/services/voiceAiApi';

// Inline badge components to avoid circular dependencies
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: Record<string, string> = {
    'completed': 'bg-green-100 text-green-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'failed': 'bg-red-100 text-red-800',
    'sent': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'error': 'bg-red-100 text-red-800'
  };

  const statusClass = statusColors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const QualificationBadge: React.FC<{ qualified: boolean }> = ({ qualified }) => {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      qualified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {qualified ? 'Qualified' : 'Not Qualified'}
    </span>
  );
};

interface TranscriptEntry {
  speaker: 'user' | 'ai';
  content: string;
  timestamp?: string;
}

interface EngagementLetter {
  id: string;
  document_name: string;
  status: string;
  created_at: string;
  sent_at?: string;
}

interface CallDetails {
  id: string;
  phone_number: string;
  duration_seconds: number;
  case_type?: string;
  is_qualified: boolean;
  estimated_value?: number;
  status: string;
  created_at: string;
  engagement_letters?: EngagementLetter[];
}

interface CallDetailsModalProps {
  callId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CallDetailsModal: React.FC<CallDetailsModalProps> = ({ callId, isOpen, onClose }) => {
  const [call, setCall] = useState<CallDetails | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && callId) {
      loadCallDetails();
    }
  }, [isOpen, callId]);

  const loadCallDetails = async () => {
    try {
      setLoading(true);
      const [callData, transcriptData] = await Promise.all([
        voiceAiApi.getCall(callId!),
        voiceAiApi.getCallTranscript(callId!)
      ]);
      
      setCall(callData);
      setTranscript(transcriptData);
    } catch (error) {
      console.error('Error loading call details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendLetter = async (letterId: string) => {
    try {
      await voiceAiApi.resendEngagementLetter(letterId);
      // Refresh call data to get updated letter status
      const callData = await voiceAiApi.getCall(callId!);
      setCall(callData);
    } catch (error) {
      console.error('Error resending engagement letter:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Call Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Call Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Call Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="ml-2 text-sm font-medium">{call?.phone_number}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="ml-2 text-sm font-medium">{call?.duration_seconds}s</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Case Type:</span>
                      <span className="ml-2 text-sm font-medium">{call?.case_type || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Qualification</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="ml-2">
                        <QualificationBadge qualified={call?.is_qualified || false} />
                      </span>
                    </div>
                    {call?.estimated_value && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Estimated Value:</span>
                        <span className="ml-2 text-sm font-medium">
                          ${call.estimated_value.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div>
                <h3 className="text-lg font-medium mb-4">Call Transcript</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {transcript.length > 0 ? (
                    <div className="space-y-3">
                      {transcript.map((entry, index) => (
                        <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            entry.speaker === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <div className="text-xs opacity-75 mb-1">
                              {entry.speaker === 'user' ? 'Caller' : 'AI Assistant'}
                              {entry.timestamp && <span className="ml-2">{entry.timestamp}</span>}
                            </div>
                            <div className="text-sm">{entry.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No transcript available</p>
                  )}
                </div>
              </div>

              {/* Engagement Letter Status */}
              {call?.engagement_letters && call.engagement_letters.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Engagement Letters</h3>
                  <div className="space-y-2">
                    {call.engagement_letters.map((letter, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium">{letter.document_name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <StatusBadge status={letter.status} />
                          {letter.status === 'sent' && (
                            <button
                              onClick={() => handleResendLetter(letter.id)}
                              className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                            >
                              Resend
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallDetailsModal;
