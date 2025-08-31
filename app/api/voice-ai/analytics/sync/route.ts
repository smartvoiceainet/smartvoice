import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import syncService from '@/services/syncService';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in sync API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// Track if a sync is currently in progress to avoid concurrent syncs
let isSyncing = false;
let lastSyncInfo = {
  type: '',
  timestamp: null as Date | null,
  result: null as any
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admin users can trigger manual syncs
    if (session.user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Connect to MongoDB
    await connectToDatabase();
    
    // Get sync type from request body
    const body = await req.json();
    const { type = 'calls' } = body;

    if (type !== 'calls' && type !== 'metrics' && type !== 'all') {
      return NextResponse.json({ error: 'Invalid sync type. Must be one of: calls, metrics, all' }, { status: 400 });
    }
    
    // Check if sync is already in progress
    if (isSyncing) {
      return NextResponse.json({ 
        error: 'Sync already in progress', 
        lastSync: lastSyncInfo 
      }, { status: 409 });
    }
    
    // Mark sync as in progress
    isSyncing = true;
    let result: any;
    
    try {
      // Use the singleton instance directly
      if (type === 'calls' || type === 'all') {
        // Sync calls data
        const callsResult = await syncService.syncCalls();
        
        if (type === 'calls') {
          result = {
            syncedCount: callsResult.newCalls || 0,
            updatedCount: callsResult.updatedCalls || 0,
            totalProcessed: (callsResult.newCalls || 0) + (callsResult.updatedCalls || 0),
            timestamp: new Date().toISOString()
          };
        }
      }
      
      if (type === 'metrics' || type === 'all') {
        // Sync metrics data
        const metricsResult = await syncService.syncMetrics();
        
        if (type === 'metrics') {
          result = {
            syncedCount: metricsResult.daysProcessed || 0,
            updatedCount: 0, // Not provided by this method
            totalProcessed: metricsResult.daysProcessed || 0,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // If type is 'all', provide combined results
      if (type === 'all') {
        const callsResult = await syncService.syncCalls();
        const metricsResult = await syncService.syncMetrics();
        result = {
          calls: callsResult,
          metrics: metricsResult,
          timestamp: new Date().toISOString()
        };
      }
      
      // Store last sync info
      lastSyncInfo = {
        type,
        timestamp: new Date(),
        result
      };
      
      return NextResponse.json({
        message: `Sync completed successfully for ${type}`,
        result
      });
    } catch (syncError) {
      console.error(`Error during ${type} sync:`, syncError);
      return NextResponse.json(
        { error: `Failed to sync ${type} data: ${(syncError as Error).message}` },
        { status: 500 }
      );
    } finally {
      // Always release the sync lock
      isSyncing = false;
    }
  } catch (error) {
    console.error('Error during data sync API call:', error);
    
    // If we encounter an error before setting isSyncing, make sure we don't leave it locked
    isSyncing = false;
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
