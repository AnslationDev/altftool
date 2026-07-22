"use client";

import { useState } from "react";
import { LifeBuoy, ChevronDown } from "lucide-react";
import { SectionHeader } from "@altftool/ui";
import { TROUBLESHOOTING_TIPS } from "../data/troubleshootingTips";

const TroubleshootingSection = ({ platform }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const tips = TROUBLESHOOTING_TIPS[platform] || [];

  if (!tips.length) return null;

  return (
    <section className="support-utility-section" aria-label="Troubleshooting">
      <SectionHeader
        title="Troubleshooting"
        description="Quick fixes for the issues visitors run into most often."
      />
      <div className="support-accordion">
        {tips.map((tip, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="support-accordion-item">
              <button
                type="button"
                className="support-accordion-trigger"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span className="support-accordion-trigger-left">
                  <LifeBuoy className="h-4 w-4" />
                  {tip.issue}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && <div className="support-accordion-panel">{tip.tip}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TroubleshootingSection;
