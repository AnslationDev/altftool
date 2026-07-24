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
import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "dailyhnt";
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const QUICK_LINKS_PATH = ["projects", PROJECT_ID, "footerQuickLinks"];
const RESOURCES_PATH = ["projects", PROJECT_ID, "footerResources"];

export const DEFAULT_FOOTER_SETTINGS = {
  description: "",
};

/* ------------------------------- settings -------------------------------- */

export function subscribeFooterSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SETTINGS_PATH),
    (snap) => onNext({ ...DEFAULT_FOOTER_SETTINGS, ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveFooterSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      description: String(payload.description || "").trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/* ------------------------------ list factory ----------------------------- */

function makeLinkApi(PATH) {
  return {
    subscribe(onNext, onError) {
      return onSnapshot(
        query(collection(db, ...PATH), orderBy("order", "asc")),
        (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
        onError,
      );
    },
    async create(payload) {
      await addDoc(collection(db, ...PATH), {
        ...normalizeLink(payload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    async update(id, payload) {
      await updateDoc(doc(db, ...PATH, id), {
        ...normalizeLink(payload),
        updatedAt: serverTimestamp(),
      });
    },
    async remove(id) {
      await deleteDoc(doc(db, ...PATH, id));
    },
    async toggle(id, active) {
      await updateDoc(doc(db, ...PATH, id), { active, updatedAt: serverTimestamp() });
    },
  };
}

const quickLinks = makeLinkApi(QUICK_LINKS_PATH);
const resources = makeLinkApi(RESOURCES_PATH);

/* ---------------------------- quick links -------------------------------- */

export const subscribeFooterQuickLinks = quickLinks.subscribe;
export const createFooterQuickLink = quickLinks.create;
export const updateFooterQuickLink = quickLinks.update;
export const deleteFooterQuickLink = quickLinks.remove;
export const toggleFooterQuickLinkStatus = quickLinks.toggle;

/* ------------------------------ resources -------------------------------- */

export const subscribeFooterResources = resources.subscribe;
export const createFooterResource = resources.create;
export const updateFooterResource = resources.update;
export const deleteFooterResource = resources.remove;
export const toggleFooterResourceStatus = resources.toggle;

/* -------------------------------- helpers -------------------------------- */

function normalizeLink(payload) {
  return {
    label: String(payload.label || "").trim(),
    href: String(payload.href || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
