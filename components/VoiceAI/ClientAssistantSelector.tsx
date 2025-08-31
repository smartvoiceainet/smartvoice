"use client";

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from 'next-auth/react';

interface Client {
  _id: string;
  name: string;
  logo?: string;
  assistants?: Assistant[];
}

interface Assistant {
  _id: string;
  name: string;
  clientId: string;
}

interface ClientAssistantSelectorProps {
  onClientChange: (clientId: string | null) => void;
  onAssistantChange: (assistantId: string | null) => void;
  selectedClientId?: string | null;
  selectedAssistantId?: string | null;
  className?: string;
}

export function ClientAssistantSelector({
  onClientChange,
  onAssistantChange,
  selectedClientId = null,
  selectedAssistantId = null,
  className
}: ClientAssistantSelectorProps) {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [clientOpen, setClientOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Client user should only see their assigned client and can't change it
  const isClientUser = session?.user?.isClientUser;
  const userClientId = session?.user?.clientId;
  
  // Admin user or non-client user needs to fetch all clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        
        // For client users, only fetch their assigned client
        if (isClientUser && userClientId) {
          const clientRes = await fetch(`/api/voice-ai/clients/${userClientId}`);
          if (clientRes.ok) {
            const clientData = await clientRes.json();
            // Make sure we handle the client object properly
            const client = clientData.client || clientData;
            setClients([client]);
            onClientChange(client._id);
          }
        } else {
          // For admins, fetch all clients
          const res = await fetch('/api/voice-ai/clients');
          if (res.ok) {
            const data = await res.json();
            // Extract the clients array from the response
            const clientsArray = data.clients || data;
            setClients(Array.isArray(clientsArray) ? clientsArray : []);
          }
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchClients();
    }
  }, [session, isClientUser, userClientId, onClientChange]);
  
  // Fetch assistants when client changes
  useEffect(() => {
    const fetchAssistants = async () => {
      if (!selectedClientId) {
        setAssistants([]);
        return;
      }
      
      try {
        setLoading(true);
        const res = await fetch(`/api/voice-ai/clients/${selectedClientId}/assistants`);
        if (res.ok) {
          const data = await res.json();
          setAssistants(data.assistants || []);
        }
      } catch (error) {
        console.error('Error fetching assistants:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssistants();
  }, [selectedClientId]);
  
  const selectedClient = clients.find(client => client._id === selectedClientId);
  const selectedAssistant = assistants.find(assistant => assistant._id === selectedAssistantId);
  
  return (
    <div className={cn("flex flex-col md:flex-row gap-2", className)}>
      <Popover open={clientOpen && !isClientUser} onOpenChange={!isClientUser ? setClientOpen : undefined}>
        <PopoverTrigger asChild disabled={isClientUser}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={clientOpen}
            className="justify-between w-full md:w-52"
            disabled={loading || isClientUser}
          >
            {selectedClient?.name || "Select client..."}
            {!isClientUser && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
          </Button>
        </PopoverTrigger>
        {!isClientUser && (
          <PopoverContent className="w-full md:w-52 p-0">
            <Command>
              <CommandInput placeholder="Search clients..." />
              <CommandEmpty>No client found.</CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client._id}
                    value={client._id}
                    onSelect={() => {
                      onClientChange(client._id === selectedClientId ? null : client._id);
                      onAssistantChange(null);
                      setClientOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedClientId === client._id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {client.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        )}
      </Popover>
      
      <Popover open={assistantOpen} onOpenChange={setAssistantOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={assistantOpen}
            className="justify-between w-full md:w-52"
            disabled={!selectedClientId || loading || assistants.length === 0}
          >
            {selectedAssistant?.name || "All assistants"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full md:w-52 p-0">
          <Command>
            <CommandInput placeholder="Search assistants..." />
            <CommandEmpty>No assistant found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onAssistantChange(null);
                  setAssistantOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedAssistantId === null ? "opacity-100" : "opacity-0"
                  )}
                />
                All assistants
              </CommandItem>
              {assistants.map((assistant) => (
                <CommandItem
                  key={assistant._id}
                  value={assistant._id}
                  onSelect={() => {
                    onAssistantChange(assistant._id === selectedAssistantId ? null : assistant._id);
                    setAssistantOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedAssistantId === assistant._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {assistant.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
