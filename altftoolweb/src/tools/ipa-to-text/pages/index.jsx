"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  AudioLines,
  Copy,
  BookOpen,
  Sparkles,
  CircleAlert,
  Volume2,
  Search,
} from "lucide-react";
import { ipaToWords, isLikelyIpa } from "../utils/ipaReverse";

const SAMPLE = "hɛloʊ";

export default function ToolHome() {
  const [ipa, setIpa] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const [showRef, setShowRef] = useState(false);

  const validation = useMemo(() => {
    const trimmed = ipa.trim();
    if (!trimmed) return { empty: true, likely: false, valid: true };
    return {
      empty: false,
      likely: isLikelyIpa(trimmed),
      valid: true,
    };
  }, [ipa]);

  const result = useMemo(() => ipaToWords(ipa), [ipa]);

  const copyWords = useCallback(async () => {
    if (!result.words.length) return;
    try {
      await navigator.clipboard.writeText(result.words.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [result.words]);

  const speak = useCallback((word) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }, []);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border border-(--border) bg-(--card) p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--muted) text-(--primary)">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-(--foreground) leading-none">
                IPA to Text Helper
              </h1>
              <p className="text-xs text-(--muted-foreground) mt-1.5 max-w-xl leading-relaxed">
                Paste IPA notation and discover the most likely English word(s), with multiple
                candidate suggestions and validation for malformed input.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-(--muted-foreground)">
            {["Runs locally", "No upload", "Multi-candidate"].map((item) => (
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
                IPA Input
              </label>
              <button
                onClick={() => setIpa(SAMPLE)}
                className="text-[10px] font-bold text-(--primary) hover:underline px-2 py-1 bg-(--muted) rounded"
              >
                Load sample
              </button>
            </div>
            <textarea
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              placeholder="Paste IPA, e.g. hɛloʊ"
              rows={6}
              className="mt-3 w-full rounded-xl border border-(--border) bg-(--background) p-4 font-mono text-sm leading-relaxed text-(--foreground) outline-none focus:border-(--primary) focus:shadow-[0_0_0_3px_rgba(20,184,166,0.25)] transition"
            />
            {!validation.empty && !validation.likely && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-50 dark:bg-red-900/20 p-3 text-[11px] text-red-700 dark:text-red-300">
                <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                This does not look like IPA — most characters are not valid phonetic symbols.
                Check your input (strip stray letters or spaces).
              </div>
            )}
          </div>

          {/* Output */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
                Likely English Word(s)
              </label>
              <button
                onClick={copyWords}
                disabled={!result.words.length}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-(--foreground) bg-(--background) border border-(--border) rounded-lg px-2.5 py-1.5 hover:border-(--primary) transition disabled:opacity-40"
              >
                {copied ? <Sparkles size={12} className="text-(--primary)" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-3 min-h-[120px] w-full rounded-xl border border-(--border) bg-(--background) p-4">
              {result.words.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {result.words.map((w, idx) => (
                    <div
                      key={w}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                        idx === 0
                          ? "border-(--primary) bg-(--muted)"
                          : "border-(--border) bg-(--card)"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-(--muted-foreground)">
                          {idx === 0 ? "Best" : `#${idx + 1}`}
                        </span>
                        <span className="text-sm font-bold text-(--foreground)">{w}</span>
                      </div>
                      <button
                        onClick={() => speak(w)}
                        className="p-2 text-(--muted-foreground) hover:text-(--primary) rounded-lg transition"
                        aria-label={`Speak ${w}`}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-(--muted-foreground)">
                  No matching word in the built-in IPA dictionary. Try a common word, or check the
                  symbols are valid IPA.
                </p>
              )}
            </div>
            {result.words.length > 0 && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-(--muted) p-3 text-[11px] text-(--muted-foreground)">
                <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--primary)" />
                Multiple candidates are ordered by frequency. The first is the most likely match.
              </div>
            )}
          </div>
        </div>

        {/* Reference */}
        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
          <button
            onClick={() => setShowRef((s) => !s)}
            className="flex w-full items-center justify-between font-bold text-sm text-(--foreground) hover:bg-(--muted) transition rounded-lg p-1"
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} className="text-(--primary)" />
              IPA SYMBOL REFERENCE
            </span>
            <span className="text-xs text-(--primary) bg-(--muted) px-2 py-0.5 rounded uppercase">
              {showRef ? "Hide" : "Show"}
            </span>
          </button>
          {showRef && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {[
                ["Vowels", "i ɪ e ɛ æ ə ʌ ɑ ɔ o ʊ u ɜ"],
                ["Diphthongs", "aɪ aʊ ɔɪ eɪ oʊ"],
                ["Plosives", "p b t d k g"],
                ["Fricatives", "f v θ ð s z ʃ ʒ h"],
                ["Affricates", "tʃ dʒ"],
                ["Nasals", "m n ŋ"],
                ["Approx.", "l r w j"],
                ["Stress", "ˈ primary  ˌ secondary"],
              ].map(([label, syms]) => (
                <div key={label} className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <p className="font-semibold text-(--foreground)">{label}</p>
                  <p className="mt-1 font-mono text-(--primary) break-words">{syms}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
