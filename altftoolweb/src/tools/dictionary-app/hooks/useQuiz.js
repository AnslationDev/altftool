import { useState } from "react";
import { fetchDictionaryData } from "../utils/api.js";

// Wrong options ke liye random words
const FILLER_WORDS = [
  "ephemeral", "resilience", "melancholy", "serendipity",
  "eloquent", "ambiguous", "tenacious", "ubiquitous",
  "candid", "diligent", "frugal", "gratitude",
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getRandomItems(arr, count, exclude = []) {
  return arr.filter((i) => !exclude.includes(i))
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function useQuiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const generateQuestions = async (currentWord, currentResults, savedWords) => {
    setLoading(true);
    const qs = [];

    // ── Q1: Current word meaning MCQ ──
    if (currentResults?.dict?.[0]) {
      const entry = currentResults.dict[0];
      const correctMeaning = entry.meanings?.[0]?.definitions?.[0]?.definition;

      if (correctMeaning) {
        // Wrong meanings — doosre definitions se
        const allDefs = entry.meanings
          .flatMap((m) => m.definitions.map((d) => d.definition))
          .filter((d) => d !== correctMeaning);

        const wrongOptions = getRandomItems(allDefs, 3);

        // Agar 3 wrong nahi mile — filler use karo
        while (wrongOptions.length < 3) {
          wrongOptions.push(`A feeling of ${FILLER_WORDS[wrongOptions.length]}`);
        }

        qs.push({
          type: "meaning",
          question: `What does "${currentWord}" mean?`,
          options: shuffle([correctMeaning, ...wrongOptions.slice(0, 3)]),
          correct: correctMeaning,
        });
      }
    }

    // ── Q2: Current word synonym MCQ ──
    if (currentResults?.syn?.length >= 4) {
      const synWords = currentResults.syn.slice(0, 10).map((s) => s.word);
      const correct = synWords[0];
      const wrong = getRandomItems(
        FILLER_WORDS.filter((w) => !synWords.includes(w)), 3
      );

      qs.push({
        type: "synonym",
        question: `Which word is a synonym of "${currentWord}"?`,
        options: shuffle([correct, ...wrong]),
        correct,
      });
    }

    // ── Q3: Current word antonym MCQ ──
    if (currentResults?.ant?.length >= 1) {
      const correct = currentResults.ant[0].word;
      const synWords = currentResults.syn?.slice(0, 5).map((s) => s.word) || [];
      const wrong = getRandomItems(
        [...synWords, ...FILLER_WORDS].filter((w) => w !== correct), 3
      );

      qs.push({
        type: "antonym",
        question: `Which word is an antonym of "${currentWord}"?`,
        options: shuffle([correct, ...wrong.slice(0, 3)]),
        correct,
      });
    }

    // ── Q4-Q6: Saved words questions ──
    const learnedWords = savedWords.filter(
      (w) => w.word !== currentWord
    ).slice(0, 3);

    for (const saved of learnedWords) {
      try {
        const data = await fetchDictionaryData(saved.word);
        if (!data.dict?.[0]) continue;

        const entry = data.dict[0];
        const correctMeaning = entry.meanings?.[0]?.definitions?.[0]?.definition;
        if (!correctMeaning) continue;

        const allDefs = entry.meanings
          .flatMap((m) => m.definitions.map((d) => d.definition))
          .filter((d) => d !== correctMeaning);

        const wrongOptions = getRandomItems(allDefs, 3);
        while (wrongOptions.length < 3) {
          wrongOptions.push(`Related to ${FILLER_WORDS[wrongOptions.length]}`);
        }

        qs.push({
          type: "meaning",
          question: `What does "${saved.word}" mean?`,
          options: shuffle([correctMeaning, ...wrongOptions.slice(0, 3)]),
          correct: correctMeaning,
        });
      } catch {
        continue;
      }
    }

    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setIsFinished(false);
    setQuizStarted(true);
    setLoading(false);
  };

  const handleAnswer = (option) => {
    if (selected !== null) return;
    setSelected(option);
    if (option === questions[currentIndex]?.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setIsFinished(true);

      // Score localStorage mein save karo
      if (typeof window !== "undefined") {
        const best = parseInt(localStorage.getItem("quiz_best_score") || "0");
        const total = questions.length;
        if (score + 1 > best) {
          localStorage.setItem("quiz_best_score", score + 1);
          localStorage.setItem("quiz_best_total", total);
        }
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setIsFinished(false);
    setQuizStarted(false);
  };

  return {
    questions,
    currentIndex,
    score,
    selected,
    isFinished,
    loading,
    quizStarted,
    generateQuestions,
    handleAnswer,
    handleNext,
    resetQuiz,
  };
}