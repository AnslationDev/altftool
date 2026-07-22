"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Import,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shuffle,
  Star,
  Trash2,
  X,
} from "lucide-react";
import defaultSets from "../data/defaultSets";

const STORAGE_KEY = "altft_flashcards";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function nowISO() {
  return new Date().toISOString();
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function newCard(term, definition, setId) {
  return {
    id: generateId(),
    setId,
    term,
    definition,
    createdAt: nowISO(),
    favorited: false,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: nowISO(),
    lastReviewed: null,
  };
}

function newSet(name, language, description) {
  return {
    id: generateId(),
    name,
    language,
    description: description || "",
    createdAt: nowISO(),
  };
}

function sm2(card, quality) {
  const q = Math.max(0, Math.min(5, Math.floor(quality)));
  let { easeFactor, interval, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReview: daysFromNow(interval),
    lastReviewed: nowISO(),
  };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sets && parsed.cards) return parsed;
    }
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function loadDefaultSets() {
  const sets = [];
  const cards = [];
  defaultSets.forEach((ds) => {
    const sid = ds.id;
    sets.push({
      id: sid,
      name: ds.name,
      language: ds.language || "",
      description: ds.description || "",
      createdAt: nowISO(),
    });
    ds.cards.forEach((c) => {
      cards.push({
        ...newCard(c.term, c.definition, sid),
        id: `${sid}_${generateId()}`,
      });
    });
  });
  return { sets, cards };
}

function initialState() {
  const saved = loadState();
  if (saved) return saved;
  return loadDefaultSets();
}

function calculateStats(cards) {
  const now = getToday();
  const total = cards.length;
  const studied = cards.filter((c) => c.lastReviewed).length;
  const mastered = cards.filter((c) => c.repetitions >= 5 && c.interval >= 21).length;
  const needsReview = cards.filter((c) => new Date(c.nextReview).getTime() <= Date.now() + 86400000 && c.lastReviewed).length;
  const newCards = cards.filter((c) => !c.lastReviewed).length;
  const favorited = cards.filter((c) => c.favorited).length;
  return { total, studied, mastered, needsReview, newCards, favorited };
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_SET": {
      const s = newSet(action.name, action.language, action.description);
      return { ...state, sets: [...state.sets, s] };
    }
    case "UPDATE_SET": {
      return {
        ...state,
        sets: state.sets.map((s) => (s.id === action.id ? { ...s, ...action.data } : s)),
      };
    }
    case "DELETE_SET": {
      return {
        ...state,
        sets: state.sets.filter((s) => s.id !== action.id),
        cards: state.cards.filter((c) => c.setId !== action.id),
      };
    }
    case "ADD_CARD": {
      const c = newCard(action.term, action.definition, action.setId);
      return { ...state, cards: [...state.cards, c] };
    }
    case "ADD_CARDS_BULK": {
      const newCards = action.cards.map((c) => newCard(c.term, c.definition, action.setId));
      return { ...state, cards: [...state.cards, ...newCards] };
    }
    case "UPDATE_CARD": {
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.id ? { ...c, ...action.data } : c)),
      };
    }
    case "DELETE_CARD": {
      return { ...state, cards: state.cards.filter((c) => c.id !== action.id) };
    }
    case "TOGGLE_FAVORITE": {
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.id ? { ...c, favorited: !c.favorited } : c)),
      };
    }
    case "REVIEW_CARD": {
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.id ? sm2(c, action.quality) : c)),
      };
    }
    case "IMPORT": {
      return action.data;
    }
    case "RESET_DEFAULTS": {
      const def = loadDefaultSets();
      return { sets: def.sets, cards: def.cards };
    }
    default:
      return state;
  }
}

const TABS = ["sets", "study", "progress"];

const qualityLabels = [
  { value: 0, label: "Complete blackout", short: "1" },
  { value: 1, label: "Incorrect, but remembered upon seeing answer", short: "2" },
  { value: 2, label: "Incorrect, but answer felt familiar", short: "3" },
  { value: 3, label: "Correct with serious difficulty", short: "4" },
  { value: 4, label: "Correct after hesitation", short: "5" },
  { value: 5, label: "Perfect response", short: "6" },
];

function CardFlip({ card, flipped, onFlip, onRate, rated }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-full max-w-lg cursor-pointer"
        style={{ minHeight: 260 }}
        onClick={onFlip}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onFlip(); } }}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Show term" : "Show definition"}
      >
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-(--border) bg-(--card) p-8 shadow-sm transition-all duration-300 [backface-visibility:hidden] ${
            flipped ? "opacity-0 pointer-events-none rotate-y-180" : "opacity-100"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Term</span>
          <p className="mt-3 text-center text-2xl font-bold text-(--foreground)">{card.term}</p>
          {flipped && <p className="mt-4 text-center text-lg text-(--primary)">{card.definition}</p>}
        </div>
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-(--border) bg-(--card) p-8 shadow-sm transition-all duration-300 [backface-visibility:hidden] [transform:rotateY(180deg)] ${
            flipped ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Definition</span>
          <p className="mt-3 text-center text-2xl font-bold text-(--foreground)">{card.definition}</p>
        </div>
      </div>

      {flipped && !rated && (
        <div className="mt-6 w-full max-w-lg">
          <p className="mb-3 text-center text-sm font-semibold text-(--muted-foreground)">How well did you know this?</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {qualityLabels.map((ql) => (
              <button
                key={ql.value}
                type="button"
                onClick={() => onRate(ql.value)}
                className="rounded-lg border border-(--border) bg-(--background) px-2 py-3 text-center text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:bg-(--muted) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
                aria-label={`Rate ${ql.label}`}
              >
                <span className="block text-base">{ql.short}</span>
                <span className="mt-1 block text-[10px] leading-tight text-(--muted-foreground)">{ql.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {rated && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-(--anslation-ds-success)" />
          <span className="text-sm font-semibold text-(--foreground)">Rated</span>
        </div>
      )}
    </div>
  );
}

function CreateCardForm({ setId, onAdd, onCancel }) {
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    onAdd(term.trim(), definition.trim());
    setTerm("");
    setDefinition("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-(--border) bg-(--card) p-5">
      <div>
        <label htmlFor="new-term" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">Term</label>
        <input
          id="new-term"
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="e.g. Hola"
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) placeholder-(--muted-foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="new-def" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">Definition</label>
        <input
          id="new-def"
          type="text"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          placeholder="e.g. Hello"
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) placeholder-(--muted-foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
          required
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Card
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function BulkImportForm({ setId, onAdd, onCancel }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const cards = [];
    for (const line of lines) {
      const sep = line.includes("\t") ? "\t" : line.includes("|") ? "|" : line.includes("  ") ? "  " : ",";
      const parts = line.split(sep).map((p) => p.trim());
      if (parts.length >= 2) {
        cards.push({ term: parts[0], definition: parts.slice(1).join(" - ") });
      }
    }
    if (cards.length === 0) {
      setError("No valid card data found. Use format: term | definition per line.");
      return;
    }
    onAdd(cards);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-(--border) bg-(--card) p-5">
      <div>
        <label htmlFor="bulk-text" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">
          Paste cards (one per line, term | definition)
        </label>
        <textarea
          id="bulk-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={"Hola | Hello\nGracias | Thank you\nAdiós | Goodbye"}
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) placeholder-(--muted-foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
        />
      </div>
      {error && <p className="text-sm font-semibold text-(--anslation-ds-danger)">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          <Import className="h-4 w-4" />
          Import Cards
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function EditCardForm({ card, onSave, onCancel }) {
  const [term, setTerm] = useState(card.term);
  const [definition, setDefinition] = useState(card.definition);

  function handleSubmit(e) {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    onSave(card.id, term.trim(), definition.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-(--border) bg-(--card) p-5">
      <div>
        <label htmlFor="edit-term" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">Term</label>
        <input
          id="edit-term"
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="edit-def" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">Definition</label>
        <input
          id="edit-def"
          type="text"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
          required
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          <Pencil className="h-4 w-4" />
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function SetForm({ onSave, onCancel, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [language, setLanguage] = useState(initial?.language || "");
  const [description, setDescription] = useState(initial?.description || "");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), language: language.trim(), description: description.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-(--border) bg-(--card) p-5">
      <div>
        <label htmlFor="set-name" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">Set Name</label>
        <input
          id="set-name"
          type="text"
          value={name}
          onChange={(e) => set(e.target.value)}
          placeholder="e.g. Spanish Basics"
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) placeholder-(--muted-foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
          required
        />
      </div>
      <div>
        <label htmlFor="set-lang" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">Language</label>
        <input
          id="set-lang"
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="e.g. Spanish"
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) placeholder-(--muted-foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="set-desc" className="mb-1.5 block text-xs font-semibold uppercase text-(--muted-foreground)">Description</label>
        <input
          id="set-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-sm text-(--foreground) placeholder-(--muted-foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
        />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          {initial ? "Save Changes" : "Create Set"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function StudySession({ cards, set, onReview, onBack, onToggleFavorite }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(false);
  const [shuffled, setShuffled] = useState(null);
  const [sessionCards, setSessionCards] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState([]);
  const [shuffleMode, setShuffleMode] = useState(false);

  useEffect(() => {
    const due = cards.filter((c) => new Date(c.nextReview).getTime() <= Date.now() + 86400000 || !c.lastReviewed);
    if (due.length === 0) {
      setSessionCards(shuffleMode ? shuffleArray([...cards]) : [...cards]);
    } else {
      setSessionCards(shuffleMode ? shuffleArray(due) : due);
    }
    setIndex(0);
    setFlipped(false);
    setRated(false);
    setCompleted(false);
    setResults([]);
  }, [cards, shuffleMode]);

  const currentCard = sessionCards[index];

  function handleRate(quality) {
    if (!currentCard) return;
    onReview(currentCard.id, quality);
    setRated(true);
    setResults((prev) => [...prev, { cardId: currentCard.id, quality }]);
  }

  function handleNext() {
    if (index < sessionCards.length - 1) {
      setIndex((i) => i + 1);
      setFlipped(false);
      setRated(false);
    } else {
      setCompleted(true);
    }
  }

  function handleFlip() {
    if (!rated) setFlipped((f) => !f);
  }

  function handleRetry() {
    const due = cards.filter((c) => new Date(c.nextReview).getTime() <= Date.now() + 86400000 || !c.lastReviewed);
    setSessionCards(shuffleMode ? shuffleArray(due.length ? due : [...cards]) : (due.length ? due : [...cards]));
    setIndex(0);
    setFlipped(false);
    setRated(false);
    setCompleted(false);
    setResults([]);
  }

  function toggleShuffle() {
    setShuffleMode((s) => !s);
  }

  if (completed) {
    const correct = results.filter((r) => r.quality >= 3).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-(--border) bg-(--card) p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--muted)">
            <CheckCircle2 className="h-8 w-8 text-(--anslation-ds-success)" />
          </div>
          <h3 className="mt-4 text-2xl font-bold text-(--foreground)">Session Complete</h3>
          <p className="mt-2 text-(--muted-foreground)">You reviewed {total} cards</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-(--border) bg-(--background) px-3 py-4">
              <p className="text-2xl font-bold text-(--foreground)">{pct}%</p>
              <p className="text-xs font-semibold text-(--muted-foreground)">Accuracy</p>
            </div>
            <div className="rounded-lg border border-(--border) bg-(--background) px-3 py-4">
              <p className="text-2xl font-bold text-(--foreground)">{correct}</p>
              <p className="text-xs font-semibold text-(--muted-foreground)">Correct</p>
            </div>
            <div className="rounded-lg border border-(--border) bg-(--background) px-3 py-4">
              <p className="text-2xl font-bold text-(--foreground)">{total - correct}</p>
              <p className="text-xs font-semibold text-(--muted-foreground)">Needs Review</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={handleRetry} className="btn-primary">
              <RefreshCw className="h-4 w-4" />
              Study Again
            </button>
            <button type="button" onClick={onBack} className="btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Set
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpenCheck className="h-12 w-12 text-(--muted-foreground)" />
        <p className="mt-4 text-lg font-semibold text-(--foreground)">No cards to study</p>
        <p className="mt-2 text-sm text-(--muted-foreground)">Add some cards to this set first.</p>
        <button type="button" onClick={onBack} className="btn-secondary mt-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="btn-ghost p-2" aria-label="Back to set">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">{set.name}</p>
            <p className="text-lg font-bold text-(--foreground)">Study Session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-(--muted-foreground)">
            {index + 1} / {sessionCards.length}
          </span>
          <button
            type="button"
            onClick={toggleShuffle}
            className={`rounded-lg border p-2 transition focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none ${
              shuffleMode ? "border-(--primary) bg-(--muted) text-(--primary)" : "border-(--border) text-(--muted-foreground)"
            }`}
            aria-label="Toggle shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(currentCard.id)}
            className={`rounded-lg border p-2 transition focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none ${
              currentCard.favorited ? "border-(--anslation-ds-danger) text-(--anslation-ds-danger)" : "border-(--border) text-(--muted-foreground)"
            }`}
            aria-label={currentCard.favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${currentCard.favorited ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-(--muted)">
        <div
          className="h-full rounded-full bg-(--primary) transition-all"
          style={{ width: `${((index + 1) / sessionCards.length) * 100}%` }}
        />
      </div>

      <CardFlip
        card={currentCard}
        flipped={flipped}
        onFlip={handleFlip}
        onRate={handleRate}
        rated={rated}
      />

      {rated && (
        <div className="flex justify-center">
          <button type="button" onClick={handleNext} className="btn-primary">
            {index < sessionCards.length - 1 ? "Next Card" : "See Results"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressDashboard({ cards, sets }) {
  const stats = useMemo(() => calculateStats(cards), [cards]);

  const masteredCards = useMemo(() => cards.filter((c) => c.repetitions >= 5 && c.interval >= 21), [cards]);
  const needsReviewCards = useMemo(() => cards.filter((c) => new Date(c.nextReview).getTime() <= Date.now() + 86400000 && c.lastReviewed), [cards]);
  const favoritedCards = useMemo(() => cards.filter((c) => c.favorited), [cards]);

  const setStats = useMemo(() => {
    return sets.map((s) => {
      const setCards = cards.filter((c) => c.setId === s.id);
      return {
        ...s,
        total: setCards.length,
        mastered: setCards.filter((c) => c.repetitions >= 5 && c.interval >= 21).length,
        studied: setCards.filter((c) => c.lastReviewed).length,
      };
    });
  }, [sets, cards]);

  const maxTotal = Math.max(1, ...setStats.map((s) => s.total));

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Layers className="h-12 w-12 text-(--muted-foreground)" />
        <p className="mt-4 text-lg font-semibold text-(--foreground)">No data yet</p>
        <p className="mt-2 text-sm text-(--muted-foreground)">Start studying to see your progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total Cards", value: stats.total },
          { label: "Studied", value: stats.studied },
          { label: "Mastered", value: stats.mastered },
          { label: "Needs Review", value: stats.needsReview },
          { label: "New", value: stats.newCards },
          { label: "Favorites", value: stats.favorited },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-(--border) bg-(--card) px-4 py-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-(--foreground)">{s.value}</p>
            <p className="mt-1 text-xs font-semibold text-(--muted-foreground)">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm">
        <h3 className="text-lg font-bold text-(--foreground)">Mastery Overview</h3>
        {stats.total > 0 && (
          <div className="mt-4 space-y-3">
            {[
              { label: "Mastered", count: stats.mastered, color: "bg-(--anslation-ds-success)" },
              { label: "Studied", count: stats.studied - stats.mastered, color: "bg-(--primary)" },
              { label: "Needs Review", count: stats.needsReview, color: "bg-(--anslation-ds-warning)" },
              { label: "New / Unseen", count: stats.newCards, color: "bg-(--muted-foreground)" },
            ].map((b) =>
              b.count > 0 ? (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="w-28 text-xs font-semibold text-(--muted-foreground)">{b.label}</span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-(--muted)">
                    <div
                      className={`h-full rounded-full ${b.color} transition-all`}
                      style={{ width: `${(b.count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-(--foreground)">{b.count}</span>
                </div>
              ) : null,
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm">
        <h3 className="text-lg font-bold text-(--foreground)">Sets Breakdown</h3>
        <div className="mt-4 space-y-4">
          {setStats.map((s) => (
            <div key={s.id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-(--foreground)">{s.name}</span>
                <span className="text-xs font-semibold text-(--muted-foreground)">
                  {s.mastered}/{s.total} mastered
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-(--muted)">
                <div
                  className="h-full rounded-full bg-(--primary) transition-all"
                  style={{ width: `${(s.total / maxTotal) * 100}%` }}
                />
                <div
                  className="-mt-2 h-full rounded-full bg-(--anslation-ds-success) transition-all"
                  style={{ width: `${(s.mastered / maxTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {favoritedCards.length > 0 && (
        <div className="rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <h3 className="text-lg font-bold text-(--foreground)">Favorited Cards</h3>
          <div className="mt-4 space-y-2">
            {favoritedCards.slice(0, 10).map((c) => {
              const s = sets.find((set) => set.id === c.setId);
              return (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-(--border) bg-(--background) px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">{c.term}</p>
                    <p className="text-xs text-(--muted-foreground)">{c.definition} — {s?.name || "Unknown"}</p>
                  </div>
                  <Heart className="h-4 w-4 text-(--anslation-ds-danger) fill-current" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {needsReviewCards.length > 0 && (
        <div className="rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <h3 className="text-lg font-bold text-(--foreground)">Due for Review</h3>
          <div className="mt-4 space-y-2">
            {needsReviewCards.slice(0, 10).map((c) => {
              const s = sets.find((set) => set.id === c.setId);
              return (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-(--border) bg-(--background) px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-(--foreground)">{c.term}</p>
                    <p className="text-xs text-(--muted-foreground)">{c.definition} — {s?.name || "Unknown"}</p>
                  </div>
                  <span className="text-xs font-semibold text-(--anslation-ds-warning)">Due</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CardList({ cards, set, onToggleFavorite, onDelete, onEdit }) {
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("created");

  const filtered = useMemo(() => {
    let result = [...cards];
    if (showFavorites) result = result.filter((c) => c.favorited);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.term.toLowerCase().includes(q) || c.definition.toLowerCase().includes(q));
    }
    if (sortBy === "created") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "term") result.sort((a, b) => a.term.localeCompare(b.term));
    else if (sortBy === "review") {
      result.sort((a, b) => {
        if (!a.lastReviewed) return -1;
        if (!b.lastReviewed) return 1;
        return new Date(a.nextReview) - new Date(b.nextReview);
      });
    }
    return result;
  }, [cards, search, showFavorites, sortBy]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BookOpenCheck className="h-12 w-12 text-(--muted-foreground)" />
        <p className="mt-4 text-lg font-semibold text-(--foreground)">No cards yet</p>
        <p className="mt-2 text-sm text-(--muted-foreground)">Create your first card to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full rounded-lg border border-(--border) bg-(--background) py-2.5 pl-10 pr-3 text-sm text-(--foreground) placeholder-(--muted-foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFavorites((f) => !f)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none ${
            showFavorites ? "border-(--anslation-ds-danger) bg-(--muted) text-(--anslation-ds-danger)" : "border-(--border) text-(--muted-foreground)"
          }`}
        >
          <Heart className={`h-4 w-4 ${showFavorites ? "fill-current" : ""}`} />
          Favorites
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-(--border) bg-(--background) px-3 py-2.5 text-xs font-semibold text-(--foreground) focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
          aria-label="Sort cards"
        >
          <option value="created">Newest</option>
          <option value="term">Term A-Z</option>
          <option value="review">Due Soon</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-(--border) bg-(--card) px-5 py-8 text-center text-sm text-(--muted-foreground)">
          No cards match your search.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="group relative rounded-xl border border-(--border) bg-(--card) p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-(--foreground)">{c.term}</p>
                <p className="mt-1 truncate text-sm text-(--muted-foreground)">{c.definition}</p>
              </div>
              <button
                type="button"
                onClick={() => onToggleFavorite(c.id)}
                className={`shrink-0 rounded-lg p-1.5 transition ${
                  c.favorited ? "text-(--anslation-ds-danger)" : "text-(--muted-foreground) opacity-0 group-hover:opacity-100"
                }`}
                aria-label={c.favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`h-4 w-4 ${c.favorited ? "fill-current" : ""}`} />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {c.repetitions >= 5 && c.interval >= 21 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-(--anslation-ds-success)/10 px-2 py-0.5 text-[10px] font-semibold text-(--anslation-ds-success)">
                  <CheckCircle2 className="h-3 w-3" />
                  Mastered
                </span>
              ) : c.lastReviewed ? (
                <span className="text-[10px] font-semibold text-(--muted-foreground)">
                  Next: {new Date(c.nextReview).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-(--primary)">
                  New
                </span>
              )}
              <div className="ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => onEdit(c)}
                  className="rounded-lg p-1.5 text-(--muted-foreground) transition hover:text-(--foreground)"
                  aria-label="Edit card"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  className="rounded-lg p-1.5 text-(--muted-foreground) transition hover:text-(--anslation-ds-danger)"
                  aria-label="Delete card"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const [activeTab, setActiveTab] = useState("sets");
  const [activeSetId, setActiveSetId] = useState(null);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showCreateSet, setShowCreateSet] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [editingSet, setEditingSet] = useState(null);
  const [studying, setStudying] = useState(false);
  const [importOpened, setImportOpened] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeSet = useMemo(() => state.sets.find((s) => s.id === activeSetId), [state.sets, activeSetId]);
  const setCards = useMemo(() => state.cards.filter((c) => c.setId === activeSetId), [state.cards, activeSetId]);

  const stats = useMemo(() => calculateStats(state.cards), [state.cards]);

  function handleAddSet(data) {
    dispatch({ type: "ADD_SET", ...data });
    setShowCreateSet(false);
  }

  function handleUpdateSet(data) {
    dispatch({ type: "UPDATE_SET", id: editingSet.id, data });
    setEditingSet(null);
  }

  function handleDeleteSet(id) {
    if (window.confirm("Delete this set and all its cards?")) {
      dispatch({ type: "DELETE_SET", id });
      if (activeSetId === id) setActiveSetId(null);
    }
  }

  function handleAddCard(term, definition) {
    dispatch({ type: "ADD_CARD", term, definition, setId: activeSetId });
    setShowCreateCard(false);
  }

  function handleBulkAdd(cards) {
    dispatch({ type: "ADD_CARDS_BULK", cards, setId: activeSetId });
    setShowBulkImport(false);
  }

  function handleEditCard(card) {
    setEditingCard(card);
  }

  function handleSaveCard(id, term, definition) {
    dispatch({ type: "UPDATE_CARD", id, data: { term, definition } });
    setEditingCard(null);
  }

  function handleDeleteCard(id) {
    if (window.confirm("Delete this card?")) {
      dispatch({ type: "DELETE_CARD", id });
    }
  }

  function handleToggleFavorite(id) {
    dispatch({ type: "TOGGLE_FAVORITE", id });
  }

  function handleReview(id, quality) {
    dispatch({ type: "REVIEW_CARD", id, quality });
  }

  function handleExport() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flashcards-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportTriggered(true);
    setTimeout(() => setExportTriggered(false), 2000);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.sets && data.cards) {
          dispatch({ type: "IMPORT", data });
          setImportOpened(true);
          setTimeout(() => setImportOpened(false), 2000);
        } else {
          alert("Invalid file format.");
        }
      } catch {
        alert("Could not parse file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleResetDefaults() {
    if (window.confirm("Reset to default flashcard sets? All your data will be lost.")) {
      dispatch({ type: "RESET_DEFAULTS" });
    }
  }

  function goToSet(id) {
    setActiveSetId(id);
    setShowCreateCard(false);
    setShowBulkImport(false);
    setEditingCard(null);
    setStudying(false);
  }

  function startStudy() {
    setStudying(true);
  }

  return (
    <div className="mx-auto w-full max-w-6xl py-6">
      <div className="space-y-6">
        <section className="rounded-xl border border-(--border) bg-(--card) p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--muted)">
                <BookOpenCheck className="h-6 w-6 text-(--primary)" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-(--foreground)">Language Learning Flashcards</h1>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Create, study, and master vocabulary with spaced repetition.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  aria-label="Import flashcards"
                />
                <span className="btn-secondary inline-flex items-center gap-2 text-xs">
                  <Import className="h-4 w-4" />
                  Import
                </span>
              </label>
              <button type="button" onClick={handleExport} className="btn-secondary inline-flex items-center gap-2 text-xs">
                <Download className="h-4 w-4" />
                {exportTriggered ? "Exported!" : "Export"}
              </button>
              <button type="button" onClick={handleResetDefaults} className="btn-ghost inline-flex items-center gap-2 text-xs">
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {importOpened && (
            <div className="mt-4 rounded-lg border border-(--anslation-ds-success) bg-(--anslation-ds-success)/5 px-4 py-3 text-sm font-semibold text-(--anslation-ds-success)">
              Flashcards imported successfully.
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-1 rounded-xl border border-(--border) bg-(--card) p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setActiveSetId(null); setStudying(false); }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none ${
                activeTab === tab
                  ? "bg-(--primary) text-white shadow-sm"
                  : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
              }`}
            >
              {tab === "sets" && "My Sets"}
              {tab === "study" && "Study"}
              {tab === "progress" && "Progress"}
            </button>
          ))}
        </div>

        {activeTab === "progress" && (
          <ProgressDashboard cards={state.cards} sets={state.sets} />
        )}

        {activeTab === "sets" && !activeSetId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-(--foreground)">Flashcard Sets</h2>
              <button type="button" onClick={() => setShowCreateSet(true)} className="btn-primary text-xs">
                <Plus className="h-4 w-4" />
                New Set
              </button>
            </div>

            {showCreateSet && (
              <SetForm onSave={handleAddSet} onCancel={() => setShowCreateSet(false)} />
            )}

            {state.sets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border) px-5 py-16">
                <Layers className="h-12 w-12 text-(--muted-foreground)" />
                <p className="mt-4 text-lg font-semibold text-(--foreground)">No flashcard sets</p>
                <p className="mt-2 text-sm text-(--muted-foreground)">Create your first set to start learning.</p>
                <button type="button" onClick={() => setShowCreateSet(true)} className="btn-primary mt-6">
                  <Plus className="h-4 w-4" />
                  Create Set
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {state.sets.map((s) => {
                  const setCards = state.cards.filter((c) => c.setId === s.id);
                  const masteredCount = setCards.filter((c) => c.repetitions >= 5 && c.interval >= 21).length;
                  const dueCount = setCards.filter(
                    (c) => new Date(c.nextReview).getTime() <= Date.now() + 86400000 && c.lastReviewed,
                  ).length;
                  return (
                    <div
                      key={s.id}
                      className="group cursor-pointer rounded-xl border border-(--border) bg-(--card) p-5 shadow-sm transition hover:shadow-md"
                      onClick={() => goToSet(s.id)}
                      onKeyDown={(e) => { if (e.key === "Enter") goToSet(s.id); }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open set ${s.name}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-bold text-(--foreground)">{s.name}</h3>
                          {s.language && (
                            <span className="mt-1 inline-block rounded-full bg-(--muted) px-2.5 py-0.5 text-[11px] font-semibold text-(--primary)">
                              {s.language}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setEditingSet(s); }}
                          className="shrink-0 rounded-lg p-1.5 text-(--muted-foreground) opacity-0 transition hover:text-(--foreground) group-hover:opacity-100"
                          aria-label="Edit set"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {s.description && (
                        <p className="mt-2 text-sm text-(--muted-foreground) line-clamp-2">{s.description}</p>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-(--muted-foreground)">
                        <span>{setCards.length} cards</span>
                        {masteredCount > 0 && <span className="text-(--anslation-ds-success)">{masteredCount} mastered</span>}
                        {dueCount > 0 && <span className="text-(--anslation-ds-warning)">{dueCount} due</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "sets" && activeSetId && activeSet && !studying && (
          <div className="space-y-6">
            {editingSet && (
              <SetForm
                initial={editingSet}
                onSave={handleUpdateSet}
                onCancel={() => setEditingSet(null)}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { setActiveSetId(null); setShowCreateCard(false); setShowBulkImport(false); }}
                  className="btn-ghost p-2"
                  aria-label="Back to sets"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-(--foreground)">{activeSet.name}</h2>
                  <p className="text-sm text-(--muted-foreground)">{setCards.length} cards</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {setCards.length > 0 && (
                  <button type="button" onClick={startStudy} className="btn-primary text-xs">
                    <BookOpenCheck className="h-4 w-4" />
                    Study
                  </button>
                )}
                <button type="button" onClick={() => { setShowCreateCard(true); setShowBulkImport(false); }} className="btn-secondary text-xs">
                  <Plus className="h-4 w-4" />
                  Add Card
                </button>
                <button type="button" onClick={() => { setShowBulkImport(true); setShowCreateCard(false); }} className="btn-ghost text-xs">
                  <Import className="h-4 w-4" />
                  Bulk Import
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSet(activeSet.id)}
                  className="btn-ghost text-xs text-(--anslation-ds-danger)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showCreateCard && (
              <CreateCardForm setId={activeSetId} onAdd={handleAddCard} onCancel={() => setShowCreateCard(false)} />
            )}

            {showBulkImport && (
              <BulkImportForm setId={activeSetId} onAdd={handleBulkAdd} onCancel={() => setShowBulkImport(false)} />
            )}

            {editingCard && (
              <EditCardForm card={editingCard} onSave={handleSaveCard} onCancel={() => setEditingCard(null)} />
            )}

            <CardList
              cards={setCards}
              set={activeSet}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDeleteCard}
              onEdit={handleEditCard}
            />
          </div>
        )}

        {activeTab === "sets" && activeSetId && studying && (
          <StudySession
            cards={setCards}
            set={activeSet}
            onReview={handleReview}
            onBack={() => setStudying(false)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === "study" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-(--foreground)">Start Studying</h2>
            {state.sets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border) px-5 py-16">
                <BookOpenCheck className="h-12 w-12 text-(--muted-foreground)" />
                <p className="mt-4 text-lg font-semibold text-(--foreground)">No sets available</p>
                <p className="mt-2 text-sm text-(--muted-foreground)">Create a flashcard set first.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {state.sets.map((s) => {
                  const setCards = state.cards.filter((c) => c.setId === s.id);
                  const dueCount = setCards.filter(
                    (c) => (new Date(c.nextReview).getTime() <= Date.now() + 86400000 && c.lastReviewed) || !c.lastReviewed,
                  ).length;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setActiveSetId(s.id); setStudying(true); setActiveTab("sets"); }}
                      className="group rounded-xl border border-(--border) bg-(--card) p-5 text-left shadow-sm transition hover:shadow-md focus:shadow-[0_0_0_3px_rgba(20,184,166,.35)] focus:outline-none"
                    >
                      <h3 className="text-lg font-bold text-(--foreground)">{s.name}</h3>
                      <p className="mt-2 text-sm text-(--muted-foreground)">{setCards.length} cards</p>
                      {dueCount > 0 && (
                        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-(--anslation-ds-warning)/10 px-2.5 py-1 text-xs font-semibold text-(--anslation-ds-warning)">
                          <AlertCircle className="h-3 w-3" />
                          {dueCount} due for review
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 8px;
          background: var(--primary, #0D9488);
          color: #fff;
          font-size: 0.8125rem;
          font-weight: 600;
          height: 40px;
          padding: 0 1rem;
          border: none;
          cursor: pointer;
          transition: background 150ms ease-out;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #0F766E; }
        .btn-primary:focus { outline: none; box-shadow: 0 0 0 3px rgba(20,184,166,.35); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 8px;
          background: transparent;
          color: var(--foreground, #111827);
          font-size: 0.8125rem;
          font-weight: 600;
          height: 40px;
          padding: 0 1rem;
          border: 1px solid var(--border, #E2E8F0);
          cursor: pointer;
          transition: all 150ms ease-out;
          white-space: nowrap;
        }
        .btn-secondary:hover { border-color: var(--primary, #0D9488); background: var(--muted, #F1F5F9); }
        .btn-secondary:focus { outline: none; box-shadow: 0 0 0 3px rgba(20,184,166,.35); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 8px;
          background: transparent;
          color: var(--foreground, #111827);
          font-size: 0.8125rem;
          font-weight: 600;
          height: 40px;
          padding: 0 1rem;
          border: none;
          cursor: pointer;
          transition: background 150ms ease-out;
          white-space: nowrap;
        }
        .btn-ghost:hover { background: var(--muted, #F1F5F9); }
        .btn-ghost:focus { outline: none; box-shadow: 0 0 0 3px rgba(20,184,166,.35); }

        .rotate-y-180 {
          --tw-rotate-y: 180deg;
          transform: rotateY(var(--tw-rotate-y));
        }

        @media (prefers-reduced-motion: reduce) {
          .transition-all, .transition, .btn-primary, .btn-secondary, .btn-ghost {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
