"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

/**
 * Fades + slides content up once it scrolls into view, then stops
 * observing (no re-trigger on scroll back up/down). Used both at the
 * section level and per-card inside grids (with a staggered `delay`) for a
 * smooth reveal-on-scroll feel across the page. `amount: 0` (not a fraction
 * like 0.1) is deliberate — a percentage-of-target threshold never fires for
 * very tall sections, since even a fully-visible viewport can't cover a
 * large fraction of an 8000px+ element.
 */
export default function ScrollReveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[Tag] || motion.div;

  if (shouldReduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
