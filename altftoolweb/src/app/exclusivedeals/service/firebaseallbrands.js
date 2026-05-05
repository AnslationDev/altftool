"use client";

import { onSnapshot, collectionGroup, query } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";

export const subscribeAllBrands = (callback) => {
  const q = query(collectionGroup(db, "allbrand"));

  return subscribeCached("deals:all-brands", (emit, fail) => onSnapshot(
    q,
    (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,

        name: doc.data().name,

        logo: doc.data().logo,

        link: doc.data().link,

        categoryId: doc.ref.parent.parent.id,
      }));

      emit(data);
    },
    fail,
  ), callback);
};
