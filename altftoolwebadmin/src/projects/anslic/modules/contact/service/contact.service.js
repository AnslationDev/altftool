import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "anslic";
const CONTACT_SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];

export const DEFAULT_CONTACT_SETTINGS = {
  email: "hello@anslic.com",
  phone: "+1 (555) 014-2098",
  address: "Remote-first agency serving growth teams worldwide",
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "X", href: "https://x.com" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
  pageEyebrow: "Get in touch",
  pageTitle: "Let's build your next growth system",
  pageSubtitle: "Tell us about your goals and we'll follow up within one business day.",
  formNameLabel: "Name",
  formEmailLabel: "Email",
  formPhoneLabel: "Phone",
  formServiceLabel: "Service interested in",
  formMessageLabel: "Message",
  submitButtonText: "Send message",
  successMessage: "Thanks — we'll be in touch soon.",
  seoTitle: "Contact Anslic — Let's Build Your Growth System",
  seoDescription:
    "Reach out to the Anslic team about partnerships, product questions, or new projects. We reply within one business day.",
};

const settingsService = createSingletonDocService(CONTACT_SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);

export const subscribeContactSettings = settingsService.subscribe;
export const saveContactSettings = settingsService.save;
export const resetContactSettings = settingsService.reset;
