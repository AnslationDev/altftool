"use client";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SMARTLUCKY_PROJECT_ROOT } from "@altftool/core/firebasePaths";

/**
 * Contact form submissions stored as a single document:
 * projects/smartlucky/contact/submissions = { items: [...] }
 */
export function getContactSubmissionsDocRef() {
  return doc(db, ...SMARTLUCKY_PROJECT_ROOT, "contact", "submissions");
}

export async function fetchContactSubmissions() {
  const snap = await getDoc(getContactSubmissionsDocRef());
  return snap.exists() ? (snap.data().items || []) : [];
}

export async function saveContactSubmissions(items) {
  await setDoc(
    getContactSubmissionsDocRef(),
    { items, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function addContactSubmission(submission) {
  const current = await fetchContactSubmissions();
  const newItem = {
    ...submission,
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    submittedAt: serverTimestamp(),
  };
  await saveContactSubmissions([newItem, ...current]);
}