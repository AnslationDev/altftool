import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Infodrif — Contact.
 *
 * Firestore layout (merged over src/data/contact.json by the public site —
 * field names must match that file exactly):
 *
 *   projects/infodrif/contact/settings -> contact.settings (flat) + `fields`
 *
 * `fields` rides INLINE on the settings document as an array — it is not a
 * subcollection. The site reads it as `const { fields, ...settings } = doc`,
 * so the array must live on this same document.
 *
 * Leads live in projects/infodrif/contactLeads and are handled by
 * ./leads/service/leads.service.js — they have no `order` field.
 */

const PROJECT_ID = "infodrif";
const CONTACT_SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];

export const DEFAULT_CONTACT_FIELDS = [
  {
    name: "name",
    label: "Name",
    placeholder: "Your name",
    type: "text",
    required: true,
    order: 0,
    active: true,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
    required: true,
    order: 1,
    active: true,
  },
  {
    name: "message",
    label: "Message",
    placeholder: "What are you looking to achieve?",
    type: "textarea",
    required: true,
    order: 2,
    active: true,
  },
];

export const DEFAULT_CONTACT_SETTINGS = {
  eyebrow: "Contact",
  heading: "Talk partnerships.",
  note: "This is a demo form. Wire it to your backend or CRM later.",
  emailLabel: "Email:",
  email: "partners@dailyhnt.demo",
  responseTimeLabel: "Response time:",
  responseTime: "within 24–48 hours",
  submitLabel: "Send message",
  finePrint: "By submitting, you agree to the demo terms. (No network requests are made.)",
  fields: DEFAULT_CONTACT_FIELDS,
};

/**
 * The lead writer only ever sends name/email/message (firestore.rules enforces
 * exactly that), so a field whose `name` is anything else will render but will
 * never be stored on the lead.
 */
export const LEAD_FIELD_NAMES = ["name", "email", "message"];

export const CONTACT_FIELD_TYPES = ["text", "email", "tel", "textarea"];

export const EMPTY_CONTACT_FIELD = {
  name: "",
  label: "",
  placeholder: "",
  type: "text",
  required: true,
  order: 0,
  active: true,
};

const cleanText = (value = "") => String(value).trim();

export function normalizeContactFields(fields) {
  return (Array.isArray(fields) ? fields : [])
    .map((field, index) => ({
      name: cleanText(field?.name),
      label: cleanText(field?.label),
      placeholder: cleanText(field?.placeholder),
      type: CONTACT_FIELD_TYPES.includes(field?.type) ? field.type : "text",
      required: field?.required !== false,
      order: Number(field?.order ?? index) || 0,
      active: field?.active !== false,
    }))
    .filter((field) => field.name);
}

const settingsService = createSingletonDocService(CONTACT_SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = settingsService.subscribe;

export function saveContactSettings(payload) {
  return settingsService.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    note: cleanText(payload.note),
    emailLabel: cleanText(payload.emailLabel),
    email: cleanText(payload.email),
    responseTimeLabel: cleanText(payload.responseTimeLabel),
    responseTime: cleanText(payload.responseTime),
    submitLabel: cleanText(payload.submitLabel),
    finePrint: cleanText(payload.finePrint),
    fields: normalizeContactFields(payload.fields),
  });
}
