"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  BookOpen, Brain, Eye, GraduationCap,
  RefreshCw, CheckCircle2, XCircle,
  Trophy, Zap, RotateCcw, BarChart3, ChevronRight,
  Keyboard, Play, Pause
} from "lucide-react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LETTER_DESCRIPTIONS = {
  A: "Fist with thumb resting alongside index finger",
  B: "Flat open hand, fingers together, thumb folded across palm",
  C: "Hand curved like a letter C, thumb opposite curved fingers",
  D: "Index finger pointing up, thumb touching middle fingertip, others curled",
  E: "Fingertips curved down to touch thumb, forming a claw shape",
  F: "Thumb and index finger form a circle, other three fingers stand straight up",
  G: "Index finger points forward, thumb parallel beside it (side view)",
  H: "Index and middle fingers point forward together, thumb on top (side view)",
  I: "Pinky finger stands straight up, all others curled into a fist",
  J: "Pinky traces a J shape — starts up, curves down and hooks",
  K: "Index and middle up like a V, thumb placed between them",
  L: "Thumb and index form an L shape, other fingers curled",
  M: "Thumb rests over index, middle, and ring fingertips",
  N: "Thumb rests over index and middle fingertips",
  O: "All fingertips touch thumb forming a circle",
  P: "Index points down, thumb beside it, middle finger extends forward",
  Q: "Index and thumb both point downward",
  R: "Index and middle fingers crossed over each other, others curled",
  S: "Fist with thumb curled across the front of fingers",
  T: "Thumb tucked between index and middle fingers in a fist",
  U: "Index and middle fingers up together like rabbit ears",
  V: "Index and middle fingers up and spread in a peace sign",
  W: "Index, middle, and ring fingers up and spread",
  X: "Index finger bent like a hook, others curled",
  Y: "Thumb and pinky extended out, others curled (hang loose)",
  Z: "Index finger traces a Z shape in the air",
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ASL_IMAGES = {
  A: "https://upload.wikimedia.org/wikipedia/commons/2/27/Sign_language_A.svg",
  B: "https://upload.wikimedia.org/wikipedia/commons/1/18/Sign_language_B.svg",
  C: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Sign_language_C.svg",
  D: "https://upload.wikimedia.org/wikipedia/commons/0/06/Sign_language_D.svg",
  E: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Sign_language_E.svg",
  F: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sign_language_F.svg",
  G: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Sign_language_G.svg",
  H: "https://upload.wikimedia.org/wikipedia/commons/9/97/Sign_language_H.svg",
  I: "https://upload.wikimedia.org/wikipedia/commons/1/10/Sign_language_I.svg",
  J: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Sign_language_J.svg",
  K: "https://upload.wikimedia.org/wikipedia/commons/9/97/Sign_language_K.svg",
  L: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Sign_language_L.svg",
  M: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Sign_language_M.svg",
  N: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Sign_language_N.svg",
  O: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Sign_language_O.svg",
  P: "https://upload.wikimedia.org/wikipedia/commons/0/08/Sign_language_P.svg",
  Q: "https://upload.wikimedia.org/wikipedia/commons/3/34/Sign_language_Q.svg",
  R: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Sign_language_R.svg",
  S: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Sign_language_S.svg",
  T: "https://upload.wikimedia.org/wikipedia/commons/1/13/Sign_language_T.svg",
  U: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Sign_language_U.svg",
  V: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sign_language_V.svg",
  W: "https://upload.wikimedia.org/wikipedia/commons/8/83/Sign_language_W.svg",
  X: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Sign_language_X.svg",
  Y: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Sign_language_Y.svg",
  Z: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Sign_language_Z.svg"
};

function ASLSign({ letter, size = 100, className = "", hideLetter = false, signStyle = "realistic" }) {
  const L = letter.toUpperCase();
  const sw = 2.2;
  const c = "currentColor";

  if (signStyle === "realistic" && ASL_IMAGES[L]) {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-[var(--surface-soft)] rounded-xl border border-[var(--border)] overflow-hidden p-2 ${className}`} style={{ width: size, height: size * 1.18 }}>
        <img
          src={ASL_IMAGES[L]}
          alt={`ASL Letter ${L}`}
          className="w-full h-full object-contain pointer-events-none select-none dark:invert"
        />
        {!hideLetter && (
          <span className="absolute bottom-1 right-2 text-[10px] font-black tracking-widest text-[var(--muted-foreground)]">
            {L}
          </span>
        )}
      </div>
    );
  }

  const palm = (
    <g>
      <path d="M38,45 Q38,25 55,23 Q72,25 72,45 L72,82 Q72,94 55,94 Q38,94 38,82 Z" fill="var(--surface-soft)" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M44,90 L44,112 Q44,117 55,117 Q66,117 66,112 L66,90" fill="var(--surface-soft)" stroke={c} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );

  // finger bases (x,y) where y is the top of palm
  const bases = {
    index: { x: 43, y: 40 },
    middle: { x: 52, y: 38 },
    ring: { x: 61, y: 40 },
    pinky: { x: 70, y: 43 },
  };

  const fingerUp = (bx, by, len = 26, offsetX = 0) => (
    <g>
      <line x1={bx + offsetX} y1={by} x2={bx + offsetX} y2={by - len} stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
      <line x1={bx + offsetX} y1={by} x2={bx + offsetX} y2={by - len} stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </g>
  );

  const fingerCurled = (bx, by) => {
    const d = `M${bx - 3},${by} C${bx - 3},${by + 6} ${bx + 1},${by + 9} ${bx + 1},${by + 9} C${bx + 1},${by + 9} ${bx + 5},${by + 6} ${bx + 5},${by}`;
    return (
      <g>
        <path d={d} fill="var(--surface-soft)" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };

  const fingerHooked = (bx, by) => {
    const d = `M${bx},${by} L${bx},${by - 16} Q${bx - 1},${by - 22} ${bx - 5},${by - 20}`;
    return (
      <g>
        <path d={d} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };

  const fingerBent45 = (bx, by) => {
    const d = `M${bx},${by} L${bx},${by - 10} L${bx + 8},${by - 20}`;
    return (
      <g>
        <path d={d} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

  const thumbAlong = () => {
    const d = "M37,58 L30,58 Q25,58 25,52 L25,22 Q25,16 30,16 L33,18";
    return (
      <g>
        <path d={d} fill="var(--surface-soft)" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

  const thumbAcross = () => {
    const d = "M38,58 L42,62 Q48,68 55,68 Q62,68 68,62";
    return (
      <g>
        <path d={d} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };

  const thumbOut = () => {
    const d = "M38,58 L24,62 Q18,64 18,58 L18,50";
    return (
      <g>
        <path d={d} fill="var(--surface-soft)" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

  const thumbDown = () => {
    const d = "M38,58 L30,65 Q25,72 25,78 L25,86";
    return (
      <g>
        <path d={d} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

  const thumbUp = () => {
    const d = "M38,58 L30,52 Q25,46 25,40 L25,20 Q25,16 30,16 L34,18";
    return (
      <g>
        <path d={d} fill="var(--surface-soft)" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

  const thumbBetween = () => {
    const d = "M38,58 L36,50 Q34,44 38,40 L42,34 Q46,30 50,32";
    return (
      <g>
        <path d={d} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };

  const thumbCircle = (bx, by) => {
    const d = `M38,58 L36,52 Q32,44 ${bx - 4},${by - 8} Q${bx},${by - 14} ${bx + 2},${by - 8}`;
    return (
      <g>
        <path d={d} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };

  const fingerCrossed = (bx1, by1, bx2, by2) => {
    const d1 = `M${bx1},${by1} L${bx1 + 3},${by1 - 18} L${bx1 - 2},${by1 - 26}`;
    const d2 = `M${bx2},${by2} L${bx2 - 2},${by2 - 20} L${bx2 + 4},${by2 - 26}`;
    return (
      <g>
        <path d={d1} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d2} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d1} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d2} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };

  const fingerDown = (bx, by) => (
    <g>
      <line x1={bx} y1={by} x2={bx} y2={by + 18} stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
      <line x1={bx} y1={by} x2={bx} y2={by + 18} stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </g>
  );

  const fingerOutRight = (bx, by) => (
    <g>
      <line x1={bx} y1={by} x2={bx + 20} y2={by} stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
      <line x1={bx} y1={by} x2={bx + 20} y2={by} stroke={c} strokeWidth={sw} strokeLinecap="round" />
    </g>
  );

  const fingerCurved = (bx, by, angle = 1) => {
    const d = `M${bx},${by} Q${bx + 6 * angle},${by - 14} ${bx + 12 * angle},${by - 8}`;
    return (
      <g>
        <path d={d} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
        <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
      </g>
    );
  };

  const renderFingers = () => {
    switch (L) {
      // A: fist, thumb alongside
      case "A": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}{fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}{fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbAlong()}
        </g>
      );
      // B: flat, fingers together, thumb across
      case "B": return (
        <g>
          {fingerUp(44, 40, 28)}{fingerUp(52, 38, 30)}{fingerUp(60, 40, 28)}{fingerUp(68, 43, 26)}
          {thumbAcross()}
        </g>
      );
      // C: curved hand
      case "C": return (
        <g>
          {fingerCurved(44, 42)}{fingerCurved(52, 40)}{fingerCurved(60, 42)}{fingerCurved(68, 45)}
          <path d="M38,58 L28,55 Q18,52 20,42 L24,30" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L28,55 Q18,52 20,42 L24,30" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // D: index up, thumb touching middle+ring
      case "D": return (
        <g>
          {fingerUp(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbCircle(bases.middle.x, bases.middle.y)}
        </g>
      );
      // E: curled to palm, thumb across
      case "E": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}{fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}{fingerCurled(bases.pinky.x, bases.pinky.y)}
          <path d="M38,58 L42,54 Q50,48 58,52 L65,56" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L42,54 Q50,48 58,52 L65,56" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // F: thumb+index circle, others up
      case "F": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}
          {fingerUp(bases.middle.x, bases.middle.y)}
          {fingerUp(bases.ring.x, bases.ring.y)}
          {fingerUp(bases.pinky.x, bases.pinky.y)}
          {thumbCircle(bases.index.x, bases.index.y)}
        </g>
      );
      // G: index point forward, thumb parallel
      case "G": return (
        <g>
          {fingerOutRight(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          <path d="M38,58 L30,56 Q24,54 24,58 L24,50" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L30,56 Q24,54 24,58 L24,50" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // H: index+middle out, thumb on top
      case "H": return (
        <g>
          {fingerOutRight(bases.index.x, bases.index.y)}
          {fingerOutRight(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbOut()}
        </g>
      );
      // I: pinky up
      case "I": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerUp(bases.pinky.x, bases.pinky.y, 22)}
          {thumbAlong()}
        </g>
      );
      // J: pinky tracing J
      case "J": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          <path d={`M${bases.pinky.x},${bases.pinky.y} L${bases.pinky.x},${bases.pinky.y - 20} Q${bases.pinky.x - 6},${bases.pinky.y - 10} ${bases.pinky.x - 2},${bases.pinky.y + 5}`} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d={`M${bases.pinky.x},${bases.pinky.y} L${bases.pinky.x},${bases.pinky.y - 20} Q${bases.pinky.x - 6},${bases.pinky.y - 10} ${bases.pinky.x - 2},${bases.pinky.y + 5}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          {thumbAlong()}
        </g>
      );
      // K: index+middle up spread, thumb between
      case "K": return (
        <g>
          {fingerUp(bases.index.x - 2, bases.index.y, 24)}
          {fingerUp(bases.middle.x + 2, bases.middle.y, 26)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbUp()}
        </g>
      );
      // L: L shape
      case "L": return (
        <g>
          {fingerUp(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbOut()}
        </g>
      );
      // M: thumb over index+middle+ring
      case "M": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          <path d="M38,58 L36,48 Q32,42 38,36 L44,32 Q50,28 56,32 L62,36 Q66,40 62,46" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L36,48 Q32,42 38,36 L44,32 Q50,28 56,32 L62,36 Q66,40 62,46" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // N: thumb over index+middle
      case "N": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          <path d="M38,58 L36,48 Q34,42 40,38 L48,32 Q54,30 56,36" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L36,48 Q34,42 40,38 L48,32 Q54,30 56,36" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // O: all fingers touch thumb forming circle
      case "O": return (
        <g>
          <path d={`M${bases.index.x},${bases.index.y} Q${bases.index.x - 2},${bases.index.y - 10} ${bases.index.x},${bases.index.y - 16}`} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d={`M${bases.index.x},${bases.index.y} Q${bases.index.x - 2},${bases.index.y - 10} ${bases.index.x},${bases.index.y - 16}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <path d={`M${bases.middle.x},${bases.middle.y} Q${bases.middle.x},${bases.middle.y - 12} ${bases.middle.x + 1},${bases.middle.y - 18}`} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d={`M${bases.middle.x},${bases.middle.y} Q${bases.middle.x},${bases.middle.y - 12} ${bases.middle.x + 1},${bases.middle.y - 18}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          <path d={`M${bases.ring.x},${bases.ring.y} Q${bases.ring.x + 2},${bases.ring.y - 10} ${bases.ring.x + 3},${bases.ring.y - 16}`} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d={`M${bases.ring.x},${bases.ring.y} Q${bases.ring.x + 2},${bases.ring.y - 10} ${bases.ring.x + 3},${bases.ring.y - 16}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          <path d="M38,58 L36,50 Q32,42 38,38 L46,34 Q52,32 56,38 Q58,42 54,46" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L36,50 Q32,42 38,38 L46,34 Q52,32 56,38 Q58,42 54,46" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // P: index down, middle forward
      case "P": return (
        <g>
          {fingerDown(bases.index.x, bases.index.y)}
          {fingerBent45(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          <path d="M38,58 L30,56 Q24,58 24,64 L24,70" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L30,56 Q24,58 24,64 L24,70" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // Q: index+thumb down
      case "Q": return (
        <g>
          {fingerDown(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbDown()}
        </g>
      );
      // R: crossed fingers
      case "R": return (
        <g>
          {fingerCrossed(bases.index.x, bases.index.y, bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbAlong()}
        </g>
      );
      // S: fist with thumb in front
      case "S": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}{fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}{fingerCurled(bases.pinky.x, bases.pinky.y)}
          <path d="M38,58 L36,50 Q34,44 40,40 L48,36 Q52,34 50,40" fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" />
          <path d="M38,58 L36,50 Q34,44 40,40 L48,36 Q52,34 50,40" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" />
        </g>
      );
      // T: thumb between index+middle
      case "T": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}{fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}{fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbBetween()}
        </g>
      );
      // U: index+middle up together
      case "U": return (
        <g>
          {fingerUp(bases.index.x, bases.index.y, 26)}
          {fingerUp(bases.middle.x, bases.middle.y, 28)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbAlong()}
        </g>
      );
      // V: index+middle spread (peace)
      case "V": return (
        <g>
          {fingerUp(bases.index.x - 3, bases.index.y, 26)}
          {fingerUp(bases.middle.x + 3, bases.middle.y, 28)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbAlong()}
        </g>
      );
      // W: index+middle+ring up
      case "W": return (
        <g>
          {fingerUp(bases.index.x - 3, bases.index.y, 24)}
          {fingerUp(bases.middle.x, bases.middle.y, 28)}
          {fingerUp(bases.ring.x + 3, bases.ring.y, 24)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbAlong()}
        </g>
      );
      // X: index hooked
      case "X": return (
        <g>
          {fingerHooked(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbAlong()}
        </g>
      );
      // Y: thumb+pinky out
      case "Y": return (
        <g>
          {fingerCurled(bases.index.x, bases.index.y)}
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerOutRight(bases.pinky.x, bases.pinky.y)}
          {thumbOut()}
        </g>
      );
      // Z: index traces Z
      case "Z": return (
        <g>
          <path d={`M${bases.index.x},${bases.index.y} L${bases.index.x + 12},${bases.index.y - 12} L${bases.index.x - 2},${bases.index.y - 12} L${bases.index.x + 10},${bases.index.y}`} fill="none" stroke="var(--surface-soft)" strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${bases.index.x},${bases.index.y} L${bases.index.x + 12},${bases.index.y - 12} L${bases.index.x - 2},${bases.index.y - 12} L${bases.index.x + 10},${bases.index.y}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          {fingerCurled(bases.middle.x, bases.middle.y)}
          {fingerCurled(bases.ring.x, bases.ring.y)}
          {fingerCurled(bases.pinky.x, bases.pinky.y)}
          {thumbAlong()}
        </g>
      );
      default: return !hideLetter ? <text x="55" y="65" textAnchor="middle" fill={c} fontSize="24" fontWeight="bold">{L}</text> : null;
    }
  };

  return (
    <svg viewBox="0 0 110 130" width={size} height={size * 1.18} className={className} aria-label={`ASL letter ${L}: ${LETTER_DESCRIPTIONS[L]}`} role="img">
      <rect width="110" height="130" fill="transparent" />
      {palm}
      {renderFingers()}
      {!hideLetter && <text x="55" y="122" textAnchor="middle" fill={c} fontSize="9" fontWeight="800" letterSpacing="1">{L}</text>}
    </svg>
  );
}

function loadProgress() {
  if (typeof window === "undefined") return { scores: {}, stats: null };
  try {
    const scores = JSON.parse(localStorage.getItem("asl_scores") || "{}");
    const stats = JSON.parse(localStorage.getItem("asl_stats") || "null");
    return { scores, stats };
  } catch {
    return { scores: {}, stats: null };
  }
}

function saveScores(scores) {
  if (typeof window === "undefined") return;
  localStorage.setItem("asl_scores", JSON.stringify(scores));
}

function saveStats(stats) {
  if (typeof window === "undefined") return;
  localStorage.setItem("asl_stats", JSON.stringify(stats));
}

function getLetterStatus(letter, scores) {
  const s = scores[letter];
  if (!s || s.total < 3) return "new";
  if (s.correct / s.total >= 0.8 && s.total >= 5) return "mastered";
  return "learning";
}

function StatusDot({ status }) {
  const colors = {
    new: "bg-gray-400 dark:bg-gray-600",
    learning: "bg-amber-400 dark:bg-amber-500",
    mastered: "bg-emerald-400 dark:bg-emerald-500",
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="p-4 rounded-xl border bg-[var(--card)] border-[var(--border)] flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
        <p className="text-xl font-black text-[var(--foreground)]">{value}</p>
      </div>
    </div>
  );
}

function QuizOption({ letter, selected, correct, disabled, onClick }) {
  const borderColor = correct === null
    ? "border-[var(--border)]"
    : correct
      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
      : selected
        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
        : "border-[var(--border)]";
  return (
    <button
      onClick={() => !disabled && onClick(letter)}
      disabled={disabled}
      className={`px-5 py-3 rounded-xl border-2 font-bold text-lg transition-all active:scale-95
        ${borderColor}
        ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-[var(--muted)] cursor-pointer"}
        bg-[var(--card)] text-[var(--foreground)]`}
      aria-label={`Select letter ${letter}`}
    >
      {letter}
    </button>
  );
}

function RecognitionOption({ letter, selected, correct, disabled, onClick, signStyle }) {
  const borderColor = correct === null
    ? "border-[var(--border)]"
    : correct
      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
      : selected
        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
        : "border-[var(--border)]";
  return (
    <button
      onClick={() => !disabled && onClick(letter)}
      disabled={disabled}
      className={`p-2 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center
        ${borderColor}
        ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-[var(--muted)] cursor-pointer"}
        bg-[var(--card)]`}
      aria-label={`Select ASL letter ${letter}`}
    >
      <ASLSign letter={letter} size={48} hideLetter={true} signStyle={signStyle} />
      <span className={`text-[10px] font-bold mt-0.5 ${selected && correct === false ? "text-red-500" : "text-[var(--muted-foreground)]"}`}>
        {letter}
      </span>
    </button>
  );
}

function WordSpeller({ signStyle }) {
  const [text, setText] = useState("HELLO");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [speed, setSpeed] = useState(1000); // ms per letter

  const letters = useMemo(() => {
    return text.toUpperCase().replace(/[^A-Z\s]/g, "").split("");
  }, [text]);

  const activeLettersOnly = useMemo(() => {
    return letters.filter(l => l !== " ");
  }, [letters]);

  // Adjust active index when text changes
  useEffect(() => {
    setActiveIndex(-1);
    setIsPlaying(false);
  }, [text]);

  useEffect(() => {
    if (!isPlaying) return;
    if (activeLettersOnly.length === 0) {
      setIsPlaying(false);
      return;
    }
    if (activeIndex === -1) {
      setActiveIndex(0);
    }
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        if (prev >= activeLettersOnly.length - 1) {
          return 0; // loop
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [isPlaying, activeLettersOnly, speed, activeIndex]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handlePlayPause = () => {
    if (activeLettersOnly.length === 0) return;
    if (activeIndex === -1) setActiveIndex(0);
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActiveIndex(-1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Input section */}
      <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
        <label htmlFor="word-input" className="block text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          Enter Word or Phrase
        </label>
        <input
          id="word-input"
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type to translate..."
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
        />
      </div>

      {/* Animation player controls */}
      {activeLettersOnly.length > 0 && (
        <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className={`p-3 rounded-xl flex items-center justify-center text-white transition-all shadow-md active:scale-95 ${
                isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-[var(--primary)] hover:opacity-90"
              }`}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={handleStop}
              className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all active:scale-95"
              aria-label="Stop animation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <div className="text-xs font-bold text-[var(--muted-foreground)]">
              {activeIndex >= 0 ? `Letter ${activeIndex + 1} of ${activeLettersOnly.length}` : "Ready to play"}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto flex-1 max-w-xs">
            <span className="text-xs font-bold text-[var(--muted-foreground)] whitespace-nowrap">Speed:</span>
            <input
              type="range"
              min="400"
              max="2000"
              step="200"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-[var(--primary)] cursor-pointer"
              aria-label="Playback speed slider"
            />
            <span className="text-xs font-bold text-[var(--muted-foreground)] whitespace-nowrap">{(speed / 1000).toFixed(1)}s</span>
          </div>
        </div>
      )}

      {/* Large Active Letter Viewer */}
      {activeIndex >= 0 && activeLettersOnly[activeIndex] && (
        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--surface-soft)] shadow-sm flex flex-col items-center justify-center animate-fade-in max-w-sm mx-auto w-full">
          <p className="text-[10px] font-black tracking-widest text-[var(--muted-foreground)] uppercase mb-3">Active Sign</p>
          <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-md">
            <ASLSign letter={activeLettersOnly[activeIndex]} size={160} signStyle={signStyle} hideLetter={true} />
          </div>
          <span className="text-5xl font-black text-[var(--foreground)] mt-4">{activeLettersOnly[activeIndex]}</span>
        </div>
      )}

      {/* Spelled-out sequence grid */}
      {letters.length > 0 ? (
        <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] mb-4">Translation Sequence</h4>
          <div className="flex flex-wrap gap-3">
            {letters.map((char, idx) => {
              if (char === " ") {
                return (
                  <div key={idx} className="w-16 h-20 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center bg-[var(--surface-soft)]" aria-label="Space separator">
                    <span className="text-xs text-[var(--muted-foreground)] font-bold">Space</span>
                  </div>
                );
              }

              // Determine if this letter matches the animation pointer
              const letterIndex = letters.slice(0, idx).filter(l => l !== " ").length;
              const isActive = activeIndex === letterIndex;

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    isActive
                      ? "ring-4 ring-[var(--primary)] border-[var(--primary)] scale-105 shadow-md bg-[var(--surface-soft)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                >
                  <ASLSign letter={char} size={50} signStyle={signStyle} hideLetter={true} />
                  <span className={`text-xs font-black ${isActive ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>{char}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center p-12 border border-[var(--border)] bg-[var(--card)] rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)]">Type something in the input box above to start translating!</p>
        </div>
      )}
    </div>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("learn");
  const [signStyle, setSignStyle] = useState("realistic");
  const [initialData] = useState(loadProgress);
  const [scores, setScores] = useState(initialData.scores);
  const [stats, setStats] = useState(initialData.stats);
  const [quizLetter, setQuizLetter] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizCorrect, setQuizCorrect] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [recogLetter, setRecogLetter] = useState(null);
  const [recogOptions, setRecogOptions] = useState([]);
  const [recogSelected, setRecogSelected] = useState(null);
  const [recogCorrect, setRecogCorrect] = useState(null);
  const [recogResult, setRecogResult] = useState(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswered, setPracticeAnswered] = useState(null);
  const [practiceCorrect, setPracticeCorrect] = useState(null);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [streakCount, setStreakCount] = useState(stats?.streak || 0);
  const [totalCorrect, setTotalCorrect] = useState(stats?.correct || 0);
  const [totalIncorrect, setTotalIncorrect] = useState(stats?.incorrect || 0);
  const [bestStreak, setBestStreak] = useState(stats?.bestStreak || 0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [recogStarted, setRecogStarted] = useState(false);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const streakRef = useRef(streakCount);

  const letterStatuses = useMemo(() => {
    const map = {};
    for (const l of ALPHABET) {
      map[l] = getLetterStatus(l, scores);
    }
    return map;
  }, [scores]);

  const masteredCount = Object.values(letterStatuses).filter(s => s === "mastered").length;

  const persistScores = useCallback((newScores) => {
    setScores(newScores);
    saveScores(newScores);
  }, []);

  const persistStats = useCallback((newStats) => {
    setStats(newStats);
    saveStats(newStats);
  }, []);

  const recordAnswer = useCallback((letter, isCorrect) => {
    const newScores = { ...scores };
    if (!newScores[letter]) newScores[letter] = { correct: 0, total: 0 };
    newScores[letter] = {
      correct: newScores[letter].correct + (isCorrect ? 1 : 0),
      total: newScores[letter].total + 1,
    };
    persistScores(newScores);

    const newTotalCorrect = totalCorrect + (isCorrect ? 1 : 0);
    const newTotalIncorrect = totalIncorrect + (isCorrect ? 0 : 1);
    setTotalCorrect(newTotalCorrect);
    setTotalIncorrect(newTotalIncorrect);

    if (isCorrect) {
      const newStreak = streakRef.current + 1;
      streakRef.current = newStreak;
      setStreakCount(newStreak);
      const newBest = Math.max(bestStreak, newStreak);
      setBestStreak(newBest);
      persistStats({ streak: newStreak, correct: newTotalCorrect, incorrect: newTotalIncorrect, bestStreak: newBest });
    } else {
      streakRef.current = 0;
      setStreakCount(0);
      persistStats({ streak: 0, correct: newTotalCorrect, incorrect: newTotalIncorrect, bestStreak: bestStreak });
    }
  }, [scores, totalCorrect, totalIncorrect, bestStreak, persistScores, persistStats]);

  const startQuiz = useCallback(() => {
    const allShuffled = shuffleArray(ALPHABET);
    const correct = allShuffled[0];
    const wrong = allShuffled.slice(1, 5);
    const options = shuffleArray([correct, ...wrong]);
    setQuizLetter(correct);
    setQuizOptions(options);
    setQuizSelected(null);
    setQuizCorrect(null);
    setQuizResult(null);
    setQuizStarted(true);
  }, []);

  const startRecognition = useCallback(() => {
    const allShuffled = shuffleArray(ALPHABET);
    const correct = allShuffled[0];
    const wrong = allShuffled.slice(1, 5);
    const options = shuffleArray([correct, ...wrong]);
    setRecogLetter(correct);
    setRecogOptions(options);
    setRecogSelected(null);
    setRecogCorrect(null);
    setRecogResult(null);
    setRecogStarted(true);
  }, []);

  const startPractice = useCallback(() => {
    setPracticeIndex(0);
    setPracticeAnswered(null);
    setPracticeCorrect(null);
    setPracticeStreak(0);
    setPracticeStarted(true);
  }, []);

  const handleQuizAnswer = useCallback((letter) => {
    if (quizCorrect !== null) return;
    const isCorrect = letter === quizLetter;
    setQuizSelected(letter);
    setQuizCorrect(isCorrect);
    setQuizResult(isCorrect ? "correct" : "incorrect");
    recordAnswer(quizLetter, isCorrect);
  }, [quizLetter, quizCorrect, recordAnswer]);

  const handleRecogAnswer = useCallback((letter) => {
    if (recogCorrect !== null) return;
    const isCorrect = letter === recogLetter;
    setRecogSelected(letter);
    setRecogCorrect(isCorrect);
    setRecogResult(isCorrect ? "correct" : "incorrect");
    recordAnswer(recogLetter, isCorrect);
  }, [recogLetter, recogCorrect, recordAnswer]);

  const handlePracticeAnswer = useCallback((letter) => {
    if (practiceAnswered !== null) return;
    const current = ALPHABET[practiceIndex];
    const isCorrect = letter === current;
    setPracticeAnswered(letter);
    setPracticeCorrect(isCorrect);
    if (isCorrect) {
      setPracticeStreak(s => s + 1);
    } else {
      setPracticeStreak(0);
    }
    recordAnswer(current, isCorrect);
  }, [practiceIndex, practiceAnswered, recordAnswer]);

  const nextPractice = useCallback(() => {
    if (practiceIndex < 25) {
      setPracticeIndex(i => i + 1);
      setPracticeAnswered(null);
      setPracticeCorrect(null);
    }
  }, [practiceIndex]);

  const modeButtons = [
    { key: "learn", label: "Learn", icon: BookOpen },
    { key: "quiz", label: "Quiz", icon: Brain },
    { key: "recognition", label: "Recognition", icon: Eye },
    { key: "practice", label: "Practice", icon: GraduationCap },
    { key: "speller", label: "Word Speller", icon: Keyboard },
  ];

  const isQuizReady = mode === "quiz" && quizLetter !== null;

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="heading flex justify-center gap-2 animate-fade-up mb-2">
            Sign Language Alphabet Trainer
          </h1>
          <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-4">
            Learn American Sign Language A–Z
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <Trophy className="w-3.5 h-3.5" /> {masteredCount}/26 Mastered
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <Zap className="w-3.5 h-3.5" /> {streakCount} Streak
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--primary)" }}>
              <BarChart3 className="w-3.5 h-3.5" /> {totalCorrect}/{totalCorrect + totalIncorrect || 0}
            </span>
          </div>
          {bestStreak > 0 && (
            <span className="text-xs font-bold text-[var(--muted-foreground)]">Best Streak: {bestStreak}</span>
          )}
          {/* Sign Style Toggle Switcher */}
          <div className="flex items-center gap-2 mt-4 bg-[var(--surface-soft)] p-1 rounded-xl border border-[var(--border)]">
            <span className="text-[10px] font-black text-[var(--muted-foreground)] px-2 uppercase tracking-wider">Style:</span>
            <button
              onClick={() => setSignStyle("realistic")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                signStyle === "realistic"
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Realistic Hand Signs
            </button>
            <button
              onClick={() => setSignStyle("outline")}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                signStyle === "outline"
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Outline Diagrams
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-[var(--muted)] gap-1 flex-wrap justify-center">
            {modeButtons.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                  ${mode === key
                    ? "bg-[var(--card)] text-[var(--primary)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* LEARN MODE */}
        {mode === "learn" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Alphabet Cards</h2>
              <button
                onClick={() => setShowDescriptions(d => !d)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all"
              >
                {showDescriptions ? "Hide" : "Show"} Descriptions
              </button>
            </div>
            {(() => {
              const rows = [];
              for (let i = 0; i < 26; i += 6) {
                const chunk = ALPHABET.slice(i, i + 6);
                rows.push(
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                    {chunk.map(l => {
                      const st = letterStatuses[l];
                      return (
                        <div
                          key={l}
                          className="rounded-2xl border p-3 flex flex-col items-center gap-1 transition-all hover:shadow-md"
                          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                        >
                          <ASLSign letter={l} size={56} signStyle={signStyle} />
                          <span className="text-lg font-black text-[var(--foreground)]">{l}</span>
                          <StatusDot status={st} />
                          {showDescriptions && (
                            <p className="text-[10px] text-center leading-tight text-[var(--muted-foreground)] mt-1">
                              {LETTER_DESCRIPTIONS[l]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }
              return rows;
            })()}
          </div>
        )}

        {/* QUIZ MODE */}
        {mode === "quiz" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-[var(--muted-foreground)] mb-1">Identify the ASL Hand Shape</p>
              <p className="text-xs text-[var(--muted-foreground)]">Which letter does this hand shape represent?</p>
            </div>
            {!quizStarted ? (
              <div className="text-center p-12 rounded-3xl border bg-[var(--card)] border-[var(--border)]">
                <Brain className="w-16 h-16 mx-auto mb-4 text-[var(--primary)] opacity-40" />
                <p className="text-lg font-bold mb-2 text-[var(--foreground)]">Ready for a Quiz?</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">You will see a hand shape and must pick the correct letter.</p>
                <button onClick={startQuiz} className="px-8 py-3 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all">
                  Start Quiz
                </button>
              </div>
            ) : !isQuizReady ? (
              <div className="text-center p-12 rounded-3xl border bg-[var(--card)] border-[var(--border)]">
                <p className="text-sm text-[var(--muted-foreground)]">Loading question...</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-6">
                  <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)]">
                    <ASLSign letter={quizLetter} size={140} hideLetter={true} signStyle={signStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quizOptions.map(l => (
                    <QuizOption
                      key={l}
                      letter={l}
                      selected={quizSelected === l}
                      correct={quizSelected === null ? null : l === quizLetter}
                      disabled={quizSelected !== null}
                      onClick={handleQuizAnswer}
                    />
                  ))}
                </div>
                {quizResult && (
                  <div className={`mt-4 p-4 rounded-xl text-center font-bold text-sm ${quizResult === "correct" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}>
                    {quizResult === "correct" ? (
                      <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct!</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Incorrect — it was {quizLetter}</span>
                    )}
                    <p className="text-xs font-normal mt-1 opacity-80">{LETTER_DESCRIPTIONS[quizLetter]}</p>
                  </div>
                )}
                {quizCorrect !== null && (
                  <button onClick={startQuiz} className="w-full mt-4 py-3 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Next Question
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* RECOGNITION MODE */}
        {mode === "recognition" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-[var(--muted-foreground)] mb-1">Identify the Correct Hand Shape</p>
              <p className="text-xs text-[var(--muted-foreground)]">Which hand shape represents this letter?</p>
            </div>
            {!recogStarted ? (
              <div className="text-center p-12 rounded-3xl border bg-[var(--card)] border-[var(--border)]">
                <Eye className="w-16 h-16 mx-auto mb-4 text-[var(--primary)] opacity-40" />
                <p className="text-lg font-bold mb-2 text-[var(--foreground)]">Ready for Recognition?</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">You will see a letter and must pick the correct hand shape.</p>
                <button onClick={startRecognition} className="px-8 py-3 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all">
                  Start Recognition
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-center mb-6">
                  <div className="p-6 rounded-2xl border bg-[var(--card)] border-[var(--border)] text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Find this letter</p>
                    <span className="text-7xl font-black text-[var(--foreground)]">{recogLetter}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {recogOptions.map(l => (
                    <RecognitionOption
                      key={l}
                      letter={l}
                      selected={recogSelected === l}
                      correct={recogSelected === null ? null : l === recogLetter}
                      disabled={recogSelected !== null}
                      onClick={handleRecogAnswer}
                      signStyle={signStyle}
                    />
                  ))}
                </div>
                {recogResult && (
                  <div className={`mt-4 p-4 rounded-xl text-center font-bold text-sm ${recogResult === "correct" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}>
                    {recogResult === "correct" ? (
                      <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct!</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Incorrect — {recogLetter} is correct</span>
                    )}
                    <p className="text-xs font-normal mt-1 opacity-80">{LETTER_DESCRIPTIONS[recogLetter]}</p>
                  </div>
                )}
                {recogCorrect !== null && (
                  <button onClick={startRecognition} className="w-full mt-4 py-3 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" /> Next Question
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* PRACTICE MODE */}
        {mode === "practice" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-[var(--muted-foreground)] mb-1">Sequential Practice</p>
              <p className="text-xs text-[var(--muted-foreground)]">Go through A–Z one letter at a time</p>
            </div>
            {!practiceStarted ? (
              <div className="text-center p-12 rounded-3xl border bg-[var(--card)] border-[var(--border)]">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-[var(--primary)] opacity-40" />
                <p className="text-lg font-bold mb-2 text-[var(--foreground)]">Ready to Practice?</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-6">Go through the alphabet sequentially, answering each letter.</p>
                <button onClick={startPractice} className="px-8 py-3 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all">
                  Start Practice
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[var(--muted-foreground)]">
                    Letter {practiceIndex + 1} of 26
                  </span>
                  <div className="flex gap-1">
                    {ALPHABET.map((_, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full ${i < practiceIndex ? "bg-[var(--primary)]" : i === practiceIndex ? "bg-amber-400" : "bg-[var(--muted)]"}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] text-center flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Hand Shape</p>
                    <ASLSign letter={ALPHABET[practiceIndex]} size={120} className="mx-auto" hideLetter={true} signStyle={signStyle} />
                  </div>
                  <div className="text-2xl font-black text-[var(--muted-foreground)]">?</div>
                  <div className="p-5 rounded-2xl border bg-[var(--card)] border-[var(--border)] text-center flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Letter</p>
                    <div className="flex flex-col items-center justify-center min-h-[120px]">
                      {practiceAnswered !== null ? (
                        <span className={`text-7xl font-black ${practiceCorrect ? "text-emerald-500" : "text-red-500"}`}>
                          {practiceCorrect ? ALPHABET[practiceIndex] : practiceAnswered}
                        </span>
                      ) : (
                        <p className="text-xl font-bold text-[var(--muted-foreground)]">Your answer</p>
                      )}
                    </div>
                  </div>
                </div>
                {practiceAnswered === null ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                    {ALPHABET.map(l => (
                      <button
                        key={l}
                        onClick={() => handlePracticeAnswer(l)}
                        className="p-2 rounded-xl border text-sm font-bold transition-all active:scale-95 hover:bg-[var(--muted)] cursor-pointer"
                        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        aria-label={`Answer ${l}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className={`p-4 rounded-xl text-center font-bold text-sm ${practiceCorrect ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}>
                      {practiceCorrect ? (
                        <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" /> Correct! Streak: {practiceStreak}</span>
                      ) : (
                        <span className="flex items-center justify-center gap-2"><XCircle className="w-5 h-5" /> Incorrect — it was {ALPHABET[practiceIndex]}</span>
                      )}
                      <p className="text-xs font-normal mt-1 opacity-80">{LETTER_DESCRIPTIONS[ALPHABET[practiceIndex]]}</p>
                    </div>
                    <div className="flex gap-3 mt-4">
                      {practiceIndex < 25 ? (
                        <button onClick={nextPractice} className="flex-1 py-3 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={startPractice} className="flex-1 py-3 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4" /> Restart Practice
                        </button>
                      )}
                      <button onClick={startPractice} className="px-4 py-3 rounded-xl font-bold border bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] active:scale-95 transition-all flex items-center justify-center" aria-label="Restart practice">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WORD SPELLER MODE */}
        {mode === "speller" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-sm font-bold text-[var(--muted-foreground)] mb-1">Fingerspelling Word Translator</p>
              <p className="text-xs text-[var(--muted-foreground)]">Type a word or phrase to see how to spell it in sign language</p>
            </div>
            <WordSpeller signStyle={signStyle} />
          </div>
        )}

        {/* PROGRESS SECTION */}
        {(mode === "learn" || totalCorrect + totalIncorrect > 0) && (
          <div className="mt-10">
            <div className="rounded-3xl p-6 border bg-[var(--card)] border-[var(--border)]">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--foreground)] uppercase tracking-widest">
                <BarChart3 className="w-4 h-4" /> Progress Overview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Correct" value={totalCorrect} icon={CheckCircle2} color="bg-emerald-500" />
                <StatCard label="Incorrect" value={totalIncorrect} icon={XCircle} color="bg-red-500" />
                <StatCard label="Streak" value={streakCount} icon={Zap} color="bg-amber-500" />
                <StatCard label="Mastered" value={`${masteredCount}/26`} icon={Trophy} color="bg-purple-500" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {ALPHABET.map(l => (
                  <div key={l} className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg border min-w-[32px]" style={{ borderColor: "var(--border)" }}>
                    <span className="text-xs font-bold text-[var(--foreground)]">{l}</span>
                    <StatusDot status={letterStatuses[l]} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-bold text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1"><StatusDot status="new" /> New</span>
                <span className="flex items-center gap-1"><StatusDot status="learning" /> Learning</span>
                <span className="flex items-center gap-1"><StatusDot status="mastered" /> Mastered</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
