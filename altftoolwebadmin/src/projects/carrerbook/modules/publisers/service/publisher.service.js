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
const SECTION_PATH = (key) => ["projects", PROJECT_ID, "publisher", key];
const WHY_CARDS_PATH = ["projects", PROJECT_ID, "publisher", "whychoose-carrerbook", "cards"];

export const PUBLISHER_TABS = [
  { key: "hero-section", label: "Publisher Hero" },
  { key: "whychoose-carrerbook", label: "Why CareerBook" },
];

export const DEFAULT_PUBLISHER_SECTIONS = {
  "hero-section": {
    active: true,
    headingPrefix: "Promote with",
    highlightWords: "CPL Model",
    description:
      "CareerBook offers you new revenue streams and increases your earnings with our top-performing affiliate program.",
    buttonText: "Let's get started",
    buttonLink: "/carrerbook/publisers#start",
    imageUrl: "",
    imagePath: "",
  },
  "whychoose-carrerbook": {
    active: true,
    titlePrefix: "Why",
    highlightedTitle: "CareerBook",
    titleSuffix: "Is Publisher's No. 1 Choice",
  },
};

export function subscribePublisherSection(key, onNext, onError) {
  return onSnapshot(
    doc(db, ...SECTION_PATH(key)),
    (snap) => onNext({ ...DEFAULT_PUBLISHER_SECTIONS[key], ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function savePublisherSection(key, payload) {
  await setDoc(
    doc(db, ...SECTION_PATH(key)),
    { ...payload, active: payload.active !== false, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function resetPublisherSection(key) {
  await setDoc(
    doc(db, ...SECTION_PATH(key)),
    { ...DEFAULT_PUBLISHER_SECTIONS[key], updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export function uploadPublisherImage({ file, sectionKey, folder = "images", onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/publisher/${sectionKey}/${folder}-${Date.now()}.${ext}`;
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

export async function deletePublisherImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

export function subscribeWhyCareerBookCards(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...WHY_CARDS_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createWhyCareerBookCard(payload) {
  await addDoc(collection(db, ...WHY_CARDS_PATH), {
    ...normalizeWhyCard(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateWhyCareerBookCard(id, payload) {
  await updateDoc(doc(db, ...WHY_CARDS_PATH, id), {
    ...normalizeWhyCard(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWhyCareerBookCard(id) {
  await deleteDoc(doc(db, ...WHY_CARDS_PATH, id));
}

export async function toggleWhyCareerBookCardStatus(id, active) {
  await updateDoc(doc(db, ...WHY_CARDS_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

function normalizeWhyCard(payload) {
  return {
    title: String(payload.title || "").trim(),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
