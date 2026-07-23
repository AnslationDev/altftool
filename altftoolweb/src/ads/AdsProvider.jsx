"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const AdsContext = createContext([]);

const PROJECT_ID = "altftool";
const ADS_CACHE_KEY = "altftool:active-ads:v1";
const ADS_CACHE_TTL_MS = 5 * 60 * 1000;
const ACTIVATION_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll"];

let memoryCache = null;
let activeAdsRequest = null;

function readAdsCache() {
  const now = Date.now();
  if (memoryCache?.expiresAt > now) return memoryCache.ads;

  try {
    const cached = JSON.parse(
      window.sessionStorage.getItem(ADS_CACHE_KEY) || "null",
    );
    if (cached?.expiresAt > now && Array.isArray(cached.ads)) {
      memoryCache = cached;
      return cached.ads;
    }
  } catch {
    /* storage can be unavailable in private browsing */
  }

  return null;
}

function writeAdsCache(ads) {
  const cached = {
    ads,
    expiresAt: Date.now() + ADS_CACHE_TTL_MS,
  };
  memoryCache = cached;

  try {
    window.sessionStorage.setItem(ADS_CACHE_KEY, JSON.stringify(cached));
  } catch {
    /* keep the in-memory cache when storage is unavailable */
  }
}

async function fetchActiveAds() {
  const cached = readAdsCache();
  if (cached) return cached;
  if (activeAdsRequest) return activeAdsRequest;

  activeAdsRequest = Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase"),
  ])
    .then(([firestore, firebase]) => {
      const adsQuery = firestore.query(
        firestore.collection(firebase.db, "projects", PROJECT_ID, "ads"),
        firestore.where("status", "==", "active"),
      );
      return firestore.getDocs(adsQuery);
    })
    .then((snapshot) => {
      const ads = snapshot.docs.map((doc) =>
        normalizeAd({ id: doc.id, ...doc.data() }),
      );
      writeAdsCache(ads);
      return ads;
    })
    .finally(() => {
      activeAdsRequest = null;
    });

  return activeAdsRequest;
}

function scheduleDeferredLoad(load) {
  let idleHandle;
  let timeoutHandle;
  let settled = false;

  const cleanup = () => {
    ACTIVATION_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, activate);
    });
    if (idleHandle && window.cancelIdleCallback) {
      window.cancelIdleCallback(idleHandle);
    }
    if (timeoutHandle) window.clearTimeout(timeoutHandle);
  };
  const activate = () => {
    if (settled) return;
    settled = true;
    cleanup();
    load();
  };

  ACTIVATION_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, activate, {
      passive: true,
      once: true,
    });
  });

  if (window.requestIdleCallback) {
    idleHandle = window.requestIdleCallback(activate, { timeout: 2500 });
  } else {
    timeoutHandle = window.setTimeout(activate, 1500);
  }

  return cleanup;
}

export function AdsProvider({ children }) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  const [ads, setAds] = useState([]);

  useEffect(() => {
    let cancelled = false;

    if (useMock) {
      import("./data").then(({ default: mockAdsData }) => {
        if (!cancelled) {
          setAds((mockAdsData.ads || []).map(normalizeAd));
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const cached = readAdsCache();
    if (cached) {
      queueMicrotask(() => {
        if (!cancelled) setAds(cached);
      });
      return () => {
        cancelled = true;
      };
    }

    const cancelSchedule = scheduleDeferredLoad(() => {
      fetchActiveAds()
        .then((nextAds) => {
          if (!cancelled) setAds(nextAds);
        })
        .catch(() => {
          /* custom ad failures must never block page content */
        });
    });

    return () => {
      cancelled = true;
      cancelSchedule();
    };
  }, [useMock]);

  return <AdsContext.Provider value={ads}>{children}</AdsContext.Provider>;
}

// ─────────────────────────────────────────────
//  Internal helpers (UNCHANGED)
// ─────────────────────────────────────────────

function normalizeAd(raw) {
  return {
    ...raw,
    placements: Array.isArray(raw.placements)
      ? raw.placements
      : [raw.placements].filter(Boolean),
    layout: raw.layout?.trim() ?? null,
    // Default to visible on a device unless it is EXPLICITLY disabled.
    // (Admin-created ads may omit `devices`; absent must mean "show", not "hide".)
    devices: {
      desktop: raw.devices?.desktop !== false,
      mobile: raw.devices?.mobile !== false,
    },
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    target: raw.target ?? null,
  };
}

function byPlacement(ads, placement) {
  return ads.filter(
    (ad) => Array.isArray(ad.placements) && ad.placements.includes(placement),
  );
}

// ─────────────────────────────────────────────
// Hooks (UNCHANGED)
// ─────────────────────────────────────────────

export function useAds({ placement } = {}) {
  const ads = useContext(AdsContext);
  if (!ads.length || !placement) return [];
  return byPlacement(ads, placement);
}

export function useBlogAds({ placement, slug, category } = {}) {
  const ads = useContext(AdsContext);
  if (!ads.length || !placement) return [];

  const pool = byPlacement(ads, placement);

  const targeted = pool.filter((ad) => ad.target && ad.target === slug);
  if (targeted.length) return targeted;

  const byCat = pool.filter(
    (ad) =>
      !ad.target &&
      ad.categories.length > 0 &&
      category &&
      ad.categories.some((c) => c.toLowerCase() === category.toLowerCase()),
  );
  if (byCat.length) return byCat;

  return pool.filter((ad) => !ad.target && ad.categories.length === 0);
}

export function useToolAds({ placement, toolSlug, toolCategories = [] } = {}) {
  const ads = useContext(AdsContext);
  if (!ads.length || !placement) return [];

  const pool = byPlacement(ads, placement);

  const targeted = pool.filter((ad) => ad.target && ad.target === toolSlug);
  if (targeted.length) return targeted;

  const byCat = pool.filter(
    (ad) =>
      !ad.target &&
      ad.categories.length > 0 &&
      toolCategories.length > 0 &&
      ad.categories.some((adCat) =>
        toolCategories.some((tc) => tc.toLowerCase() === adCat.toLowerCase()),
      ),
  );
  if (byCat.length) return byCat;

  return pool.filter((ad) => !ad.target && ad.categories.length === 0);
}
