"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface AssistantData {
  _id: string;
  name: string;
  vapiPhoneNumber: string;
  description?: string;
  isActive: boolean;
  lastCallAt?: Date;
}

interface ClientData {
  _id: string;
  name: string;
  companyName: string;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    companyWebsite?: string;
  };
  status: string;
  assistants: AssistantData[];
}

interface ClientDashboardProps {
  client: ClientData;
}

const ClientDashboard = ({ client }: ClientDashboardProps) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  
  // Use client's primary color or default to blue
  const primaryColor = client.branding?.primaryColor || '#3B82F6';
  
  return (
    <div>
      {/* Client Header with Branding */}
      <div 
        className="rounded-lg mb-8 p-6 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {client.branding?.logoUrl && (
              <div className="mr-4 bg-white p-2 rounded-lg">
                <Image 
                  src={client.branding.logoUrl} 
                  alt={`${client.companyName} logo`}
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{client.companyName || client.name}</h1>
              {client.branding?.companyWebsite && (
                <a 
                  href={client.branding.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white underline text-sm"
                >
                  {client.branding.companyWebsite.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
          
          {isAdmin && (
            <Link
              href={`/admin/clients`}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded text-sm"
            >
              Back to Admin
            </Link>
          )}
        </div>
      </div>
      
      {/* Assistants Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Voice Assistants</h2>
        
        {client.assistants.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800">
              No voice assistants have been set up for your account yet.
              {isAdmin && " Please go to the admin panel to assign assistants to this client."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.assistants.map(assistant => (
              <AssistantCard 
                key={assistant._id} 
                assistant={assistant}
                clientColor={primaryColor}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Analytics Teaser */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 mb-4">
            View detailed analytics for your Voice AI assistants. Track call volumes,
            conversation durations, success rates and more.
          </p>
          <Link
            href={`/voice-ai/analytics?clientId=${client._id}`}
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Go to Analytics
          </Link>
        </div>
      </div>
      
      {/* Call History Teaser */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Call Activity</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-gray-600 mb-4">
            Review recent calls handled by your assistants, including transcripts,
            recordings, and outcomes.
          </p>
          <Link
            href={`/voice-ai/calls?clientId=${client._id}`}
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: primaryColor }}
          >
            View Call History
          </Link>
        </div>
      </div>
    </div>
  );
};

// Assistant Card Component
const AssistantCard = ({ 
  assistant, 
  clientColor 
}: { 
  assistant: AssistantData,
  clientColor: string
}) => {
  const lastCallDate = assistant.lastCallAt 
    ? new Date(assistant.lastCallAt).toLocaleDateString()
    : 'No calls yet';
    
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">{assistant.name}</h3>
        <span 
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            assistant.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {assistant.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      {assistant.description && (
        <p className="text-gray-600 text-sm mb-3">{assistant.description}</p>
      )}
      
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>{assistant.vapiPhoneNumber}</span>
      </div>
      
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Last call: {lastCallDate}</span>
      </div>
      
      <div className="flex">
        <a
          href={`tel:${assistant.vapiPhoneNumber}`}
          className="flex-1 text-center px-3 py-2 rounded text-white text-sm mr-2"
          style={{ backgroundColor: clientColor }}
        >
          Call Now
        </a>
        <Link
          href={`/voice-ai/calls?assistantId=${assistant._id}`}
          className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          Call History
        </Link>
      </div>
    </div>
  );
};

export default ClientDashboard;
