"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { getCachedFirebaseRead } from "@/lib/firebaseCache";

const PROJECT_ID = "altftool";

export function useFirebaseExtensions() {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExtensions() {
      try {
        const data = await getCachedFirebaseRead("extensions:list", async () => {
          const colRef = collection(db, "projects", PROJECT_ID, "extensions");
          const snapshot = await getDocs(colRef);
          const rows = snapshot.docs.map((doc) => ({
            slug: doc.id,
            ...doc.data(),
          }));

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
