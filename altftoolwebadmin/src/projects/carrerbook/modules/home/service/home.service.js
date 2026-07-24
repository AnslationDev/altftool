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
import { db } from "@/lib/firebaseFirestore";
import { storage } from "@/lib/firebaseStorage";

const PROJECT_ID = "carrerbook";
const SECTION_PATH = (key) => ["projects", PROJECT_ID, "homesection", key];
const SERVICES_COLLECTION_PATH = ["projects", PROJECT_ID, "homesection", "our-service", "services"];
const WHY_FEATURES_COLLECTION_PATH = ["projects", PROJECT_ID, "homesection", "why-choose", "features"];
const FAQ_COLLECTION_PATH = ["projects", PROJECT_ID, "homesection", "faq", "faqs"];
const STRENGTH_CARDS_COLLECTION_PATH = ["projects", PROJECT_ID, "homesection", "our-strenght", "cards"];
const MARKETING_COLLECTION_PATH = (tableKey) => ["projects", PROJECT_ID, "homesection", "marketing", tableKey];

export const HOME_TABS = [
  { key: "hero", label: "Hero Section" },
  { key: "our-service", label: "Our Service" },
  { key: "why-choose", label: "Why Choose Us" },
  { key: "our-strenght", label: "Our Strength" },
  { key: "faq", label: "FAQ" },
  { key: "marketing", label: "Marketing" },
];

export const DEFAULT_HOME_SECTIONS = {
  hero: {
    active: true,
    headingLine1: "Pay Only for Results.",
    headingLine2: "Reach New Customers.",
    headingLine3: "Increase Sales.",
    highlightWords: "Results,Customers,Sales",
    subtitle: "The Performance Marketing Platform You Can Trust",
    button1Text: "Why Us?",
    button1Link: "/carrerbook#why-us",
    button2Text: "Contact Us",
    button2Link: "/carrerbook/contact-us",
    imageUrl: "",
    imagePath: "",
    socialLinks: [
      { platform: "youtube", url: "#", color: "#8dcc3f" },
      { platform: "facebook", url: "#", color: "#19b8c8" },
      { platform: "instagram", url: "#", color: "#27920f" },
      { platform: "twitter", url: "#", color: "#218bc1" },
    ],
  },
  "our-service": {
    active: true,
    label: "OUR SERVICES",
    heading: "we do everything.",
    description:
      "Our dedicated team represents some of the top leaders in the online marketing space. We offer cutting-edge marketing strategies that produce high-performing leads for our advertisers' campaigns.",
  },
  "why-choose": {
    active: true,
    label: "A FEW WORDS",
    heading: "Why Choose Us",
    description: "Transparent performance, reliable tracking, and campaigns that scale with modern digital execution.",
    image1Url: "",
    image1Path: "",
    image2Url: "",
    image2Path: "",
    image3Url: "",
    image3Path: "",
  },
  "our-strenght": {
    active: true,
    label: "OUR STRENGTH",
    title: "Our Strength",
  },
  faq: {
    active: true,
    label: "FAQ",
    title: "Here you can find Frequently Asked Questions.",
  },
  marketing: {
    active: true,
    title: "Marketing",
  },
};

export function subscribeHomeSection(key, onNext, onError) {
  return onSnapshot(
    doc(db, ...SECTION_PATH(key)),
    (snap) => onNext({ ...DEFAULT_HOME_SECTIONS[key], ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveHomeSection(key, payload) {
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

export async function resetHomeSection(key) {
  await setDoc(
    doc(db, ...SECTION_PATH(key)),
    { ...DEFAULT_HOME_SECTIONS[key], updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export function uploadHomeImage({ file, sectionKey, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/home/${sectionKey}-${Date.now()}.${ext}`;
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

export async function deleteHomeImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

export function subscribeHomeServices(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...SERVICES_COLLECTION_PATH), orderBy("order", "asc")),
    (snap) => {
      onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    },
    onError,
  );
}

export async function createHomeService(payload) {
  await addDoc(collection(db, ...SERVICES_COLLECTION_PATH), {
    ...normalizeServicePayload(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateHomeService(id, payload) {
  await updateDoc(doc(db, ...SERVICES_COLLECTION_PATH, id), {
    ...normalizeServicePayload(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteHomeService(id) {
  await deleteDoc(doc(db, ...SERVICES_COLLECTION_PATH, id));
}

export async function toggleHomeServiceStatus(id, active) {
  await updateDoc(doc(db, ...SERVICES_COLLECTION_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export function uploadHomeServiceIcon({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/home/services/service-${Date.now()}.${ext}`;
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

function normalizeServicePayload(payload) {
  return {
    title: String(payload.title || "").trim(),
    link: String(payload.link || "#").trim() || "#",
    iconUrl: payload.iconUrl || "",
    iconPath: payload.iconPath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

export function subscribeWhyChooseFeatures(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...WHY_FEATURES_COLLECTION_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createWhyChooseFeature(payload) {
  await addDoc(collection(db, ...WHY_FEATURES_COLLECTION_PATH), {
    ...normalizeWhyFeaturePayload(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateWhyChooseFeature(id, payload) {
  await updateDoc(doc(db, ...WHY_FEATURES_COLLECTION_PATH, id), {
    ...normalizeWhyFeaturePayload(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWhyChooseFeature(id) {
  await deleteDoc(doc(db, ...WHY_FEATURES_COLLECTION_PATH, id));
}

export async function toggleWhyChooseFeatureStatus(id, active) {
  await updateDoc(doc(db, ...WHY_FEATURES_COLLECTION_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export function uploadWhyChooseFeatureIcon({ file, onProgress }) {
  return uploadNestedHomeAsset({ file, pathPrefix: "why-choose/features", onProgress });
}

export function uploadWhyChooseImage({ file, slot, onProgress }) {
  return uploadNestedHomeAsset({ file, pathPrefix: `why-choose/images/${slot}`, onProgress });
}

function uploadNestedHomeAsset({ file, pathPrefix, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/home/${pathPrefix}-${Date.now()}.${ext}`;
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

function normalizeWhyFeaturePayload(payload) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    iconUrl: payload.iconUrl || "",
    iconPath: payload.iconPath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

export function subscribeFaqItems(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...FAQ_COLLECTION_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createFaqItem(payload) {
  await addDoc(collection(db, ...FAQ_COLLECTION_PATH), {
    ...normalizeFaqPayload(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateFaqItem(id, payload) {
  await updateDoc(doc(db, ...FAQ_COLLECTION_PATH, id), {
    ...normalizeFaqPayload(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFaqItem(id) {
  await deleteDoc(doc(db, ...FAQ_COLLECTION_PATH, id));
}

export async function toggleFaqItemStatus(id, active) {
  await updateDoc(doc(db, ...FAQ_COLLECTION_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

function normalizeFaqPayload(payload) {
  return {
    question: String(payload.question || "").trim(),
    answer: String(payload.answer || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

export function subscribeStrengthCards(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...STRENGTH_CARDS_COLLECTION_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createStrengthCard(payload) {
  await addDoc(collection(db, ...STRENGTH_CARDS_COLLECTION_PATH), {
    ...normalizeStrengthCardPayload(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateStrengthCard(id, payload) {
  await updateDoc(doc(db, ...STRENGTH_CARDS_COLLECTION_PATH, id), {
    ...normalizeStrengthCardPayload(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStrengthCard(id) {
  await deleteDoc(doc(db, ...STRENGTH_CARDS_COLLECTION_PATH, id));
}

export async function toggleStrengthCardStatus(id, active) {
  await updateDoc(doc(db, ...STRENGTH_CARDS_COLLECTION_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export function uploadStrengthCardImage({ file, onProgress }) {
  return uploadNestedHomeAsset({ file, pathPrefix: "our-strenght/cards", onProgress });
}

function normalizeStrengthCardPayload(payload) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    buttonLabel: String(payload.buttonLabel || "").trim(),
    buttonLink: String(payload.buttonLink || "").trim(),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

export function subscribeMarketingRows(tableKey, onNext, onError) {
  return onSnapshot(
    query(collection(db, ...MARKETING_COLLECTION_PATH(tableKey)), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createMarketingRow(tableKey, payload) {
  await addDoc(collection(db, ...MARKETING_COLLECTION_PATH(tableKey)), {
    ...normalizeMarketingRowPayload(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMarketingRow(tableKey, id, payload) {
  await updateDoc(doc(db, ...MARKETING_COLLECTION_PATH(tableKey), id), {
    ...normalizeMarketingRowPayload(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMarketingRow(tableKey, id) {
  await deleteDoc(doc(db, ...MARKETING_COLLECTION_PATH(tableKey), id));
}

export async function toggleMarketingRowStatus(tableKey, id, active) {
  await updateDoc(doc(db, ...MARKETING_COLLECTION_PATH(tableKey), id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export function uploadMarketingColumnImage({ tableKey, file, onProgress }) {
  return uploadNestedHomeAsset({ file, pathPrefix: `marketing/${tableKey}`, onProgress });
}

function normalizeMarketingRowPayload(payload) {
  return {
    title: String(payload.title || "").trim(),
    columns: Array.isArray(payload.columns)
      ? payload.columns.map((column, index) => ({
          id: column.id || `column-${index + 1}`,
          type: column.type === "image" ? "image" : "text",
          text: String(column.text || "").trim(),
          imageUrl: column.imageUrl || "",
          imagePath: column.imagePath || "",
        }))
      : [],
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
