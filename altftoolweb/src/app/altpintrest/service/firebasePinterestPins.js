import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PINS_REF = collection(db, "projects", "altftool", "pintrest");

export const firebasePinterestPinsSource = {
  subscribe(callback, onError) {
    return onSnapshot(
      PINS_REF,
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      },
      (error) => {
        console.error("Pins read error:", error);
        onError?.(error);
      }
    );
  },
};
