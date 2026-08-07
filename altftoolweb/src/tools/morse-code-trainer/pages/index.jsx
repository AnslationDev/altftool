"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  BookOpen, Brain, GraduationCap, Ear, Volume2,
  RefreshCw, CheckCircle2, XCircle,
  Trophy, Zap, BarChart3, ChevronRight,
  Play, Pause, Square, RotateCcw,
  Dot, Minus, Sparkles, Sliders, Info,
  Code, Type, HelpCircle, ArrowLeft
} from "lucide-react";

const MORSE_MAP = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
  'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
  'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
  'Z': '--..',
  '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
};

const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = "0123456789".split("");

const PROGRESSIVE_GROUPS = [
  { label: "Beginner", letters: "E T A N I S".split(" ") },
  { label: "Elementary", letters: "H R D L U C M O".split(" ") },
  { label: "Intermediate", letters: "F P W G Y B V K".split(" ") },
  { label: "Advanced", letters: "J X Q Z 1 2 3 4 5 6 7 8 9 0".split(" ") },
];

const ALL_CHARS = PROGRESSIVE_GROUPS.flatMap(g => g.letters);

const REFERENCE_CHARS = [...LETTERS, ...NUMBERS];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadProgress() {
  if (typeof window === "undefined") return { scores: {}, stats: null, unlockedGroups: 1 };
  try {
    const scores = JSON.parse(localStorage.getItem("mct_scores") || "{}");
    const stats = JSON.parse(localStorage.getItem("mct_stats") || "null");
    const unlockedGroups = parseInt(localStorage.getItem("mct_unlocked") || "1");
    return { scores, stats, unlockedGroups };
  } catch {
    return { scores: {}, stats: null, unlockedGroups: 1 };
  }
}

function saveScores(scores) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mct_scores", JSON.stringify(scores));
}

function saveStats(stats) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mct_stats", JSON.stringify(stats));
}

function saveUnlocked(g) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mct_unlocked", String(g));
}

function getCharStatus(ch, scores) {
  const s = scores[ch];
  if (!s || s.total < 3) return "new";
  if (s.correct / s.total >= 0.8 && s.total >= 5) return "mastered";
  return "learning";
}

function StatusDot({ status }) {
  const colors = {
    new: "bg-gray-400 dark:bg-gray-600",
    learning: "bg-amber-400 dark:bg-amber-500",
    mastered: "bg-emerald-400 dark:bg-emerald-500",
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="p-4 rounded-xl border bg-card border-border flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xl font-black text-foreground">{value}</p>
      </div>
    </div>
  );
}

function useMorseAudio() {
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const timeoutsRef = useRef([]);
  const isPlayingRef = useRef(false);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const stopTone = useCallback(() => {
    try {
      if (oscRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (gainRef.current) {
          gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.005);
        }
        const osc = oscRef.current;
        const t = setTimeout(() => { try { osc.stop(); osc.disconnect(); } catch {} }, 10);
        timeoutsRef.current.push(t);
        oscRef.current = null;
      }
    } catch {}
  }, []);

  const startTone = useCallback((freq, vol) => {
    if (typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      stopTone();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol / 100, ctx.currentTime + 0.005);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
    } catch {}
  }, [stopTone]);

  const playMorseSequence = useCallback((morseChars, wpm, pitch, vol, onProgress) => {
    if (!morseChars.length) return;
    clearTimeouts();
    stopTone();
    isPlayingRef.current = true;
    const dotMs = (1.2 / wpm) * 1000;
    let idx = 0;

    const schedule = () => {
      if (!isPlayingRef.current || idx >= morseChars.length) {
        isPlayingRef.current = false;
        onProgress?.(-1, -1);
        return;
      }
      const ch = morseChars[idx];
      if (ch === " ") {
        onProgress?.(idx, -1);
        idx++;
        const t = setTimeout(schedule, dotMs * 4);
        timeoutsRef.current.push(t);
        return;
      }
      const morse = MORSE_MAP[ch];
      if (!morse) { idx++; schedule(); return; }

      let symIdx = 0;
      const playSymbol = () => {
        if (!isPlayingRef.current) return;
        if (symIdx >= morse.length) {
          onProgress?.(idx, -1);
          idx++;
          const gap = idx < morseChars.length && morseChars[idx] !== " " ? dotMs * 3 : 0;
          const t = setTimeout(schedule, gap || dotMs);
          timeoutsRef.current.push(t);
          return;
        }
        const sym = morse[symIdx];
        onProgress?.(idx, symIdx);
        const dur = sym === "." ? dotMs : dotMs * 3;
        startTone(pitch, vol);
        const t1 = setTimeout(() => {
          stopTone();
          symIdx++;
          if (symIdx < morse.length) {
            const t2 = setTimeout(playSymbol, dotMs);
            timeoutsRef.current.push(t2);
          } else {
            playSymbol();
          }
        }, dur);
        timeoutsRef.current.push(t1);
      };
      playSymbol();
    };
    schedule();
  }, [clearTimeouts, stopTone, startTone]);

  const stopAll = useCallback(() => {
    isPlayingRef.current = false;
    clearTimeouts();
    stopTone();
  }, [clearTimeouts, stopTone]);

  useEffect(() => {
    return () => { isPlayingRef.current = false; clearTimeouts(); stopTone(); if (audioCtxRef.current) audioCtxRef.current.close(); };
  }, [clearTimeouts, stopTone]);

  return { playMorseSequence, stopAll };
}

function MorseReferenceChart() {
  const rows = [];
  for (let i = 0; i < REFERENCE_CHARS.length; i += 6) {
    const chunk = REFERENCE_CHARS.slice(i, i + 6);
    rows.push(
      <div key={i} className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
        {chunk.map(ch => (
          <div key={ch} className="rounded-xl border bg-card border-border p-2.5 flex flex-col items-center gap-1">
            <span className="text-lg font-black text-foreground">{ch}</span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">{MORSE_MAP[ch]}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
        <Code className="w-4 h-4 text-primary" /> Reference Chart
      </h3>
      {rows}
    </div>
  );
}

function DecodeSection() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = useCallback((e) => {
    const v = e.target.value;
    setInput(v);
    setError("");
    if (!v.trim()) { setOutput(""); return; }
    try {
      const words = v.trim().split("/");
      const decoded = words.map(word => {
        const symbols = word.trim().split(" ");
        return symbols.map(s => {
          if (!s) return "";
          const ch = REVERSE_MORSE[s];
          if (!ch) throw new Error(`Unknown code: ${s}`);
          return ch;
        }).join("");
      }).join(" ");
      setOutput(decoded);
    } catch (e) {
      setError(e.message);
      setOutput("");
    }
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Type className="w-3.5 h-3.5 text-primary" /> Decode Morse to Text
      </label>
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder="Enter Morse code (use . and -, separate letters with space, words with /)"
        rows={3}
        className="w-full rounded-xl border border-border bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition leading-relaxed font-mono text-sm"
      />
      {error && (
        <p role="alert" className="text-xs font-bold text-red-500 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {output && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 p-4">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">Decoded Text</p>
          <p className="text-lg font-bold text-foreground">{output}</p>
        </div>
      )}
    </div>
  );
}

function EncodeSection() {
  const [text, setText] = useState("");
  const [morse, setMorse] = useState("");
  const [unsupported, setUnsupported] = useState([]);

  const handleEncode = useCallback((val) => {
    setText(val);
    const chars = val.toUpperCase().split("");
    const skipped = [];
    const encoded = chars.map(c => {
      if (c === " ") return "/";
      const code = MORSE_MAP[c];
      if (!code) skipped.push(c);
      return code || "";
    }).filter(x => x !== "").join(" ");
    setMorse(encoded);
    setUnsupported([...new Set(skipped)]);
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
        <Type className="w-3.5 h-3.5 text-primary" /> Encode Text to Morse
      </label>
      <textarea
        value={text}
        onChange={e => handleEncode(e.target.value)}
        placeholder="Type your message here..."
        rows={3}
        className="w-full rounded-xl border border-border bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition leading-relaxed"
      />
      {morse && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Morse Code</p>
          <p className="text-lg font-mono font-bold text-foreground break-all">{morse}</p>
        </div>
      )}
      {unsupported.length > 0 && (
        <p role="status" className="text-xs font-bold text-amber-600 flex items-center gap-1">
          Skipped unsupported characters: {unsupported.join(', ')}
        </p>
      )}
    </div>
  );
}

function PlaybackSection({ text, setText, wpm, setWpm, pitch, setPitch, volume, setVolume }) {
  const [morseString, setMorseString] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [activeSym, setActiveSym] = useState(-1);
  const { playMorseSequence, stopAll } = useMorseAudio();

  const unfilteredChars = useMemo(() => text.toUpperCase().split(""), [text]);
  const chars = useMemo(
    () => unfilteredChars.filter(c => MORSE_MAP[c] || c === " "),
    [unfilteredChars]
  );
  const unsupported = useMemo(() => {
    const skipped = unfilteredChars.filter(c => c !== " " && !MORSE_MAP[c]);
    return [...new Set(skipped)];
  }, [unfilteredChars]);

  useEffect(() => {
    const encoded = chars.map(c => (c === " " ? "/" : MORSE_MAP[c])).join(" ");
    setMorseString(encoded);
    stopAll();
  }, [chars, stopAll]);

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      stopAll();
      setIsPlaying(false);
      setActiveIdx(-1);
      setActiveSym(-1);
      return;
    }
    setActiveIdx(-1);
    setActiveSym(-1);
    setIsPlaying(true);
    playMorseSequence(chars, wpm, pitch, volume, (charIdx, symIdx) => {
      setActiveIdx(charIdx);
      setActiveSym(symIdx);
      if (charIdx === -1) {
        setIsPlaying(false);
      }
    });
  }, [isPlaying, chars, wpm, pitch, volume, playMorseSequence, stopAll]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-primary" /> Audio Playback
        </label>
        <button
          onClick={() => setShowSettings(s => !s)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
            showSettings ? "bg-primary/10 text-primary border-primary/30" : "bg-card border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 inline mr-1" /> Settings
        </button>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value.slice(0, 200))}
        placeholder="Type text to hear in Morse code..."
        rows={2}
        className="w-full rounded-xl border border-border bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition leading-relaxed"
      />

      {showSettings && (
        <div className="bg-surface-soft rounded-xl p-4 border border-border grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1"><Sliders size={12} className="text-primary" /> Speed</span>
              <span className="text-primary">{wpm} WPM</span>
            </div>
            <input type="range" min={5} max={40} value={wpm} onChange={e => setWpm(parseInt(e.target.value))} disabled={isPlaying}
              className="w-full accent-primary bg-border h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1"><Sparkles size={12} className="text-primary" /> Pitch</span>
              <span className="text-primary">{pitch} Hz</span>
            </div>
            <input type="range" min={300} max={1000} value={pitch} onChange={e => setPitch(parseInt(e.target.value))} disabled={isPlaying}
              className="w-full accent-primary bg-border h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-foreground">
              <span><Volume2 size={12} className="text-primary inline mr-1" /> Volume</span>
              <span className="text-primary">{volume}%</span>
            </div>
            <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(parseInt(e.target.value))}
              className="w-full accent-primary bg-border h-2 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handlePlay}
          disabled={!text.trim()}
          className={`h-10 px-5 flex items-center justify-center gap-2 font-bold rounded-xl cursor-pointer transition active:scale-95 ${
            isPlaying ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-primary hover:bg-primary/90 text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPlaying ? <><Square size={16} /> Stop</> : <><Play size={16} /> Play</>}
        </button>
        <button onClick={() => { setText(""); stopAll(); setIsPlaying(false); setActiveIdx(-1); setActiveSym(-1); }}
          className="h-10 px-4 rounded-xl border border-border text-muted-foreground hover:text-foreground font-bold transition active:scale-95">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {morseString && (
        <div className="bg-surface-soft border border-border rounded-xl p-4 min-h-[80px] flex flex-wrap gap-x-2 gap-y-2 items-center">
          {chars.map((ch, ci) => {
            const isActive = activeIdx === ci;
            const morse = MORSE_MAP[ch];
            if (ch === " ") return <span key={ci} className={`text-xs font-mono font-bold px-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>/</span>;
            if (!morse) return null;
            return (
              <span key={ci} className={`px-2 py-1 rounded-lg border transition-all ${
                isActive ? "bg-primary/10 border-primary scale-105 shadow-sm" : "bg-card border-border"
              }`}>
                <span className={`text-xs font-bold ${isActive ? "text-primary" : "text-foreground"}`}>{ch}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {morse.split("").map((s, si) => (
                    <span key={si} className={`text-[10px] font-black px-1 rounded ${
                      isActive && activeSym === si ? "bg-cyan-500 text-white" : "text-muted-foreground"
                    }`}>{s}</span>
                  ))}
                </div>
              </span>
            );
          })}
        </div>
      )}

      {unsupported.length > 0 && (
        <p role="status" className="text-xs font-bold text-amber-600 flex items-center gap-1">
          Skipped unsupported characters: {unsupported.join(', ')}
        </p>
      )}
    </div>
  );
}

function PracticeMode({ scores, onRecord, unlockedGroups }) {
  const [phase, setPhase] = useState("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [builtSeq, setBuiltSeq] = useState([]);
  const [symIndex, setSymIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [activeLetters, setActiveLetters] = useState([]);

  const startPractice = useCallback(() => {
    const letters = [];
    for (let i = 0; i < unlockedGroups; i++) {
      letters.push(...PROGRESSIVE_GROUPS[i].letters);
    }
    const shuffled = shuffleArray(letters);
    setActiveLetters(shuffled);
    setCurrentIdx(0);
    setBuiltSeq([]);
    setSymIndex(0);
    setShowResult(false);
    setStreak(0);
    setPhase("practicing");
  }, [unlockedGroups]);

  const current = activeLetters[currentIdx];
  const currentMorse = current ? MORSE_MAP[current] : "";
  const expectedSeq = currentMorse.split("");

  const handleDotDash = useCallback((type) => {
    if (showResult) return;
    const sym = type === "dot" ? "." : "-";
    const newBuilt = [...builtSeq, sym];
    setBuiltSeq(newBuilt);
    const nextIdx = symIndex + 1;

    if (nextIdx >= expectedSeq.length) {
      const isCorrect = newBuilt.every((s, i) => s === expectedSeq[i]);
      setShowResult(true);
      if (isCorrect) setStreak(s => s + 1);
      else setStreak(0);
      onRecord(current, isCorrect);
    } else if (expectedSeq[symIndex] !== sym) {
      setShowResult(true);
      setStreak(0);
      onRecord(current, false);
    } else {
      setSymIndex(nextIdx);
    }
  }, [builtSeq, symIndex, expectedSeq, showResult, current, onRecord]);

  const handleUndo = useCallback(() => {
    if (showResult || builtSeq.length === 0) return;
    setBuiltSeq(builtSeq.slice(0, -1));
    setSymIndex(i => Math.max(0, i - 1));
  }, [builtSeq, showResult]);

  const next = useCallback(() => {
    if (currentIdx < activeLetters.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      const reshuffled = shuffleArray(activeLetters);
      setActiveLetters(reshuffled);
      setCurrentIdx(0);
    }
    setBuiltSeq([]);
    setSymIndex(0);
    setShowResult(false);
  }, [currentIdx, activeLetters]);

  const isCorrectBuilt = showResult && builtSeq.every((s, i) => s === expectedSeq[i]);

  if (phase === "intro") {
    return (
      <div className="text-center p-12 rounded-3xl border bg-card border-border">
        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-primary opacity-40" />
        <p className="text-lg font-bold mb-2 text-foreground">Practice Mode</p>
        <p className="text-sm text-muted-foreground mb-6">See a letter, tap dot ({'.'}) or dash ({'-'}) to build its Morse code.</p>
        <button onClick={startPractice} className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-lg active:scale-95 transition-all">
          Start Practice
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-muted-foreground">{currentIdx + 1} of {activeLetters.length}</span>
        <div className="flex gap-1">
          {activeLetters.slice(0, Math.min(activeLetters.length, 20)).map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i < currentIdx ? "bg-primary" : i === currentIdx ? "bg-amber-400" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      <div className="text-center p-8 rounded-2xl border bg-card border-border mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Letter</p>
        <span className="text-7xl font-black text-foreground">{current}</span>
        <div className="flex justify-center gap-1.5 mt-4 min-h-[32px]">
          {expectedSeq.map((s, i) => {
            const filled = i < builtSeq.length;
            const correct = filled && builtSeq[i] === s;
            const wrong = filled && builtSeq[i] !== s;
            return (
              <span key={i} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                wrong ? "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-600" :
                correct ? "border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                i === builtSeq.length ? "border-primary bg-primary/10 text-primary animate-pulse" :
                "border-muted bg-muted/20 text-muted-foreground"
              }`}>
                {correct ? s : wrong ? "!" : ""}
              </span>
            );
          })}
        </div>
      </div>

      {!showResult ? (
        <div>
          <div className="flex gap-3">
            <button onClick={() => handleDotDash("dot")} className="flex-1 py-6 rounded-xl font-bold bg-card border-2 border-primary/30 hover:bg-primary/10 hover:border-primary text-foreground text-lg transition-all active:scale-95 flex flex-col items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-foreground" />
              <span className="text-xs">Dot (.)</span>
            </button>
            <button onClick={() => handleDotDash("dash")} className="flex-1 py-6 rounded-xl font-bold bg-card border-2 border-primary/30 hover:bg-primary/10 hover:border-primary text-foreground text-lg transition-all active:scale-95 flex flex-col items-center gap-1">
              <span className="w-8 h-1.5 rounded-full bg-foreground" />
              <span className="text-xs">Dash (-)</span>
            </button>
          </div>
          {builtSeq.length > 0 && (
            <button onClick={handleUndo} className="mt-3 w-full py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground font-bold text-sm transition active:scale-95">
              Undo
            </button>
          )}
        </div>
      ) : (
        <div>
          <div role="status" aria-live="polite" className={`p-4 rounded-xl text-center font-bold text-sm mb-4 ${
            isCorrectBuilt
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          }`}>
            {isCorrectBuilt ? (
              <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct! Streak: {streak}</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Incorrect — {current} = {expectedSeq.join(" ")}</span>
            )}
          </div>
          <button onClick={next} className="w-full py-3 rounded-xl font-bold bg-primary text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function QuizMode({ scores, onRecord, unlockedGroups, wpm, pitch, volume }) {
  const [phase, setPhase] = useState("intro");
  const [activeLetters, setActiveLetters] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const { playMorseSequence, stopAll } = useMorseAudio();

  const startQuiz = useCallback(() => {
    const letters = [];
    for (let i = 0; i < unlockedGroups; i++) {
      letters.push(...PROGRESSIVE_GROUPS[i].letters);
    }
    const shuffled = shuffleArray(letters);
    setActiveLetters(shuffled);
    setCurrentIdx(0);
    setSelected(null);
    setResult(null);
    setPhase("playing");
  }, [unlockedGroups]);

  const current = activeLetters[currentIdx];
  const currentMorse = current ? MORSE_MAP[current] : "";

  const playCurrent = useCallback(() => {
    stopAll();
    if (!current) return;
    const chars = [current];
    setTimeout(() => {
      playMorseSequence(chars, wpm, pitch, volume, () => {});
    }, 100);
  }, [current, wpm, pitch, volume, playMorseSequence, stopAll]);

  useEffect(() => {
    if (phase === "playing" && current) {
      const opts = shuffleArray([current, ...shuffleArray(ALL_CHARS.filter(c => c !== current)).slice(0, 3)]);
      setOptions(opts);
      setSelected(null);
      setResult(null);
      const t = setTimeout(() => playCurrent(), 300);
      return () => clearTimeout(t);
    }
  }, [current, phase, playCurrent]);

  const handleAnswer = useCallback((letter) => {
    if (selected !== null) return;
    setSelected(letter);
    const isCorrect = letter === current;
    setResult(isCorrect ? "correct" : "incorrect");
    onRecord(current, isCorrect);
  }, [current, selected, onRecord]);

  const next = useCallback(() => {
    stopAll();
    if (currentIdx < activeLetters.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      const reshuffled = shuffleArray(activeLetters);
      setActiveLetters(reshuffled);
      setCurrentIdx(0);
    }
  }, [currentIdx, activeLetters, stopAll]);

  if (phase === "intro") {
    return (
      <div className="text-center p-12 rounded-3xl border bg-card border-border">
        <Brain className="w-16 h-16 mx-auto mb-4 text-primary opacity-40" />
        <p className="text-lg font-bold mb-2 text-foreground">Quiz Mode</p>
        <p className="text-sm text-muted-foreground mb-6">Hear a Morse code audio signal and identify the letter.</p>
        <button onClick={startQuiz} className="px-8 py-3 rounded-xl font-bold bg-primary text-white shadow-lg active:scale-95 transition-all">
          Start Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-muted-foreground">{currentIdx + 1} of {activeLetters.length}</span>
        <div className="flex gap-1">
          {activeLetters.slice(0, Math.min(activeLetters.length, 20)).map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i < currentIdx ? "bg-primary" : i === currentIdx ? "bg-amber-400" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Identify the letter from the Morse audio</p>
        <button onClick={playCurrent} className="mx-auto px-6 py-3 rounded-xl font-bold bg-primary text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 mb-4">
          <Play className="w-4 h-4" /> Play Again
        </button>
        <div className="font-mono text-2xl font-black text-primary">
          {currentMorse.split("").map((s, i) => (
            <span key={i} className="mx-1">{s === "." ? "\u2022" : "\u2015"}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map(l => {
          const isSelected = selected === l;
          const isCorrect = l === current;
          const borderColor = selected === null
            ? "border-border hover:border-primary/50"
            : isCorrect
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
              : isSelected
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-border opacity-50";
          return (
            <button
              key={l}
              onClick={() => handleAnswer(l)}
              disabled={selected !== null}
              className={`px-5 py-4 rounded-xl border-2 font-bold text-lg transition-all active:scale-95
                ${borderColor}
                ${selected !== null ? "cursor-default" : "cursor-pointer"}
                bg-card text-foreground`}
            >
              {l}
            </button>
          );
        })}
      </div>

      {result && (
        <div role="status" aria-live="polite" className={`mt-4 p-4 rounded-xl text-center font-bold text-sm ${
          result === "correct"
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
        }`}>
          {result === "correct" ? (
            <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct!</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Incorrect — it was {current}</span>
          )}
        </div>
      )}

      {selected !== null && (
        <button onClick={next} className="w-full mt-4 py-3 rounded-xl font-bold bg-primary text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function LearnMode({ scores, unlockedGroups }) {
  const [showAll, setShowAll] = useState(false);

  const renderedChars = showAll ? ALL_CHARS : (() => {
    const c = [];
    for (let i = 0; i < unlockedGroups; i++) {
      c.push(...PROGRESSIVE_GROUPS[i].letters);
    }
    return c;
  })();

  return (
    <div className="space-y-6">
      <MorseReferenceChart />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-primary" /> Progressive Learning
        </h3>
        <button
          onClick={() => setShowAll(s => !s)}
          className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-card border-border text-muted-foreground hover:text-foreground transition"
        >
          {showAll ? "Show Unlocked" : "Show All"}
        </button>
      </div>

      {PROGRESSIVE_GROUPS.map((group, gi) => {
        if (gi >= unlockedGroups && !showAll) return null;
        const isUnlocked = gi < unlockedGroups;
        return (
          <div key={gi} className="rounded-xl border bg-card border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? "text-primary" : "text-muted-foreground"}`}>
                {group.label}
              </span>
              {!isUnlocked && (
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              {isUnlocked && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.letters.map(ch => {
                const st = getCharStatus(ch, scores);
                return (
                  <div key={ch} className="flex flex-col items-center p-2 rounded-lg border min-w-[48px]" style={{ borderColor: "var(--border)" }}>
                    <span className="text-lg font-black text-foreground">{ch}</span>
                    <span className="text-[10px] font-mono font-bold text-primary mt-0.5">{MORSE_MAP[ch]}</span>
                    <StatusDot status={st} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("learn");
  const [initialData] = useState(loadProgress);
  const [scores, setScores] = useState(initialData.scores);
  const [stats, setStats] = useState(initialData.stats);
  const [unlockedGroups, setUnlockedGroups] = useState(initialData.unlockedGroups);
  const [streakCount, setStreakCount] = useState(stats?.streak || 0);
  const [totalCorrect, setTotalCorrect] = useState(stats?.correct || 0);
  const [totalIncorrect, setTotalIncorrect] = useState(stats?.incorrect || 0);
  const [bestStreak, setBestStreak] = useState(stats?.bestStreak || 0);
  const [wpm, setWpm] = useState(15);
  const [pitch, setPitch] = useState(600);
  const [volume, setVolume] = useState(80);
  const streakRef = useRef(streakCount);
  const [encText, setEncText] = useState("");

  const masteredCount = useMemo(() => {
    let count = 0;
    for (const ch of ALL_CHARS) {
      if (getCharStatus(ch, scores) === "mastered") count++;
    }
    return count;
  }, [scores]);

  const persistScores = useCallback((newScores) => {
    setScores(newScores);
    saveScores(newScores);
  }, []);

  const persistStats = useCallback((newStats) => {
    setStats(newStats);
    saveStats(newStats);
  }, []);

  const recordAnswer = useCallback((letter, isCorrect) => {
    const newScores = { ...scores };
    if (!newScores[letter]) newScores[letter] = { correct: 0, total: 0 };
    newScores[letter] = {
      correct: newScores[letter].correct + (isCorrect ? 1 : 0),
      total: newScores[letter].total + 1,
    };
    persistScores(newScores);

    const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0);
    const newTotalIncorrect = totalIncorrect + (isCorrect ? 0 : 1);
    setTotalCorrect(newTotalCorrect);
    setTotalIncorrect(newTotalIncorrect);

    if (isCorrect) {
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      setStreakCount(newStreak);
      const newBest = Math.max(bestStreak, newStreak);
      setBestStreak(newBest);
      persistStats({ streak: newStreak, correct: newTotalCorrect, incorrect: newTotalIncorrect, bestStreak: newBest });

      const mastered = newScores[letter].correct / newScores[letter].total >= 0.8 && newScores[letter].total >= 5;
      if (mastered && unlockedGroups < PROGRESSIVE_GROUPS.length) {
        const allPrevMastered = PROGRESSIVE_GROUPS[unlockedGroups - 1].letters.every(
          l => {
            const s = newScores[l];
            return s && s.correct / s.total >= 0.8 && s.total >= 5;
          }
        );
        if (allPrevMastered) {
          setUnlockedGroups(g => {
            const next = Math.min(g + 1, PROGRESSIVE_GROUPS.length);
            saveUnlocked(next);
            return next;
          });
        }
      }
    } else {
      streakRef.current = 0;
      setStreakCount(0);
      persistStats({ streak: 0, correct: newTotalCorrect, incorrect: newTotalIncorrect, bestStreak });
    }
  }, [scores, totalCorrect, totalIncorrect, bestStreak, unlockedGroups, persistScores, persistStats]);

  const modeButtons = [
    { key: "learn", label: "Learn", icon: BookOpen },
    { key: "encode", label: "Encode", icon: Type },
    { key: "decode", label: "Decode", icon: Code },
    { key: "playback", label: "Playback", icon: Volume2 },
    { key: "practice", label: "Practice", icon: GraduationCap },
    { key: "quiz", label: "Quiz", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="heading flex justify-center gap-2 animate-fade-up mb-2">
            Morse Code Trainer
          </h1>
          <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-4">
            Learn Morse Code Interactively
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <Trophy className="w-3.5 h-3.5" /> {masteredCount}/{ALL_CHARS.length} Mastered
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <Zap className="w-3.5 h-3.5" /> {streakCount} Streak
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <BarChart3 className="w-3.5 h-3.5" /> {totalCorrect}/{totalCorrect + totalIncorrect || 0}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <Ear className="w-3.5 h-3.5" /> Group {unlockedGroups}/{PROGRESSIVE_GROUPS.length}
            </span>
          </div>
          {bestStreak > 0 && (
            <span className="text-xs font-bold text-muted-foreground">Best Streak: {bestStreak}</span>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-muted gap-1 flex-wrap justify-center">
            {modeButtons.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                  ${mode === key
                    ? "bg-card text-primary shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {mode === "learn" && <LearnMode scores={scores} unlockedGroups={unlockedGroups} />}

        {mode === "encode" && <EncodeSection />}

        {mode === "decode" && <DecodeSection />}

        {mode === "playback" && (
          <PlaybackSection
            text={encText} setText={setEncText}
            wpm={wpm} setWpm={setWpm}
            pitch={pitch} setPitch={setPitch}
            volume={volume} setVolume={setVolume}
          />
        )}

        {mode === "practice" && (
          <PracticeMode scores={scores} onRecord={recordAnswer} unlockedGroups={unlockedGroups} />
        )}

        {mode === "quiz" && (
          <QuizMode
            scores={scores} onRecord={recordAnswer}
            unlockedGroups={unlockedGroups}
            wpm={wpm} pitch={pitch} volume={volume}
          />
        )}

        <div className="mt-10">
          <div className="rounded-3xl p-6 border bg-card border-border">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground uppercase tracking-widest">
              <BarChart3 className="w-4 h-4 text-primary" /> Progress Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard label="Correct" value={totalCorrect} icon={CheckCircle2} color="bg-emerald-500" />
              <StatCard label="Incorrect" value={totalIncorrect} icon={XCircle} color="bg-red-500" />
              <StatCard label="Streak" value={streakCount} icon={Zap} color="bg-amber-500" />
              <StatCard label="Mastered" value={`${masteredCount}/${ALL_CHARS.length}`} icon={Trophy} color="bg-purple-500" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {ALL_CHARS.map(ch => (
                <div key={ch} className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg border min-w-[32px]" style={{ borderColor: "var(--border)" }}>
                  <span className="text-xs font-bold text-foreground">{ch}</span>
                  <StatusDot status={getCharStatus(ch, scores)} />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><StatusDot status="new" /> New</span>
              <span className="flex items-center gap-1"><StatusDot status="learning" /> Learning</span>
              <span className="flex items-center gap-1"><StatusDot status="mastered" /> Mastered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
