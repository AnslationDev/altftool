"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";
import mockAdsData from "./data";

export const AdsContext = createContext([]);

const PROJECT_ID = "altftool"; // ✅ added
const mockAds = (mockAdsData.ads || []).map(normalizeAd);

export function AdsProvider({ children }) {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
  const [ads, setAds] = useState(() => (useMock ? mockAds : []));

  useEffect(() => {
    if (useMock) {
      return;
    }

    // ── Firestore ──
    const q = query(
      collection(db, "projects", PROJECT_ID, "ads"), // ✅ ONLY CHANGE
      where("status", "==", "active")
    );

    const unsubscribe = subscribeCached(
      "ads:active",
      (emit, fail) => onSnapshot(
        q,
        (snapshot) => {
          emit(
            snapshot.docs.map((doc) =>
              normalizeAd({ id: doc.id, ...doc.data() })
            )
          );
        },
        fail,
      ),
      setAds,
    );

    return () => unsubscribe();
  }, [useMock]);

  return (
    <AdsContext.Provider value={ads}>
      {children}
    </AdsContext.Provider>
  );
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
    devices: {
      desktop: raw.devices?.desktop === true,
      mobile: raw.devices?.mobile === true,
    },
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    target: raw.target ?? null,
  };
}

function byPlacement(ads, placement) {
  return ads.filter(
    (ad) =>
      Array.isArray(ad.placements) && ad.placements.includes(placement)
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

  const targeted = pool.filter(
    (ad) => ad.target && ad.target === slug
  );
  if (targeted.length) return targeted;

  const byCat = pool.filter(
    (ad) =>
      !ad.target &&
      ad.categories.length > 0 &&
      category &&
      ad.categories.some(
        (c) => c.toLowerCase() === category.toLowerCase()
      )
  );
  if (byCat.length) return byCat;

  return pool.filter(
    (ad) => !ad.target && ad.categories.length === 0
  );
}

export function useToolAds({ placement, toolSlug, toolCategories = [] } = {}) {
  const ads = useContext(AdsContext);
  if (!ads.length || !placement) return [];

  const pool = byPlacement(ads, placement);

  const targeted = pool.filter(
    (ad) => ad.target && ad.target === toolSlug
  );
  if (targeted.length) return targeted;

  const byCat = pool.filter(
    (ad) =>
      !ad.target &&
      ad.categories.length > 0 &&
      toolCategories.length > 0 &&
      ad.categories.some((adCat) =>
        toolCategories.some(
          (tc) => tc.toLowerCase() === adCat.toLowerCase()
        )
      )
  );
  if (byCat.length) return byCat;

  return pool.filter(
    (ad) => !ad.target && ad.categories.length === 0
  );
}
