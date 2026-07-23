"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

/**
 * FAQ accordion.
 *
 * Answers stay mounted in the DOM (hidden with the `hidden` attribute) rather
 * than being conditionally rendered, so the text is present for crawlers and
 * for in-page browser search even while collapsed.
 */
export default function HnFaq({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (faqs.length === 0) return null;

  return (
    <div className="hn-faq">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `hn-faq-panel-${index}`;
        const buttonId = `hn-faq-button-${index}`;

        return (
          <div key={faq.q} className="hn-faq-item" data-open={isOpen ? "true" : "false"}>
            <h3>
              <button
                type="button"
                id={buttonId}
                className="hn-faq-q"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                {faq.q}
                <span className="hn-faq-sign" aria-hidden="true">
                  <Plus size={14} strokeWidth={2.6} />
                </span>
              </button>
            </h3>

            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
              <p className="hn-faq-a">{faq.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
