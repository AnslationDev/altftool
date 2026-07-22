import { WORDS } from "../constants";

export function getDailyWord() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return WORDS[dayOfYear % WORDS.length];
}

export function filterWords(difficulty) {
  if (difficulty === "all") return WORDS;
  return WORDS.filter((w) => w.diff === difficulty);
}

export function generateQuiz(words, count = 4) {
  if (words.length < count) return [];
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const correct = shuffled[0];
  const options = [correct.word];
  const pool = WORDS.filter((w) => w.word !== correct.word).sort(() => Math.random() - 0.5);
  for (let i = 0; i < count - 1 && i < pool.length; i++) {
    options.push(pool[i].word);
  }
  return {
    word: correct,
    options: options.sort(() => Math.random() - 0.5),
    answer: correct.word,
    question: correct.def,
  };
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
