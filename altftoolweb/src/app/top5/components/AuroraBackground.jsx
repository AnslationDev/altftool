"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import ManagedImage from "@/components/ui/ManagedImage";

const POSTER =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=85";

// Deterministic "random" particle field — index-driven trig instead of
// Math.random() so server and client render the same markup (avoids a
// hydration mismatch) while still looking scattered.
const PARTICLES = Array.from({ length: 34 }, (_, i) => {
  const left = (i * 47.3) % 100;
  const top = (i * 71.7) % 100;
  const size = 1.5 + ((i * 13) % 4);
  const duration = 9 + ((i * 7) % 10);
  const delay = (i % 10) * 0.6;
  return { id: i, left, top, size, duration, delay };
});

export default function AuroraBackground() {
  const containerRef = useRef(null);
  const mvX = useMotionValue(0.5);
  const mvY = useMotionValue(0.5);
  const springX = useSpring(mvX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mvY, { stiffness: 40, damping: 20 });

  const spotlightX = useTransform(springX, [0, 1], ["10%", "90%"]);
  const spotlightY = useTransform(springY, [0, 1], ["10%", "90%"]);
  const parallaxX = useTransform(springX, [0, 1], ["-2%", "2%"]);
  const parallaxY = useTransform(springY, [0, 1], ["-2%", "2%"]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const handleMove = (event) => {
      const rect = node.getBoundingClientRect();
      mvX.set((event.clientX - rect.left) / rect.width);
      mvY.set((event.clientY - rect.top) / rect.height);
    };
    node.addEventListener("mousemove", handleMove);
    return () => node.removeEventListener("mousemove", handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-[#060a14]">
      {/* Ken Burns photo layer */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-[-5%]"
      >
        <motion.div
          animate={{ scale: [1.12, 1.24, 1.12], x: ["0%", "-2%", "0%"], y: ["0%", "1.5%", "0%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full"
        >
          <ManagedImage src={POSTER} alt="" className="h-full w-full object-cover opacity-[0.38]" />
        </motion.div>
      </motion.div>

      {/* Aurora gradient blobs */}
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 60, -20, 0], y: [0, 40, 0, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] max-h-[700px] max-w-[700px] rounded-full bg-[#10b981]/25 blur-[120px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -50, 30, 0], y: [0, -30, 20, 0], scale: [1, 1.2, 1, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-0 right-0 h-[55vw] w-[55vw] max-h-[640px] max-w-[640px] rounded-full bg-[#5ea8ff]/25 blur-[120px]"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 40, -30, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[-20%] left-1/3 h-[45vw] w-[45vw] max-h-[520px] max-w-[520px] rounded-full bg-[#a78bfa]/20 blur-[120px]"
      />

      {/* Cursor-reactive spotlight */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${spotlightX} ${spotlightY}, rgba(94,168,255,0.14), transparent 60%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-white/70"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -26, 0],
              opacity: [0.15, 0.8, 0.15],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Film grain texture for a premium, filmic finish */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay">
        <filter id="top5-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#top5-grain)" />
      </svg>

      {/* Depth gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,20,0.35)_0%,rgba(6,10,20,0.72)_55%,#060a14_100%)]" />
    </div>
  );
}
