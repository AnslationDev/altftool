// context/CategoriesProvider.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
        const snap = await getDocs(
          query(
            collection(db, "projects", PROJECT_ID, "categories"),
            orderBy("name", "asc")
          )
        );

        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

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