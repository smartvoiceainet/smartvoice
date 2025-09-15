import Image from "next/image";
import config from "@/config";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-12 lg:py-24 rounded-2xl my-8">
      <div className="flex flex-col gap-8 lg:gap-10 items-center justify-center text-center lg:text-left lg:items-start lg:w-1/2">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight text-slate-800">
          Drowning in Calls, Not Cases? Reclaim Your Practice with AI Employees.
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Automate client intake, scheduling, and phone support with voice AI, designed specifically for attorneys.
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
          <p className="text-sm text-slate-500 mb-2">Trusted by Legal Firms Nationwide</p>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-3">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-sm font-semibold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center items-center md:items-start gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold">100+</span> firms trust us
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 relative">
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
      </div>
    </section>
  );
};

export default Hero;
