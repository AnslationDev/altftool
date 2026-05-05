"use client"

import { useEffect, useRef, useState } from "react";
import { Music, CloudRain, Trees, Waves, X, Volume2, VolumeX } from "lucide-react";

const SOUNDS = [
  { id: "rain",   label: "Rain",   icon: CloudRain, src: "/sounds/rain.mp3"   },
  { id: "forest", label: "Forest", icon: Trees,     src: "/sounds/forest.mp3" },
  { id: "ocean",  label: "Ocean",  icon: Waves,     src: "/sounds/ocean.mp3"  },
];

export default function FocusSounds({ isRunning, phase }) {
  const [expanded, setExpanded] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const [volume, setVolume] = useState(60);
  const audioRef = useRef(null);

  // ── Play / Pause based on isRunning + phase ──
  useEffect(() => {
    if (!audioRef.current) return;

    const shouldPlay = isRunning && phase === "focus";

    if (shouldPlay) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isRunning, phase]);

  // ── Volume change ──
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // ── Sound select ──
  const selectSound = (sound) => {
    // same sound → toggle off
    if (activeSound === sound.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setActiveSound(null);
      return;
    }

    // stop previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // create new audio
    const audio = new Audio(sound.src);
    audio.loop = true; // ← loop forever
    audio.volume = volume / 100;

    // play only if focus is running
    if (isRunning && phase === "focus") {
      audio.play().catch(() => {});
    }

    audioRef.current = audio;
    setActiveSound(sound.id);
  };

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const activeLabel = SOUNDS.find((s) => s.id === activeSound)?.label;

  return (
    <div className="mb-4">

      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`w-full flex items-center justify-between sm:px-4 sm:py-3 px-2.5 py-2 rounded-xl border cursor-pointer transition-all duration-200 font-primary
          ${expanded
            ? "bg-(--primary) text-white border-(--primary)"
            : "bg-(--background) text-(--foreground) border-(--border) hover:border-(--primary)"
          }`}
      >
        <div className="flex items-center sm:gap-2">
          <Music size={16} className="hidden sm:inline-flex shrink-0" />
          <span className="text-sm font-bold">
            {activeSound
              ? `Playing: ${activeLabel}`
              : "Want to add focus music?"
            }
          </span>
        </div>
        {expanded
          ? <X size={15} />
          : <span className="text-xs font-secondary opacity-70">Optional</span>
        }
      </button>

      {/* EXPANDED PANEL */}
      {expanded && (
        <div className="mt-2 bg-(--background) border border-(--border) rounded-xl p-4">

          {/* SOUND OPTIONS */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {SOUNDS.map(({ id, label, icon: Icon, src }) => (
              <button
                key={id}
                onClick={() => selectSound({ id, src })}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border font-primary font-semibold text-xs cursor-pointer transition-all duration-200
                  ${activeSound === id
                    ? "bg-(--primary) text-white border-(--primary)"
                    : "bg-(--muted) text-(--foreground) border-(--border) hover:border-(--primary) hover:text-(--primary)"
                  }`}
              >
                <Icon size={18} />
                {label}
                {activeSound === id && (
                  <span className="text-white/70 text-[10px]">
                    {isRunning && phase === "focus" ? "Playing" : "Paused"}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* VOLUME SLIDER */}
          <div className="flex items-center gap-3">
            <VolumeX size={14} className="text-(--muted-foreground) shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer accent-[var(--primary)] bg-(--muted)"
            />
            <Volume2 size={14} className="text-(--muted-foreground) shrink-0" />
            <span className="text-xs text-(--muted-foreground) font-secondary w-8 text-right shrink-0">
              {volume}%
            </span>
          </div>

          {/* INFO */}
          <p className="text-xs text-(--muted-foreground) font-secondary mt-3 text-center">
            Sound plays during focus only — pauses on break
          </p>

        </div>
      )}

    </div>
  );
}
