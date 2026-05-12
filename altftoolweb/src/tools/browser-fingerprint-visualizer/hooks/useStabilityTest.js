"use client";

import { useCallback, useState, useEffect } from "react";

const STORAGE_KEY = "fp_stability_hash";
const STORAGE_COUNT_KEY = "fp_stability_count";

export function useStabilityTest(currentFingerprintId) {
  const [stability, setStability] = useState({
    status: "pending",
    previousHash: null,
    currentHash: currentFingerprintId,
    matchCount: 0,
    totalChecks: 0,
    stabilityScore: null,
  });

  const checkStability = useCallback((currentHash) => {
    try {
      const previousHash = sessionStorage.getItem(STORAGE_KEY);
      const countData = sessionStorage.getItem(STORAGE_COUNT_KEY);

      let matchCount = 0;
      let totalChecks = 0;

      if (countData) {
        const parsed = JSON.parse(countData);
        matchCount = parsed.matchCount || 0;
        totalChecks = parsed.totalChecks || 0;
      }

      if (!previousHash) {
        // First visit — save hash
        sessionStorage.setItem(STORAGE_KEY, currentHash);
        sessionStorage.setItem(
          STORAGE_COUNT_KEY,
          JSON.stringify({ matchCount: 1, totalChecks: 1 })
        );

        setStability({
          status: "first-visit",
          previousHash: null,
          currentHash,
          matchCount: 1,
          totalChecks: 1,
          stabilityScore: null,
          message: "Fingerprint saved. Reload the page to test stability.",
        });

      } else {
        // Subsequent visit — compare
        totalChecks++;
        const isStable = previousHash === currentHash;
        if (isStable) matchCount++;

        sessionStorage.setItem(
          STORAGE_COUNT_KEY,
          JSON.stringify({ matchCount, totalChecks })
        );
        sessionStorage.setItem(STORAGE_KEY, currentHash);

        const stabilityScore = Math.round((matchCount / totalChecks) * 100);

        setStability({
          status: isStable ? "stable" : "unstable",
          previousHash,
          currentHash,
          matchCount,
          totalChecks,
          stabilityScore,
          message: isStable
            ? "Your fingerprint is stable across reloads. Trackers can reliably identify you."
            : "Your fingerprint changed on reload. Privacy protection may be active.",
        });
      }

    } catch {
      setStability({
        status: "blocked",
        previousHash: null,
        currentHash,
        matchCount: 0,
        totalChecks: 0,
        stabilityScore: null,
        message: "Session storage is blocked. Cannot test stability.",
      });
    }
  }, []);

  useEffect(() => {
    if (!currentFingerprintId) return;
    const stabilityCheck = setTimeout(
      () => checkStability(currentFingerprintId),
      0,
    );
    return () => clearTimeout(stabilityCheck);
  }, [checkStability, currentFingerprintId]);

  function resetTest() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_COUNT_KEY);
      setStability({
        status: "pending",
        previousHash: null,
        currentHash: currentFingerprintId,
        matchCount: 0,
        totalChecks: 0,
        stabilityScore: null,
      });
    } catch {
      // ignore
    }
  }

  return { ...stability, resetTest };
}
