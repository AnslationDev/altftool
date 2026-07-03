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
const NAVBAR_SETTINGS_PATH = ["projects", PROJECT_ID, "navbar", "settings"];
const NAVBAR_ITEMS_PATH = ["projects", PROJECT_ID, "navbarItems"];
const DEFAULT_SETTINGS = {
  logoType: "text",
  logoText: "CarrerBook",
  logoImageUrl: "",
  logoImagePath: "",
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
  const itemsQuery = query(
    collection(db, ...NAVBAR_ITEMS_PATH),
    orderBy("order", "asc"),
  );

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
    logoImageUrl: payload.logoImageUrl || "",
    logoImagePath: payload.logoImagePath || "",
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

export async function toggleNavbarItemStatus(id, active) {
  await updateDoc(doc(db, ...NAVBAR_ITEMS_PATH, id), {
    active,
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
    title: cleanText(payload.title),
    url: cleanText(payload.url),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
