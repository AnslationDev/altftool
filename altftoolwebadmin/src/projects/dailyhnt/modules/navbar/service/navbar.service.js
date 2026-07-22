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
import { db } from "@/lib/firebase";

const PROJECT_ID = "dailyhnt";
const SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const PRIMARY_PATH = ["projects", PROJECT_ID, "navbarPrimary"];
const SERVICES_PATH = ["projects", PROJECT_ID, "navbarServices"];

export const DEFAULT_NAVBAR_SETTINGS = {
  cta: { label: "", href: "" },
};

/* ------------------------------- settings -------------------------------- */

export function subscribeNavbarSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SETTINGS_PATH),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onNext({
        ...DEFAULT_NAVBAR_SETTINGS,
        ...data,
        cta: { ...DEFAULT_NAVBAR_SETTINGS.cta, ...(data.cta || {}) },
      });
    },
    onError,
  );
}

export async function saveNavbarSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      cta: {
        label: String(payload?.cta?.label || "").trim(),
        href: String(payload?.cta?.href || "").trim(),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/* ---------------------------- primary links ------------------------------ */

export function subscribeNavbarPrimary(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...PRIMARY_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createNavbarPrimary(payload) {
  await addDoc(collection(db, ...PRIMARY_PATH), {
    ...normalizePrimary(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNavbarPrimary(id, payload) {
  await updateDoc(doc(db, ...PRIMARY_PATH, id), {
    ...normalizePrimary(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNavbarPrimary(id) {
  await deleteDoc(doc(db, ...PRIMARY_PATH, id));
}

export async function toggleNavbarPrimaryStatus(id, active) {
  await updateDoc(doc(db, ...PRIMARY_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

/* --------------------------- services mega-menu -------------------------- */

export function subscribeNavbarServices(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...SERVICES_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createNavbarService(payload) {
  await addDoc(collection(db, ...SERVICES_PATH), {
    ...normalizeService(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNavbarService(id, payload) {
  await updateDoc(doc(db, ...SERVICES_PATH, id), {
    ...normalizeService(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNavbarService(id) {
  await deleteDoc(doc(db, ...SERVICES_PATH, id));
}

export async function toggleNavbarServiceStatus(id, active) {
  await updateDoc(doc(db, ...SERVICES_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

/* -------------------------------- helpers -------------------------------- */

function normalizePrimary(payload) {
  return {
    label: String(payload.label || "").trim(),
    href: String(payload.href || "").trim(),
    hasMegaMenu: payload.hasMegaMenu === true,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}

function normalizeService(payload) {
  return {
    slug: String(payload.slug || "").trim(),
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    icon: String(payload.icon || "code").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
