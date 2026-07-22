"use client";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle, Plus, X, Users, Copy, Check, RotateCcw,
  Trophy, Trash2, Star, Sparkles,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function ToolHome() {
  const [names, setNames] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [winners, setWinners] = useState([]);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const addName = useCallback(() => {
    const name = inputValue.trim();
    if (!name) return;
    if (names.some((n) => n.name.toLowerCase() === name.toLowerCase())) {
      setInputValue("");
      return;
    }
    setNames((prev) => [...prev, { id: generateId(), name }]);
    setInputValue("");
    inputRef.current?.focus();
  }, [inputValue, names]);

  const addBulk = useCallback(() => {
    const items = inputValue
      .split(/[\n,]/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    const seen = new Set(names.map((n) => n.name.toLowerCase()));
    const newItems = [];
    items.forEach((name) => {
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        newItems.push({ id: generateId(), name });
      }
    });
    if (newItems.length === 0) return;
    setNames((prev) => [...prev, ...newItems]);
    setInputValue("");
  }, [inputValue, names]);

  const removeName = useCallback((id) => {
    setNames((prev) => prev.filter((n) => n.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }, []);

  const removeDuplicates = useCallback(() => {
    const seen = new Set();
    setNames((prev) => prev.filter((n) => {
      const lower = n.name.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    }));
  }, []);

  const pickOne = useCallback(() => {
    const pool = eliminationMode ? names : names;
    if (pool.length === 0 || animating) return;
    setAnimating(true);
    setSelected(null);

    let count = 0;
    const maxSteps = 12 + Math.floor(Math.random() * 8);
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * pool.length);
      setSelected(pool[randomIdx]);
      count++;
      if (count >= maxSteps) {
        clearInterval(interval);
        const winner = pool[Math.floor(Math.random() * pool.length)];
        setSelected(winner);
        setAnimating(false);
        setWinners((prev) => [
          { id: generateId(), name: winner.name, date: new Date().toLocaleString() },
          ...prev.slice(0, 49),
        ]);
        if (eliminationMode) {
          setNames((prev) => prev.filter((n) => n.id !== winner.id));
        }
      }
    }, 70 + count * 6);
  }, [names, animating, eliminationMode]);

  const clearAll = useCallback(() => {
    setNames([]);
    setSelected(null);
    setWinners([]);
  }, []);

  const copyResult = useCallback(async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [selected]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (inputValue.includes("\n") || inputValue.includes(",")) {
          addBulk();
        } else {
          addName();
        }
      }
    },
    [inputValue, addName, addBulk]
  );

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--foreground)">Random Name Picker</h1>
          <p className="text-(--muted-foreground) mt-1">Add names and pick a winner at random</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter name or paste list..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-(--muted) border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) text-sm"
                />
                <button
                  onClick={addName}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2.5 rounded-xl bg-(--primary) text-(--primary-foreground) font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition flex items-center gap-1.5"
                >
                  <Plus size="16" /> Add
                </button>
              </div>

              {names.length === 0 ? (
                <div className="text-center py-10 text-(--muted-foreground)">
                  <Users size="40" className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No names added yet</p>
                  <p className="text-xs mt-1">Add names or paste a comma-separated list</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {names.map((n, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selected?.id === n.id
                              ? "bg-(--primary) text-(--primary-foreground) border-(--primary) scale-110 shadow-lg z-10"
                              : "bg-(--muted) text-(--foreground) border-(--border)"
                          }`}
                        >
                          <span>{n.name}</span>
                          <button onClick={() => removeName(n.id)} className="p-0.5 hover:opacity-60">
                            <X size="10" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-(--border)">
                    <span className="text-xs text-(--muted-foreground)">{names.length} name{names.length !== 1 ? "s" : ""}</span>
                    <div className="flex gap-2">
                      <button onClick={removeDuplicates} className="text-xs text-(--muted-foreground) hover:text-(--foreground) transition">Remove Duplicates</button>
                      <button onClick={() => setNames([])} className="text-xs text-(--muted-foreground) hover:text-(--foreground) transition flex items-center gap-1">
                        <Trash2 size="10" /> Clear
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={pickOne}
                disabled={names.length === 0 || animating}
                className="flex-1 py-4 rounded-2xl bg-(--primary) text-(--primary-foreground) font-bold text-lg hover:opacity-90 disabled:opacity-40 transition shadow-lg shadow-(--primary)/20 flex items-center justify-center gap-2"
              >
                {animating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size="24" />
                  </motion.div>
                ) : (
                  <Shuffle size="24" />
                )}
                {animating ? "Picking..." : "Pick Winner"}
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm text-(--muted-foreground) cursor-pointer">
              <input
                type="checkbox"
                checked={eliminationMode}
                onChange={(e) => setEliminationMode(e.target.checked)}
                className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
              />
              Elimination mode (remove winner from list)
            </label>

            <AnimatePresence>
              {selected && !animating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="rounded-2xl bg-(--card) border-2 border-(--primary) p-6 text-center space-y-3"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--primary)/10 text-(--primary)">
                    <Trophy size="32" />
                  </div>
                  <p className="text-sm text-(--muted-foreground)">Winner!</p>
                  <p className="text-2xl font-bold text-(--foreground)">{selected.name}</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={copyResult} className="px-4 py-2 rounded-xl bg-(--muted) text-(--foreground) font-medium text-sm hover:bg-(--border) transition flex items-center gap-1.5">
                      {copied ? <Check size="14" /> : <Copy size="14" />}
                      {copied ? "Copied!" : "Copy Name"}
                    </button>
                    <button onClick={pickOne} className="px-4 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) font-medium text-sm hover:opacity-90 transition flex items-center gap-1.5">
                      <Shuffle size="14" /> Pick Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <h3 className="text-sm font-semibold text-(--foreground) mb-3 flex items-center gap-2">
                <Trophy size="14" className="text-amber-500" /> Winner History
              </h3>
              {winners.length === 0 ? (
                <p className="text-xs text-(--muted-foreground) text-center py-6">No winners yet</p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  {winners.map((w, i) => (
                    <div key={w.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-(--muted) text-sm">
                      <span className="flex items-center gap-1.5">
                        {i === 0 && <Star size="10" className="text-amber-500" />}
                        <span className="font-medium text-(--foreground)">{w.name}</span>
                      </span>
                      <span className="text-[10px] text-(--muted-foreground)">{w.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <h3 className="text-sm font-semibold text-(--foreground) mb-3">How it works</h3>
              <ol className="space-y-1.5 text-sm text-(--muted-foreground) list-decimal list-inside">
                <li>Add names individually or paste a list</li>
                <li>Toggle elimination mode if needed</li>
                <li>Tap "Pick Winner" for animated selection</li>
                <li>Copy or save winner names</li>
              </ol>
              <button onClick={clearAll} className="mt-4 w-full py-2 rounded-xl bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-sm font-medium transition flex items-center justify-center gap-1.5">
                <RotateCcw size="14" /> Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
