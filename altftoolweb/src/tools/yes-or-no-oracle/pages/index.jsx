"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, HelpCircle, RefreshCw, History, Copy } from "lucide-react";

const ANSWERS = {
  yes: [
    "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.",
    "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
    "Yes.", "Signs point to yes.",
  ],
  no: [
    "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.",
    "Very doubtful.", "No.", "Absolutely not.", "Not in this lifetime.",
    "The stars say no.", "I wouldn't bet on it.",
  ],
  maybe: [
    "Reply hazy, try again.", "Ask again later.", "Better not tell you now.",
    "Cannot predict now.", "Concentrate and ask again.",
    "The universe is undecided.", "Ask again when the moon is full.",
    "Maybe yes, maybe no.", "The spirits are conflicted.", "Time will tell.",
  ],
};

const COSMIC_QUOTES = [
  "The oracle speaks in whispers...",
  "Ancient wisdom reveals itself...",
  "The cosmic energies align...",
  "Mystical forces are at work...",
  "The veil between worlds lifts...",
];

export default function ToolHome() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const askOracle = useCallback(() => {
    if (!question.trim()) return;
    setIsRevealing(true);
    setAnswer(null);

    const random = Math.random();
    let type;
    if (random < 0.45) type = "yes";
    else if (random < 0.85) type = "no";
    else type = "maybe";

    const text = ANSWERS[type][Math.floor(Math.random() * ANSWERS[type].length)];

    setTimeout(() => {
      const result = { question: question.trim(), answer: text, type, timestamp: new Date().toLocaleTimeString() };
      setAnswer(result);
      setHistory((prev) => [result, ...prev].slice(0, 20));
      setIsRevealing(false);
    }, 2000);
  }, [question]);

  const clearAll = () => {
    setQuestion("");
    setAnswer(null);
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Sparkles className="h-4 w-4" /> Mystical Divination
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Yes or No Oracle</h1>
          <p className="mt-2 text-(--muted-foreground)">Ask a question and let the ancient oracle guide you</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-(--foreground)">Your Question</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a yes or no question..." rows={3} className="w-full resize-none rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
          </div>

          <div className="flex gap-3">
            <button onClick={askOracle} disabled={!question.trim() || isRevealing} className="flex-1 inline-flex items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
              <Sparkles className="h-5 w-5" /> {isRevealing ? "Consulting the Cosmos..." : "Ask the Oracle"}
            </button>
            <button onClick={() => setShowHistory(!showHistory)} className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--muted-foreground) transition-all hover:border-(--primary)">
              <History className="h-4 w-4" /> History
            </button>
          </div>
        </div>

        {isRevealing && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 h-20 w-20 animate-pulse rounded-full" style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }} />
            <p className="text-lg font-semibold text-(--primary) animate-pulse">{COSMIC_QUOTES[Math.floor(Math.random() * COSMIC_QUOTES.length)]}</p>
          </div>
        )}

        {answer && !isRevealing && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`overflow-hidden rounded-2xl border-2 shadow-lg ${
              answer.type === "yes" ? "border-green-500" : answer.type === "no" ? "border-red-500" : "border-amber-500"
            } bg-(--card)`}>
              <div className={`p-8 text-center ${
                answer.type === "yes" ? "bg-green-500/10" : answer.type === "no" ? "bg-red-500/10" : "bg-amber-500/10"
              }`}>
                <div className={`mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
                  answer.type === "yes" ? "bg-green-500 text-white" : answer.type === "no" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                }`}>
                  {answer.type === "yes" ? "✓" : answer.type === "no" ? "✗" : "~"}
                </div>
                <p className="text-sm text-(--muted-foreground)">"{answer.question}"</p>
                <p className="mt-4 text-2xl font-bold text-(--foreground)">{answer.answer}</p>
              </div>
              <div className="flex items-center justify-between px-6 py-3 text-xs text-(--muted-foreground) border-t border-(--border)">
                <span>{answer.timestamp}</span>
              </div>
            </div>
          </div>
        )}

        {showHistory && history.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">Question History</h3>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className={`rounded-xl border-l-4 p-4 ${
                  h.type === "yes" ? "border-l-green-500" : h.type === "no" ? "border-l-red-500" : "border-l-amber-500"
                } bg-(--muted)`}>
                  <p className="text-sm font-medium text-(--foreground)">"{h.question}"</p>
                  <p className={`mt-1 text-sm font-semibold ${
                    h.type === "yes" ? "text-green-600" : h.type === "no" ? "text-red-600" : "text-amber-600"
                  }`}>{h.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
