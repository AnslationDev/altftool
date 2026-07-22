import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "dealnbook";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];

export const DEFAULT_CONTACT_SETTINGS = {
  heroHeadline: "Get In Touch",
  heroSubcopy: "Have a question about a deal or booking? Reach out and we'll get back to you within one business day.",
  officeName: "Dealnbook HQ",
  addressLines: [],
  phone: "",
  email: "hello@dealnbook.com",
  businessHours: [{ days: "Monday – Friday", hours: "9:00 AM – 6:00 PM EST" }],
  mapEmbedPlaceholder: "",
  social: {
    instagram: "",
    linkedin: "",
    twitter: "",
    behance: "",
  },
  departments: [],
};

function cleanLines(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanBusinessHours(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      days: String(item?.days || "").trim(),
      hours: String(item?.hours || "").trim(),
    }))
    .filter((item) => item.days || item.hours);
}

function cleanDepartments(list) {
  return (Array.isArray(list) ? list : [])
    .map((item) => ({
      label: String(item?.label || "").trim(),
      email: String(item?.email || "").trim(),
    }))
    .filter((item) => item.label || item.email);
}

const service = createSingletonDocService(SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = service.subscribe;

export function saveContactSettings(payload) {
  return service.save({
    heroHeadline: String(payload.heroHeadline || "").trim(),
    heroSubcopy: String(payload.heroSubcopy || "").trim(),
    officeName: String(payload.officeName || "").trim(),
    addressLines: cleanLines(payload.addressLines),
    phone: String(payload.phone || "").trim(),
    email: String(payload.email || "").trim(),
    businessHours: cleanBusinessHours(payload.businessHours),
    mapEmbedPlaceholder: String(payload.mapEmbedPlaceholder || "").trim(),
    social: {
      instagram: String(payload.social?.instagram || "").trim(),
      linkedin: String(payload.social?.linkedin || "").trim(),
      twitter: String(payload.social?.twitter || "").trim(),
      behance: String(payload.social?.behance || "").trim(),
    },
    departments: cleanDepartments(payload.departments),
  });
}
