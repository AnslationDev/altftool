
"use client";

import { useMemo } from "react";
import { Folder } from "lucide-react";

export function NeuralMesh() {
  const points = useMemo(
    () => [
      [4, 17], [23, 10], [33, 13], [26, 38], [9, 66], [22, 62], [37, 71], [52, 50],
      [59, 27], [69, 19], [77, 26], [84, 13], [96, 9], [94, 31], [79, 62], [66, 70],
      [58, 58], [47, 72], [32, 88], [16, 83], [8, 57], [19, 29], [43, 20], [73, 42],
      [91, 55], [62, 83], [71, 90], [53, 91], [28, 78], [12, 41],
    ],
    []
  );
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <filter id="hackerGlow">
          <feGaussianBlur stdDeviation="0.85" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="100" height="100" fill="rgba(0,0,0,0.72)" />
      {points.map((point, index) =>
        points.slice(index + 1, index + 6).map((target, targetIndex) => (
          <line
            key={`${index}-${targetIndex}`}
            x1={point[0]}
            y1={point[1]}
            x2={target[0]}
            y2={target[1]}
            stroke="#00ff19"
            strokeOpacity={0.25 + ((index + targetIndex) % 4) * 0.12}
            strokeWidth="0.36"
            filter="url(#hackerGlow)"
          />
        ))
      )}
      {points.map((point, index) => (
        <circle key={`${point[0]}-${point[1]}`} cx={point[0]} cy={point[1]} r={index % 4 === 0 ? 1.1 : 0.72} fill="#00ff19" filter="url(#hackerGlow)" />
      ))}
    </svg>
  );
}

export function MatrixCodeWall() {
  const rows = useMemo(
    () =>
      Array.from({ length: 18 }, (_, row) =>
        Array.from({ length: 34 }, (_, col) => "日月火水木金土零壱弐参四五六七八九01"[((row * 9 + col * 5) % 24)]).join(" ")
      ),
    []
  );
  return (
    <div className="h-full overflow-hidden bg-black px-2 py-3 font-mono text-[15px] leading-[1.12] text-[#00ff19] [text-shadow:0_0_10px_rgba(0,255,25,0.9)]">
      {rows.map((row, index) => (
        <p key={`${row}-${index}`} className={`${index % 3 === 0 ? "opacity-90" : "opacity-55"} animate-[hackerDrift_3s_linear_infinite]`} style={{ animationDelay: `${index * 110}ms` }}>
          {row}
        </p>
      ))}
    </div>
  );
}

export function SignalGraph() {
  return (
    <div className="relative h-full overflow-hidden bg-[#06270b]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,25,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,25,0.28)_1px,transparent_1px)] bg-[size:34px_26px]" />
      <svg viewBox="0 0 500 210" className="absolute inset-0 h-full w-full">
        <polyline
          points="0,180 18,104 34,185 55,150 73,72 92,58 116,54 139,20 160,37 176,144 191,58 205,153 231,174 255,111 278,146 301,12 328,148 354,29 381,162 407,143 429,43 442,161 464,17 487,186 500,150"
          fill="none"
          stroke="#00ff19"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
          className="drop-shadow-[0_0_12px_rgba(0,255,25,0.95)]"
        />
      </svg>
      <span className="absolute right-2 top-2 font-mono text-sm text-[#00ff19]">528</span>
    </div>
  );
}

export function PasswordCracker() {
  return (
    <div className="grid h-full grid-rows-[1fr_auto_auto] bg-black font-mono text-[#00ff19]">
      <div className="grid place-items-center border-b border-[#00ff19]/60 bg-black/80">
        <Folder className="h-28 w-28 stroke-[#00ff19] drop-shadow-[0_0_16px_rgba(0,255,25,0.8)]" strokeWidth={1.6} />
      </div>
      <div className="border-b border-[#00ff19]/70 p-3">
        <p className="text-sm">mKcykcX &lt; ! 5 &lt; + % w m</p>
        <div className="mt-2 grid grid-cols-[repeat(16,minmax(0,1fr))] gap-1">
          {Array.from({ length: 16 }, (_, index) => (
            <span key={index} className="grid h-5 place-items-center bg-[#00ff19] text-xs font-black text-black">✓</span>
          ))}
        </div>
      </div>
      <div className="grid gap-2 p-3 text-sm">
        <p>SUCCESS: Admin password found @ 23.86.111.0</p>
        <p>Password: <span className="bg-[#00ff19] px-2 text-black">mKcykcX</span></p>
        <p className="border-t border-[#00ff19]/50 pt-2 text-xs">Legal notice: fictional prank simulation only.</p>
      </div>
    </div>
  );
}
