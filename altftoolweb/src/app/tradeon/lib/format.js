// src/app/tradeon/lib/format.js
// Number / price / percentage formatting helpers for the Tradeon platform.

import { symbolToSlug } from "./instruments";

const compactFmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

/** Format a price with sensible precision based on magnitude. */
export function formatPrice(value, { currency = "$", forceDecimals } = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  let decimals =
    forceDecimals ??
    (abs >= 1000 ? 2 : abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6);
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return currency ? `${currency}${formatted}` : formatted;
}

/** Signed percentage, e.g. +1.24% / -0.88%. */
export function formatPct(value, { digits = 2 } = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

/** Signed absolute change. */
export function formatChange(value, { currency = "" } = {}) {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${currency}${Math.abs(value) >= 1 ? value.toFixed(2) : value.toFixed(4)}`;
}

/** Compact large numbers: 1.2M, 3.4B, 900K. */
export function formatCompact(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return compactFmt.format(value);
}

/** Market cap / volume with a leading currency symbol. */
export function formatCap(value, currency = "$") {
  if (value == null || Number.isNaN(value)) return "—";
  return `${currency}${compactFmt.format(value)}`;
}

export function directionClass(value) {
  if (value > 0) return "tdn-up";
  if (value < 0) return "tdn-down";
  return "tdn-flat";
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Route-safe links for symbols that may contain a slash, such as EUR/USD. */
export function assetHref(symbol) {
  return `/tradeon/asset/${symbolToSlug(symbol)}`;
}

export function chartHref(symbol, params) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `/tradeon/chart/${symbolToSlug(symbol)}${query}`;
}
