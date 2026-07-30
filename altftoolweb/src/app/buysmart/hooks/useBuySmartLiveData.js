"use client";

import { useEffect, useMemo, useState } from "react";
import { isActiveStatus, normalizeBuySmartCategory } from "@altftool/core/buysmart";

import { fallbackBuySmartOffers } from "@/app/buysmart/data/fallbackOffers";
import fallbackStores from "@/app/buysmart/data/stores.json";
import fallbackDeals from "@/app/buysmart/data/trending.json";
import { firebaseBuySmartAnalyticsSource } from "@/app/buysmart/service.js/firebaseBuySmartAnalytics";
import { firebaseBuySmartCategoriesSource } from "@/app/buysmart/service.js/firebaseBuySmartCategories";
import { firebaseBuySmartFeatureBrandSource } from "@/app/buysmart/service.js/firebaseBuySmartFeature";
import { firebaseBuySmartStoreSource } from "@/app/buysmart/service.js/firebaseBuySmartStore";

const fallbackStoreUrls = {
  ajio: "https://www.ajio.com",
  amazon: "https://www.amazon.in",
  myntra: "https://www.myntra.com",
  savana: "https://www.savana.com",
};

function getFallbackStoreUrl(store) {
  if (store.url || store.link) return store.url || store.link;
  return fallbackStoreUrls[store.slug] || "#";
}

const fallbackStoreItems = fallbackStores.map((store) => {
  const externalUrl = getFallbackStoreUrl(store);

  return {
    ...store,
    image: store.image || store.logo,
    link: externalUrl,
    status: store.status || "active",
    storePath: store.slug ? `/buysmart/stores/${store.slug}` : "#",
    url: externalUrl,
  };
});

const fallbackStoreOffers = fallbackStores.map((store, index) =>
  normalizeBuySmartCategory({
    audience: "All shoppers",
    category: "Trending",
    discount: store.highlight || "View deal",
    featured: index < 3,
    link: getFallbackStoreUrl(store),
    offerType: "deal",
    priority: Math.max(0, 30 - index),
    slug: store.slug,
    status: store.status || "active",
    title: store.name,
    verified: true,
    workingVotes: Math.max(3, 18 - index),
  }),
);

// Provenance marker. Fallback rows are seeded sample offers (their discounts,
// coupon codes, vote counts, and verification flags are generated from an array
// index), so consumers that publish structured data must be able to tell them
// apart from rows Firestore actually returned. Only `isLiveRecord: true` rows
// describe a real offer.
function markProvenance(items, isLiveRecord) {
  return items.map((item) => ({ ...item, isLiveRecord }));
}

export const fallbackBuySmartCategoryItems = markProvenance(
  [
    ...fallbackStoreOffers,
    ...fallbackBuySmartOffers.map(normalizeBuySmartCategory),
  ].filter((item, index, items) => (
    isActiveStatus(item.status) &&
    items.findIndex((candidate) => candidate.storeSlug === item.storeSlug) === index
  )),
  false,
);

const fallbackFeaturedDeals = fallbackDeals
  .filter((deal) => deal.image?.trim())
  .map((deal, index) => ({
    category: deal.category || "Top Deals",
    id: `fallback-${index}`,
    image: deal.image.trim(),
    imageType: index === 0 ? "square" : "landscape",
    link: deal.link || "#",
    status: "active",
    title: deal.title,
  }));

function useLiveSource(source, fallbackItems, normalizeLiveItems) {
  const [items, setItems] = useState(fallbackItems);
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = source.subscribe(
      (data) => {
        if (!mounted) return;

        const normalized = normalizeLiveItems(data);
        const hasLiveItems = normalized.length > 0;

        setItems(hasLiveItems ? normalized : fallbackItems);
        setIsSynced(hasLiveItems);
        setError(null);
      },
      (readError) => {
        if (!mounted) return;

        setItems((current) => (current?.length ? current : fallbackItems));
        setError(readError);
      },
    );

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [fallbackItems, normalizeLiveItems, source]);

  return useMemo(
    () => ({
      error,
      isFallback: !isSynced,
      isSynced,
      items,
      loading: false,
    }),
    [error, isSynced, items],
  );
}

function normalizeCategoryItems(data) {
  const liveItems = markProvenance(
    (Array.isArray(data) ? data : [])
      .filter(Boolean)
      .map(normalizeBuySmartCategory)
      .filter((item) => isActiveStatus(item.status)),
    true,
  );

  if (!liveItems.length) return [];

  return [...liveItems, ...fallbackBuySmartCategoryItems].filter(
    (item, index, items) =>
      items.findIndex((candidate) => candidate.storeSlug === item.storeSlug) === index,
  );
}

function normalizeStoreItems(data) {
  return (Array.isArray(data) ? data : [])
    .filter((item) => item && isActiveStatus(item.status))
    .map((store) => ({
      ...store,
      image: store.image || store.logo || "",
      link: store.link || store.storePath || (store.slug ? `/buysmart/stores/${store.slug}` : "#"),
      status: store.status || "active",
    }));
}

function normalizeFeatureItems(data) {
  return (Array.isArray(data) ? data : [])
    .filter((item) => item && isActiveStatus(item.status))
    .map((item) => {
      const brand = item.BrandDetail?.[0] || {};

      return {
        ...item,
        image: brand.image || item.image || "",
        imageType: brand.imageType || item.imageType || "",
        link: brand.link || item.link || "#",
        status: item.status || "active",
        title: brand.title || item.title || "",
      };
    });
}

export function useBuySmartCategories() {
  return useLiveSource(
    firebaseBuySmartCategoriesSource,
    fallbackBuySmartCategoryItems,
    normalizeCategoryItems,
  );
}

export function useBuySmartStores() {
  return useLiveSource(
    firebaseBuySmartStoreSource,
    fallbackStoreItems,
    normalizeStoreItems,
  );
}

export function useBuySmartFeaturedDeals() {
  return useLiveSource(
    firebaseBuySmartFeatureBrandSource,
    fallbackFeaturedDeals,
    normalizeFeatureItems,
  );
}

export function useBuySmartAnalytics() {
  const [analytics, setAnalytics] = useState({ counters: {}, events: [], updatedAt: 0 });
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = firebaseBuySmartAnalyticsSource.subscribe(
      (data) => {
        if (!mounted) return;
        setAnalytics(data || { counters: {}, events: [], updatedAt: 0 });
        setIsSynced(true);
        setError(null);
      },
      (readError) => {
        if (!mounted) return;
        setError(readError);
      },
    );

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return useMemo(
    () => ({
      ...analytics,
      error,
      isSynced,
      loading: false,
    }),
    [analytics, error, isSynced],
  );
}
