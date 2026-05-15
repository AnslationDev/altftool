import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const CATEGORY_REF = collection(db, "projects", "altftool", "pintrest_categories");

export const firebasePinterestCategoriesSource = {
  subscribe(callback, onError) {
    return onSnapshot(
      CATEGORY_REF,
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      },
      (error) => {
        console.error("Category read error:", error);
        onError?.(error);
      }
    );
  },
};
