"use client";

import { useEffect, useState } from "react";

const COLORS = ["#F2879E", "#3FA79A", "#E2A63B", "#8C6FD1", "#4C8FD1"];
// Circle, rounded square, near-square — the three cuts of paper the reference
// scatters. Kept as raw border-radius values so one lookup drives the shape.
const RADII = ["50%", "4px", "2px"];
const PIECE_COUNT = 40;

function createPieces() {
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    const size = 6 + Math.random() * 8;
    return {
      id: i,
      size,
      background: COLORS[Math.floor(Math.random() * COLORS.length)],
      borderRadius: RADII[Math.floor(Math.random() * RADII.length)],
      left: `${Math.random() * 100}%`,
      duration: `${8 + Math.random() * 10}s`,
      delay: `${Math.random() * 10}s`,
    };
  });
}

/**
 * Falling paper-confetti backdrop for the festival hero.
 *
 * Generated on the client only: the geometry is randomised, so emitting it
 * during SSR would produce markup the browser can never reproduce and every
 * piece would log a hydration mismatch. The empty first paint is invisible —
 * the field is decorative and sits behind the content at z-0.
 *
 * The generation runs in an effect rather than in render (`useMemo`, or a
 * lazy `useState` initializer) because Math.random() is impure: under
 * concurrent rendering or StrictMode's double-invoke a render-phase call can
 * be replayed and produce a different field each time. An effect is the
 * sanctioned home for that, at the cost of one extra render on mount — which
 * for a decorative background is a trade worth making.
 */
export default function ConfettiField() {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    // `prefers-reduced-motion` users get no falling pieces at all rather than
    // a frozen field — a static grid of dots reads as visual noise once it
    // isn't animating.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // The one cascading render here is the deliberate cost of keeping the
    // impure generation out of the render phase — see the note above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(createPieces());
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="festival-confetti-piece"
          style={{
            width: piece.size,
            height: piece.size,
            background: piece.background,
            borderRadius: piece.borderRadius,
            left: piece.left,
            animationDuration: piece.duration,
            animationDelay: piece.delay,
          }}
        />
      ))}
    </div>
  );
}
