import {
  addDoc,
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

const PROJECT_ID = "dailyhnt";
const FAQS_PATH = ["projects", PROJECT_ID, "faqs"];

export function subscribeFaqs(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...FAQS_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createFaq(payload) {
  await addDoc(collection(db, ...FAQS_PATH), {
    ...normalizeFaq(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateFaq(id, payload) {
  await updateDoc(doc(db, ...FAQS_PATH, id), {
    ...normalizeFaq(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFaq(id) {
  await deleteDoc(doc(db, ...FAQS_PATH, id));
}

export async function toggleFaqStatus(id, active) {
  await updateDoc(doc(db, ...FAQS_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

function normalizeFaq(payload) {
  return {
    question: String(payload.question || "").trim(),
    answer: String(payload.answer || "").trim(),
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
