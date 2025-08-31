import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-12 lg:py-24 rounded-2xl my-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-8 lg:gap-10 items-center justify-center text-center lg:text-left lg:items-start lg:w-1/2"
      >
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight text-slate-800">
          Drowning in Calls, Not Cases? Reclaim Your Practice with AI Employees.
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Automate client intake, scheduling, and phone support with voice AI, designed specifically for personal injury attorneys.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <a
            href="#process"
            className="btn btn-primary btn-lg shadow-lg shadow-blue-500/20 group relative overflow-hidden"
          >
            <span className="relative z-10">See How It Works</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </a>
          <a
            href="#pricing"
            className="btn btn-outline btn-lg border-slate-300 hover:border-blue-500 text-slate-800 no-underline decoration-none"
          >
            View Pricing
          </a>
        </div>

        <div className="w-full">
          <p className="text-sm text-slate-500 mb-2">Trusted by 100+ Personal Injury Firms Nationwide</p>
          <TestimonialsAvatars priority={true} />
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="lg:w-1/2 relative"
      >
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 blur-xl"></div>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-blue-50">
          <div className="relative w-full" style={{ height: '450px' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                <div className="p-4 bg-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">Smart Voice AI</div>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs">Active</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">AI</div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">Hello! This is Smart Voice AI. How can I help your law firm today?</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-end">
                    <div className="bg-blue-50 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">I need to schedule a consultation for a potential client.</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ml-3">C</div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">AI</div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">I'd be happy to help with that! Could you provide the client's name and their preferred date and time?</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-md flex items-center space-x-2">
                <div className="w-3/4 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                <div className="w-1/4 h-2 bg-blue-300 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-white text-sm font-medium">Smart Voice AI actively handling calls</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
