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

export const trendingService = {

  //  SUBSCRIBE ALL
  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("trending"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  // ADD
  async add(data) {
    return await addDoc(getCollectionRef("trending"), {
      title: data.title,
      link:data.link,
      image: data.image,
      price:data.price,
      description:data.description,
      status: data.status || "active",
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
    });
  },

  // UPDATE
  async update(id, data) {
    return await updateDoc(getDocRef("trending", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  
  async remove(id) {
    return await deleteDoc(getDocRef("trending", id));
  },

  
  async bulkDelete(ids = []) {
    const batch = writeBatch(getCollectionRef("trending").firestore);

    ids.forEach(id => {
      batch.delete(getDocRef("trending", id));
    });

    await batch.commit();
  }
};