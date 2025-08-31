import { Metadata } from "next";
import ClientManagement from "@/components/Admin/ClientManagement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/models/User";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Client Management",
  description: "Manage clients and their associated voice assistants",
};

export default async function ClientManagementPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <div className="flex space-x-4">
          <Link href="/admin/assistants" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <span className="mr-1">Manage Assistants</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
      <ClientManagement />
    </div>
  );
}
