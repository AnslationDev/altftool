import {
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp
  } from "firebase/firestore";
  
  import { getCollectionRef, getDocRef } from "./config";
  
  export const brandService = {
  
    subscribeAll(callback) {
      return onSnapshot(getCollectionRef("brands"), (snap) => {
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      });
    },
  
    async add(data) {
      return await addDoc(getCollectionRef("brands"), {
        name: data.name,
        logo: data.logo,
        link: data.link,
        highestDiscount: data.highestDiscount,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        offers: data.offers || [],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
  
    async update(id, data) {
      return await updateDoc(getDocRef("brands", id), {
        ...data,
        categoryName: data.categoryName,
        updatedAt: serverTimestamp(),
      });
    },
  
    async remove(id) {
      return await deleteDoc(getDocRef("brands", id));
    }
  };