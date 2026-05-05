// src/services/images.service.js

import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const PROJECT_ID = "altftool";
const imgRef = collection(db, "projects", PROJECT_ID, "images");

/* READ */

export async function fetchImagesPage({ pageSize, cursor }) {
  const constraints = [orderBy("uploadedAt", "desc"), limit(pageSize)];
  if (cursor) constraints.push(startAfter(cursor));

  const q = query(imgRef, ...constraints);
  const snap = await getDocs(q);

  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { data, lastDoc };
}

export async function fetchImagesCount() {
  const snap = await getCountFromServer(imgRef);
  return snap.data().count;
}

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