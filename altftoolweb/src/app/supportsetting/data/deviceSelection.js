"use client";

import { useEffect, useState } from "react";

const DEVICE_STORAGE_KEY = "altftool.supportsetting.selectedDevice";

/**
 * Mirrors the platform-override pattern in platformDetect.js, but for the
 * expanded device taxonomy (Apple Watch, PlayStation, Printer, etc.) and
 * scoped to sessionStorage rather than localStorage — picking a device is a
 * "browsing this device's support right now" choice, not a lasting site
 * preference the way the OS platform preview is.
 *
 * The selected device is the single source of truth for which settings list
 * the sidebar shows (see SupportClient.jsx) — exactly the same relationship
 * `usePlatform()`'s override already has with the OS settings sidebar, so
 * every device selected from "More Devices" gets the identical dynamic-
 * sidebar behavior Windows/macOS/Android/iOS already have.
 */
function readStoredDevice() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(DEVICE_STORAGE_KEY) || null;
  } catch {
    // sessionStorage can throw in private browsing / disabled-storage modes.
    return null;
  }
}

function writeStoredDevice(deviceId) {
  if (typeof window === "undefined") return;
  try {
    if (deviceId) {
      window.sessionStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    } else {
      window.sessionStorage.removeItem(DEVICE_STORAGE_KEY);
    }
  } catch {
    // Ignore — remembering the selected device is a nice-to-have.
  }
}

export function useSelectedDevice() {
  const [selectedDeviceId, setSelectedDeviceIdState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSelectedDeviceIdState(readStoredDevice());
    setReady(true);
  }, []);

  const setSelectedDeviceId = (deviceId) => {
    const next = deviceId || null;
    setSelectedDeviceIdState(next);
    writeStoredDevice(next);
  };

  return { selectedDeviceId, setSelectedDeviceId, ready };
}
