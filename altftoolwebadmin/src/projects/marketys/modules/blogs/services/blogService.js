import { collection, getDocs, query, orderBy, limit, startAfter, doc, getDoc, addDoc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "marketys";
const COLLECTION = "blogs";

function refs() {
  return collection(db, "projects", PROJECT_ID, COLLECTION);
}

export async function listBlogs(pageSize = 50) {
  const q = query(refs(), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getBlog(id) {
  const d = await getDoc(doc(db, "projects", PROJECT_ID, COLLECTION, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

export async function createBlog(data) {
  return addDoc(refs(), { ...data, createdAt: new Date(), updatedAt: new Date() });
}

export async function updateBlog(id, data) {
  return updateDoc(doc(db, "projects", PROJECT_ID, COLLECTION, id), { ...data, updatedAt: new Date() });
}

export async function deleteBlog(id) {
  return deleteDoc(doc(db, "projects", PROJECT_ID, COLLECTION, id));
}

export async function fetchBlogCount() {
  const snap = await getDocs(refs());
  return snap.size;
}
