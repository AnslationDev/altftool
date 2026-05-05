import {
    doc,
    onSnapshot,
    updateDoc,
    arrayUnion,
    getDoc
  } from "firebase/firestore";
  import { db } from "@/lib/firebase";
  
  const HERO_REF = doc(db, "projects", "altftool", "buySmart", "hero");
  
  export const firebaseBuySmartHeroSource = {
    // 🔹 GET ALL HEROES (Realtime)
    subscribe(callback, onError) {
      return onSnapshot(
        HERO_REF,
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