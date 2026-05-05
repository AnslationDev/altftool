"use client";

import { onSnapshot, collectionGroup, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const subscribeAllBrands = (callback) => {
  const q = query(collectionGroup(db, "allbrand"));

  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name, // ✅ only brand name
      logo: doc.data().logo,
      link: doc.data().link,

      categoryId: doc.ref.parent.parent.id,
    }));

    callback(data);
  });
};