import {
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
const SETTINGS_PATH = ["projects", PROJECT_ID, "footer", "settings"];
const EMAILS_PATH = ["projects", PROJECT_ID, "footerEmails"];

export const DEFAULT_FOOTER = {
  label: "STAY UPDATED",
  heading: "Be Always In Touch.",
  description:
    "You may be interested in what we can offer you. More services you can find below. We do everything at a high level.",
  imageUrl: "",
  imagePath: "",
  active: true,
};

export function subscribeFooterSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SETTINGS_PATH),
    (snap) => onNext({ ...DEFAULT_FOOTER, ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export function subscribeFooterEmails(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...EMAILS_PATH), orderBy("createdAt", "desc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function saveFooterSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      label: String(payload.label || "").trim(),
      heading: String(payload.heading || "").trim(),
      description: String(payload.description || "").trim(),
      imageUrl: payload.imageUrl || "",
      imagePath: payload.imagePath || "",
      active: payload.active !== false,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteFooterSettings() {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    { ...DEFAULT_FOOTER, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function updateFooterEmailStatus(id, status) {
  await updateDoc(doc(db, ...EMAILS_PATH, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFooterEmail(id) {
  await deleteDoc(doc(db, ...EMAILS_PATH, id));
}

export function uploadFooterImage({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/footer/stay-updated-${Date.now()}.${ext}`;
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

export async function deleteFooterImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}
