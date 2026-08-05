/**
 * Bazaar listing corpus — the determinism gate.
 *
 * These exact numbers are the determinism gate. If you changed the generator
 * deliberately, update them; if they changed by themselves, that is the bug
 * this suite exists to catch. `generateStaticParams`, `sitemap.js` and
 * hydration all assume the corpus is byte-identical on every build; a drifted
 * count or slug here means that assumption broke.
 *
 * Module resolution: the data modules use bundler-style specifiers, so the
 * alias loader is registered first and the modules are imported dynamically
 * (a static import would hoist above `register()`).
 */
import assert from "node:assert/strict";
import { register } from "node:module";
import test from "node:test";

register(new URL("./test-helpers/aliasLoader.mjs", import.meta.url));

const { CATEGORIES } = await import("./categories.js");
const {
  LISTING_COUNT,
  formatPosted,
  postedParts,
  formatPrice,
  getCategoryCounts,
  getListing,
  getListings,
  getPriceStats,
  queryListings,
  toCardListing,
} = await import("./listings.js");

const ALL = getListings();
const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

/** For-rent / PG properties price from their own monthly band, not the sale band. */
function isRentLike(listing) {
  return (
    listing.categorySlug === "properties" &&
    (listing.attributes.listingType === "For rent" ||
      listing.attributes.listingType === "PG & co-living")
  );
}

test("corpus size and per-category counts are locked", () => {
  assert.equal(LISTING_COUNT, 720);
  assert.equal(ALL.length, 720);

  const counts = getCategoryCounts();
  const actual = Object.fromEntries(
    CATEGORIES.map((c) => [c.slug, counts.get(c.slug) || 0]),
  );
  assert.deepEqual(actual, {
    cars: 74, properties: 80, mobiles: 77, bikes: 59,
    "electronics-appliances": 68, jobs: 41, "commercial-vehicles-spares": 19,
    furniture: 40, fashion: 33, "books-sports-hobbies": 23, pets: 14,
    services: 29, "kids-baby": 15, gaming: 15, "health-wellness": 15,
    "industrial-business": 9, "agriculture-farming": 7, "art-collectibles": 9,
    "tools-hardware": 13, "events-tickets": 20, rentals: 17,
    "free-giveaway": 22, refurbished: 12, "travel-outdoor": 9,
  });
  for (const [slug, count] of Object.entries(actual)) {
    assert.ok(count > 0, `category ${slug} has no listings`);
  }
});

test("slugs are unique and specific listings are exactly what they were", () => {
  assert.equal(new Set(ALL.map((l) => l.slug)).size, 720);

  // Three spot-locked listings — the canary for any change in the generation
  // sequence. If one of these moved, every slug after it likely moved too.
  const spots = [0, 360, 719].map((i) => {
    const { slug, title, price, citySlug } = ALL[i];
    return { slug, title, price, citySlug };
  });
  assert.deepEqual(spots, [
    {
      slug: "philips-air-fryer-hd9200-in-excellent-condition-jabalpur-0",
      title: "Philips Air Fryer HD9200 in excellent condition",
      price: 55000, citySlug: "jabalpur",
    },
    {
      slug: "inflatable-kayak-2-person-nagpur-360",
      title: "Inflatable Kayak 2 Person", price: 27000, citySlug: "nagpur",
    },
    {
      slug: "gaming-pc-rtx-4060-build-guwahati-719",
      title: "Gaming PC RTX 4060 Build", price: 240000, citySlug: "guwahati",
    },
  ]);
});

test("prices respect the category band, with the documented rent exception", () => {
  let rentLike = 0;
  for (const listing of ALL) {
    const [min, max] = CATEGORY_BY_SLUG.get(listing.categorySlug).priceBand;
    if (isRentLike(listing)) {
      rentLike += 1;
      assert.ok(
        listing.price >= 3500 && listing.price <= 180000,
        `${listing.slug}: rent-like price ${listing.price} outside 3500-180000`,
      );
    } else {
      assert.ok(
        listing.price >= min && listing.price <= max,
        `${listing.slug}: price ${listing.price} outside band ${min}-${max}`,
      );
    }
  }
  assert.equal(rentLike, 48);

  // Sale properties draw from the sale band, not the rent band: at least one
  // must sit far above any plausible monthly rent.
  const saleProps = ALL.filter(
    (l) => l.categorySlug === "properties" && !isRentLike(l),
  );
  assert.ok(saleProps.length > 0);
  assert.ok(saleProps.some((l) => l.price > 180000));
});

// The same alias table the generator uses (re-implemented here on purpose —
// the table is internal, and exporting internals for tests weakens the module).
const BRAND_ALIASES = {
  macbook: "Apple", ipad: "Apple", iphone: "Apple", imac: "Apple",
  airpods: "Apple", bravia: "Sony", alpha: "Sony", inspiron: "Dell",
  pavilion: "HP", deskjet: "HP", elitebook: "HP", ideapad: "Lenovo",
  thinkpad: "Lenovo", "tuf gaming": "Asus", redmi: "Xiaomi", poco: "Xiaomi",
  galaxy: "Samsung", pixel: "Google", "nothing phone": "Nothing",
  "ola s1": "Ola Electric", chetak: "Bajaj",
};

test("brand attribute always agrees with the title (or a known alias)", () => {
  let carrying = 0;
  for (const listing of ALL) {
    if (!["cars", "bikes", "mobiles", "electronics-appliances"].includes(listing.categorySlug)) continue;
    const brand = listing.attributes.brand;
    if (!brand) continue;
    carrying += 1;
    const haystack = listing.title.toLowerCase();
    const coherent =
      haystack.includes(brand.toLowerCase()) ||
      Object.entries(BRAND_ALIASES).some(
        ([token, target]) => target === brand && haystack.includes(token),
      );
    assert.ok(coherent, `${listing.slug}: brand "${brand}" not in title "${listing.title}"`);
  }
  // 252 before the orphan-subcategory name pools landed (accessory-named
  // listings rightly carry no car brand).
  assert.equal(carrying, 232);
});

// Model names that really are electric — mirrors the generator's EV_NAME.
const EV_NAME = /\bEV\b|Electric|Ola S1|Ather|Kona|XUV400|Punch EV|Tiago EV|Nexon EV|ZS EV/i;
const EV_SUBCATEGORIES = new Set(["electric-cars", "electric-two-wheelers"]);

test("fuel is Electric iff the model is an EV, and EVs are never Manual", () => {
  let evs = 0;
  for (const listing of ALL) {
    const hasFuel = CATEGORY_BY_SLUG.get(listing.categorySlug).attributes.some(
      (a) => a.key === "fuel",
    );
    if (!hasFuel) continue;
    const isEv =
      EV_NAME.test(listing.title) || EV_SUBCATEGORIES.has(listing.subcategorySlug);
    if (isEv) {
      evs += 1;
      assert.equal(listing.attributes.fuel, "Electric", `${listing.slug} is an EV`);
      assert.notEqual(listing.attributes.transmission, "Manual", `${listing.slug}: manual EV`);
    } else {
      assert.notEqual(listing.attributes.fuel, "Electric", `${listing.slug} is not an EV`);
    }
    // The generator now clamps the year for EVERY EV-named vehicle at title
    // time (the gap this suite originally reported — "2006 Tata Punch EV"
    // under vintage-classic-cars — is fixed), so the strong invariant holds.
    if (isEv && listing.attributes.year) {
      assert.ok(listing.attributes.year >= 2019, `${listing.slug}: EV year < 2019`);
    }
  }
  assert.equal(evs, 19);
});

test("coords: all 720 placed, inside India's bounding box, stable, kept on cards", () => {
  for (const listing of ALL) {
    assert.ok(listing.coords, `${listing.slug} has no coords`);
    const [lat, lng] = listing.coords;
    assert.ok(lat >= 6 && lat <= 36, `${listing.slug}: lat ${lat}`);
    assert.ok(lng >= 68 && lng <= 98, `${listing.slug}: lng ${lng}`);
  }
  const slug = ALL[5].slug;
  assert.deepEqual(getListing(slug).coords, getListing(slug).coords);
  assert.deepEqual(toCardListing(ALL[5]).coords, ALL[5].coords);
});

test("toCardListing strips the description and keeps exactly the first image", () => {
  const full = ALL[3];
  assert.ok(full.images.length >= 3, "generator always attaches 3-7 photos");
  const card = toCardListing(full);
  assert.ok(!("description" in card));
  assert.equal(card.images.length, 1);
  assert.equal(card.images[0].src, full.images[0].src);
  assert.equal(card.title, full.title);
});

test("queryListings: totals, pagination math and page clamping", () => {
  const base = queryListings({});
  assert.equal(base.total, 720);
  assert.equal(base.items.length, 24);
  assert.deepEqual([base.page, base.perPage, base.totalPages], [1, 24, 30]);

  for (const perPage of [24, 7]) {
    const r = queryListings({ perPage });
    assert.ok(r.totalPages * r.perPage >= r.total);
    assert.ok((r.totalPages - 1) * r.perPage < r.total);
  }

  const high = queryListings({ page: 999 });
  assert.equal(high.page, high.totalPages);
  assert.equal(high.items.length, high.total - (high.totalPages - 1) * high.perPage);
  assert.equal(queryListings({ page: -3 }).page, 1);
});

test("queryListings city+category agrees with a manual filter", () => {
  for (const [city, category] of [
    ["mumbai", "cars"],
    ["bangalore", "mobiles"],
    ["delhi", "properties"],
  ]) {
    const manual = ALL.filter(
      (l) => l.citySlug === city && l.categorySlug === category,
    ).length;
    assert.equal(queryListings({ city, category }).total, manual, `${city}/${category}`);
  }
});

test("getPriceStats is internally ordered, and null for an empty pool", () => {
  for (const category of CATEGORIES) {
    const stats = getPriceStats(category.slug);
    if (!stats) continue; // free-giveaway: every price is 0, pool is empty
    assert.ok(stats.count > 0);
    assert.ok(stats.min <= stats.median && stats.median <= stats.max, category.slug);
    assert.ok(stats.p25 <= stats.median && stats.median <= stats.p75, category.slug);
  }
  assert.equal(getPriceStats("free-giveaway"), null);
  assert.equal(getPriceStats("no-such-category"), null);
});

test("formatPrice uses Indian digit grouping and calls zero Free", () => {
  const table = [
    [0, "Free"],
    [999, "₹999"],
    [1500, "₹1,500"],
    [450000, "₹4,50,000"],
    [12500000, "₹1,25,00,000"],
  ];
  for (const [value, expected] of table) assert.equal(formatPrice(value), expected);
});

test("formatPosted boundaries", () => {
  const table = [
    [0, "Today"], [1, "Yesterday"], [2, "2 days ago"], [6, "6 days ago"],
    [7, "1 week ago"], [13, "1 week ago"], [14, "2 weeks ago"],
    [29, "4 weeks ago"], [30, "1 month ago"], [59, "1 month ago"],
    [60, "2 months ago"], [90, "3 months ago"],
  ];
  for (const [days, expected] of table) assert.equal(formatPosted(days), expected);
});

test("postedParts mirrors formatPosted branch for branch", () => {
  // The catalogue's en strings for time.* must reproduce formatPosted
  // exactly, or the English UI would change depending on which path
  // rendered it. This locks the id/count pairs at every boundary.
  const en = {
    "time.today": () => "Today",
    "time.yesterday": () => "Yesterday",
    "time.daysAgo": (n) => `${n} days ago`,
    "time.oneWeek": () => "1 week ago",
    "time.weeksAgo": (n) => `${n} weeks ago`,
    "time.oneMonth": () => "1 month ago",
    "time.monthsAgo": (n) => `${n} months ago`,
  };
  for (const days of [0, 1, 2, 6, 7, 13, 14, 29, 30, 59, 60, 90, 365]) {
    const parts = postedParts(days);
    assert.equal(en[parts.id](parts.count), formatPosted(days), `daysAgo=${days}`);
  }
});
