"use client";

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { softMurmurFaqs as faqs } from "../data/faqs";

export default function FAQSection() {
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
