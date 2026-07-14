"use client";

import { motion } from "framer-motion";

// A short particle burst shown where an insect is caught/escapes.
// Deterministic geometry (pure — no Math.random at render) so the component
// stays idempotent across re-renders.
const COUNT = 12;
const PARTS = Array.from({ length: COUNT }, (_, i) => {
  const a = (Math.PI * 2 * i) / COUNT;
  const d = 20 + ((i * 37) % 26);
  const star = i % 2 === 0;
  return {
    id: i,
    dx: Math.cos(a) * d,
    dy: Math.sin(a) * d,
    star,
    size: star ? 8 : 6,
    delay: (i % 4) * 0.02,
  };
});

export default function ParticleBurst({ x, y, color, onDone }) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-20"
      style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
    >
      {/* central flash ring */}
      <motion.span
        className="absolute block rounded-full"
        style={{ width: 18, height: 18, left: -9, top: -9, border: `2px solid ${color}` }}
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.span
        className="absolute block rounded-full bg-white"
        style={{ width: 14, height: 14, left: -7, top: -7 }}
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: 1.7, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      {PARTS.map((p, idx) => (
        <motion.span
          key={p.id}
          className="absolute block"
          style={{
            width: p.size,
            height: p.size,
            left: -p.size / 2,
            top: -p.size / 2,
            background: p.star ? "#ffffff" : color,
            borderRadius: p.star ? 2 : 999,
            boxShadow: `0 0 6px ${color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.2, rotate: p.star ? 180 : 0 }}
          transition={{ duration: 0.62, ease: "easeOut", delay: p.delay }}
          onAnimationComplete={idx === 0 ? onDone : undefined}
        />
      ))}
    </div>
  );
}
