"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "coozter";
const ABOUT_DOC_PATH = ["projects", PROJECT_ID, "about", "aboutPageContent"];

export const ABOUT_SECTION_TABS = [
  { key: "heroSection", label: "Hero Section" },
  { key: "whyChooseSection", label: "Why Choose Section" },
  { key: "beliefsSection", label: "Beliefs Section" },
  { key: "workModelSection", label: "Work Model Section" },
  { key: "teamSection", label: "Team Section" },
  { key: "proofMetrics", label: "Proof Metrics" },
];

export const DEFAULT_ABOUT_PAGE_CONTENT = {
  heroSection: {
    isActive: true,
    eyebrowText: "About Coozter",
    headingText: "We help brands build, launch, and scale digital products",
    descriptionOne:
      "Coozter is an affiliate branding and performance marketing partner for companies that sell through credibility.",
    descriptionTwo:
      "We build the campaigns, pages, content, and reporting needed to convert trust into revenue.",
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
    features: [
      {
        iconKey: "target",
        title: "Strategy First Approach",
        descriptionText: "We understand goals, users, and business model before choosing the right plan.",
        details: ["Discovery map", "Decision-led plan", "Clear next steps"],
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
  beliefsSection: {
    isActive: true,
    eyebrowText: "What we believe",
    headingText: "Growth looks better when the customer journey is honest.",
    descriptionText: "The work is designed around proof, comparison, timing, and repeat exposure.",
    values: [{ title: "Specific beats loud.", descriptionText: "We look for proof that changes a decision.", isActive: true, sortOrder: 1 }],
  },
  workModelSection: {
    isActive: true,
    eyebrowText: "How we work",
    visualAltText: "Workflow showing partner, search, campaign, and reporting signals",
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
    members: [
      {
        name: "Nisha Kapoor",
        role: "Strategy Lead",
        focusText: "Positioning, partner offer design, campaign direction.",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=86",
        imageAltText: "Nisha Kapoor, Strategy Lead at Coozter",
        companyName: "Coozter",
        linkedinUrl: "https://linkedin.com/in/nisha-kapoor-growth",
        bioText: "Shapes partner-led growth strategy and campaign direction.",
        isActive: true,
        sortOrder: 1,
      },
    ],
  },
  proofMetrics: [{ value: "4.8x", label: "campaign ROI", isActive: true, sortOrder: 1 }],
};

export const ARRAY_FIELD_DEFAULTS = {
  features: { iconKey: "", title: "", descriptionText: "", details: [], sortOrder: 1, isActive: true },
  values: { title: "", descriptionText: "", sortOrder: 1, isActive: true },
  visualNodes: { iconKey: "", label: "", sortOrder: 1, isActive: true },
  items: { iconKey: "", title: "", descriptionText: "", sortOrder: 1, isActive: true },
  members: {
    name: "",
    role: "",
    focusText: "",
    imageUrl: "",
    imageAltText: "",
    companyName: "",
    linkedinUrl: "",
    bioText: "",
    sortOrder: 1,
    isActive: true,
  },
  proofMetrics: { value: "", label: "", sortOrder: 1, isActive: true },
};

export function subscribeAboutPageContent(onNext, onError) {
  return onSnapshot(
    doc(db, ...ABOUT_DOC_PATH),
    (snap) => onNext(normalizeAboutPageContent(snap.exists() ? snap.data() : {})),
    onError,
  );
}

export async function saveAboutPageContent(payload) {
  await setDoc(doc(db, ...ABOUT_DOC_PATH), { ...normalizeAboutPageContent(payload), updatedAt: serverTimestamp() });
}

export async function seedAboutPageContent() {
  await setDoc(doc(db, ...ABOUT_DOC_PATH), {
    ...normalizeAboutPageContent(DEFAULT_ABOUT_PAGE_CONTENT),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function uploadAboutAsset({ file, sectionKey, fieldKey = "asset", onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const cleanField = String(fieldKey).replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    const path = `projects/${PROJECT_ID}/about/${sectionKey}/${cleanField}-${Date.now()}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => resolve({ url: await getDownloadURL(task.snapshot.ref), path }),
    );
  });
}

export function normalizeAboutPageContent(content = {}) {
  const merged = mergeAboutPageContent(content);
  return {
    heroSection: normalizeObjectSection(merged.heroSection, ["eyebrowText", "headingText", "descriptionOne", "descriptionTwo", "backgroundImageUrl", "backgroundImageAltText", "buttonLabel", "buttonUrl"]),
    whyChooseSection: {
      ...normalizeObjectSection(merged.whyChooseSection, ["eyebrowText", "headingText", "badgeText"]),
      features: normalizeRows(merged.whyChooseSection.features, ["iconKey", "title", "descriptionText", ["details", "list"]]),
    },
    beliefsSection: {
      ...normalizeObjectSection(merged.beliefsSection, ["eyebrowText", "headingText", "descriptionText"]),
      values: normalizeRows(merged.beliefsSection.values, ["title", "descriptionText"]),
    },
    workModelSection: {
      ...normalizeObjectSection(merged.workModelSection, ["eyebrowText", "visualAltText", "centerIconKey"]),
      visualNodes: normalizeRows(merged.workModelSection.visualNodes, ["iconKey", "label"]),
      items: normalizeRows(merged.workModelSection.items, ["iconKey", "title", "descriptionText"]),
    },
    teamSection: {
      ...normalizeObjectSection(merged.teamSection, ["eyebrowText", "headingText", "descriptionText", "modalCompanyLabelSuffix", "focusLabel", "companyLabel"]),
      members: normalizeRows(merged.teamSection.members, ["name", "role", "focusText", "imageUrl", "imageAltText", "companyName", "linkedinUrl", "bioText"]),
    },
    proofMetrics: normalizeRows(merged.proofMetrics, ["value", "label"]),
  };
}

export function validateAboutPageContent(content) {
  const data = normalizeAboutPageContent(content);
  const errors = {};
  requireFields(errors, "heroSection", data.heroSection, ["eyebrowText", "headingText", "backgroundImageUrl", "buttonLabel", "buttonUrl"]);
  validateRows(errors, "proofMetrics", "proofMetrics", data.proofMetrics, ["value", "label"]);
  return errors;
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

function normalizeObjectSection(section, fields) {
  return Object.fromEntries([["isActive", section?.isActive !== false], ...fields.map((field) => [field, clean(section?.[field])])]);
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

function validateRows(errors, sectionKey, arrayKey, rows, requiredKeys) {
  rows.forEach((row, index) => {
    requiredKeys.forEach((key) => {
      if (!clean(row?.[key])) errors[`${sectionKey}.${arrayKey}.${index}.${key}`] = "Required";
    });
  });
}
