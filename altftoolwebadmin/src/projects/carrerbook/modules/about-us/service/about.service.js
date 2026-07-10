import {
  addDoc,
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
const SECTION_PATH = (key) => ["projects", PROJECT_ID, "about-us", key];
const LEAD_CARDS_PATH = ["projects", PROJECT_ID, "about-us", "lead-section", "cards"];

export const ABOUT_SECTIONS = [
  {
    key: "hero-section",
    label: "Hero Section",
    description: "Manage the About Us banner, copy, background image, and status.",
  },
  {
    key: "lead-section",
    label: "Lead Section",
    description: "Manage the quality leads section and unlimited lead cards.",
  },
];

export const DEFAULT_ABOUT_SECTIONS = {
  "hero-section": {
    active: true,
    smallLabel: "Choose CareerBook",
    heading: "For Quality & Growth",
    description:
      "CareerBook is a India-based lead generation company specializing in high-quality leads for personal loans, payday loans, debt consolidation, auto loans, and more. Our affiliate program offers substantial rewards for publishers.",
    imageUrl: "",
    imagePath: "",
  },
  "lead-section": {
    active: true,
    title: "Welcome to the World of Quality Leads",
    description: "",
  },
};

export function subscribeAboutSection(key, onNext, onError) {
  return onSnapshot(
    doc(db, ...SECTION_PATH(key)),
    (snap) => onNext({ ...DEFAULT_ABOUT_SECTIONS[key], ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveAboutSection(key, payload) {
  await setDoc(
    doc(db, ...SECTION_PATH(key)),
    {
      ...payload,
      active: payload.active !== false,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function resetAboutSection(key) {
  await setDoc(
    doc(db, ...SECTION_PATH(key)),
    { ...DEFAULT_ABOUT_SECTIONS[key], updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export function uploadAboutImage({ file, sectionKey, folder = "images", onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/about-us/${sectionKey}/${folder}-${Date.now()}.${ext}`;
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

export async function deleteAboutImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

export function subscribeLeadCards(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...LEAD_CARDS_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createLeadCard(payload) {
  await addDoc(collection(db, ...LEAD_CARDS_PATH), {
    ...normalizeLeadCard(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateLeadCard(id, payload) {
  await updateDoc(doc(db, ...LEAD_CARDS_PATH, id), {
    ...normalizeLeadCard(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLeadCard(id) {
  await deleteDoc(doc(db, ...LEAD_CARDS_PATH, id));
}

export async function toggleLeadCardStatus(id, active) {
  await updateDoc(doc(db, ...LEAD_CARDS_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export async function duplicateLeadCard(card) {
  await addDoc(collection(db, ...LEAD_CARDS_PATH), {
    ...normalizeLeadCard({
      ...card,
      title: `${card.title || "Lead Card"} Copy`,
      order: Number(card.order || 0) + 1,
    }),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function normalizeLeadCard(payload) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
