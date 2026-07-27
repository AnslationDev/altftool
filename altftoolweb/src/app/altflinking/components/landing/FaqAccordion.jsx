/**
 * Interactive FAQ Accordion Component
 * Location: src/app/altflinking/components/landing/FaqAccordion.jsx
 */

"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How does domain ownership verification work?",
      a: "Publishers verify domain ownership by adding a unique TXT record (e.g. altftool-verify=xyz...) to their domain DNS settings. Our automated crawler checks the DNS TXT record instantly, ensuring zero unauthorized third-party brokers.",
    },
    {
      q: "How does the Escrow Payment Guarantee protect buyers?",
      a: "When you place a guest post or link insertion order, your payment is held securely in platform escrow. Funds are only released to the publisher after our system crawls the published URL and confirms that your target anchor and dofollow link are live and indexed by Google.",
    },
    {
      q: "What happens if a link is removed or changed to nofollow later?",
      a: "Our continuous 24/7 crawler monitors every active backlink placed through ALTFTool. If a link drops, encounters a 404/500 error, or changes rel attribute to nofollow, an emergency alert is sent to the publisher to fix it within 48 hours or trigger an automatic escrow refund.",
    },
    {
      q: "Are there any upfront listing fees for website publishers?",
      a: "No! Listing your verified domain on ALTFTool Marketplace is 100% free. Publishers keep 100% of their set listing price. We charge buyers a transparent 15% platform escrow & verification fee.",
    },
    {
      q: "What is the typical turnaround time (TAT) for backlink orders?",
      a: "Average turnaround time across our marketplace is 2.4 days. Every publisher listing clearly specifies its guaranteed TAT limit (ranging from 1 to 5 days).",
    },
  ];

  return (
    <div className="altf-card p-8 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 text-indigo-400" />
          <span>Frequently Asked Questions</span>
        </h2>
        <p className="text-xs text-slate-500">Everything you need to know about purchasing and listing backlinks on ALTFTool</p>
      </div>

      <div className="space-y-3 max-w-3xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-white hover:text-indigo-400 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-slate-500 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
