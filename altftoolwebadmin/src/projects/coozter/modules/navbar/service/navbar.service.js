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

const PROJECT_ID = "coozter";
const NAVBAR_SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const NAVBAR_ITEMS_PATH = ["projects", PROJECT_ID, "navbarItems"];
const DEFAULT_SETTINGS = {
  logoType: "text",
  logoText: "Coozter",
  logoAlt: "Coozter logo",
  logoImageUrl: "",
  logoImagePath: "",
  ctaButton: {
    enabled: true,
    text: "Get Started",
    url: "/contact-us",
    openInNewTab: false,
  },
  mobileMenu: {
    footerText: "Coozter © 2026",
  },
  settings: {
    sticky: true,
    showBorder: true,
    showCTA: true,
    transparentOnTop: true,
    backgroundColor: "",
    textColor: "",
    activeColor: "",
    hoverColor: "",
    borderColor: "",
  },
};

const cleanText = (value = "") => String(value).trim();

export function subscribeNavbarSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...NAVBAR_SETTINGS_PATH),
    (snap) => {
      onNext({
        ...DEFAULT_SETTINGS,
        ...(snap.exists() ? snap.data() : {}),
      });
    },
    onError,
  );
}

export function subscribeNavbarItems(onNext, onError) {
  const itemsQuery = query(collection(db, ...NAVBAR_ITEMS_PATH), orderBy("order", "asc"));

  return onSnapshot(
    itemsQuery,
    (snap) => {
      onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    },
    onError,
  );
}

export async function saveNavbarSettings(payload) {
  const settings = {
    logoType: payload.logoType === "image" ? "image" : "text",
    logoText: cleanText(payload.logoText),
    logoAlt: cleanText(payload.logoAlt),
    logoImageUrl: payload.logoImageUrl || "",
    logoImagePath: payload.logoImagePath || "",
    ctaButton: {
      enabled: payload.ctaButton?.enabled !== false,
      text: cleanText(payload.ctaButton?.text || "Get Started"),
      url: cleanText(payload.ctaButton?.url || "/contact-us"),
      openInNewTab: Boolean(payload.ctaButton?.openInNewTab),
    },
    mobileMenu: {
      footerText: cleanText(payload.mobileMenu?.footerText || ""),
    },
    settings: {
      sticky: payload.settings?.sticky !== false,
      showBorder: payload.settings?.showBorder !== false,
      showCTA: payload.settings?.showCTA !== false,
      transparentOnTop: payload.settings?.transparentOnTop !== false,
      backgroundColor: cleanText(payload.settings?.backgroundColor),
      textColor: cleanText(payload.settings?.textColor),
      activeColor: cleanText(payload.settings?.activeColor),
      hoverColor: cleanText(payload.settings?.hoverColor),
      borderColor: cleanText(payload.settings?.borderColor),
    },
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, ...NAVBAR_SETTINGS_PATH), settings, { merge: true });
}

export async function createNavbarItem(payload) {
  const item = normalizeNavbarItem(payload);
  await addDoc(collection(db, ...NAVBAR_ITEMS_PATH), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNavbarItem(id, payload) {
  const item = normalizeNavbarItem(payload);
  await updateDoc(doc(db, ...NAVBAR_ITEMS_PATH, id), {
    ...item,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNavbarItem(id) {
  await deleteDoc(doc(db, ...NAVBAR_ITEMS_PATH, id));
}

export async function toggleNavbarItemStatus(id, visible) {
  await updateDoc(doc(db, ...NAVBAR_ITEMS_PATH, id), {
    visible,
    updatedAt: serverTimestamp(),
  });
}

export function uploadNavbarLogo({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/navbar/logo-${Date.now()}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        }
      },
      reject,
      async () => {
        try {
          resolve({
            url: await getDownloadURL(task.snapshot.ref),
            path,
          });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export async function deleteNavbarLogo(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

function normalizeNavbarItem(payload) {
  return {
    label: cleanText(payload.label || payload.title),
    url: cleanText(payload.url),
    order: Number(payload.order) || 0,
    visible: payload.visible !== false,
    openInNewTab: Boolean(payload.openInNewTab),
    badge: cleanText(payload.badge),
    icon: cleanText(payload.icon),
    children: Array.isArray(payload.children) ? payload.children : [],
  };
}
