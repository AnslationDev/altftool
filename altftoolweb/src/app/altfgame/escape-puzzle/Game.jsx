"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

const PUZZLE_CODE = "4317";

const roomItems = [
  {
    id: "painting",
    name: "Painting",
    area: { left: "8%", top: "18%", height: "26%", width: "22%" },
    clue: "Behind the painting: a note reads — 'The first number is the count of picture corners.'",
    reward: "Note A",
    icon: "🖼️",
  },
  {
    id: "clock",
    name: "Clock",
    area: { left: "43%", top: "10%", height: "20%", width: "15%" },
    clue: "The clock is frozen at 3:00. The second number is the hour hand.",
    reward: "Note B",
    icon: "🕰️",
  },
  {
    id: "books",
    name: "Books",
    area: { right: "8%", top: "24%", height: "36%", width: "22%" },
    clue: "A book titled 'One Way Out'. The third number is hidden in the title.",
    reward: "Note C",
    icon: "📚",
  },
  {
    id: "plant",
    name: "Plant",
    area: { left: "19%", bottom: "8%", height: "26%", width: "15%" },
    clue: "Under the plant pot, a tiny tag reads: '7'.",
    reward: "Note D",
    icon: "🌿",
  },
  {
    id: "rug",
    name: "Rug",
    area: { left: "38%", bottom: "8%", height: "18%", width: "28%" },
    clue: "The rug's arrows point toward the door keypad.",
    reward: "Keypad Hint",
    icon: "🗺️",
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');

  .escape-root, .escape-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .escape-root, .loader-overlay, .win-overlay {
    --bg: #06040c;
    --panel: rgba(12, 8, 20, 0.92);
    --border: rgba(180, 120, 255, 0.18);
    --border-bright: rgba(180, 120, 255, 0.45);
    --gold: #f5c842;
    --gold-dim: rgba(245, 200, 66, 0.15);
    --purple: #a855f7;
    --purple-dim: rgba(168, 85, 247, 0.12);
    --green: #22d3a0;
    --green-dim: rgba(34, 211, 160, 0.12);
    --red: #f04040;
    --red-dim: rgba(240, 64, 64, 0.12);
    --text: #e8ddf8;
    --text-muted: rgba(200, 180, 240, 0.5);
    --font-display: 'Orbitron', monospace;
    --font-ui: 'Rajdhani', sans-serif;
    --font-mono: 'Share Tech Mono', monospace;
  }

  .escape-root {
    font-family: var(--font-ui);
    background: var(--bg);
    color: var(--text);
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 0.75rem;
    background-image:
      radial-gradient(ellipse at 20% 0%, rgba(139, 60, 255, 0.14) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(245, 200, 66, 0.07) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(34, 211, 160, 0.04) 0%, transparent 70%);
  }

  .scanline {
    display: none;
    position: absolute;
    inset: 0;
    border-radius: 0.75rem;
    pointer-events: none;
    z-index: 9999;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0,0,0,0.08) 3px,
      rgba(0,0,0,0.08) 4px
    );
  }

  .noise {
    display: none;
    position: absolute;
    inset: 0;
    border-radius: 0.75rem;
    pointer-events: none;
    z-index: 9998;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ─── HEADER ─── */
  .hdr {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    height: 42px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
    backdrop-filter: blur(24px);
    position: relative;
    z-index: 10;
  }
  .hdr::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--purple), transparent);
    opacity: 0.6;
  }
  .hdr-brand {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 0.18em;
    color: var(--gold);
    text-shadow: 0 0 20px rgba(245,200,66,0.5);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hdr-brand-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--red);
    box-shadow: 0 0 12px var(--red);
    animation: blink 1.4s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .hdr-stats {
    display: flex;
    gap: 4px;
  }
  .stat-chip {
    font-family: var(--font-mono);
    font-size: 13px;
    padding: 4px 14px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stat-chip .sv {
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
  }
  .stat-chip.urgent .sv { color: var(--red); text-shadow: 0 0 10px var(--red); }

  /* ─── BODY ─── */
  .body {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 0;
    overflow: hidden;
    min-height: 0;
  }

  /* ─── ROOM ─── */
  .room-wrap {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-right: 1px solid var(--border);
    position: relative;
  }
  .room-topbar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
    min-height: 0;
  }
  .room-label {
    font-family: var(--font-display);
    font-size: 8px;
    letter-spacing: 0.3em;
    color: var(--text-muted);
    text-transform: uppercase;
  }
  .clue-msg {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 500;
    color: var(--gold);
    max-width: 420px;
    line-height: 1.4;
    text-align: right;
    opacity: 0.9;
  }
  .room-scene {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  /* Room bg */
  .room-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 52% 38%, rgba(180,120,60,0.22) 0%, transparent 55%),
      linear-gradient(180deg, #1e1209 0%, #5a3220 55%, #1a0d08 100%);
  }
  .room-ceiling {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 18%;
    background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%);
  }
  .room-floor {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 24%;
    background: linear-gradient(135deg, #2a1510, #5a3420, #1e0e0a);
    border-top: 1px solid rgba(255,200,100,0.08);
  }
  .room-light {
    position: absolute;
    top: 0; left: 50%; transform: translateX(-50%);
    width: 60%; height: 70%;
    background: radial-gradient(ellipse at 50% 0%, rgba(255,200,120,0.12), transparent 70%);
    pointer-events: none;
  }

  /* Room objects */
  .obj-painting {
    position: absolute;
    left: 9%; top: 19%;
    width: 19%; height: 23%;
    background: linear-gradient(135deg, #c8a460, #e8c880, #c8a060);
    border: 8px solid #3a2510;
    border-radius: 4px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .obj-painting-inner {
    width: 85%; height: 85%;
    background: linear-gradient(135deg, #7a9060, #4a6840, #6a8050);
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(20px, 4vw, 36px);
    border-radius: 2px;
  }
  .obj-clock {
    position: absolute;
    left: 44%; top: 11%;
    width: 12%; height: 17%;
    background: radial-gradient(circle, #e8e0d0, #c8c0b0);
    border: 6px solid #2a1a10;
    border-radius: 50%;
    box-shadow: 0 6px 30px rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(18px, 3vw, 32px);
    font-weight: 900;
    color: #2a1a10;
    font-family: var(--font-display);
  }
  .obj-bookshelf {
    position: absolute;
    right: 8%; top: 22%;
    width: 20%; height: 38%;
    background: #2a1810;
    border-radius: 4px 4px 0 0;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7);
    overflow: hidden;
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    gap: 3px;
    padding: 6px;
    border: 4px solid #1a1008;
  }
  .obj-shelf-row {
    background: #1a1008;
    border-radius: 2px;
    display: flex; gap: 3px; align-items: flex-end; padding: 3px;
  }
  .obj-book {
    flex: 1; border-radius: 1px 2px 0 0;
    min-width: 6px;
  }
  .obj-plant-base {
    position: absolute;
    left: 20%; bottom: 9%;
    width: 10%; height: 7%;
    background: linear-gradient(180deg, #5a3820, #3a2010);
    border-radius: 4px 4px 6px 6px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  .obj-plant-stem {
    position: absolute;
    left: 23%; bottom: 16%;
    width: 4%; height: 18%;
    background: linear-gradient(180deg, #2a6020, #1a4010);
    border-radius: 20px 20px 0 0;
  }
  .obj-plant-leaves {
    position: absolute;
    left: 18%; bottom: 30%;
    width: 14%; height: 14%;
    background: radial-gradient(circle, #3a8030, #2a6020);
    border-radius: 50% 50% 20% 20%;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(12px, 2.5vw, 22px);
  }
  .obj-rug {
    position: absolute;
    left: 38%; bottom: 8%;
    width: 27%; height: 15%;
    background: linear-gradient(135deg, #7a2020, #a03030, #6a1a1a);
    border-radius: 6px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .obj-rug-pattern {
    width: 90%; height: 80%;
    border: 2px solid rgba(255,200,180,0.2);
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(10px, 2vw, 18px);
    color: rgba(255,200,180,0.5);
    letter-spacing: 4px;
  }
  .obj-door {
    position: absolute;
    right: 30%; bottom: 9%;
    width: 13%; height: 62%;
    background: linear-gradient(180deg, #3a2818, #2a1c10);
    border-radius: 4px 4px 0 0;
    box-shadow: 0 0 40px rgba(0,0,0,0.6);
    border: 3px solid #1a1008;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 8px;
  }
  .obj-door-knob {
    width: 14px; height: 14px;
    border-radius: 50%;
    margin-left: 30%;
  }
  .obj-keypad {
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(255,200,100,0.15);
    border-radius: 4px;
    padding: 5px;
    display: grid;
    grid-template-columns: repeat(2, 10px);
    gap: 3px;
  }
  .kp-dot { width: 8px; height: 8px; border-radius: 2px; background: rgba(255,200,100,0.3); }

  /* Hotspot buttons */
  .hotspot {
    position: absolute;
    border-radius: 6px;
    border: 2px dashed transparent;
    transition: all 0.2s ease;
    cursor: pointer;
    background: transparent;
    z-index: 5;
  }
  .hotspot:hover, .hotspot.active {
    border-color: rgba(245,200,66,0.7);
    background: rgba(245,200,66,0.08);
    box-shadow: 0 0 20px rgba(245,200,66,0.15), inset 0 0 10px rgba(245,200,66,0.05);
  }
  .hotspot.found {
    border-color: rgba(34,211,160,0.6);
    background: rgba(34,211,160,0.07);
  }
  .hotspot.found:hover {
    border-color: rgba(34,211,160,0.9);
    background: rgba(34,211,160,0.12);
  }
  .hotspot-label {
    position: absolute;
    bottom: calc(100% + 6px); left: 50%;
    transform: translateX(-50%);
    background: rgba(6,4,12,0.95);
    border: 1px solid var(--border-bright);
    border-radius: 6px;
    padding: 4px 10px;
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--gold);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .hotspot:hover .hotspot-label { opacity: 1; }
  .hotspot-found-badge {
    position: absolute;
    top: 4px; right: 4px;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
    display: flex; align-items: center; justify-content: center;
    font-size: 8px;
    color: #000;
    font-weight: 900;
  }

  /* Progress bar */
  .prog-bar {
    flex-shrink: 0;
    height: 3px;
    background: rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
  }
  .prog-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--purple), var(--green));
    transition: width 0.5s ease;
    position: relative;
  }
  .prog-fill::after {
    content: '';
    position: absolute;
    right: 0; top: 0; bottom: 0;
    width: 40px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6));
    animation: shimmer 1.5s ease-in-out infinite;
  }
  @keyframes shimmer { 0%,100%{opacity:0} 50%{opacity:1} }

  /* ─── SIDEBAR ─── */
  .sidebar {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background: var(--panel);
    min-height: 0;
  }
  .sb-section {
    flex-shrink: 0;
    border-bottom: 1px solid var(--border);
    padding: 10px 12px;
  }
  .sb-section.inventory {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    align-content: flex-start;
  }
  .sb-section.inventory .sb-title { width: 100%; }
  .sb-section.inventory .inv-item {
    width: calc(50% - 2px);
    margin-bottom: 0;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sb-title {
    font-family: var(--font-display);
    font-size: 9px;
    letter-spacing: 0.28em;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sb-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* Keypad */
  .code-display {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.35em;
    text-align: center;
    padding: 8px 10px;
    background: rgba(0,0,0,0.6);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 6px;
    position: relative;
    overflow: hidden;
  }
  .code-display.unlocked {
    border-color: rgba(34,211,160,0.4);
    color: var(--green);
    text-shadow: 0 0 20px rgba(34,211,160,0.6);
  }
  .code-display.wrong {
    border-color: rgba(240,64,64,0.4);
    animation: shake 0.4s ease;
  }
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)}
    60%{transform:translateX(-4px)}
    80%{transform:translateX(4px)}
  }
  .code-scan {
    position: absolute;
    inset-y: 0; left: -100%;
    width: 50%;
    background: linear-gradient(90deg, transparent, rgba(168,85,247,0.15), transparent);
    animation: codescan 2.5s ease-in-out infinite;
  }
  @keyframes codescan { 0%{left:-100%} 100%{left:200%} }

  .numpad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .npbtn {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    color: var(--text);
    cursor: pointer;
    transition: all 0.12s ease;
    letter-spacing: 0.05em;
  }
  .npbtn:hover {
    background: var(--purple-dim);
    border-color: var(--border-bright);
    color: var(--purple);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(168,85,247,0.2);
  }
  .npbtn:active { transform: translateY(0) scale(0.96); }
  .npbtn.clear {
    background: var(--red-dim);
    border-color: rgba(240,64,64,0.25);
    color: var(--red);
    font-size: 11px;
    letter-spacing: 0.1em;
  }
  .npbtn.clear:hover { background: rgba(240,64,64,0.2); border-color: var(--red); }
  .npbtn.enter {
    background: rgba(34,211,160,0.12);
    border-color: rgba(34,211,160,0.3);
    color: var(--green);
    font-size: 11px;
    letter-spacing: 0.12em;
  }
  .npbtn.enter:hover { background: rgba(34,211,160,0.2); box-shadow: 0 4px 16px rgba(34,211,160,0.25); }

  /* Inventory */
  .inv-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid transparent;
    margin-bottom: 3px;
    font-size: 11px;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: default;
  }
  .inv-item.hidden-inv {
    border-color: var(--border);
    background: rgba(255,255,255,0.02);
    color: var(--text-muted);
  }
  .inv-item.found-inv {
    border-color: rgba(34,211,160,0.25);
    background: var(--green-dim);
    color: var(--green);
  }
  .inv-icon { font-size: 12px; min-width: 16px; text-align: center; }
  .inv-badge {
    margin-left: auto;
    font-size: 9px;
    font-family: var(--font-display);
    letter-spacing: 0.12em;
    padding: 2px 6px;
    border-radius: 3px;
    background: rgba(34,211,160,0.15);
    color: var(--green);
    border: 1px solid rgba(34,211,160,0.2);
  }

  /* Action buttons */
  .action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .act-btn {
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    height: 36px;
    border-radius: 6px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .act-hint {
    background: var(--gold-dim);
    border-color: rgba(245,200,66,0.3);
    color: var(--gold);
  }
  .act-hint:hover {
    background: rgba(245,200,66,0.2);
    box-shadow: 0 4px 16px rgba(245,200,66,0.2);
    transform: translateY(-1px);
  }
  .act-reset {
    background: rgba(255,255,255,0.03);
    border-color: var(--border);
    color: var(--text-muted);
  }
  .act-reset:hover {
    background: rgba(255,255,255,0.08);
    color: var(--text);
    transform: translateY(-1px);
  }

  /* Win panel */
  .win-overlay {
    position: absolute;
    inset: 0;
    z-index: 100;
    border-radius: 0.75rem;
    background: rgba(6,4,12,0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    animation: fadeIn 0.4s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .win-card {
    text-align: center;
    padding: 40px;
    max-width: 440px;
    width: 90%;
    border: 1px solid rgba(34,211,160,0.3);
    border-radius: 16px;
    background: rgba(12,8,20,0.98);
    box-shadow: 0 0 80px rgba(34,211,160,0.12), 0 40px 100px rgba(0,0,0,0.6);
    animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes popIn { from{transform:scale(0.8) translateY(20px);opacity:0} to{transform:scale(1);opacity:1} }
  .win-icon {
    font-size: 60px;
    margin-bottom: 16px;
    filter: drop-shadow(0 0 20px rgba(34,211,160,0.5));
  }
  .win-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.15em;
    color: var(--green);
    text-shadow: 0 0 30px rgba(34,211,160,0.5);
    margin-bottom: 8px;
  }
  .win-sub {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .win-stat {
    display: inline-flex;
    gap: 24px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 24px;
    margin-bottom: 24px;
  }
  .win-stat-item { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }
  .win-stat-item span { color: var(--green); font-size: 18px; font-weight: 700; display: block; }
  .win-play-again {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    padding: 12px 32px;
    border-radius: 8px;
    border: 1px solid rgba(34,211,160,0.4);
    background: rgba(34,211,160,0.12);
    color: var(--green);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .win-play-again:hover {
    background: rgba(34,211,160,0.22);
    box-shadow: 0 8px 30px rgba(34,211,160,0.25);
    transform: translateY(-2px);
  }

  /* Loader */
  .loader-overlay {
    position: absolute;
    inset: 0;
    z-index: 200;
    border-radius: 0.75rem;
    background: #06040c;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0;
    transition: opacity 0.5s ease;
  }
  .loader-overlay.fading { opacity: 0; pointer-events: none; }
  .loader-glyph {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 900;
    color: var(--gold);
    text-shadow: 0 0 40px rgba(245,200,66,0.6);
    margin-bottom: 24px;
    letter-spacing: 0.05em;
  }
  .loader-title {
    font-family: var(--font-display);
    font-size: clamp(20px, 4vw, 34px);
    font-weight: 900;
    letter-spacing: 0.15em;
    color: white;
    margin-bottom: 8px;
    text-align: center;
  }
  .loader-sub {
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 40px;
    text-align: center;
  }
  .loader-bar-wrap {
    width: min(380px, 80vw);
    height: 2px;
    background: rgba(255,255,255,0.06);
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .loader-bar-fill {
    height: 100%;
    border-radius: 99px;
    background: linear-gradient(90deg, var(--purple), var(--gold));
    animation: loaderFill 1.5s ease-in-out forwards;
  }
  @keyframes loaderFill { 0%{width:0%} 60%{width:80%} 85%{width:92%} 100%{width:100%} }
  .loader-txt {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.15em;
    animation: cycleText 1.5s steps(1) forwards;
    text-align: center;
  }
  @keyframes cycleText {
    0%{opacity:0.4}
    25%{opacity:1}
    50%{opacity:0.6}
    75%{opacity:1}
    100%{opacity:0.4}
  }

  /* Door status */
  .door-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.15em;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid;
  }
  .door-status.locked {
    color: var(--red);
    border-color: rgba(240,64,64,0.25);
    background: var(--red-dim);
  }
  .door-status.unlocked {
    color: var(--green);
    border-color: rgba(34,211,160,0.25);
    background: var(--green-dim);
  }
  .door-dot {
    width: 6px; height: 6px; border-radius: 50%;
    animation: blink 1.2s ease-in-out infinite;
  }
  .locked .door-dot { background: var(--red); box-shadow: 0 0 6px var(--red); }
  .unlocked .door-dot { background: var(--green); box-shadow: 0 0 6px var(--green); animation: none; }
`;

function formatTime(s) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

const bookColors = ["#c04040","#4080c0","#40a060","#c09040","#8040c0","#c06080","#408080","#80a040","#c05030","#4060a0","#60c080","#a05050"];

export default function EscapePuzzle() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [foundItems, setFoundItems] = useState([]);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("Search the room. Inspect objects to uncover the code.");
  const [escaped, setEscaped] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaderFading, setLoaderFading] = useState(false);
  const [codeState, setCodeState] = useState("idle"); // idle | wrong | unlocked

  const foundSet = useMemo(() => new Set(foundItems), [foundItems]);
  const allCluesFound = foundItems.length === roomItems.length;
  const progress = (foundItems.length / roomItems.length) * 100;

  // Site-standard sound effects: start cue, keypad ticks, clue-found blip,
  // wrong-code thud, escape victory jingle
  useGameSounds({
    started: !loading,
    won: escaped,
    lost: codeState === "wrong",
    score: foundItems.length,
    tick: code,
    sounds: { lose: "hit" },
  });

  useEffect(() => {
    const t1 = setTimeout(() => setLoaderFading(true), 1100);
    const t2 = setTimeout(() => setLoading(false), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (escaped || loading) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [escaped, loading]);

  const inspectItem = useCallback((item) => {
    if (loading) return;
    setSelectedItem(item.id);
    setMessage(item.clue);
    if (!foundSet.has(item.id)) setFoundItems(f => [...f, item.id]);
  }, [loading, foundSet]);

  const pressDigit = useCallback((d) => {
    if (escaped || loading) return;
    setCode(c => c.length < 4 ? c + d : c);
    setCodeState("idle");
  }, [escaped, loading]);

  const clearCode = useCallback(() => {
    setCode("");
    setCodeState("idle");
    setMessage("Code cleared. Try again.");
  }, []);

  const submitCode = useCallback(() => {
    if (code === PUZZLE_CODE) {
      setEscaped(true);
      setCodeState("unlocked");
      setMessage("Door unlocked. You escaped!");
    } else {
      setCodeState("wrong");
      setMessage("Wrong code. Re-examine the clues carefully.");
      setTimeout(() => { setCode(""); setCodeState("idle"); }, 600);
    }
  }, [code]);

  const useHint = useCallback(() => {
    setHintsUsed(h => h + 1);
    if (!allCluesFound) {
      const missing = roomItems.find(i => !foundSet.has(i.id));
      setMessage(`Hint: Inspect the ${missing.name.toLowerCase()}.`);
    } else {
      setMessage("Hint: Combine clues in order — Painting → Clock → Books → Plant.");
    }
  }, [allCluesFound, foundSet]);

  const resetGame = useCallback(() => {
    setSelectedItem(null);
    setFoundItems([]);
    setCode("");
    setMessage("Search the room. Inspect objects to uncover the code.");
    setEscaped(false);
    setSeconds(0);
    setHintsUsed(0);
    setCodeState("idle");
    setLoading(true);
    setLoaderFading(false);
    setTimeout(() => setLoaderFading(true), 1100);
    setTimeout(() => setLoading(false), 1600);
  }, []);

  const digits = ["1","2","3","4","5","6","7","8","9"];

  return (
    <>
      <style>{css}</style>
      <div className="escape-root">
        <div className="scanline" />
        <div className="noise" />

        {/* LOADER */}
        {loading && (
          <div className={`loader-overlay${loaderFading ? " fading" : ""}`}>
            <div className="loader-glyph">⌁</div>
            <div className="loader-title">MYSTERY ROOM</div>
            <div className="loader-sub">Initializing escape sequence</div>
            <div className="loader-bar-wrap"><div className="loader-bar-fill" /></div>
            <div className="loader-txt">Sealing exits... powering keypad... hiding clues...</div>
          </div>
        )}

        {/* WIN */}
        {escaped && (
          <div className="win-overlay">
            <div className="win-card">
              <div className="win-icon">🔓</div>
              <div className="win-title">ESCAPED</div>
              <p className="win-sub">You decoded the mystery and broke free from the locked room.</p>
              <div className="win-stat">
                <div className="win-stat-item"><span>{formatTime(seconds)}</span>Time</div>
                <div className="win-stat-item"><span>{hintsUsed}</span>Hints</div>
                <div className="win-stat-item"><span>{roomItems.length}/{roomItems.length}</span>Clues</div>
              </div>
              <br />
              <button className="win-play-again" onClick={resetGame}>PLAY AGAIN</button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="hdr">
          <div className="hdr-brand">
            <div className="hdr-brand-dot" />
            ESCAPE ROOM
          </div>
          <div className="hdr-stats">
            <div className={`stat-chip${seconds > 300 ? " urgent" : ""}`}>
              <span>TIME</span><span className="sv">{formatTime(seconds)}</span>
            </div>
            <div className="stat-chip">
              <span>CLUES</span><span className="sv">{foundItems.length}/{roomItems.length}</span>
            </div>
            <div className="stat-chip">
              <span>HINTS</span><span className="sv">{hintsUsed}</span>
            </div>
          </div>
        </header>

        {/* BODY */}
        <div className="body">
          {/* ROOM */}
          <div className="room-wrap">
            <div className="room-topbar">
              <div className="room-label">Interactive Room</div>
              <div className="clue-msg">{message}</div>
            </div>

            <div className="room-scene">
              {/* BG */}
              <div className="room-bg" />
              <div className="room-ceiling" />
              <div className="room-floor" />
              <div className="room-light" />

              {/* Objects */}
              <div className="obj-painting">
                <div className="obj-painting-inner">🏔️</div>
              </div>
              <div className="obj-clock">3</div>
              <div className="obj-bookshelf">
                {[0,1,2].map(row => (
                  <div key={row} className="obj-shelf-row">
                    {bookColors.slice(row*4, row*4+4).map((c,i) => (
                      <div key={i} className="obj-book" style={{ background: c, height: `${65+Math.random()*30}%` }} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="obj-plant-leaves">🌿</div>
              <div className="obj-plant-stem" />
              <div className="obj-plant-base" />
              <div className="obj-rug">
                <div className="obj-rug-pattern">→ → →</div>
              </div>
              <div className="obj-door">
                <div className="obj-keypad">
                  {[0,1,2,3].map(i => <div key={i} className="kp-dot" />)}
                </div>
                <div className="obj-door-knob" style={{ background: escaped ? "#22d3a0" : "#f5c842", boxShadow: `0 0 10px ${escaped ? "#22d3a0" : "#f5c842"}` }} />
              </div>

              {/* Hotspots */}
              {roomItems.map(item => (
                <button
                  key={item.id}
                  className={`hotspot${foundSet.has(item.id) ? " found" : ""}${selectedItem === item.id ? " active" : ""}`}
                  style={item.area}
                  onClick={() => inspectItem(item)}
                  aria-label={`Inspect ${item.name}`}
                >
                  <div className="hotspot-label">{item.name}</div>
                  {foundSet.has(item.id) && <div className="hotspot-found-badge">✓</div>}
                </button>
              ))}
            </div>

            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            {/* Lock section */}
            <div className="sb-section">
              <div className="sb-title">
                Door Lock
                <span className={`door-status ${escaped ? "unlocked" : "locked"}`}>
                  <span className="door-dot" />
                  {escaped ? "OPEN" : "LOCKED"}
                </span>
              </div>
              <div className={`code-display${codeState === "wrong" ? " wrong" : ""}${codeState === "unlocked" ? " unlocked" : ""}`}>
                <div className="code-scan" />
                {code.padEnd(4, "•")}
              </div>
              <div className="numpad">
                {digits.map(d => (
                  <button key={d} className="npbtn" onClick={() => pressDigit(d)}>{d}</button>
                ))}
                <button className="npbtn clear" onClick={clearCode}>CLR</button>
                <button className="npbtn" onClick={() => pressDigit("0")}>0</button>
                <button className="npbtn enter" onClick={submitCode}>ENTER</button>
              </div>
            </div>

            {/* Inventory */}
            <div className="sb-section inventory">
              <div className="sb-title">Inventory</div>
              {roomItems.map(item => (
                <div key={item.id} className={`inv-item ${foundSet.has(item.id) ? "found-inv" : "hidden-inv"}`}>
                  <span className="inv-icon">{foundSet.has(item.id) ? item.icon : "❓"}</span>
                  {foundSet.has(item.id) ? item.reward : "Hidden clue"}
                  {foundSet.has(item.id) && <span className="inv-badge">FOUND</span>}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="action-row">
              <button className="act-btn act-hint" onClick={useHint}>HINT</button>
              <button className="act-btn act-reset" onClick={resetGame}>RESET</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}