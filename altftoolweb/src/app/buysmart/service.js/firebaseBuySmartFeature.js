import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

const BRAND_REF = doc(db, "projects", "altftool", "buySmart", "featurebrand");

export const firebaseBuySmartFeatureBrandSource = {
  subscribe(callback, onError) {
    return subscribeCached(
      "buysmart:feature-brand",
      (emit, fail) => onSnapshot(
        BRAND_REF,
        (snap) => emit(snap.exists() ? snap.data().features || [] : []),
        (error) => {
          console.error("Feature brand read error:", error);
          fail?.(error);
        },
      ),
      callback,
      onError,
    );
  },
};
