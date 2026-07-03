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
const SECTION_PATH = (key) => ["projects", PROJECT_ID, "advertiser", key];
const TRAFFIC_CARDS_PATH = ["projects", PROJECT_ID, "advertiser", "traffic-types", "cards"];

export const ADVERTISER_SECTIONS = [
  {
    key: "hero-section",
    label: "Hero Section",
    description: "Manage the advertiser hero banner, CTA, and status.",
  },
  {
    key: "traffic-types",
    label: "Traffic Type",
    description: "Manage traffic type heading and unlimited traffic cards.",
  },
];

export const DEFAULT_ADVERTISER_SECTIONS = {
  "hero-section": {
    active: true,
    heading: "Advertisers",
    description: "Brand-safe access to every form of digital media",
    buttonText: "Let's get started",
    buttonLink: "/carrerbook/contact-us",
    imageUrl: "",
    imagePath: "",
  },
  "traffic-types": {
    active: true,
    title: "Traffic Types",
    subtitle: "Connect with us",
    description: "",
  },
};

export function subscribeAdvertiserSection(key, onNext, onError) {
  return onSnapshot(
    doc(db, ...SECTION_PATH(key)),
    (snap) => onNext({ ...DEFAULT_ADVERTISER_SECTIONS[key], ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveAdvertiserSection(key, payload) {
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

export async function resetAdvertiserSection(key) {
  await setDoc(
    doc(db, ...SECTION_PATH(key)),
    { ...DEFAULT_ADVERTISER_SECTIONS[key], updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export function uploadAdvertiserImage({ file, sectionKey, folder = "images", onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/advertiser/${sectionKey}/${folder}-${Date.now()}.${ext}`;
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

export async function deleteAdvertiserImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

export function subscribeTrafficCards(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...TRAFFIC_CARDS_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createTrafficCard(payload) {
  await addDoc(collection(db, ...TRAFFIC_CARDS_PATH), {
    ...normalizeTrafficCard(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTrafficCard(id, payload) {
  await updateDoc(doc(db, ...TRAFFIC_CARDS_PATH, id), {
    ...normalizeTrafficCard(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTrafficCard(id) {
  await deleteDoc(doc(db, ...TRAFFIC_CARDS_PATH, id));
}

export async function toggleTrafficCardStatus(id, active) {
  await updateDoc(doc(db, ...TRAFFIC_CARDS_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

function normalizeTrafficCard(payload) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
