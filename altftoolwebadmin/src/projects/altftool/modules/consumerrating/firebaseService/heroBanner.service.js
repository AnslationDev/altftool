"use client";

import {
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

import { getCollectionRef, getDocRef } from "./config";

export const heroBannerService = {

  //  SUBSCRIBE ALL
  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("heroBanners"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  // ADD
  async add(data) {
    return await addDoc(getCollectionRef("heroBanners"), {
      title: data.title,
      image: data.image,
      status: data.status || "active",
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
    });
  },

  // UPDATE
  async update(id, data) {
    return await updateDoc(getDocRef("heroBanners", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  
  async remove(id) {
    return await deleteDoc(getDocRef("heroBanners", id));
  },

  
  async bulkDelete(ids = []) {
    const batch = writeBatch(getCollectionRef("heroBanners").firestore);

    ids.forEach(id => {
      batch.delete(getDocRef("heroBanners", id));
    });

    await batch.commit();
  }
};