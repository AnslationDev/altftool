import { doc, onSnapshot } from "firebase/firestore";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const TRENDING_REF = doc(db, ...buySmartDocPath("trending"));

export const firebaseBuySmartTrendingSource = {
  subscribe(callback, onError) {
    return subscribeCached(
      "buysmart:trending",
      (emit, fail) => onSnapshot(
        TRENDING_REF,
        (snap) => emit(snap.exists() ? snap.data().banner || [] : []),
        (error) => {
          console.error("BuySmart trending read error:", error);
          fail?.(error);
        },
      ),
      callback,
      onError,
    );
  },
};
