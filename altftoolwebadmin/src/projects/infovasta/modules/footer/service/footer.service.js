import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "infovasta";
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];

export const DEFAULT_FOOTER_SETTINGS = {
  about: {
    heading: "About InfoVsta",
    text: "A results-driven digital marketing agency helping brands grow through web design, development, SEO and social media.",
  },
  socials: [
    { icon: "logo-youtube", href: "#" },
    { icon: "logo-twitter", href: "#" },
    { icon: "logo-facebook", href: "#" },
    { icon: "logo-linkedin", href: "#" },
  ],
  quickLinks: {
    heading: "Quick Links",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about-us" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
  servicesHeading: "Services",
  newsletter: {
    heading: "Newsletter",
    text: "Marketing tips and case studies, once a month.",
    placeholder: "Your email",
    successText: "You're subscribed — thank you!",
  },
  copyright: "© 2022 InfoVsta. All Rights Reserved.",
  bottomLinks: [
    { label: "Terms and conditions", href: "#" },
    { label: "Privacy policy", href: "#" },
    { label: "Login / Signup", href: "#" },
  ],
};

const service = createSingletonDocService(SETTINGS_PATH, DEFAULT_FOOTER_SETTINGS);

export const subscribeFooterSettings = service.subscribe;

export function saveFooterSettings(payload) {
  return service.save(normalizeFooterSettings(payload));
}

function normalizeFooterSettings(payload = {}) {
  return {
    about: {
      heading: String(payload.about?.heading || "").trim(),
      text: String(payload.about?.text || "").trim(),
    },
    socials: normalizeRows(payload.socials, ["icon", "href"]),
    quickLinks: {
      heading: String(payload.quickLinks?.heading || "").trim(),
      links: normalizeRows(payload.quickLinks?.links, ["label", "href"]),
    },
    servicesHeading: String(payload.servicesHeading || "").trim(),
    newsletter: {
      heading: String(payload.newsletter?.heading || "").trim(),
      text: String(payload.newsletter?.text || "").trim(),
      placeholder: String(payload.newsletter?.placeholder || "").trim(),
      successText: String(payload.newsletter?.successText || "").trim(),
    },
    copyright: String(payload.copyright || "").trim(),
    bottomLinks: normalizeRows(payload.bottomLinks, ["label", "href"]),
  };
}

function normalizeRows(rows, keys) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) => {
      const next = {};
      keys.forEach((key) => {
        next[key] = String(row?.[key] || "").trim();
      });
      return next;
    })
    .filter((row) => keys.some((key) => row[key]));
}
