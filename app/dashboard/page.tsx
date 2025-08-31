import ButtonAccount from "@/components/ButtonAccount";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import Link from "next/link";
import { UserRole } from "@/models/User";
import { default as dynamicImport } from "next/dynamic";

// Page config for dynamic data fetching
export const dynamic = "force-dynamic";

// Dynamically import client components
const VoiceAIWidget = dynamicImport(
  () => import("@/components/VoiceAI/VoiceAIWidget"),
  { ssr: false }
);

const VoiceAICallMonitor = dynamicImport(
  () => import("@/components/VoiceAI/VoiceAICallMonitor"),
  { ssr: false }
);

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  // Get user session to check for admin privileges
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === UserRole.ADMIN;
  
  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">Dashboard</h1>
        
        {/* Voice AI Stats Widget */}
        <div className="mb-8">
          <VoiceAIWidget />
        </div>
        
        {/* Voice AI Call Monitor */}
        <div className="mb-8">
          <VoiceAICallMonitor />
        </div>
        
        <div className="flex flex-col gap-4">
          <Link href="/dashboard/voice-ai-analytics" className="btn btn-primary">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-5 h-5 mr-2"
            >
              <path 
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" 
              />
              <path 
                d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" 
              />
            </svg>
            Voice AI Analytics
          </Link>
          
          {/* Admin link - only visible to users with admin role */}
          {isAdmin && (
            <Link href="/dashboard/voice-ai-admin" className="btn btn-secondary">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className="w-5 h-5 mr-2"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" 
                  clipRule="evenodd" 
                />
              </svg>
              Voice AI Admin
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
