import {
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import { getCollectionRef, getDocRef } from "./config";

export const faqService = {

  //  SUBSCRIBE (category + subcategory based)
  subscribe(categoryId, subCategoryId, callback) {
    const q = query(
      getCollectionRef("faqs"),
      where("categoryId", "==", categoryId),
      where("subCategoryId", "==", subCategoryId)
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  //  SUBSCRIBE ALL (for table count)
  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("faqs"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  // ADD
  async add(data) {
    return await addDoc(getCollectionRef("faqs"), {
      question: data.question,
      answer: data.answer,
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
    });
  },

  //  THIS WAS MISSING (YOUR ERROR)
  async update(id, data) {
    return await updateDoc(getDocRef("faqs", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  //  DELETE
  async remove(id) {
    return await deleteDoc(getDocRef("faqs", id));
  }
};