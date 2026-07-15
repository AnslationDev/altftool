"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Volume2, 
  RefreshCw, 
  Sliders, 
  VolumeX, 
  Sparkles, 
  Info,
  CheckCircle2
} from "lucide-react";

// International Morse Code Map
const MORSE_CODE_MAP = {
  'A': '.-',     'B': '-...',   'C': '-.-.',   'D': '-..',    'E': '.',
  'F': '..-.',   'G': '--.',    'H': '....',   'I': '..',     'J': '.---',
  'K': '-.-',    'L': '.-..',   'M': '--',     'N': '-.',     'O': '---',
  'P': '.--.',   'Q': '--.-',   'R': '.-.',    'S': '...',    'T': '-',
  'U': '..-',    'V': '...-',   'W': '.--',    'X': '-..-',   'Y': '-.--',
  'Z': '--..',
  '1': '.----',  '2': '..---',  '3': '...--',  '4': '....-',  '5': '.....',
  '6': '-....',  '7': '--...',  '8': '---..',  '9': '----.',  '0': '-----',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.',  '(': '-.--.',  ')': '-.--.-', '&': '.-...',  ':': '---...',
  ';': '-.-.-.', '=': '-...-',  '+': '.-.-.',  '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

export default function ToolHome() {
  const [text, setText] = useState("HELLO WORLD");
  const [morseString, setMorseString] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Playback settings
  const [wpm, setWpm] = useState(15);
  const [pitch, setPitch] = useState(600);
  const [volume, setVolume] = useState(80);
  const [showSettings, setShowSettings] = useState(true);

  // Highlighting tracking
  const [timeline, setTimeline] = useState([]);
  const [timelineIndex, setTimelineIndex] = useState(-1);
  const [activeCharIndex, setActiveCharIndex] = useState(null);
  const [activeSymbolIndex, setActiveSymbolIndex] = useState(null);

  // Audio Context Ref
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const timelineRef = useRef([]);
  const timelineIndexRef = useRef(-1);

  // Timeouts tracking to clean up
  const timeoutsRef = useRef([]);

  // Auto-convert on text change
  useEffect(() => {
    const chars = text.toUpperCase().split("");
    const encoded = chars.map(c => {
      if (c === " ") return "/";
      return MORSE_CODE_MAP[c] || "";
    }).filter(x => x !== "").join(" ");
    setMorseString(encoded);
    
    // Stop playback if text changes
    handleStop();
  }, [text]);

  // Keep ref updated
  useEffect(() => {
    timelineRef.current = timeline;
  }, [timeline]);

  useEffect(() => {
    timelineIndexRef.current = timelineIndex;
  }, [timelineIndex]);

  // Live Waveform/Equalizer Visualizer Refs & Loop
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      // Only request next frame if we are actively playing morse signal
      if (isPlaying) {
        animationId = requestAnimationFrame(draw);
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Handle dynamic retina scaling efficiently without resize listeners
      const targetWidth = Math.floor(rect.width * (window.devicePixelRatio || 1));
      const targetHeight = Math.floor(rect.height * (window.devicePixelRatio || 1));
      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle grid background lines
      ctx.strokeStyle = "rgba(20, 184, 166, 0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 10) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }

      // Check if sound oscillator is sounding
      const isSounding = isPlaying && oscRef.current !== null && analyserRef.current !== null;

      if (!isSounding) {
        // Draw flat resting baseline line
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Draw active equalizer bars
      const barWidth = (width / bufferLength) * 0.95;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const percent = dataArray[i] / 255;
        const barHeight = percent * height * 0.8;

        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, "#14b8a6"); // Teal-500
        gradient.addColorStop(1, "#22d3ee"); // Cyan-400

        ctx.fillStyle = gradient;
        const yPos = (height - barHeight) / 2;

        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, yPos, barWidth - 1, barHeight, 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, yPos, barWidth - 1, barHeight);
        }

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      stopTone();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const startTone = (freq, vol) => {
    if (typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      // Stop current oscillator if any
      stopTone();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Smooth rise time to prevent clicks
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(vol / 100, audioCtx.currentTime + 0.005);

      // Setup Analyser
      if (!analyserRef.current) {
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
      }

      osc.connect(gain);
      gain.connect(analyserRef.current);
      analyserRef.current.connect(audioCtx.destination);

      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.error("Audio Synthesis Error:", e);
    }
  };

  const stopTone = () => {
    try {
      if (oscRef.current && audioCtxRef.current) {
        const audioCtx = audioCtxRef.current;
        if (gainRef.current) {
          // Smooth decay to prevent clicks
          gainRef.current.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.005);
        }
        const osc = oscRef.current;
        const stopTimeout = setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (err) {}
        }, 10);
        timeoutsRef.current.push(stopTimeout);
        oscRef.current = null;
      }
    } catch (e) {
      console.error("Stop Tone Error:", e);
    }
  };

  const mapTextToTimeline = (str) => {
    const list = [];
    const chars = str.toUpperCase().split("");
    
    for (let charIndex = 0; charIndex < chars.length; charIndex++) {
      const char = chars[charIndex];
      if (char === " ") {
        // Space between words. Morse standard word gap is 7 dots.
        // There is already a charGap (3 dots) or space gap. We push 4 additional unit gap.
        list.push({ type: "space", charIndex, durationUnits: 4 });
        continue;
      }
      
      const morse = MORSE_CODE_MAP[char];
      if (!morse) continue;
      
      for (let symIndex = 0; symIndex < morse.length; symIndex++) {
        const sym = morse[symIndex];
        list.push({
          type: "symbol",
          charIndex,
          symbol: sym,
          symbolIndex: symIndex,
          morse
        });
        
        // Gap between symbols inside a letter is 1 dot
        if (symIndex < morse.length - 1) {
          list.push({ type: "gap", charIndex, durationUnits: 1 });
        }
      }
      
      // Gap between letters is 3 dots.
      if (charIndex < chars.length - 1 && chars[charIndex + 1] !== " ") {
        list.push({ type: "charGap", charIndex, durationUnits: 3 });
      }
    }
    return list;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause
      clearAllTimeouts();
      stopTone();
      setIsPaused(true);
      setIsPlaying(false);
    } else {
      // Play / Resume
      setIsPlaying(true);
      setIsPaused(false);
      
      let nextIndex = 0;
      let currentTimeline = [];

      if (isPaused && timelineIndexRef.current >= 0) {
        nextIndex = timelineIndexRef.current;
        currentTimeline = timelineRef.current;
      } else {
        currentTimeline = mapTextToTimeline(text);
        setTimeline(currentTimeline);
        nextIndex = 0;
      }

      playEventAtIndex(nextIndex, currentTimeline);
    }
  };

  const playEventAtIndex = (index, currentTimeline) => {
    if (index >= currentTimeline.length) {
      // Completed playback
      setIsPlaying(false);
      setIsPaused(false);
      setTimelineIndex(-1);
      setActiveCharIndex(null);
      setActiveSymbolIndex(null);
      return;
    }

    setTimelineIndex(index);
    const event = currentTimeline[index];
    setActiveCharIndex(event.charIndex);

    const dotDurationMs = (1.2 / wpm) * 1000;

    if (event.type === "symbol") {
      setActiveSymbolIndex(event.symbolIndex);
      const symbolDuration = event.symbol === "." ? dotDurationMs : 3 * dotDurationMs;
      
      // Turn on sound
      startTone(pitch, volume);

      // Schedule tone stop
      const stopTimeout = setTimeout(() => {
        stopTone();
        // Schedule next event (standard 1 dot gap after each symbol)
        const nextTimeout = setTimeout(() => {
          playEventAtIndex(index + 1, currentTimeline);
        }, dotDurationMs);
        timeoutsRef.current.push(nextTimeout);
      }, symbolDuration);

      timeoutsRef.current.push(stopTimeout);
    } else {
      // Silence gap events
      setActiveSymbolIndex(null);
      const silenceDuration = event.durationUnits * dotDurationMs;
      
      const gapTimeout = setTimeout(() => {
        playEventAtIndex(index + 1, currentTimeline);
      }, silenceDuration);

      timeoutsRef.current.push(gapTimeout);
    }
  };

  const handleStop = () => {
    clearAllTimeouts();
    stopTone();
    setIsPlaying(false);
    setIsPaused(false);
    setTimelineIndex(-1);
    setActiveCharIndex(null);
    setActiveSymbolIndex(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Morse Code Audio
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Audio, Education
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Convert text to Morse code, listen to audible signals, and track visual highlights in real-time.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Acoustic"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Main interactive panel */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Input text box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Enter English Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="Type your message here..."
              rows={3}
              disabled={isPlaying}
              className="w-full rounded-xl border border-border bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition leading-relaxed"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Supports letters, numbers, and basic punctuation</span>
              <span>{text.length} / 500 chars</span>
            </div>
          </div>

          {/* Quick Toolbar Settings Toggle */}
          <div className="flex items-center justify-between border-t border-b border-border py-3">
            <div className="flex gap-2">
              <button
                onClick={handlePlayPause}
                disabled={!text.trim()}
                className={`h-10 px-5 flex items-center justify-center gap-2 font-bold rounded-xl cursor-pointer transition active:scale-95 duration-100 ${
                  isPlaying 
                    ? "bg-amber-500 hover:bg-amber-600 text-white" 
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause size={16} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={16} /> {isPaused ? "Resume" : "Listen"}
                  </>
                )}
              </button>

              {(isPlaying || isPaused) && (
                <button
                  onClick={handleStop}
                  className="h-10 px-5 flex items-center justify-center gap-2 border border-border hover:bg-surface-soft text-foreground font-bold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                >
                  <Square size={16} /> Stop
                </button>
              )}
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`h-10 px-4 flex items-center gap-2 text-xs font-bold rounded-xl border border-border transition ${
                showSettings ? "bg-surface-soft text-primary border-primary/20" : "text-muted-foreground hover:bg-surface-soft"
              }`}
            >
              <Settings size={14} /> Playback Settings
            </button>
          </div>

          {/* Settings Sub-Panel */}
          {showSettings && (
            <div className="bg-surface-soft rounded-xl p-5 border border-border grid sm:grid-cols-3 gap-5 animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* WPM Speed */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5"><Sliders size={12} className="text-primary" /> Speed (WPM)</span>
                  <span className="text-primary">{wpm} WPM</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={wpm}
                  onChange={(e) => setWpm(parseInt(e.target.value))}
                  disabled={isPlaying}
                  className="w-full accent-primary bg-border h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Words Per Minute (5 - 40 WPM)
                </span>
              </div>

              {/* Pitch Frequency */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-primary" /> Pitch (Hz)</span>
                  <span className="text-primary">{pitch} Hz</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="1000"
                  value={pitch}
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  disabled={isPlaying}
                  className="w-full accent-primary bg-border h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Audio Frequency Tone (300Hz - 1kHz)
                </span>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    {volume === 0 ? <VolumeX size={12} className="text-muted" /> : <Volume2 size={12} className="text-primary" />}
                    Volume
                  </span>
                  <span className="text-primary">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full accent-primary bg-border h-2 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground block">
                  Acoustic volume attenuation
                </span>
              </div>

            </div>
          )}

          {/* Live Waveform/Equalizer Visualizer */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-foreground">
              <span className="uppercase tracking-wider">Live Signal Visualizer</span>
              {isPlaying ? (
                <span className="text-primary animate-pulse flex items-center gap-1 font-mono text-[10px]">
                  ● TRANSMITTING AUDIO
                </span>
              ) : (
                <span className="text-muted-foreground font-mono text-[10px]">IDLE</span>
              )}
            </div>
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-14 bg-surface-soft border border-border rounded-xl shadow-inner transition duration-200"
              />
            </div>
          </div>

          {/* Synchronized Output Visualization */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Morse Code Output & Playback Highlights
            </label>
            
            <div className="w-full bg-surface-soft border border-border rounded-xl p-5 min-h-[140px] flex flex-wrap gap-x-2 gap-y-3 items-center content-start">
              {text.toUpperCase().split("").map((char, charIdx) => {
                const isSpace = char === " ";
                const isCharActive = activeCharIndex === charIdx;
                const morse = MORSE_CODE_MAP[char] || "";

                if (isSpace) {
                  return (
                    <div 
                      key={charIdx} 
                      className={`h-12 w-6 border-b-2 transition duration-75 flex items-end justify-center pb-1 ${
                        isCharActive ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-muted uppercase">/</span>
                    </div>
                  );
                }

                if (!morse) return null;

                return (
                  <div
                    key={charIdx}
                    className={`px-2 py-1.5 rounded-lg border flex flex-col items-center gap-1 transition-all duration-75 ${
                      isCharActive 
                        ? "bg-primary/5 border-primary shadow-sm scale-105" 
                        : "bg-surface border-border"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isCharActive ? "text-primary" : "text-foreground"}`}>
                      {char}
                    </span>
                    <div className="flex gap-0.5">
                      {morse.split("").map((sym, symIdx) => {
                        const isSymActive = isCharActive && activeSymbolIndex === symIdx;
                        return (
                          <span
                            key={symIdx}
                            className={`text-xs font-black px-1.5 py-0.5 rounded text-center transition duration-75 ${
                              isSymActive
                                ? "bg-cyan-500 text-white scale-110 shadow-sm"
                                : "text-muted-foreground bg-surface-soft"
                            }`}
                          >
                            {sym}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!text.trim() && (
                <div className="w-full text-center py-6 text-sm text-muted-foreground italic">
                  Awaiting English text input above...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Explain info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
            <Info size={20} />
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
            <h4 className="font-bold text-foreground text-sm">International Morse Code Standard</h4>
            <p>
              Morse code uses a standardized timing sequence where the duration of a **dash (dah)** is exactly three times the duration of a **dot (dit)**. The silence between elements of the same letter is 1 unit, the gap between letters is 3 units, and the gap between words is 7 units.
            </p>
            <p>
              This tool utilizes the browser's native **Web Audio API** to generate pure sine wave frequencies directly on your device, ensuring privacy and sub-millisecond playback timing precision.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
