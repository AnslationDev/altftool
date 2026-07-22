import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "infovasta";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
const PAGE_PATH = ["projects", PROJECT_ID, "pages", "contact"];
// Leads / newsletter carry no manual `order` — order by createdAt instead.
const CONTACT_LEADS_PATH = ["projects", PROJECT_ID, "contactLeads"];
const NEWSLETTER_PATH = ["projects", PROJECT_ID, "newsletterEmails"];

export const LEAD_STATUSES = ["new", "contacted", "closed"];

/* ------------------------------- settings --------------------------------- */

export const DEFAULT_CONTACT_SETTINGS = {
  address: "221B Baker Street, London, UK",
  phone: "+1 (555) 012-3456",
  email: "hello@infovsta.com",
  hours: "Mon – Fri, 9:00 AM – 6:00 PM",
  mapQuery: "221B Baker Street, London, UK",
  socials: [
    { icon: "logo-facebook", href: "#" },
    { icon: "logo-twitter", href: "#" },
    { icon: "logo-linkedin", href: "#" },
    { icon: "logo-instagram", href: "#" },
  ],
  formLabels: {
    name: "Your name",
    email: "Your email",
    subject: "Subject",
    message: "Your message",
    submitLabel: "Send Message",
    successHeading: "Message sent",
    successBody: "Thanks for reaching out — our team will get back to you shortly.",
  },
};

function normalizeSettings(payload) {
  return {
    address: String(payload.address || "").trim(),
    phone: String(payload.phone || "").trim(),
    email: String(payload.email || "").trim(),
    hours: String(payload.hours || "").trim(),
    mapQuery: String(payload.mapQuery || "").trim(),
    socials: (Array.isArray(payload.socials) ? payload.socials : [])
      .map((item) => ({
        icon: String(item?.icon || "").trim(),
        href: String(item?.href || "").trim(),
      }))
      .filter((item) => item.icon || item.href),
    formLabels: {
      name: String(payload.formLabels?.name || "").trim(),
      email: String(payload.formLabels?.email || "").trim(),
      subject: String(payload.formLabels?.subject || "").trim(),
      message: String(payload.formLabels?.message || "").trim(),
      submitLabel: String(payload.formLabels?.submitLabel || "").trim(),
      successHeading: String(payload.formLabels?.successHeading || "").trim(),
      successBody: String(payload.formLabels?.successBody || "").trim(),
    },
  };
}

const settings = createSingletonDocService(SETTINGS_PATH, DEFAULT_CONTACT_SETTINGS);
export function subscribeContactSettings(onNext, onError) {
  return settings.subscribe((data) => {
    onNext({
      ...DEFAULT_CONTACT_SETTINGS,
      ...data,
      socials: Array.isArray(data.socials) ? data.socials : DEFAULT_CONTACT_SETTINGS.socials,
      formLabels: { ...DEFAULT_CONTACT_SETTINGS.formLabels, ...(data.formLabels || {}) },
    });
  }, onError);
}
export async function saveContactSettings(payload) {
  await settings.save(normalizeSettings(payload));
}

/* ------------------------------ page content ------------------------------- */

export const DEFAULT_CONTACT_PAGE = {
  meta: { title: "Contact Us", description: "" },
  hero: { eyebrow: "Contact Us", title: "Let's talk about your", highlight: "next project", description: "" },
  infoLabels: { address: "Address", phone: "Phone", email: "Email", hours: "Working hours" },
  mapTitle: "",
};

function normalizePage(payload) {
  return {
    meta: {
      title: String(payload.meta?.title || "").trim(),
      description: String(payload.meta?.description || "").trim(),
    },
    hero: {
      eyebrow: String(payload.hero?.eyebrow || "").trim(),
      title: String(payload.hero?.title || "").trim(),
      highlight: String(payload.hero?.highlight || "").trim(),
      description: String(payload.hero?.description || "").trim(),
    },
    infoLabels: {
      address: String(payload.infoLabels?.address || "").trim(),
      phone: String(payload.infoLabels?.phone || "").trim(),
      email: String(payload.infoLabels?.email || "").trim(),
      hours: String(payload.infoLabels?.hours || "").trim(),
    },
    mapTitle: String(payload.mapTitle || "").trim(),
  };
}

const page = createSingletonDocService(PAGE_PATH, DEFAULT_CONTACT_PAGE);
export const subscribeContactPage = page.subscribe;
export async function saveContactPage(payload) {
  await page.save(normalizePage(payload));
}

/* --------------------------------- leads --------------------------------- */
// Read / status-update / delete only — the public site's contact form creates
// these documents. No `create` export here.

const leadsService = createCollectionCrudService(CONTACT_LEADS_PATH, { orderByField: "createdAt" });

export const subscribeContactLeads = leadsService.subscribe;
export const deleteContactLead = leadsService.remove;

export async function updateLeadStatus(id, status) {
  await leadsService.update(id, { status });
}

/* ----------------------------- newsletter -------------------------------- */
// Read / delete only — the public site captures the emails.

const newsletterService = createCollectionCrudService(NEWSLETTER_PATH, { orderByField: "createdAt" });

export const subscribeNewsletterEmails = newsletterService.subscribe;
export const deleteNewsletterEmail = newsletterService.remove;
