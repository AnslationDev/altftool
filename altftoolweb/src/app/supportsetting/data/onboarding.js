"use client";

import { useCallback, useEffect, useState } from "react";

// One-time "here's where things are" coach-mark, shown only on a visitor's
// very first visit to Support Settings. Same localStorage-flag convention
// already used elsewhere in this app (see platformDetect.js's
// OVERRIDE_STORAGE_KEY and preferences.js's usePagePreferences/useBookmarks)
// — just a single boolean instead of a value to restore, since there's
// nothing to remember here beyond "has this been dismissed".
const DISMISSED_STORAGE_KEY = "altftool.supportsetting.onboardingHintDismissed";

function readDismissed() {
  if (typeof window === "undefined") return true; // never show during SSR/first paint
  try {
    return window.localStorage.getItem(DISMISSED_STORAGE_KEY) === "1";
  } catch {
    // Storage can be blocked (private browsing, disabled cookies, some
    // enterprise policies, etc.) — fail toward NOT showing the hint rather
    // than risking it reappearing on every single visit for someone who has
    // no way to actually dismiss it.
    return true;
  }
}

/**
 * `showHint` starts `false` on both the server render and the client's
 * first render (so there's nothing for hydration to mismatch on), then an
 * effect flips it to `true` right after mount if — and only if — this
 * browser has never dismissed the hint before. `dismissHint` hides it
 * immediately and persists that choice, so it never shows again on this
 * browser afterward, however it was dismissed (Skip, Got it, the X, or
 * Escape all call the same function — see OnboardingCoachMark.jsx).
 */
export function useOnboardingHint() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!readDismissed()) setShowHint(true);
  }, []);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DISMISSED_STORAGE_KEY, "1");
    } catch {
      // If storage is blocked the choice just won't persist across visits —
      // still fine, it's already dismissed for this session either way.
    }
  }, []);

  return { showHint, dismissHint };
}
