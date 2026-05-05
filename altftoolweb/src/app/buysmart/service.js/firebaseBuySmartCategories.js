import {
    doc,
    onSnapshot,
  } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  
  const CATEGORY_REF = doc(db, "projects", "altftool", "buySmart", "categories");
  
  export const firebaseBuySmartCategoriesSource = {
    // 🔹 GET ALL HEROES (Realtime)
    subscribe(callback, onError) {
      return onSnapshot(
        CATEGORY_REF,
        snap => {
          const data = snap.exists() ? snap.data().banner || [] : [];
          callback(data);
        },
        error => {
          console.error("Hero read error:", error);
          onError?.(error);
        }
      );
    },
  
  };