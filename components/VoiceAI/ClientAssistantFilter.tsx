'use client';

import { ClientContextProvider, useClientContext } from './ClientContextProvider';
import { ClientAssistantSelector } from './ClientAssistantSelector';

export function ClientAssistantFilterProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClientContextProvider>
      <div className="mb-6">
        <ClientAssistantFilterUI />
      </div>
      {children}
    </ClientContextProvider>
  );
}

export function ClientAssistantFilterUI() {
  const { 
    selectedClientId, 
    selectedAssistantId, 
    setSelectedClientId, 
    setSelectedAssistantId 
  } = useClientContext();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-500">Filter Analytics By:</h2>
        <ClientAssistantSelector
          selectedClientId={selectedClientId}
          selectedAssistantId={selectedAssistantId}
          onClientChange={setSelectedClientId}
          onAssistantChange={setSelectedAssistantId}
        />
      </div>
    </div>
  );
}
