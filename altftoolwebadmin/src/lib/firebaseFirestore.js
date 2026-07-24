import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
} from "firebase/firestore";
import { firebaseApp } from "./firebaseApp";

function createFirestore(appInstance) {
  if (typeof window === "undefined") return getFirestore(appInstance);
  if (globalThis.__ALTFT_FIRESTORE__) return globalThis.__ALTFT_FIRESTORE__;

  let instance;
  try {
    instance = initializeFirestore(appInstance, {
      localCache: memoryLocalCache(),
    });
  } catch {
    instance = getFirestore(appInstance);
  }
  globalThis.__ALTFT_FIRESTORE__ = instance;
  return instance;
}

export const db = createFirestore(firebaseApp);
