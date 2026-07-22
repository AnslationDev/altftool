import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createCollectionCrudService } from "@/lib/firestoreCrud";

const PROJECT_ID = "samvatsara";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
// Leads / newsletter carry no manual `order` — order by createdAt instead.
const CONTACT_LEADS_PATH = ["projects", PROJECT_ID, "contactLeads"];
const NEWSLETTER_PATH = ["projects", PROJECT_ID, "newsletterEmails"];

export const LEAD_STATUSES = ["new", "contacted", "closed"];

export const DEFAULT_CONTACT_SETTINGS = {
  badge: "Let's talk",
  headingLead: "Tell us what you're",
  headingItalic: "building.",
  subcopy:
    "No forms that vanish into a void. We read every note ourselves and reply within one business day — promise.",
  office: {
    name: "Samavatsara",
    addressLine1: "118 Hazel Court, Studio 3B",
    addressLine2: "Asheville, NC 28801",
    mapEmbedPlaceholder: "Map embed placeholder — replace with your Google Maps embed URL",
  },
  phone: "+1 (828) 555-0142",
  email: "hello@aureliastudio.com",
  businessHours: [
    { days: "Monday – Thursday", hours: "9:00 AM – 6:00 PM EST" },
    { days: "Friday", hours: "9:00 AM – 3:00 PM EST" },
    { days: "Saturday – Sunday", hours: "Closed" },
  ],
  social: {
    instagram: "https://instagram.com/aureliastudio",
    linkedin: "https://linkedin.com/company/aureliastudio",
    twitter: "https://twitter.com/aureliastudio",
    dribbble: "https://dribbble.com/aureliastudio",
    pinterest: "https://pinterest.com/aureliastudio",
  },
  budgetRanges: ["Under $10k", "$10k – $25k", "$25k – $50k", "$50k+", "Not sure yet"],
  projectTypes: [
    "Website Design & Development",
    "Mobile App Development",
    "SEO",
    "Email Marketing",
    "Social Media Marketing",
    "Custom Web Application",
    "WordPress Website",
    "UI/UX Design",
    "Something else",
  ],
  hqHeading: "Studio HQ",
  hoursHeading: "Business Hours",
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

/* ------------------------------- settings -------------------------------- */

export function subscribeContactSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SETTINGS_PATH),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onNext({
        ...DEFAULT_CONTACT_SETTINGS,
        ...data,
        office: { ...DEFAULT_CONTACT_SETTINGS.office, ...(data.office || {}) },
        social: { ...DEFAULT_CONTACT_SETTINGS.social, ...(data.social || {}) },
        businessHours: Array.isArray(data.businessHours) ? data.businessHours : DEFAULT_CONTACT_SETTINGS.businessHours,
        budgetRanges: Array.isArray(data.budgetRanges) ? data.budgetRanges : DEFAULT_CONTACT_SETTINGS.budgetRanges,
        projectTypes: Array.isArray(data.projectTypes) ? data.projectTypes : DEFAULT_CONTACT_SETTINGS.projectTypes,
      });
    },
    onError,
  );
}

export async function saveContactSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      badge: String(payload.badge || "").trim(),
      headingLead: String(payload.headingLead || "").trim(),
      headingItalic: String(payload.headingItalic || "").trim(),
      subcopy: String(payload.subcopy || "").trim(),
      office: {
        name: String(payload.office?.name || "").trim(),
        addressLine1: String(payload.office?.addressLine1 || "").trim(),
        addressLine2: String(payload.office?.addressLine2 || "").trim(),
        mapEmbedPlaceholder: String(payload.office?.mapEmbedPlaceholder || "").trim(),
      },
      phone: String(payload.phone || "").trim(),
      email: String(payload.email || "").trim(),
      businessHours: (Array.isArray(payload.businessHours) ? payload.businessHours : [])
        .map((item) => ({
          days: String(item?.days || "").trim(),
          hours: String(item?.hours || "").trim(),
        }))
        .filter((item) => item.days || item.hours),
      social: {
        instagram: String(payload.social?.instagram || "").trim(),
        linkedin: String(payload.social?.linkedin || "").trim(),
        twitter: String(payload.social?.twitter || "").trim(),
        dribbble: String(payload.social?.dribbble || "").trim(),
        pinterest: String(payload.social?.pinterest || "").trim(),
      },
      budgetRanges: cleanLines(payload.budgetRanges),
      projectTypes: cleanLines(payload.projectTypes),
      hqHeading: String(payload.hqHeading || "").trim(),
      hoursHeading: String(payload.hoursHeading || "").trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
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
