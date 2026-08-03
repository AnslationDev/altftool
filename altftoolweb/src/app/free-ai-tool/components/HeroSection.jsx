"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ToolLogo from "./ToolLogo";
import {
  HEADING_CHAR_MS,
  HEADING_START_DELAY,
  WORD_STAGGER,
  WORD_DURATION,
  getHeroSequenceTimings,
} from "../lib/heroTiming";

const EASE = [0.22, 1, 0.36, 1];

const FLOATING_LOGOS = [
  { name: "Figma", domain: "figma.com", size: 60, offset: 8 },
  { name: "Webflow", domain: "webflow.com", size: 60, offset: -14 },
  { name: "Dribbble", domain: "dribbble.com", size: 68, offset: -34 },
  { name: "Notion", domain: "notion.so", size: 72, offset: -52 },
  { name: "Framer", domain: "framer.com", size: 84, offset: -18 },
  { name: "Sketch", domain: "sketch.com", size: 52, offset: 34 },
  { name: "Canva", domain: "canva.com", size: 56, offset: 48 },
  { name: "Spline", domain: "spline.design", size: 64, offset: 22 },
  { name: "Raycast", domain: "raycast.com", size: 70, offset: 2 },
  { name: "Miro", domain: "miro.com", size: 68, offset: -18 },
];

/** Reveals `text` one character at a time. Runs once (no re-loop) so the
 *  page reaches a stable final state, per the "everything settles" intent
 *  of the overall hero sequence. */
function useTypewriter(text, { enabled = true, startDelayMs = 0 } = {}) {
  const [count, setCount] = useState(enabled ? 0 : text.length);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setCount(text.length);
      setDone(true);
      return undefined;
    }
    setCount(0);
    setDone(false);
    let charTimer;
    const startTimer = setTimeout(() => {
      let i = 0;
      charTimer = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          clearInterval(charTimer);
          setDone(true);
        }
      }, HEADING_CHAR_MS);
    }, startDelayMs);
    return () => {
      clearTimeout(startTimer);
      if (charTimer) clearInterval(charTimer);
    };
  }, [text, enabled, startDelayMs]);

  return { display: text.slice(0, count), done };
}

export default function HeroSection({
  title = "Discover the Best Design Resources & Tools",
  description = "A carefully curated directory of 200+ design tools, hand-picked for quality, innovation, and ease of use. Updated regularly for the community.",
}) {
  const shouldReduceMotion = useReducedMotion();
  const { subheadingStart } = getHeroSequenceTimings(title, description);

  const { display: typedTitle } = useTypewriter(title, {
    enabled: !shouldReduceMotion,
    startDelayMs: HEADING_START_DELAY * 1000,
  });

  const [showCaret, setShowCaret] = useState(!shouldReduceMotion);
  useEffect(() => {
    if (shouldReduceMotion) return undefined;
    const timer = setTimeout(() => setShowCaret(false), subheadingStart * 1000);
    return () => clearTimeout(timer);
  }, [shouldReduceMotion, subheadingStart]);

  const words = description.trim().split(/\s+/).filter(Boolean);
  const headingClass = "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-[#0A0523]";

  return (
    <section className="relative overflow-hidden px-4 pt-14 pb-6 sm:pt-16 sm:pb-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <div className="relative">
              {/* Real, always-present heading: reserves the final layout
                  size (so nothing around it jumps as the typed text grows)
                  and is what SEO crawlers / screen readers actually read. */}
              <h1 className={`${shouldReduceMotion ? "" : "opacity-0"} ${headingClass}`}>{title}</h1>
              {!shouldReduceMotion ? (
                <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${headingClass}`}>
                  {typedTitle}
                  {showCaret ? <span className="hero-caret" /> : null}
                </div>
              ) : null}
            </div>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-[#0A0523]/70 max-w-lg leading-relaxed"
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { delayChildren: subheadingStart, staggerChildren: WORD_STAGGER } },
              }}
            >
              {words.map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { duration: WORD_DURATION, ease: EASE } },
                  }}
                >
                  {word}
                  {idx < words.length - 1 ? " " : ""}
                </motion.span>
              ))}
            </motion.p>
          </div>

          <div className="relative hidden lg:flex items-center justify-center h-52">
            <div className="flex items-center">
              {FLOATING_LOGOS.map((logo, idx) => (
                <motion.div
                  key={logo.name}
                  className="shrink-0"
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + idx * 0.06, ease: EASE }}
                  style={{ marginLeft: idx === 0 ? 0 : -20, zIndex: idx }}
                >
                  <div
                    className="animate-float relative shrink-0 rounded-full bg-white ring-4 ring-white shadow-[0_8px_24px_rgba(76,29,149,0.12)] flex items-center justify-center"
                    style={{
                      width: logo.size,
                      height: logo.size,
                      "--offset": `${logo.offset}px`,
                      animationDelay: `${idx * 0.15}s`,
                    }}
                  >
                    <ToolLogo name={logo.name} domain={logo.domain} size={Math.round(logo.size * 0.52)} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gentle-bob {
          0%, 100% { transform: translateY(var(--offset, 0px)); }
          50% { transform: translateY(calc(var(--offset, 0px) - 8px)); }
        }
        .animate-float {
          animation: gentle-bob 3.6s ease-in-out infinite;
        }
        .hero-caret {
          display: inline-block;
          width: 3px;
          height: 0.9em;
          margin-left: 2px;
          vertical-align: -0.1em;
          background: currentColor;
          animation: caret-blink 0.9s step-end infinite;
        }
        @keyframes caret-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float { animation: none; }
          .hero-caret { animation: none; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
