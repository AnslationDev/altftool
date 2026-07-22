"use client";

import { useEffect, useState, useRef, Fragment } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  { title: "Free Consultation", desc: "We analyze your roof, energy usage, and goals. Completely free, no commitment." },
  { title: "Custom Design", desc: "Our engineers design a system optimized for your home's exact dimensions and orientation." },
  { title: "Expert Installation", desc: "Certified Helios installers complete the job in 1–2 days with zero mess left behind." },
  { title: "Start Saving", desc: "Your system activates and your energy costs drop immediately. Monitor everything in the app." }
];

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    // Fast 1000ms per point timing
    const delay = 1000;

    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev === 4 ? 0 : prev + 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [activeStep, isInView]);

  const currentActive = Math.min(activeStep, 3);

  return (
    <section ref={sectionRef} id="how-it-works" className="dark-section relative overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="section-overline section-overline--light text-center block">Process</span>
          <h2 className="section-heading text-center">From Quote to Clean Energy</h2>
        </div>

        {/* Steps container */}
        <div className="relative">
          {/* Symmetrical step layout */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 md:gap-0 relative z-10 w-full">
            {steps.map((step, i) => {
              const isActive = i <= currentActive;
              const isCurrent = i === currentActive;

              return (
                <Fragment key={i}>
                  {/* Step Card */}
                  <motion.div
                    animate={isActive ? {
                      opacity: 1,
                      scale: isCurrent ? [0.9, 1.05, 1] : 1,
                      y: 0
                    } : {
                      opacity: 0.25,
                      scale: 0.9,
                      y: 10
                    }}
                    transition={(activeStep === 0 && !isCurrent) ? {
                      duration: 0 // Instant reset for inactive cards
                    } : {
                      duration: 0.6, // Snappier card animation (600ms)
                      ease: "easeOut",
                      scale: {
                        times: [0, 0.5, 1],
                        duration: isCurrent ? 0.6 : 0.2
                      }
                    }}
                    className="step-item flex-1 text-center"
                  >
                    <div className="step-circle relative z-10 select-none">
                      {i + 1}
                    </div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-desc">{step.desc}</p>
                  </motion.div>

                  {/* Connecting Line (placed between cards) */}
                  {i < steps.length - 1 && (
                    <>
                      {/* Desktop Horizontal Line Segment */}
                      <div className="hidden md:flex flex-shrink-0 w-12 lg:w-20 items-center justify-center mx-2 self-start mt-[2rem]">
                        <div className="w-full h-[2px] relative" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                          <motion.div
                            className="absolute inset-0"
                            style={{ backgroundColor: "#ffffff", originX: 0 }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: i < currentActive ? 1 : 0 }}
                            transition={activeStep === 0 ? { duration: 0 } : { duration: 0.5, ease: "easeInOut" }}
                          />
                        </div>
                      </div>

                      {/* Mobile Vertical Line Segment */}
                      <div className="md:hidden flex h-8 w-[2px] relative my-2 mx-auto" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                        <motion.div
                          className="absolute inset-0"
                          style={{ backgroundColor: "#ffffff", originY: 0 }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: i < currentActive ? 1 : 0 }}
                          transition={activeStep === 0 ? { duration: 0 } : { duration: 0.5, ease: "easeInOut" }}
                        />
                      </div>
                    </>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
