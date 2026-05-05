import { collection, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const ROOT = ["projects", "altftool", "deals", "data"];

// ✅ FIXED (dynamic path)
export const getCollectionRef = (...path) => {
  return collection(db, ...ROOT, ...path);
};

export const getDocRef = (...path) => {
  return doc(db, ...ROOT, ...path);
};