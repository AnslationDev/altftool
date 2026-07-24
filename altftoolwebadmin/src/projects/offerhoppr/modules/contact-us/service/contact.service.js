import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { createCollectionCrudService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerhoppr";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
// Leads / newsletter carry no manual `order` — order by createdAt instead.
const CONTACT_LEADS_PATH = ["projects", PROJECT_ID, "contactLeads"];
const NEWSLETTER_PATH = ["projects", PROJECT_ID, "newsletterEmails"];

export const LEAD_STATUSES = ["new", "contacted", "closed"];

export const DEFAULT_CONTACT_SETTINGS = {
  headline: "What Do You Need Help With?",
  subcopy: "Tell us what's going on and we'll get back to you within one business day.",
  topics: [
    "A coupon code isn't working",
    "Suggest a store or offer",
    "Report a bug",
    "Partnership inquiry",
    "Something else",
  ],
  budgetRanges: ["Not applicable", "Under $1k", "$1k – $10k", "$10k+"],
  officeHours: "Monday – Friday, 9:00 AM – 6:00 PM EST",
  responseTime: "We usually reply within one business day.",
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
        topics: Array.isArray(data.topics) ? data.topics : DEFAULT_CONTACT_SETTINGS.topics,
        budgetRanges: Array.isArray(data.budgetRanges) ? data.budgetRanges : DEFAULT_CONTACT_SETTINGS.budgetRanges,
      });
    },
    onError,
  );
}

export async function saveContactSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      headline: String(payload.headline || "").trim(),
      subcopy: String(payload.subcopy || "").trim(),
      topics: cleanLines(payload.topics),
      budgetRanges: cleanLines(payload.budgetRanges),
      officeHours: String(payload.officeHours || "").trim(),
      responseTime: String(payload.responseTime || "").trim(),
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
