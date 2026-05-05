import {
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { getCollectionRef, getDocRef } from "./config";

export const subCategoryService = {

  subscribe(categoryId, callback) {
    const q = query(
      getCollectionRef("subcategories"),
      where("categoryId", "==", categoryId)
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("subcategories"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  async add(data) {
    return await addDoc(getCollectionRef("subcategories"), {
      name: data.name,
      categoryId: data.categoryId,
      status: "active",
      icon: data.icon || "",
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(),
    });
  },

  async update(id, data) {
    return await updateDoc(getDocRef("subcategories", id), { 
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async remove(id) {
    return await deleteDoc(getDocRef("subcategories", id));
  }
};