"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getSkin } from "../utils/coinSkins";
import RealCoinArt from "./RealCoinArt";

export default function Coin3D({
  skinId = "rupee",
  flipping = false,
  rotationY = 0,
  reducedMotion = false,
  onFlipTrigger,
  disabled = false,
}) {
  const skin = getSkin(skinId);
  const coinContainerRef = useRef(null);

  // Mouse tilt effect when idle (Parallax)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 220, damping: 18 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 220, damping: 18 });

  const tiltX = useTransform(smoothMouseY, [-0.5, 0.5], [20, -20]);
  const tiltY = useTransform(smoothMouseX, [-0.5, 0.5], [-20, 20]);

  // Touch swipe detection
  const touchStartYRef = useRef(null);

  const handleMouseMove = (e) => {
    if (flipping || reducedMotion || !coinContainerRef.current) return;
    const rect = coinContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartYRef.current !== null && e.changedTouches && e.changedTouches[0]) {
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY;
      if (deltaY > 40 && !disabled && !flipping && onFlipTrigger) {
        onFlipTrigger();
      }
    }
    touchStartYRef.current = null;
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Subtle Golden Radial Glow behind the Coin */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(234,179,8,0.08) 55%, transparent 75%)",
          filter: "blur(24px)",
        }}
      />

      {/* Soft Circular Platform Shadow beneath the coin */}
      <div
        className="pointer-events-none absolute bottom-4 h-7 w-48 rounded-[100%] transition-all duration-500 sm:w-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)",
          transform: flipping
            ? "scale(0.4) translateY(34px)"
            : "scale(1) translateY(0)",
          opacity: flipping ? 0.2 : 0.75,
          filter: flipping ? "blur(14px)" : "blur(6px)",
        }}
      />

      {/* 3D Coin Stage Container */}
      <div
        ref={coinContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!disabled && !flipping && onFlipTrigger) {
            onFlipTrigger();
          }
        }}
        className="group relative cursor-pointer select-none p-4 [perspective:1200px]"
        tabIndex={0}
        role="button"
        aria-label="Click or swipe up to flip the 3D coin"
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !flipping && onFlipTrigger) {
            e.preventDefault();
            onFlipTrigger();
          }
        }}
      >
        <motion.div
          animate={
            flipping && !reducedMotion
              ? {
                y: [-10, -170, -190, -18, 0, -8, 0],
                scale: [1, 1.18, 1.22, 1, 0.95, 1.01, 1],
                rotateX: [0, 28, -16, 12, 0],
              }
              : {
                y: [0, -10, 0],
                rotateZ: [0, 1.6, 0, -1.6, 0],
              }
          }
          transition={
            flipping && !reducedMotion
              ? {
                duration: 2.2,
                times: [0, 0.35, 0.5, 0.8, 0.88, 0.94, 1],
                ease: "easeInOut",
              }
              : {
                duration: 4.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }
          }
          style={{
            rotateX: flipping || reducedMotion ? 0 : tiltX,
            rotateY: flipping || reducedMotion ? 0 : tiltY,
            transformStyle: "preserve-3d",
          }}
          className="relative h-56 w-56 sm:h-64 sm:w-64"
        >
          {/* Main 3D Flipping Body */}
          <div
            className="relative h-full w-full transition-transform ease-out [transform-style:preserve-3d]"
            style={{
              transform: `rotateY(${rotationY}deg)`,
              transitionDuration: flipping ? (reducedMotion ? "300ms" : "2200ms") : "400ms",
            }}
          >
            {/* 3D MILLED REEDED COIN EDGE (Thickness Layers) */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full border-[7px] border-dashed"
              style={{
                borderColor: skin.borderColor,
                transform: "translateZ(0px)",
                background: "repeating-conic-gradient(from 0deg, rgba(0,0,0,0.6) 0deg 4deg, rgba(255,255,255,0.4) 4deg 8deg)",
                boxShadow: `inset 0 0 12px rgba(0,0,0,0.7)`,
              }}
            />

            {/* HEADS SIDE (Front 3D Layer at Z +6.5px) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full shadow-2xl [backface-visibility:hidden] overflow-hidden"
              style={{
                transform: "translateZ(6.5px)",
                boxShadow: `0 16px 40px ${skin.glowColor}, inset 0 0 15px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Light Reflection Sheen (Moving Specular Sweep) */}
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-0 z-20 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />

              {/* Authentic Real Coin Art */}
              <RealCoinArt skin={skin} side="heads" />
            </div>

            {/* TAILS SIDE (Back 3D Layer rotated 180deg at Z +6.5px) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full shadow-2xl [backface-visibility:hidden] overflow-hidden"
              style={{
                transform: "rotateY(180deg) translateZ(6.5px)",
                boxShadow: `0 16px 40px ${skin.glowColor}, inset 0 0 15px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Light Reflection Sheen (Moving Specular Sweep) */}
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-0 z-20 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />

              {/* Authentic Real Coin Art */}
              <RealCoinArt skin={skin} side="tails" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Instructional Tag */}
      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
        <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[var(--primary)]" />
        <span>Click, tap, or flick upward to toss 3D coin</span>
      </div>
    </div>
  );
}
