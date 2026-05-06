import { useState, useEffect } from "react";

const STORAGE_KEY = "vocab_collections";

const DEFAULT_COLLECTIONS = [
  { id: "daily-use",      name: "Daily Use",      emoji: "📖" },
  { id: "interview-prep", name: "Interview Prep",  emoji: "💼" },
  { id: "advanced-words", name: "Advanced Words",  emoji: "🧠" },
];

function getStored() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useCollections() {
  const [storedData] = useState(getStored);
  const [collections, setCollections] = useState(
    () => storedData?.collections || DEFAULT_COLLECTIONS
  );
  const [wordMap, setWordMap] = useState(() => storedData?.wordMap || {}); // { "daily-use": ["run", "happy"] }

  // save karo jab bhi change ho
  const persist = (newCollections, newWordMap) => {
    saveToStorage({ collections: newCollections, wordMap: newWordMap });
  };

  // word ko collection mein add karo
  const addToCollection = (collectionId, word) => {
    const current = wordMap[collectionId] || [];
    if (current.includes(word)) return; // already added
    const updated = { ...wordMap, [collectionId]: [...current, word] };
    setWordMap(updated);
    persist(collections, updated);
  };

  // word ko collection se remove karo
  const removeFromCollection = (collectionId, word) => {
    const current = wordMap[collectionId] || [];
    const updated = {
      ...wordMap,
      [collectionId]: current.filter((w) => w !== word),
    };
    setWordMap(updated);
    persist(collections, updated);
  };

  // naya collection/folder banao
  const createCollection = (name, emoji = "📁") => {
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const newCollection = { id, name, emoji };
    const updated = [...collections, newCollection];
    setCollections(updated);
    persist(updated, wordMap);
  };

  // collection delete karo
  const deleteCollection = (collectionId) => {
    const updated = collections.filter((c) => c.id !== collectionId);
    const updatedMap = { ...wordMap };
    delete updatedMap[collectionId];
    setCollections(updated);
    setWordMap(updatedMap);
    persist(updated, updatedMap);
  };

  // check karo word kisi collection mein hai ya nahi
  const getWordCollections = (word) => {
    return collections
      .filter((c) => wordMap[c.id]?.includes(word))
      .map((c) => c.id);
  };

  return {
    collections,
    wordMap,
    addToCollection,
    removeFromCollection,
    createCollection,
    deleteCollection,
    getWordCollections,
  };
}
