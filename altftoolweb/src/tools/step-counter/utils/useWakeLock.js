"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Holds a Screen Wake Lock while the step counter is tracking.
 *
 * This is not a nicety. `devicemotion` stops firing the moment the screen
 * sleeps, so without a wake lock the counter silently stops the moment the
 * phone locks itself — which, for a tool you start and then go for a walk with,
 * is most of the time. The user comes back to a number that stopped minutes ago
 * and no indication anything went wrong.
 *
 * The lock is released by the browser on its own whenever the page is hidden
 * (tab switch, app switch, manual lock), and it is NOT restored automatically —
 * hence the visibilitychange re-request.
 *
 * `supported` is reported separately from `active` so the UI can be honest:
 * where there is no wake lock (notably iOS below 16.4) the screen will sleep
 * and counting will stop, and the user deserves to be told that rather than
 * discovering it.
 */
export default function useWakeLock(shouldHold) {
  const sentinelRef = useRef(null);
  const [active, setActive] = useState(false);
  const [supported] = useState(
    () => typeof navigator !== "undefined" && "wakeLock" in navigator,
  );

  const release = useCallback(async () => {
    const sentinel = sentinelRef.current;
    sentinelRef.current = null;
    setActive(false);
    if (!sentinel) return;
    try {
      await sentinel.release();
    } catch {
      // Already released by the browser — nothing to undo.
    }
  }, []);

  const acquire = useCallback(async () => {
    if (!supported || sentinelRef.current) return;
    try {
      const sentinel = await navigator.wakeLock.request("screen");
      sentinelRef.current = sentinel;
      setActive(true);
      // The browser drops the lock on its own when the page is hidden; keep
      // our state honest rather than claiming the screen is still held.
      sentinel.addEventListener("release", () => {
        if (sentinelRef.current === sentinel) sentinelRef.current = null;
        setActive(false);
      });
    } catch {
      // Denied (low battery on some Androids) or unavailable. Stay off; the
      // caller surfaces `supported && !active` as "your screen may sleep".
      setActive(false);
    }
  }, [supported]);

  useEffect(() => {
    if (!shouldHold) {
      release();
      return undefined;
    }

    acquire();

    // Coming back to a visible page is the only chance to re-take a lock the
    // browser released while we were hidden.
    const onVisibility = () => {
      if (document.visibilityState === "visible" && shouldHold) acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      release();
    };
  }, [shouldHold, acquire, release]);

  return { supported, active };
}
