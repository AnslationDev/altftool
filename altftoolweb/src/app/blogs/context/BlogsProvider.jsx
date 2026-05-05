// context/BlogsProvider.jsx
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const PROJECT_ID = "altftool";

const INITIAL_SIZE = 25; // hero, trending, etc.
const PAGE_SIZE = 12;

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

const blogsCol = () =>
  collection(db, "projects", PROJECT_ID, "blogs");

function buildPaginatedQuery(cat, cursor) {
  const constraints = [
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE),
  ];

  if (cat !== "All") {
    constraints.splice(1, 0, where("category", "==", cat));
  }

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  return query(blogsCol(), ...constraints);
}

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */

const BlogsContext = createContext(null);

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */

export function BlogsProvider({ children }) {
  /* ── Layer 1: Initial Blogs ───────────────── */

  const [initialBlogs, setInitialBlogs] = useState([]);
  const [booting, setBooting] = useState(true);

  /* ── Layer 2: Paginated Blogs ─────────────── */

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [category, setCategory] = useState("All");

  const cursorRef = useRef(null);
  const categoryRef = useRef(category);
  categoryRef.current = category;

  /* ───────────────────────────────────────────
     Layer 1: Fetch initial blogs (once)
  ─────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const initial = await getCachedFirebaseRead("blogs:initial", async () => {
          const snap = await getDocs(
            query(
              blogsCol(),
              where("status", "==", "published"),
              orderBy("createdAt", "desc"),
              limit(INITIAL_SIZE)
            )
          );

          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }, 120000);

        if (!cancelled) setInitialBlogs(initial);
      } catch (err) {
        console.error("BlogsProvider initialBlogs:", err);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ───────────────────────────────────────────
     Layer 2: Fetch page
  ─────────────────────────────────────────── */

  const fetchPage = useCallback(async (cat, cursor, replace = false) => {
    setLoading(true);

    try {
      const snap = await getDocs(buildPaginatedQuery(cat, cursor));

      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setBlogs((prev) => (replace ? docs : [...prev, ...docs]));

      cursorRef.current =
        snap.docs[snap.docs.length - 1] ?? null;

      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("BlogsProvider fetchPage:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ───────────────────────────────────────────
     Reset when category changes
  ─────────────────────────────────────────── */

  useEffect(() => {
    cursorRef.current = null;
    setBlogs([]);
    setHasMore(true);

    fetchPage(category, null, true);
  }, [category, fetchPage]);

  /* ───────────────────────────────────────────
     Load more
  ─────────────────────────────────────────── */

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    fetchPage(categoryRef.current, cursorRef.current);
  }, [loading, hasMore, fetchPage]);

  /* ───────────────────────────────────────────
     Context Value
  ─────────────────────────────────────────── */

  const value = {
    // Layer 1
    initialBlogs,
    booting,

    // Layer 2
    blogs,
    loading,
    hasMore,
    loadMore,

    // Shared
    category,
    setCategory,
  };

  return (
    <BlogsContext.Provider value={value}>
      {children}
    </BlogsContext.Provider>
  );
}

/* ─────────────────────────────────────────────
   Hook
───────────────────────────────────────────── */

export function useBlogs() {
  const ctx = useContext(BlogsContext);

  if (!ctx) {
    throw new Error("useBlogs must be used inside BlogsProvider");
  }

  return ctx;
}
