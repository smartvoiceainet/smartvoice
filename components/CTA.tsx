import Image from "next/image";
import config from "@/config";
import { motion } from "framer-motion";

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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center max-w-2xl p-8 md:p-0"
        >
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            Stop Missing Calls. Start Growing Your Practice.
          </h2>
          <p className="text-lg opacity-90 mb-8 md:mb-12">
            Join the 100+ law firms already using Smart Voice AI to increase client conversions, 
            save valuable time, and scale their practice without the overhead.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#pricing" 
              className="btn btn-primary btn-lg"
            >
              Get Started
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#process" 
              className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-slate-900"
            >
              Schedule a Demo
            </motion.a>
          </div>
          

        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
