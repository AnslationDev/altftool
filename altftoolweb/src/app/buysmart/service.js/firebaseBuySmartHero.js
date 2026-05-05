import { doc, onSnapshot } from "firebase/firestore";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const HERO_REF = doc(db, ...buySmartDocPath("hero"));

export const firebaseBuySmartHeroSource = {
  subscribe(callback, onError) {
    return subscribeCached(
      "buysmart:hero",
      (emit, fail) => onSnapshot(
        HERO_REF,
        (snap) => emit(snap.exists() ? snap.data().banner || [] : []),
        (error) => {
          console.error("Hero read error:", error);
          fail?.(error);
        },
      ),
      callback,
      onError,
    );
  },
};
