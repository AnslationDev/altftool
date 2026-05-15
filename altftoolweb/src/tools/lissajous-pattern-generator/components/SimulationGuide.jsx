import React from 'react';
import { BookOpen, BrainCircuit, Crosshair, Gauge, Orbit, Waves } from 'lucide-react';

const cards = [
  {
    icon: <BookOpen size={18} />,
    title: 'What is this generator?',
    body: 'It draws Lissajous curves, elegant mathematical patterns made by combining two perpendicular sine waves.',
  },
  {
    icon: <Waves size={18} />,
    title: 'How the pattern works',
    body: 'The X axis follows one frequency and the Y axis follows another. Their ratio and phase difference shape the curve.',
  },
  {
    icon: <Crosshair size={18} />,
    title: 'Oscilloscope idea',
    body: 'On an oscilloscope, two signals can be plotted against each other to reveal frequency ratios and phase offsets.',
  },
  {
    icon: <Orbit size={18} />,
    title: 'What to observe',
    body: 'Simple ratios create closed loops. Higher ratios create flowers, ribbons, knots, and dense woven curves.',
  },
  {
    icon: <Gauge size={18} />,
    title: 'What can you change?',
    body: 'Adjust frequencies, phase, amplitudes, rotation, decay, and sample count to design different curve families.',
  },
  {
    icon: <BrainCircuit size={18} />,
    title: 'Purpose of the tool',
    body: 'Use it to explore harmonic motion, visual math, signal relationships, and generative line art.',
  },
];

export default function SimulationGuide() {
  return (
    <section className="mt-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
        Pattern Guide
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
