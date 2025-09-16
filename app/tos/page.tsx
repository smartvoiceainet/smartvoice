import Link from "next/link";
import Image from "next/image";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://fenago.com
// - Name: FeNAgO
// - Contact information: support@fenago.com
// - Description: A Next.js agentic SaaS boilerplate to help entrepreneurs build AI-powered applications more efficiently
// - Ownership: when buying a package, users can download code to create apps. 
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://fenago.com/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
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
            Terms and Conditions for {config.appName}
          </h1>
        </div>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: May 5, 2025

Welcome to Smart Voice AI!

These Terms of Service ("Terms") govern your use of the Smart Voice AI website at https://smartvoiceai.com ("Website") and the services provided by Smart Voice AI. By using our Website and services, you agree to these Terms.

1. Description of Smart Voice AI

Smart Voice AI is a platform that provides AI-powered voice assistant services specifically designed for law firms to automate client intake, scheduling, and phone support.

2. Service Usage Rights

When you subscribe to Smart Voice AI services, you gain access to our voice AI technology for your law firm's communication needs. You may use the service according to your subscription plan but do not have the right to resell or redistribute our technology. We offer a full refund within 7 days of purchase, as specified in our refund policy.

3. User Data and Privacy

We collect and store user data, including name, email, and payment information, as necessary to provide our services. For details on how we handle your data, please refer to our Privacy Policy at https://smartvoiceai.com/privacy-policy.

4. Non-Personal Data Collection

We use web cookies to collect non-personal data for the purpose of improving our services and user experience.

5. Governing Law

These Terms are governed by the laws of the United States.

6. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any changes via email.

For any questions or concerns regarding these Terms of Service, please contact us at support@smartvoiceai.net.

Thank you for using Smart Voice AI!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
