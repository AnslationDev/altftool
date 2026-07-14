"use client";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SMARTLUCKY_PROJECT_ROOT } from "@altftool/core/firebasePaths";

const SETTINGS_DOC = doc(db, ...SMARTLUCKY_PROJECT_ROOT, "settings", "site");

export const siteSettingsService = {
  getDocRef() {
    return SETTINGS_DOC;
  },
  async subscribeOnce() {
    const snap = await getDoc(SETTINGS_DOC);
    return snap.exists() ? snap.data() : null;
  },
  async save(data) {
    await setDoc(SETTINGS_DOC, data, { merge: true });
  },
};
