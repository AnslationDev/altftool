"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";
import { ArrowDown } from "lucide-react";
import { EASE, PetalBurst } from "./motion";

// Filmic grain texture (inline SVG) — laid very lightly over the photo so
// the frame reads like printed editorial photography instead of a flat JPEG.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/**
 * Single cinematic hero for the ranking page.
 *
 * One photograph, one frame. A two-stage curtain (emerald accent, then
 * ink) wipes away to reveal the photo, a light sweep polishes the surface,
 * and from then on the image drifts on scroll, leans toward the cursor,
 * and sits under film grain + vignette with glass chips floating on top.
 */
export default function HeroParallaxImage({ src, alt, category, entries, readTime }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  // Scroll-linked motion: the oversized photo drifts vertically inside the
  // frame, and the whole frame settles from a slight scale as it enters.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const frameScale = useTransform(scrollYProgress, [0, 0.3], [0.96, 1]);

  // Pointer-follow: the photo leans a few pixels toward the cursor. Springs
  // keep it fluid; it resets to center when the pointer leaves.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 60, damping: 18 });
  const leanY = useSpring(pointerY, { stiffness: 60, damping: 18 });

  const onPointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 18);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 12);
  };
  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div ref={ref} className="mt-10 sm:mt-12">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-12">
        <motion.div
          style={{ scale: reduceMotion ? 1 : frameScale }}
          onPointerMove={reduceMotion ? undefined : onPointerMove}
          onPointerLeave={onPointerLeave}
          className="group relative overflow-hidden rounded-3xl sm:rounded-[32px] bg-footer ring-1 ring-border aspect-[3/2] sm:aspect-[16/7] lg:aspect-[21/8] shadow-lg"
        >
          {/* Two-stage curtain: an emerald accent leads, the ink panel
              follows a beat later — a considered, editorial reveal. */}
          <motion.div
            aria-hidden="true"
            initial={{ x: 0 }}
            whileInView={{ x: "101%" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.28 }}
            className="absolute inset-0 z-30 bg-primary"
          />
          <motion.div
            aria-hidden="true"
            initial={{ x: 0 }}
            whileInView={{ x: "101%" }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="absolute inset-0 z-20 bg-footer"
          />

          {/* One-time light sweep right after the curtains part. */}
          <motion.div
            aria-hidden="true"
            initial={{ x: "-130%", opacity: 0 }}
            whileInView={{ x: "140%", opacity: [0, 0.45, 0] }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.1, ease: "easeInOut", delay: 1.15 }}
            className="pointer-events-none absolute inset-y-0 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-on-media/60 to-transparent"
          />

          {/* Oversized photo: parallax + pointer lean + slow settle-zoom. */}
          <motion.div
            style={{ y: reduceMotion ? 0 : imageY, x: reduceMotion ? 0 : leanX }}
            className="absolute inset-x-0 -top-[10%] -bottom-[10%]"
          >
            <motion.div
              style={{ y: reduceMotion ? 0 : leanY }}
              initial={{ scale: 1.09 }}
              whileInView={{ scale: 1.02 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 1.6, ease: EASE }}
              className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            >
              <ManagedImage
                src={src}
                alt={alt}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Legibility gradients, film grain, and a soft vignette. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-footer/45 via-footer/0 to-footer/15" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-footer/20"
          />

          {/* Hairline inner frame — the matte around the print. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 sm:inset-3.5 rounded-[18px] sm:rounded-3xl border border-on-media/15"
          />

          {/* Top-left: feature eyebrow chip (glass). */}
          <motion.span
            initial={{ opacity: 0, y: -14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.15, ease: EASE }}
            className="absolute top-5 left-5 sm:top-7 sm:left-7 z-10 inline-flex items-center gap-2 rounded-full border border-on-media/20 bg-on-media/10 px-3.5 py-1.5 text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-on-media backdrop-blur-md shadow-lg"
          >
            <motion.span
              animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1] }}
              transition={reduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            {(category || "FEATURE").toUpperCase()}
          </motion.span>

          {/* Top-right: slow-spinning Top5 motif. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.3, ease: EASE }}
            className="absolute top-5 right-5 sm:top-7 sm:right-7 z-10 hidden sm:block"
            aria-hidden="true"
          >
            <PetalBurst className="h-9 w-9 text-on-media/40" />
          </motion.div>

          {/* Bottom-left: editorial caption in the display serif. */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.3, ease: EASE }}
            className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7 z-10 max-w-[75%]"
          >
            <p className="flex items-center gap-2.5 text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-on-media/60">
              <span className="inline-block h-px w-6 bg-primary" aria-hidden="true" />
              FEATURE PHOTOGRAPHY
            </p>
            <p
              className="mt-1.5 line-clamp-2 text-base sm:text-2xl text-on-media italic"
              style={{ fontFamily: "var(--font-top5-display, serif)" }}
            >
              {alt}
            </p>
          </motion.div>

          {/* Bottom-right: quick stats + scroll cue (glass). */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.45, ease: EASE }}
            className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 z-10 hidden sm:flex items-center gap-3"
          >
            {entries ? (
              <span className="rounded-full border border-on-media/20 bg-on-media/10 px-3.5 py-1.5 text-xs font-semibold text-on-media backdrop-blur-md">
                {entries} entries
              </span>
            ) : null}
            {readTime ? (
              <span className="rounded-full border border-on-media/20 bg-on-media/10 px-3.5 py-1.5 text-xs font-semibold text-on-media backdrop-blur-md">
                {readTime}
              </span>
            ) : null}
            <motion.span
              animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
              transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-on-media/90 text-footer shadow-lg"
              aria-hidden="true"
            >
              <ArrowDown size={15} />
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
