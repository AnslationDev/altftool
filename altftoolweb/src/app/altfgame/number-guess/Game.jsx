"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGameSounds, playSound } from "@/lib/sounds";

const DIFFICULTIES = [
  { key: "easy", label: "Easy", range: 50, maxGuesses: 8, tag: "WARM UP", icon: "🌱" },
  { key: "medium", label: "Medium", range: 100, maxGuesses: 10, tag: "STANDARD", icon: "⭐" },
  { key: "hard", label: "Hard", range: 500, maxGuesses: 12, tag: "BRUTAL", icon: "🔥" },
];

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800;900&display=swap');`;

const CSS = `
${FONTS}

.ngg-root, .ngg-root *, .ngg-root *::before, .ngg-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ngg-root {
  --bg-grad: linear-gradient(160deg, #ffd66b 0%, #ff9f5a 22%, #ff6fa0 55%, #b06aff 100%);
  --surface: #ffffff;
  --surface2: #fff6ed;
  --surface3: #ffd9b3;
  --border: rgba(90, 40, 90, 0.1);
  --border2: rgba(90, 40, 90, 0.16);
  --text: #3a2350;
  --muted: #9080a8;
  --accent: #2ecc82;
  --accent-dim: rgba(46,204,130,0.15);
  --higher: #ff9f1c;
  --lower: #3ab0ff;
  --danger: #ff6b6b;
  --font-display: 'Fredoka', sans-serif;
  --font-body: 'Nunito', sans-serif;
  --font-mono: 'Nunito', sans-serif;

  font-family: var(--font-body);
  background: var(--bg-grad);
  color: var(--text);
  min-height: calc(100% - 20px);
  height: calc(100% - 20px);
  width: calc(100% - 20px);
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  box-shadow: 0 10px 30px rgba(90,40,90,0.18);
  padding: 2rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10px auto;
}

.ngg-root::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(circle 220px at 8% 15%, rgba(255,255,255,0.35) 0%, transparent 70%),
    radial-gradient(circle 260px at 92% 85%, rgba(255,255,255,0.25) 0%, transparent 70%),
    radial-gradient(circle 320px at 50% 100%, rgba(255,255,255,0.12) 0%, transparent 70%);
}

.ngg-shell { width: 100%; max-width: 780px; margin: 0 auto; position: relative; z-index: 1; }

/* ---- BRAND ---- */
.ngg-brand {
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  margin-bottom: 0.4rem;
}
.ngg-brand-dot {
  width: 12px; height: 12px; border-radius: 50%; background: #ffe066;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  animation: nggBounce 1.2s ease-in-out infinite;
}
@keyframes nggBounce { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.1)} }
.ngg-brand-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.4rem, 7vw, 3.6rem);
  letter-spacing: 0.02em; line-height: 1; text-align: center;
  color: #ffffff;
  text-shadow: 0 3px 0 rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.2);
}
.ngg-brand-title span { color: #ffe066; }
.ngg-subtitle {
  font-family: var(--font-body); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.02em;
  color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,0.2); text-align: center;
  margin-bottom: 2rem;
}

/* ---- DIFFICULTY SELECT ---- */
.ngg-diff-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.1rem;
}

.ngg-diff-card {
  background: linear-gradient(180deg, #ffffff, #fffaf3); border: none;
  border-radius: 22px;
  padding: 1.6rem 1.35rem; cursor: pointer; position: relative; overflow: hidden;
  box-shadow: 0 8px 0 rgba(90,40,90,0.18), 0 14px 24px rgba(90,40,90,0.16), inset 0 1px 0 rgba(255,255,255,0.8);
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
  text-align: left;
}
.ngg-diff-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 12px 0 rgba(90,40,90,0.18), 0 22px 34px rgba(90,40,90,0.22), inset 0 1px 0 rgba(255,255,255,0.9);
}
.ngg-diff-card:active {
  transform: translateY(2px) scale(0.98);
  box-shadow: 0 4px 0 rgba(90,40,90,0.18), 0 8px 14px rgba(90,40,90,0.14), inset 0 1px 0 rgba(255,255,255,0.8);
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}

.ngg-diff-icon {
  font-size: 2.3rem; line-height: 1; margin-bottom: 0.5rem;
  filter: drop-shadow(0 3px 4px rgba(0,0,0,0.12));
  display: inline-block;
  transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
.ngg-diff-card:hover .ngg-diff-icon {
  transform: scale(1.18) rotate(-6deg);
}
.ngg-diff-tag {
  font-family: var(--font-body); font-size: 0.68rem; font-weight: 800; letter-spacing: 0.14em;
  color: #fff; text-transform: uppercase; margin-bottom: 0.6rem;
  display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px;
  background: linear-gradient(135deg, var(--higher), #ff6fa0);
}
.ngg-diff-name {
  font-family: var(--font-display); font-weight: 600; font-size: 1.7rem; letter-spacing: 0.01em;
  line-height: 1.1; margin-bottom: 0.7rem; color: var(--text);
}
.ngg-diff-meta {
  font-family: var(--font-body); font-size: 0.85rem; color: var(--muted); font-weight: 600;
  display: flex; flex-direction: column; gap: 0.3rem;
}
.ngg-diff-meta b { color: var(--text); font-weight: 800; }
.ngg-diff-best {
  margin-top: 0.9rem; padding-top: 0.75rem; border-top: 2px dashed var(--border2);
  font-family: var(--font-body); font-size: 0.8rem; color: var(--accent);
  font-weight: 800; letter-spacing: 0.02em;
}

/* ---- PLAY SCREEN ---- */
.ngg-topbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.ngg-hud { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.ngg-pill {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  background: var(--surface); border: none; border-radius: 999px;
  box-shadow: 0 3px 0 rgba(90,40,90,0.14), 0 4px 10px rgba(90,40,90,0.12);
  font-family: var(--font-body); font-size: 0.75rem;
}
.ngg-pill .lbl { color: var(--muted); letter-spacing: 0.02em; font-weight: 700; margin-right: 0.3rem; }
.ngg-pill .val { font-weight: 800; color: var(--text); font-size: 0.9rem; }

.ngg-change-btn {
  padding: 0.45rem 1.1rem;
  background: rgba(255,255,255,0.9); border: none; border-radius: 999px;
  color: var(--text); font-family: var(--font-body);
  font-size: 0.78rem; font-weight: 800; cursor: pointer;
  letter-spacing: 0.01em; transition: all 0.18s;
  box-shadow: 0 3px 0 rgba(90,40,90,0.16), 0 4px 10px rgba(90,40,90,0.14);
}
.ngg-change-btn:hover { transform: translateY(-2px) scale(1.02); background: #fff; }
.ngg-change-btn:active { transform: translateY(1px) scale(0.98); box-shadow: 0 1px 0 rgba(90,40,90,0.16); transition: transform 0.08s ease; }

/* ---- FEEDBACK ---- */
.ngg-feedback-zone {
  min-height: 92px; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.25rem;
}
.ngg-feedback {
  font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 6vw, 3rem);
  letter-spacing: 0.01em; line-height: 1;
  display: flex; align-items: center; gap: 0.5rem;
  color: #fff; text-shadow: 0 3px 0 rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.2);
  animation: nggFeedIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes nggFeedIn {
  from { opacity: 0; transform: scale(0.3) translateY(12px); }
  60% { transform: scale(1.15) translateY(0); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.ngg-feedback.correct { color: #fff; }
.ngg-feedback.higher { color: #fff; }
.ngg-feedback.lower { color: #fff; }
.ngg-feedback-icon { font-size: 1.2em; }
.ngg-feedback-placeholder {
  font-family: var(--font-body); font-weight: 700; font-size: 0.9rem; color: #fff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2); letter-spacing: 0.01em;
}

/* ---- BOUNDS BAR ---- */
.ngg-bounds-wrap { margin-bottom: 1.5rem; }
.ngg-bounds-track {
  position: relative; height: 22px;
  background: rgba(255,255,255,0.55); border: none; border-radius: 999px;
  overflow: visible;
  box-shadow: inset 0 2px 5px rgba(90,40,90,0.15), inset 0 -1px 0 rgba(255,255,255,0.4);
}
.ngg-bounds-fill {
  position: absolute; top: 0; bottom: 0;
  background: linear-gradient(90deg, var(--lower), var(--accent), var(--higher));
  border-radius: 999px;
  opacity: 0.92; transition: left 0.4s cubic-bezier(0.34,1.2,0.64,1), width 0.4s cubic-bezier(0.34,1.2,0.64,1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.35);
}
.ngg-bounds-pulse {
  position: absolute; inset: -5px; border-radius: 999px; pointer-events: none;
  animation: nggBoundsGlow 0.65s ease-out;
}
@keyframes nggBoundsGlow {
  0% { box-shadow: 0 0 0 7px rgba(46,204,130,0.35); }
  100% { box-shadow: 0 0 0 0 rgba(46,204,130,0); }
}
.ngg-bounds-marker {
  position: absolute; top: 50%; width: 18px; height: 18px;
  background: #fff; border: 3px solid var(--text); border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.25);
  transition: left 0.4s cubic-bezier(0.34,1.2,0.64,1);
}
.ngg-bounds-labels {
  display: flex; justify-content: space-between; margin-top: 0.5rem;
  font-family: var(--font-body); font-weight: 700; font-size: 0.8rem; color: #fff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.ngg-bounds-labels b { color: #ffe066; font-size: 0.95rem; }

/* ---- INPUT ---- */
.ngg-input-row { display: flex; gap: 0.65rem; margin-bottom: 0.5rem; }
.ngg-input {
  flex: 1; height: 56px;
  background: var(--surface); border: 3px solid var(--border2);
  color: var(--text); font-family: var(--font-display);
  font-size: 1.3rem; font-weight: 600; text-align: center;
  padding: 0 1rem; outline: none; border-radius: 999px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 0 rgba(90,40,90,0.12);
}
.ngg-input::placeholder { color: var(--muted); font-weight: 500; font-family: var(--font-body); }
.ngg-input:focus { border-color: var(--lower); box-shadow: 0 4px 0 rgba(90,40,90,0.12), 0 0 0 4px rgba(58,176,255,0.2); }
.ngg-input.shake { animation: nggShake 0.35s ease; border-color: var(--danger); }
@keyframes nggShake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
.ngg-input.invite { animation: nggInvitePulse 1.3s ease-in-out 2; }
@keyframes nggInvitePulse {
  0%, 100% { box-shadow: 0 4px 0 rgba(90,40,90,0.12), 0 0 0 0 rgba(58,176,255,0.35); }
  50% { box-shadow: 0 4px 0 rgba(90,40,90,0.12), 0 0 0 8px rgba(58,176,255,0); }
}
.ngg-submit-btn {
  height: 56px; padding: 0 2rem;
  background: linear-gradient(135deg, var(--accent), #1fa968); border: none;
  border-radius: 999px;
  font-family: var(--font-display); font-weight: 600; font-size: 1.15rem; letter-spacing: 0.01em;
  color: #fff; cursor: pointer;
  box-shadow: 0 5px 0 #17824f, 0 8px 16px rgba(46,204,130,0.35);
  transition: all 0.15s; flex-shrink: 0;
}
.ngg-submit-btn:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-2px) scale(1.03); }
.ngg-submit-btn:active:not(:disabled) { transform: translateY(2px) scale(0.97); box-shadow: 0 2px 0 #17824f, 0 4px 8px rgba(46,204,130,0.3); transition-duration: 0.08s; }
.ngg-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ngg-error {
  font-family: var(--font-body); font-weight: 800; font-size: 0.8rem; color: #fff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.25);
  min-height: 1.2rem; margin-bottom: 1rem; letter-spacing: 0.01em;
}

/* ---- HINT ---- */
.ngg-hint-row {
  display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.ngg-hint-btn {
  padding: 0.55rem 1.1rem;
  background: #fff; border: none; border-radius: 999px;
  color: var(--higher); font-family: var(--font-body); font-size: 0.82rem; font-weight: 800;
  cursor: pointer; transition: all 0.15s; letter-spacing: 0.01em;
  box-shadow: 0 3px 0 rgba(90,40,90,0.15), 0 4px 10px rgba(90,40,90,0.12);
}
.ngg-hint-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.03); }
.ngg-hint-btn:active:not(:disabled) { transform: translateY(1px) scale(0.97); box-shadow: 0 1px 0 rgba(90,40,90,0.15); transition-duration: 0.08s; }
.ngg-hint-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.ngg-hint-note {
  font-family: var(--font-body); font-weight: 600; font-size: 0.75rem; color: #fff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2); letter-spacing: 0.01em;
}
.ngg-hint-text {
  font-family: var(--font-body); font-weight: 800; font-size: 0.85rem; color: #ffe066;
  text-shadow: 0 2px 6px rgba(0,0,0,0.2); letter-spacing: 0.01em;
}

/* ---- HISTORY FEED ---- */
.ngg-history-title {
  font-family: var(--font-body); font-weight: 800; font-size: 0.8rem; letter-spacing: 0.06em;
  text-transform: uppercase; color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,0.2);
  margin-bottom: 0.6rem;
  display: flex; align-items: center; gap: 0.5rem;
}

.ngg-history-list {
  display: flex; flex-direction: column; gap: 0.5rem;
  max-height: 260px; overflow-y: auto; padding: 0.25rem 0.25rem 0.25rem 0;
}
.ngg-history-list::-webkit-scrollbar { width: 5px; }
.ngg-history-list::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 999px; }

.ngg-history-empty {
  font-family: var(--font-body); font-weight: 700; font-size: 0.85rem; color: var(--muted);
  padding: 0.9rem; background: var(--surface); border-radius: 16px; text-align: center;
}

.ngg-history-item {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.6rem 1rem;
  background: var(--surface); border-radius: 16px;
  box-shadow: 0 2px 0 rgba(90,40,90,0.1), 0 3px 8px rgba(90,40,90,0.08);
  font-size: 0.85rem; animation: nggSlide 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes nggSlide { from { opacity: 0; transform: translateX(12px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }

.ngg-history-icon { font-size: 1.1rem; line-height: 1; }
.ngg-history-item.correct .ngg-history-icon { }
.ngg-history-item.higher .ngg-history-icon { }
.ngg-history-item.lower .ngg-history-icon { }

.ngg-history-num {
  font-family: var(--font-body); font-weight: 700; font-size: 0.72rem; color: var(--muted); min-width: 26px;
}
.ngg-history-guess {
  font-family: var(--font-display); font-weight: 600; font-size: 1.2rem; color: var(--text); min-width: 44px;
}
.ngg-history-result { font-weight: 800; flex: 1; }
.ngg-history-item.correct .ngg-history-result { color: var(--accent); }
.ngg-history-item.higher .ngg-history-result { color: var(--higher); }
.ngg-history-item.lower .ngg-history-result { color: var(--lower); }

/* ---- OVERLAY ---- */
.ngg-overlay {
  position: absolute; inset: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem; animation: nggFadeIn 0.35s ease-out;
}
@keyframes nggFadeIn { from { opacity: 0 } to { opacity: 1 } }

.ngg-overlay.win {
  background: linear-gradient(160deg, rgba(255,214,107,0.92), rgba(255,111,160,0.92), rgba(176,106,255,0.92));
  backdrop-filter: blur(6px);
}
.ngg-overlay.lose {
  background: linear-gradient(160deg, rgba(255,201,140,0.92), rgba(255,159,113,0.92), rgba(255,138,138,0.92));
  backdrop-filter: blur(6px);
}

.ngg-card {
  max-width: 480px; width: 100%;
  background: var(--surface); border: none;
  overflow: hidden; border-radius: 28px;
  animation: nggPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
  box-shadow: 0 20px 50px rgba(60,20,60,0.35), 0 0 0 1px rgba(255,255,255,0.5) inset;
}
@keyframes nggPop {
  from { opacity: 0; transform: scale(0.75) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.ngg-card-header { padding: 2.25rem 2rem 1.25rem; text-align: center; }
.ngg-card-header.win-h { background: linear-gradient(135deg, #fff2c9, #ffe0ef); }
.ngg-card-header.lose-h { background: linear-gradient(135deg, #ffe8d6, #ffd9d9); }

.ngg-big-text {
  font-family: var(--font-display); font-weight: 700; font-size: clamp(2.4rem, 8vw, 3.6rem);
  letter-spacing: 0.01em; line-height: 1.1; margin-bottom: 0.5rem;
}
.ngg-big-text.win-t { color: var(--accent); }
.ngg-big-text.lose-t { color: #ff8a65; }

.ngg-tagline {
  font-family: var(--font-body); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.02em;
  color: var(--muted);
}

.ngg-best-badge {
  display: inline-flex; align-items: center; gap: 0.35rem;
  margin-top: 0.6rem; padding: 0.35rem 0.9rem;
  background: linear-gradient(135deg, #ffe066, #ff9f1c);
  color: #5a2800; font-family: var(--font-body); font-weight: 800; font-size: 0.72rem;
  letter-spacing: 0.06em; text-transform: uppercase; border-radius: 999px;
  box-shadow: 0 4px 0 #c97600, 0 6px 12px rgba(255,159,28,0.35);
  animation: nggBadgePop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both, nggBadgeGlow 1.6s ease-in-out 0.8s infinite;
}
@keyframes nggBadgePop {
  from { opacity: 0; transform: scale(0.4) translateY(-8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes nggBadgeGlow {
  0%, 100% { box-shadow: 0 4px 0 #c97600, 0 6px 12px rgba(255,159,28,0.35); }
  50% { box-shadow: 0 4px 0 #c97600, 0 6px 18px rgba(255,159,28,0.65); }
}

.ngg-stars { font-size: 2.4rem; letter-spacing: 0.15em; margin-top: 0.9rem; }
.ngg-star-on { color: var(--higher); display: inline-block; animation: nggStarPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.15)); }
.ngg-star-off { color: var(--border2); }
@keyframes nggStarPop { from { transform: scale(0) rotate(-30deg); opacity: 0; } to { transform: scale(1) rotate(0); opacity: 1; } }

.ngg-card-body { padding: 1.5rem 2rem 2rem; }

.ngg-stats-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.ngg-stat { padding: 1rem 0.5rem; text-align: center; background: var(--surface2); border-radius: 16px; }
.ngg-stat-val { font-family: var(--font-display); font-weight: 600; font-size: 1.9rem; line-height: 1; letter-spacing: 0.01em; }
.ngg-stat-lbl {
  font-family: var(--font-body); font-weight: 700; font-size: 0.65rem; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--muted); margin-top: 0.4rem;
}

.ngg-card-message {
  font-size: 0.95rem; font-weight: 600; color: var(--text);
  text-align: center; margin-bottom: 1.5rem; line-height: 1.6;
}

.ngg-btn-row { display: flex; gap: 0.75rem; }
.ngg-result-btn {
  flex: 1; padding: 0.95rem;
  font-family: var(--font-display); font-weight: 600; font-size: 1.05rem; letter-spacing: 0.01em;
  cursor: pointer; border: none; border-radius: 999px;
  transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease, filter 0.15s ease;
}
.ngg-result-btn.primary {
  background: linear-gradient(135deg, var(--accent), #1fa968);
  color: #fff; border-color: transparent;
  box-shadow: 0 5px 0 #17824f, 0 8px 16px rgba(46,204,130,0.3);
}
.ngg-result-btn.primary.lose-btn { background: linear-gradient(135deg, #ff9f5a, #ff8a65); box-shadow: 0 5px 0 #d96a45, 0 8px 16px rgba(255,138,101,0.3); color: #fff; }
.ngg-result-btn.secondary { background: var(--surface2); color: var(--text); box-shadow: 0 5px 0 var(--border2); }
.ngg-result-btn:hover { transform: translateY(-3px) scale(1.02); filter: brightness(1.05); }
.ngg-result-btn:active { transform: translateY(2px) scale(0.98); transition-duration: 0.08s; }

/* confetti */
.ngg-confetti-bit {
  position: absolute; top: -10px; pointer-events: none; z-index: 600;
  animation: nggFall linear forwards;
}
@keyframes nggFall {
  0% { top: -10px; transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(var(--ngg-dx, 20px)) rotate(360deg); }
  100% { top: 110%; transform: translateX(0) rotate(var(--ngg-spin, 720deg)); }
}

@media (max-width: 520px) {
  .ngg-stats-row { grid-template-columns: repeat(3, 1fr); }
  .ngg-btn-row { flex-direction: column; }
  .ngg-topbar { justify-content: center; text-align: center; }
  .ngg-hud { justify-content: center; }
  .ngg-change-btn { width: 100%; }
  .ngg-hint-row { justify-content: center; text-align: center; }
  .ngg-hint-note { width: 100%; text-align: center; }
}

@media (max-width: 400px) {
  .ngg-input-row { flex-direction: column; }
  .ngg-submit-btn { width: 100%; }
  .ngg-diff-card { padding: 1.3rem 1.1rem; }
}
`;

function Confetti({ active }) {
  if (!active) return null;
  const colors = ["#ff6fa0", "#ffd66b", "#3ab0ff", "#2ecc82", "#b06aff", "#ff9f1c", "#ffffff"];
  return Array.from({ length: 64 }, (_, i) => {
    const shapeRoll = Math.random();
    const size = 5 + Math.random() * 10;
    const shapeStyle =
      shapeRoll > 0.66
        ? { borderRadius: "50%" }
        : shapeRoll > 0.33
        ? { borderRadius: "3px" }
        : { borderRadius: "2px", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" };
    return (
      <div
        key={i}
        className="ngg-confetti-bit"
        style={{
          left: `${Math.random() * 100}vw`,
          background: colors[i % colors.length],
          width: `${size}px`,
          height: `${shapeRoll > 0.66 ? size : 6 + Math.random() * 13}px`,
          animationDelay: `${Math.random() * 0.7}s`,
          animationDuration: `${1.3 + Math.random() * 1.7}s`,
          "--ngg-dx": `${(Math.random() - 0.5) * 90}px`,
          "--ngg-spin": `${Math.random() > 0.5 ? 720 : -720}deg`,
          opacity: 0.75 + Math.random() * 0.25,
          ...shapeStyle,
        }}
      />
    );
  });
}

function loadBestScores() {
  const out = {};
  if (typeof window === "undefined") return out;
  try {
    DIFFICULTIES.forEach((d) => {
      const raw = window.localStorage.getItem(`numberguess-best-${d.key}`);
      const n = Number(raw);
      if (raw !== null && Number.isFinite(n) && n > 0) out[d.key] = n;
    });
  } catch (e) {
    /* localStorage unavailable — ignore */
  }
  return out;
}

function persistBestScore(key, guesses) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`numberguess-best-${key}`, String(guesses));
  } catch (e) {
    /* ignore */
  }
}

export default function NumberGuess() {
  const [screen, setScreen] = useState("select"); // "select" | "play"
  const [diffKey, setDiffKey] = useState(null);
  const [secret, setSecret] = useState(null);
  const [knownMin, setKnownMin] = useState(1);
  const [knownMax, setKnownMax] = useState(1);
  const [guessValue, setGuessValue] = useState("");
  const [guessesUsed, setGuessesUsed] = useState(0);
  const [history, setHistory] = useState([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState("");
  const [feedback, setFeedback] = useState(null); // { type, text, key }
  const [inputError, setInputError] = useState("");
  const [shake, setShake] = useState(false);
  const [result, setResult] = useState(null); // null | "win" | "lose"
  const [newBest, setNewBest] = useState(false);
  const [bestScores, setBestScores] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    setBestScores(loadBestScores());
  }, []);

  const currentDiff = useMemo(
    () => DIFFICULTIES.find((d) => d.key === diffKey) || DIFFICULTIES[0],
    [diffKey]
  );

  useGameSounds({
    started: screen === "play",
    won: result === "win",
    lost: result === "lose",
  });

  function startRound(key) {
    const diff = DIFFICULTIES.find((d) => d.key === key);
    if (!diff) return;
    const s = Math.floor(Math.random() * diff.range) + 1;
    setDiffKey(key);
    setSecret(s);
    setKnownMin(1);
    setKnownMax(diff.range);
    setGuessValue("");
    setGuessesUsed(0);
    setHistory([]);
    setHintUsed(false);
    setHintText("");
    setFeedback(null);
    setInputError("");
    setShake(false);
    setResult(null);
    setNewBest(false);
    setScreen("play");
    setTimeout(() => inputRef.current?.focus(), 60);
  }

  function changeDifficulty() {
    setScreen("select");
    setResult(null);
  }

  function playAgain() {
    if (diffKey) startRound(diffKey);
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  function submitGuess(e) {
    if (e) e.preventDefault();
    if (result || !currentDiff || secret === null) return;

    const trimmed = guessValue.trim();
    if (!trimmed) {
      setInputError("Enter a number first.");
      triggerShake();
      return;
    }
    const num = Number(trimmed);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      setInputError("Whole numbers only.");
      triggerShake();
      return;
    }
    if (num < 1 || num > currentDiff.range) {
      setInputError(`Must be between 1 and ${currentDiff.range}.`);
      triggerShake();
      return;
    }

    setInputError("");
    const usedNow = guessesUsed + 1;
    setGuessesUsed(usedNow);
    setGuessValue("");

    let entryResult;
    if (num === secret) {
      entryResult = "correct";
      setFeedback({ type: "correct", text: "Correct!", key: Date.now() });
      playSound("point");
    } else if (num < secret) {
      entryResult = "higher";
      setKnownMin((prev) => Math.max(prev, num));
      setFeedback({ type: "higher", text: "Higher!", key: Date.now() });
      playSound("move");
    } else {
      entryResult = "lower";
      setKnownMax((prev) => Math.min(prev, num));
      setFeedback({ type: "lower", text: "Lower!", key: Date.now() });
      playSound("move");
    }

    setHistory((prev) => [
      { n: usedNow, guess: num, result: entryResult, id: Date.now() + Math.random() },
      ...prev,
    ]);

    if (entryResult === "correct") {
      const prevBest = bestScores[diffKey];
      const isNewBest = prevBest === undefined || usedNow < prevBest;
      setNewBest(isNewBest);
      if (isNewBest) {
        persistBestScore(diffKey, usedNow);
        setBestScores((prev) => ({ ...prev, [diffKey]: usedNow }));
      }
      setTimeout(() => setResult("win"), 550);
    } else if (usedNow >= currentDiff.maxGuesses) {
      setTimeout(() => setResult("lose"), 450);
    }
  }

  function useHint() {
    if (hintUsed || result || secret === null) return;
    setHintUsed(true);
    setHintText(secret % 2 === 0 ? "The secret number is EVEN." : "The secret number is ODD.");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") submitGuess(e);
  }

  function starsFor(used, max) {
    const ratio = used / max;
    if (ratio <= 0.4) return 3;
    if (ratio <= 0.7) return 2;
    return 1;
  }

  function feedbackIcon(type) {
    if (type === "correct") return "🎉";
    if (type === "higher") return "⬆️";
    if (type === "lower") return "⬇️";
    return "";
  }

  function historyIcon(res) {
    if (res === "correct") return "🎉";
    if (res === "higher") return "⬆️";
    return "⬇️";
  }

  const range = currentDiff ? currentDiff.range : 1;
  const pct = (v) => (range > 1 ? ((v - 1) / (range - 1)) * 100 : 0);
  const boundsLeft = Math.min(pct(knownMin), pct(knownMax));
  const boundsWidth = Math.max(pct(knownMax) - pct(knownMin), 0.6);

  return (
    <div className="ngg-root">
      <style>{CSS}</style>

      <div className="ngg-shell">
        <div className="ngg-brand">
          <div className="ngg-brand-dot" />
          <div className="ngg-brand-title">
            NUMBER <span>GUESS</span>
          </div>
        </div>
        <div className="ngg-subtitle">🎯 Higher or Lower — find the secret number!</div>

        {screen === "select" && (
          <div className="ngg-diff-grid">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                className="ngg-diff-card"
                onClick={() => startRound(d.key)}
                type="button"
              >
                <div className="ngg-diff-icon">{d.icon}</div>
                <div className="ngg-diff-tag">{d.tag}</div>
                <div className="ngg-diff-name">{d.label}</div>
                <div className="ngg-diff-meta">
                  <span>
                    Range: <b>1 - {d.range}</b>
                  </span>
                  <span>
                    Max Guesses: <b>{d.maxGuesses}</b>
                  </span>
                </div>
                {bestScores[d.key] !== undefined && (
                  <div className="ngg-diff-best">🏆 Best: {bestScores[d.key]} guesses</div>
                )}
              </button>
            ))}
          </div>
        )}

        {screen === "play" && currentDiff && (
          <>
            <div className="ngg-topbar">
              <div className="ngg-hud">
                <div className="ngg-pill">
                  <span className="lbl">Difficulty</span>
                  <span className="val">{currentDiff.label}</span>
                </div>
                <div className="ngg-pill">
                  <span className="lbl">Guesses</span>
                  <span className="val">
                    {guessesUsed}/{currentDiff.maxGuesses}
                  </span>
                </div>
                <div className="ngg-pill">
                  <span className="lbl">Range</span>
                  <span className="val">
                    1-{currentDiff.range}
                  </span>
                </div>
              </div>
              <button className="ngg-change-btn" onClick={changeDifficulty} type="button">
                Change Difficulty
              </button>
            </div>

            <div className="ngg-feedback-zone">
              {feedback ? (
                <div key={feedback.key} className={`ngg-feedback ${feedback.type}`}>
                  <span className="ngg-feedback-icon">{feedbackIcon(feedback.type)}</span>
                  {feedback.text}
                </div>
              ) : (
                <div className="ngg-feedback-placeholder">Make your first guess</div>
              )}
            </div>

            <div className="ngg-bounds-wrap">
              <div className="ngg-bounds-track">
                <div
                  className="ngg-bounds-fill"
                  style={{ left: `${boundsLeft}%`, width: `${boundsWidth}%` }}
                />
                <div
                  key={`${knownMin}-${knownMax}`}
                  className="ngg-bounds-pulse"
                  style={{ left: `${boundsLeft}%`, width: `${boundsWidth}%` }}
                />
                <div className="ngg-bounds-marker" style={{ left: `${pct(knownMin)}%` }} />
                <div className="ngg-bounds-marker" style={{ left: `${pct(knownMax)}%` }} />
              </div>
              <div className="ngg-bounds-labels">
                <span>
                  Low: <b>{knownMin}</b>
                </span>
                <span>
                  High: <b>{knownMax}</b>
                </span>
              </div>
            </div>

            <form className="ngg-input-row" onSubmit={submitGuess}>
              <input
                ref={inputRef}
                className={`ngg-input ${shake ? "shake" : ""} ${!shake && history.length === 0 && !result ? "invite" : ""}`}
                type="number"
                inputMode="numeric"
                value={guessValue}
                onChange={(e) => setGuessValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Guess 1-${currentDiff.range}`}
                disabled={!!result}
              />
              <button className="ngg-submit-btn" type="submit" disabled={!!result}>
                Guess
              </button>
            </form>
            <div className="ngg-error">{inputError}</div>

            <div className="ngg-hint-row">
              <button
                className="ngg-hint-btn"
                onClick={useHint}
                disabled={hintUsed || !!result}
                type="button"
              >
                💡 Use Hint
              </button>
              <span className="ngg-hint-note">(free — does not cost a guess, one per round)</span>
              {hintText && <span className="ngg-hint-text">{hintText}</span>}
            </div>

            <div className="ngg-history-title">📋 Guess History</div>
            <div className="ngg-history-list">
              {history.length === 0 && (
                <div className="ngg-history-empty">No guesses yet — give it a shot.</div>
              )}
              {history.map((h) => (
                <div key={h.id} className={`ngg-history-item ${h.result}`}>
                  <span className="ngg-history-num">#{h.n}</span>
                  <span className="ngg-history-guess">{h.guess}</span>
                  <span className="ngg-history-icon">{historyIcon(h.result)}</span>
                  <span className="ngg-history-result">
                    {h.result === "correct" ? "Correct!" : h.result === "higher" ? "Higher" : "Lower"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {result === "win" && currentDiff && (
        <div className="ngg-overlay win">
          <Confetti active />
          <div className="ngg-card">
            <div className="ngg-card-header win-h">
              <div className="ngg-big-text win-t">🎉 Solved!</div>
              <div className="ngg-tagline">
                {newBest ? "New best score!" : `${currentDiff.label} difficulty conquered`}
              </div>
              {newBest && <div className="ngg-best-badge">🏆 New Best!</div>}
              <div className="ngg-stars">
                {Array.from({ length: 3 }, (_, i) => (
                  <span
                    key={i}
                    className={i < starsFor(guessesUsed, currentDiff.maxGuesses) ? "ngg-star-on" : "ngg-star-off"}
                    style={i < starsFor(guessesUsed, currentDiff.maxGuesses) ? { animationDelay: `${i * 0.12}s` } : undefined}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
            </div>
            <div className="ngg-card-body">
              <div className="ngg-stats-row">
                <div className="ngg-stat">
                  <div className="ngg-stat-val" style={{ color: "var(--accent)" }}>
                    {guessesUsed}
                  </div>
                  <div className="ngg-stat-lbl">Guesses Used</div>
                </div>
                <div className="ngg-stat">
                  <div className="ngg-stat-val">{currentDiff.maxGuesses}</div>
                  <div className="ngg-stat-lbl">Max Guesses</div>
                </div>
                <div className="ngg-stat">
                  <div className="ngg-stat-val" style={{ color: "var(--higher)" }}>
                    {bestScores[diffKey] || guessesUsed}
                  </div>
                  <div className="ngg-stat-lbl">Best ({currentDiff.label})</div>
                </div>
              </div>
              <div className="ngg-card-message">
                You found <b>{secret}</b> in {guessesUsed} guess{guessesUsed === 1 ? "" : "es"} on {currentDiff.label} difficulty.
              </div>
              <div className="ngg-btn-row">
                <button className="ngg-result-btn primary" onClick={playAgain} type="button">
                  Play Again
                </button>
                <button className="ngg-result-btn secondary" onClick={changeDifficulty} type="button">
                  Change Difficulty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {result === "lose" && currentDiff && (
        <div className="ngg-overlay lose">
          <div className="ngg-card">
            <div className="ngg-card-header lose-h">
              <div className="ngg-big-text lose-t">😅 So Close!</div>
              <div className="ngg-tagline">{currentDiff.label} difficulty — better luck next time</div>
            </div>
            <div className="ngg-card-body">
              <div className="ngg-stats-row">
                <div className="ngg-stat">
                  <div className="ngg-stat-val" style={{ color: "#ff8a65" }}>
                    {secret}
                  </div>
                  <div className="ngg-stat-lbl">Secret Number</div>
                </div>
                <div className="ngg-stat">
                  <div className="ngg-stat-val">{guessesUsed}</div>
                  <div className="ngg-stat-lbl">Guesses Used</div>
                </div>
                <div className="ngg-stat">
                  <div className="ngg-stat-val">{currentDiff.maxGuesses}</div>
                  <div className="ngg-stat-lbl">Max Guesses</div>
                </div>
              </div>
              <div className="ngg-card-message">
                The number was <b>{secret}</b>. Sharpen your strategy and try again!
              </div>
              <div className="ngg-btn-row">
                <button className="ngg-result-btn primary lose-btn" onClick={playAgain} type="button">
                  Try Again
                </button>
                <button className="ngg-result-btn secondary" onClick={changeDifficulty} type="button">
                  Change Difficulty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
