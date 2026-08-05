/**
 * AltF Bazaar — the mock listing corpus.
 *
 * Everything is generated from a string seed (see `random.js`), never stored
 * and never randomised at request time. That guarantee matters in three
 * places: `generateStaticParams` must return the same slugs on every build,
 * `sitemap.js` must not advertise URLs that stop existing, and a client
 * re-render must not disagree with the server HTML.
 *
 * No `Date.now()` either — recency is stored as `postedDaysAgo` (an integer)
 * and rendered as a relative label, so "3 days ago" means the same thing in
 * the prerendered HTML and in the hydrated page.
 *
 * Swapping this for a real backend later means replacing `getListings()` and
 * `queryListings()`; the page components do not know how listings are made.
 */

import { CATEGORIES, getCategory } from "./categories";
import { CITIES } from "./cities";
import { ITEM_NAMES, SUBCATEGORY_HINTS, TITLE_SUFFIXES } from "./itemNames";
import { getMarket } from "./market";
import { SELLERS } from "./sellers";
// Free-text matching lives in its own module. The dependency points one way —
// `search.js` never imports this file — so the term index it builds at module
// load costs nothing more than the taxonomy it is derived from.
import { matchListing, parseQuery } from "./search";
import {
  createRng,
  rngChance,
  rngInt,
  rngPick,
  rngSkewed,
  roundPrice,
} from "./random";

/** How many listings the corpus holds. */
const LISTING_TOTAL = 720;

/**
 * Relative share of the corpus per category. Mirrors real classifieds volume
 * so Mobiles and Cars feel busy while Agriculture stays a niche.
 */
const CATEGORY_WEIGHT = {
  mobiles: 12,
  cars: 11,
  properties: 10,
  bikes: 9,
  "electronics-appliances": 9,
  furniture: 7,
  jobs: 6,
  services: 5,
  fashion: 5,
  "books-sports-hobbies": 4,
  gaming: 4,
  "kids-baby": 3,
  refurbished: 3,
  rentals: 3,
  "commercial-vehicles-spares": 3,
  "tools-hardware": 2,
  "health-wellness": 2,
  pets: 2,
  "free-giveaway": 2,
  "industrial-business": 2,
  "travel-outdoor": 2,
  "events-tickets": 2,
  "art-collectibles": 1,
  "agriculture-farming": 1,
};

/** Weighted category pool, expanded once at module load. */
const CATEGORY_POOL = CATEGORIES.flatMap((category) =>
  Array.from({ length: CATEGORY_WEIGHT[category.slug] || 1 }, () => category),
);

/** Weighted city pool — metros carry more inventory. */
const CITY_POOL = CITIES.flatMap((city) =>
  Array.from({ length: city.demand }, () => city),
);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Human price label — for the default market: ₹4,50,000 in the Indian digit
 * grouping, ₹0 rendered as "Free". Symbol, grouping locale and symbol
 * position all come from `data/market.js`; nothing about the output changed
 * when they moved there, and the unit tests lock the exact strings.
 * ("Free" is the en source of truth, like every string this module emits —
 * UI surfaces localise it via the `card.free` catalogue id.)
 */
export function formatPrice(value) {
  const market = getMarket();
  if (value === market.freeValue) return "Free";
  const digits = Number(value).toLocaleString(market.numberLocale);
  return market.currencyDisplay === "symbol-first"
    ? `${market.currencySymbol}${digits}`
    : `${digits}${market.currencySymbol}`;
}

/** "Today" / "3 days ago" / "2 months ago" — derived from an integer. */
export function formatPosted(daysAgo) {
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 14) return "1 week ago";
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
  if (daysAgo < 60) return "1 month ago";
  return `${Math.floor(daysAgo / 30)} months ago`;
}

/**
 * The catalogue id + params for a posted-age label, mirroring `formatPosted`
 * branch for branch. UI surfaces pass these through `t(id, fallback, params)`
 * so "3 days ago" can render as "3 दिन पहले"; `formatPosted` itself stays the
 * English source of truth (tests lock it, JSON-LD uses it).
 */
export function postedParts(daysAgo) {
  if (daysAgo <= 0) return { id: "time.today" };
  if (daysAgo === 1) return { id: "time.yesterday" };
  if (daysAgo < 7) return { id: "time.daysAgo", count: daysAgo };
  if (daysAgo < 14) return { id: "time.oneWeek" };
  if (daysAgo < 30) return { id: "time.weeksAgo", count: Math.floor(daysAgo / 7) };
  if (daysAgo < 60) return { id: "time.oneMonth" };
  return { id: "time.monthsAgo", count: Math.floor(daysAgo / 30) };
}

/** Fill a category's declared attributes with plausible values. */
function buildAttributes(rng, category, subcategory) {
  const values = {};
  for (const attr of category.attributes) {
    switch (attr.type) {
      case "select": {
        values[attr.key] = rngPick(rng, attr.options);
        break;
      }
      case "range": {
        // Bias low for wear metrics, mid for size metrics.
        const wearLike = ["kmDriven", "ageYears", "usageHours", "usageCount"].includes(
          attr.key,
        );
        values[attr.key] = wearLike
          ? rngSkewed(rng, attr.min, attr.max, 2.2)
          : rngInt(rng, attr.min, attr.max);
        break;
      }
      case "toggle": {
        values[attr.key] = rngChance(rng, 0.45);
        break;
      }
      default:
        break;
    }
  }

  // A "For rent" property should not claim a sale price band, and the
  // listing type should agree with the subcategory the user picked.
  if (category.slug === "properties") {
    if (subcategory.slug.startsWith("for-rent")) values.listingType = "For rent";
    else if (subcategory.slug === "pg-guest-houses") values.listingType = "PG & co-living";
    else if (subcategory.slug.startsWith("for-sale")) values.listingType = "For sale";
    if (subcategory.slug === "lands-plots") {
      delete values.bhk;
      delete values.bathrooms;
      delete values.furnishing;
    }
  }

  // Cars: an electric car has no business claiming a petrol engine.
  if (category.slug === "cars" && subcategory.slug === "electric-cars") {
    values.fuel = "Electric";
  }

  // Electric two-wheelers and EVs are recent; a 2007 model year is an
  // anachronism a reader spots instantly.
  const isElectric =
    subcategory.slug === "electric-cars" ||
    subcategory.slug === "electric-two-wheelers";
  if (isElectric && values.year && values.year < 2019) {
    values.year = 2019 + Math.floor(rng() * 7);
  }

  return values;
}

/**
 * Names that actually belong to a subcategory, computed once per
 * category+subcategory pair. Falls back to the whole category pool when no
 * hint is declared, or when a hint matches nothing.
 */
const NAME_POOL_CACHE = new Map();

function namePoolFor(category, subcategory) {
  const key = `${category.slug}/${subcategory.slug}`;
  if (NAME_POOL_CACHE.has(key)) return NAME_POOL_CACHE.get(key);

  const all = ITEM_NAMES[category.slug] || [];
  const pattern = SUBCATEGORY_HINTS[category.slug]?.[subcategory.slug];
  const matched = pattern ? all.filter((name) => pattern.test(name)) : [];
  const pool = matched.length > 0 ? matched : all;

  NAME_POOL_CACHE.set(key, pool);
  return pool;
}

/** Build the ad title. Properties get a structural title, others a product one. */
function buildTitle(rng, category, subcategory, attributes, city, locality) {
  if (category.slug === "properties") {
    const bhk = attributes.bhk || "Plot";
    const noun =
      subcategory.slug === "lands-plots"
        ? "Residential Plot"
        : subcategory.slug === "pg-guest-houses"
          ? "PG Accommodation"
          : subcategory.slug.includes("shops-offices")
            ? "Commercial Space"
            : "Flat";
    const verb = attributes.listingType === "For rent" ? "for Rent" : "for Sale";
    return `${bhk} ${noun} ${verb} in ${locality}, ${city.name}`;
  }

  const base = rngPick(rng, namePoolFor(category, subcategory)) || subcategory.name;

  // An EV model name must not carry a pre-EV model year, wherever it is
  // filed — the electric-subcategory clamp in buildAttributes cannot see the
  // name, which is how a "2005 Nexon EV" escaped (caught by the unit suite).
  // Derived from the existing draw, not a new rng call, so every other
  // listing's stream is untouched.
  if (attributes.year && attributes.year < 2019 && EV_NAME.test(base)) {
    attributes.year = 2019 + (attributes.year % 7);
  }

  // Vehicles read naturally with the year in front — except vintage &
  // classic cars, where "2024 Contessa Classic" reads as a contradiction;
  // there the name carries the era and the year attribute stays a filter.
  if (
    ["cars", "bikes", "commercial-vehicles-spares"].includes(category.slug) &&
    attributes.year &&
    subcategory.slug !== "vintage-classic-cars"
  ) {
    return `${attributes.year} ${base}`;
  }

  // Jobs read as a role plus location.
  if (category.slug === "jobs") {
    return `${base} — ${locality}, ${city.name}`;
  }

  return rngChance(rng, 0.35) ? `${base} ${rngPick(rng, TITLE_SUFFIXES)}` : base;
}

function buildDescription(rng, category, subcategory, attributes, title, city, locality) {
  const lines = [];

  if (category.slug === "jobs") {
    lines.push(
      `We are hiring a ${subcategory.name} for our ${locality} location in ${city.name}.`,
      `This is a ${String(attributes.positionType || "Full-time").toLowerCase()} role, ${String(attributes.workMode || "On-site").toLowerCase()}.`,
      `Experience required: ${attributes.experience || "Fresher"}. Salary is quoted ${String(attributes.salaryPeriod || "Monthly").toLowerCase()}.`,
      "Walk-in interviews on weekdays. Please carry a copy of your resume and ID proof.",
    );
  } else if (category.slug === "properties") {
    lines.push(
      `${title} available in a well-connected part of ${locality}.`,
      attributes.carpetArea ? `Carpet area is approximately ${attributes.carpetArea} sqft.` : "",
      attributes.furnishing ? `The unit is ${String(attributes.furnishing).toLowerCase()}.` : "",
      attributes.parking ? "Covered car parking is included." : "Parking is on a first-come basis.",
      `Listed by ${String(attributes.listedBy || "Owner").toLowerCase()}. Site visits can be arranged on weekends.`,
    );
  } else if (category.slug === "free-giveaway") {
    lines.push(
      `Giving this away free to anyone who can collect it from ${locality}, ${city.name}.`,
      "It is in working order but I have no space for it. First to arrive takes it.",
      "Please do not ask for delivery — collection only, and bring help if it is heavy.",
    );
  } else if (category.slug === "services") {
    lines.push(
      `${title} available across ${city.name}, based out of ${locality}.`,
      attributes.serviceRadius ? `I travel up to ${attributes.serviceRadius} km for a job.` : "",
      attributes.rateType ? `Charged ${String(attributes.rateType).toLowerCase()}; final quote after a quick call.` : "",
      "Same-day slots are usually available. Message with your requirement for an estimate.",
    );
  } else {
    lines.push(
      `Selling my ${title}, kept in ${String(attributes.condition || "good").toLowerCase()} condition.`,
      attributes.warranty ? "Still under manufacturer warranty." : "Warranty period is over.",
      attributes.bill ? "Original bill and packaging included." : "",
      attributes.kmDriven ? `Driven ${Number(attributes.kmDriven).toLocaleString("en-IN")} km, service history available.` : "",
      `Available for inspection in ${locality}, ${city.name}. Price is slightly negotiable for a serious buyer.`,
    );
  }

  return lines.filter(Boolean).join(" ");
}

/**
 * Brand names that appear in an item title but are not spelled the same way
 * in the category's `brand` option list.
 */
const BRAND_ALIASES = {
  macbook: "Apple",
  ipad: "Apple",
  iphone: "Apple",
  imac: "Apple",
  airpods: "Apple",
  bravia: "Sony",
  alpha: "Sony",
  inspiron: "Dell",
  pavilion: "HP",
  deskjet: "HP",
  elitebook: "HP",
  ideapad: "Lenovo",
  thinkpad: "Lenovo",
  "tuf gaming": "Asus",
  redmi: "Xiaomi",
  poco: "Xiaomi",
  galaxy: "Samsung",
  pixel: "Google",
  "nothing phone": "Nothing",
  "ola s1": "Ola Electric",
  "chetak": "Bajaj",
};

/**
 * Make `attributes.brand` agree with the title.
 *
 * The brand was picked independently of the item name, so without this a
 * "Mahindra Thar" could carry `brand: "Hyundai"` — and then the Brand filter
 * returns the wrong cars, which is worse than having no filter at all.
 *
 * When nothing matches we DELETE the brand rather than guess. An absent
 * attribute is honest; a wrong one corrupts every brand-filtered result.
 */
function reconcileBrand(category, attributes, title) {
  const def = category.attributes.find((a) => a.key === "brand");
  if (!def) return;

  const haystack = title.toLowerCase();

  // Longest option first, so "Maruti Suzuki" wins over a bare "Suzuki".
  const match = [...def.options]
    .sort((a, b) => b.length - a.length)
    .find((option) => haystack.includes(option.toLowerCase()));

  if (match) {
    attributes.brand = match;
    return;
  }

  const alias = Object.entries(BRAND_ALIASES).find(([token]) =>
    haystack.includes(token),
  );
  if (alias && def.options.includes(alias[1])) {
    attributes.brand = alias[1];
    return;
  }

  delete attributes.brand;
}



/**
 * A deterministic approximate position for a listing.
 *
 * Real classifieds never publish an exact address, and neither should this —
 * the pin is scattered inside roughly a 6 km box around the city centre,
 * offset per locality so ads in the same neighbourhood cluster together the
 * way they would on a real map. Derived from the seed, so a pin does not
 * wander between builds or between server and client render.
 *
 * Returns null when the city has no coordinates, so the map omits the pin
 * rather than dropping it in the sea.
 */
function buildCoords(rng, city, locality) {
  if (!city.coords) return null;
  const [lat, lng] = city.coords;

  // Locality gives a stable cluster centre; the rng adds within-locality spread.
  const localityIndex = Math.max(0, city.localities.indexOf(locality));
  const angle = (localityIndex / Math.max(1, city.localities.length)) * Math.PI * 2;
  const clusterLat = Math.sin(angle) * 0.022;
  const clusterLng = Math.cos(angle) * 0.022;

  const jitterLat = (rng() - 0.5) * 0.016;
  const jitterLng = (rng() - 0.5) * 0.016;

  return [
    Number((lat + clusterLat + jitterLat).toFixed(5)),
    Number((lng + clusterLng + jitterLng).toFixed(5)),
  ];
}

/** Model names that really are electric, wherever they are filed. */
const EV_NAME = /\bEV\b|Electric|Ola S1|Ather|Kona|XUV400|Punch EV|Tiago EV|Nexon EV|ZS EV/i;

/**
 * Make `fuel` agree with the model in the title.
 *
 * Fuel was drawn at random from the category's options, so a Toyota Innova
 * could be listed as Electric — which the compare table then puts side by
 * side with a real EV. Petrol/diesel models must not claim Electric, and an
 * EV must not claim petrol.
 */
function reconcileFuel(category, subcategory, attributes, title) {
  const def = category.attributes.find((a) => a.key === "fuel");
  if (!def) return;

  const isEv =
    EV_NAME.test(title) ||
    subcategory.slug === "electric-cars" ||
    subcategory.slug === "electric-two-wheelers";

  if (isEv) {
    attributes.fuel = "Electric";
    // Every EV on sale here is single-speed; "Manual" is meaningless on one.
    if (attributes.transmission) attributes.transmission = "Automatic";
    return;
  }

  // Not an EV: never leave Electric on it. Fall back deterministically to the
  // most common real fuel for the category rather than re-rolling.
  if (attributes.fuel === "Electric") {
    attributes.fuel = def.options.includes("Petrol") ? "Petrol" : def.options[0];
  }
}

/** Rough price tiers for vehicle brands, in rupees, when new. */
const VEHICLE_BRAND_BASE = {
  "BMW": 4200000,
  "Mercedes-Benz": 4500000,
  "Audi": 3900000,
  "Toyota": 1600000,
  "Honda": 1200000,
  "Kia": 1300000,
  "MG": 1600000,
  "Skoda": 1500000,
  "Volkswagen": 1400000,
  "Mahindra": 1500000,
  "Tata": 1100000,
  "Hyundai": 1100000,
  "Maruti Suzuki": 850000,
  "Renault": 700000,
};

/**
 * Two-wheeler tiers, kept in their own table because Honda and Suzuki appear
 * in BOTH lists at wildly different price points — one shared map keyed on
 * brand name alone would price a Honda Shine like a Honda City.
 */
const BIKE_BRAND_BASE = {
  "Harley-Davidson": 1300000,
  KTM: 320000,
  "Royal Enfield": 220000,
  Jawa: 200000,
  Ather: 150000,
  "Ola Electric": 130000,
  Yamaha: 150000,
  Suzuki: 120000,
  Bajaj: 110000,
  TVS: 105000,
  Honda: 95000,
  Hero: 85000,
};

/** Price that respects the category band, the item's condition and its age. */
function buildPrice(rng, category, attributes) {
  const [min, max] = category.priceBand;
  if (max === 0) return 0;

  // Rent is a monthly figure. Drawing it from the sale band produced
  // 50-lakh-a-month flats — the band's job is to price a purchase.
  if (
    category.slug === "properties" &&
    (attributes.listingType === "For rent" ||
      attributes.listingType === "PG & co-living")
  ) {
    const isPg = attributes.listingType === "PG & co-living";
    const [rentMin, rentMax] = isPg ? [3500, 25000] : [6000, 180000];
    return roundPrice(rngSkewed(rng, rentMin, rentMax, 1.9));
  }

  // Vehicles are priced from what the brand costs new, then depreciated.
  // Drawing them from the flat category band instead produced a 45,000-rupee
  // Mahindra Thar sitting next to a 6.3-lakh 2005 Baleno.
  const brandBase =
    category.slug === "bikes"
      ? BIKE_BRAND_BASE[attributes.brand]
      : category.slug === "cars"
        ? VEHICLE_BRAND_BASE[attributes.brand]
        : null;

  let price;

  if (brandBase && attributes.year) {
    const age = Math.max(0, 2026 - attributes.year);
    // ~11%/yr compounding, floored at 12% of new — roughly how Indian
    // resale actually behaves, and it never reaches absurd territory.
    const retained = Math.max(0.12, Math.pow(0.89, age));
    // +/-18% spread so two identical models are not identically priced.
    const spread = 0.82 + rng() * 0.36;
    price = roundPrice(brandBase * retained * spread);
  } else {
    price = roundPrice(rngSkewed(rng, min, max, 2.0));

    if (attributes.year) {
      const age = Math.max(0, 2026 - attributes.year);
      price = roundPrice(price * Math.max(0.3, 1 - age * 0.045));
    }
  }

  // Condition should move the number, not just sit in a chip.
  const conditionFactor = {
    New: 1,
    "Like new": 0.85,
    Good: 0.7,
    Fair: 0.5,
    "For parts": 0.25,
  }[attributes.condition];
  if (conditionFactor) price = roundPrice(price * conditionFactor);

  // Condition and age multipliers stack, and together they can push a price
  // below anything a real seller would ask (a 7,500-rupee tractor). Keep the
  // category's own floor as a hard bound.
  return Math.max(min, Math.min(max, roundPrice(price)));
}

function buildListing(index) {
  const rng = createRng(`bazaar-listing-v1-${index}`);

  const category = rngPick(rng, CATEGORY_POOL);
  const subcategory = rngPick(rng, category.subcategories);
  const city = rngPick(rng, CITY_POOL);
  const locality = rngPick(rng, city.localities);
  const seller = rngPick(rng, SELLERS);

  const attributes = buildAttributes(rng, category, subcategory);
  const title = buildTitle(rng, category, subcategory, attributes, city, locality);
  // The title is authoritative: make the filterable brand agree with it
  // before anything downstream (price, specs, filters) reads it.
  reconcileBrand(category, attributes, title);
  reconcileFuel(category, subcategory, attributes, title);
  const price = buildPrice(rng, category, attributes);
  const postedDaysAgo = rngSkewed(rng, 0, 75, 1.8);
  const coords = buildCoords(rng, city, locality);

  const id = `ad-${String(index).padStart(5, "0")}`;
  const slug = `${slugify(title).slice(0, 70)}-${city.slug}-${index}`;

  const photoCount = rngInt(rng, 3, 7);
  const images = Array.from({ length: photoCount }, (_, i) => ({
    // picsum is deterministic per seed and needs no allowlist entry, because
    // these render through ManagedImage (a plain <img> with a fallback chain)
    // rather than through the next/image optimizer.
    src: `https://picsum.photos/seed/${slug}-${i}/800/600`,
    alt: `${title} — photo ${i + 1}`,
  }));

  // Promotion is bought, and only a minority of sellers buy it.
  const featured = rngChance(rng, 0.12);
  const spotlight = featured && rngChance(rng, 0.3);

  return {
    id,
    slug,
    title,
    price,
    priceLabel: formatPrice(price),
    negotiable: price > 0 && rngChance(rng, 0.55),
    categorySlug: category.slug,
    categoryName: category.name,
    subcategorySlug: subcategory.slug,
    subcategoryName: subcategory.name,
    citySlug: city.slug,
    cityName: city.name,
    stateName: city.stateName,
    locality,
    coords,
    attributes,
    description: buildDescription(rng, category, subcategory, attributes, title, city, locality),
    images,
    sellerId: seller.id,
    postedDaysAgo,
    featured,
    spotlight,
    urgent: !featured && rngChance(rng, 0.08),
    views: rngSkewed(rng, 12, 4200, 2.1),
    saves: rngSkewed(rng, 0, 180, 2.6),
    // Rent-style categories quote a period alongside the number.
    pricePeriod:
      category.slug === "rentals"
        ? String(attributes.rentalPeriod || "Per day").toLowerCase()
        : category.slug === "jobs"
          ? String(attributes.salaryPeriod || "Monthly").toLowerCase()
          : attributes.listingType === "For rent" || attributes.listingType === "PG & co-living"
            ? "per month"
            : null,
  };
}

const LISTINGS = Array.from({ length: LISTING_TOTAL }, (_, i) => buildListing(i));

const LISTING_BY_SLUG = new Map(LISTINGS.map((l) => [l.slug, l]));
const LISTING_BY_ID = new Map(LISTINGS.map((l) => [l.id, l]));

/* ------------------------------------------------------------------
 * Query surface
 * ---------------------------------------------------------------- */

/**
 * Card projection.
 *
 * Every list surface renders `AdCard`, which is a client component — so
 * whatever a server page hands it is serialised into the RSC payload byte for
 * byte. A full listing carries a ~200-character description and 3-7 image
 * URLs; a card renders neither the description nor images beyond the first.
 *
 * Measured on the built `/bazaar/c/properties` page: 402 unique image URLs and
 * 22 KiB of descriptions in a page that shows 24 cards — about 10% of the HTML
 * was payload nothing could display. This trims it at the source, so no call
 * site has to remember to.
 *
 * `getListing()` and `getListings()` deliberately still return the FULL
 * record: the detail page needs the description and the whole gallery.
 */
export function toCardListing(listing) {
  if (!listing) return listing;
  const { description: _description, images, ...rest } = listing;
  return { ...rest, images: images?.length ? [images[0]] : [] };
}



export function getListings() {
  return LISTINGS;
}

/** @returns {object|null} */
export function getListing(slug) {
  return LISTING_BY_SLUG.get(String(slug || "")) || null;
}

/** @returns {object|null} */
export function getListingById(id) {
  return LISTING_BY_ID.get(id) || null;
}

export function getListingSlugs() {
  return LISTINGS.map((l) => l.slug);
}

export const SORTS = {
  RELEVANCE: "relevance",
  RECENT: "recent",
  PRICE_LOW: "price-low",
  PRICE_HIGH: "price-high",
  POPULAR: "popular",
};

export const SORT_OPTIONS = [
  { value: SORTS.RELEVANCE, label: "Relevance" },
  { value: SORTS.RECENT, label: "Newest first" },
  { value: SORTS.PRICE_LOW, label: "Price: low to high" },
  { value: SORTS.PRICE_HIGH, label: "Price: high to low" },
  { value: SORTS.POPULAR, label: "Most viewed" },
];

/**
 * @param {object[]} list
 * @param {string} sort
 * @param {Map<string, number>|null} [textScores]  listing id → relevance score,
 *   present only when the query carried free text. Without it the relevance
 *   order is unchanged (promoted, then recent), so every non-text surface sorts
 *   exactly as it did before.
 */
function sortListings(list, sort, textScores = null) {
  const out = [...list];
  switch (sort) {
    case SORTS.RECENT:
      return out.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    case SORTS.PRICE_LOW:
      return out.sort((a, b) => a.price - b.price);
    case SORTS.PRICE_HIGH:
      return out.sort((a, b) => b.price - a.price);
    case SORTS.POPULAR:
      return out.sort((a, b) => b.views - a.views);
    default:
      // Relevance: promoted first, then recency. Matches how the real thing
      // behaves and keeps paid placement honest rather than hidden.
      //
      // With a free-text query, text relevance comes FIRST — an ad titled
      // "Honda City ZX" has to beat a promoted Honda Activa for the query
      // "honda city", or "relevance" is just a synonym for "promoted".
      // Promotion still breaks ties inside one relevance tier.
      return out.sort((a, b) => {
        if (textScores) {
          const byText = (textScores.get(b.id) || 0) - (textScores.get(a.id) || 0);
          if (byText) return byText;
        }
        const promo = Number(b.spotlight) * 2 + Number(b.featured) -
          (Number(a.spotlight) * 2 + Number(a.featured));
        return promo || a.postedDaysAgo - b.postedDaysAgo;
      });
  }
}

/**
 * The single query entry point used by every listing surface.
 *
 * @param {object} options
 * @param {string} [options.category]     category slug
 * @param {string} [options.subcategory]  subcategory slug
 * @param {string} [options.city]         city slug
 * @param {string} [options.locality]
 * @param {string} [options.q]            free-text query — tokenised, typo-
 *   tolerant and relevance-ranked by `data/search.js`, not a substring test.
 *   Pass `parsedQuery` instead when the caller has already parsed it and wants
 *   the correction (see `parseQuery`), so the work is not repeated per call.
 * @param {object} [options.parsedQuery]  a `parseQuery(q)` result; wins over `q`
 * @param {number} [options.minPrice]
 * @param {number} [options.maxPrice]
 * @param {object} [options.attributes]   { attrKey: value } exact matches
 * @param {string} [options.sort]
 * @param {number} [options.page]         1-based
 * @param {number} [options.perPage]
 */
export function queryListings(options = {}) {
  const {
    category,
    subcategory,
    city,
    locality,
    q,
    parsedQuery,
    minPrice,
    maxPrice,
    attributes,
    sort = SORTS.RELEVANCE,
    page = 1,
    perPage = 24,
  } = options;

  /**
   * Free text used to be `haystack.includes(needle)`, which meant "ipone"
   * returned nothing and "2 bhk pune" returned nothing (the words are not
   * adjacent in the title). It is now a token match with a relevance score —
   * see `data/search.js` for the matching rules and the typo budget.
   *
   * `textScores` stays null when there is no query text, and then nothing about
   * this function's behaviour changes.
   */
  const parsed = parsedQuery || (String(q || "").trim() ? parseQuery(q) : null);
  const useText = Boolean(parsed && !parsed.isEmpty);
  const textScores = useText ? new Map() : null;

  let results = LISTINGS.filter((listing) => {
    if (category && listing.categorySlug !== category) return false;
    if (subcategory && listing.subcategorySlug !== subcategory) return false;
    if (city && listing.citySlug !== city) return false;
    if (locality && listing.locality !== locality) return false;
    if (typeof minPrice === "number" && listing.price < minPrice) return false;
    if (typeof maxPrice === "number" && listing.price > maxPrice) return false;

    if (useText) {
      const score = matchListing(listing, parsed);
      if (score <= 0) return false;
      textScores.set(listing.id, score);
    }

    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (value === undefined || value === null || value === "") continue;
        const actual = listing.attributes?.[key];
        if (typeof value === "boolean") {
          if (Boolean(actual) !== value) return false;
        } else if (String(actual) !== String(value)) {
          return false;
        }
      }
    }

    return true;
  });

  results = sortListings(results, sort, textScores);

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: results.slice(start, start + perPage).map(toCardListing),
    total,
    page: safePage,
    perPage,
    totalPages,
  };
}

/** Counts per category — powers the home grid and the category directory. */
export function getCategoryCounts() {
  const counts = new Map();
  for (const listing of LISTINGS) {
    counts.set(listing.categorySlug, (counts.get(listing.categorySlug) || 0) + 1);
  }
  return counts;
}

/** Counts per city — powers the city directory. */
export function getCityCounts() {
  const counts = new Map();
  for (const listing of LISTINGS) {
    counts.set(listing.citySlug, (counts.get(listing.citySlug) || 0) + 1);
  }
  return counts;
}

/** Listings by a given seller. */
export function getListingsBySeller(sellerId) {
  return LISTINGS.filter((l) => l.sellerId === sellerId).map(toCardListing);
}

/**
 * Similar ads for the detail page: same subcategory first, then same category
 * in the same city, excluding the listing itself.
 */
export function getSimilarListings(listing, limit = 8) {
  if (!listing) return [];
  const sameSub = LISTINGS.filter(
    (l) => l.id !== listing.id && l.subcategorySlug === listing.subcategorySlug,
  );
  const sameCity = LISTINGS.filter(
    (l) =>
      l.id !== listing.id &&
      l.categorySlug === listing.categorySlug &&
      l.citySlug === listing.citySlug &&
      !sameSub.includes(l),
  );
  return [...sameSub, ...sameCity].slice(0, limit).map(toCardListing);
}

/** Front-page shelf: promoted, recent, high-signal listings. */
export function getFeaturedListings(limit = 12) {
  return sortListings(LISTINGS.filter((l) => l.featured), SORTS.RELEVANCE)
    .slice(0, limit)
    .map(toCardListing);
}

/** "Fresh recommendations" — the home page's main grid. */
export function getFreshListings(limit = 24) {
  return sortListings(LISTINGS, SORTS.RECENT).slice(0, limit).map(toCardListing);
}

/**
 * Price statistics for a category, optionally within a city. Powers the
 * price-guide pages, which are the vertical's main long-tail SEO surface.
 */
export function getPriceStats(categorySlug, citySlug) {
  const pool = LISTINGS.filter(
    (l) =>
      l.categorySlug === categorySlug &&
      l.price > 0 &&
      (!citySlug || l.citySlug === citySlug),
  );
  if (pool.length === 0) return null;

  const prices = pool.map((l) => l.price).sort((a, b) => a - b);
  const at = (fraction) => prices[Math.min(prices.length - 1, Math.floor(prices.length * fraction))];

  return {
    count: pool.length,
    min: prices[0],
    max: prices[prices.length - 1],
    median: at(0.5),
    p25: at(0.25),
    p75: at(0.75),
    average: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
  };
}

/** Sub-taxonomy breakdown inside one category — used on category pages. */
export function getSubcategoryCounts(categorySlug) {
  const category = getCategory(categorySlug);
  if (!category) return [];
  return category.subcategories.map((sub) => ({
    ...sub,
    count: LISTINGS.filter(
      (l) => l.categorySlug === categorySlug && l.subcategorySlug === sub.slug,
    ).length,
  }));
}

export const LISTING_COUNT = LISTINGS.length;
