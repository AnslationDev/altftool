"use client";

import { useCallback, useMemo, useState } from "react";
import { PAGE_SIZE } from "../data/staticContent";

const INITIAL_FILTERS = {
  search: "",
  categories: [],
  brands: [],
  discountMins: [],
  priceRanges: [],
  minRating: 0,
  deliverySpeeds: [],
  status: [],
  sort: "discount-desc",
};

function toggleInArray(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function sortProducts(products, sortKey) {
  const list = [...products];
  switch (sortKey) {
    case "price-asc":
      return list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "price-desc":
      return list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    case "rating-desc":
      return list.sort((a, b) => b.rating - a.rating);
    case "popular":
      return list.sort((a, b) => b.boughtCount - a.boughtCount);
    case "newest":
      return list.sort((a, b) => b.id - a.id);
    case "discount-desc":
    default:
      return list.sort((a, b) => b.discountPercent - a.discountPercent);
  }
}

/**
 * Owns all filter/sort/pagination state for the deal grid and derives the
 * visible slice from it. Filtering is real-time (recomputed on every change)
 * rather than gated behind an explicit "Apply" click, per the "filters work
 * together in real time" requirement — the Apply button in the sidebar just
 * closes the mobile drawer.
 */
export function useProductFilters(products) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: toggleInArray(prev[key], value) }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const matched = products.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search)) return false;
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
      if (
        filters.discountMins.length &&
        !filters.discountMins.some((min) => p.discountPercent >= min)
      )
        return false;
      if (filters.priceRanges.length && !filters.priceRanges.includes(p.priceRange)) return false;
      if (filters.minRating && p.rating < filters.minRating) return false;
      if (
        filters.deliverySpeeds.length &&
        !filters.deliverySpeeds.includes(p.deliverySpeed)
      )
        return false;
      if (filters.status.length && !filters.status.every((flag) => p[flag])) return false;
      return true;
    });

    return sortProducts(matched, filters.sort);
  }, [products, filters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    filters.discountMins.length +
    filters.priceRanges.length +
    filters.deliverySpeeds.length +
    filters.status.length +
    (filters.minRating ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  return {
    filters,
    setFilter,
    toggleFilter,
    resetFilters,
    filteredCount: filtered.length,
    pageItems,
    page: safePage,
    pageCount,
    setPage,
    activeFilterCount,
  };
}
