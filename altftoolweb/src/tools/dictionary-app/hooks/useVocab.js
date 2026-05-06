import { useState, useEffect } from "react";

const STORAGE_KEY = "vocab_list";

const loadSavedWords = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function useVocab() {
  const [savedWords, setSavedWords] = useState(loadSavedWords);

  // savedWords badla toh localStorage update karo
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedWords));
  }, [savedWords]);

  // word save karo
  const addWord = (word) => {
    const alreadyExists = savedWords.find((w) => w.word === word);
    if (alreadyExists) return;
    const newEntry = {
      word,
      savedOn: new Date().toLocaleDateString("en-IN"),
      status: "new",  // new → learning → learned
    };
    setSavedWords((prev) => [newEntry, ...prev]);
  };

  // status update karo
  const updateStatus = (word, status) => {
    setSavedWords((prev) =>
      prev.map((w) => (w.word === word ? { ...w, status } : w))
    );
  };

  // word remove karo
  const removeWord = (word) => {
    setSavedWords((prev) => prev.filter((w) => w.word !== word));
  };

  // check karo word already saved hai ya nahi
  const isWordSaved = (word) => savedWords.some((w) => w.word === word);

  return { savedWords, addWord, updateStatus, removeWord, isWordSaved };
}
