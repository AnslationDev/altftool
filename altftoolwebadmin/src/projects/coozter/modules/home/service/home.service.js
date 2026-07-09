"use client";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "coozter";
const HOME_DOC_PATH = ["projects", PROJECT_ID, "home", "homePageContent"];

export const HOME_SECTION_TABS = [
  { key: "heroSection", label: "Hero Section" },
  { key: "trustSection", label: "Trust/Stats Section" },
  { key: "marketingChannelsSection", label: "Marketing Channels" },
  { key: "processSection", label: "Process Section" },
  { key: "servicesPreviewSection", label: "Services Preview" },
  { key: "blogPreviewSection", label: "Blog Preview" },
  { key: "contactCtaSection", label: "Contact CTA" },
];

export const DEFAULT_HOME_PAGE_CONTENT = {
  heroSection: {
    eyebrowText: "Affiliate Marketing & Performance Growth Agency",
    headingText: "Scale your affiliate growth with campaigns built to convert.",
    highlightedHeadingText: "Performance Growth",
    descriptionText:
      "Coozter helps brands launch, track, and optimize performance marketing programs with clear reporting and conversion-focused execution.",
    primaryButtonLabel: "Start Growing",
    primaryButtonUrl: "/contact",
    secondaryButtonLabel: "Explore Services",
    secondaryButtonUrl: "/services",
    heroImageUrl: "/images/coozter/home-hero.png",
    heroImageAltText: "Coozter performance marketing dashboard preview",
    metrics: [
      { value: "120+", label: "Active campaigns", iconKey: "activity", sortOrder: 1, isActive: true },
      { value: "4.8x", label: "Average ROAS lift", iconKey: "trending-up", sortOrder: 2, isActive: true },
      { value: "35K+", label: "Monthly conversions", iconKey: "badge-check", sortOrder: 3, isActive: true },
    ],
    isActive: true,
  },
  trustSection: {
    headingText: "Trusted by growth teams, publishers, and performance-first brands.",
    stats: [
      { value: "98%", label: "Client retention", sortOrder: 1, isActive: true },
      { value: "24/7", label: "Campaign monitoring", sortOrder: 2, isActive: true },
      { value: "10M+", label: "Tracked clicks", sortOrder: 3, isActive: true },
    ],
    partnerLogos: [
      { name: "Partner One", logoUrl: "/logos/partner-one.svg", altText: "Partner One logo", sortOrder: 1, isActive: true },
      { name: "Partner Two", logoUrl: "/logos/partner-two.svg", altText: "Partner Two logo", sortOrder: 2, isActive: true },
      { name: "Partner Three", logoUrl: "/logos/partner-three.svg", altText: "Partner Three logo", sortOrder: 3, isActive: true },
    ],
    isActive: true,
  },
  marketingChannelsSection: {
    headingText: "Growth channels that work together.",
    highlightedHeadingText: "Built for measurable affiliate performance.",
    descriptionText:
      "Manage acquisition, publishers, offers, and optimization workflows from one content-controlled home experience.",
    benefits: [
      { title: "Affiliate Strategy", descriptionText: "Launch programs with clear goals, commission rules, and partner positioning.", iconKey: "network", sortOrder: 1, isActive: true },
      { title: "Performance Tracking", descriptionText: "Track traffic quality, conversion behavior, and campaign-level outcomes.", iconKey: "bar-chart-3", sortOrder: 2, isActive: true },
      { title: "Publisher Growth", descriptionText: "Recruit and activate partners that match your audience and offer fit.", iconKey: "users", sortOrder: 3, isActive: true },
    ],
    centerGraphicLabelLineOne: "Performance",
    centerGraphicLabelLineTwo: "Growth Engine",
    centerGraphicIconKey: "sparkles",
    growthPoints: [
      { title: "Faster launches", descriptionText: "Move new campaigns from idea to live execution with reusable content blocks.", iconKey: "rocket", sortOrder: 1, isActive: true },
      { title: "Cleaner optimization", descriptionText: "Keep messaging, services, and selected previews easy to update from admin.", iconKey: "sliders-horizontal", sortOrder: 2, isActive: true },
    ],
    isActive: true,
  },
  processSection: {
    headingText: "A simple process for repeatable campaign growth.",
    imageAltText: "Coozter campaign planning and optimization process",
    images: [
      { imageUrl: "/images/coozter/process-1.png", altText: "Campaign planning workspace", sortOrder: 1, isActive: true },
      { imageUrl: "/images/coozter/process-2.png", altText: "Performance analytics report", sortOrder: 2, isActive: true },
    ],
    steps: [
      { title: "Discover", descriptionText: "Understand the offer, audience, market, and conversion goals.", sortOrder: 1, isActive: true },
      { title: "Launch", descriptionText: "Publish campaign assets, partner briefs, links, and tracking rules.", sortOrder: 2, isActive: true },
      { title: "Optimize", descriptionText: "Review results, improve weak points, and scale winning channels.", sortOrder: 3, isActive: true },
    ],
    isActive: true,
  },
  servicesPreviewSection: {
    headingText: "Services built around measurable outcomes.",
    descriptionText: "Choose which Coozter services should appear on the home page without changing frontend code.",
    tags: [
      { label: "Affiliate setup", sortOrder: 1, isActive: true },
      { label: "Publisher management", sortOrder: 2, isActive: true },
      { label: "Campaign analytics", sortOrder: 3, isActive: true },
    ],
    buttonLabel: "View All Services",
    buttonUrl: "/services",
    selectedServices: [
      { serviceSlug: "affiliate-program-management", sortOrder: 1, isActive: true },
      { serviceSlug: "performance-campaign-optimization", sortOrder: 2, isActive: true },
      { serviceSlug: "publisher-partner-growth", sortOrder: 3, isActive: true },
    ],
    isActive: true,
  },
  blogPreviewSection: {
    eyebrowText: "Latest Insights",
    headingText: "Ideas for affiliate, partner, and performance marketing teams.",
    buttonLabel: "Read Blog",
    buttonUrl: "/blog",
    selectedBlogs: [
      { blogSlug: "affiliate-growth-playbook", sortOrder: 1, isActive: true },
      { blogSlug: "publisher-quality-checklist", sortOrder: 2, isActive: true },
      { blogSlug: "conversion-tracking-basics", sortOrder: 3, isActive: true },
    ],
    isActive: true,
  },
  contactCtaSection: {
    headingText: "Ready to build a better performance marketing engine?",
    descriptionText: "Talk with Coozter about campaign strategy, affiliate growth, and admin-editable content workflows.",
    primaryButtonLabel: "Book a Strategy Call",
    primaryButtonUrl: "/contact",
    secondaryButtonLabel: "See Services",
    secondaryButtonUrl: "/services",
    isActive: true,
  },
};

export const ARRAY_FIELD_DEFAULTS = {
  metrics: { value: "", label: "", iconKey: "", sortOrder: 1, isActive: true },
  stats: { value: "", label: "", sortOrder: 1, isActive: true },
  partnerLogos: { name: "", logoUrl: "", altText: "", sortOrder: 1, isActive: true },
  benefits: { title: "", descriptionText: "", iconKey: "", sortOrder: 1, isActive: true },
  growthPoints: { title: "", descriptionText: "", iconKey: "", sortOrder: 1, isActive: true },
  images: { imageUrl: "", altText: "", sortOrder: 1, isActive: true },
  steps: { title: "", descriptionText: "", sortOrder: 1, isActive: true },
  tags: { label: "", sortOrder: 1, isActive: true },
  selectedServices: { serviceSlug: "", sortOrder: 1, isActive: true },
  selectedBlogs: { blogSlug: "", sortOrder: 1, isActive: true },
};

export function subscribeHomePageContent(onNext, onError) {
  return onSnapshot(
    doc(db, ...HOME_DOC_PATH),
    (snap) => onNext(normalizeHomePageContent(snap.exists() ? snap.data() : {})),
    onError,
  );
}

export async function saveHomePageContent(payload) {
  await setDoc(
    doc(db, ...HOME_DOC_PATH),
    {
      ...normalizeHomePageContent(payload),
      updatedAt: serverTimestamp(),
    },
  );
}

export async function seedHomePageContent() {
  await setDoc(
    doc(db, ...HOME_DOC_PATH),
    {
      ...normalizeHomePageContent(DEFAULT_HOME_PAGE_CONTENT),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );
}

export function uploadHomeAsset({ file, sectionKey, fieldKey = "asset", onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const cleanField = String(fieldKey).replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
    const path = `projects/${PROJECT_ID}/home/${sectionKey}/${cleanField}-${Date.now()}.${ext}`;
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

export function mergeHomePageContent(data = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_HOME_PAGE_CONTENT).map(([sectionKey, defaults]) => [
      sectionKey,
      {
        ...defaults,
        ...(data?.[sectionKey] || {}),
      },
    ]),
  );
}

export function normalizeHomePageContent(content) {
  const merged = mergeHomePageContent(content);
  const source = content || {};
  const heroSection = preferSavedAliases(source.heroSection, merged.heroSection, {
    headingText: ["headingPrimaryText"],
    highlightedHeadingText: ["headingHighlightText"],
    descriptionText: ["description"],
    primaryButtonLabel: ["primaryButtonText"],
    secondaryButtonLabel: ["secondaryButtonText"],
    heroImageAltText: ["heroImageAlt"],
    metrics: ["stats"],
  });
  const trustSection = preferSavedAliases(source.trustSection, merged.trustSection, {
    headingText: ["heading"],
  });
  const marketingChannelsSection = preferSavedAliases(source.marketingChannelsSection, merged.marketingChannelsSection, {
    headingText: ["headingLineOne"],
    highlightedHeadingText: ["headingLineTwo"],
    descriptionText: ["description"],
    benefits: ["benefitCards"],
    centerGraphicIconKey: ["centerIconKey"],
    centerGraphicLabelLineOne: ["centerLabelLineOne"],
    centerGraphicLabelLineTwo: ["centerLabelLineTwo"],
  });
  const processSection = preferSavedAliases(source.processSection, merged.processSection, {
    headingText: ["heading"],
  });
  const servicesPreviewSection = preferSavedAliases(source.servicesPreviewSection, merged.servicesPreviewSection, {
    headingText: ["heading"],
    descriptionText: ["description"],
    buttonLabel: ["buttonText"],
  });
  const blogPreviewSection = preferSavedAliases(source.blogPreviewSection, merged.blogPreviewSection, {
    headingText: ["heading"],
    buttonLabel: ["buttonText"],
  });
  const contactCtaSection = preferSavedAliases(source.contactCtaSection, merged.contactCtaSection, {
    headingText: ["heading"],
    descriptionText: ["description"],
    primaryButtonLabel: ["primaryButtonText"],
    secondaryButtonLabel: ["secondaryButtonText"],
  });

  return {
    heroSection: {
      ...normalizeBaseSection(heroSection),
      eyebrowText: clean(pick(heroSection, "eyebrowText")),
      headingText: clean(pick(heroSection, "headingText", "headingPrimaryText")),
      highlightedHeadingText: clean(pick(heroSection, "highlightedHeadingText", "headingHighlightText")),
      descriptionText: clean(pick(heroSection, "descriptionText", "description")),
      primaryButtonLabel: clean(pick(heroSection, "primaryButtonLabel", "primaryButtonText")),
      primaryButtonUrl: clean(pick(heroSection, "primaryButtonUrl")),
      secondaryButtonLabel: clean(pick(heroSection, "secondaryButtonLabel", "secondaryButtonText")),
      secondaryButtonUrl: clean(pick(heroSection, "secondaryButtonUrl")),
      heroImageUrl: clean(pick(heroSection, "heroImageUrl")),
      heroImageAltText: clean(pick(heroSection, "heroImageAltText", "heroImageAlt")),
      metrics: normalizeRows(pickRows(heroSection, "metrics", "stats"), ["value", "label", "iconKey"]),
    },
    trustSection: {
      ...normalizeBaseSection(trustSection),
      headingText: clean(pick(trustSection, "headingText", "heading")),
      stats: normalizeRows(pickRows(trustSection, "stats"), ["value", "label"]),
      partnerLogos: normalizeRows(pickRows(trustSection, "partnerLogos"), ["name", "logoUrl", "altText"]),
    },
    marketingChannelsSection: {
      ...normalizeBaseSection(marketingChannelsSection),
      headingText: clean(pick(marketingChannelsSection, "headingText", "headingLineOne")),
      highlightedHeadingText: clean(pick(marketingChannelsSection, "highlightedHeadingText", "headingLineTwo")),
      descriptionText: clean(pick(marketingChannelsSection, "descriptionText", "description")),
      benefits: normalizeRows(pickRows(marketingChannelsSection, "benefits", "benefitCards"), [
        "title",
        ["descriptionText", "description"],
        "iconKey",
      ]),
      centerGraphicIconKey: clean(pick(marketingChannelsSection, "centerGraphicIconKey", "centerIconKey")),
      centerGraphicLabelLineOne: clean(pick(marketingChannelsSection, "centerGraphicLabelLineOne", "centerLabelLineOne")),
      centerGraphicLabelLineTwo: clean(pick(marketingChannelsSection, "centerGraphicLabelLineTwo", "centerLabelLineTwo")),
      growthPoints: normalizeRows(pickRows(marketingChannelsSection, "growthPoints"), [
        "title",
        ["descriptionText", "description"],
        "iconKey",
      ]),
    },
    processSection: {
      ...normalizeBaseSection(processSection),
      headingText: clean(pick(processSection, "headingText", "heading")),
      imageAltText: clean(pick(processSection, "imageAltText")),
      images: normalizeRows(pickRows(processSection, "images"), ["imageUrl", "altText"]),
      steps: normalizeRows(pickRows(processSection, "steps"), ["title", ["descriptionText", "description"]]),
    },
    servicesPreviewSection: {
      ...normalizeBaseSection(servicesPreviewSection),
      headingText: clean(pick(servicesPreviewSection, "headingText", "heading")),
      descriptionText: clean(pick(servicesPreviewSection, "descriptionText", "description")),
      tags: normalizeRows(pickRows(servicesPreviewSection, "tags"), ["label"]),
      buttonLabel: clean(pick(servicesPreviewSection, "buttonLabel", "buttonText")),
      buttonUrl: clean(pick(servicesPreviewSection, "buttonUrl")),
      selectedServices: normalizeRows(pickRows(servicesPreviewSection, "selectedServices"), [["serviceSlug", "serviceIdOrSlug"]]),
    },
    blogPreviewSection: {
      ...normalizeBaseSection(blogPreviewSection),
      eyebrowText: clean(pick(blogPreviewSection, "eyebrowText")),
      headingText: clean(pick(blogPreviewSection, "headingText", "heading")),
      buttonLabel: clean(pick(blogPreviewSection, "buttonLabel", "buttonText")),
      buttonUrl: clean(pick(blogPreviewSection, "buttonUrl")),
      selectedBlogs: normalizeRows(pickRows(blogPreviewSection, "selectedBlogs"), [["blogSlug", "blogIdOrSlug"]]),
    },
    contactCtaSection: {
      ...normalizeBaseSection(contactCtaSection),
      headingText: clean(pick(contactCtaSection, "headingText", "heading")),
      descriptionText: clean(pick(contactCtaSection, "descriptionText", "description")),
      primaryButtonLabel: clean(pick(contactCtaSection, "primaryButtonLabel", "primaryButtonText")),
      primaryButtonUrl: clean(pick(contactCtaSection, "primaryButtonUrl")),
      secondaryButtonLabel: clean(pick(contactCtaSection, "secondaryButtonLabel", "secondaryButtonText")),
      secondaryButtonUrl: clean(pick(contactCtaSection, "secondaryButtonUrl")),
    },
  };
}

export function validateHomePageContent(content) {
  const data = normalizeHomePageContent(content);
  const errors = {};

  requireFields(errors, "heroSection", data.heroSection, [
    "eyebrowText",
    "headingText",
    "highlightedHeadingText",
    "descriptionText",
    "primaryButtonLabel",
    "primaryButtonUrl",
    "secondaryButtonLabel",
    "secondaryButtonUrl",
    "heroImageUrl",
    "heroImageAltText",
  ]);
  requireUrl(errors, "heroSection", data.heroSection.primaryButtonUrl, "primaryButtonUrl");
  requireUrl(errors, "heroSection", data.heroSection.secondaryButtonUrl, "secondaryButtonUrl");
  requireUrl(errors, "heroSection", data.heroSection.heroImageUrl, "heroImageUrl");

  requireFields(errors, "trustSection", data.trustSection, ["headingText"]);
  requireFields(errors, "marketingChannelsSection", data.marketingChannelsSection, [
    "headingText",
    "highlightedHeadingText",
    "descriptionText",
    "centerGraphicIconKey",
    "centerGraphicLabelLineOne",
    "centerGraphicLabelLineTwo",
  ]);
  requireFields(errors, "processSection", data.processSection, ["headingText", "imageAltText"]);
  requireFields(errors, "servicesPreviewSection", data.servicesPreviewSection, ["headingText", "descriptionText", "buttonLabel", "buttonUrl"]);
  requireUrl(errors, "servicesPreviewSection", data.servicesPreviewSection.buttonUrl, "buttonUrl");
  requireFields(errors, "blogPreviewSection", data.blogPreviewSection, ["eyebrowText", "headingText", "buttonLabel", "buttonUrl"]);
  requireUrl(errors, "blogPreviewSection", data.blogPreviewSection.buttonUrl, "buttonUrl");
  requireFields(errors, "contactCtaSection", data.contactCtaSection, [
    "headingText",
    "descriptionText",
    "primaryButtonLabel",
    "primaryButtonUrl",
    "secondaryButtonLabel",
    "secondaryButtonUrl",
  ]);
  requireUrl(errors, "contactCtaSection", data.contactCtaSection.primaryButtonUrl, "primaryButtonUrl");
  requireUrl(errors, "contactCtaSection", data.contactCtaSection.secondaryButtonUrl, "secondaryButtonUrl");

  validateRows(errors, "heroSection", "metrics", data.heroSection.metrics, ["value", "label"]);
  validateRows(errors, "trustSection", "stats", data.trustSection.stats, ["value", "label"]);
  validateRows(errors, "trustSection", "partnerLogos", data.trustSection.partnerLogos, ["name", "logoUrl", "altText"], ["logoUrl"]);
  validateRows(errors, "marketingChannelsSection", "benefits", data.marketingChannelsSection.benefits, ["title", "descriptionText"]);
  validateRows(errors, "marketingChannelsSection", "growthPoints", data.marketingChannelsSection.growthPoints, ["title", "descriptionText"]);
  validateRows(errors, "processSection", "images", data.processSection.images, ["imageUrl", "altText"], ["imageUrl"]);
  validateRows(errors, "processSection", "steps", data.processSection.steps, ["title", "descriptionText"]);
  validateRows(errors, "servicesPreviewSection", "tags", data.servicesPreviewSection.tags, ["label"]);
  validateRows(errors, "servicesPreviewSection", "selectedServices", data.servicesPreviewSection.selectedServices, ["serviceSlug"]);
  validateRows(errors, "blogPreviewSection", "selectedBlogs", data.blogPreviewSection.selectedBlogs, ["blogSlug"]);

  return errors;
}

function normalizeBaseSection(section) {
  return { isActive: section?.isActive !== false };
}

function normalizeRows(rows, fieldSpecs) {
  return (Array.isArray(rows) ? rows : [])
    .map((row, index) => ({
      ...Object.fromEntries(fieldSpecs.map((spec) => {
        const [key, ...aliases] = Array.isArray(spec) ? spec : [spec];
        return [key, clean(pick(row, key, ...aliases))];
      })),
      sortOrder: toOrder(row?.sortOrder, index),
      isActive: row?.isActive !== false,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function pick(source, key, ...aliases) {
  for (const candidate of [key, ...aliases]) {
    const value = source?.[candidate];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function pickRows(source, key, ...aliases) {
  for (const candidate of [key, ...aliases]) {
    if (Array.isArray(source?.[candidate])) return source[candidate];
  }
  return [];
}

function preferSavedAliases(source = {}, fallback = {}, aliasMap = {}) {
  const next = { ...fallback, ...source };
  Object.entries(aliasMap).forEach(([field, aliases]) => {
    if (hasSavedValue(source?.[field])) return;
    const alias = aliases.find((candidate) => hasSavedValue(source?.[candidate]));
    if (alias) next[field] = source[alias];
  });
  return next;
}

function hasSavedValue(value) {
  if (Array.isArray(value)) return true;
  return value !== undefined && value !== null && value !== "";
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
    if (!clean(section?.[field])) {
      errors[`${sectionKey}.${field}`] = "Required";
    }
  });
}

function requireUrl(errors, sectionKey, value, field) {
  const url = clean(value);
  if (!url || url.startsWith("/") || /^https?:\/\//i.test(url)) return;
  errors[`${sectionKey}.${field}`] = "Use a relative path or http(s) URL";
}

function validateRows(errors, sectionKey, arrayKey, rows, requiredKeys, urlKeys = []) {
  rows.forEach((row, index) => {
    requiredKeys.forEach((key) => {
      if (!clean(row?.[key])) {
        errors[`${sectionKey}.${arrayKey}.${index}.${key}`] = "Required";
      }
    });
    if (!Number.isFinite(Number(row?.sortOrder)) || Number(row.sortOrder) < 0) {
      errors[`${sectionKey}.${arrayKey}.${index}.sortOrder`] = "Order must be 0 or greater";
    }
    urlKeys.forEach((key) => requireUrl(errors, sectionKey, row?.[key], `${arrayKey}.${index}.${key}`));
  });
}
