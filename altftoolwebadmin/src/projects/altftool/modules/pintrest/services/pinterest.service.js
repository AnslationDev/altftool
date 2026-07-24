import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "@/lib/firebaseFirestore";
import { storage } from "@/lib/firebaseStorage";

const PROJECT_ID = "altftool";
const PINS_REF = collection(db, "projects", PROJECT_ID, "pintrest");
const CATEGORIES_REF = collection(db, "projects", PROJECT_ID, "pintrest_categories");

/* ============================================================================
   IMAGE UPLOAD (Firebase Storage) — used by bulk pin creation
   ============================================================================ */

// Upload one image file to Storage and resolve its public download URL.
// onProgress receives a 0..1 fraction.
export function uploadPinImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    const safeName = (file.name || "image").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `pintrest/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const task = uploadBytesResumable(storageRef(storage, path), file);
    task.on(
      "state_changed",
      (snap) => onProgress?.(snap.totalBytes ? snap.bytesTransferred / snap.totalBytes : 0),
      reject,
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/* ============================================================================
   PINS CRUD operations
   ============================================================================ */

export function subscribePins(onData, onError) {
  return onSnapshot(
    PINS_REF,
    (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onData(data);
    },
    (err) => {
      console.error("Failed to subscribe to Pinterest pins:", err);
      onError?.(err);
    }
  );
}

export async function addPin(pinData) {
  const docData = {
    title: pinData.title || "Untitled",
    image: pinData.image || "",
    img: pinData.image || "",
    logo: pinData.image || "",
    category: pinData.category || "Other",
    Category: pinData.category || "Other",
    likes: Number(pinData.likes) || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Support additional attributes if present (e.g. gallery images)
  if (pinData.gallery) {
    docData.gallery = Array.isArray(pinData.gallery) ? pinData.gallery : [];
  }

  return addDoc(PINS_REF, docData);
}

export async function updatePin(id, updates) {
  const pinDocRef = doc(PINS_REF, id);
  const docData = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if (updates.image !== undefined) {
    docData.img = updates.image;
    docData.logo = updates.image;
  }
  if (updates.category !== undefined) {
    docData.Category = updates.category;
  }

  return updateDoc(pinDocRef, docData);
}

export async function deletePin(id) {
  const pinDocRef = doc(PINS_REF, id);
  return deleteDoc(pinDocRef);
}

/* ============================================================================
   CATEGORIES CRUD operations
   ============================================================================ */

export function subscribeCategories(onData, onError) {
  return onSnapshot(
    CATEGORIES_REF,
    (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onData(data);
    },
    (err) => {
      console.error("Failed to subscribe to Pinterest categories:", err);
      onError?.(err);
    }
  );
}

export async function addCategory(categoryName) {
  const name = categoryName.trim();
  if (!name) throw new Error("Category name cannot be empty");

  return addDoc(CATEGORIES_REF, {
    name,
    createdAt: serverTimestamp(),
  });
}

export async function updateCategory(id, newName) {
  const catDocRef = doc(CATEGORIES_REF, id);
  const name = newName.trim();
  if (!name) throw new Error("Category name cannot be empty");

  return updateDoc(catDocRef, {
    name,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id) {
  const catDocRef = doc(CATEGORIES_REF, id);
  return deleteDoc(catDocRef);
}
