"use client";

import React, { memo, useState, useEffect } from "react";
import Lottie from "lottie-react";
import animationData from "./animation.json";
import AnimatedCircuitLogo from "./AnimatedCircuitLogo";

const LottieAnimation = memo(function LottieAnimation({ className = "w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36" }) {
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (hasError || !animationData) {
    return <AnimatedCircuitLogo className={className} />;
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 aspect-square overflow-hidden ${className}`}>
      {/* Outer ambient glow ring */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[var(--primary)] via-cyan-400 to-teal-300 opacity-25 blur-xl animate-pulse" />

      {/* Rotating accent border ring */}
      <div className="absolute -inset-1.5 rounded-3xl border border-[var(--primary)]/30 animate-spin" style={{ animationDuration: "20s" }} />

      {/* Container Card */}
      <div className="relative w-full h-full rounded-2xl bg-[var(--surface-soft)]/90 border border-[var(--border)] p-2.5 flex items-center justify-center shadow-lg overflow-hidden backdrop-blur-xs group">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-70" />

        {isMounted ? (
          <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(20,184,166,0.4)]">
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: "100%", height: "100%" }}
              rendererSettings={{
                preserveAspectRatio: "xMidYMid meet",
              }}
              onError={() => setHasError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-xl bg-[var(--surface)]/50 animate-pulse" />
        )}
      </div>
    </div>
  );
});

export default LottieAnimation;
