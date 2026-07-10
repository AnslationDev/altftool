import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";

const PROJECT_ID = "carrerbook";
const SETTINGS_PATH = ["projects", PROJECT_ID, "contact", "settings"];
const LEADS_PATH = ["projects", PROJECT_ID, "contact", "settings", "submissions"];

export const DEFAULT_CONTACT = {
  active: true,
  title: "Get In Touch",
  submitText: "Submit",
  autoReplyEnabled: true,
  greetingEmailSubject: "Thanks for contacting CareerBook, {{name}}",
  greetingEmailTemplate:
    "Hi {{name}},\n\nThanks for reaching out to CareerBook. We have received your message and our team will get back to you shortly.\n\nBest regards,\nCareerBook Team",
  adminNotificationEmail: "moreply@gmail.com",
  successMessage: "Thanks! Your message has been received. Our team will contact you soon.",
  placeholders: {
    name: "Name",
    email: "Email",
    website: "Your Website",
    skypeId: "Skype ID",
    companyName: "Company Name",
    queryType: "Nature of Query",
    message: "Type your message",
  },
  queryOptions: ["General Inquiry", "Advertiser", "Publisher", "Partnership", "Support"],
  addressTitle: "Our Address",
  addressText: "Level 13, 2 colony road name\nBangalore, India",
  hoursTitle: "Open Hours",
  hoursText: "Monday - Saturday\n08:00 AM - 10:00 PM",
  emailText: "moreply@gmail.com",
  socialLinks: [
    { platform: "youtube", url: "#", color: "#8dcc3f" },
    { platform: "facebook", url: "#", color: "#31b7dd" },
    { platform: "instagram", url: "#", color: "#3d970f" },
    { platform: "twitter", url: "#", color: "#2f95d0" },
  ],
  gradientFrom: "#512cac",
  gradientTo: "#050505",
  cardColor: "#171719",
  panelColor: "#171717",
};

export function subscribeContactSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SETTINGS_PATH),
    (snap) => onNext({ ...DEFAULT_CONTACT, ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export function subscribeContactLeads(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...LEADS_PATH), orderBy("createdAt", "desc")),
    (snap) => onNext(snap.docs.map((lead) => ({ id: lead.id, ...lead.data() }))),
    onError,
  );
}

export async function saveContactSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      ...payload,
      title: clean(payload.title),
      submitText: clean(payload.submitText),
      autoReplyEnabled: payload.autoReplyEnabled !== false,
      greetingEmailSubject: clean(payload.greetingEmailSubject),
      greetingEmailTemplate: clean(payload.greetingEmailTemplate),
      adminNotificationEmail: clean(payload.adminNotificationEmail),
      successMessage: clean(payload.successMessage),
      addressTitle: clean(payload.addressTitle),
      addressText: clean(payload.addressText),
      hoursTitle: clean(payload.hoursTitle),
      hoursText: clean(payload.hoursText),
      emailText: clean(payload.emailText),
      queryOptions: Array.isArray(payload.queryOptions)
        ? payload.queryOptions.map(clean).filter(Boolean)
        : [],
      socialLinks: Array.isArray(payload.socialLinks) ? payload.socialLinks : [],
      active: payload.active !== false,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function resetContactSettings() {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    { ...DEFAULT_CONTACT, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function updateContactLeadStatus(id, status) {
  await updateDoc(doc(db, ...LEADS_PATH, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateContactLeadMeta(id, payload) {
  await updateDoc(doc(db, ...LEADS_PATH, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteContactLead(id) {
  await deleteDoc(doc(db, ...LEADS_PATH, id));
}

export function uploadContactAsset({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/contact/contact-asset-${Date.now()}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve({ url: await getDownloadURL(task.snapshot.ref), path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export async function deleteContactAsset(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

function clean(value = "") {
  return String(value).trim();
}
