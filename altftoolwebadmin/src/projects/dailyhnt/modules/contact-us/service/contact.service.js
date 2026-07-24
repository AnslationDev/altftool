import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "dailyhnt";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];

export const DEFAULT_CONTACT_SETTINGS = {
  office: { name: "", addressLines: [] },
  phone: "",
  email: "",
  supportEmail: "",
  businessHours: [],
  mapEmbedPlaceholder: "",
  social: { twitter: "", github: "", linkedin: "", dribbble: "" },
  responseTime: "",
  departments: [],
};

export function subscribeContactSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SETTINGS_PATH),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onNext({
        ...DEFAULT_CONTACT_SETTINGS,
        ...data,
        office: {
          ...DEFAULT_CONTACT_SETTINGS.office,
          ...(data.office || {}),
          addressLines: Array.isArray(data.office?.addressLines) ? data.office.addressLines : [],
        },
        social: { ...DEFAULT_CONTACT_SETTINGS.social, ...(data.social || {}) },
        businessHours: Array.isArray(data.businessHours) ? data.businessHours : [],
        departments: Array.isArray(data.departments) ? data.departments : [],
      });
    },
    onError,
  );
}

export async function saveContactSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      office: {
        name: String(payload.office?.name || "").trim(),
        addressLines: (Array.isArray(payload.office?.addressLines) ? payload.office.addressLines : [])
          .map((line) => String(line || "").trim())
          .filter(Boolean),
      },
      phone: String(payload.phone || "").trim(),
      email: String(payload.email || "").trim(),
      supportEmail: String(payload.supportEmail || "").trim(),
      businessHours: (Array.isArray(payload.businessHours) ? payload.businessHours : [])
        .map((item) => ({
          days: String(item?.days || "").trim(),
          hours: String(item?.hours || "").trim(),
        }))
        .filter((item) => item.days || item.hours),
      mapEmbedPlaceholder: String(payload.mapEmbedPlaceholder || "").trim(),
      social: {
        twitter: String(payload.social?.twitter || "").trim(),
        github: String(payload.social?.github || "").trim(),
        linkedin: String(payload.social?.linkedin || "").trim(),
        dribbble: String(payload.social?.dribbble || "").trim(),
      },
      responseTime: String(payload.responseTime || "").trim(),
      departments: (Array.isArray(payload.departments) ? payload.departments : [])
        .map((item) => ({
          label: String(item?.label || "").trim(),
          email: String(item?.email || "").trim(),
        }))
        .filter((item) => item.label || item.email),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
