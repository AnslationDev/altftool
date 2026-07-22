"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Brain,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Download,
  Trophy,
  BookOpen,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Clock,
  RefreshCw,
  GraduationCap,
  BarChart3,
  Settings2,
} from "lucide-react";

const HISTORY_KEY = "ai-quiz-generator-history";

/* ─────────────────────────────────────── NLP Engine ─────────────────────────────────────── */

function splitSentences(text) {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => {
      const wc = s.split(/\s+/).length;
      return wc >= 4 && wc <= 45;
    });
}

function extractTerms(sentence) {
  const tokens = sentence.match(/\b[a-zA-Z]+(?:['\u2019][a-zA-Z]+)*\b/g) || [];
  const numbers = sentence.match(/\b\d+(?:[.,]\d+)?\b/g) || [];
  const terms = [];
  const lower = tokens.map((t) => t.toLowerCase());

  for (let i = 0; i < tokens.length - 1; i++) {
    if (
      /^[A-Z]/.test(tokens[i]) &&
      /^[A-Z]/.test(tokens[i + 1]) &&
      tokens[i].length > 1
    ) {
      const multi = `${tokens[i]} ${tokens[i + 1]}`;
      if (!terms.some((t) => t.term === multi)) {
        terms.push({ term: multi, priority: 5 });
      }
    }
  }

  tokens.forEach((t, i) => {
    if (i > 0 && terms.some((x) => x.term.includes(t))) return;
    if (/^[A-Z]/.test(t) && t.length > 2 && !lower.includes(t.toLowerCase())) {
      if (!terms.some((x) => x.term === t)) terms.push({ term: t, priority: 4 });
    }
  });

  tokens.forEach((t) => {
    if (terms.some((x) => x.term === t || x.term.includes(t))) return;
    if (t.length >= 7) {
      terms.push({ term: t, priority: 2 });
    } else if (t.length >= 5 && !/^[A-Z]/.test(t)) {
      terms.push({ term: t, priority: 1 });
    }
  });

  numbers.forEach((n) => {
    if (!terms.some((x) => x.term === n)) terms.push({ term: n, priority: 3 });
  });

  return terms;
}

function getAllKeyTerms(sentences) {
  const map = new Map();
  sentences.forEach((s, idx) => {
    extractTerms(s).forEach((t) => {
      const key = t.term.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { term: t.term, priority: t.priority, sentenceIdx: idx });
      } else {
        const existing = map.get(key);
        existing.priority = Math.max(existing.priority, t.priority);
      }
    });
  });
  return [...map.values()].sort((a, b) => b.priority - a.priority);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blankTerm(sentence, term) {
  const esc = escapeRegex(term);
  const res = sentence.replace(new RegExp(`\\b${esc}\\b`, "i"), "________");
  if (res === sentence) {
    return sentence.replace(new RegExp(esc, "i"), "________");
  }
  return res;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickBestTerm(available, difficulty) {
  if (!available.length) return null;
  if (difficulty === "easy") {
    const sorted = [...available].sort((a, b) => b.priority - a.priority);
    return sorted[0];
  }
  if (difficulty === "hard") {
    const sorted = [...available].sort((a, b) => a.priority - b.priority);
    return sorted[0];
  }
  return available[Math.floor(Math.random() * available.length)];
}

function generateQuiz(text, difficulty, types) {
  const sentences = splitSentences(text);
  if (sentences.length < 2) return [];

  const allTerms = getAllKeyTerms(sentences);
  const termPool = allTerms.map((t) => t.term);
  if (termPool.length < 2) return [];

  const usedSentences = new Set();
  const usedTerms = new Set();
  const questions = [];

  function getDistractors(correctTerm, count = 3) {
    return termPool
      .filter(
        (t) =>
          t.toLowerCase() !== correctTerm.toLowerCase() &&
          !usedTerms.has(t.toLowerCase())
      )
      .filter((t, i, a) => a.indexOf(t) === i)
      .slice(0, count);
  }

  function generateTF(sentence) {
    const termsIn = allTerms.filter((t) => {
      const esc = escapeRegex(t.term);
      return new RegExp(`\\b${esc}\\b`, "i").test(sentence);
    });
    if (!termsIn.length) return null;

    const isTrue = sentences.indexOf(sentence) % 3 !== 0;
    if (isTrue) {
      return {
        type: "truefalse",
        stem: sentence,
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "This statement is true as presented in the source text.",
      };
    }

    const picked = termsIn[Math.floor(Math.random() * termsIn.length)];
    const distractors = getDistractors(picked.term, 1);
    if (!distractors.length) {
      return {
        type: "truefalse",
        stem: sentence,
        options: ["True", "False"],
        correctIndex: 0,
        explanation: "This statement is true as presented in the source text.",
      };
    }

    const wrongTerm = distractors[0];
    const esc = escapeRegex(picked.term);
    const re = new RegExp(`\\b${esc}\\b`, "i");
    let falseSentence;
    if (re.test(sentence)) {
      falseSentence = sentence.replace(re, wrongTerm);
    } else {
      falseSentence = sentence.replace(new RegExp(esc, "i"), wrongTerm);
    }

    usedTerms.add(picked.term.toLowerCase());
    return {
      type: "truefalse",
      stem: falseSentence,
      options: ["True", "False"],
      correctIndex: 1,
      explanation: `This statement is false. The correct version is: "${sentence}"`,
    };
  }

  function generateMCQ(sentence) {
    const termsIn = allTerms.filter((t) => {
      const esc = escapeRegex(t.term);
      return new RegExp(`\\b${esc}\\b`, "i").test(sentence);
    });
    const available = termsIn.filter(
      (t) => !usedTerms.has(t.term.toLowerCase())
    );
    if (!available.length) return null;

    const picked = pickBestTerm(available, difficulty);
    if (!picked) return null;

    const distractors = getDistractors(picked.term, 3);
    if (!distractors.length) return null;

    while (distractors.length < 3) {
      distractors.push(`Option ${String.fromCharCode(65 + distractors.length)}`);
    }

    const options = shuffleArray([picked.term, ...distractors]);
    const correctIndex = options.indexOf(picked.term);
    const blanked = blankTerm(sentence, picked.term);

    usedTerms.add(picked.term.toLowerCase());
    return {
      type: "mcq",
      stem: blanked,
      options,
      correctIndex,
      explanation: `The complete sentence is: "${sentence}"`,
    };
  }

  function generateFill(sentence) {
    const termsIn = allTerms.filter((t) => {
      const esc = escapeRegex(t.term);
      return new RegExp(`\\b${esc}\\b`, "i").test(sentence);
    });
    const available = termsIn.filter(
      (t) => !usedTerms.has(t.term.toLowerCase())
    );
    if (!available.length) return null;

    const picked = pickBestTerm(available, difficulty);
    if (!picked) return null;

    const distractors = getDistractors(picked.term, 3);
    if (!distractors.length) return null;

    while (distractors.length < 3) {
      distractors.push(`Option ${String.fromCharCode(65 + distractors.length)}`);
    }

    const options = shuffleArray([picked.term, ...distractors]);
    const correctIndex = options.indexOf(picked.term);
    const blanked = blankTerm(sentence, picked.term);

    usedTerms.add(picked.term.toLowerCase());
    return {
      type: "fillblank",
      stem: blanked,
      options,
      correctIndex,
      explanation: `The correct answer is "${picked.term}". Complete sentence: "${sentence}"`,
    };
  }

  const typeMap = {
    mcq: generateMCQ,
    truefalse: generateTF,
    fillblank: generateFill,
  };

  const activeTypes = types.filter((t) => typeMap[t]);

  for (let round = 0; round < 3; round++) {
    for (const t of activeTypes) {
      if (questions.filter((q) => q.type === t).length >= 5) continue;
      if (questions.length >= 15) break;

      const shuffled = shuffleArray(sentences);
      for (const s of shuffled) {
        if (usedSentences.has(s)) continue;
        if (questions.filter((q) => q.type === t).length >= 5) break;
        if (questions.length >= 15) break;

        if (t === "truefalse" && round > 0) continue;
        if (t !== "truefalse" && round > 1) continue;

        const q = typeMap[t](s);
        if (q) {
          q.id = `${t}-${questions.length}-${Date.now()}`;
          q.userAnswer = null;
          q.showResult = false;
          questions.push(q);
          usedSentences.add(s);
        }
      }
    }
  }

  return shuffleArray(questions);
}

/* ─────────────────────────────────────── Helpers ─────────────────────────────────────── */

function getPerformanceMessage(pct) {
  if (pct >= 90) return "Outstanding! You have mastered this material.";
  if (pct >= 70) return "Great job! A quick review will fill the remaining gaps.";
  if (pct >= 50) return "Good start. Review the explanations and try again.";
  return "Keep practicing. Review the answers below to improve.";
}

function getPerformanceColor(pct) {
  if (pct >= 80) return "text-[var(--anslation-ds-success)]";
  if (pct >= 50) return "text-[var(--anslation-ds-warning)]";
  return "text-[var(--anslation-ds-danger)]";
}

function getDifficultyColor(d) {
  if (d === "easy") return "text-[var(--anslation-ds-success)]";
  if (d === "hard") return "text-[var(--anslation-ds-danger)]";
  return "text-[var(--anslation-ds-warning)]";
}

const THEAD = "text-xs font-semibold uppercase leading-4 text-[var(--muted-foreground)]";
const CARD = "rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]";
const BTN_PRIMARY = "inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:brightness-110 focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-60 disabled:pointer-events-none";
const BTN_SECONDARY = "inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-60 disabled:pointer-events-none";
const INPUT = "w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-60";

/* ─────────────────────────────────────── StatCard ─────────────────────────────────────── */

function StatCard({ label, value, valueClass }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className={THEAD}>{label}</p>
      <p className={`mt-2 text-2xl font-semibold text-[var(--foreground)] ${valueClass || ""}`}>
        {value}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────── HistoryRow ─────────────────────────────────────── */

function HistoryRow({ entry, onDelete }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold capitalize ${getDifficultyColor(entry.difficulty)}`}>
            {entry.difficulty}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            {new Date(entry.date).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[var(--foreground)]">
          {entry.textPreview}
        </p>
        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
          {entry.totalQuestions} questions &middot; {entry.correct} correct &middot; {entry.percentage}%
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete(entry.id)}
        className="shrink-0 rounded-md p-1.5 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--anslation-ds-danger)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)]"
        aria-label="Delete history entry"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────── Main Component ─────────────────────────────────────── */

export default function ToolHome() {
  const [stage, setStage] = useState("input");
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [types, setTypes] = useState(["mcq", "truefalse", "fillblank"]);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizDone, setQuizDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const saveHistory = useCallback(
    (entry) => {
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        /* quota exceeded or private mode */
      }
    },
    [history]
  );

  const deleteHistory = useCallback(
    (id) => {
      const updated = history.filter((e) => e.id !== id);
      setHistory(updated);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        /* */
      }
    },
    [history]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* */
    }
  }, []);

  const currentQuestion = questions[currentIdx] || null;
  const totalQuestions = questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;

  const results = useMemo(() => {
    const correct = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
    const skipped = answers.filter((a) => a === null).length;
    const wrong = totalQuestions - correct - skipped;
    const pct = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;
    return { correct, skipped, wrong, percentage: pct };
  }, [answers, questions, totalQuestions]);

  function toggleType(t) {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function handleGenerate() {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please paste some text to generate a quiz.");
      return;
    }
    if (trimmed.length < 50) {
      setError("Please provide at least 50 characters of text.");
      return;
    }
    if (!types.length) {
      setError("Select at least one question type.");
      return;
    }

    setStage("generating");

    setTimeout(() => {
      const generated = generateQuiz(trimmed, difficulty, types);
      if (!generated.length) {
        setError(
          "Could not generate enough questions from this text. Try longer or more varied content."
        );
        setStage("input");
        return;
      }
      setQuestions(generated);
      setAnswers(Array(generated.length).fill(null));
      setCurrentIdx(0);
      setQuizDone(false);
      setStage("quiz");
    }, 400);
  }

  function selectAnswer(idx) {
    if (quizDone) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = idx;
      return next;
    });
  }

  function goNext() {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      finishQuiz();
    }
  }

  function goPrev() {
    setCurrentIdx((i) => Math.max(0, i - 1));
  }

  function finishQuiz() {
    setQuizDone(true);
    setStage("results");
    const correct = answers.filter(
      (a, i) => a === questions[i]?.correctIndex
    ).length;
    const pct = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;
    saveHistory({
      id: Date.now(),
      date: new Date().toISOString(),
      difficulty,
      types,
      totalQuestions,
      correct,
      percentage: pct,
      textPreview: text.trim().slice(0, 100),
    });
  }

  function restart() {
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setQuizDone(false);
    setStage("input");
    setError("");
  }

  function retrySame() {
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setQuizDone(false);
    setStage("input");
    handleGenerate();
  }

  function exportJSON() {
    const data = {
      exportedAt: new Date().toISOString(),
      difficulty,
      totalQuestions,
      results,
      questions: questions.map((q, i) => ({
        id: q.id,
        type: q.type,
        stem: q.stem,
        options: q.options,
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation,
        userAnswer: answers[i] !== null ? q.options[answers[i]] : null,
        isCorrect: answers[i] === q.correctIndex,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-quiz-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const progressPct = totalQuestions
    ? Math.round(((currentIdx + 1) / totalQuestions) * 100)
    : 0;

  /* ─────────────────────────────── INPUT STAGE ─────────────────────────────── */

  if (stage === "input") {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
        <div className="mx-auto max-w-5xl">
          <section className={CARD}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
              <Brain className="h-4 w-4" />
              AI-Powered
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr_280px] xl:items-end">
              <div className="min-w-0">
                <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">
                  AI Quiz Generator
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                  Paste any text and generate a custom quiz with multiple choice,
                  true/false, and fill-in-the-blank questions using deterministic
                  NLP — no external API needed.
                </p>
              </div>
              <div className="grid min-w-0 grid-cols-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="min-w-[88px] flex-1 px-3 py-2 text-center">
                  <p className={THEAD}>MCQ</p>
                  <p className="mt-1 text-xl font-semibold leading-6 text-[var(--foreground)]">
                    {types.includes("mcq") ? "✓" : "—"}
                  </p>
                </div>
                <div className="min-w-[88px] flex-1 border-x border-[var(--border)] px-3 py-2 text-center">
                  <p className={THEAD}>T/F</p>
                  <p className="mt-1 text-xl font-semibold leading-6 text-[var(--foreground)]">
                    {types.includes("truefalse") ? "✓" : "—"}
                  </p>
                </div>
                <div className="min-w-[88px] flex-1 px-3 py-2 text-center">
                  <p className={THEAD}>Fill</p>
                  <p className="mt-1 text-xl font-semibold leading-6 text-[var(--foreground)]">
                    {types.includes("fillblank") ? "✓" : "—"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-[var(--anslation-ds-danger)] bg-[var(--anslation-ds-danger)]/10 p-4 text-sm text-[var(--anslation-ds-danger)]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <div className={CARD}>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Source Text</h2>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type the content you want to generate a quiz from..."
                  rows={10}
                  className={`${INPUT} mt-3 min-h-[200px] resize-y`}
                  aria-label="Source text for quiz generation"
                />
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  {text.length} characters
                </p>
              </div>

              <div className={CARD}>
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Question Types</h2>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {[
                    { key: "mcq", label: "Multiple Choice", desc: "Complete the sentence" },
                    { key: "truefalse", label: "True / False", desc: "Verify statements" },
                    { key: "fillblank", label: "Fill in the Blank", desc: "Recall key terms" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="checkbox"
                      aria-checked={types.includes(t.key)}
                      onClick={() => toggleType(t.key)}
                      className={`min-w-[140px] rounded-lg border p-3 text-left transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
                        types.includes(t.key)
                          ? "border-[var(--primary)] bg-[var(--muted)]"
                          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="text-sm font-semibold">{t.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className={CARD}>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Difficulty</h2>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { key: "easy", label: "Easy", desc: "Obvious terms" },
                    { key: "medium", label: "Medium", desc: "Balanced" },
                    { key: "hard", label: "Hard", desc: "Specific details" },
                  ].map((d) => (
                    <button
                      key={d.key}
                      type="button"
                      role="radio"
                      aria-checked={difficulty === d.key}
                      onClick={() => setDifficulty(d.key)}
                      className={`rounded-lg border p-3 text-center transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
                        difficulty === d.key
                          ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span className="text-sm font-semibold capitalize">{d.label}</span>
                      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                        {d.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className={`${BTN_PRIMARY} w-full justify-center py-3 text-base`}
              >
                <Sparkles className="h-5 w-5" />
                Generate Quiz
              </button>

              {history.length > 0 && (
                <div className={CARD}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[var(--primary)]" />
                      <h2 className="text-lg font-semibold">History</h2>
                    </div>
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-xs font-semibold text-[var(--muted-foreground)] underline transition hover:text-[var(--anslation-ds-danger)]"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-[360px] overflow-y-auto">
                    {history.map((entry) => (
                      <HistoryRow
                        key={entry.id}
                        entry={entry}
                        onDelete={deleteHistory}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* ─────────────────────────────── GENERATING STAGE ─────────────────────────────── */

  if (stage === "generating") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
            <Sparkles className="h-8 w-8 animate-pulse text-[var(--primary)]" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">
            Generating Your Quiz
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Analyzing text, extracting key terms, and building questions...
          </p>
          <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-[var(--muted)]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--primary)]" />
          </div>
        </div>
      </main>
    );
  }

  /* ─────────────────────────────── QUIZ STAGE ─────────────────────────────── */

  if (stage === "quiz") {
    const q = currentQuestion;
    if (!q) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="mt-3 text-[var(--foreground)]">No questions available.</p>
            <button type="button" onClick={restart} className={`${BTN_PRIMARY} mt-4`}>
              <RotateCcw className="h-4 w-4" />
              Start Over
            </button>
          </div>
        </main>
      );
    }

    const selected = answers[currentIdx];
    const isAnswered = selected !== null;
    const typeLabel = {
      mcq: "Multiple Choice",
      truefalse: "True / False",
      fillblank: "Fill in the Blank",
    }[q.type];

    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
        <div className="mx-auto max-w-4xl">
          <section className={CARD}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-sm font-semibold text-[var(--primary)]">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">{results.correct}</span> correct
                </span>
                <span className="text-sm font-semibold capitalize text-[var(--muted-foreground)]">
                  {difficulty}
                </span>
              </div>
            </div>

            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-label="Quiz progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
            >
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-semibold uppercase text-[var(--primary)]">
                {typeLabel}
              </span>
            </div>
          </section>

          <section className={`mt-4 ${CARD}`}>
            <h2 className="text-xl font-semibold leading-snug">{q.stem}</h2>

            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">Choose your answer</legend>
              {q.options.map((option, oi) => {
                const isSelected = selected === oi;
                const isCorrect = q.correctIndex === oi;
                const showFeedback = isAnswered;

                let borderClass = "border-[var(--border)] hover:border-[var(--primary)]";
                let bgClass = "bg-[var(--background)]";
                if (showFeedback) {
                  if (isCorrect) {
                    borderClass = "border-[var(--anslation-ds-success)]";
                    bgClass = "bg-[var(--anslation-ds-success)]/10";
                  } else if (isSelected && !isCorrect) {
                    borderClass = "border-[var(--anslation-ds-danger)]";
                    bgClass = "bg-[var(--anslation-ds-danger)]/10";
                  } else {
                    borderClass = "border-[var(--border)] opacity-60";
                  }
                } else if (isSelected) {
                  borderClass = "border-[var(--primary)]";
                  bgClass = "bg-[var(--muted)]";
                }

                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => !isAnswered && selectAnswer(oi)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-default ${borderClass} ${bgClass}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-semibold ${
                        showFeedback && isCorrect
                          ? "border-[var(--anslation-ds-success)] bg-[var(--anslation-ds-success)] text-white"
                          : showFeedback && isSelected && !isCorrect
                            ? "border-[var(--anslation-ds-danger)] bg-[var(--anslation-ds-danger)] text-white"
                            : "border-[var(--border)] bg-[var(--card)]"
                      }`}
                    >
                      {showFeedback && isCorrect ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : showFeedback && isSelected && !isCorrect ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + oi)
                      )}
                    </span>
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </fieldset>

            {isAnswered && (
              <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-start gap-3">
                  {selected === q.correctIndex ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-success)]" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        selected === q.correctIndex
                          ? "text-[var(--anslation-ds-success)]"
                          : "text-[var(--anslation-ds-danger)]"
                      }`}
                    >
                      {selected === q.correctIndex ? "Correct!" : "Incorrect"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIdx === 0}
              className={BTN_SECONDARY}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              {!isAnswered ? (
                <span className="text-sm text-[var(--muted-foreground)]">
                  Select an answer above
                </span>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className={currentIdx === totalQuestions - 1 ? BTN_PRIMARY : BTN_SECONDARY}
                >
                  {currentIdx === totalQuestions - 1 ? "Finish Quiz" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {questions.map((_, qi) => {
              const isCurrent = qi === currentIdx;
              const isAns = answers[qi] !== null;
              return (
                <button
                  key={qi}
                  type="button"
                  onClick={() => !quizDone && setCurrentIdx(qi)}
                  disabled={quizDone}
                  className={`h-8 w-8 rounded-md border text-xs font-semibold transition focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${
                    isCurrent
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : isAns
                        ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                  aria-label={`Go to question ${qi + 1}${isAns ? ", answered" : ", not answered"}`}
                >
                  {qi + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  /* ─────────────────────────────── RESULTS STAGE ─────────────────────────────── */

  if (stage === "results") {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
        <div className="mx-auto max-w-5xl">
          <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className={CARD}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={THEAD}>Final Score</p>
                    <h2
                      className={`text-3xl font-bold ${getPerformanceColor(results.percentage)}`}
                    >
                      {results.percentage}%
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Total" value={totalQuestions} />
                  <StatCard
                    label="Correct"
                    value={results.correct}
                    valueClass="text-[var(--anslation-ds-success)]"
                  />
                  <StatCard
                    label="Wrong"
                    value={results.wrong}
                    valueClass="text-[var(--anslation-ds-danger)]"
                  />
                  <StatCard label="Skipped" value={results.skipped} />
                </div>

                <p className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  {getPerformanceMessage(results.percentage)}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={restart} className={BTN_PRIMARY}>
                    <RotateCcw className="h-4 w-4" />
                    New Quiz
                  </button>
                  <button type="button" onClick={retrySame} className={BTN_SECONDARY}>
                    <RefreshCw className="h-4 w-4" />
                    Retry Same Text
                  </button>
                  <button type="button" onClick={exportJSON} className={BTN_SECONDARY}>
                    <Download className="h-4 w-4" />
                    Export JSON
                  </button>
                </div>
              </div>

              <div className={CARD}>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Review Answers</h2>
                </div>
                <div className="mt-4 space-y-4">
                  {questions.map((q, qi) => {
                    const userAns = answers[qi];
                    const isCorrect = userAns === q.correctIndex;
                    const isSkipped = userAns === null;
                    const typeIcon = {
                      mcq: "A",
                      truefalse: "T",
                      fillblank: "F",
                    }[q.type];

                    return (
                      <article
                        key={q.id}
                        className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                      >
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[var(--anslation-ds-success)]" />
                          ) : (
                            <XCircle className="mt-1 h-5 w-5 shrink-0 text-[var(--anslation-ds-danger)]" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--primary)]">
                                {q.type}
                              </span>
                              <span className="text-xs text-[var(--muted-foreground)]">
                                Q{qi + 1}
                              </span>
                            </div>
                            <h3 className="mt-1 font-semibold leading-6 break-words">
                              {q.stem.length > 120
                                ? q.stem.slice(0, 120) + "..."
                                : q.stem}
                            </h3>
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="text-[var(--muted-foreground)]">
                                Your answer:{" "}
                                <span
                                  className={
                                    isCorrect
                                      ? "font-semibold text-[var(--anslation-ds-success)]"
                                      : isSkipped
                                        ? ""
                                        : "font-semibold text-[var(--anslation-ds-danger)]"
                                  }
                                >
                                  {isSkipped
                                    ? "Skipped"
                                    : q.options[userAns]}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p className="font-semibold text-[var(--foreground)]">
                                  Correct answer: {q.options[q.correctIndex]}
                                </p>
                              )}
                              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                                {q.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className={CARD}>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="text-lg font-semibold">Summary</h2>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className={THEAD}>Difficulty</p>
                    <p
                      className={`mt-1 text-lg font-semibold capitalize ${getDifficultyColor(difficulty)}`}
                    >
                      {difficulty}
                    </p>
                  </div>
                  <div>
                    <p className={THEAD}>Question Types</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {types.map((t) => {
                        const labels = {
                          mcq: "Multiple Choice",
                          truefalse: "True / False",
                          fillblank: "Fill in Blank",
                        };
                        return (
                          <span
                            key={t}
                            className="rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]"
                          >
                            {labels[t] || t}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className={THEAD}>Questions</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                      {totalQuestions}
                    </p>
                  </div>
                  <div>
                    <p className={THEAD}>Accuracy</p>
                    <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                      {totalQuestions
                        ? Math.round((results.correct / totalQuestions) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return null;
}
