import { useEffect, useState } from "react";
import { getFirebaseVideoCategories } from "../services/firebaseTrendingVideos";
import { categories as fallbackCategories } from "../data/content";

export function useTrendingCategories(limit = 4) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setLoading(true);

      try {
        const data = await getFirebaseVideoCategories(limit);
        if (active) {
          setCategories(data.length ? data : fallbackCategories.slice(1, limit + 1));
        }
      } catch (error) {
        console.error("Failed to load trending categories:", error);
        if (active) {
          setCategories(fallbackCategories.slice(1, limit + 1));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [limit]);

  return { categories, loading };
}
