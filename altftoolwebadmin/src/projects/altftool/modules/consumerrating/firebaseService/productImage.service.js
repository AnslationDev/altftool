"use client";

import {
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,

} from "firebase/firestore";

import { getCollectionRef, getDocRef } from "./config";

export const productImageService = {

  // SUBSCRIBE ALL
  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("productImages"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  //  ADD
  async add(data) {
    return await addDoc(getCollectionRef("productImages"), {
      title: data.title,
      image: data.image,
      status: data.status || "active",
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
    });
  },

  //  UPDATE
  async update(id, data) {
    return await updateDoc(getDocRef("productImages", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  //  DELETE
  async remove(id) {
    return await deleteDoc(getDocRef("productImages", id));
  },

  //  BULK DELETE
  async bulkDelete(ids = []) {
    const batch = writeBatch(getCollectionRef("productImages").firestore);

    ids.forEach(id => {
      batch.delete(getDocRef("productImages", id));
    });

    await batch.commit();
  }
};