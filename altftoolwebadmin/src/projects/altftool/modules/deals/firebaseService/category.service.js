import {
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    writeBatch,
    serverTimestamp
  } from "firebase/firestore";
  
  import { getCollectionRef, getDocRef } from "./config";
  
  export const categoryService = {
  
    subscribe(callback) {
      return onSnapshot(getCollectionRef("categories"), (snap) => {
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      });
    },
  
    async add(data) {
      return await addDoc(getCollectionRef("categories"), {
        name: data.name,
        image: data.image, 
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
  
    async update(id, data) {
      return await updateDoc(getDocRef("categories", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
  
    async remove(id) {
      return await deleteDoc(getDocRef("categories", id));
    }
  };