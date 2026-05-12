"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROJECT_ID = "altftool";

export function useFirebaseData() {
  const [brands, setBrands] = useState([]);
  const [hero, setHero] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        /* ── Hero + Sections ── */
        const dynamicRef = doc(db, "projects", PROJECT_ID, "navigation", "dynamic");
        const dynamicSnap = await getDoc(dynamicRef);
        if (dynamicSnap.exists()) {
          const data = dynamicSnap.data();
          setHero(data.hero || null);
          setSections(data.sections || []);
        }

        /* ── Brands (active only) ── */
        const colRef = collection(db, "projects", PROJECT_ID, "navigation", "data", "items");
        const snapshot = await getDocs(colRef);
        const brandsData = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((b) => b.status === "active");

        setBrands(brandsData);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  return { brands, hero, sections, loading, error };
}