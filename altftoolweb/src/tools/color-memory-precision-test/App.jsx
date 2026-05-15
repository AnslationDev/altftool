"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Brain,
  Timer,
  Target,
  RefreshCw,
  Check,
  Trophy,
  MousePointer2,
  Sliders,
  Eye,
  Info,
  ChevronRight,
  Zap,
  Activity,
  History,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  generateRandomColor,
  calculateAccuracy,
  getPrecisionRating,
  getContrastColor
} from "./utils/colorUtils";

// --- Shared Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-colors overflow-hidden break-words ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-lg font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Color Memory Precision Test";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Neural Vision Engine Active
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Test your visual perception and neural recall by recreating exact shades from memory.
      </p>
    </motion.div>
  );
};

// --- Main App ---

export default function ColorMemoryPrecisionTest() {
  const [gameState, setGameState] = useState("idle"); // idle, preview, input, result
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  const [originalColor, setOriginalColor] = useState("#3b82f6");
  const [userColor, setUserColor] = useState("#3b82f6");
  const [timer, setTimer] = useState(5);
  const [accuracy, setAccuracy] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const timerRef = useRef(null);

  const startTest = useCallback(() => {
    const color = generateRandomColor(difficulty);
    setOriginalColor(color);
    setUserColor("#808080"); // Start with a neutral gray
    setGameState("preview");

    let duration = 5;
    if (difficulty === "easy") duration = 8;
    if (difficulty === "hard") duration = 3;

    setTimer(duration);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState("input");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [difficulty]);

  const submitColor = () => {
    const result = calculateAccuracy(originalColor, userColor);
    setAccuracy(result);
    setGameState("result");

    // Save to history
    setHistory(prev => [{
      original: originalColor,
      user: userColor,
      score: result.percentage,
      difficulty,
      date: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 5));
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateColorComponent = (type, value) => {
    const rgb = hexToRgb(userColor);
    if (type === 'r') rgb.r = parseInt(value);
    if (type === 'g') rgb.g = parseInt(value);
    if (type === 'b') rgb.b = parseInt(value);
    setUserColor(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-primary/30">
      <div className="max-w-[1200px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Control & Status */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard title="Configuration" icon={Zap}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Select Difficulty</label>
                  <div className="grid grid-cols-3 gap-2 min-w-0">
                    {['easy', 'medium', 'hard'].map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        disabled={gameState !== "idle" && gameState !== "result"}
                        className={`py-2.5 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border truncate ${difficulty === d
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20 scale-[1.02]'
                            : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-(--border)">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Neural Status</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${gameState === 'idle' ? 'bg-blue-500/10 text-blue-500' :
                        gameState === 'preview' ? 'bg-amber-500/10 text-amber-500' :
                          gameState === 'input' ? 'bg-purple-500/10 text-purple-500' :
                            'bg-green-500/10 text-green-500'
                      }`}>
                      {gameState.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Session Rank</span>
                      <span className="font-bold text-blue-500">A+</span>
                    </div>
                    <div className="h-1.5 w-full bg-(--background) rounded-full overflow-hidden border border-(--border)">
                      <motion.div
                        className="h-full bg-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                      />
                    </div>
                  </div>
                </div>

                {gameState === "idle" && (
                  <button
                    onClick={startTest}
                    className="w-full py-4 px-3 rounded-2xl bg-blue-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-wider shadow-xl shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    <span className="text-center">Initialize Neural Test</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                )}

                {gameState === "result" && (
                  <button
                    onClick={startTest}
                    className="w-full py-4 px-3 rounded-2xl bg-(--background) border border-blue-500/30 text-blue-500 font-black text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-wider hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} className="shrink-0" />
                    <span className="text-center">Try Another Shade</span>
                  </button>
                )}
              </div>
            </GlassCard>

            <GlassCard title="Memory History" icon={History} delay={0.1}>
              <div className="space-y-4">
                {history.length > 0 ? history.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-(--background) border border-(--border) hover:border-primary/20 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2 shrink-0">
                        <div className="w-8 h-8 rounded-full border-2 border-(--background) shadow-sm" style={{ backgroundColor: item.original }} />
                        <div className="w-8 h-8 rounded-full border-2 border-(--background) shadow-sm" style={{ backgroundColor: item.user }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-(--foreground) truncate">{item.score}% Precision</div>
                        <div className="text-[8px] text-muted-foreground uppercase truncate">{item.difficulty} • {item.date}</div>
                      </div>
                    </div>
                    <div className={`text-[10px] font-black shrink-0 ${item.score >= 90 ? 'text-green-500' : 'text-blue-500'}`}>
                      {item.score >= 90 ? 'EXCELLENT' : 'GOOD'}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Brain size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">No Neural Data Yet</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Game Area */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">

              {/* IDLE STATE */}
              {gameState === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <GlassCard className="!p-12 text-center">
                    <div className="max-w-md mx-auto space-y-8">
                      <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto relative">
                        <Brain size={48} className="text-blue-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-3xl font-black text-(--foreground)">Ready to begin?</h2>
                        <p className="text-muted-foreground leading-relaxed">
                          We will show you a random shade for a few seconds. Your mission is to memorize it and recreate it as accurately as possible using the spectral controls.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                          <Eye size={18} className="text-blue-500 mb-2" />
                          <div className="text-xs font-bold mb-1">Visual Recall</div>
                          <div className="text-[10px] text-muted-foreground">Train your eyes to see subtle differences in hue and saturation.</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                          <Target size={18} className="text-blue-500 mb-2" />
                          <div className="text-xs font-bold mb-1">Precision Logic</div>
                          <div className="text-[10px] text-muted-foreground">Master the RGB and HSL values to match colors scientifically.</div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* PREVIEW STATE */}
              {gameState === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-6"
                >
                  <GlassCard title="Memorize This Color" icon={Eye}>
                    <div className="space-y-8">
                      <div
                        className="w-full aspect-[21/9] rounded-[2rem] shadow-2xl relative overflow-hidden group"
                        style={{ backgroundColor: originalColor }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/20 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/20 flex items-center gap-4">
                            <Timer size={32} className="text-white animate-pulse" />
                            <div className="text-5xl font-black text-white tabular-nums">{timer}</div>
                          </div>
                        </div>
                        {/* Futuristic Scanning Line */}
                        <motion.div
                          className="absolute left-0 right-0 h-1 bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10"
                          animate={{ top: ["0%", "100%", "0%"] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <div className="flex justify-center gap-12">
                        <div className="text-center">
                          <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Duration</div>
                          <div className="text-xl font-black text-(--foreground)">{difficulty === 'easy' ? '8s' : difficulty === 'medium' ? '5s' : '3s'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Mode</div>
                          <div className="text-xl font-black text-blue-500 uppercase">{difficulty}</div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* INPUT STATE */}
              {gameState === "input" && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard title="Recreation" icon={MousePointer2}>
                      <div className="space-y-6">
                        <div
                          className="w-full aspect-square rounded-[2.5rem] shadow-2xl border-4 border-white/10 relative overflow-hidden"
                          style={{ backgroundColor: userColor }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end gap-2">
                            <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 min-w-0">
                              <div className="text-[8px] font-black text-white/70 uppercase truncate">Current Hex</div>
                              <div className="text-sm font-mono font-bold text-white uppercase truncate">{userColor}</div>
                            </div>
                            <button
                              onClick={() => handleCopy(userColor)}
                              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                            >
                              {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="relative pt-2">
                          <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-3 block">Neural Color Picker</label>
                          <div className="relative h-12 rounded-xl overflow-hidden border border-(--border) cursor-crosshair">
                            <input
                              type="color"
                              value={userColor}
                              onChange={(e) => setUserColor(e.target.value)}
                              className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-crosshair bg-transparent"
                            />
                            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${getContrastColor(userColor)} font-black text-[10px] uppercase tracking-[0.3em]`}>
                              Tap to select
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard title="Spectral Fine-Tuning" icon={Sliders}>
                      <div className="space-y-8">
                        {['r', 'g', 'b'].map(comp => {
                          const val = hexToRgb(userColor)[comp];
                          const colors = {
                            r: 'from-red-500/20 to-red-500',
                            g: 'from-green-500/20 to-green-500',
                            b: 'from-blue-500/20 to-blue-500'
                          };
                          return (
                            <div key={comp} className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">{comp === 'r' ? 'Red Channel' : comp === 'g' ? 'Green Channel' : 'Blue Channel'}</span>
                                <span className="text-sm font-mono font-bold text-blue-500">{val}</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="255"
                                value={val}
                                onChange={(e) => updateColorComponent(comp, e.target.value)}
                                className={`w-full h-2 bg-(--background) rounded-full appearance-none cursor-pointer border border-(--border) [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(37,99,235,0.5)]`}
                              />
                            </div>
                          );
                        })}

                        <div className="pt-4 space-y-4">
                          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                              Use the sliders for surgical precision. Small adjustments can drastically impact your accuracy score.
                            </p>
                          </div>
                          <button
                            onClick={submitColor}
                            className="w-full py-4 px-3 rounded-2xl bg-blue-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-wider shadow-xl shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                          >
                            <span className="text-center">Submit Reconstruction</span>
                            <Check size={18} className="group-hover:scale-110 transition-transform shrink-0" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}

              {/* RESULT STATE */}
              {gameState === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  <GlassCard title="Neural Comparison" icon={Activity}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest truncate">Original Target</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase truncate">{originalColor}</span>
                        </div>
                        <div
                          className="w-full h-48 rounded-[2rem] shadow-lg border border-white/10 relative overflow-hidden"
                          style={{ backgroundColor: originalColor }}
                        >
                          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[8px] font-black text-white uppercase">Reference</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest truncate">Your Reconstruction</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase truncate">{userColor}</span>
                        </div>
                        <div
                          className="w-full h-48 rounded-[2rem] shadow-lg border border-white/10 relative overflow-hidden"
                          style={{ backgroundColor: userColor }}
                        >
                          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[8px] font-black text-white uppercase">User Input</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-(--border)">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Score Circular Progress */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="relative w-32 h-32">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                              <circle
                                className="text-(--border) stroke-current"
                                strokeWidth="8"
                                fill="transparent"
                                r="42"
                                cx="50"
                                cy="50"
                              />
                              <motion.circle
                                className="text-blue-600 stroke-current"
                                strokeWidth="8"
                                strokeLinecap="round"
                                fill="transparent"
                                r="42"
                                cx="50"
                                cy="50"
                                initial={{ strokeDasharray: "0 264" }}
                                animate={{ strokeDasharray: `${(accuracy.percentage / 100) * 264} 264` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black text-(--foreground)">{accuracy.percentage}%</span>
                              <span className="text-[8px] font-black text-muted-foreground uppercase">Precision</span>
                            </div>
                          </div>
                          <div className={`text-sm font-black uppercase tracking-widest ${getPrecisionRating(accuracy.percentage).color}`}>
                            {getPrecisionRating(accuracy.percentage).label} Rating
                          </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="md:col-span-2 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                              <div className="text-[10px] font-black uppercase text-muted-foreground mb-2">RGB Variance</div>
                              <div className="space-y-2">
                                {Object.entries(accuracy.rgbDiff).map(([k, v]) => (
                                  <div key={k} className="flex justify-between items-center gap-1">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground/60 truncate">{k}</span>
                                    <span className="text-[10px] font-mono font-bold text-blue-500 shrink-0">Δ{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                              <div className="text-[10px] font-black uppercase text-muted-foreground mb-2">HSL Variance</div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[10px] font-bold uppercase text-muted-foreground/60 truncate">Hue</span>
                                  <span className="text-[10px] font-mono font-bold text-blue-500 shrink-0">Δ{accuracy.hslDiff.h}°</span>
                                </div>
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[10px] font-bold uppercase text-muted-foreground/60 truncate">Sat</span>
                                  <span className="text-[10px] font-mono font-bold text-blue-500 shrink-0">Δ{accuracy.hslDiff.s}%</span>
                                </div>
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[10px] font-bold uppercase text-muted-foreground/60 truncate">Lum</span>
                                  <span className="text-[10px] font-mono font-bold text-blue-500 shrink-0">Δ{accuracy.hslDiff.l}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                            <div className="flex gap-3 items-center min-w-0">
                              <Trophy size={20} className="text-yellow-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-(--foreground) truncate">New Personal Best!</div>
                                <div className="text-[10px] text-muted-foreground uppercase truncate">Your neural accuracy is improving.</div>
                              </div>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap">Claim Rank</button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Scientific Info Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 px-4">
          <div className="bg-(--card) border border-(--border) rounded-3xl p-6 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Eye size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-(--foreground)">Visual Perception</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The human eye can distinguish millions of shades, but short-term memory of exact color values decays rapidly without neural training.
            </p>
          </div>
          <div className="bg-(--card) border border-(--border) rounded-3xl p-6 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-(--foreground)">Neural Recall</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Practicing color reconstruction strengthens the connection between the visual cortex and the prefrontal cortex for better detail retention.
            </p>
          </div>
          <div className="bg-(--card) border border-(--border) rounded-3xl p-6 hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-(--foreground)">Precision Metrics</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our analyzer uses spectral distance algorithms to measure Delta-E variance between the target and your neural reconstruction.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2"
          >
            <Check size={14} />
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
