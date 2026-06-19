"use client";

import Hero from "./Hero";
import ToolsShowcase from "./ToolsShowcase";
import Benefits from "./Benefits";
import Workflow from "./Workflow";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";

export default function HomeClient() {
  return (
    <>
      <Hero />
      <ToolsShowcase />
      <Benefits />
      <Workflow />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </>
  );
}
