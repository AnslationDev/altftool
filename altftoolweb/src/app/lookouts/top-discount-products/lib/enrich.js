// Turns a raw scraped Amazon product row into an enriched product with the
// derived fields the landing page needs (category, brand, price buckets,
// featured/trending/bestseller flags, ...). The API gives us free-text and
// pre-formatted strings only — everything numeric has to be parsed back out.

const CATEGORY_RULES = [
  { key: "electronics", label: "Electronics", match: /\b(laptop|earbud|earphone|headphone|charger|cable|power ?bank|mobile|smartphone|tablet|camera|speaker|smartwatch|watch(?!.*strap)|tv|television|monitor|keyboard|mouse|router|ssd|hdd|pendrive|memory card|trimmer|shaver|hair dryer|led bulb|bulb|holder stand)\b/i },
  { key: "household", label: "Household", match: /\b(fabric conditioner|fabric softener|detergent|cleaner|air freshener|freshener|repellent|mosquito|wall hook|adhesive hook|drain|toilet|room spray|insect)\b/i },
  { key: "fashion", label: "Fashion", match: /\b(shirt|t-?shirt|jeans|dress|saree|kurta|jacket|shoes?|sneakers?|sandals?|footwear|belt|wallet|handbag|sunglasses|watch strap|jewellery|jewelry|earrings?|necklace|socks|hoodie)\b/i },
  { key: "travel", label: "Travel", match: /\b(suitcase|luggage|trolley|backpack|travel bag|duffel|duffle|cabin bag|spinner)\b/i },
  { key: "home", label: "Home", match: /\b(bedsheet|curtain|pillow|blanket|mattress|furniture|lamp|light|decor|storage|organizer|clock|rug|carpet|cleaning cloth)\b/i },
  { key: "kitchen", label: "Kitchen", match: /\b(cookware|kadai|pan|pot|mixer|grinder|blender|kettle|toaster|bottle|flask|dinner set|cutlery|knife|container|tiffin)\b/i },
  { key: "beauty", label: "Beauty", match: /\b(cream|lotion|serum|shampoo|conditioner|makeup|lipstick|perfume|fragrance|skincare|face wash|sunscreen|towel cap|hair towel)\b/i },
  { key: "sports", label: "Sports", match: /\b(yoga|dumbbell|gym|fitness|cricket|football|badminton|racket|sports shoes|treadmill|cycle|bicycle)\b/i },
  { key: "accessories", label: "Accessories", match: /\b(strap|case|cover|pouch|organizer|lock|sleeve|stand|card holder)\b/i },
];

const MATERIAL_RULES = [
  { key: "leather", match: /\bleather\b/i },
  { key: "cotton", match: /\bcotton\b/i },
  { key: "plastic", match: /\b(pp|polypropylene|plastic)\b/i },
  { key: "metal", match: /\b(steel|aluminium|aluminum|metal)\b/i },
  { key: "polyester", match: /\bpolyester\b/i },
  { key: "silicone", match: /\bsilicone\b/i },
];

const COLOR_WORDS = [
  "black", "white", "blue", "red", "green", "grey", "gray", "silver", "gold",
  "rose gold", "navy", "coral", "pink", "purple", "beige", "brown", "orange",
  "yellow", "teal", "maroon",
];

const SIZE_RULES = [
  { key: "small", match: /\b(small|55 ?cm|56 ?cm|cabin)\b/i },
  { key: "medium", match: /\b(medium|65 ?cm|70 ?cm)\b/i },
  { key: "large", match: /\b(large|75 ?cm|80 ?cm|check-?in)\b/i },
];

function parseNumber(value) {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parsePercent(discount) {
  if (!discount) return 0;
  const m = String(discount).match(/(\d+)\s*%/);
  return m ? Number.parseInt(m[1], 10) : 0;
}

function parseBoughtCount(text) {
  if (!text) return 0;
  const m = String(text).match(/([\d.]+)\s*([KkMm]?)\+?/);
  if (!m) return 0;
  const base = Number.parseFloat(m[1]) || 0;
  const unit = m[2]?.toLowerCase();
  if (unit === "k") return Math.round(base * 1_000);
  if (unit === "m") return Math.round(base * 1_000_000);
  return Math.round(base);
}

function parseRatingCount(text) {
  if (!text) return 0;
  const cleaned = String(text).replace(/[()]/g, "");
  return parseBoughtCount(cleaned);
}

function detectFromRules(title, rules, fallback) {
  const hit = rules.find((rule) => rule.match.test(title));
  return hit ? hit.key : fallback;
}

function detectCategory(title) {
  const hit = CATEGORY_RULES.find((rule) => rule.match.test(title));
  return hit ? { key: hit.key, label: hit.label } : { key: "general", label: "General" };
}

function detectColor(title) {
  const lower = title.toLowerCase();
  const hit = COLOR_WORDS.find((color) => lower.includes(color));
  return hit ? hit.replace(/\b\w/g, (c) => c.toUpperCase()) : null;
}

function detectBrand(title) {
  // Brand is conventionally the leading words before a size/model marker or
  // "by" clause — e.g. "Kamiliant by American Tourister Small Harrier...".
  const byMatch = title.match(/\bby\s+([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*){0,2})/);
  if (byMatch) return byMatch[1].trim();

  const leading = title.match(/^([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*){0,2})/);
  if (leading) return leading[1].trim();

  return "Generic";
}

function priceRangeOf(price) {
  if (price == null) return "unknown";
  if (price < 1000) return "under-1000";
  if (price < 3000) return "1000-3000";
  if (price < 5000) return "3000-5000";
  return "5000-plus";
}

function badgeFor({ discountPercent, rating, boughtCount }) {
  if (discountPercent >= 70) return "Deal of the Day";
  if (rating >= 4.5) return "Top Rated";
  if (boughtCount >= 1000) return "Bestseller";
  return null;
}

function deliverySpeedOf(deliveryDate) {
  if (!deliveryDate) return "standard";
  const lower = deliveryDate.toLowerCase();
  if (lower.includes("today")) return "today";
  if (lower.includes("tomorrow")) return "tomorrow";
  return "week";
}

/**
 * Enriches one raw API product. Flags (featured/trending/bestseller) are
 * derived deterministically from the product's own numbers so re-filtering
 * never reshuffles which items carry a badge.
 */
export function enrichProduct(raw, index = 0) {
  const title = raw.title || "Untitled product";
  const price = parseNumber(raw.price);
  const discountPercent = parsePercent(raw.discount);
  // product_Mrp is frequently unreliable in the scraped feed — it often just
  // duplicates the sale price instead of the true original price. When that
  // happens (or the field is missing), derive MRP from the discount percent
  // instead, which matches the "% off" Amazon itself displays.
  const scrapedMrp = parseNumber(raw.product_Mrp);
  const mrp =
    scrapedMrp != null && price != null && scrapedMrp > price
      ? scrapedMrp
      : price != null && discountPercent > 0
        ? Math.round(price / (1 - discountPercent / 100))
        : (scrapedMrp ?? price);
  const rating = parseNumber(raw.rating) ?? 0;
  const ratingCount = parseRatingCount(raw.total_rating);
  const boughtCount = parseBoughtCount(raw.lastmonth_bought);
  const category = detectCategory(title);
  const brand = detectBrand(title);
  const material = detectFromRules(title, MATERIAL_RULES, null);
  const size = detectFromRules(title, SIZE_RULES, null);
  const color = detectColor(title);
  const deliverySpeed = deliverySpeedOf(raw.delivery_Date);

  const savings = mrp && price ? Math.max(mrp - price, 0) : 0;

  return {
    id: raw.id ?? index + 1,
    title,
    url: raw.url,
    img: raw.img,
    price,
    mrp,
    savings,
    priceRange: priceRangeOf(price),
    rating,
    ratingCount,
    ratingLabel: raw.total_rating || null,
    discountLabel: raw.discount || null,
    discountPercent,
    boughtLabel: raw.lastmonth_bought || null,
    boughtCount,
    deliveryDate: raw.delivery_Date || null,
    deliverySpeed,
    category: category.key,
    categoryLabel: category.label,
    brand,
    material,
    color,
    size,
    productType: category.label,
    featured: discountPercent >= 60 && rating >= 4,
    trending: boughtCount >= 500,
    bestseller: boughtCount >= 800 || ratingCount >= 5000,
    freeDelivery: deliverySpeed !== "standard",
    availability: "In Stock",
    badge: badgeFor({ discountPercent, rating, boughtCount }),
  };
}

export function enrichProducts(rawProducts = []) {
  return rawProducts.map((raw, index) => enrichProduct(raw, index));
}
