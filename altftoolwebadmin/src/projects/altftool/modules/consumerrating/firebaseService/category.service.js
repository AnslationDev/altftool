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
  
    subscribe(callback, filter = {}) {
      return onSnapshot(getCollectionRef("categories"), (snap) => {
        let data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
        if (filter.search) {
          const q = filter.search.toLowerCase();
          data = data.filter(c => c.name?.toLowerCase().includes(q));
        }
  
        callback(data);
      });
    },
  
    async add(data) {
      return await addDoc(getCollectionRef("categories"), {
        name: data.name,
        status: data.status || "active",
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
    },
  
    async bulkDelete(ids = []) {
      const batch = writeBatch(getCollectionRef("categories").firestore);
  
      ids.forEach(id => {
        batch.delete(getDocRef("categories", id));
      });
  
      await batch.commit();
    }
  };