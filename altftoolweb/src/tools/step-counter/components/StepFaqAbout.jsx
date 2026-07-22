"use client";

/**
 * FAQ + About — styled with the Step Counter app theme (hardcoded
 * indigo/violet palette, see StepApp.jsx) so the whole page reads as one
 * premium product.
 */

import { useState } from "react";
import { BadgeCheck, ChevronDown, Footprints, ShieldCheck, WifiOff } from "lucide-react";
import { THEME as C } from "./StepApp.jsx";

const FAQS = [
  {
    question: "Is Step Counter free to use?",
    answer:
      "Yes — Step Counter is 100% free with no sign-up required. Open the page and start tracking your steps right away.",
  },
  {
    question: "What can I use Step Counter for?",
    answer:
      "Track your daily steps, distance walked, calories burned, and active time. Set a daily goal, build a streak, and unlock achievements as you stay consistent.",
  },
  {
    question: "Does Step Counter work on mobile?",
    answer:
      "Yes. On mobile devices, Step Counter uses your phone's motion sensors to automatically detect steps while you walk. On desktop, you can add steps manually or use the built-in walking pace.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Absolutely. Your step data is saved only in your own browser on this device — nothing is ever uploaded to any server. It stays there next time you visit, and you can clear it anytime with the Reset button.",
  },
];

const HIGHLIGHTS = [
  {
    icon: BadgeCheck,
    bg: "var(--sc-soft-green)",
    fg: "var(--sc-green)",
    title: "100% Free",
    subtitle: "No sign up required",
  },
  {
    icon: ShieldCheck,
    bg: "var(--sc-soft-indigo)",
    fg: "var(--sc-indigo)",
    title: "Private & Secure",
    subtitle: "Your data stays with you",
  },
  {
    icon: WifiOff,
    bg: "var(--sc-soft-blue)",
    fg: "var(--sc-blue)",
    title: "Works Offline",
    subtitle: "Runs in your browser",
  },
];

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <p
        className="text-[11px] font-extrabold uppercase tracking-[0.16em]"
        style={{ color: C.indigo }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-1 text-[18px] font-extrabold leading-tight md:text-[20px]"
        style={{ color: C.ink }}
      >
        {title}
      </h2>
    </div>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      aria-label="Frequently asked questions"
      className="rounded-[24px] p-4 md:p-6"
      style={{ backgroundColor: C.card, boxShadow: C.shadow }}
    >
      <SectionHeading eyebrow="Good to know" title="Frequently Asked Questions" />

      <div className="space-y-2">
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          const panelId = `altft-step-faq-${index}`;
          return (
            <div
              key={faq.question}
              className="overflow-hidden rounded-2xl transition-colors duration-200"
              style={{ backgroundColor: open ? C.indigoSoft : C.tile }}
            >
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[13px] font-bold transition md:text-[14px] focus-visible:ring-4 focus-visible:ring-indigo-300"
                style={{ color: open ? C.indigo : C.ink }}
              >
                {faq.question}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  style={
                    open
                      ? { background: C.grad, color: "#FFFFFF" }
                      : { backgroundColor: C.card, color: C.muted }
                  }
                >
                  <ChevronDown size={14} aria-hidden="true" />
                </span>
              </button>
              {open && (
                <p
                  id={panelId}
                  className="px-4 pb-4 text-[13px] font-medium leading-relaxed"
                  style={{ color: C.muted }}
                >
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

function About() {
  return (
    <section
      aria-label="About Step Counter"
      className="flex flex-col rounded-[24px] p-4 md:p-6"
      style={{ backgroundColor: C.card, boxShadow: C.shadow }}
    >
      <div className="flex items-start justify-between gap-3">
        <SectionHeading eyebrow="Why AltF" title="About Step Counter" />
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: C.grad, boxShadow: "0 6px 14px rgba(99,102,241,0.35)" }}
          aria-hidden="true"
        >
          <Footprints size={20} />
        </span>
      </div>

      <p className="text-[13px] font-medium leading-relaxed md:text-[14px]" style={{ color: C.muted }}>
        Step Counter is a free online tool by{" "}
        <span className="font-bold" style={{ color: C.ink }}>
          AltF Tool
        </span>{" "}
        that helps you track your daily steps, distance, calories burned, and active time.
        It&apos;s simple, fast, and 100% free — no sign up required. Set a goal, keep your streak
        alive, and start your fitness journey today!
      </p>

      <div className="mt-auto grid gap-3 pt-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-2xl p-3.5 sm:flex-col sm:items-start sm:gap-2.5"
            style={{ backgroundColor: C.tile }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: item.bg, color: item.fg }}
              aria-hidden="true"
            >
              <item.icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold" style={{ color: C.ink }}>
                {item.title}
              </p>
              <p className="truncate text-[11px] font-medium" style={{ color: C.muted }}>
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function StepFaqAbout() {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_1.15fr]">
      <Faq />
      <About />
    </div>
  );
}
