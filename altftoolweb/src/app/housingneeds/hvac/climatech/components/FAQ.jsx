"use client";
import { useState } from "react";
import { useReveal } from "../hooks/useReveal";

const faqs = [
  {
    q: "How quickly can you respond to an emergency HVAC issue?",
    a: "We offer 24/7 emergency service with most technicians arriving within 60 minutes. Call our emergency hotline and we'll dispatch the nearest certified technician immediately.",
  },
  {
    q: "What brands of HVAC systems do you install?",
    a: "We install all major brands including Carrier, Trane, Lennox, Goodman, and Rheem. Our technicians are factory-trained and can recommend the best system for your specific needs and budget.",
  },
  {
    q: "How often should I service my HVAC system?",
    a: "We recommend bi-annual maintenance — once in spring for cooling systems and once in fall for heating systems. Regular maintenance extends system life, improves efficiency, and prevents costly breakdowns.",
  },
  {
    q: "Do you offer financing options?",
    a: "Yes, we offer flexible financing plans with 0% APR options for qualified customers. We'll work with you to find a payment plan that fits your budget while getting your system installed.",
  },
  {
    q: "What warranty do you provide on installations?",
    a: "All our installations include a 10-year parts warranty and 5-year labor warranty. We also offer extended warranty options for added peace of mind.",
  },
  {
    q: "Are your technicians certified and insured?",
    a: "Absolutely. All our technicians are EPA-certified, NATE-trained, fully licensed, bonded, and insured. We conduct background checks and drug screening for your safety.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const headerRef = useReveal();
  const listRef = useReveal();

  return (
    <section className="relative py-8 lg:py-10 bg-[#F7F3EB]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div ref={headerRef} className="reveal text-center mb-16">
          <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
            Common Questions
          </h2>
          <p className="text-lg text-[#555] leading-relaxed">
            Everything you need to know about our services.
          </p>
        </div>

        <div ref={listRef} className="reveal-stagger space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-500 ${isOpen
                    ? "bg-[#EFE6D6] border-[#A8BCD6]"
                    : "bg-white/60 border-[#D4C9B5]/60 hover:border-[#D4C9B5]"
                  }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span
                    className={`font-serif-display text-lg font-medium pr-4 ${isOpen ? "text-[#1a1a1a]" : "text-[#333]"
                      }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isOpen
                        ? "bg-[#C5D2E8] text-[#1a1a1a] rotate-45"
                        : "bg-[#D4C9B5]/40 text-[#555]"
                      }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-60" : "max-h-0"
                    }`}
                >
                  <div className="px-6 pb-6 text-[#555] leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
