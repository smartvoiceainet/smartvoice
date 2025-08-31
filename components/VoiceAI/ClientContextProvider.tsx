import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ClientContextType {
  selectedClientId: string | null;
  selectedAssistantId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
  setSelectedAssistantId: (assistantId: string | null) => void;
}

const ClientContext = createContext<ClientContextType>({
  selectedClientId: null,
  selectedAssistantId: null,
  setSelectedClientId: () => {},
  setSelectedAssistantId: () => {},
});

export const useClientContext = () => useContext(ClientContext);

export function ClientContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  // Initialize from URL query params if available, or from session for client users
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(
    searchParams.get('clientId') || null
  );
  
  const [selectedAssistantId, setSelectedAssistantIdState] = useState<string | null>(
    searchParams.get('assistantId') || null
  );
  
  // Effect to set client and assistant based on user session when available
  useEffect(() => {
    if (session?.user) {
      // For client users, automatically select their client
      if (session.user.isClientUser && session.user.clientId && !selectedClientId) {
        setSelectedClientIdState(session.user.clientId);
        
        // If there's a defaultAssistantId in session, use it
        if (session.user.defaultAssistantId && !selectedAssistantId) {
          setSelectedAssistantIdState(session.user.defaultAssistantId);
          
          // Update URL to reflect session values
          updateURL(session.user.clientId, session.user.defaultAssistantId);
        } else {
          // Only update with client ID
          updateURL(session.user.clientId, null);
        }
      }
    }
  }, [session]);
  
  // Update URL when selections change
  const setSelectedClientId = (clientId: string | null) => {
    setSelectedClientIdState(clientId);
    
    // When client changes, reset assistant
    if (selectedAssistantId) {
      setSelectedAssistantIdState(null);
    }
    
    updateURL(clientId, null);
  };
  
  const setSelectedAssistantId = (assistantId: string | null) => {
    setSelectedAssistantIdState(assistantId);
    updateURL(selectedClientId, assistantId);
  };
  
  // Helper to update the URL with client/assistant params
  const updateURL = (clientId: string | null, assistantId: string | null) => {
    // Preserve existing query params
    const params = new URLSearchParams(searchParams.toString());
    
    // Update client and assistant params
    if (clientId) {
      params.set('clientId', clientId);
    } else {
      params.delete('clientId');
    }
    
    if (assistantId) {
      params.set('assistantId', assistantId);
    } else {
      params.delete('assistantId');
    }
    
    // Update URL without navigation
    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.replace(newURL);
  };
  
  // Value object for the context provider
  const contextValue: ClientContextType = {
    selectedClientId,
    selectedAssistantId,
    setSelectedClientId,
    setSelectedAssistantId,
  };
  
  return (
    <ClientContext.Provider value={contextValue}>
      {children}
    </ClientContext.Provider>
  );
}
