// import {
//   doc,
//   getDoc,
//   onSnapshot,
//   updateDoc,
//   arrayUnion,
//   serverTimestamp

// } from "firebase/firestore"
// import {db} from "@/lib/firebase"
// import { dualWrite, getFirestoreRefs } from "@/lib/dualWrite"

// const MODULE = "buySmart";
// const DOC_ID = "trending";
// export const ROOT = ["projects", "altftool", "buySmart", "trending"];
// const TRENDING_REF = doc(db,...ROOT);
// const { newDocRef: TRENDING_NEW_REF } = getFirestoreRefs(...ROOT);


// export const  firebaseBuySmartTrendingSource = {
//    subscribe(callback, filter, onError) {
//         const unsubNew = onSnapshot(
//           TRENDING_NEW_REF,
//           snap => {
//             if (!snap.exists()) return;
//             let data = snap.data().banner || [];
//             if(filter.search){
//               const q = filter.search.toLowerCase();
//               data = data.filter((h) => h.title.toLowerCase().includes(q))
//             }
//             if(filter.status && filter.status !== 'all'){
//               data = data.filter((h) => h.status == filter.status)
//             }
//             callback(data);
//           },
//           error => {
//             console.error("Hero read error:", error);
//             onError?.(error);
//           }
//         );
//         const unsubOld = onSnapshot(
//           TRENDING_REF,
//           snap => {
//             let data = snap.exists() ? snap.data().banner || [] : [];

//             if(filter.search){
//               const q = filter.search.toLowerCase();
//                 data = data.filter((h) => h.title.toLowerCase().includes(q))
//             }
    
//             // filter on status
    
//             if(filter.status && filter.status !== 'all'){
//                data = data.filter((h) => h.status == filter.status)
//             }
//             callback(data);
//           },
//           error => {
//             console.error("Hero read error:", error);
//             onError?.(error);
//           }
//         );
//         return () => { try { unsubNew?.(); } catch {} try { unsubOld?.(); } catch {} };
//       },

//        // 🔹 ADD NEW HERO (POST)
//           async add(trending) {
//             const newtrending = {
//               id: crypto.randomUUID(),
//               image:trending.image,
//               title: trending.title,
//               link: trending.link,
//               createdAt: serverTimestamp(), 
//               updatedAt: serverTimestamp(),
//             };
        
//             const snap = await getDoc(TRENDING_REF);
//             const existing = snap.exists() ? snap.data().banner || [] : [];
//             await dualWrite.set(MODULE, DOC_ID, { banner: [...existing, newtrending] }, { merge: true });
//           },


//            async update(id, updatedTrending) {
//                 const snap = await getDoc(TRENDING_REF);
//                 const data = snap.data();
              
//                 const updatedList = data.banner.map((h) =>
//                   h.id === id ? { ...h, ...updatedTrending,
//                     updatedAt: serverTimestamp(),
//                      } : h
//                 );
              
//                 await dualWrite.update(MODULE, DOC_ID, { banner: updatedList });
//               },
//               async bulkDelete(ids = [], banner = []) {
//                 const filtered = banner.filter(item => !ids.includes(item.id));
              
//                 await dualWrite.update(MODULE, DOC_ID, { banner: filtered });
//               },
              
//               async remove(id, banner) {
//                     const filtered = banner.filter(h => h.id !== id);
                
//                     await dualWrite.update(MODULE, DOC_ID, { banner: filtered });
//                   }
// }


"use client";

import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";

export const ROOT = buySmartDocPath("trending");
const TRENDING_REF = doc(db, ...ROOT);

export const firebaseBuySmartTrendingSource = {

  // 🔹 SUBSCRIBE
  subscribe(callback, filter = {}, onError) {
    const unsub = onSnapshot(
      TRENDING_REF,
      (snap) => {
        let data = snap.exists() ? snap.data().banner || [] : [];

        if (filter.search) {
          const q = filter.search.toLowerCase();
          data = data.filter((h) =>
            h.title?.toLowerCase().includes(q)
          );
        }

        if (filter.status && filter.status !== "all") {
          data = data.filter((h) => h.status == filter.status);
        }

        callback(data);
      },
      (error) => {
        console.error("Trending read error:", error);
        onError?.(error);
      }
    );

    return () => unsub();
  },

  // 🔹 ADD
  async add(trending) {
    const newtrending = {
      id: crypto.randomUUID(),
      image: trending.image,
      title: trending.title,
      link: trending.link,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const snap = await getDoc(TRENDING_REF);
    const existing = snap.exists() ? snap.data().banner || [] : [];

    const updatedList = [...existing, newtrending];

    if (!snap.exists()) {
      await setDoc(TRENDING_REF, { banner: updatedList });
    } else {
      await updateDoc(TRENDING_REF, { banner: updatedList });
    }
  },

  // 🔹 UPDATE
  async update(id, updatedTrending) {
    const snap = await getDoc(TRENDING_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const updatedList = (data.banner || []).map((h) =>
      h.id === id
        ? {
            ...h,
            ...updatedTrending,
            updatedAt: serverTimestamp(),
          }
        : h
    );

    await updateDoc(TRENDING_REF, { banner: updatedList });
  },

  // 🔹 BULK DELETE
  async bulkDelete(ids = []) {
    const snap = await getDoc(TRENDING_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const filtered = (data.banner || []).filter(
      (item) => !ids.includes(item.id)
    );

    await updateDoc(TRENDING_REF, { banner: filtered });
  },

  // 🔹 DELETE
  async remove(id) {
    const snap = await getDoc(TRENDING_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const filtered = (data.banner || []).filter(
      (h) => h.id !== id
    );

    await updateDoc(TRENDING_REF, { banner: filtered });
  }
};
