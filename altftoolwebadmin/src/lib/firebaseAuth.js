import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";
import { firebaseApp } from "./firebaseApp";

function createAuth(appInstance) {
  if (typeof window === "undefined") return getAuth(appInstance);
  if (globalThis.__ALTFT_AUTH__) return globalThis.__ALTFT_AUTH__;

  let instance;
  try {
    instance = initializeAuth(appInstance, {
      persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
        inMemoryPersistence,
      ],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    instance = getAuth(appInstance);
  }
  globalThis.__ALTFT_AUTH__ = instance;
  return instance;
}

export const auth = createAuth(firebaseApp);
