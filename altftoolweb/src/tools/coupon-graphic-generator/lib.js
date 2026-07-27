/**
 * Coupon graphic engine.
 *
 * The arithmetic here is the offer itself, because the headline on a coupon and the
 * saving a customer actually gets often differ:
 *   percent off   discount = price x rate/100, then capped at any maximum discount
 *   amount off    discount = min(amount, price) — a coupon can never take a basket below zero
 *   BOGO          buy X get Y free at one unit price: the customer pays for X of X+Y items,
 *                 so the effective discount is Y / (X + Y), i.e. buy 2 get 1 free = 33.3%, not 50%
 *   free shipping discount = the shipping charge
 * Expiry is counted in whole UTC days between two dates supplied as arguments, never
 * from the system clock, so the module stays pure.
 */

/* ------------------------------------------------------------------ canvas sizes */

export const CANVAS_PRESETS = [
  { id: "ig-square", label: "Instagram square", width: 1080, height: 1080, note: "1:1 feed post" },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, note: "4:5 feed post" },
  { id: "story", label: "Story / Reel", width: 1080, height: 1920, note: "9:16 full screen" },
  { id: "email-banner", label: "Email banner", width: 1200, height: 400, note: "3:1 header strip" },
  { id: "voucher", label: "Printable voucher", width: 1500, height: 600, note: "2.5:1 ticket shape" },
  { id: "linkedin", label: "LinkedIn", width: 1200, height: 627, note: "1.91:1 link image" },
];

export const STORY_SAFE_TOP_PX = 250;
export const STORY_SAFE_BOTTOM_PX = 420;
export const MARGIN_RATIO = 0.075;
export const AVG_GLYPH_WIDTH_RATIO = 0.52;

/* ------------------------------------------------------------------ the offer */

export const DISCOUNT_TYPES = [
  { id: "percent", label: "Percent off", valueLabel: "Discount (%)" },
  { id: "amount", label: "Amount off", valueLabel: "Discount amount" },
  { id: "bogo", label: "Buy X get Y free", valueLabel: "Unit price" },
  { id: "shipping", label: "Free shipping", valueLabel: "Shipping charge waived" },
];

/** Codes shorter than this get mistyped less but are far easier to guess and share. */
export const MIN_CODE_LENGTH = 4;
/** Past this length people stop typing the code and abandon the basket. */
export const MAX_CODE_LENGTH = 15;

/** Normalise a promo code: uppercase, letters, digits and hyphens only. */
export function normaliseCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
}

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Work out what the offer is actually worth.
 *
 * @param {object} input
 * @param {"percent"|"amount"|"bogo"|"shipping"} input.type
 * @param {number} input.value percent, amount, unit price or shipping charge depending on type
 * @param {number} input.basketValue the order value the offer is applied to
 * @param {number} [input.buyQty] BOGO only
 * @param {number} [input.getQty] BOGO only
 * @param {number} [input.maxDiscount] cap on the discount, 0 or blank for none
 * @param {number} [input.minSpend] minimum order value for the offer to apply
 * @returns {object} { discount, finalPrice, effectivePercent, qualifies } or { error }
 */
export function computeDiscount(input = {}) {
  const type = String(input.type || "percent");
  const value = Number(input.value);
  const basket = Number(input.basketValue);
  const maxDiscount = Number(input.maxDiscount) > 0 ? Number(input.maxDiscount) : 0;
  const minSpend = Number(input.minSpend) > 0 ? Number(input.minSpend) : 0;

  if (!Number.isFinite(value) || value < 0) return { error: "The offer value must be zero or more." };

  if (type === "bogo") {
    const buyQty = Math.round(Number(input.buyQty));
    const getQty = Math.round(Number(input.getQty));
    if (!(buyQty >= 1) || !(getQty >= 1)) return { error: "Buy and get quantities must both be at least 1." };
    if (!(value > 0)) return { error: "Enter the unit price so the saving can be calculated." };
    const items = buyQty + getQty;
    const before = items * value;
    const discount = getQty * value;
    const effectivePercent = (getQty / items) * 100;
    return {
      type,
      before: round2(before),
      discount: round2(discount),
      finalPrice: round2(before - discount),
      effectivePercent: round2(effectivePercent),
      qualifies: true,
      headline: `Buy ${buyQty} get ${getQty} free`,
      itemsPaidFor: buyQty,
      itemsReceived: items,
    };
  }

  if (type === "shipping") {
    if (!(value >= 0)) return { error: "Enter the shipping charge being waived." };
    const before = Number.isFinite(basket) && basket > 0 ? basket + value : value;
    const qualifies = minSpend === 0 || (Number.isFinite(basket) && basket >= minSpend);
    return {
      type,
      before: round2(before),
      discount: round2(qualifies ? value : 0),
      finalPrice: round2(before - (qualifies ? value : 0)),
      effectivePercent: before > 0 ? round2(((qualifies ? value : 0) / before) * 100) : 0,
      qualifies,
      headline: "Free shipping",
    };
  }

  if (!Number.isFinite(basket) || basket <= 0) {
    return { error: "Enter the order value the discount applies to." };
  }

  const qualifies = minSpend === 0 || basket >= minSpend;

  if (type === "percent") {
    if (value > 100) return { error: "A percentage discount cannot be more than 100%." };
    let discount = qualifies ? (basket * value) / 100 : 0;
    let capped = false;
    if (maxDiscount > 0 && discount > maxDiscount) {
      discount = maxDiscount;
      capped = true;
    }
    return {
      type,
      before: round2(basket),
      discount: round2(discount),
      finalPrice: round2(basket - discount),
      effectivePercent: round2((discount / basket) * 100),
      capped,
      qualifies,
      headline: `${value % 1 === 0 ? value : round2(value)}% off`,
    };
  }

  // Amount off. A coupon can never take a basket below zero.
  let discount = qualifies ? Math.min(value, basket) : 0;
  let capped = false;
  if (maxDiscount > 0 && discount > maxDiscount) {
    discount = maxDiscount;
    capped = true;
  }
  return {
    type: "amount",
    before: round2(basket),
    discount: round2(discount),
    finalPrice: round2(basket - discount),
    effectivePercent: round2((discount / basket) * 100),
    capped,
    clampedToBasket: value > basket,
    qualifies,
    headline: "Amount off",
  };
}

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse yyyy-mm-dd as UTC midnight. Rejects impossible dates such as 2026-02-29. */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const stamp = Date.UTC(y, m - 1, d);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return stamp;
}

/** Whole days from todayIso to expiryIso. Negative means the code has already expired. */
export function daysRemaining(expiryIso, todayIso) {
  const expiry = parseIsoDate(expiryIso);
  const today = parseIsoDate(todayIso);
  if (expiry === null || today === null) return null;
  return Math.round((expiry - today) / MS_PER_DAY);
}

export function expiryLine(expiryIso, todayIso, locale = "en-GB") {
  const stamp = parseIsoDate(expiryIso);
  if (stamp === null) return { text: "", expired: false, days: null };
  const formatted = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(stamp));
  const days = daysRemaining(expiryIso, todayIso);
  if (days === null) return { text: `Valid until ${formatted}`, expired: false, days: null };
  if (days < 0) return { text: `Expired ${formatted}`, expired: true, days };
  if (days === 0) return { text: `Ends today, ${formatted}`, expired: false, days };
  if (days === 1) return { text: `Ends tomorrow, ${formatted}`, expired: false, days };
  return { text: `${days} days left — ends ${formatted}`, expired: false, days };
}

/* ------------------------------------------------------------------ terms */

/**
 * Assemble the small-print line. Most consumer-protection regimes expect the material
 * conditions of an offer — expiry, minimum spend, exclusions, usage limit — to appear
 * with the offer itself rather than only behind a link.
 */
export function buildTermsLine({ expiryIso, todayIso, minSpend, currency = "USD", locale = "en-US", maxDiscount, oneUsePerCustomer, exclusions, combinable }) {
  const money = (amount) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount) || 0);
  const parts = [];
  const stamp = parseIsoDate(expiryIso);
  if (stamp !== null) {
    const formatted = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(stamp));
    const days = daysRemaining(expiryIso, todayIso);
    parts.push(days !== null && days < 0 ? `Offer expired ${formatted}` : `Valid until ${formatted}`);
  }
  if (Number(minSpend) > 0) parts.push(`Minimum spend ${money(minSpend)}`);
  if (Number(maxDiscount) > 0) parts.push(`Maximum discount ${money(maxDiscount)}`);
  if (oneUsePerCustomer) parts.push("One use per customer");
  if (combinable === false) parts.push("Cannot be combined with other offers");
  const extra = String(exclusions || "").trim();
  if (extra) parts.push(extra.replace(/\.$/, ""));
  return parts.length ? `${parts.join(". ")}.` : "";
}

/* ------------------------------------------------------------------ colour */

export const PALETTES = [
  { id: "signal", label: "Signal", bg: { h: 12, s: 84, l: 45 }, fg: { h: 20, s: 60, l: 99 }, accent: { h: 45, s: 96, l: 66 } },
  { id: "ink", label: "Ink", bg: { h: 222, s: 47, l: 11 }, fg: { h: 210, s: 40, l: 98 }, accent: { h: 174, s: 80, l: 45 } },
  { id: "paper", label: "Paper", bg: { h: 40, s: 38, l: 95 }, fg: { h: 25, s: 30, l: 16 }, accent: { h: 18, s: 78, l: 48 } },
  { id: "mint", label: "Mint", bg: { h: 158, s: 64, l: 32 }, fg: { h: 150, s: 40, l: 98 }, accent: { h: 45, s: 96, l: 66 } },
  { id: "midnight", label: "Midnight", bg: { h: 245, s: 40, l: 14 }, fg: { h: 250, s: 30, l: 97 }, accent: { h: 262, s: 84, l: 68 } },
];

const clampNumber = (v, min, max) => Math.min(max, Math.max(min, v));
const toHexPair = (v) => clampNumber(Math.round(v), 0, 255).toString(16).padStart(2, "0");

export function hslToHex({ h, s, l }) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clampNumber(Number(s), 0, 100) / 100;
  const light = clampNumber(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  const table = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = table[Math.floor(hue / 60) % 6];
  return `#${toHexPair((r + m) * 255)}${toHexPair((g + m) * 255)}${toHexPair((b + m) * 255)}`;
}

export function parseHex(value) {
  const raw = String(value || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    const [r, g, b] = raw.split("");
    return { r: parseInt(r + r, 16), g: parseInt(g + g, 16), b: parseInt(b + b, 16) };
  }
  if (/^[0-9a-f]{6}$/i.test(raw)) {
    return { r: parseInt(raw.slice(0, 2), 16), g: parseInt(raw.slice(2, 4), 16), b: parseInt(raw.slice(4, 6), 16) };
  }
  return null;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(colour) {
  const channels = parseHex(colour);
  if (!channels) return null;
  const linear = (raw) => {
    const v = raw / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(channels.r) + 0.7152 * linear(channels.g) + 0.0722 * linear(channels.b);
}

/** WCAG 2.1 contrast ratio, 1 to 21. */
export function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  if (a === null || b === null) return null;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function contrastVerdict(ratio) {
  if (!Number.isFinite(ratio)) return { level: "unknown", label: "Contrast unknown" };
  if (ratio >= 7) return { level: "aaa", label: "Passes AAA (7:1)" };
  if (ratio >= 4.5) return { level: "aa", label: "Passes AA (4.5:1)" };
  if (ratio >= 3) return { level: "aa-large", label: "Passes AA for large text only (3:1)" };
  return { level: "fail", label: "Fails AA — hard to read" };
}

/* ------------------------------------------------------------------ type fitting */

export function estimateWidth(text, fontSize) {
  return String(text).length * fontSize * AVG_GLYPH_WIDTH_RATIO;
}

export function wrapText(text, maxWidth, measure) {
  const words = String(text).replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0 || !(maxWidth > 0)) return [];
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function fitSingleLine(text, boxWidth, maxSize, measure = estimateWidth) {
  const body = String(text || "");
  if (!body || !(boxWidth > 0)) return 0;
  const cap = Math.max(8, Math.floor(Number(maxSize) || 8));
  for (let size = cap; size >= 8; size -= 1) {
    if (measure(body, size) <= boxWidth) return size;
  }
  return 8;
}

/* ------------------------------------------------------------------ the graphic */

export function findPreset(id) {
  return CANVAS_PRESETS.find((preset) => preset.id === id) || CANVAS_PRESETS[0];
}

export function findPalette(id) {
  return PALETTES.find((palette) => palette.id === id) || PALETTES[0];
}

/**
 * Build the coupon graphic spec.
 * @returns {object} spec, or { error }
 */
export function buildCoupon(input = {}) {
  const code = normaliseCode(input.code);
  if (!code) return { error: "Enter a promo code — letters, numbers and hyphens only." };

  const offer = computeDiscount({
    type: input.type,
    value: input.value,
    basketValue: input.basketValue,
    buyQty: input.buyQty,
    getQty: input.getQty,
    maxDiscount: input.maxDiscount,
    minSpend: input.minSpend,
  });
  if (offer.error) return { error: offer.error };

  const preset = findPreset(input.presetId);
  const palette = findPalette(input.paletteId);
  const background = parseHex(input.background) ? input.background : hslToHex(palette.bg);
  const foreground = parseHex(input.foreground) ? input.foreground : hslToHex(palette.fg);
  const accent = parseHex(input.accent) ? input.accent : hslToHex(palette.accent);

  const currency = String(input.currency || "USD").toUpperCase();
  const locale = String(input.locale || "en-US");
  const money = (amount) => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount) || 0);

  const expiry = expiryLine(input.expiryIso, input.todayIso, locale === "en-US" ? "en-US" : locale);
  const terms = buildTermsLine({
    expiryIso: input.expiryIso,
    todayIso: input.todayIso,
    minSpend: input.minSpend,
    maxDiscount: input.maxDiscount,
    currency,
    locale,
    oneUsePerCustomer: input.oneUsePerCustomer,
    combinable: input.combinable,
    exclusions: input.exclusions,
  });

  // Headline: the number the customer reads first.
  let headline = offer.headline;
  if (offer.type === "amount") headline = `${money(offer.discount)} off`;
  if (offer.type === "shipping") headline = "Free shipping";

  const { width, height } = preset;
  const shortEdge = Math.min(width, height);
  const margin = Math.round(shortEdge * MARGIN_RATIO);
  const isStory = preset.id === "story";
  const topBound = isStory ? Math.max(margin, STORY_SAFE_TOP_PX) : margin;
  const bottomBound = isStory ? Math.max(margin, STORY_SAFE_BOTTOM_PX) : margin;

  const cardX = margin;
  const cardY = topBound;
  const cardWidth = width - margin * 2;
  const cardHeight = height - topBound - bottomBound;
  if (cardHeight < shortEdge * 0.2) {
    return { error: "This canvas is too short for a coupon once the safe area is removed. Pick a taller placement." };
  }

  const pad = Math.round(shortEdge * 0.06);
  const innerWidth = cardWidth - pad * 2;

  const eyebrow = String(input.eyebrow || "").trim();
  const eyebrowSize = Math.round(shortEdge * 0.03);
  const headlineSize = fitSingleLine(headline, innerWidth, Math.round(shortEdge * 0.16), input.measure);
  const codeSize = fitSingleLine(code, innerWidth * 0.8, Math.round(shortEdge * 0.09), input.measure);
  const termsSize = Math.round(shortEdge * 0.019);
  const expirySize = Math.round(shortEdge * 0.026);

  const termsLines = wrapText(terms, innerWidth, (chunk) => (input.measure ? input.measure(chunk, termsSize) : estimateWidth(chunk, termsSize)));

  let cursor = cardY + pad;
  const eyebrowY = eyebrow ? cursor + eyebrowSize : cursor;
  if (eyebrow) cursor += eyebrowSize * 1.9;

  const headlineY = cursor + headlineSize * 0.86;
  cursor += headlineSize * 1.12;

  const codeBoxHeight = Math.round(codeSize * 1.9);
  const codeBoxWidth = Math.min(innerWidth, Math.round((input.measure ? input.measure(code, codeSize) : estimateWidth(code, codeSize)) + codeSize * 1.8));
  const codeBoxY = cursor + Math.round(shortEdge * 0.02);
  cursor = codeBoxY + codeBoxHeight + Math.round(shortEdge * 0.03);

  const expiryY = cursor + expirySize;
  const termsTop = cardY + cardHeight - pad - termsLines.length * termsSize * 1.35;

  const warnings = [];
  if (code.length < MIN_CODE_LENGTH) warnings.push(`A ${code.length}-character code is very easy to guess. ${MIN_CODE_LENGTH} characters is a sensible floor.`);
  if (code.length > MAX_CODE_LENGTH) warnings.push(`A ${code.length}-character code has to be typed on a phone keyboard. Keep it to ${MAX_CODE_LENGTH} characters or fewer.`);
  if (expiry.expired) warnings.push("This code has already expired relative to the reference date.");
  if (!terms) warnings.push("No terms line. Expiry, minimum spend and usage limits normally have to appear with the offer itself.");
  if (offer.capped) warnings.push(`The maximum discount cap reduces the real saving to ${offer.effectivePercent}%.`);
  if (offer.clampedToBasket) warnings.push("The discount is larger than the order value, so it has been limited to the order total.");
  if (offer.qualifies === false) warnings.push("This order is below the minimum spend, so the offer would not apply.");

  const bgContrast = contrastRatio(foreground, background);
  const codeContrast = contrastRatio(background, accent);

  return {
    preset,
    width,
    height,
    background,
    foreground,
    accent,
    offer,
    code,
    money: { discount: money(offer.discount), before: money(offer.before), final: money(offer.finalPrice) },
    card: { x: cardX, y: cardY, width: cardWidth, height: cardHeight, radius: Math.round(shortEdge * 0.035) },
    perforation: { radius: Math.round(shortEdge * 0.035), y: codeBoxY + codeBoxHeight / 2 },
    eyebrow: eyebrow ? { text: eyebrow.toUpperCase(), size: eyebrowSize, x: cardX + cardWidth / 2, y: eyebrowY } : null,
    headline: { text: headline, size: headlineSize, x: cardX + cardWidth / 2, y: headlineY },
    codeBox: {
      x: cardX + (cardWidth - codeBoxWidth) / 2,
      y: codeBoxY,
      width: codeBoxWidth,
      height: codeBoxHeight,
      radius: Math.round(codeBoxHeight * 0.22),
      textSize: codeSize,
      centreX: cardX + cardWidth / 2,
      textY: codeBoxY + codeBoxHeight / 2,
    },
    expiry: { ...expiry, size: expirySize, x: cardX + cardWidth / 2, y: expiryY },
    terms: { lines: termsLines, size: termsSize, x: cardX + cardWidth / 2, top: termsTop, text: terms },
    safeArea: isStory ? { top: STORY_SAFE_TOP_PX, bottom: STORY_SAFE_BOTTOM_PX } : null,
    contrast: {
      ratio: Number.isFinite(bgContrast) ? Math.round(bgContrast * 100) / 100 : null,
      code: Number.isFinite(codeContrast) ? Math.round(codeContrast * 100) / 100 : null,
      verdict: contrastVerdict(bgContrast),
    },
    warnings,
  };
}
