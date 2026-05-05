"use client";

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";

const heroCollectionRef = collection(
  db,

  "projects",

  "altftool",

  "deals",

  "data",

  "smartSaving",
);

export const subscribeAll = (callback) => {
  const unsubscribe = onSnapshot(heroCollectionRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,

      ...doc.data(),
    }));

    callback(data);
  });

  return unsubscribe;
};
