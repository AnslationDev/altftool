"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";

export default function FAQSection() {
  const faqs = [
    {
      question: "What is the Ambient Sound Mixer?",
      answer:
        "It is a web-based productivity and relaxation tool that allows you to play and mix multiple background sounds—like rain, waves, crackling fireplace, and white noise—at different volume levels to create your personalized audio environment.",
    },
    {
      question: "What is Flow Mode?",
      answer:
        "Flow Mode is a natural variation feature that subtly adjusts the volumes of your active sounds up and down over time. This mimics real-world sound behaviors (like wind gusting or rain intensifying) to prevent your brain from tuning out a static loop.",
    },
    {
      question: "How do I share a custom mix?",
      answer:
        "Simply configure your sounds, click the 'Share' button, and copy the generated link. When someone opens that link, the application will automatically load your exact sound layers and volume balances.",
    },
    {
      question: "Does the sleep timer support fading?",
      answer:
        "Yes! When you enable 'Smooth Fade Out' in the sleep timer settings, the audio will gradually fade down to absolute silence over the last 15 seconds of the countdown, preventing a sudden stop from waking you up.",
    },
    {
      question: "Are these sounds free to use?",
      answer:
        "Yes, all ambient sounds provided in this tool are royalty-free, public domain, or creative commons licensed, optimized for your personal relaxation, study, sleep, or focus sessions.",
    },
  ];

  const [openIdx, setOpenIdx] = useState(null);

  const toggleOpen = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-12 border-t border-slate-200/50 dark:border-slate-800/80">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 font-semibold">
            Everything you need to know about the Ambient Sound Mixer.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-250 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm transition-colors duration-200"
              >
                <button
                  onClick={() => toggleOpen(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <Icons.ChevronUp size={16} className="text-sky-500 shrink-0" />
                  ) : (
                    <Icons.ChevronDown size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-48 border-t border-slate-200/50 dark:border-slate-800/80" : "max-h-0"
                  }`}
                >
                  <p className="p-5 text-xs text-slate-700 dark:text-slate-250 font-semibold leading-relaxed bg-white/30 dark:bg-slate-950/20">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
