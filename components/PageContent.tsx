"use client";

import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Process from "@/components/Process";
import Pricing from "@/components/Pricing";
import Testimonials3 from "@/components/Testimonials3";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

export default function PageContent(): JSX.Element {
  return (
    <>
      <Hero />
      <Problem />
      <FeaturesAccordion />
      <Process />
      <Testimonials3 />
      <Pricing />
      <FAQ />
      <CTA />
    </>
  );
}
