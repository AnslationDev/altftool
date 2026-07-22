"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Play,
  RotateCcw,
} from "lucide-react";
import { CATEGORIES, PRONUNCIATION_DATA } from "../constants/data";

export default function PronunciationPracticePage() {
  const [category, setCategory] = useState("Commonly Mispronounced");
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | speaking | listening | correct | incorrect
  const [feedback, setFeedback] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);

  // References for Web Speech API
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Filter items when category changes
  useEffect(() => {
    const filtered = PRONUNCIATION_DATA.filter((item) => item.category === category);
    setItems(filtered);
    setCurrentIndex(0);
    setStatus("idle");
    setFeedback("");
  }, [category]);

  // Initialize Speech APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Setup Synthesis
      synthRef.current = window.speechSynthesis;

      // Setup Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setStatus("listening");
          setFeedback("Listening...");
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript.trim().toLowerCase();
          const target = items[currentIndex]?.text.toLowerCase().replace(/[^\w\s]/gi, '');
          const cleanTranscript = transcript.replace(/[^\w\s]/gi, '');

          if (cleanTranscript.includes(target) || target.includes(cleanTranscript)) {
            setStatus("correct");
            setFeedback(`You said: "${transcript}". Great job!`);
          } else {
            setStatus("incorrect");
            setFeedback(`You said: "${transcript}". Try again.`);
          }
        };

        recognition.onerror = (event) => {
          setStatus("idle");
          setFeedback(`Error: ${event.error}. Please try again.`);
        };

        recognition.onend = () => {
          // If status is still listening, it means it didn't catch anything or errored
          setStatus((prev) => (prev === "listening" ? "idle" : prev));
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, [items, currentIndex]);

  const currentItem = items[currentIndex];

  const handlePlayAudio = () => {
    if (!synthRef.current || !currentItem) return;

    // Stop any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(currentItem.text);
    utterance.lang = "en-US";
    utterance.rate = 0.9; // Slightly slower for clarity

    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");

    synthRef.current.speak(utterance);
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) return;

    // Stop any ongoing speech synth to avoid it hearing itself
    if (synthRef.current) synthRef.current.cancel();

    try {
      recognitionRef.current.start();
    } catch (e) {
      // If it's already started
      recognitionRef.current.stop();
      setTimeout(() => recognitionRef.current.start(), 100);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setStatus("idle");
      setFeedback("");
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setStatus("idle");
      setFeedback("");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2">
            <Mic className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--primary)]">Voice Tool</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Pronunciation Practice
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-[var(--muted-foreground)]">
            Master tricky English words and phrases. Listen to the correct pronunciation and test yourself using your microphone.
          </p>
        </div>

        {!speechSupported && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-600">Speech Recognition Not Supported</h3>
              <p className="text-xs text-rose-600/80 mt-1">
                Your browser does not support the Web Speech API. You can still listen to the pronunciations, but microphone grading will not work. We recommend using Google Chrome.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Sidebar / Categories */}
          <div className="md:col-span-1 space-y-2">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Categories</h3>
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full text-left rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                  category === cat
                    ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm"
                    : "border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main Workspace */}
          <div className="md:col-span-3">
            {currentItem && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">

                {/* Progress */}
                <div className="absolute top-4 left-4 text-xs font-bold text-[var(--muted-foreground)]">
                  {currentIndex + 1} / {items.length}
                </div>

                <div className="mb-8 mt-4">
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
                    {currentItem.text}
                  </h2>
                  {currentItem.phonetics && (
                    <p className="text-lg font-mono text-[var(--primary)] opacity-80">
                      {currentItem.phonetics}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <button
                    onClick={handlePlayAudio}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold transition-all ${
                      status === "speaking"
                        ? "bg-[var(--primary)] text-white animate-pulse shadow-md"
                        : "bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20"
                    }`}
                  >
                    {status === "speaking" ? <Volume2 className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    Listen
                  </button>

                  <button
                    onClick={handleStartListening}
                    disabled={!speechSupported || status === "speaking"}
                    className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold transition-all ${
                      status === "listening"
                        ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20"
                        : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Mic className="h-5 w-5" />
                    {status === "listening" ? "Listening..." : "Speak"}
                  </button>
                </div>

                {/* Feedback Area */}
                <div className={`rounded-xl border p-4 min-h-[80px] flex flex-col items-center justify-center transition-colors ${
                  status === "correct" ? "border-emerald-500/30 bg-emerald-500/10" :
                  status === "incorrect" ? "border-amber-500/30 bg-amber-500/10" :
                  status === "listening" ? "border-rose-500/30 bg-rose-500/5" :
                  "border-[var(--border)] bg-[var(--muted)]/20"
                }`}>
                  {status === "correct" ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
                      <p className="text-sm font-bold text-emerald-600">{feedback}</p>
                    </>
                  ) : status === "incorrect" ? (
                    <>
                      <XCircle className="h-6 w-6 text-amber-500 mb-1" />
                      <p className="text-sm font-bold text-amber-600">{feedback}</p>
                    </>
                  ) : status === "listening" ? (
                    <p className="text-sm font-medium text-rose-500 italic animate-pulse">
                      Speak clearly into your microphone...
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-[var(--muted-foreground)]">
                      {feedback || "Click 'Speak' and say the word out loud."}
                    </p>
                  )}
                </div>

                {currentItem.hint && (
                  <div className="mt-6 text-left border-t border-[var(--border)] pt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-1">
                      Pronunciation Hint
                    </p>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {currentItem.hint}
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-1 text-sm font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === items.length - 1}
                    className="flex items-center gap-1 rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm font-bold text-[var(--background)] hover:opacity-90 disabled:opacity-30 transition-opacity"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
