import { Suspense } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageContent from "@/components/PageContent";
import { Metadata } from 'next';

// Add metadata for SEO
export const metadata: Metadata = {
  title: 'Smart Voice AI - The AI Receptionist for Law Firms',
  description: 'Never miss a client call again. Smart Voice AI answers your calls 24/7, qualifies potential clients, and schedules appointments - all while sounding perfectly human. Transform your practice with the leading AI receptionist for attorneys.',
  keywords: 'AI receptionist, law firm automation, legal client intake, virtual receptionist, voice AI for attorneys, legal tech, law firm efficiency, client conversion, legal practice management',
};

export default function Home(): JSX.Element {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />
      </Suspense>
      <main>
        {/* Smart Voice AI - The AI Receptionist for Law Firms */}
        <PageContent />
      </main>
      <Footer />
    </>
  );
}
