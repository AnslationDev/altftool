import { doc, onSnapshot } from "firebase/firestore";
import { normalizeBuySmartCategory } from "@altftool/core/buysmart";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const CATEGORY_REF = doc(db, ...buySmartDocPath("categories"));

export const firebaseBuySmartCategoriesSource = {
  subscribe(callback, onError) {
    return subscribeCached(
      "buysmart:categories",
      (emit, fail) => onSnapshot(
        CATEGORY_REF,
        (snap) => {
          const categories = snap.exists() ? snap.data().banner || [] : [];
          emit(categories.map(normalizeBuySmartCategory));
        },
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
