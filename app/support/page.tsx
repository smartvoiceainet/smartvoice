import Link from "next/link";
import Image from "next/image";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow:
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// Provide a comprehensive support page with FAQ for my website, an AI voice assistant service for law firms called "Smart Voice AI".

// Website: https://smartvoiceai.com
// Contact information: support@smartvoiceai.net
// Address: 123 Main Street, Austin, TX 78701

// Please write in simple English, explain the technical terms, avoid too much legal jargon, and add the current date (replace it with the current date) at the top.

// For the FAQ, include common issues users might face with:
// - Account setup and login
// - Voice AI configuration 
// - Call handling and routing
// - Integration with case management systems
// - Billing and subscription management
// - Technical troubleshooting

export const metadata = getSEOTags({
  title: `Support | ${config.appName}`,
  canonicalUrlRelative: "/support",
});

const SupportPage = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 2.158a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 111.06 1.06L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
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
            Support & Help Center
          </h1>
        </div>

        <div className="mb-8 p-6 bg-base-200 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Need Help?</h2>
          <p className="mb-4">
            Our support team is here to help you get the most out of Smart Voice AI. 
            For immediate assistance, please contact us:
          </p>
          <div className="space-y-2">
            <p><strong>Email:</strong> <a href="mailto:support@smartvoiceai.net" className="link link-primary">support@smartvoiceai.net</a></p>
            <p><strong>Response Time:</strong> Within 24 hours (Priority support available for Pro and Enterprise plans)</p>
            <p><strong>Phone Support:</strong> Available for Enterprise customers</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                How do I set up my Smart Voice AI account?
              </div>
              <div className="collapse-content">
                <p>After signing up, you'll receive a welcome email with setup instructions. Our onboarding team will schedule a call within 24 hours to help configure your voice AI assistant, including voice training, call routing, and integration with your existing systems.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                Why can't I log into my account?
              </div>
              <div className="collapse-content">
                <p>If you're having trouble logging in, try these steps:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Check that you're using the correct email address</li>
                  <li>Use the "Forgot Password" link to reset your password</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try logging in from an incognito/private browser window</li>
                </ul>
                <p className="mt-2">If you're still having issues, contact support at <a href="mailto:support@smartvoiceai.net" className="link">support@smartvoiceai.net</a></p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                How do I customize my AI voice assistant?
              </div>
              <div className="collapse-content">
                <p>You can customize your AI assistant through your dashboard:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li><strong>Voice Selection:</strong> Choose from multiple professional voice options</li>
                  <li><strong>Script Training:</strong> Upload your firm's specific scripts and responses</li>
                  <li><strong>Call Routing:</strong> Set up rules for different types of calls</li>
                  <li><strong>Business Hours:</strong> Configure when your AI should handle calls</li>
                </ul>
                <p className="mt-2">Our team provides free training sessions to help you optimize these settings.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                My AI isn't handling calls properly. What should I do?
              </div>
              <div className="collapse-content">
                <p>If your AI assistant isn't performing as expected:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Check your call routing settings in the dashboard</li>
                  <li>Verify your phone number forwarding is set up correctly</li>
                  <li>Review recent call logs for error messages</li>
                  <li>Ensure your script training is complete and up-to-date</li>
                </ul>
                <p className="mt-2">For immediate assistance, contact our technical support team who can review your configuration and make adjustments.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                How do I integrate with my case management system?
              </div>
              <div className="collapse-content">
                <p>Smart Voice AI integrates with all major legal case management platforms:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li><strong>Supported Systems:</strong> Clio, Practice Panther, MyCase, Smokeball, Filevine, and more</li>
                  <li><strong>Setup Process:</strong> Our integration specialists handle the entire setup during onboarding</li>
                  <li><strong>Data Sync:</strong> Client information, appointments, and case details sync automatically</li>
                  <li><strong>Custom Integrations:</strong> We can build custom API connections for specialized systems</li>
                </ul>
                <p className="mt-2">Contact support to schedule an integration consultation.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                How does billing work? Can I change my plan?
              </div>
              <div className="collapse-content">
                <p>Billing and subscription management:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li><strong>Billing Cycle:</strong> Monthly billing on the date you signed up</li>
                  <li><strong>Payment Methods:</strong> Credit card, ACH, or wire transfer (Enterprise)</li>
                  <li><strong>Plan Changes:</strong> Upgrade or downgrade anytime through your dashboard</li>
                  <li><strong>Usage Tracking:</strong> Monitor your call usage in real-time</li>
                  <li><strong>Overage Charges:</strong> Additional calls billed at $0.50 per call</li>
                </ul>
                <p className="mt-2">View your billing details and update payment methods in your account settings.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                I'm experiencing technical issues. How can I get help?
              </div>
              <div className="collapse-content">
                <p>For technical support:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li><strong>Basic Plan:</strong> Email support (9am-5pm CST, Monday-Friday)</li>
                  <li><strong>Pro Plan:</strong> Priority email support (24/7 response within 4 hours)</li>
                  <li><strong>Enterprise Plan:</strong> Dedicated phone support and account manager</li>
                </ul>
                <p className="mt-2">When contacting support, please include:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Your account email address</li>
                  <li>Description of the issue</li>
                  <li>Any error messages you're seeing</li>
                  <li>Steps you've already tried</li>
                </ul>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-lg font-medium">
                Can I cancel my subscription?
              </div>
              <div className="collapse-content">
                <p>You can cancel your subscription at any time:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li><strong>Self-Service:</strong> Cancel through your account settings</li>
                  <li><strong>No Penalties:</strong> No cancellation fees or long-term contracts</li>
                  <li><strong>Data Export:</strong> Download your call logs and client data before canceling</li>
                  <li><strong>Reactivation:</strong> Easily reactivate your account if you change your mind</li>
                </ul>
                <p className="mt-2">Your service will continue until the end of your current billing period.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-primary/10 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Still Need Help?</h3>
            <p className="mb-4">
              Can't find the answer you're looking for? Our support team is ready to help you succeed with Smart Voice AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:support@smartvoiceai.net" 
                className="btn btn-primary"
              >
                Email Support
              </a>
              <Link 
                href="/schedule-demo" 
                className="btn btn-outline"
              >
                Schedule a Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SupportPage;
