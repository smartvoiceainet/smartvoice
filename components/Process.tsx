"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const processSteps = [
  {
    number: "01",
    title: "Schedule Your Setup Call",
    description: "Our integration specialists work with you to understand your firm's specific needs and workflows in a brief 30-minute call.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    )
  },
  {
    number: "02",
    title: "Seamless Integration",
    description: "Our team configures and connects Smart Voice AI with your existing systems—calendar, case management software, phone system—with zero downtime.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z" />
      </svg>
    )
  },
  {
    number: "03",
    title: "Training & Customization",
    description: "We train the AI with your specific script, case types, and procedures. Custom responses are created to perfectly represent your firm's voice and protocols.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    )
  },
  {
    number: "04",
    title: "Go Live & Monitor",
    description: "Your AI goes live, handling calls while our team monitors performance for two weeks to ensure everything is functioning optimally.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    )
  }
];

const ProcessStep = ({ step, index }: { step: typeof processSteps[0], index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex gap-8 items-start"
    >
      <div className="flex-shrink-0">
        <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center">
          {step.icon}
        </div>
      </div>
      <div>
        <div className="text-blue-600 font-bold text-sm mb-1">{step.number}</div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
        <p className="text-slate-600">{step.description}</p>
      </div>
    </motion.div>
  );
};

const Process = () => {
  return (
    <section className="py-20 bg-white" id="process">
      <div className="max-w-6xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-extrabold text-3xl md:text-5xl tracking-tight mb-5 text-slate-800">
            Simple, Fast Implementation: Up & Running in Days
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            No technical expertise required. Our team handles everything from integration to training, ensuring a smooth transition with zero disruption to your practice.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 mt-16 relative">
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-blue-100 -translate-x-1/2 hidden md:block"></div>
          
          {processSteps.map((step, index) => (
            <ProcessStep key={step.number} step={step} index={index} />
          ))}
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-blue-50 p-6 md:p-8 rounded-xl col-span-full text-center mt-8"
          >
            <p className="font-bold text-slate-800 mb-4">Ready to transform your practice with AI?</p>
            <a href="#pricing" className="btn btn-primary btn-lg">
              View Pricing Options
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Process;
