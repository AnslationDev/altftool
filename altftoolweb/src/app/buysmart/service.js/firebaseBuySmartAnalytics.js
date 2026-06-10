import { doc, onSnapshot } from "firebase/firestore";
import { normalizeBuySmartCounter } from "@altftool/core/buysmart";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const ANALYTICS_REF = doc(db, ...buySmartDocPath("analytics"));

function normalizeAnalytics(data = {}) {
  const counters = Object.entries(data.counters || {}).reduce((acc, [slug, counter]) => {
    acc[slug] = normalizeBuySmartCounter(counter);
    return acc;
  }, {});

  return {
    counters,
    events: Array.isArray(data.events) ? data.events : [],
    updatedAt: data.updatedAt || 0,
  };
}

export const firebaseBuySmartAnalyticsSource = {
  subscribe(callback, onError) {
    return subscribeCached(
      "buysmart:analytics",
      (emit, fail) => onSnapshot(
        ANALYTICS_REF,
        (snap) => emit(normalizeAnalytics(snap.exists() ? snap.data() : {})),
        (error) => {
          console.error("BuySmart analytics read error:", error);
          fail?.(error);
        },
      ),
      callback,
      onError,
    );
  },
};
