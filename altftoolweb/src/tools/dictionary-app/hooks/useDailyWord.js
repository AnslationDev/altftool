import { useState, useEffect } from "react";
import { fetchDictionaryData } from "../utils/api.js";

const STORAGE_KEY = "daily_word_data";

const wordList = [
  "serendipity", "ephemeral", "eloquent", "melancholy", "ubiquitous",
  "resilience", "ambiguous", "benevolent", "candid", "diligent",
  "empathy", "frugal", "gratitude", "humble", "integrity",
  "jovial", "keen", "lucid", "meticulous", "nurture",
  "optimism", "persevere", "quirky", "radiant", "sincere",
  "tenacious", "unique", "vivid", "wisdom", "zealous",
  "abundant", "bold", "curious", "daring", "earnest",
  "faithful", "genuine", "honest", "innovative", "just",
  "kind", "lively", "mindful", "noble", "open",
  "patient", "quiet", "reliable", "strong", "thoughtful",
  "upbeat", "valiant", "warm", "xenial", "yearning",
  "zeal", "adapt", "brave", "calm", "dynamic",
  "eager", "focus", "grace", "harmony", "inspire",
  "justice", "knowledge", "logic", "moral", "nature",
  "order", "peace", "quest", "reason", "spirit",
  "truth", "unity", "valor", "wonder", "excel",
  "yield", "anchor", "bloom", "craft", "dream",
  "evolve", "forge", "grow", "heal", "imagine",
  "journey", "kindle", "learn", "mend", "nurture",
];

function getTodayDate() {
  return new Date().toLocaleDateString("en-IN");
}

// ✅ Fix 1 — window check
function getStoredData() {
  try {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveData(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function pickNewWord(usedWords) {
  const remaining = wordList.filter((w) => !usedWords.includes(w));
  const isReset = remaining.length === 0;
  const pool = isReset ? wordList : remaining;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return { word: pool[randomIndex], isReset };
}

export function useDailyWord() {
  const [dailyWord, setDailyWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const init = async () => {
      const today = getTodayDate();
      const stored = getStoredData();

      // today word already 
      if (stored && stored.date === today) {
        setDailyWord(stored);
        setLoading(false);
        return;
      }

      const usedWords = stored?.usedWords || [];
      const { word: newWord, isReset } = pickNewWord(usedWords);

      // ✅ Fix 2 — fallback retry logic
      const tryFetch = async (word, retryCount = 0) => {
        try {
          const data = await fetchDictionaryData(word);

          if (!data.dict || data.dict.length === 0) {
            // word API mein nahi mila — dusra try karo
            if (retryCount < 3) {
              const { word: fallback } = pickNewWord([...usedWords, word]);
              return tryFetch(fallback, retryCount + 1);
            }
            throw new Error("No valid word found");
          }

          const entry = data.dict[0];
          const meaning = entry?.meanings?.[0]?.definitions?.[0]?.definition || null;
          const example = entry?.meanings?.[0]?.definitions?.[0]?.example || null;
          const phonetic = entry?.phonetics?.find((p) => p.text)?.text || null;

          // ✅ Fix 3 — on reset usedWords clear
          const updatedUsedWords = isReset ? [word] : [...usedWords, word];

          const newData = {
            word,
            date: today,
            meaning,
            example,
            phonetic,
            usedWords: updatedUsedWords,
          };

          saveData(newData);
          setDailyWord(newData);
        } catch {
          setError(true);
        } finally {
          setLoading(false);
        }
      };

      await tryFetch(newWord);
    };

    init();
  }, []);

  return { dailyWord, loading, error };
}