import React from 'react';
import { Atom, BookOpen, BrainCircuit, Fingerprint, Target, Waves } from 'lucide-react';

const cards = [
  {
    icon: <BookOpen size={18} />,
    title: 'What is this simulation?',
    body: 'Reaction diffusion is a morphogenesis model where two virtual chemicals spread and react to form visible patterns.',
  },
  {
    icon: <Atom size={18} />,
    title: 'How this simulation works',
    body: 'The Gray-Scott model updates chemicals A and B. They diffuse to nearby cells, react with each other, and are fed or removed.',
  },
  {
    icon: <Fingerprint size={18} />,
    title: 'What does it demonstrate?',
    body: 'It demonstrates how zebra stripes, spots, maze-like textures, and organic edges can arise from local mathematical rules.',
  },
  {
    icon: <Target size={18} />,
    title: 'Purpose of the tool',
    body: 'Use it to explore biological pattern formation, procedural textures, and how small parameter changes reshape the final pattern.',
  },
  {
    icon: <Waves size={18} />,
    title: 'What can you change?',
    body: 'Feed, kill, and diffusion values control whether the pattern becomes stripes, spots, branching coral, or dense turbulence.',
  },
  {
    icon: <BrainCircuit size={18} />,
    title: 'How to experiment',
    body: 'Pick a preset, press Start, then drag on the canvas to inject chemical B and watch the pattern reorganize around your input.',
  },
];

export default function SimulationGuide() {
  return (
    <section className="mt-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        Simulation Guide
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="min-h-[160px] rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
              {card.icon}
            </div>
            <h4 className="mb-2 text-base font-semibold text-[var(--primary)]">
              {card.title}
            </h4>
            <p className="text-sm leading-6 text-[var(--secondary-foreground)]">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
