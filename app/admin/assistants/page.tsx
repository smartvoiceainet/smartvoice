import { Metadata } from "next";
import AssistantManagement from "@/components/Admin/AssistantManagement";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/models/User";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Assistant Management",
  description: "Manage voice assistants and their client associations",
};

export default async function AssistantManagementPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated and is an admin
  if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
    redirect("/unauthorized");
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assistant Management</h1>
        <div className="flex space-x-4">
          <Link href="/admin/clients" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <span className="mr-1">Manage Clients</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
      <AssistantManagement />
    </div>
  );
}
