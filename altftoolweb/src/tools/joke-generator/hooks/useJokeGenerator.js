import { useState, useCallback, useEffect, useRef } from "react";
import {
  FALLBACK_JOKES,
  CATEGORIES,
  API_URL,
  API_CATEGORY_URL,
} from "../utils/jokeData";

const FAVORITES_KEY = "altftool_joke_generator_favorites";

export function useJokeGenerator() {
  const [jokes, setJokes] = useState([]);
  const [currentJoke, setCurrentJoke] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copied, setCopied] = useState(false);
  const [source, setSource] = useState("fallback");
  const [toastMsg, setToastMsg] = useState(null);

  const autoPlayRef = useRef(null);
  const currentJokeRef = useRef(currentJoke);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  const categoryRef = useRef(category);

  useEffect(() => { currentJokeRef.current = currentJoke; }, [currentJoke]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);
  useEffect(() => { categoryRef.current = category; }, [category]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  const fetchFromAPI = useCallback(async (cat) => {
    setLoading(true);
    setError(null);
    try {
      let url = API_URL;
      if (cat && cat !== "All" && cat !== "Random") {
        const apiCat = cat.toLowerCase().replace(/\s+/g, "_");
        url = `${API_CATEGORY_URL}/${apiCat}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("API returned non-OK status");
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.slice(0, 10).map((j) => ({
          id: j.id,
          joke: j.setup ? `${j.setup} ${j.punchline}` : j.joke || `${j.setup} ${j.punchline}`,
          category: j.type || cat || "General",
          author: null,
        }));
        setJokes(mapped);
        setSource("api");
        return mapped;
      } else if (data.setup || data.joke) {
        const mapped = [{
          id: data.id,
          joke: data.setup ? `${data.setup} ${data.punchline}` : data.joke,
          category: data.type || cat || "General",
          author: null,
        }];
        setJokes(mapped);
        setSource("api");
        return mapped;
      }
      throw new Error("Empty response");
    } catch {
      setSource("fallback");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFallbackForCategory = useCallback((cat) => {
    if (cat === "All" || cat === "Random") {
      return FALLBACK_JOKES;
    }
    return FALLBACK_JOKES.filter((j) => j.category === cat);
  }, []);

  const pickRandomFromPool = useCallback((pool, excludeId) => {
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];
    const filtered = excludeId ? pool.filter((j) => j.id !== excludeId) : pool;
    return filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
  }, []);

  const generateJoke = useCallback(async (cat) => {
    const useCat = cat ?? categoryRef.current;
    let pool = [];

    // Try API first
    const apiJokes = await fetchFromAPI(useCat);
    if (apiJokes && apiJokes.length > 0) {
      pool = apiJokes;
    } else {
      pool = getFallbackForCategory(useCat);
    }

    const joke = pickRandomFromPool(pool, currentJokeRef.current?.id);
    if (!joke) return;

    const truncated = historyRef.current.slice(0, historyIndexRef.current + 1);
    const newHistory = [...truncated, joke];

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentJoke(joke);
  }, [fetchFromAPI, getFallbackForCategory, pickRandomFromPool]);

  // Initial load
  useEffect(() => {
    generateJoke("All");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevious = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx > 0) {
      const newIdx = idx - 1;
      setHistoryIndex(newIdx);
      setCurrentJoke(historyRef.current[newIdx]);
    }
  }, []);

  const handleNext = useCallback(() => {
    const idx = historyIndexRef.current;
    const hist = historyRef.current;
    if (idx < hist.length - 1) {
      const newIdx = idx + 1;
      setHistoryIndex(newIdx);
      setCurrentJoke(hist[newIdx]);
    } else {
      generateJoke();
    }
  }, [generateJoke]);

  const handleRefresh = useCallback(() => {
    generateJoke();
  }, [generateJoke]);

  const handleCategoryChange = useCallback((cat) => {
    setCategory(cat);
    categoryRef.current = cat;
    setSearchQuery("");
    generateJoke(cat);
  }, [generateJoke]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query || query.length < 2) return;

    const pool = source === "api" ? jokes : getFallbackForCategory(categoryRef.current);
    const lower = query.toLowerCase();
    const match = pool.find((j) => j.joke.toLowerCase().includes(lower));
    if (match) {
      const truncated = historyRef.current.slice(0, historyIndexRef.current + 1);
      const newHistory = [...truncated, match];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentJoke(match);
    }
  }, [jokes, source, getFallbackForCategory]);

  const toggleFavorite = useCallback(() => {
    if (!currentJoke) return;
    const isFav = favorites.some((f) => f.id === currentJoke.id);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter((f) => f.id !== currentJoke.id);
      showToast("Removed from favorites");
    } else {
      newFavs = [...favorites, currentJoke];
      showToast("Added to favorites");
    }
    setFavorites(newFavs);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
  }, [currentJoke, favorites, showToast]);

  const removeFavorite = useCallback((id) => {
    const newFavs = favorites.filter((f) => f.id !== id);
    setFavorites(newFavs);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
    showToast("Favorite removed");
  }, [favorites, showToast]);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => !prev);
  }, []);

  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(() => {
        generateJoke();
      }, 5000);
    } else {
      clearInterval(autoPlayRef.current);
    }
    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, generateJoke]);

  const isFavorite = currentJoke ? favorites.some((f) => f.id === currentJoke.id) : false;
  const canGoPrevious = historyIndex > 0;

  const filteredFavorites = favorites.filter((f) => {
    if (!searchQuery || searchQuery.length < 2) return true;
    return f.joke.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return {
    currentJoke,
    loading,
    error,
    category,
    searchQuery,
    favorites,
    filteredFavorites,
    isFavorite,
    canGoPrevious,
    autoPlay,
    showFavorites,
    copied,
    toastMsg,
    source,
    categories: CATEGORIES,
    handlePrevious,
    handleNext,
    handleRefresh,
    handleCategoryChange,
    handleSearch,
    toggleFavorite,
    removeFavorite,
    toggleAutoPlay,
    setShowFavorites,
    setCopied,
  };
}
