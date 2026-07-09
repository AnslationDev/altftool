import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROJECT_ID = "carrerbook";
const TERMS_PATH = ["projects", PROJECT_ID, "terms", "terms-conditions"];

export const DEFAULT_TERMS_PAGE = {
  active: true,
  header: {
    heading: "Terms & Conditions",
    description:
      "Please review the platform terms for advertisers and publishers. These terms provide a professional structure for CareerBook policies.",
  },
  advertiser: {
    tabLabel: "Advertiser Section",
    heading: "Terms & Conditions for Advertisers",
    description:
      "Review the platform rules for advertisers using CareerBook to promote campaigns, offers, opportunities, and business services.",
    badgeText: "CareerBook Policy",
    terms: [
      {
        id: "advertiser-introduction",
        title: "Introduction",
        description:
          "These Terms outline the conditions under which advertisers may use CareerBook to promote offers, campaigns, services, and business opportunities.",
        active: true,
        sortOrder: 1,
      },
      {
        id: "advertiser-eligibility",
        title: "Advertiser Eligibility",
        description:
          "Advertisers must provide accurate business information and comply with all applicable laws, platform policies, and advertising standards.",
        active: true,
        sortOrder: 2,
      },
    ],
  },
  publisher: {
    tabLabel: "Publisher Section",
    heading: "Terms & Conditions for Publishers",
    description:
      "Review the platform rules for publishers using CareerBook to display campaigns, offers, and promotional content.",
    badgeText: "CareerBook Policy",
    terms: [
      {
        id: "publisher-introduction",
        title: "Introduction",
        description:
          "These Terms outline the conditions under which publishers may use CareerBook to access campaigns and publish promotional content.",
        active: true,
        sortOrder: 1,
      },
      {
        id: "publisher-eligibility",
        title: "Publisher Eligibility",
        description:
          "Publishers must provide accurate website, traffic, and business information and comply with all platform quality standards.",
        active: true,
        sortOrder: 2,
      },
    ],
  },
};

export function subscribeTermsPage(onNext, onError) {
  return onSnapshot(
    doc(db, ...TERMS_PATH),
    (snap) => onNext(mergeTermsPage(snap.exists() ? snap.data() : {})),
    onError,
  );
}

export async function saveTermsPage(payload) {
  await setDoc(
    doc(db, ...TERMS_PATH),
    {
      ...normalizeTermsPage(payload),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function resetTermsPage() {
  await setDoc(
    doc(db, ...TERMS_PATH),
    {
      ...DEFAULT_TERMS_PAGE,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

function mergeTermsPage(data) {
  return {
    ...DEFAULT_TERMS_PAGE,
    ...data,
    header: { ...DEFAULT_TERMS_PAGE.header, ...(data.header || {}) },
    advertiser: {
      ...DEFAULT_TERMS_PAGE.advertiser,
      ...(data.advertiser || {}),
      terms: normalizeTerms(data.advertiser?.terms || DEFAULT_TERMS_PAGE.advertiser.terms),
    },
    publisher: {
      ...DEFAULT_TERMS_PAGE.publisher,
      ...(data.publisher || {}),
      terms: normalizeTerms(data.publisher?.terms || DEFAULT_TERMS_PAGE.publisher.terms),
    },
  };
}

export function normalizeTermsPage(payload) {
  return {
    active: payload.active !== false,
    header: {
      heading: String(payload.header?.heading || "").trim(),
      description: String(payload.header?.description || "").trim(),
    },
    advertiser: normalizeSection(payload.advertiser),
    publisher: normalizeSection(payload.publisher),
  };
}

function normalizeSection(section = {}) {
  return {
    tabLabel: String(section.tabLabel || "").trim(),
    heading: String(section.heading || "").trim(),
    description: String(section.description || "").trim(),
    badgeText: String(section.badgeText || "").trim(),
    terms: normalizeTerms(section.terms || []),
  };
}

function normalizeTerms(terms = []) {
  return terms
    .map((term, index) => ({
      id: term.id || `term-${Date.now()}-${index}`,
      title: String(term.title || "").trim(),
      description: String(term.description || "").trim(),
      active: term.active !== false,
      sortOrder: Number(term.sortOrder) || index + 1,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
