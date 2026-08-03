"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 90, damping: 22 };

/**
 * Floating 3D card carousel for the Top10 hero — CSS 3D perspective +
 * Framer Motion (no React Three Fiber, keeps the bundle light). Cards
 * are positioned by their circular distance from the active index: the
 * active card is centered/largest, neighbors recede in scale/opacity/
 * depth. Auto-advances on a timer and reports the active card back up
 * via onActiveChange so the Hero text can stay in sync with whichever
 * card is centered. Visitors choose a card directly; nothing auto-advances.
 */
export default function HeroCardCarousel({ cards, onActiveChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    onActiveChange?.(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div
      className="relative mx-auto h-96 w-full max-w-xl sm:h-125 sm:max-w-2xl lg:h-160 lg:max-w-4xl"
      style={{ perspective: "1600px" }}
    >
      <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {cards.map((card, index) => {
          const total = cards.length;
          let offset = index - activeIndex;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const isActive = offset === 0;
          const abs = Math.abs(offset);
          // Show every card in the stack (not just the nearest few) so the
          // carousel always fills the width instead of thinning out at the edges.
          const visible = abs <= Math.floor((total - 1) / 2);

          const x = offset * 100;
          const z = -abs * 140;
          const rotateYCard = offset * -16;
          const scale = isActive ? 1 : abs === 1 ? 0.85 : abs === 2 ? 0.7 : 0.55;
          const opacity = visible ? (isActive ? 1 : abs === 1 ? 0.85 : abs === 2 ? 0.6 : 0.4) : 0;

          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${card.label}`}
              aria-pressed={isActive}
              aria-hidden={!visible || undefined}
              tabIndex={visible ? 0 : -1}
              className="absolute h-64 w-44 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)] sm:h-84 sm:w-56 lg:h-104 lg:w-70"
              style={{ top: "50%", left: "50%", translate: "-50% -50%", zIndex: 10 - abs }}
              animate={{ x, z, rotateY: rotateYCard, scale, opacity }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      x: SPRING,
                      z: SPRING,
                      rotateY: SPRING,
                      scale: SPRING,
                      opacity: { duration: 0.6, ease: "easeInOut" },
                    }
              }
            >
              <div
                className="group relative h-full w-full overflow-hidden rounded-lg border border-(--border) bg-(--muted)"
                style={{
                  boxShadow: isActive
                    ? "var(--anslation-ds-shadow-lg)"
                    : "var(--anslation-ds-shadow-md)",
                }}
              >
                <Image
                  src={card.image}
                  alt={card.label}
                  fill
                  unoptimized
                  sizes="280px"
                  priority={isActive}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-overlay" />

                <p className="absolute bottom-4 left-4 right-4 font-primary text-sm font-extrabold text-on-media sm:text-base">
                  {card.label}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
