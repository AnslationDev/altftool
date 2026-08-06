"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wine, RotateCcw, Plus, X, Users, Volume2, VolumeX,
  Sparkles, RefreshCw, Palette,
} from "lucide-react";
import { playSound, resumeAudio } from "../utils/sound";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Each design's body fill is chosen so it holds >=3:1 contrast (WCAG AA
// non-text contrast) against the card surface in BOTH light and dark theme —
// gold/cyan needed a darker light-mode shade to clear that bar.
const BOTTLE_DESIGNS = [
  {
    id: "classic",
    label: "Classic",
    color: "text-emerald-600 dark:text-emerald-400",
    fill: "fill-emerald-600 dark:fill-emerald-500",
    stroke: "stroke-emerald-700 dark:stroke-emerald-300",
    ellipseFill: "fill-emerald-700 dark:fill-emerald-400",
    highlightFill: "fill-emerald-500 dark:fill-emerald-300",
  },
  {
    id: "gold",
    label: "Gold",
    color: "text-amber-600 dark:text-amber-400",
    fill: "fill-amber-600 dark:fill-amber-500",
    stroke: "stroke-amber-700 dark:stroke-amber-300",
    ellipseFill: "fill-amber-700 dark:fill-amber-400",
    highlightFill: "fill-amber-500 dark:fill-amber-300",
  },
  {
    id: "rose",
    label: "Rose",
    color: "text-rose-500 dark:text-rose-400",
    fill: "fill-rose-500 dark:fill-rose-500",
    stroke: "stroke-rose-600 dark:stroke-rose-300",
    ellipseFill: "fill-rose-600 dark:fill-rose-400",
    highlightFill: "fill-rose-400 dark:fill-rose-300",
  },
  {
    id: "purple",
    label: "Purple",
    color: "text-purple-500 dark:text-purple-400",
    fill: "fill-purple-500 dark:fill-purple-500",
    stroke: "stroke-purple-600 dark:stroke-purple-300",
    ellipseFill: "fill-purple-600 dark:fill-purple-400",
    highlightFill: "fill-purple-400 dark:fill-purple-300",
  },
  {
    id: "cyan",
    label: "Cyan",
    color: "text-cyan-600 dark:text-cyan-400",
    fill: "fill-cyan-600 dark:fill-cyan-500",
    stroke: "stroke-cyan-700 dark:stroke-cyan-300",
    ellipseFill: "fill-cyan-700 dark:fill-cyan-400",
    highlightFill: "fill-cyan-500 dark:fill-cyan-300",
  },
];

export default function ToolHome() {
  const [participants, setParticipants] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState(null);
  const [design, setDesign] = useState("classic");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [spinDurationMs, setSpinDurationMs] = useState(3500);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const bottleRef = useRef(null);
  const spinTimeoutRef = useRef(null);

  const addParticipant = useCallback(() => {
    const name = inputValue.trim();
    if (!name) return;
    if (participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setInputValue("");
      return;
    }
    setParticipants((prev) => [...prev, { id: generateId(), name }]);
    setInputValue("");
  }, [inputValue, participants]);

  const addBulk = useCallback(() => {
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
  }, []);

  const spin = useCallback(() => {
    if (participants.length < 2 || spinning) return;
    resumeAudio();
    if (soundEnabled) playSound("spin");
    setSpinning(true);
    setResult(null);
    setSelected(null);

    const extraSpins = 3 + Math.floor(Math.random() * 5);
    const targetAngle = extraSpins * 360 + Math.floor(Math.random() * 360);
    const finalRotation = rotation + targetAngle;
    // Same randomized duration drives both the visual rotation (in seconds,
    // via spinDurationMs below) and the winner-reveal timeout, so the result
    // is announced exactly when the bottle stops turning.
    const duration = 2000 + Math.random() * 1500;
    setSpinDurationMs(duration);

    setRotation(finalRotation);

    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    spinTimeoutRef.current = setTimeout(() => {
      setSpinning(false);
      const normalized = ((finalRotation % 360) + 360) % 360;
      const sliceAngle = 360 / participants.length;
      // Round to the nearest marker (markers sit AT i*sliceAngle, not at the
      // start of a [i, i+1) bucket), wrapping length -> 0.
      const winnerIndex = Math.round(normalized / sliceAngle) % participants.length;
      const winner = participants[winnerIndex];
      setSelected(winner);
      setResult(`${winner.name} is chosen!`);
      if (soundEnabled) playSound("winner");
      setHistory((prev) => [
        { id: generateId(), name: winner.name, date: new Date().toLocaleString() },
        ...prev.slice(0, 19),
      ]);
    }, duration);
  }, [participants, spinning, rotation, soundEnabled]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    setSpinning(false);
    setSelected(null);
    setResult(null);
    setRotation(0);
    setHistory([]);
  }, []);

  const addFromInput = useCallback(() => {
    if (inputValue.includes("\n") || inputValue.includes(",")) {
      addBulk();
    } else {
      addParticipant();
    }
  }, [inputValue, addParticipant, addBulk]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        addFromInput();
      }
    },
    [addFromInput]
  );

  const handleClearAll = useCallback(() => {
    if (typeof window !== "undefined" && !window.confirm("Clear all participants? This cannot be undone.")) {
      return;
    }
    setParticipants([]);
  }, []);

  const currentDesign = BOTTLE_DESIGNS.find((d) => d.id === design);
  const sliceAngle = participants.length > 0 ? 360 / participants.length : 0;

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--foreground)">Spin the Bottle</h1>
          <p className="text-(--muted-foreground) mt-1">Classic spin the bottle with realistic animation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-4">
              <h3 className="text-sm font-semibold text-(--foreground)">Players</h3>
              <div className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add name or paste list..."
                  className="flex-1 px-3 py-2 rounded-xl bg-(--muted) border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) text-sm"
                />
                <button
                  onClick={addFromInput}
                  disabled={!inputValue.trim() || spinning}
                  aria-label="Add participant"
                  className="px-3 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition"
                >
                  <Plus size="16" />
                </button>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-6 text-(--muted-foreground)">
                  <Users size="32" className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Add at least 2 players</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                      {participants.map((p, i) => (
                        <motion.span
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selected?.id === p.id
                              ? "bg-(--primary) text-(--primary-foreground) border-(--primary) scale-110 shadow-lg z-10"
                              : "bg-(--muted) text-(--foreground) border-(--border)"
                          }`}
                        >
                          {p.name}
                          <button
                            onClick={() => removeParticipant(p.id)}
                            disabled={spinning}
                            aria-label={`Remove ${p.name}`}
                            className="hover:opacity-60 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X size="10" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-(--border)">
                    <span className="text-xs text-(--muted-foreground)">{participants.length} players</span>
                    <button onClick={handleClearAll} className="text-xs text-(--muted-foreground) hover:text-(--foreground) transition">
                      Clear All
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-3">
              <h3 className="text-sm font-semibold text-(--foreground)">Settings</h3>
              <div>
                <label className="text-xs text-(--muted-foreground) block mb-1.5">Bottle Design</label>
                <div className="flex gap-1.5">
                  {BOTTLE_DESIGNS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDesign(d.id)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-medium border transition ${
                        design === d.id
                          ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                          : "bg-(--card) text-(--muted-foreground) border-(--border)"
                      }`}
                    >
                      <Palette size="14" className={`mx-auto mb-0.5 ${d.color}`} />
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-(--muted-foreground) cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
                />
                {soundEnabled ? <Volume2 size="14" /> : <VolumeX size="14" />}
                Sound effects
              </label>
            </div>

            <button
              onClick={resetGame}
              className="w-full py-2.5 rounded-xl bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-sm font-medium transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw size="14" /> Reset Game
            </button>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-6 flex flex-col items-center">
              <div className="relative w-64 h-64 mb-4">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {participants.map((p, i) => {
                    const angle = i * sliceAngle - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r = 80;
                    const cx = 100 + r * Math.cos(rad);
                    const cy = 100 + r * Math.sin(rad);
                    return (
                      <g key={p.id}>
                        <circle cx={cx} cy={cy} r="16" className={`${selected?.id === p.id ? "fill-(--primary)" : "fill-(--muted)"}`} />
                        <text
                          x={cx}
                          y={cy + 4}
                          textAnchor="middle"
                          className={`text-[8px] font-semibold ${selected?.id === p.id ? "fill-(--primary-foreground)" : "fill-(--foreground)"}`}
                        >
                          {p.name.length > 6 ? p.name.slice(0, 6) + "..." : p.name}
                        </text>
                      </g>
                    );
                  })}
                  {participants.map((p, i) => {
                    const angle = i * sliceAngle - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r = 60;
                    const x1 = 100 + 20 * Math.cos(rad);
                    const y1 = 100 + 20 * Math.sin(rad);
                    const x2 = 100 + r * Math.cos(rad);
                    const y2 = 100 + r * Math.sin(rad);
                    return (
                      <line
                        key={`line-${p.id}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="var(--border)"
                        strokeWidth="1"
                        className="opacity-30"
                      />
                    );
                  })}
                  <circle cx="100" cy="100" r="20" className="fill-(--muted)" stroke="var(--border)" strokeWidth="1" />
                </svg>

                <div
                  ref={bottleRef}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={{
                      duration: spinning ? spinDurationMs / 1000 : 0.3,
                      ease: spinning ? [0.2, 0.8, 0.3, 1] : "easeOut",
                    }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <svg viewBox="0 0 40 80" className="w-8 h-16">
                      <path
                        d="M20 2 C22 8 24 14 24 20 L24 30 C26 32 28 34 28 36 L28 72 C28 75 26 78 20 78 C14 78 12 75 12 72 L12 36 C12 34 14 32 16 30 L16 20 C16 14 18 8 20 2Z"
                        className={`${currentDesign.fill} ${currentDesign.stroke}`}
                        strokeWidth="1"
                      />
                      <ellipse cx="20" cy="72" rx="6" ry="2" className={currentDesign.ellipseFill} />
                      <rect
                        x="17"
                        y="20"
                        width="6"
                        height="10"
                        rx="1"
                        className={currentDesign.highlightFill}
                        opacity="0.5"
                      />
                    </svg>
                  </motion.div>
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-(--primary)" />
              </div>

              <button
                onClick={spin}
                disabled={participants.length < 2 || spinning}
                className="w-full py-3.5 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 disabled:opacity-40 transition shadow-lg shadow-(--primary)/20 text-lg flex items-center justify-center gap-2"
              >
                {spinning ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <RefreshCw size="20" />
                    </motion.span>
                    Spinning...
                  </>
                ) : (
                  <>
                    <Wine size="20" /> Spin the Bottle
                  </>
                )}
              </button>

              <div aria-live="polite" aria-atomic="true" className="w-full">
                <span className="sr-only">{spinning ? "Spinning..." : result || ""}</span>
                <AnimatePresence>
                  {result && !spinning && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-(--primary)/10 border border-(--primary)/20 text-center w-full"
                    >
                      <p className="text-lg font-bold text-(--foreground)">{result}</p>
                      <p className="text-xs text-(--muted-foreground) mt-1">
                        {selected && `${selected.name} is selected!`}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {history.length > 0 && (
              <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) mb-3">History</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-(--muted) text-sm">
                      <span className="font-medium text-(--foreground)">{h.name}</span>
                      <span className="text-[10px] text-(--muted-foreground)">{h.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
