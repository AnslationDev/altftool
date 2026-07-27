"use client";

import { Download, Calendar, BarChart3, ArrowRight } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      icon: Download,
      title: "Install Extension",
      description: "Add Age Calculator to your Chrome browser.",
    },
    {
      number: "2",
      icon: Calendar,
      title: "Select Date of Birth",
      description: "Pick your date using the built-in calendar.",
    },
    {
      number: "3",
      icon: BarChart3,
      title: "Get Exact Age",
      description: "View your age in years, months, days, hours, minutes & seconds.",
    },
  ];

  return (
    <section id="how-it-works" className="py-8 space-y-8 scroll-mt-24">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[#0D9488]">
          SIMPLE • FAST • EASY
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          How It Works
        </h2>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative max-w-4xl mx-auto items-center">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div key={idx} className="relative">
              <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm text-center space-y-3 relative hover:border-[#00A656]/40 hover:shadow-md transition-all">
                {/* Step Number Circle */}
                <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white text-xs font-bold flex items-center justify-center mx-auto -mt-9 shadow-sm border-2 border-white">
                  {step.number}
                </div>

                {/* Icon Container */}
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[#0D9488] flex items-center justify-center mx-auto border border-[#00A656]/20">
                  <IconComp className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Dashed Connector Arrow between steps on Desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 text-gray-300 items-center">
                  <span className="text-xs font-mono tracking-tighter">-----›</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
