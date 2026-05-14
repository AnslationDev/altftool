"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { normalizeExtension, isDisplayableExtension } from "@altftool/core/firebaseContent";
import { ALTFT_EXTENSIONS_COLLECTION_PATH } from "@altftool/core/firebasePaths";

export function useFirebaseExtensions() {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExtensions() {
      try {
        const data = await getCachedFirebaseRead("extensions:list", async () => {
          const colRef = collection(db, ...ALTFT_EXTENSIONS_COLLECTION_PATH);
          const snapshot = await getDocs(colRef);
          const rows = snapshot.docs
            .map((doc) => normalizeExtension(doc.data(), doc.id))
            .filter(isDisplayableExtension);

          rows.sort((a, b) => a.name?.localeCompare(b.name));
          return rows;
        }, 120000);

        setExtensions(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchExtensions();
  }, []);

  return { extensions, loading, error };
}
