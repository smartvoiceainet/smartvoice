import Link from "next/link";
import Image from "next/image";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Payment Cancelled | ${config.appName}`,
  canonicalUrlRelative: "/cancel",
});

const CancelPage = () => {
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
            Payment Cancelled
          </h1>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-8 h-8 text-warning"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h2 className="text-xl font-bold text-warning">Payment Cancelled</h2>
          </div>
          <p className="text-base-content/80">
            Your payment was cancelled and no charges were made to your account.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-base-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Still interested in Smart Voice AI?</h3>
            <p className="mb-4 text-base-content/80">
              We understand that sometimes you need more time to make a decision. Here are some options:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium">Schedule a Demo</h4>
                  <p className="text-sm text-base-content/70">
                    See Smart Voice AI in action with a personalized demonstration.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium">Contact Sales</h4>
                  <p className="text-sm text-base-content/70">
                    Speak with our team about custom pricing or enterprise solutions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium">Try Again Later</h4>
                  <p className="text-sm text-base-content/70">
                    Our pricing plans will be available whenever you're ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Questions about pricing?</h3>
            <p className="mb-4 text-base-content/80">
              Our team is here to help you find the right plan for your law firm.
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> <a href="mailto:support@smartvoiceai.net" className="link link-primary">support@smartvoiceai.net</a></p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/#pricing" 
              className="btn btn-primary flex-1"
            >
              View Pricing Again
            </Link>
            <Link 
              href="/schedule-demo" 
              className="btn btn-outline flex-1"
            >
              Schedule Demo
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

export default CancelPage;
