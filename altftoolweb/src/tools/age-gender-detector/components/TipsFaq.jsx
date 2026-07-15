"use client";

import { useState } from "react";
import { ChevronDown, CircleCheck, Lightbulb, TriangleAlert } from "lucide-react";
import { toneColor, toneStyle } from "../utils/tones";
import { CARD, CardHeading, FOCUS_RING } from "./ui.jsx";

const TIPS = [
  "Use a clear, front-facing photo",
  "Good lighting improves accuracy",
  "Avoid sunglasses or face coverings",
  "Single face works best",
];

const LIMITATIONS = [
  "Results are estimates, not exact",
  "May be less accurate in low light",
  "Multiple faces not always detected",
  "AI may not work on very low quality images",
];

const FAQS = [
  {
    question: "Is this tool free to use?",
    answer:
      "Yes — the Age & Gender Detector is 100% free with no sign-up required. Analyze as many photos as you like.",
  },
  {
    question: "Is my image uploaded or stored?",
    answer:
      "No. All processing happens locally in your browser using an on-device AI model. Your photos never leave your device and nothing is stored.",
  },
  {
    question: "How accurate is the age prediction?",
    answer:
      "The AI provides an estimate that is typically within a few years for clear, well-lit, front-facing photos. Lighting, angle, and image quality all affect accuracy.",
  },
  {
    question: "Does it work on group photos?",
    answer:
      "Yes — the detector can find multiple faces in one photo and you can switch between them. For best accuracy though, a single clear face works best.",
  },
];

function Tips() {
  return (
    <section aria-label="Best results tips" className={`${CARD} p-4 sm:p-5`}>
      <CardHeading
        icon={
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[8px]"
            style={toneStyle("warning")}
          >
            <Lightbulb size={16} aria-hidden="true" />
          </span>
        }
        title="Best Results Tips"
      />
      <ul className="space-y-2.5">
        {TIPS.map((tip) => (
          <li key={tip} className="flex items-start gap-2.5 text-sm leading-5 text-(--muted-foreground)">
            <CircleCheck
              size={16}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              style={{ color: toneColor("success") }}
            />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Limitations() {
  return (
    <section aria-label="Limitations" className={`${CARD} p-4 sm:p-5`}>
      <CardHeading
        icon={
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[8px]"
            style={toneStyle("danger")}
          >
            <TriangleAlert size={16} aria-hidden="true" />
          </span>
        }
        title="Limitations"
      />
      <ul className="space-y-2.5">
        {LIMITATIONS.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm leading-5 text-(--muted-foreground)">
            <span
              aria-hidden="true"
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: toneColor("warning") }}
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section aria-label="Frequently asked questions" className={`${CARD} p-4 sm:p-5`}>
      <h2 className="mb-3 text-sm font-bold tracking-tight text-(--foreground)">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          const panelId = `altft-agd-faq-${index}`;
          return (
            <div
              key={faq.question}
              className={`overflow-hidden rounded-[8px] border bg-(--background) transition-colors ${
                open
                  ? "border-[color-mix(in_srgb,var(--primary)_55%,var(--border))]"
                  : "border-(--border)"
              }`}
            >
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
                className={`flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left text-sm font-semibold text-(--foreground) transition hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`}
              >
                {faq.question}
                <ChevronDown
                  size={15}
                  aria-hidden="true"
                  className={`shrink-0 text-(--muted-foreground) transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <p id={panelId} className="px-3.5 pb-3.5 text-sm leading-6 text-(--muted-foreground)">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function TipsFaq() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Tips />
      <Limitations />
      <Faq />
    </div>
  );
}
