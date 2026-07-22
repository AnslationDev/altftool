"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVoiceCoach — browser-native voice announcements for the Step Counter.
 *
 * Built on the Web Speech API (speechSynthesis) with strict guarantees:
 * - feature-detected: unsupported browsers get {supported:false} and the tool
 *   keeps working silently — voice can never block or break the UI
 * - announcements QUEUE (we never call cancel() before speak), so an ongoing
 *   announcement is never interrupted; a small pending-cap stops a backlog
 *   from piling up if the engine is slow
 * - each milestone (every `interval` steps) is announced exactly once —
 *   bookkeeping advances even while voice is disabled, follows the counter
 *   back down after a reset, and re-snaps when the interval setting changes
 * - volume is intentionally not set on utterances, so loudness follows the
 *   device / system volume
 * - speechSynthesis.cancel() runs on unmount so no engine work leaks past
 *   the component's life
 */
export default function useVoiceCoach({ steps, tracking, enabled, interval }) {
  // Detected in an effect (not render) so SSR markup and the first client
  // render stay identical.
  const [supported, setSupported] = useState(false);

  const enabledRef = useRef(enabled);
  const pendingRef = useRef(0);
  const lastMilestoneRef = useRef(0);
  const prevIntervalRef = useRef(interval);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window,
    );
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  /**
   * Speak a phrase. Respects the enabled toggle unless {force:true}
   * (used for the "voice on" confirmation, which fires in the same click
   * that enables voice — before React state has round-tripped).
   */
  const announce = useCallback((text, { force = false } = {}) => {
    if (!force && !enabledRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const synth = window.speechSynthesis;
      // Chrome can wedge itself in a paused state after long idles.
      if (synth.paused) synth.resume();
      // Never let slow TTS build an ever-growing backlog.
      if (pendingRef.current >= 3) return;

      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      const settle = () => {
        pendingRef.current = Math.max(0, pendingRef.current - 1);
      };
      utterance.onend = settle;
      utterance.onerror = settle;
      pendingRef.current += 1;
      synth.speak(utterance); // queued behind anything already speaking
    } catch {
      /* voice must never break the tool */
    }
  }, []);

  /** Silence everything immediately (used when the user turns voice off). */
  const hush = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
      pendingRef.current = 0;
    } catch {
      /* ignore */
    }
  }, []);

  /* ------------------------------- milestones ------------------------------- */

  useEffect(() => {
    const safeInterval = interval > 0 ? interval : 50;
    const current = Math.floor(steps / safeInterval) * safeInterval;

    // Interval changed — snap to the current milestone silently so switching
    // (say 50 → 100) never replays a milestone that already passed.
    if (prevIntervalRef.current !== safeInterval) {
      prevIntervalRef.current = safeInterval;
      lastMilestoneRef.current = current;
      return;
    }

    // Steps went DOWN (reset / midnight rollover) — follow them silently.
    if (steps < lastMilestoneRef.current) {
      lastMilestoneRef.current = current;
      return;
    }

    // New milestone reached — record it exactly once. If several are crossed
    // in one jump, announce only the newest so the queue stays sensible.
    if (current > lastMilestoneRef.current) {
      lastMilestoneRef.current = current;
      if (tracking) {
        announce(`${current.toLocaleString("en-US")} steps completed.`);
      }
    }
  }, [steps, interval, tracking, announce]);

  /* --------------------------------- cleanup -------------------------------- */

  useEffect(
    () => () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
    },
    [],
  );

  return { supported, announce, hush };
}
