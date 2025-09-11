'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmName: string;
  firmSize: string;
  currentChallenges: string;
  preferredContactTime: string;
  additionalNotes: string;
}

export default function ScheduleDemoPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    firmName: '',
    firmSize: '',
    currentChallenges: '',
    preferredContactTime: '',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual form submission logic here
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-6">
              We've received your information and will contact you within 24 hours to schedule your personalized demo.
            </p>
            <p className="text-base text-gray-500 mb-8">
              In the meantime, feel free to try our voice demo to experience the AI assistant in action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/voice-demo"
                className="btn btn-primary"
              >
                Try Voice Demo
              </Link>
              <Link
                href="/"
                className="btn btn-outline"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
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
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white text-center">
            <div className="w-full max-w-md mb-6 mx-auto">
              <Image 
                src="/images/smartvoiceclearbackcropped.png"
                alt="Smart Voice AI"
                width={200}
                height={110}
                priority={true}
                style={{objectFit: 'contain', width: 'auto', height: 'auto'} as React.CSSProperties}
                className="mx-auto filter brightness-0 invert"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">Schedule Your Demo</h1>
            <p className="text-xl opacity-90">
              See how Smart Voice AI can transform your law firm's client intake process
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Firm Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Firm Information</h3>
                
                <div>
                  <label htmlFor="firmName" className="block text-sm font-medium text-gray-700 mb-2">
                    Law Firm Name *
                  </label>
                  <input
                    type="text"
                    id="firmName"
                    name="firmName"
                    required
                    value={formData.firmName}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter your firm name"
                  />
                </div>

                <div>
                  <label htmlFor="firmSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Firm Size *
                  </label>
                  <select
                    id="firmSize"
                    name="firmSize"
                    required
                    value={formData.firmSize}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select firm size</option>
                    <option value="solo">Solo Practice</option>
                    <option value="2-5">2-5 Attorneys</option>
                    <option value="6-15">6-15 Attorneys</option>
                    <option value="16-50">16-50 Attorneys</option>
                    <option value="50+">50+ Attorneys</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="currentChallenges" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Client Intake Challenges
                  </label>
                  <textarea
                    id="currentChallenges"
                    name="currentChallenges"
                    value={formData.currentChallenges}
                    onChange={handleInputChange}
                    rows={3}
                    className="textarea textarea-bordered w-full"
                    placeholder="Tell us about your current challenges with client intake..."
                  />
                </div>

                <div>
                  <label htmlFor="preferredContactTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Time
                  </label>
                  <select
                    id="preferredContactTime"
                    name="preferredContactTime"
                    value={formData.preferredContactTime}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 7 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mt-8">
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes or Questions
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={4}
                className="textarea textarea-bordered w-full"
                placeholder="Any specific questions or requirements you'd like to discuss during the demo..."
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary btn-lg px-12 ${isSubmitting ? 'loading' : ''}`}
              >
                {isSubmitting ? 'Scheduling Demo...' : 'Schedule My Demo'}
              </button>
              <p className="text-sm text-gray-500 mt-4">
                We'll contact you within 24 hours to schedule your personalized demo
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
