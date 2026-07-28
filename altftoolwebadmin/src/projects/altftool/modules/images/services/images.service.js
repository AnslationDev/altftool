// src/services/images.service.js

import {
  collection,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "altftool";
const imgRef = collection(db, "projects", PROJECT_ID, "images");

/* CREATE */

export async function createImage(data) {
  return addDoc(imgRef, {
    ...data,
    uploadedAt: serverTimestamp(),
  });
}

/* DELETE */

export async function deleteImage(id) {
  return deleteDoc(doc(imgRef, id));
}