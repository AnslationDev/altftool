"use client";

import React, { useState, useEffect } from "react";
import { BookCheck, BarChart3, Type, AlertCircle, Award } from "lucide-react";

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  let count = 0;
  const vowels = "aeiou";
  let prevVowel = false;
  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (word.endsWith("e")) count--;
  if (word.endsWith("le") && word.length > 2) count++;
  if (word.endsWith("es") || word.endsWith("ed")) count--;
  return Math.max(1, count);
}

function analyzeReadability(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const chars = text.replace(/\s/g, "").length;
  const letters = text.replace(/[^a-zA-Z]/g, "").length;
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;
  const avgCharsPerWord = chars / wordCount;
  const percentComplex = (complexWords / wordCount) * 100;

  const fleschKincaid = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  const fleschGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  const gunningFog = 0.4 * (avgWordsPerSentence + percentComplex);
  const colemanLiau = 0.0588 * (letters / wordCount * 100) - 0.296 * (sentences.length / wordCount * 100) - 15.8;
  const smog = 1.043 * Math.sqrt(complexWords * (30 / sentenceCount) + 3.1291) || 0;

  const clampedFK = Math.max(0, Math.min(100, fleschKincaid));

  let difficulty, color;
  if (clampedFK >= 90) { difficulty = "Very Easy"; color = "text-green-500"; }
  else if (clampedFK >= 70) { difficulty = "Easy"; color = "text-teal-500"; }
  else if (clampedFK >= 50) { difficulty = "Fairly Easy"; color = "text-amber-500"; }
  else if (clampedFK >= 30) { difficulty = "Standard"; color = "text-orange-500"; }
  else if (clampedFK >= 10) { difficulty = "Fairly Difficult"; color = "text-red-400"; }
  else { difficulty = "Very Confusing"; color = "text-red-600"; }

  return {
    wordCount, sentenceCount, syllableCount, chars, complexWords,
    fleschKincaid: clampedFK,
    fleschGrade: Math.max(1, fleschGrade),
    gunningFog: Math.max(1, gunningFog),
    colemanLiau: Math.max(1, colemanLiau),
    smog: Math.max(1, smog),
    difficulty, color,
  };
}

export default function ToolHome() {
  const [input, setInput] = useState("The quick brown fox jumps over the lazy dog. This simple sentence contains every letter of the alphabet.");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!input.trim()) {
      setAnalysis(null);
      return;
    }
    setAnalysis(analyzeReadability(input));
  }, [input]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <BookCheck className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Readability Checker</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Text, Education</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Analyze text readability with Flesch-Kincaid, Gunning Fog, SMOG, and Coleman-Liau scores.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Type size={14} className="text-primary" />
                Your Text
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste or type your text here..."
                rows={8}
                className="w-full bg-surface-soft border border-border rounded-xl text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {analysis && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-primary" />
                  Text Statistics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Words", value: analysis.wordCount },
                    { label: "Sentences", value: analysis.sentenceCount },
                    { label: "Syllables", value: analysis.syllableCount },
                    { label: "Characters", value: analysis.chars },
                    { label: "Complex Words", value: analysis.complexWords },
                    { label: "Avg Words/Sentence", value: (analysis.wordCount / analysis.sentenceCount).toFixed(1) },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface-soft rounded-xl p-3 border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">{s.label}</div>
                      <div className="text-lg font-black text-foreground">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {analysis ? (
              <>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-surface-soft mb-4">
                    <Award size={40} className={`${analysis.color} mb-2`} />
                    <div className={`text-lg font-black ${analysis.color}`}>{analysis.difficulty}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">Flesch-Kincaid: {analysis.fleschKincaid.toFixed(1)}/100</p>
                  </div>

                  <div className="w-full bg-surface-soft rounded-full h-3 border border-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${analysis.fleschKincaid}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>Confusing (0)</span>
                    <span>Very Easy (100)</span>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Readability Scores</h2>
                  {[
                    { label: "Flesch-Kincaid Grade", value: analysis.fleschGrade.toFixed(1), desc: "US grade level" },
                    { label: "Gunning Fog Index", value: analysis.gunningFog.toFixed(1), desc: "Years of education needed" },
                    { label: "Coleman-Liau Index", value: analysis.colemanLiau.toFixed(1), desc: "US grade level" },
                    { label: "SMOG Index", value: analysis.smog.toFixed(1), desc: "Years of education needed" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between px-4 py-3 bg-surface-soft rounded-xl border border-border">
                      <div>
                        <div className="text-xs font-bold text-foreground">{s.label}</div>
                        <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                      </div>
                      <span className="text-lg font-black text-primary">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <AlertCircle size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground">Enter text to see readability analysis.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
