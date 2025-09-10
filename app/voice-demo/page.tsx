'use client';

import VapiVoiceChat from '@/components/VapiVoiceChat';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VoiceDemoPage() {
  return (
    <div className="container mx-auto py-12 px-6">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="w-full max-w-md mb-6">
          <Image 
            src="/images/smartvoiceclearbackcropped.png"
            alt="Smart Voice AI"
            width={270}
            height={150}
            priority={true}
            style={{objectFit: 'contain', width: 'auto', height: 'auto'} as React.CSSProperties}
            className="mx-auto"
          />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Voice AI Assistant</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Experience the power of our AI voice assistant for law firms. Click the button below to start a conversation.
          Speak directly through your browser to handle client inquiries and scheduling efficiently.
        </p>

        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6 bg-base-200 border-l-4 border-primary p-4 rounded">
            <p className="text-base-content">
              <strong>Note:</strong> Please allow microphone access when prompted. This demo requires a microphone to function.
            </p>
          </div>
          
          <VapiVoiceChat />
        </div>
      </motion.div>
    </div>
  );
}
