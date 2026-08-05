"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { SHOWCASE_SCENES } from "./scenes";

const AUTOPLAY_MS = 4800;
const TILT_DEGREES = 7;

/**
 * Right-column hero showcase: one persistent "device frame" card whose
 * content cycles through 5 AI-category scenes, each a full-bleed workflow
 * screen with a single accent callout. Autoplay pauses on hover; manual tab
 * clicks reset the timer.
 *
 * Note: the scene swap intentionally skips framer-motion's AnimatePresence —
 * in this app it silently froze on the first-mounted child and never
 * re-rendered on subsequent key changes. A plain keyed `motion.div` (enter
 * animation only, no exit) sidesteps that reliably.
 */
export default function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = SHOWCASE_SCENES[activeIndex];
  const frameRef = useRef(null);

  const tiltX = useMotionValue(0.5);
  const tiltY = useMotionValue(0.5);
  const springConfig = { stiffness: 200, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(tiltY, [0, 1], [TILT_DEGREES, -TILT_DEGREES]), springConfig);
  const rotateY = useSpring(useTransform(tiltX, [0, 1], [-TILT_DEGREES, TILT_DEGREES]), springConfig);
  const glowX = useSpring(useTransform(tiltX, [0, 1], ["-10%", "110%"]), springConfig);
  const glowY = useSpring(useTransform(tiltY, [0, 1], ["-10%", "110%"]), springConfig);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_SCENES.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, paused]);

  const handleMouseMove = (event) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    tiltX.set((event.clientX - rect.left) / rect.width);
    tiltY.set((event.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    setPaused(false);
    tiltX.set(0.5);
    tiltY.set(0.5);
  };

  return (
    <div
      className="mx-auto w-full max-w-md lg:max-w-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div className="relative" style={{ perspective: 1200 }}>
        <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 overflow-hidden rounded-[3rem]">
          <span
            className="absolute -left-10 -top-10 h-56 w-56 rounded-full opacity-30 blur-3xl transition-colors duration-700"
            style={{ backgroundColor: active.accent[0] }}
          />
          <span
            className="absolute -bottom-10 -right-6 h-64 w-64 rounded-full opacity-25 blur-3xl transition-colors duration-700"
            style={{ backgroundColor: active.accent[1] }}
          />
        </div>

        <motion.div
          ref={frameRef}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative flex h-[380px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-900/5 bg-white shadow-2xl shadow-slate-900/10 sm:h-[420px] lg:h-[460px]"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-0 transition-opacity duration-300 hover:opacity-100">
            <motion.span
              className="absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-2xl"
              style={{ left: glowX, top: glowY }}
            />
          </div>

          <div className="relative z-20 flex shrink-0 items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span className="ml-2.5 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-900/5">
              <active.icon className="h-3.5 w-3.5" style={{ color: active.accent[0] }} aria-hidden="true" />
              {active.label}
            </span>
          </div>

          <div className="aib-dot-grid relative z-20 flex-1 overflow-hidden opacity-70">
            <motion.div
              key={active.id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <active.Scene />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="mt-5 flex justify-center gap-1.5 sm:gap-2">
        {SHOWCASE_SCENES.map((scene, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={isActive ? "true" : undefined}
              aria-label={`Show ${scene.label}`}
              className={`group relative flex items-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-2 transition-colors sm:px-3.5 ${
                isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {isActive ? (
                <span
                  key={`${scene.id}-${activeIndex}`}
                  className="aib-tab-progress absolute inset-y-0 left-0 bg-white/20"
                  style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                />
              ) : null}
              <scene.icon className="relative h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="relative hidden text-xs font-semibold sm:inline">{scene.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
