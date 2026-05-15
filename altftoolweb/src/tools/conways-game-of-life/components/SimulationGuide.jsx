import React from 'react';
import { Binary, BookOpen, BrainCircuit, MousePointer2, Sparkles, Target } from 'lucide-react';

const guideCards = [
  {
    icon: <BookOpen size={18} />,
    title: 'What is this simulation?',
    body: 'Conway’s Game of Life is a zero-player cellular automaton. You choose a starting pattern, then the grid evolves by itself.',
  },
  {
    icon: <Binary size={18} />,
    title: 'How this simulation works',
    body: 'Each cell checks its eight neighbors. Live cells survive with 2 or 3 neighbors, and dead cells become alive with exactly 3.',
  },
  {
    icon: <BrainCircuit size={18} />,
    title: 'What does it demonstrate?',
    body: 'It demonstrates emergence: simple local rules can create complex motion, stable shapes, repeating patterns, and chaos.',
  },
  {
    icon: <Target size={18} />,
    title: 'What is the purpose?',
    body: 'The purpose is exploration. Build patterns, step through time, and watch which structures survive, move, grow, or disappear.',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'What can you observe?',
    body: 'Look for common behaviors like still lifes, blinkers, gliders, overcrowding, extinction, and repeating cycles.',
  },
  {
    icon: <MousePointer2 size={18} />,
    title: 'How to use this tool',
    body: 'Click or drag on the canvas to draw cells, use Step to inspect one generation, or Start to let the simulation run.',
  },
];

export default function SimulationGuide() {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)] mb-4">
        Simulation Guide
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {guideCards.map((card) => (
          <article
            key={card.title}
            className="min-h-[160px] rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
              {card.icon}
            </div>
            <h4 className="text-base font-semibold text-[var(--primary)] mb-2">
              {card.title}
            </h4>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
