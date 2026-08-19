"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { normalizeExtension, isDisplayableExtension } from "@altftool/core/firebaseContent";
import { ALTFT_EXTENSIONS_COLLECTION_PATH } from "@altftool/core/firebasePaths";

/**
 * Catalog rows for the listing grid. When the server already resolved the
 * catalog (see _data/extensionsSource.js) the rows arrive as `initialExtensions`
 * and no client-side Firestore read happens at all; the hook still exposes
 * `refresh` so an explicit retry can fall back to the live read.
 */
export function useFirebaseExtensions(initialExtensions = []) {
  const seeded = Array.isArray(initialExtensions) && initialExtensions.length > 0;
  const [extensions, setExtensions] = useState(seeded ? initialExtensions : []);
  const [loading, setLoading] = useState(!seeded);
  const [error, setError] = useState(null);
  const hasFetched = useRef(seeded);

  const fetchExtensions = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

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
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchExtensions();
  }, [fetchExtensions]);

  return { extensions, loading, error, refresh: fetchExtensions };
}
