import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Offerris — Contact Us module data layer.
 *
 * Per CONTRACT.md, the Contact page is a single admin page composed of two
 * settings docs and one ordered collection:
 *   contact/settings  singleton                    { badge, heading, subcopy, officeName,
 *                                                    addressLine1, addressLine2, country,
 *                                                    email, phone, mapEmbedPlaceholder }
 *   —                 collection contactHours      { days, hours, order, active }
 *   contact/form      singleton                    { labels/placeholders, submit & success
 *                                                    copy, budgetOptions[], serviceOptions[] }
 */

const PROJECT_ID = "offerris";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
const FORM_PATH = ["projects", PROJECT_ID, "contact", "form"];
const HOURS_PATH = ["projects", PROJECT_ID, "contactHours"];

const cleanText = (value = "") => String(value ?? "").trim();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Accept either a string[] or a newline-joined string. */
function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Settings — doc contact/settings (hero + office/contact details)            */
/* -------------------------------------------------------------------------- */
export const DEFAULT_CONTACT_SETTINGS = {
  badge: "Let's Talk",
  heading: "Tell us where you're headed.",
  subcopy: "Share a few details about your project and a strategist will respond within one business day.",
  officeName: "Offeris HQ",
  addressLine1: "540 Kinetic Avenue, Suite 900",
  addressLine2: "San Francisco, CA 94103",
  country: "United States",
  email: "hello@Offeris.agency",
  phone: "+1 (415) 555-0142",
  mapEmbedPlaceholder: "Interactive map available on request — 540 Kinetic Avenue, San Francisco, CA",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = settingsDoc.subscribe;

export function saveContactSettings(payload) {
  return settingsDoc.save({
    badge: cleanText(payload.badge),
    heading: cleanText(payload.heading),
    subcopy: cleanText(payload.subcopy),
    officeName: cleanText(payload.officeName),
    addressLine1: cleanText(payload.addressLine1),
    addressLine2: cleanText(payload.addressLine2),
    country: cleanText(payload.country),
    email: cleanText(payload.email),
    phone: cleanText(payload.phone),
    mapEmbedPlaceholder: cleanText(payload.mapEmbedPlaceholder),
  });
}

/* -------------------------------------------------------------------------- */
/* Business Hours — collection contactHours                                   */
/* -------------------------------------------------------------------------- */
function normalizeHoursEntry(payload) {
  return {
    days: cleanText(payload.days),
    hours: cleanText(payload.hours),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const hoursCollection = createCollectionCrudService(HOURS_PATH, {
  normalize: normalizeHoursEntry,
  orderByField: "order",
});

export const subscribeContactHours = hoursCollection.subscribe;
export const createContactHoursEntry = hoursCollection.create;
export const updateContactHoursEntry = hoursCollection.update;
export const deleteContactHoursEntry = hoursCollection.remove;
export const toggleContactHoursStatus = hoursCollection.toggleActive;

/* -------------------------------------------------------------------------- */
/* Form — doc contact/form (labels, placeholders, options, success copy)      */
/* -------------------------------------------------------------------------- */
export const DEFAULT_CONTACT_FORM = {
  nameLabel: "Full Name",
  namePlaceholder: "Jordan Blake",
  emailLabel: "Email",
  emailPlaceholder: "jordan@company.com",
  companyLabel: "Company",
  companyPlaceholder: "Company name",
  serviceLabel: "Service Interested In",
  budgetLabel: "Estimated Budget",
  messageLabel: "Project Details",
  messagePlaceholder: "Tell us what you're building and what success looks like.",
  submitLabel: "Send Project Details",
  successTitle: "Message received.",
  successBody: "A strategist will respond within one business day.",
  budgetOptions: ["Under $10k", "$10k – $25k", "$25k – $50k", "$50k+"],
  serviceOptions: [
    "Website Design & Development",
    "Mobile App Development",
    "SEO",
    "Email Marketing",
    "Social Media Marketing",
    "Custom Web Application",
    "WordPress Development",
    "UI/UX Design",
  ],
};

const formDoc = createSingletonDocService(FORM_PATH, DEFAULT_CONTACT_FORM);

export const subscribeContactForm = formDoc.subscribe;

export function saveContactForm(payload) {
  return formDoc.save({
    nameLabel: cleanText(payload.nameLabel),
    namePlaceholder: cleanText(payload.namePlaceholder),
    emailLabel: cleanText(payload.emailLabel),
    emailPlaceholder: cleanText(payload.emailPlaceholder),
    companyLabel: cleanText(payload.companyLabel),
    companyPlaceholder: cleanText(payload.companyPlaceholder),
    serviceLabel: cleanText(payload.serviceLabel),
    budgetLabel: cleanText(payload.budgetLabel),
    messageLabel: cleanText(payload.messageLabel),
    messagePlaceholder: cleanText(payload.messagePlaceholder),
    submitLabel: cleanText(payload.submitLabel),
    successTitle: cleanText(payload.successTitle),
    successBody: cleanText(payload.successBody),
    budgetOptions: cleanLines(payload.budgetOptions),
    serviceOptions: cleanLines(payload.serviceOptions),
  });
}
