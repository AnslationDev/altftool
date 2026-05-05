import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const STORE_REF = doc(db, "projects", "altftool", "buySmart", "store");

export const firebaseBuySmartStoreSource = {
  subscribe(callback, onError) {
    return subscribeCached(
      "buysmart:store",
      (emit, fail) => onSnapshot(
        STORE_REF,
        (snap) => emit(snap.exists() ? snap.data().banner || [] : []),
        (error) => {
          console.error("Store read error:", error);
          fail?.(error);
        },
      ),
      callback,
      onError,
    );
  },
};
