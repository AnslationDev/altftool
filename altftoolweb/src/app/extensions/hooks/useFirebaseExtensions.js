"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; 

export function useFirebaseExtensions() {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const PROJECT_ID = "altftool"; // replace with your actual project ID

  useEffect(() => {
    async function fetchExtensions() {
      try {
        const colRef = collection(db, "projects", PROJECT_ID, "extensions");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map((doc) => ({
          slug: doc.id,
          ...doc.data(),
        }));
        // Sort by name alphabetically (mirrors getSortedExtensions behaviour)
        data.sort((a, b) => a.name?.localeCompare(b.name));
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