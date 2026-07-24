"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const LEADS_PATH = ["projects", "coozter", "leads"];

export function subscribeContactLeads(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...LEADS_PATH), orderBy("createdAt", "desc")),
    (snapshot) => {
      onNext(snapshot.docs.map((lead) => ({ id: lead.id, ...lead.data() })));
    },
    onError,
  );
}

export async function updateContactLeadStatus(id, status) {
  await updateDoc(doc(db, ...LEADS_PATH, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteContactLead(id) {
  await deleteDoc(doc(db, ...LEADS_PATH, id));
}
