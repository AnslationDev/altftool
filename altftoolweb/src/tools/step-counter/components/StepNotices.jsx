"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Info, Smartphone, TriangleAlert, WifiOff } from "lucide-react";
import { C } from "./stepTheme";

/**
 * The honest states.
 *
 * Three facts this screen is built around, none of them wishes:
 *
 * 1. Motion events are only delivered while the document is visible
 *    (w3c deviceorientation §6.1, §6.3.3), and a Screen Wake Lock is released
 *    whenever the page is hidden and is NOT restored automatically. "Start it
 *    and put your phone away" cannot work. We say what it needs, once, plainly.
 * 2. A denied motion permission used to leave the app reading "Tracking…"
 *    forever, with the error text buried inside a closed settings sheet. It is
 *    a first-class state now.
 * 3. `sensorMode` was computed and never rendered. On a desktop the timer ran,
 *    the count stayed 0 and nothing explained why. A visitor without a motion
 *    sensor is told before they press anything.
 */

/* ------------------------------ capability -------------------------------- */

/**
 * "none"       — no motion sensor we can reach (a desktop). Say so up front.
 * "permission" — iOS/iPadOS: capable, but needs a tap to ask.
 * "likely"     — has DeviceMotionEvent and looks like a handheld.
 * "unknown"    — first paint, before the effect runs.
 *
 * The heuristic mirrors useStepCounter.start() on purpose, so the UI and the
 * engine never disagree. It can still be wrong on a touchscreen laptop — which
 * is exactly why "Try anyway" exists below, and why the liveness watchdog is
 * the real backstop.
 */
export function detectMotionCapability() {
  if (typeof window === "undefined") return "unknown";
  if (typeof window.DeviceMotionEvent === "undefined") return "none";
  if (typeof window.DeviceMotionEvent.requestPermission === "function") return "permission";
  const handheld =
    (navigator.maxTouchPoints || 0) > 0 ||
    "ontouchstart" in window ||
    (window.matchMedia?.("(pointer: coarse)").matches ?? false);
  return handheld ? "likely" : "none";
}

/**
 * Resolved on the first render, not in an effect: the tool runtime is mounted
 * through next/dynamic with `ssr: false` (see ToolClient.jsx), so there is no
 * server markup to disagree with — and a desktop visitor is told what this
 * needs before the first paint rather than one commit later.
 */
export function useMotionCapability() {
  const [capability] = useState(detectMotionCapability);
  return capability;
}

/* -------------------------------- liveness -------------------------------- */

/**
 * Permission can be granted and still nothing arrives — a browser with motion
 * access switched off at the OS level, a locked-down work profile, a desktop
 * that lies about touch. Nothing in the engine notices; it just counts zero.
 *
 * So we listen to `devicemotion` purely to observe that events EXIST. We never
 * read the payload and never count from it — step counting stays entirely in
 * utils/stepDetector.js. The listener unsubscribes on the first event.
 */
export function useMotionLiveness(watching, graceMs = 3000) {
  const [state, setState] = useState({ watching, alive: false, expired: false });

  // Reset during render rather than in an effect (React's documented
  // "adjusting state when a prop changes" pattern) so flipping the watch on and
  // off never commits a stale verdict for one frame.
  if (state.watching !== watching) {
    setState({ watching, alive: false, expired: false });
  }

  useEffect(() => {
    if (!watching || typeof window === "undefined") return undefined;

    let seen = false;
    const onMotion = () => {
      if (seen) return;
      seen = true;
      // One event is all the proof we need; stop listening immediately so a
      // 60Hz sensor stream never re-renders the screen.
      window.removeEventListener("devicemotion", onMotion);
      setState((prev) => ({ ...prev, alive: true }));
    };

    window.addEventListener("devicemotion", onMotion);
    const timer = window.setTimeout(() => {
      if (!seen) setState((prev) => ({ ...prev, expired: true }));
    }, graceMs);

    return () => {
      window.removeEventListener("devicemotion", onMotion);
      window.clearTimeout(timer);
    };
  }, [watching, graceMs]);

  return { alive: state.alive, silent: state.expired && !state.alive };
}

/* ------------------------------ hidden gaps -------------------------------- */

/**
 * While the page is hidden the sensor stops delivering, so those steps are
 * simply gone. Rather than let the visitor discover a suspiciously flat number,
 * we tell them how long the gap was.
 */
export function useHiddenGap(tracking) {
  const [state, setState] = useState({ tracking, gapMs: 0 });
  const hiddenAtRef = useRef(0);

  if (state.tracking !== tracking) {
    setState({ tracking, gapMs: 0 });
  }

  useEffect(() => {
    hiddenAtRef.current = 0;
    if (!tracking || typeof document === "undefined") return undefined;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }
      if (!hiddenAtRef.current) return;
      const delta = Date.now() - hiddenAtRef.current;
      hiddenAtRef.current = 0;
      if (delta > 3000) setState((prev) => ({ ...prev, gapMs: prev.gapMs + delta }));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [tracking]);

  const clear = useCallback(
    () => setState((prev) => (prev.gapMs ? { ...prev, gapMs: 0 } : prev)),
    [],
  );
  return { gapMs: state.gapMs, clear };
}

export function formatGap(ms) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

/* --------------------------------- notice ---------------------------------- */

const TONES = {
  danger: { bg: C.dangerSoft, fg: C.dangerText, Icon: TriangleAlert },
  warning: { bg: C.warnSoft, fg: C.warnText, Icon: WifiOff },
  info: { bg: C.infoSoft, fg: C.infoText, Icon: Info },
  device: { bg: C.infoSoft, fg: C.infoText, Icon: Smartphone },
};

/**
 * A state, not a toast: it stays until the state changes, it is readable, and
 * it always says what to do next.
 */
export default function StepNotice({ tone = "info", title, children, actions, onDismiss }) {
  const { bg, fg, Icon } = TONES[tone] || TONES.info;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className="sc3-in flex gap-3 rounded-xl p-4"
      style={{ background: bg, color: fg }}
    >
      <Icon size={20} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold">{title}</p>
        <div className="pt-1 text-[14px] leading-relaxed">{children}</div>
        {actions ? <div className="flex flex-wrap gap-2 pt-3">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="-mr-1 -mt-1 h-11 shrink-0 rounded-lg px-3 text-[14px] font-semibold"
          style={{ color: fg }}
        >
          Got it
        </button>
      ) : null}
    </div>
  );
}
