"use client";

import { useEffect, useMemo, useState } from "react";
import { isActiveStatus, normalizeBuySmartCategory } from "@altftool/core/buysmart";

import { fallbackBuySmartOffers } from "@/app/buysmart/data/fallbackOffers";
import fallbackStores from "@/app/buysmart/data/stores.json";
import fallbackDeals from "@/app/buysmart/data/trending.json";
import { firebaseBuySmartCategoriesSource } from "@/app/buysmart/service.js/firebaseBuySmartCategories";
import { firebaseBuySmartFeatureBrandSource } from "@/app/buysmart/service.js/firebaseBuySmartFeature";
import { firebaseBuySmartStoreSource } from "@/app/buysmart/service.js/firebaseBuySmartStore";

const fallbackStoreItems = fallbackStores.map((store) => ({
  ...store,
  image: store.image || store.logo,
  link: store.link || (store.slug ? `/buysmart/stores/${store.slug}` : "#"),
  status: store.status || "active",
}));

const fallbackStoreOffers = fallbackStores.map((store, index) =>
  normalizeBuySmartCategory({
    audience: "All shoppers",
    category: "Trending",
    discount: store.highlight || "View deal",
    featured: index < 3,
    link: store.url || store.link || "#",
    offerType: "deal",
    priority: Math.max(0, 30 - index),
    status: store.status || "active",
    title: store.name,
    verified: true,
    workingVotes: Math.max(3, 18 - index),
  }),
);

export const fallbackBuySmartCategoryItems = [
  ...fallbackStoreOffers,
  ...fallbackBuySmartOffers.map(normalizeBuySmartCategory),
].filter((item, index, items) => (
  isActiveStatus(item.status) &&
  items.findIndex((candidate) => candidate.storeSlug === item.storeSlug) === index
));

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
  const liveItems = (Array.isArray(data) ? data : [])
    .filter(Boolean)
    .map(normalizeBuySmartCategory)
    .filter((item) => isActiveStatus(item.status));

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
