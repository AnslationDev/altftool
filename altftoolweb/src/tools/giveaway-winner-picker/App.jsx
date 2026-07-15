"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Copy,
  Download,
  Edit3,
  Gift,
  History,
  ListPlus,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Wand2,
  X,
} from "lucide-react";

const STORAGE_KEY = "altftools:giveaway-winner-picker:v1";
const REVEAL_STEPS = 28;

const sampleEntries = [
  "@creatorhub",
  "@manojdesign",
  "@reelstudio",
  "@pixelprachi",
  "@socialspark",
];

const defaultState = {
  giveaway: {
    title: "Gaming Headset Giveaway",
    prize: "RGB Wireless Gaming Headset",
    description: "A quick creator giveaway for active followers.",
    startDate: "",
    endDate: "",
    rules: "Follow the page, like the post, and leave one comment.",
    notes: "Verify winners before announcing publicly.",
  },
  participants: sampleEntries.map((name, index) => ({
    id: `sample-${index + 1}`,
    name,
  })),
  winnerCount: 1,
  reserveCount: 1,
  allowBonusEntries: false,
  spotlightTheme: "neon",
  winners: [],
  history: [],
};

const spotlightThemes = {
  neon: {
    label: "Neon",
    card: "from-blue-600 via-indigo-600 to-cyan-500",
    chip: "bg-white/15 text-white border-white/20",
  },
  sunset: {
    label: "Sunset",
    card: "from-rose-500 via-orange-500 to-amber-400",
    chip: "bg-white/15 text-white border-white/20",
  },
  emerald: {
    label: "Emerald",
    card: "from-emerald-600 via-teal-500 to-cyan-400",
    chip: "bg-white/15 text-white border-white/20",
  },
};

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function createParticipant(name) {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim(),
  };
}

function pickRandomItems(items, count) {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const j = buffer[0] % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function GiveawayWinnerPickerApp() {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });
  const [entryInput, setEntryInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [highlightName, setHighlightName] = useState("Ready to draw");
  const revealTimerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    return () => clearInterval(revealTimerRef.current);
  }, []);

  const duplicateMap = useMemo(() => {
    const map = new Map();
    state.participants.forEach((entry) => {
      const key = normalizeName(entry.name);
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [state.participants]);

  const duplicateCount = useMemo(
    () =>
      state.participants.filter(
        (entry) => duplicateMap.get(normalizeName(entry.name)) > 1,
      ).length,
    [duplicateMap, state.participants],
  );

  const activeEntries = useMemo(() => {
    if (state.allowBonusEntries) return state.participants;
    const seen = new Set();
    return state.participants.filter((entry) => {
      const key = normalizeName(entry.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [state.allowBonusEntries, state.participants]);

  const filteredParticipants = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return state.participants;
    return state.participants.filter((entry) =>
      entry.name.toLowerCase().includes(term),
    );
  }, [query, state.participants]);

  const totalPickCount = Math.min(
    Number(state.winnerCount) + Number(state.reserveCount),
    activeEntries.length,
  );

  const giveawayStatus = (() => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.giveaway.endDate && state.giveaway.endDate < today) return "Ended";
    if (state.giveaway.startDate && state.giveaway.startDate > today) {
      return "Scheduled";
    }
    return "Active";
  })();

  const shareText = useMemo(() => {
    const winnerLines = state.winners
      .map((winner, index) => `${index + 1}. ${winner.name} - ${winner.role}`)
      .join("\n");
    return `${state.giveaway.title || "Giveaway"}\nPrize: ${
      state.giveaway.prize || "Prize"
    }\nEntries: ${activeEntries.length}\n\nWinners:\n${
      winnerLines || "No draw yet"
    }`;
  }, [activeEntries.length, state.giveaway.prize, state.giveaway.title, state.winners]);

  const spotlightTheme =
    spotlightThemes[state.spotlightTheme] || spotlightThemes.neon;

  function updateGiveaway(field, value) {
    setState((current) => ({
      ...current,
      giveaway: { ...current.giveaway, [field]: value },
    }));
  }

  function addEntry() {
    const name = entryInput.trim();
    if (!name) {
      setMessage("Add a username or participant name first.");
      return;
    }
    setState((current) => ({
      ...current,
      participants: [createParticipant(name), ...current.participants],
    }));
    setEntryInput("");
    setMessage("Participant added.");
  }

  function addBulkEntries() {
    const names = bulkInput
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!names.length) {
      setMessage("Paste one or more names to import.");
      return;
    }
    setState((current) => ({
      ...current,
      participants: [...names.map(createParticipant), ...current.participants],
    }));
    setBulkInput("");
    setMessage(`${names.length} entries imported.`);
  }

  function removeEntry(id) {
    setState((current) => ({
      ...current,
      participants: current.participants.filter((entry) => entry.id !== id),
      winners: current.winners.filter((winner) => winner.id !== id),
    }));
  }

  function saveEdit(id) {
    const name = editingValue.trim();
    if (!name) {
      setMessage("Participant name cannot be empty.");
      return;
    }
    setState((current) => ({
      ...current,
      participants: current.participants.map((entry) =>
        entry.id === id ? { ...entry, name } : entry,
      ),
    }));
    setEditingId(null);
    setEditingValue("");
  }

  function cleanupDuplicates() {
    const seen = new Set();
    setState((current) => ({
      ...current,
      participants: current.participants.filter((entry) => {
        const key = normalizeName(entry.name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }),
    }));
    setMessage("Duplicate entries cleaned.");
  }

  function runDraw() {
    if (isDrawing) return;
    if (!activeEntries.length) {
      setMessage("Add participants before running a draw.");
      return;
    }
    if (totalPickCount < 1) {
      setMessage("Choose at least one winner or reserve.");
      return;
    }

    setIsDrawing(true);
    setCountdown(3);
    setState((current) => ({ ...current, winners: [] }));

    const countdownTimer = setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          clearInterval(countdownTimer);
          startReveal();
          return null;
        }
        return value - 1;
      });
    }, 700);
  }

  function startReveal() {
    let step = 0;
    clearInterval(revealTimerRef.current);
    revealTimerRef.current = setInterval(() => {
      const randomEntry =
        activeEntries[Math.floor(Math.random() * activeEntries.length)];
      setHighlightName(randomEntry?.name || "Drawing...");
      step += 1;

      if (step >= REVEAL_STEPS) {
        clearInterval(revealTimerRef.current);
        const picks = pickRandomItems(activeEntries, totalPickCount).map(
          (entry, index) => ({
            ...entry,
            role:
              index < Number(state.winnerCount)
                ? `Winner ${index + 1}`
                : `Backup ${index - Number(state.winnerCount) + 1}`,
            pickedAt: new Date().toISOString(),
          }),
        );
        const record = {
          id: Date.now(),
          title: state.giveaway.title || "Untitled Giveaway",
          prize: state.giveaway.prize || "Prize",
          pickedAt: new Date().toISOString(),
          winners: picks,
        };
        setState((current) => ({
          ...current,
          winners: picks,
          history: [record, ...current.history].slice(0, 20),
        }));
        setHighlightName(picks[0]?.name || "Winner revealed");
        setIsDrawing(false);
        confetti({ particleCount: 120, spread: 78, origin: { y: 0.72 } });
      }
    }, 86);
  }

  async function copyResults() {
    await navigator.clipboard.writeText(shareText);
    setMessage("Winner result copied.");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-(--background) px-4 py-12 font-secondary text-(--foreground) selection:bg-blue-500/30">
      <div className="mx-auto max-w-6xl space-y-6">
          <header className="text-center space-y-4">
            <div className="mx-auto max-w-3xl min-w-0">
              <div className="mb-1 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Creator giveaway command center</span>
              </div>
              <h1 className="break-words bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-5xl font-black tracking-tighter text-transparent md:text-7xl">
                Giveaway Winner Picker
              </h1>
              <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-lg">
                Build the giveaway, organize entries, remove duplicates, and run a
                transparent random reveal that updates instantly in the browser.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["Entries", state.participants.length, Users],
                ["Active", activeEntries.length, ShieldCheck],
                ["Duplicates", duplicateCount, Clipboard],
                ["Selected", state.winners.length, Trophy],
              ].map(([label, value, Icon]) => (
                <div
                  key={label}
                  className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-3 shadow-md transition-all hover:border-blue-500/20"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="truncate text-[10px] uppercase tracking-[.14em] text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-1 text-xl font-black text-(--foreground)">{value}</div>
                </div>
              ))}
            </div>
          </header>

          {message && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-200">
              <span className="min-w-0 break-words">{message}</span>
              <button onClick={() => setMessage("")} className="shrink-0 rounded-full p-1 hover:bg-blue-500/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <main className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
            <section className="space-y-4">
              <GlassCard title="Giveaway Setup" icon={Gift}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title" value={state.giveaway.title} onChange={(value) => updateGiveaway("title", value)} />
                  <Field label="Prize" value={state.giveaway.prize} onChange={(value) => updateGiveaway("prize", value)} />
                  <Field label="Start date" type="date" value={state.giveaway.startDate} onChange={(value) => updateGiveaway("startDate", value)} />
                  <Field label="End date" type="date" value={state.giveaway.endDate} onChange={(value) => updateGiveaway("endDate", value)} />
                </div>
                <Field label="Description" value={state.giveaway.description} onChange={(value) => updateGiveaway("description", value)} textarea />
                <Field label="Rules" value={state.giveaway.rules} onChange={(value) => updateGiveaway("rules", value)} textarea />
                <Field label="Notes" value={state.giveaway.notes} onChange={(value) => updateGiveaway("notes", value)} textarea />
              </GlassCard>

              <GlassCard title="Participant Entries" icon={ListPlus}>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={entryInput}
                    onChange={(event) => setEntryInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && addEntry()}
                    placeholder="@username or participant name"
                    className="min-w-0 flex-1 rounded-2xl border border-(--border) bg-(--background) px-4 py-3 text-sm outline-none transition focus:border-blue-500/50"
                  />
                  <button onClick={addEntry} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
                <textarea
                  value={bulkInput}
                  onChange={(event) => setBulkInput(event.target.value)}
                  placeholder="Paste bulk entries, one per line or separated by commas"
                  className="min-h-28 w-full resize-y rounded-2xl border border-(--border) bg-(--background) px-4 py-3 text-sm outline-none transition focus:border-blue-500/50"
                />
                <button onClick={addBulkEntries} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-500 transition hover:bg-blue-500/20">
                  <Clipboard className="h-4 w-4" /> Import pasted list
                </button>
              </GlassCard>
            </section>

            <section className="space-y-4">
              <GlassCard title="Random Draw Console" icon={Wand2}>
                <div className="grid gap-2 sm:grid-cols-3">
                  <NumberField label="Winners" value={state.winnerCount} max={Math.max(1, activeEntries.length)} onChange={(value) => setState((current) => ({ ...current, winnerCount: value }))} />
                  <NumberField label="Backups" value={state.reserveCount} max={Math.max(0, activeEntries.length - Number(state.winnerCount))} onChange={(value) => setState((current) => ({ ...current, reserveCount: value }))} />
                  <div className="rounded-2xl border border-(--border) bg-(--background) p-3">
                    <div className="text-xs uppercase tracking-[.18em] text-muted-foreground">Status</div>
                    <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{giveawayStatus}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center justify-between gap-3 rounded-2xl border border-(--border) bg-(--background) p-3 text-sm">
                  <span className="min-w-0 break-words text-(--foreground)">Allow bonus entries instead of deduping for draw</span>
                  <input
                    type="checkbox"
                    checked={state.allowBonusEntries}
                    onChange={(event) => setState((current) => ({ ...current, allowBonusEntries: event.target.checked }))}
                    className="h-5 w-5 shrink-0 accent-blue-600"
                  />
                </label>

                <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--background) p-3 text-center shadow-inner">
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 shadow-md shadow-blue-950/10">
                    {countdown ? (
                      <span className="text-4xl font-black text-blue-500">{countdown}</span>
                    ) : (
                      <Trophy className={`h-8 w-8 text-amber-300 ${isDrawing ? "animate-pulse" : ""}`} />
                    )}
                  </div>
                  <div className="mx-auto max-w-full rounded-2xl border border-(--border) bg-(--card) px-4 py-4">
                    <div className="text-xs uppercase tracking-[.2em] text-muted-foreground">Live highlight</div>
                    <div className="mt-1 truncate text-lg font-black text-(--foreground)" title={highlightName}>
                      {highlightName}
                    </div>
                  </div>
                  <button
                    onClick={runDraw}
                    disabled={isDrawing || !activeEntries.length}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-950/20 transition hover:scale-[1.01] hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Sparkles className="h-5 w-5" />
                    {isDrawing ? "Drawing fairly..." : "Start random reveal"}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {state.winners.length ? (
                    state.winners.map((winner) => (
                      <div key={`${winner.id}-${winner.role}`} className="min-w-0 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                        <div className="text-xs font-bold uppercase tracking-[.18em] text-amber-600 dark:text-amber-300">{winner.role}</div>
                        <div className="mt-2 break-words text-xl font-black text-(--foreground)">{winner.name}</div>
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-(--border) p-5 text-center text-sm text-muted-foreground">
                      Winner cards appear here after the reveal.
                    </div>
                  )}
                </div>
              </GlassCard>

              <GlassCard title="Duplicates & Entry List" icon={Users}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search entries"
                      className="w-full rounded-2xl border border-(--border) bg-(--background) py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <button onClick={cleanupDuplicates} disabled={!duplicateCount} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-300 disabled:opacity-40">
                    <ShieldCheck className="h-4 w-4" /> Clean duplicates
                  </button>
                </div>

                <div className="custom-scrollbar max-h-[430px] space-y-2 overflow-y-auto pr-1">
                  {filteredParticipants.map((entry) => {
                    const duplicate = duplicateMap.get(normalizeName(entry.name)) > 1;
                    return (
                      <div key={entry.id} className={`flex min-w-0 items-center gap-2 rounded-2xl border p-3 ${duplicate ? "border-amber-500/30 bg-amber-500/10" : "border-(--border) bg-(--background)"}`}>
                        {editingId === entry.id ? (
                          <input
                            value={editingValue}
                            onChange={(event) => setEditingValue(event.target.value)}
                            onKeyDown={(event) => event.key === "Enter" && saveEdit(entry.id)}
                            className="min-w-0 flex-1 rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-sm outline-none"
                          />
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-(--foreground)" title={entry.name}>{entry.name}</div>
                            {duplicate && <div className="text-xs text-amber-600 dark:text-amber-300">Duplicate entry</div>}
                          </div>
                        )}
                        {editingId === entry.id ? (
                          <button onClick={() => saveEdit(entry.id)} className="shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white">Save</button>
                        ) : (
                          <button onClick={() => { setEditingId(entry.id); setEditingValue(entry.name); }} className="shrink-0 rounded-xl p-2 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500" aria-label="Edit entry">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => removeEntry(entry.id)} className="shrink-0 rounded-xl p-2 text-rose-500 hover:bg-rose-500/10" aria-label="Delete entry">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                  {!filteredParticipants.length && (
                    <div className="rounded-2xl border border-dashed border-(--border) p-5 text-center text-sm text-muted-foreground">No entries match this search.</div>
                  )}
                </div>
              </GlassCard>
            </section>
          </main>

          <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
            <GlassCard title="Export & Share" icon={Download}>
              <div className="rounded-2xl border border-(--border) bg-(--background) p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[.18em] text-muted-foreground">
                      Winner spotlight card
                    </div>
                    <div className="mt-1 break-words text-xl font-black">
                      {state.giveaway.prize || "Giveaway Prize"}
                    </div>
                  </div>
                  <div className="flex max-w-full flex-wrap gap-1 rounded-2xl border border-(--border) bg-(--card) p-1">
                    {Object.entries(spotlightThemes).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setState((current) => ({
                            ...current,
                            spotlightTheme: key,
                          }))
                        }
                        className={`min-w-0 flex-1 rounded-xl px-2 py-1.5 text-[9px] font-black uppercase tracking-normal transition sm:flex-none ${
                          state.spotlightTheme === key
                            ? "bg-blue-600 text-white"
                            : "text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500"
                        }`}
                      >
                        <span className="block truncate">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${spotlightTheme.card} p-3 text-white shadow-md`}
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
                  <div className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                  <div className="relative">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${spotlightTheme.chip}`}
                      >
                        Official Result
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 text-[10px] font-black uppercase tracking-[.22em] text-white/70">
                      Giveaway Winner
                    </div>
                    <div className="mt-1 break-words text-xl font-black leading-tight sm:text-2xl">
                      {state.winners[0]?.name || "Run a draw to reveal"}
                    </div>
                    <div className="mt-3 break-words text-xs font-semibold text-white/85">
                      {state.giveaway.title || "Untitled Giveaway"} ·{" "}
                      {state.giveaway.prize || "Prize"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {state.winners.slice(1, 5).map((winner) => (
                        <span
                          key={`${winner.id}-${winner.role}-spotlight`}
                          className="max-w-full truncate rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white"
                        >
                          {winner.role}: {winner.name}
                        </span>
                      ))}
                      {!state.winners.length && (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                          Waiting for fair random draw
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 whitespace-pre-wrap break-words rounded-2xl border border-(--border) bg-(--card) p-3 text-sm text-(--foreground)">{shareText}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <button onClick={copyResults} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  <Copy className="h-4 w-4" /> Copy
                </button>
                <button onClick={() => downloadText("giveaway-results.txt", shareText)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-500 hover:bg-blue-500/20">
                  <Download className="h-4 w-4" /> Export
                </button>
                <button onClick={() => setState(defaultState)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/20">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
            </GlassCard>

            <GlassCard title="Draw History" icon={History}>
              <div className="custom-scrollbar max-h-80 space-y-3 overflow-y-auto pr-1">
                {state.history.map((record) => (
                  <div key={record.id} className="rounded-2xl border border-(--border) bg-(--background) p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="truncate font-black text-(--foreground)" title={record.title}>{record.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(record.pickedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500">{record.winners.length} picked</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {record.winners.map((winner) => (
                        <span key={`${record.id}-${winner.id}-${winner.role}`} className="max-w-full truncate rounded-full border border-(--border) bg-(--card) px-3 py-1 text-xs text-(--foreground)">
                          {winner.role}: {winner.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {!state.history.length && (
                  <div className="rounded-2xl border border-dashed border-(--border) p-5 text-center text-sm text-muted-foreground">Draw history saves automatically after each reveal.</div>
                )}
              </div>
            </GlassCard>
          </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.22);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.42);
        }
      `}</style>
    </div>
  );
}

function GlassCard({ title, icon: Icon, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-3 shadow-md transition-all hover:border-blue-500/20 sm:p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 border-b border-(--border) pb-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="min-w-0 truncate text-xs font-black uppercase tracking-widest text-(--foreground)">{title}</h2>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, textarea = false, type = "text" }) {
  const className =
    "w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition placeholder:text-muted-foreground focus:border-blue-500/50";
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
        className={`${className} min-h-16 resize-y`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

function NumberField({ label, value, onChange, max }) {
  return (
    <label className="block rounded-xl border border-(--border) bg-(--background) p-2">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        min="0"
        max={max}
        value={value}
        onChange={(event) => {
          const next = Math.max(0, Math.min(max, Number(event.target.value) || 0));
          onChange(next);
        }}
        className="w-full rounded-lg border border-(--border) bg-(--card) px-2.5 py-1.5 text-sm font-bold text-(--foreground) outline-none focus:border-blue-500/50"
      />
    </label>
  );
}
