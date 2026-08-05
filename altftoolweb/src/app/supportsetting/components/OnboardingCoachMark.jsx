"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// Both selectors are stable, page-scoped class names that already exist on
// Home (see SettingsContent.jsx's `.support-persistent-search` wrapper and
// SupportLandingPage.jsx's `.support-landing-hero-platform` wrapper) —
// reused here as-is via a plain DOM query rather than threading refs
// through those components, so this feature can't accidentally change
// anything about how the search bar or device picker themselves render.
const STEPS = [
  {
    selector: ".support-persistent-search",
    title: "Search any setting",
    text: "Type here to jump straight to any setting or troubleshooting guide — no need to browse.",
  },
  {
    selector: ".support-landing-hero-platform",
    title: "Switch devices",
    text: "Pick a different platform here to see settings for that device instead of the one detected automatically.",
  },
];

/**
 * A small, one-time, two-step "here's where things are" coach-mark shown
 * only on a visitor's very first visit to Support Settings — highlights the
 * persistent search bar, then the platform/device picker, each with a short
 * callout. Dismissing it (Skip, Got it, the X, or Escape) marks it
 * permanently done via useOnboardingHint's localStorage flag (see
 * data/onboarding.js) — it never reappears on this browser afterward.
 *
 * Deliberately NOT a full-screen dimmed modal. This is a lightweight
 * highlight ring drawn around the real element (a `position:fixed` sibling
 * box measured from the live DOM via getBoundingClientRect, not a copy of
 * it) plus a small anchored tooltip bubble. The ring has `pointer-events:
 * none`, so the search bar and device picker underneath stay fully
 * clickable/typeable while the hint is showing — a visitor can just start
 * typing or tap a platform card and the hint simply stays out of the way,
 * rather than blocking the page the way a modal spotlight would.
 */
const OnboardingCoachMark = ({ active, onDismiss }) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const frameRef = useRef(null);

  const measure = useCallback(() => {
    const el = typeof document !== "undefined" ? document.querySelector(STEPS[step].selector) : null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    // Copied into a plain object (not the live DOMRect) so this only
    // updates state — and re-renders — when the position actually changes.
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useEffect(() => {
    if (!active || typeof window === "undefined") return undefined;
    measure();

    // Recompute on resize and on scroll from ANY scrollable ancestor
    // (capture:true is what makes a plain `window` listener see scroll
    // events from a nested `overflow:auto` container, since scroll events
    // don't bubble by default) — keeps the ring/tooltip glued to the real
    // element instead of drifting out of place.
    const onReflow = () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);

    const onKeyDown = (e) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", onReflow);
      window.removeEventListener("scroll", onReflow, true);
      window.removeEventListener("keydown", onKeyDown);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active, measure, onDismiss]);

  // Re-measure whenever the step changes while active, so the ring animates
  // to the new target instead of staying pinned to the previous one.
  useEffect(() => {
    if (active) measure();
  }, [active, step, measure]);

  if (!active || !rect || typeof window === "undefined") return null;

  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];

  const ringStyle = {
    top: rect.top - 6,
    left: rect.left - 6,
    width: rect.width + 12,
    height: rect.height + 12,
  };

  // Tooltip anchors just under the target by default, and flips above it
  // when there isn't enough room below (e.g. the device picker sitting near
  // the bottom of a short viewport). Horizontal position is clamped so the
  // bubble never runs off either edge of the screen on narrow/mobile
  // viewports — TOOLTIP_WIDTH mirrors the CSS's own `width: min(300px,
  // calc(100vw - 24px))` on .support-onboarding-tooltip exactly, so this
  // clamp always matches what actually got rendered instead of assuming a
  // fixed 300px that the CSS might have shrunk on a narrow screen.
  const TOOLTIP_WIDTH = Math.min(300, window.innerWidth - 24);
  const spaceBelow = window.innerHeight - (rect.top + rect.height);
  const placeAbove = spaceBelow < 170 && rect.top > 170;
  const tooltipLeft = Math.min(Math.max(rect.left, 12), Math.max(12, window.innerWidth - TOOLTIP_WIDTH - 12));
  const tooltipStyle = placeAbove
    ? { left: tooltipLeft, bottom: window.innerHeight - rect.top + 14 }
    : { left: tooltipLeft, top: rect.top + rect.height + 14 };

  return (
    <>
      <div className="support-onboarding-ring" style={ringStyle} aria-hidden="true" />
      <div
        className={`support-onboarding-tooltip ${placeAbove ? "support-onboarding-tooltip-above" : ""}`}
        style={tooltipStyle}
        role="dialog"
        aria-label="Quick tip"
      >
        <button type="button" className="support-onboarding-close" onClick={onDismiss} aria-label="Dismiss tip">
          <X className="h-3.5 w-3.5" />
        </button>
        <p className="support-onboarding-step">
          {step + 1} of {STEPS.length}
        </p>
        <h3 className="support-onboarding-title">{current.title}</h3>
        <p className="support-onboarding-text">{current.text}</p>
        <div className="support-onboarding-actions">
          <button type="button" className="support-onboarding-skip" onClick={onDismiss}>
            Skip
          </button>
          <button
            type="button"
            className="support-onboarding-next"
            onClick={() => (isLastStep ? onDismiss() : setStep((s) => s + 1))}
          >
            {isLastStep ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </>
  );
};

export default OnboardingCoachMark;
