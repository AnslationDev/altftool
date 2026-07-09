"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const ABOUT_DOC_PATH = ["projects", "coozter", "about", "aboutPageContent"];

export const ROOT_ARRAY_SECTIONS = new Set(["proofMetrics"]);

export const ABOUT_SECTION_TABS = [
  { key: "heroSection", label: "Hero Section" },
  { key: "whyChooseSection", label: "Why Choose" },
  { key: "beliefsSection", label: "Beliefs Section" },
  { key: "workModelSection", label: "Work Model" },
  { key: "teamSection", label: "Team Section" },
  { key: "proofMetrics", label: "Proof Metrics" },
];

export const DEFAULT_ABOUT_PAGE_CONTENT = {
  heroSection: {
    isActive: true,
    eyebrowText: "About Coozter",
    headingText: "We help brands build, launch, and scale digital products",
    descriptionOne: "Coozter is an affiliate branding and performance marketing partner for companies that sell through credibility.",
    descriptionTwo: "We help leadership teams convert trust into revenue with campaigns, content, pages, and reporting.",
    backgroundImageUrl: "/assets/about-hero.jpg",
    backgroundImageAltText: "Coozter about hero background",
    buttonLabel: "Explore Our Services",
    buttonUrl: "/services",
  },
  whyChooseSection: {
    isActive: true,
    eyebrowText: "Why choose us",
    headingText: "Why choose us",
    badgeText: "Built for growth",
    features: [{ iconKey: "target", title: "Strategy First Approach", descriptionText: "We understand your goals before designing the right digital solution.", details: ["Discovery map"], isActive: true, sortOrder: 1 }],
  },
  beliefsSection: {
    isActive: true,
    eyebrowText: "What we believe",
    headingText: "Growth looks better when the customer journey is honest.",
    descriptionText: "The work is designed around how buyers actually build confidence.",
    values: [{ title: "Specific beats loud.", descriptionText: "We look for the proof that actually changes a decision.", isActive: true, sortOrder: 1 }],
  },
  workModelSection: {
    isActive: true,
    eyebrowText: "How we work",
    visualAltText: "Animated workflow showing partner, search, campaign, and reporting signals",
    centerIconKey: "bar-chart",
    visualNodes: [{ iconKey: "handshake", label: "Partners", sortOrder: 1, isActive: true }],
    items: [{ iconKey: "handshake", title: "Partner-led visibility", descriptionText: "We give partners the proof and landing paths they need.", isActive: true, sortOrder: 1 }],
  },
  teamSection: {
    isActive: true,
    eyebrowText: "Meet our team",
    headingText: "The people shaping partner-led growth.",
    descriptionText: "Strategy, content, performance, and reporting sit close together.",
    modalCompanyLabelSuffix: "Leadership",
    focusLabel: "Focus",
    companyLabel: "Company",
    members: [{ name: "Nisha Kapoor", role: "Strategy Lead", focusText: "Positioning and partner offer design.", imageUrl: "", imageAltText: "", companyName: "Coozter", linkedinUrl: "", bioText: "", isActive: true, sortOrder: 1 }],
  },
  proofMetrics: [
    { value: "4.8x", label: "campaign ROI", isActive: true, sortOrder: 1 },
    { value: "32", label: "partner launches", isActive: true, sortOrder: 2 },
  ],
};

export const ARRAY_FIELD_DEFAULTS = {
  features: { iconKey: "", title: "", descriptionText: "", details: [], sortOrder: 1, isActive: true },
  values: { title: "", descriptionText: "", sortOrder: 1, isActive: true },
  visualNodes: { iconKey: "", label: "", sortOrder: 1, isActive: true },
  items: { iconKey: "", title: "", descriptionText: "", sortOrder: 1, isActive: true },
  members: { name: "", role: "", focusText: "", imageUrl: "", imageAltText: "", companyName: "", linkedinUrl: "", bioText: "", sortOrder: 1, isActive: true },
  proofMetrics: { value: "", label: "", sortOrder: 1, isActive: true },
};

export function subscribeAboutPageContent(onNext, onError) {
  return onSnapshot(doc(db, ...ABOUT_DOC_PATH), (snap) => onNext(normalizeAboutPageContent(snap.exists() ? snap.data() : {})), onError);
}

export async function saveAboutPageContent(payload) {
  await setDoc(doc(db, ...ABOUT_DOC_PATH), { ...normalizeAboutPageContent(payload), updatedAt: serverTimestamp() });
}

export async function seedAboutPageContent() {
  await setDoc(doc(db, ...ABOUT_DOC_PATH), { ...normalizeAboutPageContent(DEFAULT_ABOUT_PAGE_CONTENT), createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export function validateAboutPageContent(content) {
  const data = normalizeAboutPageContent(content);
  const errors = {};
  ["eyebrowText", "headingText", "descriptionOne", "buttonLabel", "buttonUrl"].forEach((field) => {
    if (!clean(data.heroSection[field])) errors[`heroSection.${field}`] = "Required";
  });
  return errors;
}

export function normalizeAboutPageContent(content = {}) {
  const merged = mergeAboutPageContent(content);
  return {
    heroSection: normalizeSection(merged.heroSection, ["eyebrowText", "headingText", "descriptionOne", "descriptionTwo", "backgroundImageUrl", "backgroundImageAltText", "buttonLabel", "buttonUrl"]),
    whyChooseSection: { ...normalizeSection(merged.whyChooseSection, ["eyebrowText", "headingText", "badgeText"]), features: normalizeRows(merged.whyChooseSection.features, ["iconKey", "title", "descriptionText", ["details", "list"]]) },
    beliefsSection: { ...normalizeSection(merged.beliefsSection, ["eyebrowText", "headingText", "descriptionText"]), values: normalizeRows(merged.beliefsSection.values, ["title", "descriptionText"]) },
    workModelSection: { ...normalizeSection(merged.workModelSection, ["eyebrowText", "visualAltText", "centerIconKey"]), visualNodes: normalizeRows(merged.workModelSection.visualNodes, ["iconKey", "label"]), items: normalizeRows(merged.workModelSection.items, ["iconKey", "title", "descriptionText"]) },
    teamSection: { ...normalizeSection(merged.teamSection, ["eyebrowText", "headingText", "descriptionText", "modalCompanyLabelSuffix", "focusLabel", "companyLabel"]), members: normalizeRows(merged.teamSection.members, ["name", "role", "focusText", "imageUrl", "imageAltText", "companyName", "linkedinUrl", "bioText"]) },
    proofMetrics: normalizeRows(merged.proofMetrics, ["value", "label"]),
  };
}

function mergeAboutPageContent(data = {}) {
  return {
    ...DEFAULT_ABOUT_PAGE_CONTENT,
    ...data,
    heroSection: { ...DEFAULT_ABOUT_PAGE_CONTENT.heroSection, ...(data.heroSection || {}) },
    whyChooseSection: { ...DEFAULT_ABOUT_PAGE_CONTENT.whyChooseSection, ...(data.whyChooseSection || {}) },
    beliefsSection: { ...DEFAULT_ABOUT_PAGE_CONTENT.beliefsSection, ...(data.beliefsSection || {}) },
    workModelSection: { ...DEFAULT_ABOUT_PAGE_CONTENT.workModelSection, ...(data.workModelSection || {}) },
    teamSection: { ...DEFAULT_ABOUT_PAGE_CONTENT.teamSection, ...(data.teamSection || {}) },
    proofMetrics: Array.isArray(data.proofMetrics) ? data.proofMetrics : DEFAULT_ABOUT_PAGE_CONTENT.proofMetrics,
  };
}

function normalizeSection(section, fields) {
  return Object.fromEntries([["isActive", section?.isActive !== false], ...fields.map((field) => [field, clean(section?.[field])])]);
}

function normalizeRows(rows, fields) {
  return (Array.isArray(rows) ? rows : []).map((row, index) => ({
    ...Object.fromEntries(fields.map((spec) => {
      if (Array.isArray(spec) && spec[1] === "list") return [spec[0], normalizeList(row?.[spec[0]])];
      const key = Array.isArray(spec) ? spec[0] : spec;
      return [key, clean(row?.[key])];
    })),
    sortOrder: toOrder(row?.sortOrder, index),
    isActive: row?.isActive !== false,
  })).sort((a, b) => a.sortOrder - b.sortOrder);
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
