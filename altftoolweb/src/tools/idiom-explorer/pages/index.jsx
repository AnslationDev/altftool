"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  BookOpenText,
  Search,
  Star,
  Shuffle,
  Copy,
  Check,
  X,
  BookMarked,
  Filter,
  Sparkles,
  Clock,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { IDIOMS, CATEGORIES, DIFFICULTIES, ALPHABETS } from "../constants/idioms";

// ────────────────────────────────────────────────────────────────
// Storage helpers
// ────────────────────────────────────────────────────────────────
const LS_FAV = "altf_idiom_favorites";
const LS_HIST = "altf_idiom_history";

function loadLS(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ────────────────────────────────────────────────────────────────
// Difficulty badge
// ────────────────────────────────────────────────────────────────
function DiffBadge({ level }) {
  const map = {
    beginner: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[level] ?? ""}`}
    >
      {level}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────
// Idiom Card (expanded detail)
// ────────────────────────────────────────────────────────────────
function getFocusableElements(container) {
  return container?.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

function IdiomCard({ idiom, isFav, onToggleFav, onClose }) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const copy = useCallback(() => {
    navigator.clipboard.writeText(`${idiom.idiom}: ${idiom.meaning}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [idiom]);

  // Move focus into the dialog on open, trap Tab within it, and close on Escape.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const focusable = getFocusableElements(dialogRef.current);
    (focusable?.[0] || dialogRef.current)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const focusableEls = getFocusableElements(dialogRef.current);
      if (!focusableEls?.length) return;
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for idiom: ${idiom.idiom}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
        style={{ boxShadow: "0 24px 56px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                {idiom.category}
              </span>
              <DiffBadge level={idiom.difficulty} />
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--foreground)] mt-1">
              {idiom.idiom}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleFav(idiom.id)}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              className="rounded-lg border border-[var(--border)] p-2 transition-colors hover:bg-[var(--muted)]"
            >
              <Star
                className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-400" : "text-[var(--muted-foreground)]"}`}
              />
            </button>
            <button
              onClick={copy}
              aria-label="Copy idiom and meaning"
              className="rounded-lg border border-[var(--border)] p-2 transition-colors hover:bg-[var(--muted)]"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-[var(--muted-foreground)]" />
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg border border-[var(--border)] p-2 transition-colors hover:bg-[var(--muted)]"
            >
              <X className="h-4 w-4 text-[var(--muted-foreground)]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Meaning */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
              Meaning
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">{idiom.meaning}</p>
          </section>

          {/* Literal Meaning */}
          <section className="rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
              Literal Meaning
            </p>
            <p className="text-sm text-[var(--muted-foreground)] italic">
              &ldquo;{idiom.literalMeaning}&rdquo;
            </p>
          </section>

          {/* Usage */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
              Usage
            </p>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{idiom.usage}</p>
          </section>

          {/* Origin */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
              Origin
            </p>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{idiom.origin}</p>
          </section>

          {/* Example Sentences */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
              Example Sentences
            </p>
            <ul className="space-y-2">
              {idiom.examples.map((ex, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-[var(--foreground)]"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                  {ex}
                </li>
              ))}
            </ul>
          </section>

          {/* Synonyms */}
          {idiom.synonyms?.length > 0 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
                Synonyms
              </p>
              <div className="flex flex-wrap gap-2">
                {idiom.synonyms.map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Related */}
          {idiom.related?.length > 0 && (
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
                Related Idioms
              </p>
              <div className="flex flex-wrap gap-2">
                {idiom.related.map((r, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-1 text-xs text-[var(--muted-foreground)]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Idiom List Item
// ────────────────────────────────────────────────────────────────
function IdiomItem({ idiom, isFav, onSelect }) {
  return (
    <button
      onClick={() => onSelect(idiom)}
      className="w-full text-left rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-150 hover:border-[var(--primary)]/40 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      aria-label={`View details for: ${idiom.idiom}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
              {idiom.category}
            </span>
            <DiffBadge level={idiom.difficulty} />
          </div>
          <p className="font-bold text-[var(--foreground)] text-base leading-tight truncate">
            {idiom.idiom}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
            {idiom.meaning}
          </p>
        </div>
        {isFav && (
          <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400 mt-0.5" />
        )}
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Quiz Mode
// ────────────────────────────────────────────────────────────────
function QuizMode({ onExit }) {
  const questions = useMemo(() => {
    const shuffled = [...IDIOMS].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled.map((q) => {
      const wrong = IDIOMS.filter((i) => i.id !== q.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((i) => i.meaning);
      const options = [...wrong, q.meaning].sort(() => Math.random() - 0.5);
      return { question: q, options };
    });
  }, []);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[idx];

  const choose = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === current.question.meaning) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-12 px-4">
        <Trophy className="mx-auto h-16 w-16 text-amber-400 mb-4" />
        <h2 className="text-3xl font-extrabold text-[var(--foreground)] mb-2">Quiz Complete!</h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          You scored {score} out of {questions.length} ({pct}%)
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onExit}
            className="rounded-xl border border-[var(--border)] px-6 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Back to Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-[var(--muted-foreground)]">
          Question {idx + 1} / {questions.length}
        </span>
        <span className="text-sm font-bold text-[var(--primary)]">Score: {score}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted)] mb-6 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
          style={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 mb-6 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
          What does this idiom mean?
        </p>
        <p className="text-2xl font-extrabold text-[var(--foreground)]">
          &ldquo;{current.question.idiom}&rdquo;
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {current.options.map((opt, i) => {
          const isCorrect = opt === current.question.meaning;
          const isSelected = opt === selected;
          let cls =
            "w-full text-left rounded-xl border p-4 text-sm font-medium transition-all duration-150 ";
          if (!selected) {
            cls +=
              "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/5 cursor-pointer";
          } else if (isCorrect) {
            cls +=
              "border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold";
          } else if (isSelected) {
            cls +=
              "border-red-400 bg-red-500/10 text-red-600 font-bold";
          } else {
            cls +=
              "border-[var(--border)] text-[var(--muted-foreground)] opacity-60 cursor-default";
          }
          return (
            <button key={i} className={cls} onClick={() => choose(opt)} disabled={!!selected}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 text-center">
          <button
            onClick={next}
            className="rounded-xl bg-[var(--primary)] px-8 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            {idx + 1 >= questions.length ? "See Results" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────
export default function IdiomExplorerPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [alphaFilter, setAlphaFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("explore"); // explore | favorites | history | quiz
  const [favorites, setFavorites] = useState(() => loadLS(LS_FAV, []));
  const [history, setHistory] = useState(() => loadLS(LS_HIST, []));
  const [showFilters, setShowFilters] = useState(false);

  // Daily idiom — stable per calendar day
  const dailyIdiom = useMemo(() => {
    const d = new Date();
    const idx = (d.getFullYear() * 1000 + d.getMonth() * 31 + d.getDate()) % IDIOMS.length;
    return IDIOMS[idx];
  }, []);

  const filtered = useMemo(() => {
    return IDIOMS.filter((id) => {
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        id.idiom.toLowerCase().includes(q) ||
        id.meaning.toLowerCase().includes(q) ||
        id.category.toLowerCase().includes(q);
      const matchCat = category === "All" || id.category === category;
      const matchDiff = difficulty === "All" || id.difficulty === difficulty;
      const matchAlpha = !alphaFilter || id.idiom.toUpperCase().startsWith(alphaFilter);
      return matchQ && matchCat && matchDiff && matchAlpha;
    });
  }, [query, category, difficulty, alphaFilter]);

  const handleSelect = useCallback(
    (idiom) => {
      setSelected(idiom);
      setHistory((prev) => {
        const next = [idiom, ...prev.filter((i) => i.id !== idiom.id)].slice(0, 20);
        saveLS(LS_HIST, next);
        return next;
      });
    },
    []
  );

  const toggleFav = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      saveLS(LS_FAV, next);
      return next;
    });
  }, []);

  const randomIdiom = () => {
    const r = IDIOMS[Math.floor(Math.random() * IDIOMS.length)];
    handleSelect(r);
  };

  const favIdioms = useMemo(
    () => IDIOMS.filter((i) => favorites.includes(i.id)),
    [favorites]
  );

  const TABS = [
    { id: "explore", label: "Explore", icon: BookOpenText },
    { id: "favorites", label: "Favorites", icon: Star },
    { id: "history", label: "History", icon: Clock },
    { id: "quiz", label: "Quiz", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Hero Header ── */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
            <BookOpenText className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--primary)]">
              Language Learning Tool
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Idiom Explorer
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--muted-foreground)]">
            Explore 59 curated English idioms with meanings, origins, examples, and an
            interactive quiz. Bookmark your favorites and track your learning history.
          </p>
        </div>

        {/* ── Daily Idiom ── */}
        <div className="mb-6 rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--card)] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">
              Idiom of the Day
            </span>
          </div>
          <button
            className="text-left w-full group"
            onClick={() => handleSelect(dailyIdiom)}
          >
            <p className="text-xl font-extrabold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              &ldquo;{dailyIdiom.idiom}&rdquo;
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2">
              {dailyIdiom.meaning}
            </p>
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <p className="text-2xl font-extrabold text-[var(--primary)]">{IDIOMS.length}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Idioms</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-600">{favorites.length}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Favorites</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center">
            <p className="text-2xl font-extrabold text-[var(--primary)]">{history.length}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Viewed</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-6 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                aria-pressed={active}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--card)] text-[var(--primary)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Explore Tab ── */}
        {activeTab === "explore" && (
          <>
            {/* Search + controls */}
            <div className="mb-5 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="Search idioms, meanings, or categories..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search idioms"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    </button>
                  )}
                </div>
                <button
                  onClick={randomIdiom}
                  aria-label="Show a random idiom"
                  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <Shuffle className="h-4 w-4" />
                  <span className="hidden sm:inline">Random</span>
                </button>
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                  aria-label="Toggle filters"
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    showFilters
                      ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>

              {showFilters && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    {/* Category */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        aria-label="Filter by category"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Difficulty */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                        Difficulty
                      </label>
                      <div className="flex gap-2">
                        {DIFFICULTIES.map((d) => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d)}
                            aria-pressed={difficulty === d}
                            className={`flex-1 rounded-lg border py-2 text-xs font-semibold capitalize transition-colors ${
                              difficulty === d
                                ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alphabet filter */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                      Starts With
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {ALPHABETS.map((a) => (
                        <button
                          key={a}
                          onClick={() => setAlphaFilter(alphaFilter === a ? "" : a)}
                          aria-pressed={alphaFilter === a}
                          className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                            alphaFilter === a
                              ? "bg-[var(--primary)] text-white"
                              : "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40 hover:text-[var(--foreground)]"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results count */}
            <p className="mb-3 text-sm text-[var(--muted-foreground)]">
              Showing{" "}
              <span className="font-semibold text-[var(--foreground)]">{filtered.length}</span>{" "}
              idiom{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Idiom grid */}
            {filtered.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((id) => (
                  <IdiomItem
                    key={id.id}
                    idiom={id}
                    isFav={favorites.includes(id.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
                <BookMarked className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-3" />
                <p className="text-lg font-bold text-[var(--foreground)]">No idioms found</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Try a different search or reset your filters.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                    setDifficulty("All");
                    setAlphaFilter("");
                  }}
                  className="mt-4 rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-semibold hover:bg-[var(--muted)] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Favorites Tab ── */}
        {activeTab === "favorites" && (
          <>
            {favIdioms.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {favIdioms.map((id) => (
                  <IdiomItem
                    key={id.id}
                    idiom={id}
                    isFav={true}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
                <Star className="mx-auto h-12 w-12 text-amber-300 mb-3" />
                <p className="text-lg font-bold text-[var(--foreground)]">No favorites yet</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Click the star icon on any idiom to save it here.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── History Tab ── */}
        {activeTab === "history" && (
          <>
            {history.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Recently viewed ({history.length})
                  </p>
                  <button
                    onClick={() => {
                      if (!window.confirm("Clear your entire idiom view history? This cannot be undone.")) {
                        return;
                      }
                      setHistory([]);
                      saveLS(LS_HIST, []);
                    }}
                    className="text-xs text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                  >
                    Clear history
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {history.map((id) => (
                    <IdiomItem
                      key={id.id}
                      idiom={id}
                      isFav={favorites.includes(id.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] py-16 text-center">
                <Clock className="mx-auto h-12 w-12 text-[var(--muted-foreground)] mb-3" />
                <p className="text-lg font-bold text-[var(--foreground)]">No history yet</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Idioms you view will appear here.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Quiz Tab ── */}
        {activeTab === "quiz" && (
          <QuizMode onExit={() => setActiveTab("explore")} />
        )}
      </div>

      {/* ── Idiom Detail Modal ── */}
      {selected && (
        <IdiomCard
          idiom={selected}
          isFav={favorites.includes(selected.id)}
          onToggleFav={toggleFav}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
