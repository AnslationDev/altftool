"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Browser Geolocation API hook for the Nearby Sale Search feature.
 *
 * Distinguishes PERMISSION_DENIED (code 1) from other failures (timeout,
 * position unavailable, no support) so the UI can offer a manual city
 * search fallback instead of just saying "denied" for every failure.
 *
 * @returns {{
 *   coords: { latitude: number, longitude: number } | null,
 *   status: "idle" | "detecting" | "resolved" | "denied" | "error",
 *   error: string | null,
 *   requestLocation: () => void,
 * }}
 */
export function useLocation() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const requestInFlightRef = useRef(false);

  const requestLocation = useCallback(() => {
    if (requestInFlightRef.current) return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Geolocation isn't supported in this browser. Try searching by city instead.");
      return;
    }

    requestInFlightRef.current = true;
    setStatus("detecting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        requestInFlightRef.current = false;
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("resolved");
      },
      (geoError) => {
        requestInFlightRef.current = false;
        // Only a real PERMISSION_DENIED should read as "denied" — TIMEOUT (3)
        // and POSITION_UNAVAILABLE (2) are common on non-GPS hardware and
        // shouldn't be reported to the user as a blocked permission.
        if (geoError.code === 1) {
          setStatus("denied");
          setError("Location access was denied. Search by city instead.");
        } else {
          setStatus("error");
          setError("Couldn't detect your location right now. Try searching by city instead.");
        }
      },
      { maximumAge: 0, timeout: 10000 },
    );
  }, []);

  return { coords, status, error, requestLocation };
}
