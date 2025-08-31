"use client";

import React from 'react';

/**
 * Badge to display status information
 */
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
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

/**
 * Badge to display qualification status
 */
interface QualificationBadgeProps {
  qualified: boolean;
}

export const QualificationBadge: React.FC<QualificationBadgeProps> = ({ qualified }) => {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
      qualified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {qualified ? 'Qualified' : 'Not Qualified'}
    </span>
  );
};
