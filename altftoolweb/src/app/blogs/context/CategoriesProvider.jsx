// context/CategoriesProvider.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const PROJECT_ID = "altftool";

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */

const CategoriesContext = createContext([]);

/* ─────────────────────────────────────────────
   Cache (session-level)
───────────────────────────────────────────── */

let _cache = null;

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(_cache ?? []);

  useEffect(() => {
    if (_cache) return;

    const fetchCategories = async () => {
      try {
        const list = await getCachedFirebaseRead("blogs:categories", async () => {
          const snap = await getDocs(
            query(
              collection(db, "projects", PROJECT_ID, "categories"),
              orderBy("name", "asc")
            )
          );

          return snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
        }, 120000);

        _cache = list;
        setCategories(list);
      } catch (err) {
        console.error("CategoriesProvider:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  );
}

/* ─────────────────────────────────────────────
   Hook
───────────────────────────────────────────── */

export function useCategories() {
  return useContext(CategoriesContext);
}
