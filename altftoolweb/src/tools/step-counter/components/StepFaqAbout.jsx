"use client";

/**
 * FAQ + About — styled with the Step Counter app theme (see ./theme.js, which
 * resolves to StepAppV2's cyan palette) so the whole page reads as one
 * premium product.
 *
 * CONTENT RULES for this file. Everything here is read by people mid-walk who
 * are looking at a number that is or isn't moving, so it has to match the code
 * exactly:
 *   - steps come ONLY from `devicemotion` (utils/useStepCounter.js). There is
 *     no manual entry, no simulated pace, no desktop fallback.
 *   - the detector banks the first peaks and releases them once four arrive in
 *     walking cadence (CONFIRM_STEPS in utils/stepDetector.js).
 *   - distance/calories/floors are fixed constants for everyone —
 *     METERS_PER_STEP 0.762, CALORIES_PER_STEP 0.04, STEPS_PER_FLOOR 650
 *     (utils/stepStore.js). No weight, no height, no barometer.
 *   - persistence is localStorage on this device; `resetToday` zeroes TODAY
 *     only — history, goal and achievements survive it.
 *   - there is NO offline support: the root service worker at public/sw.js
 *     unregisters itself and clears its caches, and app/layout.jsx actively
 *     unregisters it. The page cannot be loaded without a network.
 * Two claims that used to live here — "on desktop, you can add steps manually
 * or use the built-in walking pace" and a "Works Offline" badge — were not
 * true of any of the above.
 */

import { useState } from "react";
import { BadgeCheck, ChevronDown, Footprints, ShieldCheck, Smartphone } from "lucide-react";
import { THEME as C } from "./theme.js";

// Deliberately NOT the same questions as src/tools/step-counter/seo.js, whose
// FAQ block renders further down this same page (ToolSeoSection) and carries
// the FAQPage schema. That set answers the search-facing questions ("what is a
// step counter", "does it work without an app"); this set answers the
// operational ones a visitor has with the counter open in front of them.
const FAQS = [
  {
    question: "What does Step Counter track?",
    answer:
      "Today's step count, plus estimated distance, calories and the time you spent active. On top of that: a daily goal, your current streak and the last seven days.",
  },
  {
    question: "Why isn't it counting my steps?",
    answer:
      "Steps come only from your phone's motion sensor, so there are three usual reasons. You're on a desktop or laptop, which has no motion sensor at all. Or you're on an iPhone and motion access wasn't allowed when the browser asked. Or you've only taken a step or two — the counter holds the first steps back until four of them arrive in a steady walking rhythm, then releases them together, which is what stops a tap or a bump from counting.",
  },
  {
    question: "Does it count in my pocket, or with the screen off?",
    answer:
      "In a pocket, yes — detection is tuned for a phone held in your hand or carried in a pocket at a normal walking pace. With the screen off, no: the browser stops sending motion readings the moment the phone sleeps or you switch to another app, so keep the screen awake with this page open while you walk. Anything counted before that is already saved.",
  },
  {
    question: "How are distance and calories worked out?",
    answer:
      "Both are estimates and both say so on screen. Distance uses your step length — 0.415 x your height once you enter it, otherwise a 0.75 m average. Calories scale with your weight, about 0.0006 kcal per step per kilogram, assuming 70 kg until you tell it otherwise. There is no floors count: that needs a barometer, and a browser cannot read one.",
  },
  {
    question: "Is my step data private?",
    answer:
      "Yes. Your steps, goal, streak and achievements are saved in this browser's local storage on this device and are never uploaded — there's no account and no server behind it. Reset clears today's steps and active time; earlier days, your goal and your achievements stay.",
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
    subtitle: "Nothing leaves your phone",
  },
  {
    icon: Smartphone,
    bg: "var(--sc-soft-blue)",
    fg: "var(--sc-blue)",
    title: "Real Motion Sensor",
    subtitle: "No simulated counting",
  },
];

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <p
        className="text-[12px] font-extrabold uppercase tracking-[0.14em]"
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
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[14px] font-bold transition md:text-[15px] focus-visible:ring-4 focus-visible:ring-indigo-300"
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
                  className="px-4 pb-4 text-[14px] font-medium leading-relaxed"
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

      <p className="text-[14px] font-medium leading-relaxed md:text-[15px]" style={{ color: C.muted }}>
        Step Counter is a free online pedometer by{" "}
        <span className="font-bold" style={{ color: C.ink }}>
          AltF Tool
        </span>
        . It reads your phone&apos;s built-in motion sensor straight from the browser — no app
        to install, no account — and turns your walking into a live step count with estimated
        distance, calories and active time. Set a daily goal, keep a streak going, and unlock
        achievements as the days add up. It needs a phone or tablet you can carry: a laptop has
        no motion sensor to read.
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
              <p className="text-[14px] font-extrabold" style={{ color: C.ink }}>
                {item.title}
              </p>
              <p className="truncate text-[14px] font-medium" style={{ color: C.muted }}>
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
