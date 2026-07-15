"use client";

import { useState } from "react";
import { Zap, Shield, RotateCcw } from "lucide-react";
import { generatePower } from "../utils/powerLogic";
import Icon from "@/shared/ui/Icon";
import { Button } from "@altftool/ui";

const colors = [
  { name: "Red", value: "red", bg: "bg-red-500" },
  { name: "Blue", value: "blue", bg: "bg-blue-500" },
  { name: "Green", value: "green", bg: "bg-green-500" },
  { name: "Yellow", value: "yellow", bg: "bg-yellow-500" },
  { name: "Purple", value: "purple", bg: "bg-purple-500" },
  { name: "Black", value: "black", bg: "bg-zinc-800" },
];

export default function SuperpowerGenerator() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("red");
  const [result, setResult] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsAnimating(true);
    setResult(null);

    setTimeout(() => {
      setResult(generatePower(name.trim(), color));
      setIsAnimating(false);
    }, 1200);
  };

  const handleReset = () => {
    setName("");
    setColor("red");
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
          <Zap className="h-4 w-4" />
          Superhero Persona
        </div>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] shadow-sm">
          <Zap className="h-8 w-8 text-[var(--primary)]" />
        </div>
        <h1 className="tool-heading-accent text-3xl font-bold sm:text-5xl mb-4">
          Superpower Generator
        </h1>
        <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
          Unleash your inner hero (or villain). Enter your details to generate your unique superpower, weakness, and origin story!
        </p>
      </div>

      {!result && !isAnimating && (
        <form onSubmit={handleGenerate} className="bg-[var(--card)] p-6 sm:p-8 rounded-2xl shadow-sm border border-[var(--border)] max-w-xl mx-auto">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Superhero Alter-Ego Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Clark Kent"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                Choose Your Suit Color
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`relative h-12 rounded-xl transition-all ${c.bg} ${
                      color === c.value
                        ? "ring-4 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background)] scale-110 shadow-lg"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    title={c.name}
                    aria-label={`Select ${c.name} suit color`}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full py-6 text-lg rounded-xl mt-4 flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 fill-current" />
              Generate My Superpower
            </Button>
          </div>
        </form>
      )}

      {isAnimating && (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <Zap className="h-12 w-12 text-[var(--primary)] animate-ping absolute" />
            <Shield className="h-16 w-16 text-[var(--primary)] relative z-10 animate-pulse" />
          </div>
          <p className="text-[var(--primary)] font-bold tracking-widest uppercase animate-pulse">
            Mutating DNA...
          </p>
        </div>
      )}

      {result && !isAnimating && (
        <div className="bg-[var(--card)] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden animate-in zoom-in duration-500">
          <div className="bg-gradient-to-r from-[var(--primary)] to-cyan-500 p-8 text-center text-white relative overflow-hidden">
            <Zap className="absolute -right-4 -top-4 h-32 w-32 opacity-20 fill-white rotate-12" />
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <Icon name={result.icon} className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/80 mb-2">
              Primary Power
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-2">
              {result.name}
            </h3>
            <p className="text-white/90 text-lg max-w-xl mx-auto font-medium">
              "{result.description}"
            </p>
          </div>

          <div className="p-8 grid gap-6 sm:grid-cols-2">
            <div className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon name="skull" className="h-16 w-16" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-2">
                Kryptonite (Weakness)
              </h4>
              <p className="text-[var(--foreground)] font-medium leading-relaxed">
                {result.weakness}
              </p>
            </div>

            <div className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon name="book-open" className="h-16 w-16" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-2">
                Origin Story
              </h4>
              <p className="text-[var(--foreground)] font-medium leading-relaxed">
                {result.origin}
              </p>
            </div>
          </div>
          
          <div className="p-8 pt-0 border-t border-[var(--border)] mt-4">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto rounded-xl px-8 mt-6 flex items-center justify-center gap-2 mx-auto">
              <RotateCcw className="h-4 w-4" />
              Generate Another Hero
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
