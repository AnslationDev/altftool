"use client";

import React from "react";

// 1. Cute 3D Cartoon Bear Avatar
export function BearAvatar({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 p-0.5 shadow-lg border-2 border-white ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="bear-fur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b47747" />
            <stop offset="100%" stopColor="#784824" />
          </linearGradient>
          <linearGradient id="bear-snout" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbe2cd" />
            <stop offset="100%" stopColor="#e5ba94" />
          </linearGradient>
        </defs>
        {/* Left Ear */}
        <circle cx="28" cy="28" r="14" fill="url(#bear-fur)" stroke="#593215" strokeWidth="2" />
        <circle cx="28" cy="28" r="8" fill="#f4a8b7" />
        {/* Right Ear */}
        <circle cx="72" cy="28" r="14" fill="url(#bear-fur)" stroke="#593215" strokeWidth="2" />
        <circle cx="72" cy="28" r="8" fill="#f4a8b7" />
        {/* Head */}
        <circle cx="50" cy="55" r="32" fill="url(#bear-fur)" stroke="#593215" strokeWidth="3" />
        {/* Eyes */}
        <circle cx="38" cy="48" r="5" fill="#1e130c" />
        <circle cx="36" cy="46" r="2" fill="#ffffff" />
        <circle cx="62" cy="48" r="5" fill="#1e130c" />
        <circle cx="60" cy="46" r="2" fill="#ffffff" />
        {/* Snout */}
        <ellipse cx="50" cy="62" rx="14" ry="10" fill="url(#bear-snout)" />
        <ellipse cx="50" cy="57" rx="5" ry="3.5" fill="#2d170b" />
        {/* Smile */}
        <path d="M 45 64 Q 50 69 55 64" fill="none" stroke="#2d170b" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 2. Cute 3D Cartoon Dinosaur Avatar
export function DinoAvatar({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-teal-400 via-emerald-500 to-green-600 p-0.5 shadow-lg border-2 border-white ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="dino-skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="dino-scales" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
        </defs>
        {/* Orange Head Spikes */}
        <path d="M 30 25 L 36 15 L 42 27 Z" fill="url(#dino-scales)" />
        <path d="M 48 20 L 54 10 L 60 22 Z" fill="url(#dino-scales)" />
        <path d="M 66 25 L 72 15 L 78 27 Z" fill="url(#dino-scales)" />
        {/* Head */}
        <circle cx="50" cy="55" r="32" fill="url(#dino-skin)" stroke="#14532d" strokeWidth="3" />
        {/* Eyes */}
        <circle cx="38" cy="46" r="6" fill="#ffffff" />
        <circle cx="39" cy="46" r="3.5" fill="#0f172a" />
        <circle cx="38" cy="44" r="1.5" fill="#ffffff" />
        <circle cx="62" cy="46" r="6" fill="#ffffff" />
        <circle cx="63" cy="46" r="3.5" fill="#0f172a" />
        <circle cx="62" cy="44" r="1.5" fill="#ffffff" />
        {/* Cheeks */}
        <circle cx="28" cy="56" r="4" fill="#f87171" opacity="0.6" />
        <circle cx="72" cy="56" r="4" fill="#f87171" opacity="0.6" />
        {/* Snout & Mouth */}
        <path d="M 42 62 Q 50 72 58 62" fill="none" stroke="#14532d" strokeWidth="3" strokeLinecap="round" />
        {/* Tooth */}
        <path d="M 46 64 L 48 68 L 50 64 Z" fill="#ffffff" />
      </svg>
    </div>
  );
}

// 3. Cute 3D Cartoon Kitty Cat Avatar
export function KittyAvatar({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 via-rose-500 to-purple-600 p-0.5 shadow-lg border-2 border-white ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="cat-fur" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>
        </defs>
        {/* Left Pointy Ear */}
        <polygon points="22,45 28,15 48,32" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
        <polygon points="26,40 30,22 44,32" fill="#fbcfe8" />
        {/* Right Pointy Ear */}
        <polygon points="78,45 72,15 52,32" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
        <polygon points="74,40 70,22 56,32" fill="#fbcfe8" />
        {/* Head */}
        <circle cx="50" cy="56" r="30" fill="url(#cat-fur)" stroke="#db2777" strokeWidth="3" />
        {/* Eyes */}
        <ellipse cx="36" cy="50" rx="5" ry="6" fill="#831843" />
        <circle cx="34" cy="48" r="2" fill="#ffffff" />
        <ellipse cx="64" cy="50" rx="5" ry="6" fill="#831843" />
        <circle cx="62" cy="48" r="2" fill="#ffffff" />
        {/* Whiskers */}
        <line x1="16" y1="56" x2="28" y2="58" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="63" x2="29" y2="62" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" />
        <line x1="84" y1="56" x2="72" y2="58" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" />
        <line x1="82" y1="63" x2="71" y2="62" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" />
        {/* Nose & Mouth */}
        <polygon points="47,58 53,58 50,62" fill="#f43f5e" />
        <path d="M 44 65 Q 50 70 56 65" fill="none" stroke="#9d174d" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 4. Cute 3D Cartoon Alien Avatar
export function AlienAvatar({ className = "h-12 w-12" }) {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 p-0.5 shadow-lg border-2 border-white ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id="alien-skin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        {/* Antenna */}
        <line x1="50" y1="32" x2="50" y2="16" stroke="#0369a1" strokeWidth="4" />
        <circle cx="50" cy="14" r="7" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
        {/* Head */}
        <ellipse cx="50" cy="56" rx="34" ry="28" fill="url(#alien-skin)" stroke="#0369a1" strokeWidth="3" />
        {/* Center Big Eye */}
        <circle cx="50" cy="48" r="11" fill="#ffffff" stroke="#0369a1" strokeWidth="2" />
        <circle cx="50" cy="48" r="6" fill="#0f172a" />
        <circle cx="48" cy="45" r="2.5" fill="#ffffff" />
        {/* Left Pupil Eye */}
        <circle cx="30" cy="52" r="5" fill="#ffffff" />
        <circle cx="30" cy="52" r="2.5" fill="#0f172a" />
        {/* Right Pupil Eye */}
        <circle cx="70" cy="52" r="5" fill="#ffffff" />
        <circle cx="70" cy="52" r="2.5" fill="#0f172a" />
        {/* Mouth */}
        <path d="M 42 66 Q 50 74 58 66" fill="none" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 5. Glossy Flower Bouquet Reward Icon
export function FlowerReward({ className = "h-10 w-10" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full filter drop-shadow-[0_4px_8px_rgba(236,72,153,0.6)]">
        <defs>
          <linearGradient id="wrapper-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        {/* Golden Wrapper Cone */}
        <polygon points="50,92 25,48 75,48" fill="url(#wrapper-gold)" stroke="#78350f" strokeWidth="2" />
        <path d="M 32,48 C 32,40 68,40 68,48" fill="#fde047" stroke="#78350f" strokeWidth="2" />
        {/* Green Leaves */}
        <path d="M 20,40 Q 35,30 45,42 Z" fill="#22c55e" />
        <path d="M 80,40 Q 65,30 55,42 Z" fill="#22c55e" />
        {/* Rose Petals (Center White Rose) */}
        <circle cx="50" cy="30" r="14" fill="#ffffff" stroke="#f472b6" strokeWidth="2" />
        <circle cx="50" cy="30" r="9" fill="#fbcfe8" />
        <circle cx="50" cy="30" r="5" fill="#f43f5e" />
        {/* Left Rose */}
        <circle cx="34" cy="34" r="11" fill="#fff1f2" stroke="#f43f5e" strokeWidth="2" />
        <circle cx="34" cy="34" r="6" fill="#fecdd3" />
        {/* Right Rose */}
        <circle cx="66" cy="34" r="11" fill="#fff1f2" stroke="#f43f5e" strokeWidth="2" />
        <circle cx="66" cy="34" r="6" fill="#fecdd3" />
      </svg>
    </div>
  );
}

// 6. 3D Glossy Target Bingo Logo Badge
export function BingoLogoTarget({ className = "h-14 w-14" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-full filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.7)]">
        <defs>
          <radialGradient id="target-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
        </defs>
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="46" fill="url(#target-gold)" stroke="#ffffff" strokeWidth="4" />
        <circle cx="50" cy="50" r="35" fill="#ec4899" stroke="#ffffff" strokeWidth="3" />
        <circle cx="50" cy="50" r="24" fill="#ffffff" stroke="#e11d48" strokeWidth="3" />
        <circle cx="50" cy="50" r="13" fill="#e11d48" />
        {/* Bullseye Star */}
        <polygon points="50,40 53,46 60,47 55,52 56,59 50,55 44,59 45,52 40,47 47,46" fill="#ffffff" />
      </svg>
    </div>
  );
}
