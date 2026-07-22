import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "exclusinsider";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
const OFFICES_PATH = ["projects", PROJECT_ID, "contactOffices"];

export const DEFAULT_CONTACT_SETTINGS = {
  eyebrow: "Application For Access",
  heading: "Tell Us About Your Brand",
  subcopy:
    "There's no application fee and no obligation. We read every submission personally and respond within three business days — with an honest answer either way.",
  nameLabel: "Full Name",
  emailLabel: "Work Email",
  companyLabel: "Company",
  budgetLabel: "Estimated Monthly Budget",
  budgetOptions: ["Under $5,000", "$5,000 – $15,000", "$15,000 – $40,000", "$40,000+"],
  serviceLabel: "Primary Interest",
  messageLabel: "Tell Us About Your Goals",
  directLineHeading: "Prefer A Direct Line?",
  directLineBody: "Serious inquiries only. We keep this line quiet on purpose.",
};

const cleanText = (value = "") => String(value ?? "").trim();

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const settingsService = createSingletonDocService(SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = settingsService.subscribe;

export function saveContactSettings(payload) {
  return settingsService.save({
    eyebrow: cleanText(payload.eyebrow),
    heading: cleanText(payload.heading),
    subcopy: cleanText(payload.subcopy),
    nameLabel: cleanText(payload.nameLabel),
    emailLabel: cleanText(payload.emailLabel),
    companyLabel: cleanText(payload.companyLabel),
    budgetLabel: cleanText(payload.budgetLabel),
    budgetOptions: cleanLines(payload.budgetOptions),
    serviceLabel: cleanText(payload.serviceLabel),
    messageLabel: cleanText(payload.messageLabel),
    directLineHeading: cleanText(payload.directLineHeading),
    directLineBody: cleanText(payload.directLineBody),
  });
}

function normalizeOffice(payload) {
  return {
    city: cleanText(payload.city),
    address: cleanText(payload.address),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

const officesService = createCollectionCrudService(OFFICES_PATH, {
  normalize: normalizeOffice,
  orderByField: "order",
});

export const subscribeContactOffices = officesService.subscribe;
export const createContactOffice = officesService.create;
export const updateContactOffice = officesService.update;
export const deleteContactOffice = officesService.remove;
export const toggleContactOfficeStatus = officesService.toggleActive;
