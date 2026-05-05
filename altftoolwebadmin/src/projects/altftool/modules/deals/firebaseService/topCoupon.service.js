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

export const topCouponService = {

  //  SUBSCRIBE ALL
  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("topCoupon"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  // ADD
  async add(data) {
    return await addDoc(getCollectionRef("topCoupon"), {
      brandname: data.name,
      brandimage: data.image,
      brandlogo:data.logo,
      discount:data.discount,
      description:data.description,
      link:data.link,
      code:data.code,
      status: data.status || "active",
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
    });
  },

  // UPDATE
  async update(id, data) {
    return await updateDoc(getDocRef("topCoupon", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  
  async remove(id) {
    return await deleteDoc(getDocRef("topCoupon", id));
  },

  
  async bulkDelete(ids = []) {
    const batch = writeBatch(getCollectionRef("topCoupon").firestore);

    ids.forEach(id => {
      batch.delete(getDocRef("topCoupon", id));
    });

    await batch.commit();
  }
};