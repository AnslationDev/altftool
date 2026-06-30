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
  startAfter,
  getCountFromServer,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { getAuth } from "firebase/auth";

import { db, storage } from "@/lib/firebase";
import { statusForWorkflow, WORKFLOW } from "../lib/workflow";
import { chunk, BATCH_BLOG_LIMIT } from "../lib/bulkOps";
import { slugify } from "../lib/slug";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const PROJECT_ID = "altftool";

const col = (module) =>
  collection(db, "projects", PROJECT_ID, module);

const docRef = (module, id) =>
  doc(db, "projects", PROJECT_ID, module, id);

/* ─────────────────────────────────────────────
   Categories
───────────────────────────────────────────── */

export async function fetchCategories() {
  const q = query(col("categories"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
}

// Categories that must always be selectable even if they were never written
// to the `categories` collection (e.g. the editorial-only "Tools" category
// that exists on published posts but was never registered as a category doc).
export const GUARANTEED_BLOG_CATEGORIES = ["Tools"];

function mergeGuaranteedCategories(names) {
  const list = Array.isArray(names) ? names.filter(Boolean) : [];
  const seen = new Set(list.map((n) => String(n).toLowerCase()));
  for (const extra of GUARANTEED_BLOG_CATEGORIES) {
    if (extra && !seen.has(extra.toLowerCase())) {
      list.push(extra);
      seen.add(extra.toLowerCase());
    }
  }
  return list;
};

export const fetchCategoryNames = async () => {
  const snapshot = await getDocs(col("categories"));
  return mergeGuaranteedCategories(snapshot.docs.map((doc) => doc.data().name));
};

export async function createCategories(names) {
  return Promise.all(
    names.map(async (name) => {
      const refDoc = doc(col("categories"));
      await setDoc(refDoc, {
        name,
        createdAt: serverTimestamp(),
      });
      return refDoc;
    })
  );
}

export async function deleteCategory(id) {
  await deleteDoc(docRef("categories", id));
}

/* ─────────────────────────────────────────────
   Blog Reads
───────────────────────────────────────────── */

export async function fetchBlogById(id) {
  const snap = await getDoc(docRef("blogs", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchAllBlogs() {
  const snap = await getDocs(col("blogs"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ─────────────────────────────────────────────
   Cached "fetch all" used by the Blog Management
   screen so global search / filter / sort run
   instantly in-memory across every blog. The cache
   is invalidated by any local mutation below.
───────────────────────────────────────────── */

let _allBlogsCache = null;
let _allBlogsPromise = null;

export function invalidateBlogsCache() {
  _allBlogsCache = null;
  _allBlogsPromise = null;
}

export async function fetchAllBlogsCached({ force = false } = {}) {
  if (!force && _allBlogsCache) return _allBlogsCache;
  if (!force && _allBlogsPromise) return _allBlogsPromise;

  _allBlogsPromise = fetchAllBlogs()
    .then((blogs) => {
      _allBlogsCache = blogs;
      _allBlogsPromise = null;
      return blogs;
    })
    .catch((err) => {
      _allBlogsPromise = null;
      throw err;
    });

  return _allBlogsPromise;
}

export async function fetchBlogCount() {
  const snap = await getCountFromServer(col("blogs"));
  return snap.data().count;
}

export async function fetchBlogsPage({ pageSize, cursor }) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  if (cursor) constraints.push(startAfter(cursor));

  const q = query(col("blogs"), ...constraints);
  const snap = await getDocs(q);

  const blogs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { blogs, lastDoc };
}

/* ─────────────────────────────────────────────
   Blog Writes
───────────────────────────────────────────── */

/* Keep a normalized `slugLower` alongside any slug write so uniqueness can be
   enforced with a simple equality query (and stays consistent with the public
   `/blogs/[slug]` URL). */
function withSlugLower(payload = {}) {
  return payload.slug ? { ...payload, slugLower: slugify(payload.slug) } : payload;
}

export async function createBlog(payload) {
  const refDoc = doc(col("blogs"));

  await setDoc(refDoc, {
    ...withSlugLower(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  invalidateBlogsCache();
  return refDoc;
}

export async function updateBlog(id, payload) {
  await updateDoc(docRef("blogs", id), {
    ...withSlugLower(payload),
    updatedAt: serverTimestamp(),
  });
  invalidateBlogsCache();
}

/* ── Slug uniqueness (DB-level guard) ── */
export async function fetchBlogBySlug(slug) {
  const lower = slugify(slug);
  if (!lower) return null;
  const q = query(col("blogs"), where("slugLower", "==", lower), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function isSlugTaken(slug, currentId = "") {
  const existing = await fetchBlogBySlug(slug);
  return Boolean(existing && existing.id !== currentId);
}

/* On-edit revalidation — asks the admin bridge route to revalidate the public
   blog URL (and sitemap) so published changes appear without waiting for ISR.
   Best-effort and non-blocking: never throws into the save flow. */
export async function requestBlogRevalidation(slug) {
  if (!slug) return;
  try {
    const user = getAuth().currentUser;
    const token = user ? await user.getIdToken() : "local-dev-admin-token";
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    // 1. Revalidate the public page + sitemap cache.
    await fetch("/api/blogs/revalidate", {
      method: "POST",
      headers,
      body: JSON.stringify({ slug }),
      keepalive: true,
    });

    // 2. Best-effort: re-submit the sitemap to Search Console so Google
    //    re-crawls the change automatically (no manual re-indexing needed).
    fetch("/api/seo/gsc/sitemaps", {
      method: "POST",
      headers,
      body: JSON.stringify({}),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    console.warn("[revalidate] non-blocking request failed", err);
  }
}

function cleanRollbackFix(fix = {}) {
  return {
    from: String(fix.from || "").slice(0, 300),
    href: String(fix.href || "").slice(0, 500),
    kind: String(fix.kind || "link-fix").slice(0, 80),
    label: String(fix.label || "Link fix").slice(0, 160),
    to: String(fix.to || "").slice(0, 300),
  };
}

export async function applyBlogDescriptionWithRollback({
  blog,
  description,
  fixes = [],
  mode = "safe",
  source = "quality-center",
}) {
  if (!blog?.id) throw new Error("Blog id is required for rollback-safe update.");

  const rollbackRef = doc(col("blogQualityRollbacks"));
  const batch = writeBatch(db);
  const previousDescription = String(blog.description || blog.content || blog.body || "");
  const nextDescription = String(description || "");
  const normalizedFixes = fixes.slice(0, 30).map(cleanRollbackFix);

  batch.set(rollbackRef, {
    blogId: blog.id,
    blogTitle: blog.heading || blog.title || "Untitled blog",
    blogSlug: blog.slug || "",
    source,
    mode,
    fixCount: fixes.length,
    fixes: normalizedFixes,
    previousDescription,
    nextDescription,
    restoredAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.update(docRef("blogs", blog.id), {
    description: nextDescription,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
  return rollbackRef.id;
}

export async function fetchRecentBlogQualityRollbacks(pageSize = 8) {
  const q = query(col("blogQualityRollbacks"), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function restoreBlogQualityRollback(rollback) {
  if (!rollback?.id || !rollback?.blogId) throw new Error("Rollback snapshot is incomplete.");

  const batch = writeBatch(db);
  batch.update(docRef("blogs", rollback.blogId), {
    description: String(rollback.previousDescription || ""),
    updatedAt: serverTimestamp(),
  });
  batch.update(docRef("blogQualityRollbacks", rollback.id), {
    restoredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function updateBlogImage(id, imageUrl) {
  await updateDoc(docRef("blogs", id), {
    image: imageUrl,
  });
}

export async function updateBlogStatus(id, status) {
  await updateDoc(docRef("blogs", id), {
    status,
  });
  invalidateBlogsCache();
}

/* ─────────────────────────────────────────────
   Workflow + scheduling (additive, backward compatible).
   `status` (public field) is always kept consistent with
   `workflowState`. Scheduling stores `publishAt` while the
   doc remains status:"draft" until a server job flips it.
───────────────────────────────────────────── */

export async function updateBlogWorkflow(id, { workflowState, publishAt = null, actor = "" } = {}) {
  const payload = {
    workflowState,
    status: statusForWorkflow(workflowState),
    updatedAt: serverTimestamp(),
  };

  if (workflowState === WORKFLOW.SCHEDULED && publishAt) {
    payload.publishAt = publishAt instanceof Date ? publishAt : new Date(publishAt);
  } else {
    payload.publishAt = null;
  }

  if (workflowState === WORKFLOW.SEO_VALIDATION) {
    payload.seoValidatedAt = serverTimestamp();
    if (actor) payload.seoValidatedBy = actor;
  }
  if (workflowState === WORKFLOW.PUBLISHED) {
    payload.publishedAt = serverTimestamp();
  }

  await updateDoc(docRef("blogs", id), payload);
  invalidateBlogsCache();
  return payload.status;
}

/* ─────────────────────────────────────────────
   Version history — full editable-field snapshots.
   Generalises the prior `blogQualityRollbacks` pattern to a
   first-class `blogRevisions` collection (write-before-mutate).
───────────────────────────────────────────── */

const REVISION_FIELDS = [
  "heading", "slug", "author", "authorRole", "reviewedBy", "editorialNote",
  "category", "tags", "date", "description", "excerpt",
  "seoTitle", "seoDescription", "image", "imageAlt",
  "sources", "sourceNotes", "status", "workflowState",
  "canonicalOverride", "noindex", "ogTitle", "ogDescription", "ogImage",
  "twitterTitle", "twitterDescription", "publishAt",
];

function buildRevisionSnapshot(blog = {}) {
  const snapshot = {};
  for (const field of REVISION_FIELDS) {
    if (blog[field] !== undefined) snapshot[field] = blog[field];
  }
  return snapshot;
}

export async function saveBlogRevision({ blog, reason = "manual-save", actor = "" } = {}) {
  if (!blog?.id) throw new Error("Blog id is required to snapshot a revision.");
  const revRef = doc(col("blogRevisions"));
  await setDoc(revRef, {
    blogId: blog.id,
    blogTitle: blog.heading || blog.title || "Untitled blog",
    blogSlug: blog.slug || "",
    reason,
    actor,
    snapshot: buildRevisionSnapshot(blog),
    createdAt: serverTimestamp(),
  });
  return revRef.id;
}

export async function fetchBlogRevisions(blogId, pageSize = 25) {
  const q = query(
    col("blogRevisions"),
    where("blogId", "==", blogId),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Restore a revision: snapshot the CURRENT state first (so restore is itself
 * undoable), then apply the revision snapshot back onto the blog.
 */
export async function restoreBlogRevision({ revision, currentBlog, actor = "" } = {}) {
  if (!revision?.snapshot || !revision?.blogId) {
    throw new Error("Revision snapshot is incomplete.");
  }
  if (currentBlog) {
    await saveBlogRevision({ blog: currentBlog, reason: "pre-restore", actor });
  }
  await updateDoc(docRef("blogs", revision.blogId), {
    ...revision.snapshot,
    updatedAt: serverTimestamp(),
  });
  invalidateBlogsCache();
}

/* ─────────────────────────────────────────────
   Bulk operations engine (Phase 3).
   Atomic batched writes (≤500 ops/commit), a revision
   snapshot per blog (full rollback), and a live progress
   doc in `blogBulkJobs`.
───────────────────────────────────────────── */

/**
 * Apply a patch to many blogs as tracked, batched, rollback-safe writes.
 *
 * @param items     [{ id, blog, patch }] — already dry-run filtered to changes
 * @param action    string label (e.g. "seo")
 * @param actor     who ran it (email/uid)
 * @param onProgress ({ done, failed, total }) => void
 * @returns { jobId, total, done, failed, results }
 */
export async function runBulkJob({ items = [], action = "seo", actor = "", onProgress } = {}) {
  const total = items.length;
  const jobRef = doc(col("blogBulkJobs"));

  await setDoc(jobRef, {
    action,
    actor,
    total,
    done: 0,
    failed: 0,
    status: "running",
    itemIds: items.map((i) => i.id),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const results = [];
  let done = 0;
  let failed = 0;

  for (const group of chunk(items, BATCH_BLOG_LIMIT)) {
    const batch = writeBatch(db);
    const groupResults = group.map((item) => {
      const revRef = doc(col("blogRevisions"));
      batch.set(revRef, {
        blogId: item.id,
        blogTitle: item.blog?.heading || item.blog?.title || "Untitled blog",
        blogSlug: item.blog?.slug || "",
        reason: `bulk:${action}`,
        actor,
        snapshot: buildRevisionSnapshot(item.blog || {}),
        createdAt: serverTimestamp(),
      });
      batch.update(docRef("blogs", item.id), { ...item.patch, updatedAt: serverTimestamp() });
      return { id: item.id, revisionId: revRef.id, status: "done" };
    });

    try {
      await batch.commit();
      done += group.length;
    } catch (err) {
      console.error("[bulk-job] batch failed", err);
      failed += group.length;
      groupResults.forEach((r) => { r.status = "failed"; r.error = String(err?.message || err); });
    }

    results.push(...groupResults);
    await updateDoc(jobRef, { done, failed, updatedAt: serverTimestamp() }).catch(() => {});
    if (typeof onProgress === "function") onProgress({ done, failed, total });
  }

  const status = failed === 0 ? "done" : done === 0 ? "failed" : "partial";
  await updateDoc(jobRef, {
    status,
    results,
    finishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(() => {});

  invalidateBlogsCache();
  return { jobId: jobRef.id, total, done, failed, status, results };
}

/** Restore every blog touched by a job to its pre-job revision snapshot. */
export async function rollbackBulkJob({ jobId, results = [] } = {}) {
  const restorable = results.filter((r) => r.status === "done" && r.revisionId);

  const snapshots = await Promise.all(
    restorable.map(async (r) => {
      const snap = await getDoc(doc(col("blogRevisions"), r.revisionId));
      return snap.exists() ? { id: r.id, snapshot: snap.data().snapshot || {} } : null;
    }),
  );

  let restored = 0;
  for (const group of chunk(snapshots.filter(Boolean), BATCH_BLOG_LIMIT)) {
    const batch = writeBatch(db);
    for (const item of group) {
      batch.update(docRef("blogs", item.id), { ...item.snapshot, updatedAt: serverTimestamp() });
    }
    await batch.commit();
    restored += group.length;
  }

  if (jobId) {
    await updateDoc(doc(col("blogBulkJobs"), jobId), {
      status: "rolled_back",
      rolledBackAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {});
  }

  invalidateBlogsCache();
  return { restored };
}

export async function fetchRecentBulkJobs(pageSize = 10) {
  const q = query(col("blogBulkJobs"), orderBy("createdAt", "desc"), limit(pageSize));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteBlog(id) {
  await deleteDoc(docRef("blogs", id));
  invalidateBlogsCache();
}

export async function bulkDeleteBlogs(ids) {
  await Promise.all(ids.map((id) => deleteDoc(docRef("blogs", id))));
  invalidateBlogsCache();
}

/* ─────────────────────────────────────────────
   Storage
───────────────────────────────────────────── */

export function uploadBlogImage({ file, blogId, onProgress, onTaskReady }) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `blogs/${blogId}`);
    const task = uploadBytesResumable(storageRef, file);

    if (onTaskReady) onTaskReady(task);

    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          onProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          );
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

/* ─────────────────────────────────────────────
   Comments (Realtime)
───────────────────────────────────────────── */

export function subscribeToComments(blogId, onUpdate, onError) {
  const q = query(
    collection(db, "projects", PROJECT_ID, "blogs", blogId, "comments"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) =>
      onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function deleteComment(blogId, commentId) {
  const ref = doc(
    db,
    "projects",
    PROJECT_ID,
    "blogs",
    blogId,
    "comments",
    commentId
  );

  await deleteDoc(ref);
}
