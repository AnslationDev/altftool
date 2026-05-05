import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const CATEGORY_REF = doc(db, "projects", "altftool", "buySmart", "categories");

export const firebaseBuySmartCategoriesSource = {
  subscribe(callback, onError) {
    return subscribeCached(
      "buysmart:categories",
      (emit, fail) => onSnapshot(
        CATEGORY_REF,
        (snap) => emit(snap.exists() ? snap.data().banner || [] : []),
        (error) => {
          console.error("BuySmart categories read error:", error);
          fail?.(error);
        },
      ),
      callback,
      onError,
    );
  },
};
