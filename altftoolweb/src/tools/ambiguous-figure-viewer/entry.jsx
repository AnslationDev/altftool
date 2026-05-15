// src/tools/ambiguous-figure-viewer/entry.jsx
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Eye, Layers, Search, Sparkles } from "lucide-react";

import {
  AmbientBackground,
  IllusionCard,
  IllusionViewer,
  ScientificEducation,
} from "./components.jsx";
import { ILLUSIONS } from "./utils.js";
import "./styles.css";

export default function AmbiguousFigureViewer() {
  const [selectedIllusion, setSelectedIllusion] = useState(null);
  const [filter, setFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(ILLUSIONS.map((illusion) => illusion.difficulty))],
    []
  );

  const filteredIllusions = useMemo(
    () => ILLUSIONS.filter((illusion) => filter === "All" || illusion.difficulty === filter),
    [filter]
  );

  const stats = useMemo(() => {
    const perceptionTypes = new Set(ILLUSIONS.map((illusion) => illusion.perceptionType));
    return [
      { label: "Figures", value: ILLUSIONS.length, icon: Eye },
      { label: "Perception Modes", value: perceptionTypes.size, icon: Brain },
      { label: "Difficulties", value: categories.length - 1, icon: Layers },
    ];
  }, [categories.length]);

  return (
    <div className="ambiguous-figure-viewer relative min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <AmbientBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10 lg:gap-10">
        <section className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 md:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-w-0 space-y-5 text-center lg:text-left"
            >
              <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--primary)] lg:mx-0">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                Perception Lab
              </div>

              <div className="space-y-3">
                <h1 className="tool-heading-accent text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Ambiguous Figure Viewer
                </h1>
                <p className="mx-auto max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base lg:mx-0">
                  Explore bistable optical illusions where one image can flip between two meanings. Open any card, try the hints, and track how fast your brain switches.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-left"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-black text-[var(--foreground)]">{value}</p>
                    <p className="mt-1 break-words text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 }}
              className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:min-h-[320px]">
                <div className="ambiguous-hero-figure absolute inset-4" />
                <div className="absolute left-4 top-4 rounded-full border border-[var(--border)] bg-[var(--background)]/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted-foreground)] backdrop-blur">
                  Look Twice
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 p-4 backdrop-blur">
                  <p className="text-sm font-bold text-[var(--foreground)]">Same picture. Different answer.</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    Your perception may switch even though the visual input stays unchanged.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 items-center gap-3 px-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Search className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[var(--foreground)]">Choose difficulty</p>
              <p className="truncate text-xs text-[var(--muted-foreground)]">
                Showing {filteredIllusions.length} of {ILLUSIONS.length} figures
              </p>
            </div>
          </div>

          <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:overflow-visible sm:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  filter === category
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredIllusions.map((illusion) => (
              <IllusionCard
                key={illusion.id}
                illusion={illusion}
                onClick={setSelectedIllusion}
              />
            ))}
          </AnimatePresence>
        </main>

        <section className="space-y-5 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary)]">
                Scientific Foundation
              </p>
              <h2 className="mt-2 text-2xl font-black text-[var(--foreground)] sm:text-3xl">
                Why your brain flips the image
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
              Ambiguous figures are useful because the image is stable, but the interpretation changes inside perception.
            </p>
          </div>
          <ScientificEducation />
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] py-6 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] sm:flex-row sm:text-left">
          <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
            <span>Bistable Dynamics</span>
            <span>Gestalt Theory</span>
            <span>Neural Adaptation</span>
          </div>
          <div className="flex items-center gap-2">
            Perception Lab v1.0 <Sparkles size={12} />
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {selectedIllusion && (
          <IllusionViewer
            illusion={selectedIllusion}
            onClose={() => setSelectedIllusion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
