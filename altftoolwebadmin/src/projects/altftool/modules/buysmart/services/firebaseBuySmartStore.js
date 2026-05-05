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


// export const ROOT = ["projects", "altftool", "buySmart", "store" ];
// const STORE_REF = doc(db, ...ROOT);
// const { newDocRef: STORE_NEW_REF } = getFirestoreRefs(...ROOT);


// export const  firebaseBuySmartStoreSource = {
//    subscribe(callback, filter, onError) {
//         const unsubNew = onSnapshot(
//           STORE_NEW_REF,
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
//           STORE_REF,
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

//        // 🔹 ADD NEW Store (POST)
//           async add(store) {
//             const newstore = {
//               id: crypto.randomUUID(),
//               image:store.image,
//               title: store.title,
//               link: store.link,
//               status: store.status || "paused", 
//               country: store.country, 
//               imageWidth: store.width || null,
//               imageHeight: store.height || null,
//               createdAt: serverTimestamp(), 
//                           updatedAt: serverTimestamp(),
//             };
        
//             const snap = await getDoc(STORE_REF);
//             const existing = snap.exists() ? snap.data().banner || [] : [];
//             await dualWrite.set(MODULE, DOC_ID, { banner: [...existing, newstore] }, { merge: true });
//           },
//           async bulkDelete(ids = [], banner = []) {
//             const filtered = banner.filter(item => !ids.includes(item.id));
          
//             await dualWrite.update(MODULE, DOC_ID, { banner: filtered });
//           },


//            async update(id, updatedstore) {
//                 const snap = await getDoc(STORE_REF);
//                 const data = snap.data();
              
//                 const updatedList = data.banner.map((h) =>
//                   h.id === id ? { ...h, ...updatedstore, 
//                     updatedAt: serverTimestamp(),
//                    } : h
//                 );
              
//                 await dualWrite.update(MODULE, DOC_ID, { banner: updatedList });
//               },
              
//               async remove(id) {
//                 const snap = await getDoc(STORE_REF);
//                 const data = snap.data();
              
//                 const filtered = (data.banner || []).filter(h => h.id !== id);
              
//                 await dualWrite.update(MODULE, DOC_ID, { banner: filtered });
//               }
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

export const ROOT = buySmartDocPath("store");
const STORE_REF = doc(db, ...ROOT);

export const firebaseBuySmartStoreSource = {

  // 🔹 SUBSCRIBE
  subscribe(callback, filter = {}, onError) {
    const unsub = onSnapshot(
      STORE_REF,
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
        console.error("Store read error:", error);
        onError?.(error);
      }
    );

    return () => unsub();
  },

  // 🔹 ADD NEW STORE
  async add(store) {
    const newstore = {
      id: crypto.randomUUID(),
      image: store.image,
      title: store.title,
      link: store.link,
      status: store.status || "paused",
      country: store.country,
      imageWidth: store.width || null,
      imageHeight: store.height || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const snap = await getDoc(STORE_REF);
    const existing = snap.exists() ? snap.data().banner || [] : [];

    const updatedList = [...existing, newstore];

    if (!snap.exists()) {
      await setDoc(STORE_REF, { banner: updatedList });
    } else {
      await updateDoc(STORE_REF, { banner: updatedList });
    }
  },

  // 🔹 UPDATE
  async update(id, updatedstore) {
    const snap = await getDoc(STORE_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const updatedList = (data.banner || []).map((h) =>
      h.id === id
        ? {
            ...h,
            ...updatedstore,
            updatedAt: serverTimestamp(),
          }
        : h
    );

    await updateDoc(STORE_REF, { banner: updatedList });
  },

  // 🔹 DELETE
  async remove(id) {
    const snap = await getDoc(STORE_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const filtered = (data.banner || []).filter(
      (h) => h.id !== id
    );

    await updateDoc(STORE_REF, { banner: filtered });
  },

  // 🔹 BULK DELETE
  async bulkDelete(ids = [], banner = []) {
    const filtered = banner.filter(
      (item) => !ids.includes(item.id)
    );

    await updateDoc(STORE_REF, { banner: filtered });
  }
};
