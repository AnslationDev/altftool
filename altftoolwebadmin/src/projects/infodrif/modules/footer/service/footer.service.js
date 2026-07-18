import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "infodrif";
const FOOTER_SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const FOOTER_LINKS_PATH = ["projects", PROJECT_ID, "footerLinks"];

/**
 * Field names mirror `src/data/footer.json` in the public site exactly — the
 * site merges this document over that JSON, so a renamed key silently drops
 * back to the fallback with no error.
 */
export const DEFAULT_FOOTER_SETTINGS = {
  logoInitials: "ID",
  logoText: "InfoDrift",
  blurb:
    "We help companies build visibility, trust, partnerships, and revenue through affiliate branding and performance-focused marketing.",
  address: "Gurugram, Haryana",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Gurugram%2C%20Haryana",
  email: "hello@infodrift.com",
  phone: "+91 98765 43210",
  companyHeading: "Company",
  topicsHeading: "Topics",
  connectHeading: "Let's Connect",
  connectBlurb: "Have a project in mind? Let's discuss how we can help your business grow.",
  connectCtaLabel: "Start a conversation",
  copyright: "© 2026 InfoDrift. All rights reserved.",
  tagline: "Where strategy, partnerships, and performance meet.",
};

/**
 * All four footer link groups live in ONE collection, discriminated by `group`,
 * and the site splits them back out on read (see the site's data/navigation.js).
 * These values are the contract — do not rename them.
 */
export const FOOTER_LINK_GROUPS = [
  { value: "company", label: "Company" },
  { value: "topics", label: "Topics" },
  { value: "social", label: "Social" },
  { value: "legal", label: "Legal" },
];

/** `icon` is only meaningful for the "social" group. */
export const FOOTER_SOCIAL_ICONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
];

const GROUP_VALUES = FOOTER_LINK_GROUPS.map((group) => group.value);
const ICON_VALUES = FOOTER_SOCIAL_ICONS.map((icon) => icon.value);

const cleanText = (value = "") => String(value).trim();

function normalizeFooterLink(payload) {
  const group = GROUP_VALUES.includes(payload.group) ? payload.group : "company";
  const icon = group === "social" && ICON_VALUES.includes(payload.icon) ? payload.icon : "";

  return {
    title: cleanText(payload.title),
    url: cleanText(payload.url),
    group,
    icon,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const settingsService = createSingletonDocService(FOOTER_SETTINGS_PATH, DEFAULT_FOOTER_SETTINGS);
const linksService = createCollectionCrudService(FOOTER_LINKS_PATH, { normalize: normalizeFooterLink });

export const subscribeFooterSettings = settingsService.subscribe;
export const saveFooterSettings = settingsService.save;
export const resetFooterSettings = settingsService.reset;

export const subscribeFooterLinks = linksService.subscribe;
export const createFooterLink = linksService.create;
export const updateFooterLink = linksService.update;
export const deleteFooterLink = linksService.remove;
export const toggleFooterLinkStatus = linksService.toggleActive;
