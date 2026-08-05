"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    question: "Where do listing prices and metrics come from?",
    answer:
      "Publishers submit their listing details, including placement prices and any metrics they choose to provide. Admins review listings before public display, but review does not independently guarantee every submitted metric. Unavailable values remain unavailable.",
  },
  {
    question: "What happens when I place an order?",
    answer:
      "ALTFTool creates a placement request tied to the selected listing and placement type. The request records the listing price at that time, but it is not a payment receipt and does not guarantee that the publisher will accept or publish it.",
  },
  {
    question: "Does ALTFTool collect payments or hold funds?",
    answer:
      "No current marketplace flow shown here collects, holds, or releases funds. Any commercial arrangements require separate confirmation; a status change in ALTFTool should not be treated as proof of payment.",
  },
  {
    question: "Does admin approval verify every website metric?",
    answer:
      "Admin approval means the submitted listing passed the platform review step. Metrics can be publisher-supplied or unavailable, so buyers should evaluate the listing details before sending a request.",
  },
  {
    question: "Are publication, link attributes, or indexing guaranteed?",
    answer:
      "No. A publisher may submit a live URL for review, but ALTFTool does not guarantee publication, link permanence, dofollow status, search-engine indexing, rankings, traffic, or any other search outcome.",
  },
  {
    question: "Is turnaround time guaranteed?",
    answer:
      "No. A listing may include a publisher-provided turnaround estimate. It is contextual information for the request, not a service-level guarantee from ALTFTool.",
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="altf-card space-y-6 border border-border p-6 sm:p-8" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-xl space-y-2 text-center">
        <h2 id="faq-heading" className="flex items-center justify-center gap-2 text-2xl font-black tracking-tight text-foreground">
          <HelpCircle className="h-6 w-6 text-primary" aria-hidden="true" />
          Frequently asked questions
        </h2>
        <p className="text-sm text-muted">How listing data, review, and placement requests work today.</p>
      </div>

      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIdx === index;
          const panelId = `altflinking-faq-panel-${index}`;
          return (
            <div key={faq.question} className="overflow-hidden rounded-lg border border-border bg-surface">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIdx(isOpen ? null : index)}
                className="flex min-h-11 w-full items-center justify-between gap-4 p-4 text-left text-sm font-bold text-foreground transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {isOpen && (
                <div id={panelId} className="border-t border-border p-4 text-xs leading-relaxed text-muted">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
