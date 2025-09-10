import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import config from "@/config";
import Link from "next/link";
import Image from "next/image";

// This is a server-side component to ensure the user is logged in.
// If not, it will redirect to the login page.
// It's applied to all subpages of /dashboard in /app/dashboard/*** pages
// You can also add custom static UI elements like a Navbar, Sidebar, Footer, etc..
// See https://shipfa.st/docs/tutorials/private-page
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Dashboard Header with Logo */}
      <header className="bg-base-200 border-b border-base-content/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/images/smartvoiceclearbackcropped.png"
                alt="Smart Voice AI"
                width={160}
                height={48}
                className="h-10 w-auto"
                style={{objectFit: 'contain'} as React.CSSProperties}
              />
            </Link>
            <div className="text-sm text-base-content/70">
              Dashboard
            </div>
          </div>
        </div>
      </header>
      
      {/* Dashboard Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
