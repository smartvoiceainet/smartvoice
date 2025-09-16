import Link from "next/link";
import Image from "next/image";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Payment Success | ${config.appName}`,
  canonicalUrlRelative: "/success",
});

const SuccessPage = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <div className="flex items-center gap-4 mb-6">
          <Image
            src="/images/smartvoiceclearbackcropped.png"
            alt={`${config.appName} logo`}
            className="h-12 w-auto"
            width={144}
            height={80}
            style={{objectFit: 'contain'} as React.CSSProperties}
          />
          <h1 className="text-3xl font-extrabold">
            Welcome to Smart Voice AI!
          </h1>
        </div>

        <div className="bg-success/10 border border-success/20 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-8 h-8 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-success">Payment Successful!</h2>
          </div>
          <p className="text-base-content/80">
            Thank you for subscribing to Smart Voice AI. Your payment has been processed successfully.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-base-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Account Setup</h4>
                  <p className="text-sm text-base-content/70">
                    Our team will contact you within 24 hours to set up your Smart Voice AI assistant.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Voice Training</h4>
                  <p className="text-sm text-base-content/70">
                    We'll customize your AI voice assistant with your firm's specific scripts and protocols.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Integration</h4>
                  <p className="text-sm text-base-content/70">
                    Connect with your existing case management system and phone setup.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Go Live</h4>
                  <p className="text-sm text-base-content/70">
                    Start receiving calls through your new AI assistant within 3-5 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Need immediate help?</h3>
            <p className="mb-4 text-base-content/80">
              Our support team is ready to assist you with any questions about your new subscription.
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <a href="mailto:support@smartvoiceai.net" className="link link-primary">support@smartvoiceai.net</a></p>
              <p><strong>Response Time:</strong> Within 4 hours for new customers</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/dashboard" 
              className="btn btn-primary flex-1"
            >
              Access Dashboard
            </Link>
            <Link 
              href="/support" 
              className="btn btn-outline flex-1"
            >
              Contact Support
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="link link-hover text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SuccessPage;
