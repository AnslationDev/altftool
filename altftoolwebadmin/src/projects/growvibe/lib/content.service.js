import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { DEFAULTS } from "./schema";

const PROJECT_ID = "growvibe";
const sectionDoc = (key) => doc(db, "projects", PROJECT_ID, "content", key);

/** Live-subscribe one content section; merges Firestore data over defaults. */
export function subscribeSection(key, onData, onError) {
  return onSnapshot(
    sectionDoc(key),
    (snapshot) => {
      const fallback = DEFAULTS[key] || {};
      if (!snapshot.exists()) {
        onData({ ...fallback });
        return;
      }
      onData({ ...fallback, ...snapshot.data() });
    },
    onError,
  );
}

/** Save a full section document. */
export async function saveSection(key, data) {
  await setDoc(
    sectionDoc(key),
    { ...data, updatedAt: serverTimestamp() },
    { merge: false },
  );
}

/** Reset a section back to the shipped defaults. */
export async function resetSection(key) {
  const fallback = DEFAULTS[key] || {};
  await setDoc(sectionDoc(key), { ...fallback, updatedAt: serverTimestamp() });
}

/** Upload an image for a section field; returns { url, path }. */
export function uploadSectionImage(key, file, onProgress) {
  const safeName = `${Date.now()}-${(file.name || "image").replace(/[^\w.-]/g, "_")}`;
  const path = `projects/${PROJECT_ID}/content/${key}/${safeName}`;
  const ref = storageRef(storage, path);
  const task = uploadBytesResumable(ref, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress && snap.totalBytes) {
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(ref);
          resolve({ url, path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

/** Best-effort delete of a previously uploaded storage object. */
export async function deleteSectionImage(path) {
  if (!path) return;
  try {
    await deleteObject(storageRef(storage, path));
  } catch (error) {
    // Object may already be gone; ignore.
  }
}
