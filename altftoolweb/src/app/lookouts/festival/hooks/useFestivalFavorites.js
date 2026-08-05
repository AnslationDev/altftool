"use client";

import { useCallback } from "react";
import useLocalStorageState from "./useLocalStorageState";

const STORAGE_KEY = "festival-explorer:favorites";

export default function useFestivalFavorites() {
  const [favorites, setFavorites] = useLocalStorageState(STORAGE_KEY, []);

  const isFavorite = useCallback((slug) => favorites.includes(slug), [favorites]);

  const toggleFavorite = useCallback(
    (slug) => {
      setFavorites(favorites.includes(slug) ? favorites.filter((s) => s !== slug) : [...favorites, slug]);
    },
    [favorites, setFavorites],
  );

  return { favorites, isFavorite, toggleFavorite };
}
