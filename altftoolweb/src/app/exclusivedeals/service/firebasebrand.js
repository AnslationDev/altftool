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
  return subscribeCached(
    "deals:brands",
    (emit, fail) => onSnapshot(heroCollectionRef, (snapshot) => emit(snapshotDocs(snapshot)), fail),
    callback,
  );
};

export const upcomingfirebase = (callback) => {
  return subscribeCached(
    "deals:upcoming",
    (emit, fail) => onSnapshot(upcomingCollectionRef, (snapshot) => emit(snapshotDocs(snapshot)), fail),
    callback,
  );
};

export const bestCouponfirebase = (callback) => {
  return subscribeCached(
    "deals:best-coupons",
    (emit, fail) => onSnapshot(bestCouponCollectionRef, (snapshot) => emit(snapshotDocs(snapshot)), fail),
    callback,
  );
};
