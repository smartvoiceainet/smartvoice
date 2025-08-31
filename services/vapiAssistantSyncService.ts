import mongoose from 'mongoose';
import axios from 'axios';
import vapiService from './vapiService';
import VapiAssistant, { IVapiAssistant } from '@/models/VapiAssistant';
import Client from '@/models/Client';

// Type definition to accommodate Mongoose's return types
type VapiAssistantResult = mongoose.Document | IVapiAssistant | null | any;

/**
 * Service for syncing Vapi assistants with our local database
 * Provides methods to fetch, create, update, and sync assistants
 */
class VapiAssistantSyncService {
  /**
   * Fetch all assistants from the Vapi API
   * @returns List of assistant objects from Vapi
   */
  async fetchAssistantsFromVapi(): Promise<any[]> {
    try {
      // Import here to avoid circular dependency
      const { vapiConfig } = await import('@/config/vapi');
      
      if (!vapiConfig.serverApiKey) {
        console.error('Vapi API key is not configured');
        throw new Error('Vapi API key is missing. Please check your environment variables.');
      }
      
      console.log('Fetching assistants from Vapi API...');
      
      const response = await axios.get(`${vapiConfig.baseUrl}/v1/assistants`, {
        headers: {
          'Authorization': `Bearer ${vapiConfig.serverApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: vapiConfig.options.timeout
      });
      
      console.log(`Retrieved ${response.data.data?.length || 0} assistants from Vapi API`);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching assistants from Vapi:', 
        error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : error.message || error);
      throw error;
    }
  }

  /**
   * Sync a single assistant from Vapi with our database
   * @param vapiAssistant The assistant data from Vapi API
   * @returns The created or updated assistant in our database
   */
  async syncAssistant(vapiAssistant: any): Promise<VapiAssistantResult> {
    if (!vapiAssistant || !vapiAssistant.id) {
      console.error('Invalid assistant data received:', vapiAssistant);
      throw new Error('Invalid assistant data: missing required fields');
    }

    try {
      console.log(`Syncing assistant ${vapiAssistant.id} (${vapiAssistant.name})`);
      
      // Find existing assistant in our database
      let existingAssistant = await VapiAssistant.findOne({ 
        vapiAssistantId: vapiAssistant.id 
      });
      
      // Prepare assistant data from Vapi format
      const assistantData = {
        vapiAssistantId: vapiAssistant.id,
        vapiPhoneNumber: vapiAssistant.phone_number || '',
        name: vapiAssistant.name || `Assistant ${vapiAssistant.id}`,
        description: vapiAssistant.description || '',
        isActive: vapiAssistant.active !== false, // Default to true if not specified
        configuration: {
          voiceModel: vapiAssistant.voice_id || 'nova',
          language: vapiAssistant.language || 'en-US',
          personalityPrompt: vapiAssistant.system_prompt || '',
          maxCallDuration: vapiAssistant.max_duration || 300,
        },
        // Reset performance counters only for new assistants
        ...(existingAssistant ? {} : {
          performance: {
            totalCalls: 0,
            successfulCalls: 0,
            qualifiedCalls: 0,
            totalDuration: 0,
            totalCost: 0,
            averageCallDuration: 0,
            lastSync: new Date()
          }
        })
      };

      if (existingAssistant) {
        // Update existing assistant
        console.log(`Updating existing assistant: ${existingAssistant._id}`);
        Object.assign(existingAssistant, assistantData);
        await existingAssistant.save();
        return existingAssistant;
      } else {
        // Create new assistant - need to find a client to assign it to
        // For initial sync, we'll assign to the first client or create unassigned
        const firstClient = await Client.findOne();
        const clientId = firstClient?._id || null;
        
        console.log(`Creating new assistant${clientId ? ' for client: ' + clientId : ' (unassigned)'}`);
        
        const newAssistant = new VapiAssistant({
          ...assistantData,
          clientId,
        });
        
        await newAssistant.save();
        return newAssistant;
      }
    } catch (error: any) {
      console.error(`Error syncing assistant ${vapiAssistant.id}:`, 
        error.name, error.message, error.code || '');
      
      // Include stack trace for unexpected errors
      if (process.env.NODE_ENV === 'development') {
        console.error(error.stack);
      }
      
      throw error;
    }
  }

  /**
   * Sync all assistants from Vapi with our database
   * @returns Array of synced assistants
   */
  async syncAllAssistants(): Promise<VapiAssistantResult[]> {
    try {
      // Make sure MongoDB connection is established
      if (mongoose.connection.readyState !== 1) {
        console.log('MongoDB connection not established. Connecting...');
        await mongoose.connect(process.env.MONGODB_URI || '');
      }
      
      // Fetch assistants from Vapi API
      const vapiAssistants = await this.fetchAssistantsFromVapi();
      
      if (!vapiAssistants || !vapiAssistants.length) {
        console.log('No assistants found in Vapi API.');
        return [];
      }
      
      console.log(`Processing ${vapiAssistants.length} assistants from Vapi API...`);
      
      // Process assistants sequentially to avoid potential race conditions
      const syncedAssistants: VapiAssistantResult[] = [];
      
      for (const assistant of vapiAssistants) {
        try {
          const syncedAssistant = await this.syncAssistant(assistant);
          syncedAssistants.push(syncedAssistant);
        } catch (assistantError) {
          console.error(`Error syncing individual assistant ${assistant.id}, continuing with others:`, assistantError);
          // Continue with other assistants
        }
      }
      
      console.log(`Successfully synced ${syncedAssistants.length} assistants`);
      return syncedAssistants;
    } catch (error: any) {
      console.error('Error syncing all assistants:', error.message || error);
      if (process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Handle webhook event for assistant updates
   * @param webhookData The webhook payload from Vapi
   */
  async handleAssistantWebhook(webhookData: any): Promise<VapiAssistantResult> {
    try {
      // Verify it's an assistant event
      if (!webhookData.assistant) {
        console.log('Not an assistant event, ignoring');
        return null;
      }
      
      const eventType = webhookData.event_type;
      const assistantData = webhookData.assistant;
      
      if (eventType === 'assistant.created' || eventType === 'assistant.updated') {
        // Sync the assistant data
        return await this.syncAssistant(assistantData);
      } else if (eventType === 'assistant.deleted') {
        // Return the deleted assistant
        const deletedAssistant = await VapiAssistant.findOneAndDelete({ 
          vapiAssistantId: assistantData.id 
        });
        return deletedAssistant as VapiAssistantResult;
      }
      
      return null;
    } catch (error) {
      console.error('Error handling assistant webhook:', error);
      throw error;
    }
  }

  /**
   * Sync assistant call metrics from Vapi API
   * @param assistantId The Vapi assistant ID
   * @returns The updated assistant with new performance metrics
   */
  async syncAssistantMetrics(assistantId: string): Promise<VapiAssistantResult> {
    try {
      // Find the assistant in our database
      const assistant = await VapiAssistant.findOne({ vapiAssistantId: assistantId });
      if (!assistant) {
        console.warn(`Assistant ${assistantId} not found in database`);
        return null;
      }
      
      // Get call metrics from Vapi for this assistant
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const formattedStartDate = oneMonthAgo.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedEndDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Using the getCallStatistics method from vapiService with assistant filter
      const stats = await vapiService.getCallStatistics(formattedStartDate, formattedEndDate);
      
      // Filter stats for this assistant
      const assistantStats = stats.filter((stat: any) => stat.assistant_id === assistantId);
      
      if (assistantStats.length > 0) {
        // Calculate metrics
        const totalCalls = assistantStats.length;
        const successfulCalls = assistantStats.filter((stat: any) => stat.status === 'completed').length;
        const totalDuration = assistantStats.reduce((sum: number, call: any) => sum + (call.duration || 0), 0);
        const totalCost = assistantStats.reduce((sum: number, call: any) => sum + (call.cost || 0), 0);
        
        // Update assistant performance metrics using set method to prevent TypeScript errors
        assistant.set({
          'performance.totalCalls': totalCalls,
          'performance.successfulCalls': successfulCalls,
          'performance.qualifiedCalls': assistant.performance?.qualifiedCalls || 0,
          'performance.totalDuration': totalDuration,
          'performance.totalCost': totalCost
        });
        
        // Store additional metrics in a separate metadata field if needed
        const metaData = {
          averageCallDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
          lastSync: new Date()
        };
        assistant.set('metaData', metaData);
        
        await assistant.save();
      }
      
      return assistant;
    } catch (error) {
      console.error(`Error syncing metrics for assistant ${assistantId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
const vapiAssistantSyncService = new VapiAssistantSyncService();
export default vapiAssistantSyncService;
