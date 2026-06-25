'use client'

import { useState } from "react";
import { FAQ_ITEMS } from "../utils/constants.jsx";
import { ChevronDown } from "lucide-react";

export function AncestorFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-(--foreground) text-center mb-10" style={{ fontFamily: "Georgia, serif" }}>Have Questions?</h2>
        <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-(--border) dark:border-(--border)">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between py-4 text-left text-gray-800 dark:text-(--foreground) font-medium text-base hover:text-primary transition-colors">
                <span>{item.question}</span>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 ml-4 text-gray-400 dark:text-(--muted-foreground) transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && <div className="pb-5 text-gray-600 dark:text-(--secondary-foreground) text-sm leading-relaxed pr-8">{item.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
