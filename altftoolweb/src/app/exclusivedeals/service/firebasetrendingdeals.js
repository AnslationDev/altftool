"use client";

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { snapshotDocs, subscribeCached } from "@/lib/firebaseCache";

const heroCollectionRef = collection(
  db,

  "projects",

  "altftool",

  "deals",

  "data",

  "trending",
);

export const trendingfirebase = (callback) => {
  return subscribeCached(
    "deals:trending",
    (emit, fail) => onSnapshot(heroCollectionRef, (snapshot) => emit(snapshotDocs(snapshot)), fail),
    callback,
  );
};
