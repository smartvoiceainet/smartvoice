import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import Client from '@/models/Client';
import User from '@/models/User';
import VapiAssistant from '@/models/VapiAssistant';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in clients API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// GET all clients (admin only) or the client for a client-user
export async function GET(req: NextRequest) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check if user has Voice AI access
  const hasAccess = session.user.hasVoiceAiAccess || 
                    session.user.role === UserRole.ADMIN;
                    
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    const url = new URL(req.url);
    
    // Extract query parameters for pagination, sorting, and filtering
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortDirection = url.searchParams.get('sortDirection') || 'asc';
    const subscriptionType = url.searchParams.get('subscriptionType') || '';
    
    // If user is a client user, only return their client
    if (session.user.isClientUser && session.user.clientId) {
      const client = await Client.findById(session.user.clientId);
      
      if (!client) {
        return NextResponse.json({
          clients: [],
          pagination: { total: 0, page, limit, pages: 0 }
        });
      }
      
      return NextResponse.json({
        clients: [client],
        pagination: { total: 1, page: 1, limit, pages: 1 }
      });
    }
    
    // For admin users, return all clients with pagination and filtering
    if (session.user.role === UserRole.ADMIN) {
      // Build query
      const query: any = {};
      
      // Add search filter
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'branding.companyName': { $regex: search, $options: 'i' } },
          { 'settings.primaryContact.email': { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add subscription type filter
      if (subscriptionType) {
        query['subscription.type'] = subscriptionType;
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Create sort object
      const sort: Record<string, 1 | -1> = {};
      sort[sortBy] = sortDirection === 'desc' ? -1 : 1;
      
      // Count total documents for pagination info
      const total = await Client.countDocuments(query);
      
      // Get clients with pagination and sorting
      const clients = await Client.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      // Calculate total pages
      const pages = Math.ceil(total / limit);
      
      // Get assistant counts for each client
      const clientIds = clients.map(client => client._id);
      const assistantCounts = await VapiAssistant.aggregate([
        { $match: { clientId: { $in: clientIds } } },
        { $group: { _id: '$clientId', count: { $sum: 1 } } }
      ]);
      
      // Convert to a map for easier access
      const assistantCountMap = new Map();
      assistantCounts.forEach((item: any) => {
        assistantCountMap.set(item._id.toString(), item.count);
      });
      
      // Add counts to clients
      const enrichedClients = clients.map(client => {
        const clientObj = client.toJSON();
        return {
          ...clientObj,
          assistantCount: assistantCountMap.get(client._id.toString()) || 0
        };
      });
      
      return NextResponse.json({
        clients: enrichedClients,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      });
    }
    
    // For other users, return clients they have access to
    // This would typically involve a relationship collection or field indicating
    // which clients a user has access to - for now return an empty array
    return NextResponse.json({
      clients: [],
      pagination: { total: 0, page, limit, pages: 0 }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new client (admin only)
export async function POST(req: NextRequest) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only admin can create clients
  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    await connectToDatabase();
    
    const data = await req.json();
    const { name, companyName, email, phone, status, branding, linkedUsers, linkedAssistants } = data;
    
    // Basic validation
    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    
    // Create the client
    const client = new Client({
      name,
      companyName,
      email,
      phone,
      status: status || 'trial',
      branding: {
        logoUrl: branding?.logoUrl || '',
        primaryColor: branding?.primaryColor || '#3B82F6',
        companyWebsite: branding?.companyWebsite || ''
      }
    });
    
    await client.save();
    
    // Link users to this client if any are provided
    if (linkedUsers && linkedUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: linkedUsers } },
        { 
          $set: { 
            clientId: client._id,
            isClientUser: true 
          } 
        }
      );
    }
    
    // Link assistants to this client if any are provided
    if (linkedAssistants && linkedAssistants.length > 0) {
      await VapiAssistant.updateMany(
        { _id: { $in: linkedAssistants } },
        { $set: { clientId: client._id } }
      );
    }
    
    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
