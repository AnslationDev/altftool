"use client";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Plus, X, Users, RotateCcw, Copy, Check, Sparkles } from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function ToolHome() {
  const [participants, setParticipants] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const addParticipant = useCallback(() => {
    const name = inputValue.trim();
    if (!name) return;
    if (participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setInputValue("");
      return;
    }
    setParticipants((prev) => [...prev, { id: generateId(), name }]);
    setInputValue("");
    inputRef.current?.focus();
  }, [inputValue, participants]);

  const addBulkParticipants = useCallback(() => {
    const names = inputValue
      .split(/[\n,]/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    const seen = new Set(participants.map((p) => p.name.toLowerCase()));
    const newParticipants = [];
    names.forEach((name) => {
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        newParticipants.push({ id: generateId(), name });
      }
    });
    if (newParticipants.length === 0) return;
    setParticipants((prev) => [...prev, ...newParticipants]);
    setInputValue("");
  }, [inputValue, participants]);

  const removeParticipant = useCallback((id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }, []);

  const selectPayer = useCallback(() => {
    if (participants.length === 0 || animating) return;
    setAnimating(true);
    setSelected(null);

    let count = 0;
    const maxSteps = 15 + Math.floor(Math.random() * 10);
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * participants.length);
      setSelected(participants[randomIdx]);
      count++;
      if (count >= maxSteps) {
        clearInterval(interval);
        const winner = participants[Math.floor(Math.random() * participants.length)];
        setSelected(winner);
        setAnimating(false);
        setHistory((prev) => [
          { id: generateId(), name: winner.name, date: new Date().toLocaleString() },
          ...prev.slice(0, 19),
        ]);
      }
    }, 80 + count * 5);
  }, [participants, animating]);

  const resetAll = useCallback(() => {
    setParticipants([]);
    setSelected(null);
    setAnimating(false);
    setHistory([]);
  }, []);

  const copyResult = useCallback(async () => {
    if (!selected) return;
    const text = `Who pays the bill? ${selected.name} pays!`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [selected]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (inputValue.includes("\n") || inputValue.includes(",")) {
          addBulkParticipants();
        } else {
          addParticipant();
        }
      }
    },
    [inputValue, addParticipant, addBulkParticipants]
  );

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--foreground)">Who Pays the Bill?</h1>
          <p className="text-(--muted-foreground) mt-1">Add your group and let fate decide who pays!</p>
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
                  placeholder="Enter name or paste list (comma/newline separated)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-(--muted) border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) text-sm"
                />
                <button
                  onClick={addParticipant}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2.5 rounded-xl bg-(--primary) text-(--primary-foreground) font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition flex items-center gap-1.5"
                >
                  <Plus size="16" /> Add
                </button>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-12 text-(--muted-foreground)">
                  <Users size="48" className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No participants yet</p>
                  <p className="text-xs mt-1">Add names above to get started</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {participants.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: i * 0.03 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                          selected?.id === p.id
                            ? "bg-(--primary) text-(--primary-foreground) border-(--primary) scale-110 shadow-lg"
                            : "bg-(--muted) text-(--foreground) border-(--border)"
                        }`}
                      >
                        <span>{p.name}</span>
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="p-0.5 rounded-full hover:bg-(--background)/50 transition"
                        >
                          <X size="12" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {participants.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-(--border)">
                  <span className="text-xs text-(--muted-foreground)">
                    {participants.length} participant{participants.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setParticipants([])}
                    className="text-xs text-(--muted-foreground) hover:text-(--foreground) transition flex items-center gap-1"
                  >
                    <RotateCcw size="12" /> Clear all
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={selectPayer}
              disabled={participants.length < 2 || animating}
              className="w-full py-4 rounded-2xl bg-(--primary) text-(--primary-foreground) font-bold text-lg hover:opacity-90 disabled:opacity-40 transition shadow-lg shadow-(--primary)/20 flex items-center justify-center gap-2"
            >
              {animating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size="24" />
                </motion.div>
              ) : (
                <Wallet size="24" />
              )}
              {animating ? "Picking..." : participants.length < 2 ? "Need at least 2 people" : "Who Pays the Bill?"}
            </button>

            <AnimatePresence>
              {selected && !animating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="rounded-2xl bg-(--card) border-2 border-(--primary) p-6 text-center space-y-3"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--primary)/10 text-(--primary) mb-2">
                    <Wallet size="32" />
                  </div>
                  <p className="text-sm text-(--muted-foreground)">The bill goes to...</p>
                  <p className="text-2xl font-bold text-(--foreground)">{selected.name}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={copyResult}
                      className="px-4 py-2 rounded-xl bg-(--muted) text-(--foreground) font-medium text-sm hover:bg-(--border) transition flex items-center gap-1.5"
                    >
                      {copied ? <Check size="14" /> : <Copy size="14" />}
                      {copied ? "Copied!" : "Copy Result"}
                    </button>
                    <button
                      onClick={selectPayer}
                      className="px-4 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) font-medium text-sm hover:opacity-90 transition flex items-center gap-1.5"
                    >
                      <RotateCcw size="14" /> Spin Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <h3 className="text-sm font-semibold text-(--foreground) mb-3 flex items-center gap-2">
                <Wallet size="14" className="text-(--primary)" /> Payment History
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-(--muted-foreground) text-center py-6">No payments yet</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-(--muted) text-sm"
                    >
                      <span className="font-medium text-(--foreground)">{entry.name}</span>
                      <span className="text-[10px] text-(--muted-foreground)">{entry.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <h3 className="text-sm font-semibold text-(--foreground) mb-3">How it works</h3>
              <ol className="space-y-2 text-sm text-(--muted-foreground) list-decimal list-inside">
                <li>Add everyone in your group</li>
                <li>Tap "Who Pays the Bill?"</li>
                <li>Watch the animation build suspense</li>
                <li>One person is randomly selected</li>
              </ol>
              <button
                onClick={resetAll}
                className="mt-4 w-full py-2 rounded-xl bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-sm font-medium transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw size="14" /> Reset Everything
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
