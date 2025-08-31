"use client";

import React from 'react';
import SmartVoiceAILogo from '@/components/ui/SmartVoiceAILogo';
import SmartVoiceAIImageLogo from '@/components/ui/SmartVoiceAIImageLogo';
import MainLogo from '@/components/ui/MainLogo';
import Link from 'next/link';

export default function LogoDemo() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Smart Voice AI Logo Options</h1>
        <p className="text-gray-600">
          Below are examples of the Smart Voice AI logo options in different sizes and background contexts.
        </p>
        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
      
      {/* Logo Comparison */}
      <div className="mb-12 bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">Logo Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-center">SVG Logo Option</h3>
            <div className="flex justify-center">
              <SmartVoiceAILogo size="lg" />
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Vector-based SVG that scales perfectly at any size
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-center">Image Logo Option</h3>
            <div className="flex justify-center">
              <SmartVoiceAIImageLogo size="md" />
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Image-based logo from your existing design
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-center">Main Logo Option</h3>
            <div className="flex justify-center">
              <MainLogo size="md" />
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Main logo from logomain.png
            </p>
          </div>
        </div>
      </div>

      {/* Different Sizes */}
      <div className="mb-12 bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">SVG Logo Sizes</h2>
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex flex-col items-center">
            <SmartVoiceAILogo size="sm" />
            <span className="mt-2 text-sm text-gray-600">Small</span>
          </div>
          <div className="flex flex-col items-center">
            <SmartVoiceAILogo size="md" />
            <span className="mt-2 text-sm text-gray-600">Medium (Default)</span>
          </div>
          <div className="flex flex-col items-center">
            <SmartVoiceAILogo size="lg" />
            <span className="mt-2 text-sm text-gray-600">Large</span>
          </div>
          <div className="flex flex-col items-center">
            <SmartVoiceAILogo size="xl" />
            <span className="mt-2 text-sm text-gray-600">Extra Large</span>
          </div>
        </div>
      </div>

      {/* Image Logo Sizes */}
      <div className="mb-12 bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">Image Logo Sizes</h2>
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex flex-col items-center">
            <SmartVoiceAIImageLogo size="sm" />
            <span className="mt-2 text-sm text-gray-600">Small</span>
          </div>
          <div className="flex flex-col items-center">
            <SmartVoiceAIImageLogo size="md" />
            <span className="mt-2 text-sm text-gray-600">Medium (Default)</span>
          </div>
          <div className="flex flex-col items-center">
            <SmartVoiceAIImageLogo size="lg" />
            <span className="mt-2 text-sm text-gray-600">Large</span>
          </div>
        </div>
      </div>

      {/* Main Logo Sizes */}
      <div className="mb-12 bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-6">Main Logo Sizes</h2>
        <div className="flex flex-wrap items-center gap-10">
          <div className="flex flex-col items-center">
            <MainLogo size="sm" />
            <span className="mt-2 text-sm text-gray-600">Small</span>
          </div>
          <div className="flex flex-col items-center">
            <MainLogo size="md" />
            <span className="mt-2 text-sm text-gray-600">Medium (Default)</span>
          </div>
          <div className="flex flex-col items-center">
            <MainLogo size="lg" />
            <span className="mt-2 text-sm text-gray-600">Large</span>
          </div>
        </div>
      </div>

      {/* Different Backgrounds */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">SVG Logo on Different Backgrounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 p-8 rounded-lg shadow flex justify-center items-center h-48">
            <SmartVoiceAILogo size="lg" />
          </div>
          <div className="bg-blue-900 p-8 rounded-lg shadow flex justify-center items-center h-48">
            <SmartVoiceAILogo size="lg" />
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-8 rounded-lg shadow flex justify-center items-center h-48">
            <SmartVoiceAILogo size="lg" />
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex justify-center items-center h-48">
            <SmartVoiceAILogo size="lg" />
          </div>
        </div>
      </div>
      
      {/* Image Logo on Different Backgrounds */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Image Logo on Different Backgrounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 p-8 rounded-lg shadow flex justify-center items-center">
            <SmartVoiceAIImageLogo size="sm" />
          </div>
          <div className="bg-blue-900 p-8 rounded-lg shadow flex justify-center items-center">
            <SmartVoiceAIImageLogo size="sm" />
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-8 rounded-lg shadow flex justify-center items-center">
            <SmartVoiceAIImageLogo size="sm" />
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex justify-center items-center">
            <SmartVoiceAIImageLogo size="sm" />
          </div>
        </div>
      </div>
      
      {/* Main Logo on Different Backgrounds */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">Main Logo on Different Backgrounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 p-8 rounded-lg shadow flex justify-center items-center">
            <MainLogo size="sm" />
          </div>
          <div className="bg-blue-900 p-8 rounded-lg shadow flex justify-center items-center">
            <MainLogo size="sm" />
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-8 rounded-lg shadow flex justify-center items-center">
            <MainLogo size="sm" />
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex justify-center items-center">
            <MainLogo size="sm" />
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Logo in Context</h2>
        
        {/* Navbar example */}
        <div className="mb-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b flex items-center">
            <div className="flex items-center space-x-3">
              <SmartVoiceAILogo size="sm" />
              <span className="font-bold text-lg">Smart Voice AI</span>
            </div>
            <div className="ml-auto flex space-x-4">
              <button className="px-4 py-2 text-sm">Features</button>
              <button className="px-4 py-2 text-sm">Pricing</button>
              <button className="px-4 py-2 text-sm">About</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                Get Started
              </button>
            </div>
          </div>
          <div className="p-8 text-center text-gray-500">Navbar Example</div>
        </div>
        
        {/* App Icon example */}
        <div className="mb-8 flex flex-wrap gap-8 justify-center">
          <div className="w-24 flex flex-col items-center">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                <SmartVoiceAILogo size="lg" />
              </div>
            </div>
            <p className="mt-2 text-sm text-center">Smart Voice AI</p>
          </div>
          <div className="flex items-end pb-1">
            <span className="text-gray-500">App Icon Example</span>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Implementation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">SVG Logo Component</h3>
            <p className="mb-4">
              The SVG logo is implemented as a React component for scalability. You can use it anywhere 
              in your application by importing the component:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
              <pre className="text-sm overflow-x-auto">
                <code>{`import SmartVoiceAILogo from '@/components/ui/SmartVoiceAILogo';

// Then use it in your component:
<SmartVoiceAILogo size="md" className="my-custom-class" />`}</code>
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Image Logo Component</h3>
            <p className="mb-4">
              The image logo is implemented using Next.js Image component. You can use it anywhere 
              in your application by importing the component:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
              <pre className="text-sm overflow-x-auto">
                <code>{`import SmartVoiceAIImageLogo from '@/components/ui/SmartVoiceAIImageLogo';

// Then use it in your component:
<SmartVoiceAIImageLogo size="md" className="my-custom-class" />`}</code>
              </pre>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Main Logo Component</h3>
            <p className="mb-4">
              The main logo is also implemented using Next.js Image component. You can use it anywhere 
              in your application by importing the component:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
              <pre className="text-sm overflow-x-auto">
                <code>{`import MainLogo from '@/components/ui/MainLogo';

// Then use it in your component:
<MainLogo size="md" className="my-custom-class" />`}</code>
              </pre>
            </div>
          </div>
        </div>

        <p className="mb-2">Available props for both components:</p>
        <ul className="list-disc pl-6 mb-6">
          <li><code className="bg-gray-100 px-1 rounded">size</code>: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')</li>
          <li><code className="bg-gray-100 px-1 rounded">className</code>: Additional CSS classes</li>
        </ul>
      </div>
    </div>
  );
}
