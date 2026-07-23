import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Snapagee — Contact Us module data layer.
 *
 * Doc `projects/snapagee/contact/settings` holds the page hero copy, the
 * three info-card labels, the FAQ section intro, AND the form's field
 * labels/success state — all in one place (mirrors TheStyleLife's single
 * `contact/settings` doc, not Shophobia's split docs).
 *
 * `projectTypes` and `budgetRanges` are plain string[] fields (rendered as
 * `list` fields in the admin, NOT Firestore sub-collections) that populate
 * the form's "Project Type" and "Budget" dropdown options — see
 * CONTRACT.md's note that these are hardcoded in `ContactForm.jsx` today.
 *
 * Collection `projects/snapagee/contactOffices` backs the "Offices" info
 * card — every doc carries `city` + `address` + `order` + `active`. Left
 * unseeded on first load (mirrors TheStyleLife's contact module, which
 * seeds no collections either) — the bundled `data/contact.json.offices`
 * JSON fallback (San Francisco / New York) covers the page until an admin
 * adds rows here.
 *
 * The admin manages LABELS/COPY only — the site form remains a client-side
 * no-op (shophobia/offerris/dealnbook/thestylelife precedent).
 */

const PROJECT_ID = "snapagee";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
const OFFICES_PATH = ["projects", PROJECT_ID, "contactOffices"];

const cleanText = (value = "") => String(value ?? "").trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export const DEFAULT_CONTACT_SETTINGS = {
  heading: "LET'S SNAP THIS INTO FOCUS",
  subheading:
    "Tell us about the project. We reply within one business day with next steps, not a sales script.",
  pageEyebrow: "Get In Touch",
  emailCardLabel: "Email",
  phoneCardLabel: "Phone",
  officesCardLabel: "Offices",
  faqEyebrow: "Questions",
  faqHeading: "Before you reach out",
  nameLabel: "Name",
  emailLabel: "Email",
  companyLabel: "Company",
  budgetLabel: "Budget",
  projectTypeLabel: "Project Type",
  detailsLabel: "Project Details",
  submitLabel: "Send Message",
  successTitle: "Message received",
  successBody:
    "We reply within one business day with real next steps, not a sales script.",
  projectTypes: [
    "Website Design & Development",
    "Mobile App Development",
    "Search Engine Optimization",
    "Email Marketing Services",
    "Social Media Marketing",
    "Custom Web Application Development",
    "WordPress Website Development",
    "UI/UX Design Services",
    "Something else",
  ],
  budgetRanges: ["Under $10k", "$10k – $25k", "$25k – $75k", "$75k+", "Not sure yet"],
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = settingsDoc.subscribe;

export function saveContactSettings(payload) {
  return settingsDoc.save({
    heading: cleanText(payload.heading),
    subheading: cleanText(payload.subheading),
    pageEyebrow: cleanText(payload.pageEyebrow),
    emailCardLabel: cleanText(payload.emailCardLabel),
    phoneCardLabel: cleanText(payload.phoneCardLabel),
    officesCardLabel: cleanText(payload.officesCardLabel),
    faqEyebrow: cleanText(payload.faqEyebrow),
    faqHeading: cleanText(payload.faqHeading),
    nameLabel: cleanText(payload.nameLabel),
    emailLabel: cleanText(payload.emailLabel),
    companyLabel: cleanText(payload.companyLabel),
    budgetLabel: cleanText(payload.budgetLabel),
    projectTypeLabel: cleanText(payload.projectTypeLabel),
    detailsLabel: cleanText(payload.detailsLabel),
    submitLabel: cleanText(payload.submitLabel),
    successTitle: cleanText(payload.successTitle),
    successBody: cleanText(payload.successBody),
    projectTypes: cleanLines(payload.projectTypes),
    budgetRanges: cleanLines(payload.budgetRanges),
  });
}

/* ------------------------------- offices ---------------------------------- */

function normalizeOffice(payload = {}) {
  return {
    city: cleanText(payload.city),
    address: cleanText(payload.address),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const officesService = createCollectionCrudService(OFFICES_PATH, { normalize: normalizeOffice });

export const subscribeContactOffices = officesService.subscribe;
export const createContactOffice = officesService.create;
export const updateContactOffice = officesService.update;
export const deleteContactOffice = officesService.remove;
export const toggleContactOfficeStatus = officesService.toggleActive;
