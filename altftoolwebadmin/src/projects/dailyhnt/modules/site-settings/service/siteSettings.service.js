import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "dailyhnt";
const SITE_PATH = ["projects", PROJECT_ID, "settings", "site"];

export const DEFAULT_SITE_SETTINGS = {
  name: "",
  logoText: "",
  logoShort: "",
  tagline: "",
  description: "",
  url: "",
  contactEmail: "",
  contactPhone: "",
  social: { twitter: "", github: "", linkedin: "", dribbble: "" },
  seo: { titleTemplate: "", defaultTitle: "", description: "", keywords: [] },
};

export function subscribeSiteSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SITE_PATH),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onNext({
        ...DEFAULT_SITE_SETTINGS,
        ...data,
        social: { ...DEFAULT_SITE_SETTINGS.social, ...(data.social || {}) },
        seo: {
          ...DEFAULT_SITE_SETTINGS.seo,
          ...(data.seo || {}),
          keywords: Array.isArray(data.seo?.keywords) ? data.seo.keywords : [],
        },
      });
    },
    onError,
  );
}

export async function saveSiteSettings(payload) {
  await setDoc(
    doc(db, ...SITE_PATH),
    {
      name: String(payload.name || "").trim(),
      logoText: String(payload.logoText || "").trim(),
      logoShort: String(payload.logoShort || "").trim(),
      tagline: String(payload.tagline || "").trim(),
      description: String(payload.description || "").trim(),
      url: String(payload.url || "").trim(),
      contactEmail: String(payload.contactEmail || "").trim(),
      contactPhone: String(payload.contactPhone || "").trim(),
      social: {
        twitter: String(payload.social?.twitter || "").trim(),
        github: String(payload.social?.github || "").trim(),
        linkedin: String(payload.social?.linkedin || "").trim(),
        dribbble: String(payload.social?.dribbble || "").trim(),
      },
      seo: {
        titleTemplate: String(payload.seo?.titleTemplate || "").trim(),
        defaultTitle: String(payload.seo?.defaultTitle || "").trim(),
        description: String(payload.seo?.description || "").trim(),
        keywords: normalizeKeywords(payload.seo?.keywords),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) {
    return keywords.map((word) => String(word).trim()).filter(Boolean);
  }
  return String(keywords || "")
    .split(/[\n,]/)
    .map((word) => word.trim())
    .filter(Boolean);
}
