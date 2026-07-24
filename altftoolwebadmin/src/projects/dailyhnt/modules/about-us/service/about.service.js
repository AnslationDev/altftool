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

const PROJECT_ID = "dailyhnt";
const HERO_PATH = ["projects", PROJECT_ID, "about", "hero"];
const ORIGIN_PATH = ["projects", PROJECT_ID, "about", "origin"];
const STAT_BLOCK_PATH = ["projects", PROJECT_ID, "about", "statBlock"];
const PRINCIPLES_PATH = ["projects", PROJECT_ID, "about", "principles"];
const ABOUT_PRINCIPLES_PATH = ["projects", PROJECT_ID, "aboutPrinciples"];

export const DEFAULT_ABOUT_HERO = {
  eyebrow: "",
  title: "",
  body: "",
  image: "",
  imagePath: "",
};

export const DEFAULT_ABOUT_ORIGIN = {
  eyebrow: "",
  title: "",
  body: "",
  terminalLabel: "",
};

export const DEFAULT_ABOUT_STAT_BLOCK = {
  items: [],
};

export const DEFAULT_ABOUT_PRINCIPLES = {
  eyebrow: "",
  title: "",
  brand: "",
  centerTitle: "",
  centerBody: "",
};

/* --------------------------------- hero ---------------------------------- */

export function subscribeAboutHero(onNext, onError) {
  return onSnapshot(
    doc(db, ...HERO_PATH),
    (snap) => onNext({ ...DEFAULT_ABOUT_HERO, ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveAboutHero(payload) {
  await setDoc(
    doc(db, ...HERO_PATH),
    {
      eyebrow: String(payload.eyebrow || "").trim(),
      title: String(payload.title || "").trim(),
      body: String(payload.body || "").trim(),
      image: payload.image || "",
      imagePath: payload.imagePath || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/* -------------------------------- origin --------------------------------- */

export function subscribeAboutOrigin(onNext, onError) {
  return onSnapshot(
    doc(db, ...ORIGIN_PATH),
    (snap) => onNext({ ...DEFAULT_ABOUT_ORIGIN, ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveAboutOrigin(payload) {
  await setDoc(
    doc(db, ...ORIGIN_PATH),
    {
      eyebrow: String(payload.eyebrow || "").trim(),
      title: String(payload.title || "").trim(),
      body: String(payload.body || "").trim(),
      terminalLabel: String(payload.terminalLabel || "").trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/* ------------------------------- stat block ------------------------------ */

export function subscribeAboutStatBlock(onNext, onError) {
  return onSnapshot(
    doc(db, ...STAT_BLOCK_PATH),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onNext({
        ...DEFAULT_ABOUT_STAT_BLOCK,
        ...data,
        items: Array.isArray(data.items) ? data.items : [],
      });
    },
    onError,
  );
}

export async function saveAboutStatBlock(payload) {
  await setDoc(
    doc(db, ...STAT_BLOCK_PATH),
    {
      items: (Array.isArray(payload.items) ? payload.items : [])
        .map((item) => ({
          value: String(item?.value || "").trim(),
          label: String(item?.label || "").trim(),
        }))
        .filter((item) => item.value || item.label),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/* ------------------------------ principles ------------------------------- */

export function subscribeAboutPrinciplesDoc(onNext, onError) {
  return onSnapshot(
    doc(db, ...PRINCIPLES_PATH),
    (snap) => onNext({ ...DEFAULT_ABOUT_PRINCIPLES, ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveAboutPrinciplesDoc(payload) {
  await setDoc(
    doc(db, ...PRINCIPLES_PATH),
    {
      eyebrow: String(payload.eyebrow || "").trim(),
      title: String(payload.title || "").trim(),
      brand: String(payload.brand || "").trim(),
      centerTitle: String(payload.centerTitle || "").trim(),
      centerBody: String(payload.centerBody || "").trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/* --------------------- aboutPrinciples (collection) ---------------------- */

export function subscribeAboutPrinciples(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...ABOUT_PRINCIPLES_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createAboutPrinciple(payload) {
  await addDoc(collection(db, ...ABOUT_PRINCIPLES_PATH), {
    ...normalizePrinciple(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateAboutPrinciple(id, payload) {
  await updateDoc(doc(db, ...ABOUT_PRINCIPLES_PATH, id), {
    ...normalizePrinciple(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAboutPrinciple(id) {
  await deleteDoc(doc(db, ...ABOUT_PRINCIPLES_PATH, id));
}

export async function toggleAboutPrincipleStatus(id, active) {
  await updateDoc(doc(db, ...ABOUT_PRINCIPLES_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

/* -------------------------------- image ---------------------------------- */

export function uploadAboutHeroImage({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/about/hero-${Date.now()}.${ext}`;
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

export async function deleteAboutHeroImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

/* -------------------------------- helpers -------------------------------- */

function normalizePrinciple(payload) {
  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
