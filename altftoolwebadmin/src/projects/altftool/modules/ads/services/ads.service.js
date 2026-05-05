// src/services/ads.service.js

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =========================
   CONFIG
========================= */

const PROJECT_ID = "altftool";
const adsRef = collection(db, "projects", PROJECT_ID, "ads");

/* =========================
   HELPERS
========================= */

function mapSnapshot(snap) {
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/* =========================
   READ (REALTIME)
========================= */

export function subscribeAllAds(cb) {
  const q = query(adsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    cb(mapSnapshot(snap));
  });
}

export function subscribeAdsByPlacement(placementKey, cb) {
  const q = query(
    adsRef,
    where("placements", "array-contains", placementKey)
  );

  return onSnapshot(q, (snap) => {
    const ads = mapSnapshot(snap).sort(
      (a, b) =>
        (b.createdAt?.seconds || 0) -
        (a.createdAt?.seconds || 0)
    );

    cb(ads);
  });
}

/* =========================
   CREATE
========================= */

/**
 * Create ad with custom ID
 */
export async function createAdWithId(adId, data) {
  const ref = doc(adsRef, adId);

  await setDoc(ref, {
    ...data,
    id: adId,
    createdAt: data.createdAt || serverTimestamp(),
  });

  return adId;
}

/**
 * Create ad with auto ID
 */
export async function createAd(data) {
  const ref = await addDoc(adsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });

  // optional: store id inside doc (you were doing it)
  await updateDoc(ref, { id: ref.id });

  return ref.id;
}

/* =========================
   UPDATE
========================= */

export async function updateAd(adId, updates) {
  const ref = doc(adsRef, adId);
  return updateDoc(ref, updates);
}

export async function toggleAdStatus(ad) {
  const next = ad.status === "active" ? "paused" : "active";
  return updateAd(ad.id, { status: next });
}

export async function incrementAdMetrics(adId, updates) {
  const ref = doc(adsRef, adId);
  return updateDoc(ref, updates);
}

/* =========================
   DELETE
========================= */

export async function deleteAd(adId) {
  const ref = doc(adsRef, adId);
  return deleteDoc(ref);
}

export async function deleteAdsBulk(ids = []) {
  return Promise.all(ids.map((id) => deleteAd(id)));
}