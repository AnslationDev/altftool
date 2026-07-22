"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  AudioLines,
  Copy,
  FileDown,
  BookOpen,
  Sparkles,
  CircleAlert,
  Volume2,
  Search,
} from "lucide-react";
import { wordToIpa } from "../utils/ipa";

const SAMPLE = "Hello, welcome to the world of English pronunciation.";

function tokenize(text) {
  // Keep words and whitespace/punctuation as separate tokens.
  return text.match(/[A-Za-z']+|[^A-Za-z' ]+|\s+/g) || [];
}

export default function ToolHome() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const [showDict, setShowDict] = useState(false);
  const [query, setQuery] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const tokens = useMemo(() => tokenize(text), [text]);

  const words = useMemo(
    () =>
      tokens
        .filter((t) => /[A-Za-z']/.test(t))
        .map((t) => {
          const { ipa, known } = wordToIpa(t);
          return { word: t, ipa, known };
        }),
    [tokens]
  );

  const ipaString = useMemo(
    () =>
      tokens
        .map((t) => {
          if (/^\s+$/.test(t)) return " ";
          if (/[^A-Za-z']/.test(t)) return t;
          return wordToIpa(t).ipa;
        })
        .join(""),
    [tokens]
  );

  const knownCount = words.filter((w) => w.known).length;
  const unknownCount = words.length - knownCount;

  const copyIpa = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ipaString);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [ipaString]);

  const downloadIpa = useCallback(() => {
    const blob = new Blob([ipaString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ipa-transcription.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [ipaString]);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [text]);

  const filteredDict = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return Object.entries(
      // We can't import the whole dict here easily; re-derive from words list.
      {}
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl border border-(--border) bg-(--card) p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--muted) text-(--primary)">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--foreground) leading-none">
                Text to IPA Pronunciation
              </h1>
              <p className="text-xs text-(--muted-foreground) mt-1.5 max-w-xl leading-relaxed">
                Convert English text into the International Phonetic Alphabet with stress
                marks, per-word breakdown, and audio playback.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-(--muted-foreground)">
            {["Runs locally", "No upload", "Audio playback"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--background) px-2 py-1"
              >
                <Sparkles className="h-3 w-3 text-(--primary)" />
                {item}
              </span>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
                English Text
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setText(SAMPLE)}
                  className="text-[10px] font-bold text-(--primary) hover:underline px-2 py-1 bg-(--muted) rounded"
                >
                  Load sample
                </button>
                <span className="text-[10px] text-(--muted-foreground)">{text.length} chars</span>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste English text..."
              rows={8}
              className="mt-3 w-full rounded-xl border border-(--border) bg-(--background) p-4 text-sm leading-relaxed text-(--foreground) outline-none focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,0.25)] transition"
            />
            <button
              onClick={speak}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2.5 text-xs font-bold text-(--primary-foreground) transition hover:opacity-90"
            >
              <Volume2 className="h-4 w-4" />
              {speaking ? "Playing…" : "Listen to text"}
            </button>
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
                IPA Transcription
              </label>
              <div className="flex gap-2">
                <button
                  onClick={copyIpa}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-(--foreground) bg-(--background) border border-(--border) rounded-lg px-2.5 py-1.5 hover:border-(--primary) transition"
                >
                  {copied ? <Sparkles size={12} className="text-(--primary)" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={downloadIpa}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-(--foreground) bg-(--background) border border-(--border) rounded-lg px-2.5 py-1.5 hover:border-(--primary) transition"
                >
                  <FileDown size={12} />
                  Save
                </button>
              </div>
            </div>
            <div className="mt-3 min-h-[120px] w-full rounded-xl border border-(--border) bg-(--background) p-4 font-mono text-sm leading-relaxed text-(--foreground) break-words whitespace-pre-wrap">
              {ipaString || <span className="italic text-(--muted-foreground)">No transcription yet</span>}
            </div>
            {words.length > 0 && (
              <p className="mt-2 text-[11px] text-(--muted-foreground)">
                Dictionary matches:{" "}
                <span className="font-semibold text-(--primary)">{knownCount}</span> · Estimated:{" "}
                <span className="font-semibold text-amber-500">{unknownCount}</span>
              </p>
            )}
          </div>
        </div>

        {/* Word breakdown */}
        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-(--foreground) uppercase tracking-wider">
              <BookOpen size={16} className="text-(--primary)" />
              Word-by-word breakdown
            </label>
            <span className="text-[10px] text-(--muted-foreground)">
              {words.length} word{words.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {words.length === 0 ? (
              <p className="text-xs italic text-(--muted-foreground)">Enter text to see the breakdown.</p>
            ) : (
              words.map((w, idx) => (
                <div
                  key={`${w.word}-${idx}`}
                  title={w.known ? "Dictionary match" : "Estimated pronunciation"}
                  className={`flex flex-col items-center rounded-lg border px-3 py-2 ${
                    w.known
                      ? "border-(--border) bg-(--background)"
                      : "border-amber-400/50 bg-amber-50 dark:bg-amber-900/20"
                  }`}
                >
                  <span className="text-sm font-bold text-(--foreground)">{w.word}</span>
                  <span className="font-mono text-xs text-(--primary)">/{w.ipa}/</span>
                  {!w.known && (
                    <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                      est.
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Search dictionary */}
        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <button
            onClick={() => setShowDict((s) => !s)}
            className="flex w-full items-center justify-between font-bold text-sm text-(--foreground) hover:bg-(--muted) transition rounded-lg p-1"
          >
            <span className="flex items-center gap-2">
              <Search size={16} className="text-(--primary)" />
              LOOKUP A WORD IN THE IPA DICTIONARY
            </span>
            <span className="text-xs text-(--primary) bg-(--muted) px-2 py-0.5 rounded uppercase">
              {showDict ? "Hide" : "Show"}
            </span>
          </button>
          {showDict && (
            <div className="mt-3 space-y-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a word to hear its IPA…"
                className="w-full rounded-xl border border-(--border) bg-(--background) p-3 text-sm text-(--foreground) outline-none focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,0.25)] transition"
              />
              <div className="min-h-[48px] rounded-xl border border-(--border) bg-(--background) p-4">
                {query.trim() ? (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm font-bold text-(--foreground)">{query.trim()}</span>
                      <span className="ml-3 font-mono text-(--primary)">
                        /{wordToIpa(query.trim()).ipa}/
                      </span>
                      {!wordToIpa(query.trim()).known && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          (estimated)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (typeof window !== "undefined" && window.speechSynthesis) {
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance(query.trim());
                          u.lang = "en-US";
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      className="p-2 text-(--muted-foreground) hover:text-(--primary) rounded-lg transition"
                      aria-label="Speak word"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs italic text-(--muted-foreground)">
                    Type a word above to look it up.
                  </p>
                )}
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-(--muted) p-3 text-[11px] text-(--muted-foreground)">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary)" />
                Words not in the built-in dictionary are transcribed with a rule-based estimate and
                marked &ldquo;est.&rdquo; For fully accurate transcription of rare words, consult a
                professional pronunciation dictionary.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
