/**
 * animationRegistry.js
 *
 * Central registry for all Web Animations API keyframe definitions.
 *
 * Per-element overrides (via data attributes):
 *   data-delay="200"      → adds 200ms delay on top of any computed delay
 *   data-duration="400"   → overrides the animation duration
 *   data-easing="linear"  → overrides the easing function
 *   data-index="3"        → used by staggered animations to compute offset delay
 */

/** @param {HTMLElement} el @param {object} base */
const resolveOptions = (el, base) => ({
  ...base,
  delay:
    (base.delay ?? 0) +
    (Number(el.dataset.delay) || 0) +
    (Number(el.dataset.index) || 0) * (Number(el.dataset.stagger) || 0),
  duration: el.dataset.duration ? Number(el.dataset.duration) : base.duration,
  easing: el.dataset.easing ?? base.easing,
});

export const animations = {
  // ─── Fade ────────────────────────────────────────────────────────────────
  "animate-fade": {
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: (el) => resolveOptions(el, { duration: 300, easing: "ease-out", fill: "both" }),
  },

  "animate-fade-out": {
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: (el) => resolveOptions(el, { duration: 200, easing: "ease-in", fill: "both" }),
  },

  // ─── Fade + translate ────────────────────────────────────────────────────
  "animate-fade-up": {
    keyframes: [
      { opacity: 0, transform: "translateY(16px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 550, easing: "ease-out", fill: "both" }),
  },

  "animate-fade-down": {
    keyframes: [
      { opacity: 0, transform: "translateY(-16px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 550, easing: "ease-out", fill: "both" }),
  },

  // ─── Slide ───────────────────────────────────────────────────────────────
  "animate-slide-up": {
    keyframes: [
      { opacity: 0, transform: "translateY(24px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 350, easing: "ease-out", fill: "both" }),
  },

  "animate-slide-down": {
    keyframes: [
      { opacity: 0, transform: "translateY(-24px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 350, easing: "ease-out", fill: "both" }),
  },

  "animate-slide-left": {
    keyframes: [
      { opacity: 0, transform: "translateX(24px)" },
      { opacity: 1, transform: "translateX(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 350, easing: "ease-out", fill: "both" }),
  },

  "animate-slide-right": {
    keyframes: [
      { opacity: 0, transform: "translateX(-24px)" },
      { opacity: 1, transform: "translateX(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 550, easing: "ease-out", fill: "both" }),
  },

  "animate-slide-out-up": {
    keyframes: [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-16px)" },
    ],
    options: (el) => resolveOptions(el, { duration: 250, easing: "ease-in", fill: "both" }),
  },

  // ─── Scale ───────────────────────────────────────────────────────────────
  "animate-scale-in": {
    keyframes: [
      { opacity: 0, transform: "scale(0.96)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    options: (el) =>
      resolveOptions(el, {
        duration: 560,
        easing: "ease-out",
        fill: "both",
        delay: (Number(el.dataset.index) || 0) * 40,
      }),
  },

  "animate-zoom-in": {
    keyframes: [
      { opacity: 0, transform: "scale(0.85)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    options: (el) =>
      resolveOptions(el, {
        duration: 420,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        fill: "both",
      }),
  },

  // ─── Flip ────────────────────────────────────────────────────────────────
  "animate-flip-up": {
    keyframes: [
      { opacity: 0, transform: "perspective(600px) rotateX(20deg) translateY(20px)" },
      { opacity: 1, transform: "perspective(600px) rotateX(0deg) translateY(0)" },
    ],
    options: (el) =>
      resolveOptions(el, { duration: 500, easing: "ease-out", fill: "both" }),
  },

  // ─── Bounce ──────────────────────────────────────────────────────────────
  "animate-bounce-in": {
    keyframes: [
      { opacity: 0, transform: "scale(0.3)" },
      { opacity: 1, transform: "scale(1.05)" },
      { transform: "scale(0.95)" },
      { transform: "scale(1)" },
    ],
    options: (el) =>
      resolveOptions(el, {
        duration: 600,
        easing: "ease-out",
        fill: "both",
      }),
  },

  // ─── Wipe ────────────────────────────────────────────────────────────────
  /**
   * Requires the element to have `overflow: hidden` and its text/child
   * content to be inside a wrapper — the element itself gets clipped.
   */
  "animate-wipe-right": {
    keyframes: [
      { clipPath: "inset(0 100% 0 0)" },
      { clipPath: "inset(0 0% 0 0)" },
    ],
    options: (el) =>
      resolveOptions(el, { duration: 600, easing: "ease-in-out", fill: "both" }),
  },

  // ─── Attention ───────────────────────────────────────────────────────────
  "animate-pop": {
    keyframes: [
      { transform: "scale(1)" },
      { transform: "scale(1.05)" },
      { transform: "scale(1)" },
    ],
    options: (el) => resolveOptions(el, { duration: 180, easing: "ease-out" }),
  },

  "animate-shake-x": {
    keyframes: [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 400, easing: "ease-in-out" }),
  },

  // ─── Blur ────────────────────────────────────────────────────────────────
  "animate-blur-in": {
    keyframes: [
      { opacity: 0, filter: "blur(6px)" },
      { opacity: 1, filter: "blur(0)" },
    ],
    options: (el) => resolveOptions(el, { duration: 300, easing: "ease-out", fill: "both" }),
  },

  // ─── Stagger helpers ─────────────────────────────────────────────────────
  /**
   * Apply to a container's children via JS or set data-index on each child.
   * Uses data-stagger (ms per step) defaulting to 60ms.
   */
  "animate-stagger-fade": {
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: (el) =>
      resolveOptions(el, {
        duration: 280,
        easing: "ease-out",
        fill: "both",
        delay: (Number(el.dataset.index) || 0) * (Number(el.dataset.stagger) || 60),
      }),
  },

  "animate-stagger-up": {
    keyframes: [
      { opacity: 0, transform: "translateY(18px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    options: (el) =>
      resolveOptions(el, {
        duration: 400,
        easing: "ease-out",
        fill: "both",
        delay: (Number(el.dataset.index) || 0) * (Number(el.dataset.stagger) || 60),
      }),
  },
};