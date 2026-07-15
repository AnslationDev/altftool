"use client";

import { useState } from "react";
import { Sparkles, Search, RotateCcw } from "lucide-react";
import { generateTalent } from "../utils/talentLogic";
import Icon from "@/shared/ui/Icon";
import { Button } from "@altftool/ui";

export default function HiddenTalentFinder() {
  const [name, setName] = useState("");
  const [month, setMonth] = useState("1");
  const [result, setResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsAnimating(true);
    setResult(null);

    // Fake loading delay for suspense
    setTimeout(() => {
      setResult(generateTalent(name.trim(), month));
      setIsAnimating(false);
    }, 1500);
  };

  const handleReset = () => {
    setName("");
    setMonth("1");
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
          <Sparkles className="h-4 w-4" />
          Fun & Personality
        </div>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
          <Sparkles className="h-8 w-8 text-[var(--primary)]" />
        </div>
        <h1 className="tool-heading-accent text-3xl font-bold sm:text-5xl mb-4">
          Hidden Talent Finder
        </h1>
        <p className="text-[var(--muted-foreground)] text-lg">
          Everyone has a secret superpower. Enter your details to reveal yours!
        </p>
      </div>

      {!result && !isAnimating && (
        <form onSubmit={handleGenerate} className="bg-[var(--card)] p-6 sm:p-8 rounded-2xl shadow-sm border border-[var(--border)]">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Your First Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label htmlFor="month" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Birth Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full py-6 text-lg rounded-xl flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              Reveal My Talent
            </Button>
          </div>
        </form>
      )}

      {isAnimating && (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--muted)]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-[var(--primary)] animate-pulse" />
          </div>
          <p className="text-[var(--muted-foreground)] font-medium animate-pulse">
            Consulting the mystical talent oracle...
          </p>
        </div>
      )}

      {result && !isAnimating && (
        <div className="bg-[var(--card)] p-8 rounded-3xl shadow-lg border border-[var(--border)] text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-cyan-500 text-white shadow-xl">
            <Icon name={result.icon} className="h-10 w-10" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--primary)] mb-2">
            Your Hidden Talent Is
          </h2>
          <h3 className="text-3xl font-extrabold text-[var(--foreground)] mb-6">
            {result.title}
          </h3>
          <p className="text-lg text-[var(--muted-foreground)] leading-relaxed mb-8 px-4">
            {result.description}
          </p>
          
          <Button variant="outline" onClick={handleReset} className="rounded-xl px-8 flex items-center gap-2 mx-auto">
            <RotateCcw className="h-4 w-4" />
            Try Another Name
          </Button>
        </div>
      )}
    </div>
  );
}
