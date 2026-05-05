"use client";

import {
  addDoc,
  onSnapshot,
  serverTimestamp,
  collectionGroup,
  query,
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { getCollectionRef, getDocRef } from "./config";

// 🔹 collection ref
const getBrandRef = (categoryId) =>
  getCollectionRef("categories", categoryId, "allbrand");

// 🔹 doc ref
const getBrandDocRef = (categoryId, brandId) =>
  getDocRef("categories", categoryId, "allbrand", brandId);

export const allBrandService = {

  // ✅ single category brands
  subscribe(categoryId, callback) {
    if (!categoryId) return () => {};

    return onSnapshot(getBrandRef(categoryId), (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(data);
    });
  },

  // ✅ add
  async add(categoryId, data) {
    return await addDoc(getBrandRef(categoryId), {
      name: data.name,
      logo: data.logo,
      link: data.link,
      createdAt: serverTimestamp(),
    });
  },

  // ✅ update (SAFE)
  async update(categoryId, brandId, data) {
    const ref = getBrandDocRef(categoryId, brandId);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error("Brand not found (maybe moved)");
    }

    return await updateDoc(ref, {
      name: data.name,
      logo: data.logo,
      link: data.link,
      updatedAt: serverTimestamp(),
    });
  },

  // ✅ delete
  async remove(categoryId, brandId) {
    return await deleteDoc(getBrandDocRef(categoryId, brandId));
  },
};

// ✅ all brands (global)
export const subscribeAllBrands = (callback) => {
  const q = query(collectionGroup(db, "allbrand"));

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      logo: doc.data().logo,
      link: doc.data().link,
      categoryId: doc.ref.parent.parent.id,
    }));

    callback(data);
  });
};
