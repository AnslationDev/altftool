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
import { db } from "@/lib/firebase";

const PROJECT_ID = "dailyhnt";
const TESTIMONIALS_PATH = ["projects", PROJECT_ID, "testimonials"];

export function subscribeTestimonials(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...TESTIMONIALS_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createTestimonial(payload) {
  await addDoc(collection(db, ...TESTIMONIALS_PATH), {
    ...normalizeTestimonial(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTestimonial(id, payload) {
  await updateDoc(doc(db, ...TESTIMONIALS_PATH, id), {
    ...normalizeTestimonial(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTestimonial(id) {
  await deleteDoc(doc(db, ...TESTIMONIALS_PATH, id));
}

export async function toggleTestimonialStatus(id, active) {
  await updateDoc(doc(db, ...TESTIMONIALS_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

function normalizeTestimonial(payload) {
  const rating = Math.min(5, Math.max(1, Math.round(Number(payload.rating) || 5)));
  return {
    quote: String(payload.quote || "").trim(),
    name: String(payload.name || "").trim(),
    role: String(payload.role || "").trim(),
    company: String(payload.company || "").trim(),
    rating,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
