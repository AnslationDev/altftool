"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Zap,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  Compass,
} from "lucide-react";

const PLATFORM_LABEL = { windows: "Windows", macos: "macOS", android: "Android", ios: "iOS" };

/**
 * The "Adaptive Experience" layer — three small premium surfaces that teach
 * visitors how this page adapts to their device, in place of the old
 * warning-style messaging:
 *
 *   1. <SmartPlatformCard>  — a compact glass card under the search bar.
 *        Windows (detected for real)  -> "Instant Settings Access" with a
 *        real ms-settings: launch button.
 *        Everything else              -> "Smart Guided Navigation" with a
 *        "Why is this different?" link opening an explainer modal.
 *        Both variants close with a short platform-support summary.
 *   2. <DeviceAdaptiveBadge> — a tiny pill beside the search bar with a
 *        click-open popover ("Set for X / Guided Help Ready").
 *   3. <HowThisWorksChip>   — a chip beside the page title opening a
 *        right-hand side sheet describing per-platform behavior.
 *
 * Deliberate language rule for every string in this file: capability is
 * always framed positively ("Smart Guided Navigation", "Platform
 * Optimized", "Adaptive Experience") — never "not supported", "failed",
 * or "cannot open". The platform-capability facts themselves stay honest:
 * the direct-launch button only renders when the underlying device is
 * genuinely Windows (detected, not just previewed), so nothing here ever
 * promises a launch it can't perform.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Shared focus trap, Escape-to-close, restoration, and scroll lock. */
function useOverlay(open, onClose, dialogRef) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const getFocusable = () =>
      Array.from(dialog?.querySelectorAll(FOCUSABLE_SELECTOR) || []).filter(
        (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
      );

    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = getFocusable();
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      const [first] = getFocusable();
      (first || dialog)?.focus();
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [open, dialogRef]);
}

/* ------------------------------------------------------------------ */
/*  "Why is this different?" modal                                     */
/* ------------------------------------------------------------------ */

const SECURITY_MODEL_ROWS = [
  {
    key: "windows",
    glyph: "🪟",
    title: "Windows",
    body: "Supports secure Settings links for many pages, so this site can open them for you directly.",
  },
  {
    key: "apple",
    glyph: "🍎",
    title: "macOS & iOS",
    body: "Apple keeps System Settings reserved for you and your apps — so we guide you there visually instead.",
  },
  {
    key: "android",
    glyph: "🤖",
    title: "Android",
    body: "Settings open through system apps rather than websites, so our guide walks you through each step.",
  },
];

const WhyDifferentModal = ({ open, onClose }) => {
  const dialogRef = useRef(null);
  useOverlay(open, onClose, dialogRef);
  if (!open) return null;

  // Portal to <body> — the Smart Platform Card (this modal's parent) uses
  // backdrop-filter, which makes it the containing block for any
  // position:fixed descendant. Rendered in place, the "full screen"
  // overlay would get trapped inside the card's own box (exactly the bug
  // this fixes); portaled to <body>, fixed positioning means the real
  // viewport again. `open` only ever becomes true from a click, so
  // `document` is always available here — no SSR guard needed.
  return createPortal(
    <div className="support-adaptive-overlay" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="support-adaptive-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Why the experience adapts to each platform"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="support-adaptive-modal-header">
          <span className="support-adaptive-modal-badge" aria-hidden="true">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="support-adaptive-modal-title">Every platform, its own front door</h2>
            <p className="support-adaptive-modal-subtitle">
              Different operating systems have different security models — this page adapts to each one.
            </p>
          </div>
          <button type="button" className="support-adaptive-close" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="support-adaptive-modal-rows">
          {SECURITY_MODEL_ROWS.map((row) => (
            <div key={row.key} className="support-adaptive-modal-row">
              <span className="support-adaptive-modal-row-glyph" aria-hidden="true">
                {row.glyph}
              </span>
              <div>
                <p className="support-adaptive-modal-row-title">{row.title}</p>
                <p className="support-adaptive-modal-row-body">{row.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="support-adaptive-modal-footnote">
          <span aria-hidden="true">🔒</span> This behavior protects your privacy and prevents malicious websites
          from changing device settings — and it&rsquo;s exactly why our guided experience exists.
        </p>
      </div>
    </div>,
    document.body,
  );
};

/* ------------------------------------------------------------------ */
/*  Platform support summary — animates once on mount                 */
/* ------------------------------------------------------------------ */

const PlatformStatusTimeline = ({ instant }) => {
  const steps = [
    { key: "platform", label: "Platform Selected", done: true },
    { key: "method", label: "Support Method Matched", done: true },
    instant
      ? { key: "final", label: "Direct Settings Link Ready", final: true, icon: Zap }
      : { key: "final", label: "Step-by-Step Guide Ready", final: true, icon: ShieldCheck },
  ];

  return (
    <ol className="support-ai-timeline" aria-label="Platform support summary">
      {steps.map((step, index) => {
        const FinalIcon = step.icon;
        return (
          <li
            key={step.key}
            className={`support-ai-timeline-step ${step.final ? "is-final" : ""}`}
            style={{ "--timeline-delay": `${index * 260}ms` }}
          >
            <span className="support-ai-timeline-dot" aria-hidden="true">
              {step.final ? <FinalIcon className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            </span>
            <span className="support-ai-timeline-label">{step.label}</span>
            {index < steps.length - 1 && (
              <ArrowRight className="h-3 w-3 support-ai-timeline-arrow" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
};

/* ------------------------------------------------------------------ */
/*  Smart Platform Card                                                */
/* ------------------------------------------------------------------ */

export const SmartPlatformCard = ({ platform, detectedPlatform }) => {
  const [whyOpen, setWhyOpen] = useState(false);

  // Direct launch is only offered when the device is GENUINELY Windows —
  // both the platform being browsed and the one actually detected. While
  // previewing Windows from another device (or any device previewing
  // another OS), the guided experience is the honest, working path.
  const instant = platform === "windows" && detectedPlatform === "windows";
  const label = PLATFORM_LABEL[platform] || "your device";

  const handleInstantLaunch = () => {
    window.location.assign("ms-settings:");
  };

  return (
    <section
      className={`support-smart-platform-card ${instant ? "is-instant" : "is-guided"}`}
      aria-label="Platform experience"
    >
      <div className="support-smart-platform-main">
        <span className="support-smart-platform-icon" aria-hidden="true">
          {instant ? <Zap className="h-4.5 w-4.5" /> : <ShieldCheck className="h-4.5 w-4.5" />}
        </span>
        <div className="support-smart-platform-copy">
          <p className="support-smart-platform-title">
            {instant ? "Instant Settings Access" : "Smart Guided Navigation"}
          </p>
          <p className="support-smart-platform-text">
            {instant ? (
              <>Your Windows device supports secure direct opening for many Settings pages.</>
            ) : (
              <>
                {label} keeps system settings protected, so this page provides an interactive guided
                experience — visual navigation, screenshots, troubleshooting, and official resources —
                to reach the right setting faster.
              </>
            )}
          </p>
        </div>
        <div className="support-smart-platform-action">
          {instant ? (
            <button type="button" className="support-smart-platform-launch" onClick={handleInstantLaunch}>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Open Settings Instantly
            </button>
          ) : (
            <button type="button" className="support-smart-platform-why" onClick={() => setWhyOpen(true)}>
              Why is this different?
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <PlatformStatusTimeline instant={instant} />

      <WhyDifferentModal open={whyOpen} onClose={() => setWhyOpen(false)} />
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Device-adaptive badge (beside the search bar)                      */
/* ------------------------------------------------------------------ */

export const DeviceAdaptiveBadge = ({ platform, detectedPlatform }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const instant = platform === "windows" && detectedPlatform === "windows";
  const label = PLATFORM_LABEL[platform] || "your device";

  // Click-away close — the popover is small enough that a backdrop layer
  // would be heavier than the thing it closes.
  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", handlePointer);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("pointerdown", handlePointer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="support-ai-adaptive" ref={wrapRef}>
      <button
        type="button"
        className="support-ai-adaptive-badge"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        title="Device Adaptive — this page adapts to your selected platform"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Device Adaptive</span>
      </button>

      {open && (
        <div className="support-ai-adaptive-pop" role="status">
          <p className="support-ai-adaptive-pop-title">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> Device Adaptive
          </p>
          <p className="support-ai-adaptive-pop-line">Set for {label}</p>
          <p className={`support-ai-adaptive-pop-state ${instant ? "is-instant" : ""}`}>
            {instant ? (
              <>
                <Zap className="h-3 w-3" aria-hidden="true" /> Direct Launch Available
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Guided Help Ready
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  "How this works" chip + side sheet (near the page title)           */
/* ------------------------------------------------------------------ */

const HOW_IT_WORKS_ROWS = [
  { key: "windows", title: "Windows", body: "Opens supported Settings directly." },
  { key: "macos", title: "macOS", body: "Interactive visual guidance." },
  { key: "android", title: "Android", body: "Step-by-step navigation." },
  { key: "tv", title: "Smart TVs", body: "Device-specific walkthrough." },
  { key: "console", title: "Game Consoles", body: "Step-by-step setup." },
];

export const HowThisWorksChip = () => {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef(null);
  useOverlay(open, () => setOpen(false), sheetRef);

  return (
    <>
      <button
        type="button"
        className="support-howworks-chip"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Compass className="h-3.5 w-3.5" aria-hidden="true" />
        How this works
      </button>

      {/* Portaled to <body> for the same reason as WhyDifferentModal —
          ancestors with backdrop-filter/transform (the hero card, the
          page-transition wrapper) would otherwise trap this "fixed"
          overlay inside their own box instead of covering the viewport. */}
      {open && createPortal(
        <div className="support-adaptive-overlay is-sheet" role="presentation" onClick={() => setOpen(false)}>
          <aside
            ref={sheetRef}
            className="support-howworks-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="How this support page adapts to every platform"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="support-howworks-sheet-header">
              <span className="support-adaptive-modal-badge" aria-hidden="true">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="support-adaptive-modal-title">Adaptive by design</h2>
                <p className="support-adaptive-modal-subtitle">
                  This support page automatically adapts to every platform.
                </p>
              </div>
              <button
                type="button"
                className="support-adaptive-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="support-howworks-sheet-rows">
              {HOW_IT_WORKS_ROWS.map((row, index) => (
                <div
                  key={row.key}
                  className="support-howworks-sheet-row"
                  style={{ "--sheet-row-delay": `${index * 70}ms` }}
                >
                  <p className="support-howworks-sheet-row-title">{row.title}</p>
                  <p className="support-howworks-sheet-row-body">
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    {row.body}
                  </p>
                </div>
              ))}
            </div>

            <p className="support-adaptive-modal-footnote">
              One page, every device — the experience simply reshapes itself around whatever you&rsquo;re using.
            </p>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
};
