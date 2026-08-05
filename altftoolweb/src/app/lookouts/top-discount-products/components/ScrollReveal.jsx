"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const VARIANTS = {
  up: { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: -28 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: 28 }, animate: { opacity: 1, x: 0 } },
  scale: { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 } },
};

/**
 * Fades a section/card into place the first time it scrolls into view, then
 * stops observing. `amount: 0` (not a fraction) is deliberate — a
 * percentage-of-target threshold never fires for very tall sections.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.7,
  direction = "up",
  className = "",
  as: Tag = "div",
}) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[Tag] || motion.div;
  const variant = VARIANTS[direction] || VARIANTS.up;

  if (shouldReduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={variant.initial}
      whileInView={variant.animate}
      viewport={{ once: true, amount: 0, margin: "0px 0px -60px 0px" }}
      transition={{ duration, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
