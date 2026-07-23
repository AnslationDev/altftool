import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * TheStyleLife — Contact Us module data layer.
 *
 * ONE singleton doc (see CONTRACT.md) — unlike Shophobia's two docs, here the
 * page hero/info-cards copy AND the form's labels/success state all live on
 * a single doc:
 *   contact/settings
 *
 * `reasons` is a plain string[] (rendered as a `list` field in the admin,
 * NOT a separate Firestore sub-collection) that populates the form's
 * "What can we help with?" dropdown options.
 *
 * The admin manages LABELS/COPY only — the site form remains a client-side
 * no-op (shophobia/offerris/dealnbook precedent).
 */

const PROJECT_ID = "thestylelife";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];

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
  heading: "Let's write the next chapter.",
  subheading:
    "Tell us where your brand is headed. We'll tell you how to get there looking the part.",
  email: "hello@thestylife.studio",
  phone: "+1 (212) 555-0192",
  address: "212 Mercer Street, Suite 5A, New York, NY 10012",
  hours: "Monday – Friday, 9:00am – 6:00pm ET",
  reasons: [
    "Start a new brand or website project",
    "Discuss an ongoing growth retainer",
    "Explore a partnership",
    "Something else entirely",
  ],
  nameLabel: "Name",
  emailLabel: "Email",
  reasonLabel: "What can we help with?",
  messageLabel: "Message",
  submitLabel: "Send Message",
  successTitle: "Message sent.",
  successBody:
    "Thanks for reaching out — a member of the studio will reply within two business days.",
};

const settingsDoc = createSingletonDocService(SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = settingsDoc.subscribe;

export function saveContactSettings(payload) {
  return settingsDoc.save({
    heading: cleanText(payload.heading),
    subheading: cleanText(payload.subheading),
    email: cleanText(payload.email),
    phone: cleanText(payload.phone),
    address: cleanText(payload.address),
    hours: cleanText(payload.hours),
    reasons: cleanLines(payload.reasons),
    nameLabel: cleanText(payload.nameLabel),
    emailLabel: cleanText(payload.emailLabel),
    reasonLabel: cleanText(payload.reasonLabel),
    messageLabel: cleanText(payload.messageLabel),
    submitLabel: cleanText(payload.submitLabel),
    successTitle: cleanText(payload.successTitle),
    successBody: cleanText(payload.successBody),
  });
}
