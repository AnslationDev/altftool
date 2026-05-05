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

export const smartSavingService = {

  //  SUBSCRIBE ALL
  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("smartSaving"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  // ADD
  async add(data) {
    return await addDoc(getCollectionRef("smartSaving"), {
      title: data.title,
      link:data.link,
      image: data.image,
      description:data.description,
      status: data.status || "active",
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
    });
  },

  // UPDATE
  async update(id, data) {
    return await updateDoc(getDocRef("smartSaving", id), {
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