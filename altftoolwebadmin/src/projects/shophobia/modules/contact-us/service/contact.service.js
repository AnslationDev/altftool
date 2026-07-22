import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Shophobia — Contact Us module data layer.
 *
 * Two singleton docs (see CONTRACT.md):
 *   contact/settings  page hero + info cards (email/phone/address/hours + labels)
 *   contact/form      form labels/placeholders + budget/service options
 *
 * The admin manages LABELS/COPY only — the site form remains a client-side
 * no-op (offerris/dealnbook precedent).
 */

const PROJECT_ID = "shophobia";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
const FORM_PATH = ["projects", PROJECT_ID, "contact", "form"];

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

// ---------------------------------------------------------------------------
// Page hero + info cards — doc contact/settings
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_SETTINGS = {
  badge: "Let's Talk",
  heading: "Let's Build Something The Internet Hasn't Seen Yet",
  subcopy:
    "Tell us about your brand, your goals, and your timeline. We read every submission and reply within two business days.",
  email: "hello@shophobia.studio",
  phone: "+1 (212) 555-0199",
  address: "212 Chrome Alley, Suite 3000, New York, NY 10012",
  hours: "Monday – Friday, 9am – 6pm ET",
  emailLabel: "Email Us",
  phoneLabel: "Call Us",
  addressLabel: "Studio",
  hoursLabel: "Studio Hours",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = settingsDoc.subscribe;

export function saveContactSettings(payload) {
  return settingsDoc.save({
    badge: cleanText(payload.badge),
    heading: cleanText(payload.heading),
    subcopy: cleanText(payload.subcopy),
    email: cleanText(payload.email),
    phone: cleanText(payload.phone),
    address: cleanText(payload.address),
    hours: cleanText(payload.hours),
    emailLabel: cleanText(payload.emailLabel),
    phoneLabel: cleanText(payload.phoneLabel),
    addressLabel: cleanText(payload.addressLabel),
    hoursLabel: cleanText(payload.hoursLabel),
  });
}

// ---------------------------------------------------------------------------
// Form copy — doc contact/form
// ---------------------------------------------------------------------------
export const DEFAULT_CONTACT_FORM = {
  nameLabel: "Full Name",
  namePlaceholder: "Jordan Ace",
  emailLabel: "Email Address",
  emailPlaceholder: "jordan@yourbrand.com",
  companyLabel: "Company / Brand",
  companyPlaceholder: "Your Brand Inc.",
  serviceLabel: "Service Interested In",
  budgetLabel: "Estimated Budget",
  messageLabel: "Project Details",
  messagePlaceholder: "Tell us about your brand, your goals, and your timeline.",
  submitLabel: "Send Message",
  successTitle: "Message Received",
  successBody:
    "We read every submission personally. Expect a reply from the studio within two business days.",
  budgetRanges: ["Under $10k", "$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+"],
  serviceOptions: [
    "Website Design & Development",
    "Mobile App Development",
    "Search Engine Optimization",
    "Email Marketing Services",
    "Social Media Marketing",
    "Custom Web Application Development",
    "WordPress Website Development",
    "UI/UX Design Services",
    "Something Else",
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
    budgetRanges: cleanLines(payload.budgetRanges),
    serviceOptions: cleanLines(payload.serviceOptions),
  });
}
