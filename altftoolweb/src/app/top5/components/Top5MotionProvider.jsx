"use client";

import { MotionConfig } from "framer-motion";

/**
 * Honor the visitor's operating-system motion preference throughout Top5.
 * Framer Motion skips transform and layout animation while preserving the
 * content and every control.
 */
export default function Top5MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
