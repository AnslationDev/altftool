import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROJECT_ID = "altftool";

/**
 * Build old + new Firestore references for a module.
 *
 * New structure:
 *   projects/{projectId}/{moduleName}/{docId}
 */
export function getFirestoreRefs(moduleName, docId) {
  if (!moduleName) throw new Error("getFirestoreRefs: moduleName is required");

  const oldCollectionRef = collection(db, moduleName);
  const newCollectionRef = collection(db, "projects", PROJECT_ID, moduleName);

  if (!docId) {
    return {
      oldCollectionRef,
      newDocRef: (id) => doc(db, "projects", PROJECT_ID, moduleName, id),
      newCollectionRef,
    };
  }

  return {
    oldDocRef: doc(db, moduleName, docId),
    newDocRef: doc(db, "projects", PROJECT_ID, moduleName, docId),
  };
}

function logDualWriteError(op, moduleName, docId, err) {
  console.error(`[dualWrite:${op}] ${moduleName}${docId ? `/${docId}` : ""}`, err);
}

/**
 * Dual write helper.
 *
 * - add: write to old collection first, then set same docId in new structure
 * - set/update/delete: perform on both old + new doc refs
 */
export const dualWrite = {
  async add(moduleName, data) {
    try {
      const { oldCollectionRef, newDocRef } = getFirestoreRefs(moduleName);
      const oldSnap = await addDoc(oldCollectionRef, data);
      try {
        await setDoc(newDocRef(oldSnap.id), data);
      } catch (err) {
        logDualWriteError("add:newSet", moduleName, oldSnap.id, err);
      }
      return oldSnap;
    } catch (err) {
      logDualWriteError("add", moduleName, null, err);
      throw err;
    }
  },

  async set(moduleName, docId, data, options) {
    const { oldDocRef, newDocRef } = getFirestoreRefs(moduleName, docId);
    const results = await Promise.allSettled([
      setDoc(oldDocRef, data, options),
      setDoc(newDocRef, data, options),
    ]);

    for (const r of results) {
      if (r.status === "rejected") logDualWriteError("set", moduleName, docId, r.reason);
    }

    // Keep behavior stable: only throw if BOTH failed
    if (results.every((r) => r.status === "rejected")) {
      throw results[0].reason;
    }
  },

  async update(moduleName, docId, updates) {
    const { oldDocRef, newDocRef } = getFirestoreRefs(moduleName, docId);
    const results = await Promise.allSettled([
      updateDoc(oldDocRef, updates),
      updateDoc(newDocRef, updates),
    ]);

    for (const r of results) {
      if (r.status === "rejected") logDualWriteError("update", moduleName, docId, r.reason);
    }

    if (results.every((r) => r.status === "rejected")) {
      throw results[0].reason;
    }
  },

  async delete(moduleName, docId) {
    const { oldDocRef, newDocRef } = getFirestoreRefs(moduleName, docId);
    const results = await Promise.allSettled([
      deleteDoc(oldDocRef),
      deleteDoc(newDocRef),
    ]);

    for (const r of results) {
      if (r.status === "rejected") logDualWriteError("delete", moduleName, docId, r.reason);
    }

    if (results.every((r) => r.status === "rejected")) {
      throw results[0].reason;
    }
  },
};

