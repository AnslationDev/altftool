"use client";

import React from "react";

export default function AnimatedCircuitLogo({ className = "w-28 h-28 sm:w-32 sm:h-32" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer pulsing glow aura */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[var(--primary)] via-cyan-400 to-teal-300 opacity-30 blur-xl animate-pulse" />

      {/* Rotating outer ring */}
      <div className="absolute -inset-1.5 rounded-3xl border border-[var(--primary)]/30 animate-spin" style={{ animationDuration: "18s" }} />

      {/* SVG Container Card */}
      <div className="relative w-full h-full rounded-2xl bg-[var(--surface-soft)]/80 border border-[var(--border)] p-3 flex items-center justify-center shadow-lg overflow-hidden group backdrop-blur-xs">
        {/* Animated Gradient Sweep */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-80" />

        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640.000000 640.000000"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full text-[var(--primary)] transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(20,184,166,0.4)]"
        >
          <g
            transform="translate(0.000000,640.000000) scale(0.100000,-0.100000)"
            fill="currentColor"
            stroke="none"
          >
            <path
              className="text-[var(--primary)] opacity-90 transition-colors duration-300"
              d="M2730 5407 c-50 -25 -60 -66 -60 -242 l0 -160 -100 -38 c-55 -21 -121 -49 -147 -63 l-47 -23 -127 124 c-123 121 -128 125 -170 125 l-43 0 -383 -383 -383 -383 0 -43 c0 -42 4 -47 126 -172 95 -96 124 -132 117 -141 -12 -15 -85 -186 -102 -240 l-12 -36 -180 -4 -181 -3 -29 -33 -29 -32 0 -535 0 -535 29 -32 29 -33 180 -3 180 -3 7 -26 c3 -14 30 -81 59 -148 l53 -124 -95 -93 c-153 -151 -177 -196 -134 -259 9 -14 182 -188 383 -387 l367 -362 42 0 c42 0 48 4 165 120 66 66 127 120 133 120 7 0 32 -10 55 -22 23 -12 85 -38 137 -59 l95 -37 5 -173 c5 -185 10 -205 59 -231 18 -10 92 -13 300 -13 311 0 321 2 341 74 8 24 10 229 8 618 l-3 583 -27 26 c-23 23 -38 28 -120 35 -179 16 -312 57 -446 137 -293 176 -466 482 -465 822 0 172 27 287 101 435 50 101 85 149 176 243 170 175 372 266 638 287 75 6 91 11 113 32 13 14 27 39 30 57 3 17 5 291 3 608 l-3 578 -28 27 -27 28 -283 3 c-213 2 -288 -1 -307 -11z m440 -656 l0 -459 -27 -6 c-16 -3 -46 -8 -68 -12 -227 -36 -462 -161 -632 -337 -137 -141 -222 -282 -277 -455 -193 -611 132 -1258 735 -1465 61 -21 225 -57 260 -57 5 0 9 -208 9 -465 l0 -465 -144 0 -145 0 -3 159 c-4 204 -2 202 -154 253 -60 21 -156 61 -214 89 -130 63 -154 71 -188 58 -14 -6 -75 -58 -134 -117 l-108 -106 -118 114 c-329 322 -442 436 -442 445 0 6 49 60 110 120 77 77 112 119 116 140 4 23 -7 56 -51 147 -31 64 -74 167 -95 229 -22 61 -47 120 -56 130 -27 30 -79 39 -226 39 l-138 0 0 395 0 395 150 0 c164 0 206 9 227 51 7 13 29 71 48 129 20 58 61 156 91 217 30 62 54 120 54 129 0 30 -23 60 -128 167 l-107 107 283 282 282 283 107 -107 c110 -107 137 -128 170 -128 11 0 57 20 104 44 79 41 206 92 329 133 81 27 90 49 90 236 l0 147 145 0 145 0 0 -459z"
            />
            <path
              className="text-cyan-400 opacity-100 animate-pulse"
              d="M4016 4686 c-74 -31 -157 -110 -188 -180 -18 -41 -23 -69 -23 -141 0 -116 20 -171 92 -247 70 -72 131 -100 238 -106 113 -6 179 20 261 102 81 81 107 147 102 261 -6 138 -78 247 -198 304 -81 38 -203 41 -284 7z m199 -196 c45 -22 85 -80 85 -123 0 -65 -50 -131 -112 -148 -142 -38 -246 143 -141 243 53 51 104 59 168 28z"
            />
            <path
              className="text-teal-300 opacity-100 animate-pulse"
              style={{ animationDelay: "400ms" }}
              d="M5104 4102 c-241 -85 -314 -388 -137 -573 84 -88 193 -125 310 -107 109 17 207 89 261 192 24 46 27 61 27 156 0 91 -3 111 -23 149 -36 66 -108 137 -170 168 -72 35 -191 42 -268 15z m195 -211 c39 -27 62 -64 68 -108 14 -107 -110 -198 -205 -149 -67 35 -98 103 -80 175 24 93 140 136 217 82z"
            />
            <path
              className="text-emerald-400 opacity-100 animate-pulse"
              style={{ animationDelay: "800ms" }}
              d="M4725 3247 c-64 -21 -97 -42 -146 -91 -184 -186 -114 -494 133 -582 64 -23 172 -20 240 6 66 25 146 92 181 153 102 178 27 408 -161 495 -67 31 -182 40 -247 19z m183 -216 c38 -20 62 -70 62 -128 0 -44 -5 -58 -31 -88 -93 -105 -259 -44 -259 96 0 38 33 100 63 119 47 29 112 30 165 1z"
            />
            <path
              className="text-sky-400 opacity-100 animate-pulse"
              style={{ animationDelay: "1200ms" }}
              d="M4378 2377 c-151 -64 -236 -196 -226 -351 20 -297 382 -438 594 -231 145 142 147 357 5 502 -65 65 -136 96 -236 100 -67 3 -89 0 -137 -20z m214 -211 c53 -34 74 -126 43 -186 -48 -93 -176 -105 -244 -22 -26 30 -31 46 -31 87 0 56 25 106 62 126 56 30 120 28 170 -5z"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
