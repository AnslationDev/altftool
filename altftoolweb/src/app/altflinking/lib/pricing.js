/**
 * One place that decides what a listing costs.
 *
 * Six call sites each resolved this independently and they disagreed. The card
 * routes `guestPost === 0` to a "1:1 Link Exchange — FREE ($0 Fee)" badge, but
 * the cart total, the cart row and the committed order line all used
 * `item.prices?.guestPost || 180`. Zero is falsy, so a listing the marketplace
 * advertises as free was billed at $180 and the order was written at $180.
 *
 * The other half of the problem was the 180 itself: a listing whose publisher
 * never entered a price is unknown, not $180, and inventing a number to charge
 * against is worse than showing nothing. `resolveGuestPostPrice` returns null
 * for unknown, and callers are expected to handle null rather than substitute.
 */

export function normalizePrice(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseOptionalPrice(value) {
  if (value === null || value === undefined) return { valid: true, value: null };
  if (typeof value === "string" && value.trim() === "") {
    return { valid: true, value: null };
  }
  const normalized = normalizePrice(value);
  return { valid: normalized !== null, value: normalized };
}

/**
 * Validate the two publisher-controlled listing prices without confusing an
 * omitted price with an explicitly free one.
 */
export function validateListingPrices(prices) {
  if (!prices || typeof prices !== "object" || Array.isArray(prices)) {
    return { error: "prices must be an object", value: null };
  }

  const guestPost = parseOptionalPrice(prices.guestPost);
  const linkInsertion = parseOptionalPrice(prices.linkInsertion);
  if (!guestPost.valid) {
    return { error: "guestPost price must be a finite nonnegative number", value: null };
  }
  if (!linkInsertion.valid) {
    return { error: "linkInsertion price must be a finite nonnegative number", value: null };
  }
  if (guestPost.value === null && linkInsertion.value === null) {
    return { error: "At least one explicit listing price is required", value: null };
  }

  return {
    error: null,
    value: {
      guestPost: guestPost.value,
      linkInsertion: linkInsertion.value,
    },
  };
}

/** Guest-post price in dollars, 0 for a free exchange, or null if unknown. */
export function resolveGuestPostPrice(site) {
  const value = site?.prices?.guestPost ?? site?.price;
  return normalizePrice(value);
}

/** Link-insertion price supplied by the publisher, or null when unknown. */
export function resolveLinkInsertionPrice(site) {
  return normalizePrice(site?.prices?.linkInsertion);
}

/** Resolve only the explicit price for the requested placement type. */
export function resolveOrderPrice(site, type) {
  if (type === "GUEST_POST") return resolveGuestPostPrice(site);
  if (type === "LINK_INSERTION") return resolveLinkInsertionPrice(site);
  return null;
}

/** What to render in a price slot: "$120", "Free", or an em dash when unknown. */
export function formatPrice(value) {
  const normalized = normalizePrice(value);
  if (normalized === null) return "—";
  return normalized === 0 ? "Free" : `$${normalized}`;
}

/** Only priced listings can be ordered; unknown-price listings must not be. */
export function isOrderable(site, type = "GUEST_POST") {
  return resolveOrderPrice(site, type) !== null;
}
