"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { toolId } from "../lib/toolId";

const ToolStatsContext = createContext({ counts: new Map(), loading: true });

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Loads every "tool opened" event from the last 7 days ONCE per page load
 * and tallies them into a toolId -> count map, shared via context so the
 * ~80 cards on this page don't each fire their own Firestore query.
 * Powers both the weekly-opens stat on a card and the trending badge
 * (top N by count). This is our own click-through data, not third-party
 * analytics — see AuthDialog/DesignToolCard usage for why.
 */
export function ToolStatsProvider({ children }) {
  const [counts, setCounts] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }
      try {
        const { collection, query, where, orderBy, limit, getDocs, Timestamp } = await import("firebase/firestore");
        const since = Timestamp.fromMillis(Date.now() - SEVEN_DAYS_MS);
        const q = query(
          collection(db, "toolOpenEvents"),
          where("openedAt", ">=", since),
          orderBy("openedAt", "desc"),
          limit(2000),
        );
        const snap = await getDocs(q);
        const tally = new Map();
        snap.forEach((docSnap) => {
          const id = docSnap.data()?.toolId;
          if (!id) return;
          tally.set(id, (tally.get(id) || 0) + 1);
        });
        if (!cancelled) setCounts(tally);
      } catch (error) {
        console.error("Failed to load tool open stats:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ counts, loading }), [counts, loading]);

  return <ToolStatsContext.Provider value={value}>{children}</ToolStatsContext.Provider>;
}

export function useToolStats() {
  return useContext(ToolStatsContext);
}

/** Opens recorded on AltFTool for this specific tool in the last 7 days. */
export function useToolWeeklyOpens(tool) {
  const { counts } = useToolStats();
  return counts.get(toolId(tool)) || 0;
}

/** Set of toolIds among the top `limitCount` by weekly opens. */
export function useTrendingToolIds(limitCount = 6) {
  const { counts } = useToolStats();
  return useMemo(() => {
    return new Set(
      [...counts.entries()]
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limitCount)
        .map(([id]) => id),
    );
  }, [counts, limitCount]);
}
