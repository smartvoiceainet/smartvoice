import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { UserRole } from '@/models/User';
import mongoose from 'mongoose';
import Client from '@/models/Client';
import User from '@/models/User';
import VapiAssistant from '@/models/VapiAssistant';
import requireClientAccess from '@/middleware/requireClientAccess';

// Ensure MongoDB connection
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        throw new Error('MongoDB connection string is not defined');
      }
      
      await mongoose.connect(MONGODB_URI);
      console.log('MongoDB connected in client detail API');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// GET specific client by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
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
  
  const { clientId } = params;
  
  // Check client access
  const clientAccessResponse = await requireClientAccess(req, NextResponse.next(), clientId);
  if (clientAccessResponse.status !== 200) {
    return clientAccessResponse;
  }
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate client ID format
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }
    
    // Fetch client with basic info
    const client = await Client.findById(clientId).select('_id name logo branding settings subscription');
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Return client data in a consistent format with { client } structure
    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update client by ID (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Only admin can update clients
  if (session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { clientId } = params;
  
  try {
    await connectToDatabase();
    
    // Validate client ID format
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }
    
    // Check if client exists
    const existingClient = await Client.findById(clientId);
    
    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    const data = await req.json();
    const { name, companyName, email, phone, status, branding, linkedUsers, linkedAssistants } = data;
    
    // Basic validation
    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    
    // Update the client
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      {
        $set: {
          name,
          companyName,
          email,
          phone,
          status: status || 'trial',
          branding: {
            logoUrl: branding?.logoUrl || '',
            primaryColor: branding?.primaryColor || '#3B82F6',
            companyWebsite: branding?.companyWebsite || ''
          },
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    // Update user links - first remove any existing links not in the new list
    if (linkedUsers) {
      // Remove client association from users no longer linked
      await User.updateMany(
        { 
          clientId: existingClient._id,
          _id: { $nin: linkedUsers }
        },
        { 
          $unset: { 
            clientId: "",
            isClientUser: false,
            clientUserRole: ""
          } 
        }
      );
      
      // Add client association to newly linked users
      await User.updateMany(
        { _id: { $in: linkedUsers } },
        { 
          $set: { 
            clientId: existingClient._id,
            isClientUser: true,
            clientUserRole: "user" // Default role
          } 
        }
      );
    }
    
    // Update assistant links
    if (linkedAssistants) {
      // Remove client association from assistants no longer linked
      await VapiAssistant.updateMany(
        { 
          clientId: existingClient._id,
          _id: { $nin: linkedAssistants }
        },
        { $unset: { clientId: "" } }
      );
      
      // Add client association to newly linked assistants
      await VapiAssistant.updateMany(
        { _id: { $in: linkedAssistants } },
        { $set: { clientId: existingClient._id } }
      );
    }
    
    return NextResponse.json({ success: true, client: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
