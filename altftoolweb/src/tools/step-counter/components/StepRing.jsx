"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { formatNumber } from "../utils/stepStore";
import { C } from "./stepTheme";

/* The ring is the page. Its box is fluid (it takes the width it is given, up to
   a ceiling) and everything inside it is sized in container-query units, so the
   digits keep their proportion from a 320px phone to a 22rem desktop column. */

const RING = { size: 264, r: 112, stroke: 22 };

/**
 * The count has to fit inside the ring, not merely inside its bounding box.
 *
 * A flat 27cqw looks right at "0" and breaks as soon as the number has a comma
 * in it: the clear inner diameter is 2*(r - stroke/2)/size = 76.5% of the box,
 * and at 27cqw a five-character "9,999" already needs 105% of that on a 390px
 * phone. Since tabular-nums makes every glyph the same width, the size that
 * fits is simple arithmetic on the character count.
 */
const RING_CLEAR_CQW = (2 * (RING.r - RING.stroke / 2) * 100) / RING.size;
const GLYPH_EM = 0.62; // tabular-nums advance, commas included

function countFontSize(text) {
  const chars = Math.max(String(text).length, 1);
  const fits = RING_CLEAR_CQW / (GLYPH_EM * chars);
  return `clamp(28px, ${Math.min(fits, 27).toFixed(2)}cqw, 96px)`;
}

const RING_C = 2 * Math.PI * RING.r; // ≈ 703.7

/**
 * Animated count-up for the big number: eases from the currently shown value to
 * the new one so the counter feels alive instead of snapping. Jumps straight to
 * the target under prefers-reduced-motion.
 */
export function useCountUp(value) {
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const rafRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const from = shownRef.current;
    const to = value;
    if (from === to) return undefined;
    if (reducedRef.current) {
      shownRef.current = to;
      setShown(to);
      return undefined;
    }
    const dur = Math.min(700, 220 + Math.abs(to - from) * 4);
    let startTs;
    const tick = (ts) => {
      if (startTs === undefined) startTs = ts;
      const p = Math.min(1, (ts - startTs) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      shownRef.current = val;
      setShown(val);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return shown;
}

/**
 * @param {string} label   what the screen is actually doing right now — never
 *                         "Tracking…" when nothing can be counted.
 * @param {boolean} live   pulse the label (a real session is running)
 */
export default function StepRing({ steps, goal, progress, label, live }) {
  const shownSteps = useCountUp(steps);

  // Arc sweeps in from zero on mount (the CSS transition carries it to the real
  // value one frame later).
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // One-shot celebratory pop the moment the daily goal is crossed.
  const goalMet = progress >= 100;
  const [celebrate, setCelebrate] = useState(false);
  const prevGoalMet = useRef(false);
  useEffect(() => {
    if (goalMet && !prevGoalMet.current) {
      setCelebrate(true);
      const t = window.setTimeout(() => setCelebrate(false), 900);
      prevGoalMet.current = true;
      return () => window.clearTimeout(t);
    }
    prevGoalMet.current = goalMet;
    return undefined;
  }, [goalMet]);

  const target = (Math.min(progress, 100) / 100) * RING_C;
  const ringDash = drawn ? target : 0.001;

  return (
    // svh (not vh) so browser chrome cannot push the count and the button that
    // follows it off a short screen — a landscape phone or a 1366x768 laptop.
    <div className="relative mx-auto aspect-square w-[min(78vw,52svh,20rem)] max-w-full [container-type:inline-size] md:w-full">
      {live ? (
        <div
          aria-hidden="true"
          className="sc3-glow-pulse pointer-events-none absolute -inset-4 rounded-full"
          style={{ background: "var(--sc3-glow)" }}
        />
      ) : null}

      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${RING.size} ${RING.size}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sc3-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={C.accent2} />
            <stop offset="100%" stopColor={C.accent} />
          </linearGradient>
        </defs>
        <circle
          cx={RING.size / 2}
          cy={RING.size / 2}
          r={RING.r}
          fill="none"
          strokeWidth={RING.stroke}
          style={{ stroke: "var(--sc3-track)" }}
        />
        {/* no arc at 0% — a rounded linecap would paint a lone dot */}
        {target > 0 ? (
          <circle
            className="sc3-ring-arc"
            cx={RING.size / 2}
            cy={RING.size / 2}
            r={RING.r}
            fill="none"
            stroke="url(#sc3-ring-grad)"
            strokeWidth={RING.stroke}
            strokeLinecap="round"
            strokeDasharray={`${ringDash.toFixed(1)} ${RING_C.toFixed(1)}`}
            transform={`rotate(-90 ${RING.size / 2} ${RING.size / 2})`}
          />
        ) : null}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2cqw] px-[12cqw] text-center">
        <span
          className={`font-semibold uppercase tracking-[.08em]${live ? " sc3-soft-pulse" : ""}`}
          style={{ color: C.muted, fontSize: "clamp(14px, 5cqw, 16px)" }}
        >
          {label}
        </span>

        {/* The live count must NOT be announced on every step — the polite
            milestone region in StepAppV2 does the announcing. */}
        <span
          className={`font-bold leading-[1.02] tracking-[-.03em] tabular-nums${celebrate ? " sc3-goal-pop" : ""}`}
          style={{ color: C.ink, fontSize: countFontSize(formatNumber(shownSteps)) }}
          aria-hidden="true"
        >
          {formatNumber(shownSteps)}
        </span>

        {goalMet ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
            style={{
              background: C.accentSoft,
              color: C.accentText,
              fontSize: "clamp(14px, 5cqw, 16px)",
            }}
          >
            <Check size={15} aria-hidden="true" strokeWidth={2.5} />
            Goal reached
          </span>
        ) : (
          <span style={{ color: C.muted, fontSize: "clamp(14px, 5.4cqw, 17px)" }}>
            of {formatNumber(goal)} steps
          </span>
        )}
      </div>

      {/* One accessible sentence instead of a digit stream. */}
      <span className="sr-only">
        {formatNumber(steps)} of {formatNumber(goal)} steps today. {label}.
      </span>
    </div>
  );
}
