import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import BillingComponent from "../../components/BillingComponent";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import Link from "next/link";
import Image from "next/image";

export const metadata = getSEOTags({
  title: `Billing | ${config.appName}`,
  canonicalUrlRelative: "/billing",
});

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  await connectMongo();
  const user = await User.findById(session.user.id);

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  // Ensure we have the user data we need, fallback to session data if needed
  const userData = {
    _id: user._id?.toString() || session.user.id,
    email: user.email || session.user.email,
    name: user.name || session.user.name,
    customerId: user.customerId,
    priceId: user.priceId,
    hasAccess: user.hasAccess || false
  };

  return (
    <main className="min-h-screen bg-base-100">
      {/* Header with Logo and Navigation */}
      <header className="bg-base-200 border-b border-base-content/10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/images/smartvoiceclearbackcropped.png"
                alt={`${config.appName} logo`}
                className="h-12 w-auto"
                width={144}
                height={80}
                style={{objectFit: 'contain'} as React.CSSProperties}
              />
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link 
                href="/" 
                className="btn btn-ghost btn-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                    clipRule="evenodd"
                  />
                </svg>
                Home
              </Link>
              
              <Link 
                href="/dashboard" 
                className="btn btn-ghost btn-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-4">
              Billing & Subscription
            </h1>
            <p className="text-base-content/80 text-lg">
              Manage your Smart Voice AI subscription and billing information
            </p>
          </div>
          
          <BillingComponent user={userData} />
        </div>
      </div>
    </main>
  );
}
