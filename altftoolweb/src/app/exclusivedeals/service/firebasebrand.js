"use client";

import { collection, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";

const heroCollectionRef = collection(
  db,

  "projects",

  "altftool",

  "deals",

  "data",

  "brands",
);

const upcomingCollectionRef = collection(
  db,

  "projects",

  "altftool",

  "deals",

  "data",

  "upcomingdeal",
);

const bestCouponCollectionRef = collection(
  db,

  "projects",

  "altftool",

  "deals",

  "data",

  "bestcoupon",
);

export const brandsfirebase = (callback) => {
  const unsubscribe = onSnapshot(heroCollectionRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,

      ...doc.data(),
    }));

    callback(data);
  });

  return unsubscribe;
};

export const upcomingfirebase = (callback) => {
  const unsubscribe = onSnapshot(upcomingCollectionRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,

      ...doc.data(),
    }));

    callback(data);
  });

  return unsubscribe;
};

export const bestCouponfirebase = (callback) => {
  const unsubscribe = onSnapshot(bestCouponCollectionRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,

      ...doc.data(),
    }));

    callback(data);
  });

  return unsubscribe;
};
