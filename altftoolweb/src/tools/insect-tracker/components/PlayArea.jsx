"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Insect from "./Insect";
import ParticleBurst from "./ParticleBurst";

// Deterministic decorative element positions (no Math.random at render).
const LEAVES = [
  { id: 0, left: "8%", delay: 0, dur: 13, size: 16, hue: "#4ade80" },
  { id: 1, left: "24%", delay: 3, dur: 16, size: 12, hue: "#22c55e" },
  { id: 2, left: "47%", delay: 6, dur: 11, size: 18, hue: "#86efac" },
  { id: 3, left: "68%", delay: 2, dur: 15, size: 14, hue: "#4ade80" },
  { id: 4, left: "85%", delay: 8, dur: 12, size: 13, hue: "#16a34a" },
];

const FLOWERS = [
  { id: 0, left: "6%", color: "#f472b6" },
  { id: 1, left: "22%", color: "#fbbf24" },
  { id: 2, left: "40%", color: "#a78bfa" },
  { id: 3, left: "58%", color: "#f472b6" },
  { id: 4, left: "76%", color: "#fb7185" },
  { id: 5, left: "92%", color: "#fbbf24" },
];

// The play field. Measures itself (ResizeObserver) and reports size to the
// engine so insect coordinates stay inside the visible area.
export default function PlayArea({
  insects,
  bursts,
  levelFlash,
  onCatch,
  registerNode,
  reportBounds,
  removeBurst,
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      reportBounds(r.width, r.height);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [reportBounds]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] shadow-[var(--anslation-ds-shadow-md)]"
      style={{ height: "min(62vh, 520px)" }}
    >
      {/* sky-to-meadow gradient scene */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--secondary)]/10 via-[var(--card)] to-[var(--primary)]/10" />
      {/* soft sun-ray glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#fde68a]/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 -top-10 h-40 w-40 rounded-full bg-[var(--secondary)]/15 blur-2xl" />

      {/* drifting leaves */}
      {!reduce &&
        LEAVES.map((l) => (
          <motion.span
            key={l.id}
            aria-hidden="true"
            className="pointer-events-none absolute -top-6 rounded-[60%_10%_60%_10%]"
            style={{ left: l.left, width: l.size, height: l.size, background: l.hue, opacity: 0.5 }}
            animate={{ y: ["-8%", "115%"], x: [0, 14, -8, 0], rotate: [0, 180, 360] }}
            transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}

      {/* grass + flowers at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/25 to-transparent" />
        <svg className="absolute bottom-0 h-10 w-full" preserveAspectRatio="none" viewBox="0 0 100 20" aria-hidden="true">
          <path d="M0 20 Q3 6 6 20 Q9 4 12 20 Q15 8 18 20 Q21 5 24 20 Q27 7 30 20 Q33 3 36 20 Q39 8 42 20 Q45 5 48 20 Q51 7 54 20 Q57 4 60 20 Q63 8 66 20 Q69 5 72 20 Q75 7 78 20 Q81 4 84 20 Q87 8 90 20 Q93 5 96 20 Q99 7 100 20 Z" fill="var(--primary)" opacity="0.35" />
        </svg>
        {FLOWERS.map((f) => (
          <span
            key={f.id}
            aria-hidden="true"
            className="absolute bottom-2 h-2.5 w-2.5 rounded-full"
            style={{ left: f.left, background: f.color, boxShadow: `0 0 6px ${f.color}` }}
          />
        ))}
      </div>

      {insects.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-[var(--muted-foreground)]">
          <Sparkles className="h-4 w-4 animate-pulse text-[var(--primary)]" /> Insects are coming…
        </div>
      )}

      {insects.map((i) => (
        <Insect
          key={i.id}
          id={i.id}
          typeKey={i.type}
          size={i.size}
          color={i.color}
          points={i.points}
          name={i.name}
          initialX={i.x}
          initialY={i.y}
          initialRot={i.rot}
          caught={i.caught}
          onCatch={onCatch}
          registerNode={registerNode}
        />
      ))}

      {bursts.map((b) => (
        <ParticleBurst key={b.id} x={b.x} y={b.y} color={b.color} onDone={() => removeBurst(b.id)} />
      ))}

      {/* level-up banner */}
      <AnimatePresence>
        {levelFlash > 0 && <LevelBanner key={levelFlash} value={levelFlash} />}
      </AnimatePresence>
    </div>
  );
}

function LevelBanner({ value }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-6 z-30 flex justify-center"
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-2 rounded-full border border-[var(--primary)]/40 bg-[var(--primary)]/15 px-6 py-2.5 text-sm font-bold text-[var(--primary)] shadow-[var(--anslation-ds-shadow-md)] backdrop-blur-md">
        <motion.span
          animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <Sparkles className="h-4 w-4" />
        </motion.span>
        LEVEL UP · {value}
      </div>
    </motion.div>
  );
}
