/**
 * Normalizers that convert every upstream API's raw shape into one
 * common `Deal` interface (see ./types.js).
 */

import { haversineKm, roundKm } from "./distance.service.js";

let dealCounter = 0;
function nextId(prefix) {
  dealCounter += 1;
  return `${prefix}-${Date.now()}-${dealCounter}`;
}

function toNumberOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function computeDiscountPercent(price, originalPrice) {
  if (!Number.isFinite(price) || !Number.isFinite(originalPrice) || originalPrice <= 0) return null;
  const percent = ((originalPrice - price) / originalPrice) * 100;
  return percent > 0 ? Math.round(percent) : null;
}

/**
 * @param {import("./types.js").ShoppingResult} item
 * @returns {import("./types.js").Deal}
 */
export function normalizeShoppingResultToDeal(item) {
  const price = toNumberOrNull(item.price);
  const originalPrice = toNumberOrNull(item.originalPrice) ?? price;

  return {
    id: item.id || nextId(item.shoppingSource || "shopping"),
    title: item.title || "Untitled deal",
    description: item.delivery || "",
    store: item.seller || item.shoppingSource || "Online store",
    price,
    originalPrice,
    discount: toNumberOrNull(item.discount) ?? computeDiscountPercent(price, originalPrice),
    image: item.image || "",
    url: item.productUrl || "#",
    latitude: null,
    longitude: null,
    distance: null,
    category: "shopping",
    rating: toNumberOrNull(item.rating),
    source: item.shoppingSource || "shopping",
    offerType: "deal",
    expiresAt: null,
  };
}

/**
 * @param {import("./types.js").PlaceResult} place
 * @returns {import("./types.js").Deal}
 */
export function normalizePlaceToDeal(place) {
  return {
    id: place.placeId || nextId("place"),
    title: place.name || "Nearby store",
    description: place.address || "",
    store: place.name || "Nearby store",
    price: null,
    originalPrice: null,
    discount: null,
    image: "",
    url: place.website || "#",
    latitude: toNumberOrNull(place.latitude),
    longitude: toNumberOrNull(place.longitude),
    distance: null,
    category: place.category || "store",
    rating: toNumberOrNull(place.rating),
    source: place.source || "openstreetmap",
    offerType: "store",
    expiresAt: null,
  };
}

/**
 * @param {import("./types.js").AffiliateOffer} offer
 * @returns {import("./types.js").Deal}
 */
export function normalizeAffiliateOfferToDeal(offer) {
  return {
    id: offer.id || nextId(offer.provider || "affiliate"),
    title: offer.title || "Affiliate offer",
    description: offer.description || "",
    store: offer.store || offer.provider || "Affiliate",
    price: null,
    originalPrice: null,
    discount: toNumberOrNull(offer.discount),
    image: "",
    url: offer.url || "#",
    latitude: null,
    longitude: null,
    distance: null,
    category: "offer",
    rating: null,
    source: offer.provider || "affiliate",
    offerType: offer.offerType || "deal",
    expiresAt: offer.expiresAt || null,
  };
}

/**
 * Attach a computed great-circle distance (km) from a reference point to a Deal.
 * @param {import("./types.js").Deal} deal
 * @param {{ lat: number, lng: number }|null} refCoords
 * @returns {import("./types.js").Deal}
 */
export function withComputedDistance(deal, refCoords) {
  if (!refCoords || deal.latitude == null || deal.longitude == null) {
    return { ...deal, distance: deal.distance ?? null };
  }

  return {
    ...deal,
    distance: roundKm(haversineKm(refCoords.lat, refCoords.lng, deal.latitude, deal.longitude)),
  };
}
