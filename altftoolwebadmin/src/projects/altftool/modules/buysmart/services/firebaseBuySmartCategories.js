
// import {
//   doc,
//   onSnapshot,
//   updateDoc,
//   arrayUnion,
//   getDoc,
//   serverTimestamp
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { dualWrite, getFirestoreRefs } from "@/lib/dualWrite";


// export const ROOT = ["projects", "altftool", "buySmart", "categories" ];
// const CATEGORY_REF = doc(db, ...ROOT);
// const { newDocRef: CATEGORY_NEW_REF } = getFirestoreRefs(...ROOT);

// export const firebaseBuySmartCategoriesSource = {
  
//   // 🔹 GET ALL CATEGORIES (Realtime)
//   subscribe(callback, onError) {
//     const unsubNew = onSnapshot(
//       CATEGORY_NEW_REF,
//       (snap) => {
//         if (!snap.exists()) return;
//         const data = snap.data().banner || [];
//         callback(data);
//       },
//       (error) => {
//         console.error("Category read error:", error);
//         onError?.(error);
//       }
//     );

//     const unsubOld = onSnapshot(
//       CATEGORY_REF,
//       (snap) => {
//         const data = snap.exists() ? snap.data().banner || [] : [];
//         callback(data);
//       },
//       (error) => {
//         console.error("Category read error:", error);
//         onError?.(error);
//       }
//     );

//     return () => { try { unsubNew?.(); } catch {} try { unsubOld?.(); } catch {} };
//   },

//   // 🔹 ADD SINGLE CATEGORY
//   async add(categories) {
//     const newCategories = {
//       id: crypto.randomUUID(),
//       title: categories.title,
//       disc:categories.disc,
//       discount:categories.discount,
//       img:categories.img,
//       link: categories.link,
//       category:categories.category,
//       status:categories.status || "active",
//       country : categories.country,
//       createdAt: serverTimestamp(), 
//       updatedAt: serverTimestamp(), 
//     };

//     // updateDoc + arrayUnion must be computed against existing data for dual write
//     const snap = await getDoc(CATEGORY_REF);
//     const existing = snap.exists() ? snap.data().banner || [] : [];
//     await dualWrite.set(MODULE, DOC_ID, { banner: [...existing, newCategories] }, { merge: true });
//   },

//   // 🔹 UPDATE CATEGORY BY ID
//   async update(id, updatedCategories) {
//     const snap = await getDoc(CATEGORY_REF);
//     const data = snap.data();

//     const updatedList = (data.banner || []).map((h) =>
//       h.id === id
//         ? { ...h, ...updatedCategories,
//           updatedAt: serverTimestamp(),
//            }
//         : h
//     );

//     await dualWrite.update(MODULE, DOC_ID, { banner: updatedList });
//   },

//   // 🔹 DELETE CATEGORY BY ID
//   // async remove(id, banner) {
//   //   const filtered = banner.filter(h => h.id !== id);

//   //   await updateDoc(CATEGORY_REF, {
//   //     banner: filtered
//   //   });
//   // },
//   async remove(id) {
//     const snap = await getDoc(CATEGORY_REF);
//     const data = snap.data();
  
//     const currentBanner = data?.banner || [];
  
//     const filtered = currentBanner.filter(item => item.id !== id);
  
//     await updateDoc(CATEGORY_REF, {
//       banner: filtered
//     });
//     await dualWrite.update(MODULE, DOC_ID, { banner: filtered });
//   },

//   async bulkDelete(ids = [], banner = []) {
//     const filtered = banner.filter(item => !ids.includes(item.id));
  
//     await dualWrite.update(MODULE, DOC_ID, { banner: filtered });
//   },

//   // 🔹 CSV BULK UPLOAD (REPLACE ALL)
//   async bulkUpload(csvData) {
//     try {
//       const snap = await getDoc(CATEGORY_REF);
//       const existingData = snap.exists() ? snap.data().banner || [] : [];
  
//       console.log("Existing Data:", existingData);
//       console.log("CSV Raw Data:", csvData);
  
//       const formattedData = csvData
//         .filter(row => row.title && row.link)
//         .map(row => ({
//           id: crypto.randomUUID(),
//           title: row.title.trim(),
//           link: row.link.trim(),
//           category:row.category.trim(),
//           status:row.status.trim() || "Active",
//           country:row.country.trim() || "ALL",
//           img: row.img
//           ? row.img.toString().trim()
//           : "",
//           createdAt: Date.now()
//         }));
  
//       console.log("Formatted CSV Data:", formattedData);
  
//       if (formattedData.length === 0) {
//         alert("CSV parsed but no valid rows found.");
//         return;
//       }
  
//       const finalData = [...existingData, ...formattedData];
  
//       await dualWrite.update(MODULE, DOC_ID, { banner: finalData });
  
//       console.log("Final Data Saved:", finalData);
  
//     } catch (error) {
//       console.error("Bulk upload error:", error);
//     }
//   }
// };


"use client";

import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import {
  cleanText,
  normalizeInteger,
  normalizeBuySmartCategory,
  normalizeOfferType,
  normalizePercent,
  normalizeStatus,
  normalizeVerificationStatus,
  toBoolean,
} from "@altftool/core/buysmart";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";

export const ROOT = buySmartDocPath("categories");
const CATEGORY_REF = doc(db, ...ROOT);

function serializeCategory(category = {}) {
  const normalized = normalizeBuySmartCategory(category);
  const verificationStatus = normalizeVerificationStatus(
    category.verificationStatus || (category.verified ? "verified" : "pending"),
  );

  return {
    title: normalized.title,
    disc: cleanText(category.disc),
    discount: cleanText(category.discount),
    offerType: normalizeOfferType(category.offerType),
    couponCode: normalized.code,
    code: normalized.code,
    cashback: normalized.cashback,
    points: normalized.points,
    audience: normalized.audience,
    expiresAt: normalized.expiresAt,
    terms: normalized.terms,
    verificationStatus,
    verified: verificationStatus === "verified",
    lastVerifiedAt: cleanText(category.lastVerifiedAt || normalized.lastVerifiedAt),
    successRate: normalizePercent(category.successRate ?? normalized.successRate, 0),
    workingVotes: normalizeInteger(category.workingVotes ?? normalized.workingVotes, 0),
    failedVotes: normalizeInteger(category.failedVotes ?? normalized.failedVotes, 0),
    reviewNote: cleanText(category.reviewNote || normalized.reviewNote),
    exclusive: toBoolean(category.exclusive || category.isExclusive, false),
    featured: toBoolean(category.featured || category.isFeatured, false),
    priority: normalized.priority,
    img: normalized.img,
    image: normalized.image,
    link: normalized.link === "#" ? "" : normalized.link,
    category: normalized.category,
    status: normalizeStatus(category.status),
    country: cleanText(category.country) || "ALL",
  };
}

export const firebaseBuySmartCategoriesSource = {
  
  // 🔹 GET ALL CATEGORIES (Realtime)
  subscribe(callback, onError) {
    const unsub = onSnapshot(
      CATEGORY_REF,
      (snap) => {
        const data = snap.exists() ? snap.data().banner || [] : [];
        callback(data.map(normalizeBuySmartCategory));
      },
      (error) => {
        console.error("Category read error:", error);
        onError?.(error);
      }
    );

    return () => unsub();
  },

  // 🔹 ADD SINGLE CATEGORY
  async add(categories) {
    const newCategories = {
      id: crypto.randomUUID(),
      ...serializeCategory(categories),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const snap = await getDoc(CATEGORY_REF);
    const existing = snap.exists() ? snap.data().banner || [] : [];

    const updatedList = [...existing, newCategories];

    if (!snap.exists()) {
      await setDoc(CATEGORY_REF, { banner: updatedList });
    } else {
      await updateDoc(CATEGORY_REF, { banner: updatedList });
    }
  },

  // 🔹 UPDATE CATEGORY BY ID
  async update(id, updatedCategories) {
    const snap = await getDoc(CATEGORY_REF);
    if (!snap.exists()) return;

    const data = snap.data();

    const updatedList = (data.banner || []).map((h) => {
      if (h.id !== id) return h;

      return {
        ...h,
        ...serializeCategory({ ...h, ...updatedCategories }),
        updatedAt: serverTimestamp(),
      };
    });

    await updateDoc(CATEGORY_REF, { banner: updatedList });
  },

  // 🔹 DELETE CATEGORY BY ID
  async remove(id) {
    const snap = await getDoc(CATEGORY_REF);
    if (!snap.exists()) return;

    const data = snap.data();
    const currentBanner = data?.banner || [];

    const filtered = currentBanner.filter((item) => item.id !== id);

    await updateDoc(CATEGORY_REF, {
      banner: filtered,
    });
  },

  // 🔹 BULK DELETE
  async bulkDelete(ids = [], banner = []) {
    const filtered = banner.filter((item) => !ids.includes(item.id));

    await updateDoc(CATEGORY_REF, {
      banner: filtered,
    });
  },

  // 🔹 CSV BULK UPLOAD (APPEND)
  async bulkUpload(csvData) {
    try {
      const snap = await getDoc(CATEGORY_REF);
      const existingData = snap.exists() ? snap.data().banner || [] : [];

      const formattedData = csvData
        .filter((row) => row.title && row.link)
        .map((row) => ({
          id: crypto.randomUUID(),
          ...serializeCategory({
            ...row,
            image: row.image || row.imageUrl || row.logo,
            img: row.img || row.image || row.imageUrl || row.logo,
            couponCode: row.couponCode || row.code || row.promoCode,
            offerType: row.offerType || row.type,
          }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));

      if (formattedData.length === 0) {
        console.warn("No valid CSV rows found");
        return;
      }

      const finalData = [...existingData, ...formattedData];

      if (!snap.exists()) {
        await setDoc(CATEGORY_REF, { banner: finalData });
      } else {
        await updateDoc(CATEGORY_REF, { banner: finalData });
      }

    } catch (error) {
      console.error("Bulk upload error:", error);
    }
  }
};
