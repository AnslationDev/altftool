"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Copy,
  FileDown,
  BookOpen,
  Volume1
} from "lucide-react";

// NATO Phonetic Alphabet Map
const NATO_PHONETIC_MAP = {
  'A': { word: 'Alpha', pronunciation: 'AL-fah' },
  'B': { word: 'Bravo', pronunciation: 'BRAH-voh' },
  'C': { word: 'Charlie', pronunciation: 'CHAR-lee' },
  'D': { word: 'Delta', pronunciation: 'DELL-tah' },
  'E': { word: 'Echo', pronunciation: 'ECK-oh' },
  'F': { word: 'Foxtrot', pronunciation: 'FOKS-trot' },
  'G': { word: 'Golf', pronunciation: 'GOLF' },
  'H': { word: 'Hotel', pronunciation: 'hoh-TELL' },
  'I': { word: 'India', pronunciation: 'IN-dee-ah' },
  'J': { word: 'Juliet', pronunciation: 'JEW-lee-ett' },
  'K': { word: 'Kilo', pronunciation: 'KEY-loh' },
  'L': { word: 'Lima', pronunciation: 'LEE-mah' },
  'M': { word: 'Mike', pronunciation: 'MIKE' },
  'N': { word: 'November', pronunciation: 'noh-VEM-ber' },
  'O': { word: 'Oscar', pronunciation: 'OSS-cah' },
  'P': { word: 'Papa', pronunciation: 'pah-PAH' },
  'Q': { word: 'Quebec', pronunciation: 'keh-BECK' },
  'R': { word: 'Romeo', pronunciation: 'ROW-me-oh' },
  'S': { word: 'Sierra', pronunciation: 'see-AIR-rah' },
  'T': { word: 'Tango', pronunciation: 'TANG-go' },
  'U': { word: 'Uniform', pronunciation: 'YOU-nee-form' },
  'V': { word: 'Victor', pronunciation: 'VIK-tah' },
  'W': { word: 'Whiskey', pronunciation: 'WISS-key' },
  'X': { word: 'X-ray', pronunciation: 'ECKS-ray' },
  'Y': { word: 'Yankee', pronunciation: 'YANG-key' },
  'Z': { word: 'Zulu', pronunciation: 'ZOO-loo' },
  '1': { word: 'One', pronunciation: 'WUN' },
  '2': { word: 'Two', pronunciation: 'TOO' },
  '3': { word: 'Three', pronunciation: 'TREE' },
  '4': { word: 'Four', pronunciation: 'FOW-er' },
  '5': { word: 'Five', pronunciation: 'FIFE' },
  '6': { word: 'Six', pronunciation: 'SIX' },
  '7': { word: 'Seven', pronunciation: 'SEV-en' },
  '8': { word: 'Eight', pronunciation: 'AIT' },
  '9': { word: 'Nine', pronunciation: 'NIN-er' },
  '0': { word: 'Zero', pronunciation: 'ZEE-roh' }
};

export default function ToolHome() {
  const [text, setText] = useState("NATO Phonetic");
  const [phoneticString, setPhoneticString] = useState("");
  const [rate, setRate] = useState(0.85); // slightly slower by default for clear spelling
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showReference, setShowReference] = useState(true);

  const utteranceRef = useRef(null);
  const timeoutRef = useRef(null);
  const timelineRef = useRef([]);

  // Generate phonetic output on input text changes
  useEffect(() => {
    const chars = text.toUpperCase().split("");
    const mapped = chars.map(c => {
      if (c === " ") return "/";
      return NATO_PHONETIC_MAP[c] ? NATO_PHONETIC_MAP[c].word : c;
    });
    setPhoneticString(mapped.join(" "));
    handleStop();
  }, [text]);

  // Keep timeline list updated for playback engine
  const currentTimeline = text.toUpperCase().split("").map((char, index) => {
    const isNato = !!NATO_PHONETIC_MAP[char];
    return {
      char,
      word: isNato ? NATO_PHONETIC_MAP[char].word : char,
      pronunciation: isNato ? NATO_PHONETIC_MAP[char].pronunciation : null,
      isPhonetic: isNato,
      id: index
    };
  });

  useEffect(() => {
    timelineRef.current = currentTimeline;
  }, [text]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  const speakIndex = (index, list) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (index >= list.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(index);
    const item = list[index];

    // Handle space/word boundary pauses
    if (item.char === " ") {
      const timeout = setTimeout(() => {
        speakIndex(index + 1, list);
      }, 400 / rate);
      timeoutRef.current = timeout;
      return;
    }

    // Skip speak for non-phonetics but insert small delay
    if (!item.isPhonetic) {
      const timeout = setTimeout(() => {
        speakIndex(index + 1, list);
      }, 200 / rate);
      timeoutRef.current = timeout;
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any queued voices

    const utterance = new SpeechSynthesisUtterance(item.pronunciation || item.word);
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      const timeout = setTimeout(() => {
        speakIndex(index + 1, list);
      }, 200 / rate);
      timeoutRef.current = timeout;
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setActiveIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  };

  const handlePlayPause = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      // Pause
      handlePause();
    } else {
      // Play or Resume
      setIsPlaying(true);
      setIsPaused(false);

      let startIndex = 0;
      if (isPaused && activeIndex >= 0) {
        startIndex = activeIndex;
      }
      speakIndex(startIndex, timelineRef.current);
    }
  };

  const handlePause = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveIndex(-1);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phoneticString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const textBlob = new Blob([phoneticString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nato-phonetics.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const loadSample = () => {
    setText("MAYDAY 123");
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
                    Text to NATO Phonetic
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Education, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Convert text messages into the international NATO phonetic spelling (Alpha, Bravo, Charlie...) for clear verbal communication, with client-side audio pronunciation.
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

        {/* Main Workspaces Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="nato-input-text" className="text-xs font-bold text-foreground uppercase tracking-wider">
                  English Input Text
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadSample}
                    className="text-[10px] font-bold text-primary hover:underline px-2 py-1 bg-primary/5 rounded"
                  >
                    Load Sample
                  </button>
                  <span className="text-[10px] text-muted-foreground">
                    {text.length}/500 chars
                  </span>
                </div>
              </div>

              <textarea
                id="nato-input-text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                placeholder="Type word or sentence to spell phonetically..."
                rows={4}
                disabled={isPlaying}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* Playback settings controls */}
            <div className="space-y-4 pt-6 border-t border-border mt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Voice Configuration
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Browser Speech Synthesis
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Rate (Speed) Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <label htmlFor="nato-rate-slider">Reading Speed</label>
                    <span className="text-primary font-mono">{rate}x</span>
                  </div>
                  <input
                    id="nato-rate-slider"
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    disabled={isPlaying}
                    aria-label="Reading speed"
                    aria-valuetext={`${rate}x`}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    Speech rate multiplier
                  </span>
                </div>

                {/* Pitch Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <label htmlFor="nato-pitch-slider">Voice Pitch</label>
                    <span className="text-primary font-mono">{pitch}x</span>
                  </div>
                  <input
                    id="nato-pitch-slider"
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    disabled={isPlaying}
                    aria-label="Voice pitch"
                    aria-valuetext={`${pitch}x`}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    High or low voice modulation
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Output Panel */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  NATO Phonetic Output
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition"
                  >
                    {copied ? <CheckCircle2 size={12} className="text-primary" /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition"
                  >
                    {downloaded ? <CheckCircle2 size={12} className="text-primary" /> : <FileDown size={12} />}
                    {downloaded ? "Downloaded" : "Download"}
                  </button>
                </div>
              </div>

              <div className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 min-h-[96px] break-words whitespace-pre-wrap select-all">
                {phoneticString || <span className="text-muted-foreground italic">No translation output yet</span>}
              </div>
            </div>

            {/* Active Playback controls */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayPause}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                    isPlaying 
                      ? "bg-amber-500 text-white hover:bg-amber-600" 
                      : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={14} fill="currentColor" />
                      PAUSE SPELLING
                    </>
                  ) : (
                    <>
                      <Play size={14} fill="currentColor" />
                      {isPaused ? "RESUME SPELLING" : "LISTEN PHONETIC"}
                    </>
                  )}
                </button>

                {(isPlaying || isPaused) && (
                  <button
                    onClick={handleStop}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-bold text-xs hover:bg-destructive/20 transition"
                  >
                    <Square size={12} fill="currentColor" />
                    STOP
                  </button>
                )}
              </div>

              {/* Speech sound indicator indicator */}
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <span className="text-[10px] font-mono text-primary animate-pulse flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary inline-block"></span>
                    VOCALIZING NATO PHONETICS
                  </span>
                ) : isPaused ? (
                  <span className="text-[10px] font-mono text-amber-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                    PAUSED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/30 inline-block"></span>
                    IDLE
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Real-time word highlight sequence */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Acoustic Highlight Sequencer
          </label>
          <div className="w-full bg-surface-soft border border-border rounded-xl p-5 min-h-[140px] flex flex-wrap gap-x-2 gap-y-3 items-center content-start">
            {currentTimeline.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">Type input text to view sequential tiles...</span>
            ) : (
              currentTimeline.map((item, idx) => {
                const isSpace = item.char === " ";
                const isCharActive = activeIndex === idx;

                if (isSpace) {
                  return (
                    <div 
                      key={item.id} 
                      className={`h-14 w-6 border-b-2 transition duration-75 flex items-end justify-center pb-1 ${
                        isCharActive ? "border-primary bg-primary/5 animate-pulse" : "border-border"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">/</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`h-14 min-w-[56px] border rounded-lg px-2.5 flex flex-col justify-center items-center transition duration-150 relative ${
                      isCharActive 
                        ? "border-primary bg-primary/5 text-primary shadow-[0_0_12px_rgba(20,184,166,0.15)] scale-105 z-10 animate-pulse" 
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    <span className="text-sm font-black leading-none">{item.char}</span>
                    <span className="text-[9px] font-bold tracking-tight uppercase leading-none mt-1">
                      {item.isPhonetic ? item.word : item.char}
                    </span>
                    {item.isPhonetic && (
                      <span className="text-[8px] opacity-75 font-mono leading-none scale-90 mt-0.5">
                        {item.pronunciation}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tab Toggle for NATO Reference grid chart */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <button 
            onClick={() => setShowReference(!showReference)}
            className="w-full flex items-center justify-between p-5 font-bold text-sm text-foreground hover:bg-surface-soft transition"
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} className="text-primary" />
              NATO PHONETIC ALPHABET REFERENCE GUIDE
            </span>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
              {showReference ? "Hide chart" : "Show chart"}
            </span>
          </button>

          {showReference && (
            <div className="p-6 border-t border-border bg-surface-soft grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(NATO_PHONETIC_MAP).map(([char, details]) => (
                <div 
                  key={char} 
                  className="bg-card border border-border rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-lg bg-surface-soft border border-border flex items-center justify-center text-sm font-black text-primary">
                      {char}
                    </span>
                    <div className="leading-none">
                      <span className="text-xs font-bold text-foreground block">
                        {details.word}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {details.pronunciation}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                        const wordUtterance = new SpeechSynthesisUtterance(details.word);
                        wordUtterance.rate = rate;
                        window.speechSynthesis.speak(wordUtterance);
                      }
                    }}
                    disabled={isPlaying}
                    title={`Speak ${details.word}`}
                    aria-label={`Speak ${details.word}`}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-surface-soft rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                  >
                    <Volume1 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
