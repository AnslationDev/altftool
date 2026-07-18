import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Factory for a singleton settings-doc service (e.g. `projects/<id>/navbar/settings`).
 * Mirrors the subscribe/save shape every carrerbook module hand-writes.
 */
export function createSingletonDocService(pathSegments, defaults = {}) {
  const ref = () => doc(db, ...pathSegments);

  function subscribe(onNext, onError) {
    return onSnapshot(
      ref(),
      (snap) => {
        onNext({ ...defaults, ...(snap.exists() ? snap.data() : {}) });
      },
      onError,
    );
  }

  async function save(payload) {
    await setDoc(ref(), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
  }

  async function reset() {
    await setDoc(ref(), { ...defaults, updatedAt: serverTimestamp() }, { merge: true });
  }

  return { subscribe, save, reset };
}

/**
 * Factory for a collection CRUD service (e.g. `projects/<id>/teamMembers`).
 * `normalize(payload)` shapes/validates a write payload before it's stamped
 * with timestamps and sent to Firestore; it must return a plain object.
 */
export function createCollectionCrudService(pathSegments, { normalize = (p) => p, orderByField = "order" } = {}) {
  const collectionRef = () => collection(db, ...pathSegments);
  const docRef = (id) => doc(db, ...pathSegments, id);

  function subscribe(onNext, onError) {
    const itemsQuery = orderByField
      ? query(collectionRef(), orderBy(orderByField, "asc"))
      : collectionRef();

    return onSnapshot(
      itemsQuery,
      (snap) => {
        onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      onError,
    );
  }

  async function create(payload) {
    const item = normalize(payload);
    const ref = await addDoc(collectionRef(), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  async function update(id, payload) {
    const item = normalize(payload);
    await updateDoc(docRef(id), { ...item, updatedAt: serverTimestamp() });
  }

  async function remove(id) {
    await deleteDoc(docRef(id));
  }

  async function toggleActive(id, active) {
    await updateDoc(docRef(id), { active, updatedAt: serverTimestamp() });
  }

  return { subscribe, create, update, remove, toggleActive };
}
