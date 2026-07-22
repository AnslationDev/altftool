"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tiny Web Audio synth for game feedback. No audio files: every cue is an
 * oscillator envelope. The AudioContext is created lazily on the first user
 * gesture that plays a sound, and closed on unmount.
 */
export default function useSounds(enabled) {
  const ctxRef = useRef(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      if (ctx && ctx.state !== "closed") {
        ctx.close().catch(() => {});
      }
    };
  }, []);

  // Built once via the useState lazy initializer; the closures only touch the
  // refs at call time (inside event handlers), never during render.
  const [sounds] = useState(() => {
    const getCtx = () => {
      if (!enabledRef.current || typeof window === "undefined") return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        try {
          ctxRef.current = new AC();
        } catch {
          return null;
        }
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
      return ctxRef.current;
    };

    const tone = (
      freq,
      duration,
      { type = "sine", volume = 0.06, delay = 0, slideTo = null } = {},
    ) => {
      const ctx = getCtx();
      if (!ctx) return;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
      }
      gain.gain.setValueAtTime(volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    };

    return {
      reveal: () => tone(640, 0.07, { type: "square", volume: 0.03 }),
      flag: () => tone(440, 0.09, { type: "triangle", volume: 0.05 }),
      unflag: () => tone(300, 0.09, { type: "triangle", volume: 0.04 }),
      boom: () => {
        tone(180, 0.5, { type: "sawtooth", volume: 0.09, slideTo: 40 });
        tone(95, 0.6, { type: "square", volume: 0.05, slideTo: 30 });
      },
      win: () => {
        tone(523.25, 0.12, { type: "triangle", volume: 0.06 });
        tone(659.25, 0.12, { type: "triangle", volume: 0.06, delay: 0.12 });
        tone(783.99, 0.12, { type: "triangle", volume: 0.06, delay: 0.24 });
        tone(1046.5, 0.24, { type: "triangle", volume: 0.06, delay: 0.36 });
      },
    };
  });

  return sounds;
}
