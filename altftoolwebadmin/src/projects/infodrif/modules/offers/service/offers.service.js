import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Infodrif — Offers.
 *
 * Firestore layout (merged over src/data/offers.json by the public site —
 * field names must match that file exactly):
 *
 *   projects/infodrif/offers/settings -> offers.settings (flat)
 *   projects/infodrif/offerItems      -> offers.items[]
 */

const PROJECT_ID = "infodrif";
const OFFERS_SETTINGS_PATH = ["projects", PROJECT_ID, "offers", "settings"];
const OFFER_ITEMS_PATH = ["projects", PROJECT_ID, "offerItems"];

export const DEFAULT_OFFERS_SETTINGS = {
  highlightsHeading: "Highlights",
  faqHeading: "FAQ",
  payoutLabel: "Payout:",
  cookieLabel: "Cookie:",
  primaryCtaLabel: "Get affiliate ",
  primaryCtaHref: "#",
  secondaryCtaLabel: "Become a partner",
  secondaryCtaHref: "/partners",
};

export const EMPTY_OFFER = {
  slug: "",
  name: "",
  category: "",
  payout: "",
  commissionType: "",
  cookie: "",
  description: "",
  highlights: [""],
  faq: [],
  order: 0,
  active: true,
};

/** Commission types seen on the site today — the field stays free text. */
export const COMMISSION_TYPES = ["CPS", "CPA", "CPL"];

const cleanText = (value = "") => String(value).trim();

const cleanList = (value) =>
  (Array.isArray(value) ? value : []).map((entry) => cleanText(entry)).filter(Boolean);

export function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeFaq(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => ({ q: cleanText(entry?.q), a: cleanText(entry?.a) }))
    .filter((entry) => entry.q || entry.a);
}

function normalizeOffer(payload) {
  const name = cleanText(payload.name);
  return {
    slug: createSlug(payload.slug || name),
    name,
    category: cleanText(payload.category),
    payout: cleanText(payload.payout),
    commissionType: cleanText(payload.commissionType),
    cookie: cleanText(payload.cookie),
    description: cleanText(payload.description),
    highlights: cleanList(payload.highlights),
    faq: normalizeFaq(payload.faq),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(OFFERS_SETTINGS_PATH, DEFAULT_OFFERS_SETTINGS);
const offersService = createCollectionCrudService(OFFER_ITEMS_PATH, {
  normalize: normalizeOffer,
  orderByField: "order",
});

/** One-document read for the edit route — no whole-collection subscription. */
export async function getOffer(id) {
  const snapshot = await getDoc(doc(db, ...OFFER_ITEMS_PATH, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export const subscribeOffersSettings = settingsService.subscribe;
export const saveOffersSettings = settingsService.save;
export const resetOffersSettings = settingsService.reset;

export const subscribeOffers = offersService.subscribe;
export const createOffer = offersService.create;
export const updateOffer = offersService.update;
export const deleteOffer = offersService.remove;
export const toggleOfferStatus = offersService.toggleActive;
