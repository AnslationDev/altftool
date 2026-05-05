import {
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDocs,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

import { getCollectionRef, getDocRef } from "./config";

export const brandService = {

  // ================= SUBSCRIBE =================
  subscribe(categoryId, subCategoryId, callback) {
    const q = query(
      getCollectionRef("brands"),
      where("categoryId", "==", categoryId),
      where("subCategoryId", "==", subCategoryId)
    );

    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  subscribeAll(callback) {
    return onSnapshot(getCollectionRef("brands"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  },

  // ================= SHIFT RANKING =================
  async shiftRankings(categoryId, subCategoryId, newRank, excludeId = null) {
    const q = query(
      getCollectionRef("brands"),
      where("categoryId", "==", categoryId),
      where("subCategoryId", "==", subCategoryId)
    );

    const snap = await getDocs(q);

    // ⚠️ IMPORTANT: correct db reference
    const batch = writeBatch(getCollectionRef("brands").firestore);

    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();

      if (excludeId && docSnap.id === excludeId) return;

      if (Number(data.ranking) >= Number(newRank)) {
        batch.update(docSnap.ref, {
          ranking: Number(data.ranking) + 1,
        });
      }
    });

    await batch.commit();
  },

  // ================= ADD =================
  async add(data) {
    return await addDoc(getCollectionRef("brands"), {
      name: data.name,
      heading: data.heading,
      description: data.description,
      rating: Number(data.rating || 0),
      ranking: Number(data.ranking || 0),
      brandLink: data.brandLink || "",
      country: data.country || "IN",

      logo: data.logo || "",
      images: data.images || [],

      specification: data.specification || [],
      additionalBenefit: data.additionalBenefit || [],
      feature: data.feature || [],

      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId,

      status: data.status || "active",
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(), 
    });
  },

  // ================= UPDATE =================
  async update(id, data) {
    return await updateDoc(getDocRef("brands", id), {
      ...data,
      ranking: Number(data.ranking || 0),
      updatedAt: serverTimestamp(), 
    });
  },

  // ================= DELETE =================
  async remove(id) {
    return await deleteDoc(getDocRef("brands", id));
  },
};