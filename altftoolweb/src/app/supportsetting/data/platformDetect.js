"use client";

import { useEffect, useState } from "react";
import { isValidPlatform } from "./clientData";

const OVERRIDE_STORAGE_KEY = "altftool.supportsetting.platformOverride";

/**
 * Pure, SSR-safe platform sniff. Returns null on the server (no `window`),
 * and one of "windows" | "macos" | "android" | "ios" on the client. iPadOS
 * reports itself as a Mac in the user agent, so we also check for a touch
 * screen (maxTouchPoints) the way Apple's own guidance recommends.
 */
export function detectPlatform() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";

  if (/iPhone|iPod/.test(ua)) return "ios";
  if (/iPad/.test(ua)) return "ios";
  // iPadOS 13+ identifies as "MacIntel" but exposes multi-touch.
  if (platform === "MacIntel" && navigator.maxTouchPoints > 1) return "ios";

  if (/Android/.test(ua)) return "android";
  if (/Mac/.test(platform) || /Macintosh/.test(ua)) return "macos";
  if (/Win/.test(platform) || /Windows/.test(ua)) return "windows";

  return null;
}

function readStoredOverride() {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(OVERRIDE_STORAGE_KEY);
    return isValidPlatform(stored) ? stored : null;
  } catch {
    // localStorage can throw in private browsing / disabled-storage modes.
    return null;
  }
}

function writeStoredOverride(platform) {
  if (typeof window === "undefined") return;
  try {
    if (platform) {
      window.localStorage.setItem(OVERRIDE_STORAGE_KEY, platform);
    } else {
      window.localStorage.removeItem(OVERRIDE_STORAGE_KEY);
    }
  } catch {
    // Ignore — preview override is a nice-to-have, not required.
  }
}

/**
 * usePlatform() combines real auto-detection with an optional manual
 * "preview" override (persisted locally). The override exists so a visitor
 * (or anyone verifying the site) can check any OS's Support Settings from
 * any single browser/device — it never changes what OS is actually
 * detected, only what's displayed.
 */
export function usePlatform() {
  const [detected, setDetected] = useState(null);
  const [override, setOverrideState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDetected(detectPlatform() || "windows");
    setOverrideState(readStoredOverride());
    setReady(true);
  }, []);

  const setOverride = (platform) => {
    const next = isValidPlatform(platform) ? platform : null;
    setOverrideState(next);
    writeStoredOverride(next);
  };

  const activePlatform = override || detected || "windows";

  return {
    platform: activePlatform,
    detectedPlatform: detected || "windows",
    isOverridden: Boolean(override),
    setOverride,
    clearOverride: () => setOverride(null),
    ready,
  };
}
