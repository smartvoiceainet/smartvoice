import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/models/User";
import mongoose from "mongoose";
import Client from "@/models/Client";
import VapiAssistant from "@/models/VapiAssistant";
import ClientDashboard from "@/components/Client/ClientDashboard";
import { notFound } from "next/navigation";

interface ClientDashboardPageProps {
  params: {
    clientId: string;
  };
}

export async function generateMetadata(
  { params }: ClientDashboardPageProps
): Promise<Metadata> {
  // Connect to database
  if (mongoose.connection.readyState !== 1) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MongoDB connection string is not defined');
    }
    await mongoose.connect(MONGODB_URI);
  }
  
  // Fetch client data for dynamic metadata
  const client = await Client.findById(params.clientId);
  
  if (!client) {
    return {
      title: "Client Dashboard",
      description: "Client-specific dashboard for Smart Voice AI"
    };
  }
  
  return {
    title: `${client.companyName || client.name} Dashboard`,
    description: `Voice AI dashboard for ${client.companyName || client.name}`
  };
}

export default async function ClientDashboardPage({ params }: ClientDashboardPageProps) {
  const { clientId } = params;
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/client/" + clientId + "/dashboard");
  }
  
  // Connect to database
  if (mongoose.connection.readyState !== 1) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MongoDB connection string is not defined');
    }
    await mongoose.connect(MONGODB_URI);
  }
  
  // Validate client ID format
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    notFound();
  }
  
  // Fetch client data
  const client = await Client.findById(clientId);
  
  if (!client) {
    notFound();
  }
  
  // Authorization check: user must be admin or belong to this client
  const isAdmin = session.user.role === UserRole.ADMIN;
  const isClientUser = session.user.isClientUser && session.user.clientId === clientId;
  
  if (!isAdmin && !isClientUser) {
    redirect("/unauthorized");
  }
  
  // Fetch client's active assistants
  const assistants = await VapiAssistant.find({
    clientId: clientId,
    isActive: true
  }).sort({ createdAt: -1 });
  
  // Fetch latest calls for this client's assistants (limit to 10)
  const assistantIds = assistants.map(a => a._id);
  
  // Get all data needed for the dashboard
  const clientData = {
    _id: client._id.toString(),
    name: client.name,
    companyName: client.companyName,
    branding: client.branding,
    status: client.status,
    assistants: assistants.map(a => ({
      _id: a._id.toString(),
      name: a.name,
      vapiPhoneNumber: a.vapiPhoneNumber,
      description: a.description,
      isActive: a.isActive,
      lastCallAt: a.lastCallAt
    }))
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <ClientDashboard client={clientData} />
    </div>
  );
}
