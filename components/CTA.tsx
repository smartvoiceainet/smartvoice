import Image from "next/image";
import config from "@/config";

const CTA = () => {
  return (
    <section className="relative hero overflow-hidden min-h-[70vh]" id="cta">
      <Image
        src="/images/office-desk-legal.jpg" 
        alt="Law firm office desk with gavel and documents"
        className="object-cover w-full"
        fill
      />
      <div className="relative hero-overlay bg-slate-900 bg-opacity-80"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-2xl p-8 md:p-0">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            Stop Missing Calls. Start Growing Your Practice.
          </h2>
          <p className="text-lg opacity-90 mb-8 md:mb-12">
            Join the 100+ law firms already using Smart Voice AI to increase client conversions, 
            save valuable time, and scale their practice without the overhead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#pricing" 
              className="btn btn-primary btn-lg hover:scale-105 transition-transform"
            >
              Get Started
            </a>
            <a 
              href="/schedule-demo" 
              className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-slate-900 hover:scale-105 transition-transform"
            >
              Schedule a Demo
            </a>
          </div>
          

        </div>
      </div>
    </section>
  );
};

export default CTA;
