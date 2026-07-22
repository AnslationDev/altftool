"use client";

import { useCallback, useEffect, useState } from "react";

const KEY_PREFIX = "altft:game-best:";

/**
 * Persistent per-game best score. SSR-safe (reads localStorage after mount).
 * `submit(score)` records the score only when it beats the stored best;
 * pass { lowerIsBetter: true } for time-based games.
 */
export default function useBestScore(gameSlug, { lowerIsBetter = false } = {}) {
  const [best, setBest] = useState(null);
  const storageKey = `${KEY_PREFIX}${gameSlug}`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null && raw !== "") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) setBest(parsed);
      }
    } catch {
      // Private mode / blocked storage — best score simply stays session-only.
    }
  }, [storageKey]);

  const submit = useCallback(
    (score) => {
      if (!Number.isFinite(score)) return;
      setBest((current) => {
        const isImprovement =
          current === null || (lowerIsBetter ? score < current : score > current);
        if (!isImprovement) return current;
        try {
          window.localStorage.setItem(storageKey, String(score));
        } catch {
          // Ignore storage failures; in-memory best still updates.
        }
        return score;
      });
    },
    [storageKey, lowerIsBetter],
  );

  return [best, submit];
}
