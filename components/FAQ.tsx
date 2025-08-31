"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";
import { motion } from "framer-motion";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "How does Smart Voice AI sound compared to other virtual receptionists?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Smart Voice AI uses state-of-the-art neural voice technology that is virtually indistinguishable from a human receptionist. Unlike traditional virtual receptionist services that use pre-recorded prompts or robotic voices, our AI adapts its tone, responds to context, and even handles interruptions naturally.</p>
        <p>Many clients report they had no idea they were speaking with an AI until they were told afterwards. We offer voice samples during your demo so you can hear the difference yourself.</p>
      </div>
    ),
  },
  {
    question: "Will Smart Voice AI work with my existing case management system?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Yes! Smart Voice AI integrates seamlessly with all major legal case management platforms including Clio, Practice Panther, MyCase, Smokeball, Filevine, and more. Our integration specialists handle the entire setup process for you during onboarding.</p>
        <p>If you use a custom or less common system, our team can build a custom integration using our API. Just let us know during your implementation call.</p>
      </div>
    ),
  },
  {
    question: "What happens if the AI can't answer a potential client's question?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Smart Voice AI is trained specifically on your firm's protocols and information, so it can handle the vast majority of initial client inquiries. For situations where the AI encounters an unusual request or complex scenario it hasn't been trained for, it has three fallback options:</p>
        <ul className="list-disc pl-5">
          <li>Gracefully schedule a callback with an appropriate team member</li>
          <li>Transfer the call to a designated staff member in real-time</li>
          <li>Collect detailed information and send an urgent notification to your team</li>
        </ul>
        <p>These escalation protocols are fully customizable during setup.</p>
      </div>
    ),
  },
  {
    question: "How long does implementation take?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>Most law firms are up and running with Smart Voice AI within 3-5 business days. The process includes:</p>
        <ul className="list-disc pl-5">
          <li>Initial 30-minute setup call</li>
          <li>System integration (same day)</li>
          <li>Voice and script customization (1-2 days)</li>
          <li>Testing period (1-2 days)</li>
          <li>Go-live with monitoring</li>
        </ul>
        <p>For firms with more complex requirements or multiple office locations, implementation may take 7-10 business days.</p>
      </div>
    ),
  },
  {
    question: "Is there a long-term contract required?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>No. All Smart Voice AI plans are month-to-month with no long-term commitment required. We also offer a 30-day money-back guarantee, so you can try the service risk-free.</p>
        <p>Many firms choose our annual billing option to receive a 15% discount, but this is completely optional.</p>
      </div>
    ),
  },
  {
    question: "How does Smart Voice AI handle client privacy and confidentiality?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        <p>We take data security and client confidentiality extremely seriously. Smart Voice AI is:</p>
        <ul className="list-disc pl-5">
          <li>HIPAA-compliant for personal injury cases involving medical information</li>
          <li>SOC 2 Type II certified for security and availability</li>
          <li>Hosted on encrypted, US-based servers</li>
          <li>Protected by enterprise-grade security protocols</li>
        </ul>
        <p>All call data is encrypted both in transit and at rest, and we sign Business Associate Agreements (BAAs) with all clients.</p>
      </div>
    ),
  },
];

const FaqItem = ({ item, index }: { item: FAQItemProps; index: number }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </motion.li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Frequently Asked Questions
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
