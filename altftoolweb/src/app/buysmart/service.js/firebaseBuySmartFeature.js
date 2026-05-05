import { doc, getDoc, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
// import { useEffect } from "react";

const BRAND_REF = doc(db, "projects", "altftool", "buySmart", "featurebrand");

export const firebaseBuySmartFeatureBrandSource = {
  subscribe(callback, onError) {
    return onSnapshot(
      BRAND_REF,

      (snap) => {
        const data = snap.exists() ? snap.data().features || [] : [];

        callback(data);
      },

      (error) => {
        console.error("Hero read error:", error);

        onError?.(error);
      },
    );
  },
};

// useEffect(() => {
//   const unsub = firebaseBuySmartFeatureBrandSource.subscribe((data) => {
//     setBrand(data || []);
//   });

//   return () => unsub && unsub();
// }, []);
