import React from 'react';
import { motion } from 'framer-motion';
import { Search, SprayCan, Eye, Shield } from 'lucide-react';

const steps = [
  {
    number: "01",
    title: "Inspection",
    desc: "Thorough property inspection to identify pests, entry points, and conditions contributing to the infestation.",
    icon: Search
  },
  {
    number: "02",
    title: "Treatment",
    desc: "Targeted, science-backed treatment using the safest and most effective methods for your specific pest problem.",
    icon: SprayCan
  },
  {
    number: "03",
    title: "Monitoring",
    desc: "Follow-up visits and monitoring to confirm elimination and make adjustments as needed for lasting results.",
    icon: Eye
  },
  {
    number: "04",
    title: "Protection",
    desc: "Long-term prevention strategies, exclusion work, and scheduled maintenance to keep pests from returning.",
    icon: Shield
  }
];

const ProcessTimeline = () => {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={index}
            whileHover={{ y: -3 }}
            className="relative card p-7 group"
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#1D7A43] text-white flex items-center justify-center text-xl font-bold tracking-tighter">{step.number}</div>
              <div className="text-[#1D7A43]">
                <Icon size={26} />
              </div>
            </div>
            <h4 className="font-bold text-xl mb-2.5 tracking-tight">{step.title}</h4>
            <p className="text-sm text-[#374151] leading-relaxed">{step.desc}</p>

            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-12 -right-3 w-6 h-px bg-[#E5E7EB]" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProcessTimeline;
