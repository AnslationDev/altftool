"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { db } from "@/lib/firebaseFirestore";
import { storage } from "@/lib/firebaseStorage";

const PROJECT_ID = "coozter";
const SERVICES_DOC_PATH = ["projects", PROJECT_ID, "services", "servicesPageContent"];

export const ROOT_ARRAY_SECTIONS = new Set();

export const SERVICES_SECTION_TABS = [
  { key: "heroSection", label: "Hero Section" },
  { key: "serviceCategoriesSection", label: "Service Categories" },
  { key: "growthEngineSection", label: "Growth Engine" },
  { key: "outcomesSection", label: "Outcomes Section" },
  { key: "processSection", label: "Process Section" },
  { key: "faqSection", label: "FAQ Section" },
];

export const DEFAULT_SERVICES_PAGE_CONTENT = {
  heroSection: {
    isActive: true,
    eyebrowText: "Grow Your Business With Scalable Digital Marketing",
    headingText: "Outsmart the competition with best-in-class digital marketing services",
    descriptionText:
      "Get more traffic. Acquire more customers. Sell more stuff. Coozter offers proven strategies and reliable execution to exceed your marketing goals.",
    heroImageUrl: "https://www.smartsites.com/media/digital-marketing-services-banner-hero.png",
    heroImageAltText: "Digital marketing analytics laptop with growth idea",
    partnerBadges: [{ name: "Google", label: "Growth Partner", isActive: true, sortOrder: 1 }],
  },
  serviceCategoriesSection: {
    isActive: true,
    backgroundImageUrl: "/assets/coozter-hero-bg.jpg",
    headingText: "Our Services",
    serviceGroups: [
      {
        title: "Affiliate Branding",
        items: ["Partner messaging", "Referral landing pages", "Offer positioning", "Campaign tracking", "Partner visibility"],
        buttonLabel: "More Affiliate Branding",
        buttonUrl: "#affiliate-branding",
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
  growthEngineSection: {
    isActive: true,
    headingText: "Marketing systems that move like one connected engine.",
    descriptionText:
      "Every channel has a role: attract demand, shape trust, capture intent, and report what should happen next.",
    visualAltText: "Connected marketing growth system visual",
    centerLabelLineOne: "Growth",
    centerLabelLineTwo: "Engine",
    cards: [
      { title: "SEO", descriptionText: "Intent captured", isActive: true, sortOrder: 1 },
      { title: "Paid", descriptionText: "Demand tested", isActive: true, sortOrder: 2 },
      { title: "Content", descriptionText: "Trust built", isActive: true, sortOrder: 3 },
      { title: "Analytics", descriptionText: "Decisions clear", isActive: true, sortOrder: 4 },
    ],
  },
  outcomesSection: {
    isActive: true,
    headingText: "Marketing That Moves Real Business Metrics",
    descriptionText: "We focus on outcomes that matter, not vanity metrics.",
    achievementBlocks: [
      {
        iconKey: "target",
        title: "More Qualified Leads",
        descriptionText: "Attract people who are actively searching for your products or services.",
        isActive: true,
        sortOrder: 1,
      },
    ],
    metrics: [
      { value: "3x", label: "Better campaign visibility", isActive: true, sortOrder: 1 },
      { value: "45%", label: "Increase in qualified leads", isActive: true, sortOrder: 2 },
      { value: "60%", label: "Better landing page conversion", isActive: true, sortOrder: 3 },
      { value: "2.8x", label: "Return on ad spend focus", isActive: true, sortOrder: 4 },
    ],
  },
  processSection: {
    isActive: true,
    headingText: "Our Simple Growth Process",
    descriptionText: "A clear process keeps strategy, execution, and reporting moving in the same direction.",
    steps: [
      {
        title: "Discover",
        descriptionText: "Audit the offer, channel data, customer journey, and where demand already exists.",
        isActive: true,
        sortOrder: 1,
      },
      {
        title: "Plan",
        descriptionText: "Choose the channels, messages, pages, and metrics that deserve focus first.",
        isActive: true,
        sortOrder: 2,
      },
    ],
  },
  faqSection: {
    isActive: true,
    headingText: "Frequently Asked Questions",
    faqs: [
      {
        question: "What digital marketing services do you offer?",
        answer:
          "We offer SEO, PPC advertising, social media marketing, content marketing, website design, email marketing, branding, and conversion optimization.",
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
};

export const ARRAY_FIELD_DEFAULTS = {
  partnerBadges: { name: "", label: "", sortOrder: 1, isActive: true },
  serviceGroups: { title: "", items: [], buttonLabel: "", buttonUrl: "", sortOrder: 1, isActive: true },
  cards: { title: "", descriptionText: "", sortOrder: 1, isActive: true },
  achievementBlocks: { iconKey: "", title: "", descriptionText: "", sortOrder: 1, isActive: true },
  metrics: { value: "", label: "", sortOrder: 1, isActive: true },
  steps: { title: "", descriptionText: "", sortOrder: 1, isActive: true },
  faqs: { question: "", answer: "", sortOrder: 1, isActive: true },
};

const ROW_FIELDS = {
  partnerBadges: ["name", "label"],
  serviceGroups: ["title", ["items", "list"], "buttonLabel", "buttonUrl"],
  cards: ["title", "descriptionText"],
  achievementBlocks: ["iconKey", "title", "descriptionText"],
  metrics: ["value", "label"],
  steps: ["title", "descriptionText"],
  faqs: ["question", "answer"],
};

export function subscribeServicesPageContent(onNext, onError) {
  return onSnapshot(
    doc(db, ...SERVICES_DOC_PATH),
    (snap) => onNext(normalizeServicesPageContent(snap.exists() ? snap.data() : {})),
    onError,
  );
}

export async function saveServicesPageContent(payload) {
  await setDoc(doc(db, ...SERVICES_DOC_PATH), {
    ...normalizeServicesPageContent(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function seedServicesPageContent() {
  await setDoc(doc(db, ...SERVICES_DOC_PATH), {
    ...normalizeServicesPageContent(DEFAULT_SERVICES_PAGE_CONTENT),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function uploadServicesAsset({ file, sectionKey, fieldKey = "asset", onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const cleanField = String(fieldKey).replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    const path = `projects/${PROJECT_ID}/services/${sectionKey}/${cleanField}-${Date.now()}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve({ url: await getDownloadURL(task.snapshot.ref), path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export function mergeServicesPageContent(data = {}) {
  return {
    ...DEFAULT_SERVICES_PAGE_CONTENT,
    ...data,
    heroSection: { ...DEFAULT_SERVICES_PAGE_CONTENT.heroSection, ...(data.heroSection || {}) },
    serviceCategoriesSection: { ...DEFAULT_SERVICES_PAGE_CONTENT.serviceCategoriesSection, ...(data.serviceCategoriesSection || {}) },
    growthEngineSection: { ...DEFAULT_SERVICES_PAGE_CONTENT.growthEngineSection, ...(data.growthEngineSection || {}) },
    outcomesSection: { ...DEFAULT_SERVICES_PAGE_CONTENT.outcomesSection, ...(data.outcomesSection || {}) },
    processSection: { ...DEFAULT_SERVICES_PAGE_CONTENT.processSection, ...(data.processSection || {}) },
    faqSection: { ...DEFAULT_SERVICES_PAGE_CONTENT.faqSection, ...(data.faqSection || {}) },
  };
}

export function normalizeServicesPageContent(content) {
  const merged = mergeServicesPageContent(content);
  return {
    heroSection: {
      ...normalizeBaseSection(merged.heroSection),
      eyebrowText: clean(merged.heroSection.eyebrowText),
      headingText: clean(merged.heroSection.headingText),
      descriptionText: clean(merged.heroSection.descriptionText),
      heroImageUrl: clean(merged.heroSection.heroImageUrl),
      heroImageAltText: clean(merged.heroSection.heroImageAltText),
      partnerBadges: normalizeRows(merged.heroSection.partnerBadges, ROW_FIELDS.partnerBadges),
    },
    serviceCategoriesSection: {
      ...normalizeBaseSection(merged.serviceCategoriesSection),
      backgroundImageUrl: clean(merged.serviceCategoriesSection.backgroundImageUrl),
      headingText: clean(merged.serviceCategoriesSection.headingText),
      serviceGroups: normalizeRows(merged.serviceCategoriesSection.serviceGroups, ROW_FIELDS.serviceGroups),
    },
    growthEngineSection: {
      ...normalizeBaseSection(merged.growthEngineSection),
      headingText: clean(merged.growthEngineSection.headingText),
      descriptionText: clean(merged.growthEngineSection.descriptionText),
      visualAltText: clean(merged.growthEngineSection.visualAltText),
      centerLabelLineOne: clean(merged.growthEngineSection.centerLabelLineOne),
      centerLabelLineTwo: clean(merged.growthEngineSection.centerLabelLineTwo),
      cards: normalizeRows(merged.growthEngineSection.cards, ROW_FIELDS.cards),
    },
    outcomesSection: {
      ...normalizeBaseSection(merged.outcomesSection),
      headingText: clean(merged.outcomesSection.headingText),
      descriptionText: clean(merged.outcomesSection.descriptionText),
      achievementBlocks: normalizeRows(merged.outcomesSection.achievementBlocks, ROW_FIELDS.achievementBlocks),
      metrics: normalizeRows(merged.outcomesSection.metrics, ROW_FIELDS.metrics),
    },
    processSection: {
      ...normalizeBaseSection(merged.processSection),
      headingText: clean(merged.processSection.headingText),
      descriptionText: clean(merged.processSection.descriptionText),
      steps: normalizeRows(merged.processSection.steps, ROW_FIELDS.steps),
    },
    faqSection: {
      ...normalizeBaseSection(merged.faqSection),
      headingText: clean(merged.faqSection.headingText),
      faqs: normalizeRows(merged.faqSection.faqs, ROW_FIELDS.faqs),
    },
  };
}

export function validateServicesPageContent(content) {
  const data = normalizeServicesPageContent(content);
  const errors = {};

  requireFields(errors, "heroSection", data.heroSection, ["eyebrowText", "headingText", "descriptionText", "heroImageUrl", "heroImageAltText"]);
  requireUrl(errors, "heroSection", data.heroSection.heroImageUrl, "heroImageUrl");
  requireFields(errors, "serviceCategoriesSection", data.serviceCategoriesSection, ["backgroundImageUrl", "headingText"]);
  requireUrl(errors, "serviceCategoriesSection", data.serviceCategoriesSection.backgroundImageUrl, "backgroundImageUrl");
  requireFields(errors, "growthEngineSection", data.growthEngineSection, ["headingText", "descriptionText", "visualAltText", "centerLabelLineOne", "centerLabelLineTwo"]);
  requireFields(errors, "outcomesSection", data.outcomesSection, ["headingText", "descriptionText"]);
  requireFields(errors, "processSection", data.processSection, ["headingText", "descriptionText"]);
  requireFields(errors, "faqSection", data.faqSection, ["headingText"]);

  validateRows(errors, "heroSection", "partnerBadges", data.heroSection.partnerBadges, ["name", "label"]);
  validateRows(errors, "serviceCategoriesSection", "serviceGroups", data.serviceCategoriesSection.serviceGroups, ["title", "buttonLabel", "buttonUrl"], ["buttonUrl"]);
  validateRows(errors, "growthEngineSection", "cards", data.growthEngineSection.cards, ["title", "descriptionText"]);
  validateRows(errors, "outcomesSection", "achievementBlocks", data.outcomesSection.achievementBlocks, ["iconKey", "title", "descriptionText"]);
  validateRows(errors, "outcomesSection", "metrics", data.outcomesSection.metrics, ["value", "label"]);
  validateRows(errors, "processSection", "steps", data.processSection.steps, ["title", "descriptionText"]);
  validateRows(errors, "faqSection", "faqs", data.faqSection.faqs, ["question", "answer"]);
  return errors;
}

function normalizeBaseSection(section) {
  return { isActive: section?.isActive !== false };
}

function normalizeRows(rows, fieldSpecs) {
  return (Array.isArray(rows) ? rows : [])
    .map((row, index) => ({
      ...Object.fromEntries(fieldSpecs.map((spec) => {
        if (Array.isArray(spec) && spec[1] === "list") return [spec[0], normalizeList(row?.[spec[0]])];
        const key = Array.isArray(spec) ? spec[0] : spec;
        return [key, clean(row?.[key])];
      })),
      sortOrder: toOrder(row?.sortOrder, index),
      isActive: row?.isActive !== false,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  return String(value || "").split(/\r?\n|,/).map(clean).filter(Boolean);
}

function clean(value) {
  return String(value ?? "").trim();
}

function toOrder(value, index) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : index + 1;
}

function requireFields(errors, sectionKey, section, fields) {
  fields.forEach((field) => {
    if (!clean(section?.[field])) errors[`${sectionKey}.${field}`] = "Required";
  });
}

function requireUrl(errors, sectionKey, value, field) {
  const url = clean(value);
  if (!url || url.startsWith("#") || url.startsWith("/") || /^https?:\/\//i.test(url)) return;
  errors[`${sectionKey}.${field}`] = "Use #anchor, a relative path, or http(s) URL";
}

function validateRows(errors, sectionKey, arrayKey, rows, requiredKeys, urlKeys = []) {
  rows.forEach((row, index) => {
    requiredKeys.forEach((key) => {
      if (!clean(row?.[key])) errors[`${sectionKey}.${arrayKey}.${index}.${key}`] = "Required";
    });
    if (!Number.isFinite(Number(row?.sortOrder)) || Number(row.sortOrder) < 0) {
      errors[`${sectionKey}.${arrayKey}.${index}.sortOrder`] = "Order must be 0 or greater";
    }
    urlKeys.forEach((key) => requireUrl(errors, sectionKey, row?.[key], `${arrayKey}.${index}.${key}`));
  });
}
