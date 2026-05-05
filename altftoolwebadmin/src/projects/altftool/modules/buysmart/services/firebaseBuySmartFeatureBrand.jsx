// import {
//   doc,
//   getDoc,
//   onSnapshot,
//   setDoc,
//   serverTimestamp
// } from "firebase/firestore"

// import { db } from "@/lib/firebase"
// import { dualWrite, getFirestoreRefs } from "@/lib/dualWrite"


// export const ROOT = ["projects", "altftool", "buySmart", "featurebrand" ];
// const FEATURE_REF = doc(db, ...ROOT)
// const { newDocRef: FEATURE_NEW_REF } = getFirestoreRefs(...ROOT);

// export const firebaseBuySmartFeatureBrandSource = {


//   subscribe(callback, filter = {}, onError) {

//     const unsubNew = onSnapshot(
//       FEATURE_NEW_REF,
//       (snap) => {
//         if (!snap.exists()) return;
//         let data = snap.data().features || []
//         if (filter.search) {
//           const q = filter.search.toLowerCase()
//           data = data.filter((item) => item.category?.toLowerCase().includes(q))
//         }
//         if (filter.status && filter.status !== "all") {
//           data = data.filter((item) => item.status === filter.status)
//         }
//         if (filter.country && filter.country !== "ALL") {
//           data = data.filter((item) => item.country === filter.country)
//         }
//         callback(data)
//       },
//       (error) => {
//         console.error("FeatureBrand read error:", error)
//         onError?.(error)
//       }
//     )

//     const unsubOld = onSnapshot(
//       FEATURE_REF,
//       (snap) => {

//         let data = snap.exists() ? snap.data().features || [] : []

//         if (filter.search) {
//           const q = filter.search.toLowerCase()

//           data = data.filter((item) =>
//             item.category?.toLowerCase().includes(q)
//           )
//         }

//         if (filter.status && filter.status !== "all") {
//           data = data.filter((item) => item.status === filter.status)
//         }

//         if (filter.country && filter.country !== "ALL") {
//           data = data.filter((item) => item.country === filter.country)
//         }

//         callback(data)
//       },

//       (error) => {
//         console.error("FeatureBrand read error:", error)
//         onError?.(error)
//       }
//     )
//     return () => { try { unsubNew?.(); } catch {} try { unsubOld?.(); } catch {} }
//   },


//   /* Add Data in fireBase*/

//   async add(feature) {

//     const snap = await getDoc(FEATURE_REF)

//     const existing = snap.exists()
//       ? snap.data().features || []
//       : []

//     const newFeature = {
//       id: crypto.randomUUID(),
//       category: feature.category,
//       country: feature.country,
//       status: feature.status || "paused",
//       BrandDetail: feature.BrandDetail || [],
//        createdAt: serverTimestamp(), 
//       updatedAt: serverTimestamp(),
//     }

//     await dualWrite.set(MODULE, DOC_ID, { features: [...existing, newFeature] }, { merge: true })
//   },


//   /* Update data is firebase*/

//   async update(id, updatedFeature) {

//     const snap = await getDoc(FEATURE_REF)

//     const data = snap.data()

//     const updatedList = data.features.map((item) =>
//       item.id === id
//         ? { ...item, ...updatedFeature, 
//           updatedAt: serverTimestamp(),
//          }
//         : item
//     )

//     await dualWrite.set(MODULE, DOC_ID, { features: updatedList }, { merge: true })
//   },


//   /* Remove data is coming */

//   async remove(id) {

//     const snap = await getDoc(FEATURE_REF)

//     const data = snap.data()

//     const filtered = data.features.filter((item) => item.id !== id)

//     await dualWrite.set(MODULE, DOC_ID, { features: filtered }, { merge: true })
//   },


//   /* Bulk data is coming */

//   async bulkDelete(ids = []) {

//     const snap = await getDoc(FEATURE_REF)

//     const data = snap.data()

//     const filtered = data.features.filter(
//       (item) => !ids.includes(item.id)
//     )

//     await dualWrite.set(MODULE, DOC_ID, { features: filtered }, { merge: true })
//   }

// }


"use client";

import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";

export const ROOT = buySmartDocPath("featureBrand");
const FEATURE_REF = doc(db, ...ROOT);

export const firebaseBuySmartFeatureBrandSource = {

  // 🔹 SUBSCRIBE
  subscribe(callback, filter = {}, onError) {

    const unsub = onSnapshot(
      FEATURE_REF,
      (snap) => {
        let data = snap.exists() ? snap.data().features || [] : [];

        if (filter.search) {
          const q = filter.search.toLowerCase();
          data = data.filter((item) =>
            item.category?.toLowerCase().includes(q)
          );
        }

        if (filter.status && filter.status !== "all") {
          data = data.filter((item) => item.status === filter.status);
        }

        if (filter.country && filter.country !== "ALL") {
          data = data.filter((item) => item.country === filter.country);
        }

        callback(data);
      },
      (error) => {
        console.error("FeatureBrand read error:", error);
        onError?.(error);
      }
    );

    return () => unsub();
  },

  // 🔹 ADD
  async add(feature) {
    const snap = await getDoc(FEATURE_REF);

    const existing = snap.exists()
      ? snap.data().features || []
      : [];

    const newFeature = {
      id: crypto.randomUUID(),
      category: feature.category,
      country: feature.country,
      status: feature.status || "paused",
      BrandDetail: feature.BrandDetail || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const updatedList = [...existing, newFeature];

    if (!snap.exists()) {
      await setDoc(FEATURE_REF, { features: updatedList });
    } else {
      await updateDoc(FEATURE_REF, { features: updatedList });
    }
  },

  // 🔹 UPDATE
  async update(id, updatedFeature) {
    const snap = await getDoc(FEATURE_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const updatedList = (data.features || []).map((item) =>
      item.id === id
        ? {
            ...item,
            ...updatedFeature,
            updatedAt: serverTimestamp(),
          }
        : item
    );

    await updateDoc(FEATURE_REF, { features: updatedList });
  },

  // 🔹 REMOVE
  async remove(id) {
    const snap = await getDoc(FEATURE_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const filtered = (data.features || []).filter(
      (item) => item.id !== id
    );

    await updateDoc(FEATURE_REF, { features: filtered });
  },

  // 🔹 BULK DELETE
  async bulkDelete(ids = []) {
    const snap = await getDoc(FEATURE_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const filtered = (data.features || []).filter(
      (item) => !ids.includes(item.id)
    );

    await updateDoc(FEATURE_REF, { features: filtered });
  }
};
