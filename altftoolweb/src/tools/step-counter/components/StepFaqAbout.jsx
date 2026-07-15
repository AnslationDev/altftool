"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown, ShieldCheck, WifiOff } from "lucide-react";
import { toneStyle } from "../utils/tones";
import { CARD, FOCUS_RING, SectionHeading } from "./ui.jsx";

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
      "Yes. On mobile devices, Step Counter uses your phone's motion sensors to automatically detect steps while you walk. On desktop, you can add steps manually or use the demo pace.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Absolutely. All of your step data is stored only in your browser (localStorage). Nothing is uploaded to any server, and you can reset it at any time.",
  },
];

const HIGHLIGHTS = [
  {
    icon: BadgeCheck,
    tone: "success",
    title: "100% Free",
    subtitle: "No sign up required",
  },
  {
    icon: ShieldCheck,
    tone: "primary",
    title: "Private & Secure",
    subtitle: "Your data stays with you",
  },
  {
    icon: WifiOff,
    tone: "info",
    title: "Works Offline",
    subtitle: "Runs in your browser",
  },
];

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section aria-label="Frequently asked questions" className={`${CARD} p-4 sm:p-5`}>
      <SectionHeading eyebrow="Good to know" title="Frequently Asked Questions" />
      <div className="space-y-2">
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          const panelId = `altft-step-faq-${index}`;
          return (
            <div
              key={faq.question}
              className={`overflow-hidden rounded-[8px] border transition-colors ${
                open
                  ? "border-[color-mix(in_srgb,var(--primary)_55%,var(--border))] bg-(--background)"
                  : "border-(--border) bg-(--background)"
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
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform ${open ? "rotate-180" : ""}`}
                  style={
                    open
                      ? {
                          backgroundColor: "var(--anslation-ds-primary-soft)",
                          color:
                            "color-mix(in srgb, var(--anslation-ds-primary) 60%, var(--foreground))",
                        }
                      : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
                  }
                >
                  <ChevronDown size={14} aria-hidden="true" />
                </span>
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

function About() {
  return (
    <section aria-label="About Step Counter" className={`${CARD} p-4 sm:p-5`}>
      <SectionHeading eyebrow="Why AltF" title="About Step Counter" />
      <p className="text-sm leading-6 text-(--muted-foreground)">
        Step Counter is a free online tool by AltF Tool that helps you track your daily steps,
        distance, calories burned, and active time. It&apos;s simple, fast, and 100% free — no sign
        up required. Set a goal, keep your streak alive, and start your fitness journey today!
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-[10px] border border-(--border) bg-(--background) p-3"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={toneStyle(item.tone)}
            >
              <item.icon size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-(--foreground)">{item.title}</p>
              <p className="truncate text-xs text-(--muted-foreground)">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function StepFaqAbout() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
      <Faq />
      <About />
    </div>
  );
}
