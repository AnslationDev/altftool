// Landing Page CMS data layer — mirrors the blogs service: all Firestore /
// Storage access for landing pages lives here, namespaced under
// projects/altftool/landers (+ landerRevisions), so pages never touch Firestore
// directly.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "@/lib/firebaseFirestore";
import { storage } from "@/lib/firebaseStorage";
import { newLanderDoc } from "../lib/schema";

const PROJECT_ID = "altftool";
const col = (name) => collection(db, "projects", PROJECT_ID, name);
const docRef = (name, id) => doc(db, "projects", PROJECT_ID, name, id);

/* ------------------------------- slug helpers ------------------------------ */

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function withSlugLower(data) {
  const slug = slugify(data.slug || data.title || "");
  return { ...data, slug, slugLower: slug.toLowerCase() };
}

export async function isSlugTaken(slug, exceptId = null) {
  const s = slugify(slug).toLowerCase();
  if (!s) return false;
  const snap = await getDocs(query(col("landers"), where("slugLower", "==", s), limit(1)));
  return snap.docs.some((d) => d.id !== exceptId);
}

/* --------------------------------- reads ---------------------------------- */

// Live list for the admin table.
export function subscribeLanders(onData, onError) {
  const q = query(col("landers"), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError?.(err),
  );
}

export async function fetchLander(id) {
  const snap = await getDoc(docRef("landers", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* --------------------------------- writes --------------------------------- */

export async function createLander({ title = "", slug = "", author = null } = {}) {
  const base = withSlugLower(newLanderDoc({ title, slug: slug || title }));
  const payload = { ...base, author, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const created = await addDoc(col("landers"), payload);
  return created.id;
}

export async function updateLander(id, patch, { revisionReason = null, actor = null } = {}) {
  const clean = patch.slug != null || patch.title != null ? withSlugLower({ ...patch }) : { ...patch };
  await updateDoc(docRef("landers", id), { ...clean, updatedAt: serverTimestamp() });
  if (revisionReason) {
    // Snapshot the freshly-saved state (fire-and-forget; never blocks the save).
    fetchLander(id)
      .then((full) => full && saveLanderRevision({ lander: full, reason: revisionReason, actor }))
      .catch(() => {});
  }
}

export async function setLanderStatus(id, status) {
  const patch = { status, updatedAt: serverTimestamp() };
  if (status === "published") patch.publishedAt = serverTimestamp();
  await updateDoc(docRef("landers", id), patch);
}

export async function deleteLander(id) {
  await deleteDoc(docRef("landers", id));
}

export async function duplicateLander(id) {
  const src = await fetchLander(id);
  if (!src) throw new Error("Landing page not found");
  const { id: _omit, createdAt, updatedAt, publishedAt, ...rest } = src;
  let slug = `${src.slug || "page"}-copy`;
  for (let i = 2; await isSlugTaken(slug); i += 1) slug = `${src.slug || "page"}-copy-${i}`;
  const payload = withSlugLower({
    ...rest,
    title: `${src.title || "Untitled"} (Copy)`,
    slug,
    status: "draft",
  });
  const created = await addDoc(col("landers"), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return created.id;
}

/* -------------------------------- revisions ------------------------------- */

const REVISION_FIELDS = ["title", "slug", "status", "seo", "theme", "sections", "ads", "schema", "publishAt", "expireAt"];

export async function saveLanderRevision({ lander, reason = "manual", actor = null }) {
  if (!lander?.id) return;
  const snapshot = REVISION_FIELDS.reduce((acc, f) => {
    if (lander[f] !== undefined) acc[f] = lander[f];
    return acc;
  }, {});
  await addDoc(col("landerRevisions"), {
    landerId: lander.id,
    landerTitle: lander.title || "",
    landerSlug: lander.slug || "",
    reason,
    actor,
    snapshot,
    createdAt: serverTimestamp(),
  });
}

export async function fetchLanderRevisions(landerId, max = 30) {
  const q = query(
    col("landerRevisions"),
    where("landerId", "==", landerId),
    orderBy("createdAt", "desc"),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* --------------------------------- media ---------------------------------- */

export function uploadLanderImage({ file, landerId, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("No file")); return; }
    const ext = (file.name?.split(".").pop() || "img").toLowerCase();
    const path = `landers/${landerId || "unassigned"}/${Date.now()}.${ext}`;
    const task = uploadBytesResumable(ref(storage, path), file);
    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try { resolve(await getDownloadURL(task.snapshot.ref)); } catch (e) { reject(e); }
      },
    );
  });
}
