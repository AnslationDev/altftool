/**
 * AltF Bazaar — mock seller directory.
 *
 * Deterministically generated from `random.js`, so a seller page and the
 * seller block on a listing page always agree. Avatars come from
 * `i.pravatar.cc`, which is already allowlisted in `next.config.mjs`.
 */

import { createRng, rngChance, rngInt, rngPick, rngSkewed } from "./random";
import { CITIES } from "./cities";

const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Rohan", "Karan", "Ishaan", "Rahul", "Siddharth",
  "Ananya", "Diya", "Priya", "Neha", "Kavya", "Meera", "Sneha", "Riya",
  "Arjun", "Manish", "Vikram", "Sanjay", "Deepak", "Nikhil", "Farhan", "Imran",
  "Fatima", "Zoya", "Anjali", "Pooja", "Shreya", "Tanvi", "Rajesh", "Suresh",
  "Harpreet", "Simran", "Gurpreet", "Lakshmi", "Divya", "Rekha", "Amit", "Sunil",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Singh", "Kumar",
  "Gupta", "Mehta", "Joshi", "Desai", "Chopra", "Malhotra", "Bose", "Das",
  "Khan", "Ahmed", "Shah", "Pillai", "Rao", "Naidu", "Kaur", "Bhatia",
  "Agarwal", "Kulkarni", "Deshpande", "Mishra", "Trivedi", "Chauhan",
];

/** Business sellers get a shop name instead of a person's name. */
const SHOP_PREFIXES = [
  "Sri", "New", "Royal", "Shree", "Star", "Prime", "Metro", "Classic",
  "Galaxy", "Unique", "Perfect", "Crown", "Elite", "Smart",
];
const SHOP_SUFFIXES = [
  "Motors", "Enterprises", "Traders", "Electronics", "Auto Deals", "Furnishings",
  "Mobile Point", "Properties", "Trading Co.", "Solutions", "Bazaar", "Agency",
];

const SELLER_COUNT = 240;

function buildSeller(index) {
  const rng = createRng(`bazaar-seller-${index}`);
  const isBusiness = rngChance(rng, 0.28);
  const city = rngPick(rng, CITIES);

  const name = isBusiness
    ? `${rngPick(rng, SHOP_PREFIXES)} ${rngPick(rng, SHOP_SUFFIXES)}`
    : `${rngPick(rng, FIRST_NAMES)} ${rngPick(rng, LAST_NAMES)}`;

  // Longer-tenured sellers have more sales and better ratings — the numbers
  // should tell a coherent story rather than being independently random.
  const monthsActive = rngInt(rng, 1, 96);
  const salesCount = Math.max(
    1,
    Math.round(rngSkewed(rng, 1, isBusiness ? 480 : 60, 1.7) * (monthsActive / 48 + 0.3)),
  );
  const ratingBase = 3.4 + Math.min(1.4, salesCount / 160) + rng() * 0.4;
  const rating = Math.min(5, Math.round(ratingBase * 10) / 10);

  return {
    id: `slr-${String(index).padStart(4, "0")}`,
    slug: `seller-${String(index).padStart(4, "0")}`,
    name,
    type: isBusiness ? "business" : "individual",
    avatar: `https://i.pravatar.cc/160?img=${(index % 70) + 1}`,
    citySlug: city.slug,
    cityName: city.name,
    monthsActive,
    salesCount,
    rating,
    reviewCount: Math.max(0, Math.round(salesCount * (0.35 + rng() * 0.4))),
    // Verification is earned, not random: only sellers with a real track
    // record carry the badge.
    verified: salesCount > 25 && monthsActive > 6 && rngChance(rng, 0.75),
    phoneVerified: rngChance(rng, 0.92),
    emailVerified: rngChance(rng, 0.7),
    respondsIn: rngPick(rng, [
      "within minutes",
      "within an hour",
      "within a few hours",
      "within a day",
    ]),
    bio: isBusiness
      ? `${name} has been trading on AltF Bazaar since ${monthsActive > 12 ? `${Math.floor(monthsActive / 12)} year${monthsActive >= 24 ? "s" : ""} ago` : "this year"}. Bulk enquiries welcome.`
      : "Selling things I no longer use. Happy to answer questions before you visit.",
  };
}

export const SELLERS = Array.from({ length: SELLER_COUNT }, (_, i) => buildSeller(i));

const SELLER_BY_ID = new Map(SELLERS.map((s) => [s.id, s]));
const SELLER_BY_SLUG = new Map(SELLERS.map((s) => [s.slug, s]));

/** @returns {object|null} */
export function getSeller(id) {
  return SELLER_BY_ID.get(id) || null;
}

/** @returns {object|null} */
export function getSellerBySlug(slug) {
  return SELLER_BY_SLUG.get(String(slug || "").toLowerCase()) || null;
}

export function getAllSellers() {
  return SELLERS;
}

export function getSellerSlugs() {
  return SELLERS.map((s) => s.slug);
}

export const SELLER_TOTAL = SELLERS.length;
