"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGameSounds, playSound } from "@/lib/sounds";

/* ============================================================
   WHO IS? — an original detective / riddle mini-game.
   8 hand-written cases. Click clue hotspots around the scene,
   read the Clue Log, then accuse a suspect.
   ============================================================ */

const ROUNDS = [
  {
    id: "r1",
    title: "Who Broke the Vase?",
    sceneEmoji: "🏢",
    scenario: "The lobby's antique vase lies in pieces. Three people were in the building at the time.",
    suspects: [
      { id: "r1-neha", name: "Neha", role: "Receptionist", emoji: "💁‍♀️" },
      { id: "r1-arjun", name: "Arjun", role: "Courier", emoji: "🧑‍💼" },
      { id: "r1-meera", name: "Meera", role: "Janitor", emoji: "🧹" },
    ],
    clues: [
      { id: "r1-c1", icon: "🪟", x: 12, y: 18, text: "The lobby window was left open — a strong gust blew through around 3 PM." },
      { id: "r1-c2", icon: "☂️", x: 70, y: 14, text: "A dripping umbrella was propped right beside the pedestal the vase stood on." },
      { id: "r1-c3", icon: "🧺", x: 45, y: 62, text: "The janitor's cart was parked two rooms away for the entire afternoon." },
      { id: "r1-c4", icon: "📋", x: 85, y: 55, text: "The courier's sign-out log shows he left the building at 2:45 PM, ten minutes before the crash." },
    ],
    correctSuspectId: "r1-neha",
    explanation: "Neha had just walked in from the rain and rested her wet umbrella by the pedestal — the window gust knocked the vase, but her damp footprints near the scene gave it away.",
  },
  {
    id: "r2",
    title: "Who Ate the Last Slice?",
    sceneEmoji: "🍕",
    scenario: "The break-room pizza box is empty except for crumbs. Four coworkers had access.",
    suspects: [
      { id: "r2-sam", name: "Sam", role: "Gamer", emoji: "🎮" },
      { id: "r2-tara", name: "Tara", role: "Designer", emoji: "🎨" },
      { id: "r2-ola", name: "Ola", role: "Painter", emoji: "🖌️" },
      { id: "r2-ben", name: "Ben", role: "Trainer", emoji: "🏋️" },
    ],
    clues: [
      { id: "r2-c1", icon: "🧻", x: 15, y: 20, text: "A crumpled napkin by the box has a faint red lipstick smudge on it." },
      { id: "r2-c2", icon: "🎧", x: 80, y: 16, text: "Sam's headphones never left his desk — three coworkers confirm he was in a meeting all lunch." },
      { id: "r2-c3", icon: "🖌️", x: 20, y: 68, text: "Ola always leaves paint-stained fingerprints on anything she touches — the box lid is spotless." },
      { id: "r2-c4", icon: "🥗", x: 82, y: 65, text: "Ben has been loudly bragging about his strict no-carbs week since Monday." },
    ],
    correctSuspectId: "r2-tara",
    explanation: "The lipstick shade on the crumpled napkin matched Tara's exactly — everyone else had a rock-solid alibi.",
  },
  {
    id: "r3",
    title: "Who's Lying About the Exam?",
    sceneEmoji: "🏫",
    scenario: "Someone skipped this morning's exam but claims they were studying. The attendance sheet says otherwise.",
    suspects: [
      { id: "r3-dev", name: "Dev", role: "Bookworm", emoji: "🤓" },
      { id: "r3-priya", name: "Priya", role: "Music Fan", emoji: "🎧" },
      { id: "r3-kabir", name: "Kabir", role: "Athlete", emoji: "⚽" },
    ],
    clues: [
      { id: "r3-c1", icon: "⏰", x: 18, y: 22, text: "The exam hall doors locked at 9:00 sharp — no latecomers were let in." },
      { id: "r3-c2", icon: "📖", x: 60, y: 15, text: "Dev insists he was at the library all morning, studying for the retake." },
      { id: "r3-c3", icon: "🗂️", x: 82, y: 58, text: "The library's sign-in sheet has no entry under Dev's name for that entire morning." },
      { id: "r3-c4", icon: "🎒", x: 30, y: 68, text: "Priya's bag was found exactly in her assigned cubby, exam slip still tucked inside." },
    ],
    correctSuspectId: "r3-dev",
    explanation: "Dev's name was nowhere in the library log — wherever he really was that morning, it wasn't the library.",
  },
  {
    id: "r4",
    title: "Who's the Impostor?",
    sceneEmoji: "🚀",
    scenario: "A silent alarm flagged an unregistered crew member aboard the station. Three badges, one fake.",
    suspects: [
      { id: "r4-nova", name: "Nova", role: "Pilot", emoji: "👩‍🚀" },
      { id: "r4-rex", name: "Rex", role: "Engineer", emoji: "👨‍🚀" },
      { id: "r4-zed", name: "Zed", role: "New Recruit", emoji: "🧑‍🚀" },
    ],
    clues: [
      { id: "r4-c1", icon: "❤️", x: 15, y: 20, text: "Life-support logs show one crew badge never once registered a heartbeat during the drill." },
      { id: "r4-c2", icon: "🧤", x: 70, y: 16, text: "A spare glove was found with zero fingerprint oils inside it — pristine, like it was never worn by skin." },
      { id: "r4-c3", icon: "📻", x: 45, y: 65, text: "Rex's radio check came through crackly but landed right on schedule, same as always." },
    ],
    correctSuspectId: "r4-zed",
    explanation: "Zed's glove was spotless inside — no oils, no smudges, no heartbeat on record. No human hand had ever worn it.",
  },
  {
    id: "r5",
    title: "Who Let the Dog Out?",
    sceneEmoji: "🏡",
    scenario: "The backyard gate was found wide open and the family dog is missing. Three people were home.",
    suspects: [
      { id: "r5-grandma", name: "Grandma", role: "TV Fan", emoji: "👵" },
      { id: "r5-timmy", name: "Timmy", role: "Kid", emoji: "🧒" },
      { id: "r5-leo", name: "Uncle Leo", role: "Guest", emoji: "🧔" },
    ],
    clues: [
      { id: "r5-c1", icon: "🚪", x: 20, y: 18, text: "The side gate latch was found flipped open by hand — not broken, not forced." },
      { id: "r5-c2", icon: "🍪", x: 75, y: 22, text: "A trail of cookie crumbs leads from the kitchen jar straight out to the gate." },
      { id: "r5-c3", icon: "📺", x: 40, y: 68, text: "Grandma's show was on the whole afternoon, volume loud enough to hear from the yard." },
      { id: "r5-c4", icon: "☕", x: 82, y: 60, text: "Uncle Leo was on a video call in the living room the entire time, camera on." },
    ],
    correctSuspectId: "r5-timmy",
    explanation: "Timmy snuck out for an extra cookie and forgot to latch the gate behind him — the crumb trail told the whole story.",
  },
  {
    id: "r6",
    title: "Who Won the Race by Cheating?",
    sceneEmoji: "🏁",
    scenario: "One runner's lap time was impossibly fast. The track judges want an explanation.",
    suspects: [
      { id: "r6-ana", name: "Ana", role: "Runner", emoji: "🏃‍♀️" },
      { id: "r6-miguel", name: "Miguel", role: "Runner", emoji: "🏃" },
      { id: "r6-yui", name: "Yui", role: "Runner", emoji: "🏃‍♂️" },
    ],
    clues: [
      { id: "r6-c1", icon: "⏱️", x: 15, y: 20, text: "The official stopwatch logged one runner finishing a lap in an almost impossible time." },
      { id: "r6-c2", icon: "🚲", x: 78, y: 18, text: "Fresh tire tracks cut straight across the infield grass, skipping half the track." },
      { id: "r6-c3", icon: "📸", x: 40, y: 66, text: "A photo from the stands shows Ana crossing every single checkpoint flag on foot." },
      { id: "r6-c4", icon: "🥤", x: 80, y: 62, text: "Yui was seen resting at the water station well before the final lap even started." },
    ],
    correctSuspectId: "r6-miguel",
    explanation: "Miguel's 'sprint' left bicycle tire tracks across the infield — he borrowed a bike for the back stretch.",
  },
  {
    id: "r7",
    title: "Who Spilled the Secret?",
    sceneEmoji: "🎉",
    scenario: "News of a surprise promotion leaked before the announcement. Only three people knew in advance.",
    suspects: [
      { id: "r7-farah", name: "Farah", role: "Manager", emoji: "💼" },
      { id: "r7-ollie", name: "Ollie", role: "Host", emoji: "🎤" },
      { id: "r7-sana", name: "Sana", role: "Photographer", emoji: "📷" },
    ],
    clues: [
      { id: "r7-c1", icon: "🔒", x: 18, y: 20, text: "Only Farah, Ollie, and Sana knew about the promotion before the official announcement." },
      { id: "r7-c2", icon: "📱", x: 75, y: 16, text: "A group chat message from Ollie's phone is timestamped five minutes before the reveal." },
      { id: "r7-c3", icon: "📷", x: 45, y: 65, text: "Sana was busy setting up the photo booth the entire evening, camera never leaving her hands." },
    ],
    correctSuspectId: "r7-ollie",
    explanation: "Ollie couldn't resist hyping the group chat early — the timestamp on his message gave it away.",
  },
  {
    id: "r8",
    title: "Who Hung the Painting Upside Down?",
    sceneEmoji: "🖼️",
    scenario: "A prized painting was discovered hanging upside down right before the gallery opened.",
    suspects: [
      { id: "r8-wren", name: "Wren", role: "Curator", emoji: "🧑‍🎨" },
      { id: "r8-cody", name: "Cody", role: "Intern", emoji: "🎓" },
      { id: "r8-otis", name: "Otis", role: "Guard", emoji: "👮" },
    ],
    clues: [
      { id: "r8-c1", icon: "🪜", x: 15, y: 18, text: "The step-ladder was found folded and put away neatly, unlike its usual sloppy placement." },
      { id: "r8-c2", icon: "🧤", x: 78, y: 20, text: "A pair of small white cotton gloves was dropped on the floor right under the frame." },
      { id: "r8-c3", icon: "🔦", x: 45, y: 66, text: "Otis's flashlight was still clipped to his belt, untouched, when the alarm went off." },
      { id: "r8-c4", icon: "📝", x: 80, y: 60, text: "Wren's hanging checklist was signed off the night before — for every painting except this one." },
    ],
    correctSuspectId: "r8-cody",
    explanation: "The small gloves under the frame matched Cody's hands — he'd rushed to hang the painting before opening hours and never noticed it was upside down.",
  },
];

const TOTAL_ROUNDS = ROUNDS.length;
const START_LIVES = 3;

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700;800;900&family=Special+Elite&display=swap');`;

const CSS = `
${FONTS}

.wi-root, .wi-root *, .wi-root *::before, .wi-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
.wi-root {
  --bg: #f7e8c8;
  --surface: #fffdf6;
  --surface2: #fff6e2;
  --surface3: #ffecc4;
  --border: rgba(120,80,35,0.16);
  --border2: rgba(120,80,35,0.3);
  --text: #4a3320;
  --muted: #8a6f52;
  --accent: #ff8a3d;
  --accent2: #ff5e7a;
  --good: #43b56b;
  --bad: #ff5c5c;
  --warn: #ffb703;
  --cork1: #c9a06a;
  --cork2: #a9793f;
  --cork3: #b98b52;
  --font-display: 'Fredoka', sans-serif;
  --font-body: 'Nunito', sans-serif;
  --font-mono: 'Special Elite', monospace;

  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  min-height: calc(100% - 20px);
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  box-shadow: 0 10px 30px rgba(120,80,35,0.22);
  margin: 10px auto;
}

.wi-shell { display: flex; flex-direction: column; height: 100%; min-height: 100%; }

/* ---- TOPBAR ---- */
.wi-topbar {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  background: var(--surface);
  border-bottom: 3px solid var(--border2);
  position: relative; z-index: 10;
}
.wi-brand { display: flex; align-items: center; gap: 0.6rem; }
.wi-brand-logo {
  font-family: var(--font-display); font-size: 1.7rem; letter-spacing: 0.02em; font-weight: 700;
  color: var(--accent);
}
.wi-brand-dot {
  width: 9px; height: 9px; border-radius: 50%; background: var(--accent);
  box-shadow: 0 2px 3px rgba(120,80,35,0.35);
  animation: wiDotPulse 1.5s ease-in-out infinite;
}
@keyframes wiDotPulse { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.5);opacity:1} }
.wi-brand-tag { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em; color: var(--muted); }

.wi-stats { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.wi-pill {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: var(--surface2); border: 2px solid var(--border2);
  font-family: var(--font-body); font-size: 0.7rem;
  border-radius: 999px;
}
.wi-pill .lbl { color: var(--muted); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; }
.wi-pill .val { font-weight: 800; color: var(--text); font-size: 0.86rem; margin-left: 0.15rem; }

/* ---- BODY ---- */
.wi-body {
  display: grid; grid-template-columns: 1fr 300px;
  gap: 1px; background: var(--border2);
  flex: 1; min-height: 0;
}
@media (max-width: 860px) {
  .wi-body { grid-template-columns: 1fr; }
  .wi-scene-col, .wi-side-col { padding: 1rem; }
  .wi-stage { min-height: 240px; }
  .wi-hotspot { width: 40px; height: 40px; font-size: 1.15rem; }
  .wi-suspects { gap: 0.9rem; }
  .wi-suspect { flex: 1 1 108px; padding: 0.9rem 0.5rem 0.55rem; }
  .wi-suspect .emoji { font-size: 2.1rem; }
  .wi-ctrl-btn { padding: 0.75rem 0.5rem; font-size: 0.82rem; }
  .wi-log { max-height: 240px; }
}

.wi-scene-col { background: var(--bg); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.wi-side-col { background: var(--surface); padding: 1rem; display: flex; flex-direction: column; gap: 1rem; min-height: 0; }

/* ---- CASE HEADER ---- */
.wi-case-tag {
  display: inline-flex; align-items: center; gap: 0.4rem; width: fit-content;
  padding: 0.3rem 0.9rem;
  font-family: var(--font-mono); font-size: 0.66rem;
  letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700;
  border: 2px solid var(--bad); background: rgba(255,92,92,0.08); color: var(--bad);
  border-radius: 6px;
  transform: rotate(-2deg);
}
.wi-case-title {
  font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.8rem);
  letter-spacing: 0.01em; line-height: 1.05; margin-top: 0.5rem; font-weight: 700;
  color: var(--text);
}
.wi-case-scenario {
  font-size: 0.92rem; color: var(--muted); max-width: 640px; margin-top: 0.5rem; line-height: 1.5;
}

/* ---- SCENE STAGE ---- */
.wi-stage {
  position: relative;
  border: 10px solid var(--cork2);
  border-radius: 14px;
  background:
    radial-gradient(circle at 12% 22%, rgba(0,0,0,0.14) 0, transparent 3%),
    radial-gradient(circle at 78% 15%, rgba(0,0,0,0.12) 0, transparent 3%),
    radial-gradient(circle at 33% 68%, rgba(0,0,0,0.13) 0, transparent 3%),
    radial-gradient(circle at 88% 60%, rgba(0,0,0,0.12) 0, transparent 3%),
    radial-gradient(circle at 55% 40%, rgba(0,0,0,0.1) 0, transparent 3%),
    radial-gradient(circle at 20% 85%, rgba(255,255,255,0.08) 0, transparent 3%),
    radial-gradient(ellipse 90% 70% at 50% 30%, var(--cork1), var(--cork2));
  box-shadow: inset 0 0 40px rgba(80,50,20,0.35), 0 6px 14px rgba(120,80,35,0.25);
  min-height: 220px;
  overflow: hidden;
}
.wi-stage::before {
  content: '';
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px),
    repeating-linear-gradient(-45deg, rgba(0,0,0,0.035) 0px, rgba(0,0,0,0.035) 1px, transparent 1px, transparent 3px);
  mix-blend-mode: overlay;
}
.wi-stage.flash-correct { animation: wiFlashGood 0.5s ease-out; }
.wi-stage.flash-wrong { animation: wiFlashBad 0.5s ease-out; }
@keyframes wiFlashGood {
  0% { box-shadow: inset 0 0 0 999px rgba(67,181,107,0.32), 0 0 34px 8px rgba(67,181,107,0.45), 0 6px 14px rgba(120,80,35,0.25); }
  100% { box-shadow: inset 0 0 40px rgba(80,50,20,0.35), 0 6px 14px rgba(120,80,35,0.25); }
}
@keyframes wiFlashBad {
  0% { box-shadow: inset 0 0 0 999px rgba(255,92,92,0.28), 0 0 34px 8px rgba(255,92,92,0.4), 0 6px 14px rgba(120,80,35,0.25); }
  100% { box-shadow: inset 0 0 40px rgba(80,50,20,0.35), 0 6px 14px rgba(120,80,35,0.25); }
}

.wi-stage-emoji {
  position: absolute; left: 50%; top: 46%; transform: translate(-50%,-50%);
  font-size: 5rem; opacity: 0.22; filter: drop-shadow(0 4px 3px rgba(0,0,0,0.2)); pointer-events: none;
  animation: wiFloat 4s ease-in-out infinite;
}
@keyframes wiFloat { 0%,100% { transform: translate(-50%,-50%) translateY(0); } 50% { transform: translate(-50%,-50%) translateY(-10px); } }

.wi-hotspot {
  position: absolute; transform: translate(-50%,-50%);
  width: 34px; height: 34px; border-radius: 50%;
  display: grid; place-items: center;
  background: radial-gradient(circle at 35% 30%, #ffd27a, var(--accent) 70%);
  border: 2px solid rgba(255,255,255,0.6);
  cursor: pointer; font-size: 1rem; color: #4a3320;
  box-shadow: 0 5px 8px rgba(60,35,10,0.4), 0 2px 0 rgba(255,255,255,0.4) inset;
  animation: wiPulse 1.8s ease-in-out infinite;
  transition: transform 0.15s, background 0.2s, border-color 0.2s;
  z-index: 2;
}
.wi-hotspot:nth-of-type(4n+2) { background: radial-gradient(circle at 35% 30%, #ff9ab8, var(--accent2) 70%); }
.wi-hotspot:nth-of-type(4n+3) { background: radial-gradient(circle at 35% 30%, #9fe6c8, #37b978 70%); }
.wi-hotspot:nth-of-type(4n+4) { background: radial-gradient(circle at 35% 30%, #a9d4ff, #4d9bff 70%); }
.wi-hotspot:hover { transform: translate(-50%,-50%) scale(1.15) rotate(-6deg); }
.wi-hotspot:active { transform: translate(-50%,-50%) scale(0.92) rotate(-2deg); }
.wi-hotspot:not(.found)::before {
  content: '';
  position: absolute; inset: -7px;
  border-radius: 50%;
  border: 2px solid rgba(255,138,61,0.55);
  animation: wiRing 1.8s ease-out infinite;
  pointer-events: none;
}
@keyframes wiRing {
  0% { transform: scale(0.55); opacity: 0.75; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes wiPulse {
  0%,100% { box-shadow: 0 5px 8px rgba(60,35,10,0.4), 0 0 0 0 rgba(255,138,61,0.4); }
  50% { box-shadow: 0 5px 8px rgba(60,35,10,0.4), 0 0 0 7px rgba(255,138,61,0); }
}
.wi-hotspot.found {
  background: radial-gradient(circle at 35% 30%, #b6f2cc, var(--good) 70%); border-color: #fff; color: #123b22;
  animation: none; cursor: default; opacity: 0.85;
}
.wi-hotspot.found::after {
  content: '✓'; position: absolute; bottom: -6px; right: -6px;
  width: 16px; height: 16px; border-radius: 50%; background: var(--good); color: #fff;
  border: 2px solid #fff;
  font-size: 0.6rem; display: grid; place-items: center; font-weight: 700;
}

/* ---- SUSPECTS ---- */
.wi-suspects {
  display: flex; flex-wrap: wrap; gap: 1.1rem; justify-content: center;
  padding-top: 0.5rem;
}
.wi-suspect {
  flex: 1 1 130px; max-width: 180px;
  background: linear-gradient(180deg, #ffffff 0%, #fdfaf1 100%);
  border: 1px solid rgba(120,80,35,0.12);
  border-bottom: 12px solid #ffffff;
  border-radius: 4px;
  padding: 1rem 0.6rem 0.5rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
  cursor: pointer; transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  box-shadow: 0 2px 4px rgba(90,60,25,0.14), 0 6px 12px rgba(90,60,25,0.22);
  position: relative;
}
.wi-suspect::before {
  content: '📌'; position: absolute; top: -15px; left: 50%; transform: translateX(-50%);
  font-size: 1.3rem; filter: drop-shadow(0 4px 3px rgba(0,0,0,0.4));
  z-index: 1;
}
.wi-suspect:nth-of-type(3n+1) { transform: rotate(-3deg); }
.wi-suspect:nth-of-type(3n+2) { transform: rotate(2deg); }
.wi-suspect:nth-of-type(3n+3) { transform: rotate(-1.5deg); }
.wi-suspect:hover:not(:disabled) { transform: translateY(-4px) rotate(0deg) scale(1.03); box-shadow: 0 4px 6px rgba(90,60,25,0.16), 0 10px 18px rgba(90,60,25,0.28); }
.wi-suspect:active:not(:disabled) { transform: translateY(-1px) rotate(0deg) scale(0.98); box-shadow: 0 2px 4px rgba(90,60,25,0.18); }
.wi-suspect:disabled { cursor: default; opacity: 0.55; }
.wi-suspect .emoji { font-size: 2.4rem; line-height: 1; }
.wi-suspect .name { font-weight: 800; font-size: 0.92rem; color: var(--text); font-family: var(--font-body); }
.wi-suspect .role { font-family: var(--font-mono); font-size: 0.62rem; color: var(--muted); letter-spacing: 0.05em; text-transform: uppercase; }

.wi-suspect.wrong-shake { animation: wiShake 0.4s ease; border-bottom-color: var(--bad); box-shadow: 0 0 0 3px rgba(255,92,92,0.3), 0 6px 12px rgba(90,60,25,0.22); }
@keyframes wiShake {
  0%,100% { transform: translateX(0) rotate(0deg); }
  20% { transform: translateX(-7px) rotate(-3deg); }
  40% { transform: translateX(6px) rotate(3deg); }
  60% { transform: translateX(-5px) rotate(-2deg); }
  80% { transform: translateX(4px) rotate(2deg); }
}
.wi-suspect.correct-reveal { border-bottom-color: var(--good); box-shadow: 0 0 0 3px rgba(67,181,107,0.35), 0 10px 18px rgba(90,60,25,0.28); transform: rotate(0deg) scale(1.04); }
.wi-suspect.correct-reveal::after {
  content: '✓';
  position: absolute; top: -10px; right: -10px; z-index: 2;
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--good); color: #fff; font-weight: 800; font-size: 1rem;
  display: grid; place-items: center;
  border: 3px solid #fff;
  box-shadow: 0 4px 8px rgba(47,139,82,0.45);
  animation: wiCheckPop 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both;
}
@keyframes wiCheckPop {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  60% { transform: scale(1.25) rotate(8deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ---- EXPLANATION BANNER ---- */
.wi-explain {
  border: 2px dashed var(--good); background: #eafaf0;
  border-radius: 14px;
  padding: 0.9rem 1.1rem; display: flex; flex-direction: column; gap: 0.5rem;
  animation: wiSlideUp 0.3s ease-out;
}
@keyframes wiSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.wi-explain-title { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: #1f7a41; }
.wi-explain-text { font-size: 0.88rem; line-height: 1.5; color: var(--text); }
.wi-next-btn {
  align-self: flex-start;
  padding: 0.55rem 1.3rem; margin-top: 0.15rem;
  background: var(--good); border: none; border-bottom: 4px solid #2f8b52; color: #fff;
  border-radius: 999px;
  font-family: var(--font-display); font-size: 1rem; letter-spacing: 0.02em; font-weight: 600;
  cursor: pointer; text-transform: none;
  transition: all 0.15s;
}
.wi-next-btn:hover { filter: brightness(1.06); transform: translateY(-2px); }
.wi-next-btn:active { transform: translateY(1px); border-bottom-width: 2px; }

/* ---- SIDE PANEL ---- */
.wi-section-title {
  font-family: var(--font-mono); font-size: 0.64rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted);
  display: flex; align-items: center; gap: 0.5rem;
}
.wi-section-title::after { content: ''; flex: 1; height: 2px; background: repeating-linear-gradient(90deg, var(--border2) 0 4px, transparent 4px 8px); }

.wi-progress-row { display: flex; gap: 4px; }
.wi-progress-cell {
  flex: 1; height: 10px;
  border-radius: 999px;
  background: var(--surface3);
}
.wi-progress-cell.solved { background: var(--good); }
.wi-progress-cell.current { background: var(--accent); }

.wi-lives-row { display: flex; gap: 0.4rem; }
.wi-life { font-size: 1.25rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2)); opacity: 1; transition: all 0.2s; }
.wi-life.lost { opacity: 0.25; filter: grayscale(1); transform: scale(0.9); }

.wi-ctrl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.wi-ctrl-btn {
  padding: 0.6rem 0.5rem;
  background: var(--surface2); border: 2px solid var(--border2);
  border-bottom-width: 4px;
  color: var(--text); font-family: var(--font-body); font-size: 0.78rem; font-weight: 800;
  cursor: pointer; transition: all 0.15s; letter-spacing: 0.01em; text-transform: none;
  border-radius: 12px;
}
.wi-ctrl-btn:hover:not(:disabled) { background: var(--surface3); transform: translateY(-1px); }
.wi-ctrl-btn:active:not(:disabled) { transform: translateY(1px) scale(0.98); border-bottom-width: 2px; }
.wi-ctrl-btn:disabled { opacity: 0.4; cursor: default; }
.wi-ctrl-btn.accent { background: #fff0e2; border-color: var(--accent); color: #c85f1c; }
.wi-ctrl-btn.accent:not(:disabled) { animation: wiHintGlow 2.4s ease-in-out infinite; }
.wi-ctrl-btn.accent:hover:not(:disabled) { background: #ffe4cc; }
@keyframes wiHintGlow {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,138,61,0.45); }
  50% { box-shadow: 0 0 0 6px rgba(255,138,61,0); }
}
.wi-ctrl-btn.danger { background: #ffe8e8; border-color: var(--bad); color: #c73e3e; }
.wi-ctrl-btn.danger:hover { background: #ffd6d6; }
.wi-ctrl-btn.full { grid-column: 1 / -1; }

/* ---- CLUE LOG ---- */
.wi-log {
  flex: 1; min-height: 160px; max-height: 360px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 0.6rem;
  padding: 4px 6px 4px 2px;
}
.wi-log::-webkit-scrollbar { width: 4px; }
.wi-log::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 4px; }

.wi-log-entry {
  display: flex; gap: 0.55rem; align-items: flex-start;
  padding: 0.55rem 0.7rem;
  background: #fff3b0; border-left: none;
  border-radius: 3px;
  font-size: 0.8rem; line-height: 1.4;
  box-shadow: 0 4px 8px rgba(90,60,25,0.18);
  animation: wiFeedSlide 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both;
}
@keyframes wiFeedSlide {
  0% { opacity: 0; transform: translateY(10px) translateX(10px) scale(0.9); }
  60% { opacity: 1; transform: translateY(-2px) translateX(-1px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) translateX(0) scale(1); }
}
.wi-log-entry:nth-child(3n+1) { background: #fff3b0; transform: rotate(-1.2deg); }
.wi-log-entry:nth-child(3n+2) { background: #ffd6e8; transform: rotate(1deg); }
.wi-log-entry:nth-child(3n+3) { background: #d6f0ff; transform: rotate(-0.6deg); }
.wi-log-entry.correct { background: #d3f5df; }
.wi-log-entry.wrong { background: #ffd9d9; }
.wi-log-icon { flex-shrink: 0; font-size: 0.9rem; margin-top: 0.05rem; }
.wi-log-text { color: #4a3320; }

/* ---- OVERLAYS ---- */
.wi-overlay {
  position: absolute; inset: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  animation: wiFadeIn 0.35s ease-out;
}
@keyframes wiFadeIn { from { opacity: 0 } to { opacity: 1 } }
.wi-overlay.win-bg { background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,183,3,0.35) 0%, rgba(247,232,200,0.97) 65%); backdrop-filter: blur(6px); }
.wi-overlay.lose-bg { background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,92,92,0.28) 0%, rgba(247,232,200,0.97) 65%); backdrop-filter: blur(6px); }

.wi-result-card {
  max-width: 520px; width: 100%; background: var(--surface); border: 3px solid var(--border2);
  border-radius: 24px;
  overflow: hidden; animation: wiResultPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both;
  box-shadow: 0 16px 30px rgba(90,60,25,0.3);
}
@keyframes wiResultPop { from { opacity: 0; transform: scale(0.8) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.wi-result-header { padding: 2.5rem 2rem 1.5rem; text-align: center; }
.wi-result-header.win { background: linear-gradient(135deg, rgba(255,183,3,0.28), rgba(67,181,107,0.14)); }
.wi-result-header.lose { background: linear-gradient(135deg, rgba(255,92,92,0.24), rgba(255,138,61,0.1)); }
.wi-result-big { font-family: var(--font-display); font-size: clamp(2.4rem, 8vw, 4.2rem); letter-spacing: 0.01em; line-height: 1.05; margin-bottom: 0.5rem; font-weight: 700; }
.wi-result-big.win { color: var(--good); }
.wi-result-big.lose { color: var(--bad); }
.wi-result-tagline { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }

.wi-result-body { padding: 1.5rem 2rem 2rem; }
.wi-result-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.6rem; margin-bottom: 1.5rem; }
.wi-result-stat { padding: 1rem 0.5rem; text-align: center; background: var(--surface2); border-radius: 14px; border: 2px solid var(--border2); }
.wi-result-stat-val { font-family: var(--font-display); font-size: 1.9rem; line-height: 1; letter-spacing: 0.02em; font-weight: 700; }
.wi-result-stat-lbl { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-top: 0.3rem; }

.wi-result-message { font-size: 0.94rem; font-weight: 600; color: var(--text); text-align: center; margin-bottom: 1.5rem; line-height: 1.6; font-style: normal; }

.wi-result-btn {
  width: 100%; padding: 0.9rem;
  font-family: var(--font-display); font-size: 1.1rem; letter-spacing: 0.02em; font-weight: 600;
  cursor: pointer; border: none; border-bottom: 5px solid rgba(0,0,0,0.18); text-transform: none;
  border-radius: 999px;
  transition: all 0.15s; color: #fff;
}
.wi-result-btn.win { background: linear-gradient(135deg, var(--good), #2f8b52); }
.wi-result-btn.lose { background: linear-gradient(135deg, #ff7d7d, var(--bad)); }
.wi-result-btn:hover { transform: translateY(-2px); filter: brightness(1.05); }
.wi-result-btn:active { transform: translateY(1px); border-bottom-width: 2px; }

.wi-confetti { position: absolute; top: -10px; pointer-events: none; z-index: 600; animation: wiConfettiFall linear forwards; }
@keyframes wiConfettiFall { to { top: 110%; transform: rotate(720deg); } }
`;

function genId() {
  return Date.now() + Math.random();
}

function Confetti() {
  const colors = ["#ff8a3d", "#ff5e7a", "#43b56b", "#ffb703", "#4d9bff", "#ff6bcb"];
  return Array.from({ length: 46 }, (_, i) => (
    <div
      key={i}
      className="wi-confetti"
      style={{
        left: `${Math.random() * 100}vw`,
        background: colors[i % colors.length],
        width: `${5 + Math.random() * 8}px`,
        height: `${8 + Math.random() * 12}px`,
        animationDelay: `${Math.random() * 0.6}s`,
        animationDuration: `${1.2 + Math.random() * 1.5}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
        opacity: 0.85,
      }}
    />
  ));
}

export default function WhoIs() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [foundClueIds, setFoundClueIds] = useState([]);
  const [log, setLog] = useState([
    { type: "info", icon: "🕵️", text: "New investigation opened. Click clues around the scene, then accuse a suspect.", id: genId() },
  ]);
  const [lives, setLives] = useState(START_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [answeredCorrect, setAnsweredCorrect] = useState(false);
  const [wrongShakeId, setWrongShakeId] = useState(null);
  const [flash, setFlash] = useState(null);
  const [result, setResult] = useState(null);

  const advanceTimer = useRef(null);
  const shakeTimer = useRef(null);
  const flashTimer = useRef(null);
  const loseTimer = useRef(null);
  const logRef = useRef(null);

  const round = ROUNDS[roundIndex];

  const accuracy = useMemo(() => {
    const total = score + wrongAttempts;
    return total ? Math.round((score / total) * 100) : 100;
  }, [score, wrongAttempts]);

  useGameSounds({
    won: result === "win",
    lost: result === "lose",
    score,
  });

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (loseTimer.current) clearTimeout(loseTimer.current);
    };
  }, []);

  function addLog(type, icon, text) {
    setLog((prev) => [...prev.slice(-40), { type, icon, text, id: genId() }]);
  }

  function triggerFlash(type) {
    setFlash(type);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 450);
  }

  function clickClue(clue) {
    if (result || answeredCorrect || lives <= 0) return;
    if (foundClueIds.includes(clue.id)) return;
    setFoundClueIds((prev) => [...prev, clue.id]);
    addLog("clue", clue.icon, clue.text);
    playSound("pop");
  }

  function useHint() {
    if (result || answeredCorrect || lives <= 0) return;
    const unfound = round.clues.find((c) => !foundClueIds.includes(c.id));
    if (!unfound) {
      addLog("hint", "💡", "No more clues left to reveal in this case.");
      return;
    }
    setHintsUsed((h) => h + 1);
    setFoundClueIds((prev) => [...prev, unfound.id]);
    addLog("hint", "💡", `Hint: ${unfound.text}`);
  }

  function clickSuspect(suspect) {
    if (result || answeredCorrect || lives <= 0) return;

    if (suspect.id === round.correctSuspectId) {
      setAnsweredCorrect(true);
      setScore((s) => s + 1);
      setStreak((st) => {
        const ns = st + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      triggerFlash("correct");
      addLog("correct", "✅", `${suspect.name} is the one. Case closed.`);
      advanceTimer.current = setTimeout(() => {
        goNext();
      }, 1500);
    } else {
      setWrongShakeId(suspect.id);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setWrongShakeId(null), 400);
      triggerFlash("wrong");
      setStreak(0);
      setWrongAttempts((w) => w + 1);
      addLog("wrong", "❌", `Not ${suspect.name}... think again, detective.`);
      playSound("hit");
      setLives((prevLives) => {
        const next = prevLives - 1;
        if (next <= 0) {
          loseTimer.current = setTimeout(() => setResult("lose"), 500);
        }
        return next;
      });
    }
  }

  function goNext() {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      setResult("win");
      return;
    }
    setRoundIndex(next);
    setFoundClueIds([]);
    setAnsweredCorrect(false);
    addLog("info", "📁", `Case file opened: ${ROUNDS[next].title}`);
  }

  function resetGame() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    if (loseTimer.current) clearTimeout(loseTimer.current);
    setRoundIndex(0);
    setFoundClueIds([]);
    setLives(START_LIVES);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setWrongAttempts(0);
    setHintsUsed(0);
    setAnsweredCorrect(false);
    setWrongShakeId(null);
    setFlash(null);
    setResult(null);
    setLog([{ type: "info", icon: "🕵️", text: "New investigation started. Good luck, detective.", id: genId() }]);
  }

  const locked = answeredCorrect || !!result || lives <= 0;

  return (
    <div className="wi-root">
      <style>{CSS}</style>

      {/* WIN / LOSE OVERLAY */}
      {result && (
        <div className={`wi-overlay ${result === "win" ? "win-bg" : "lose-bg"}`}>
          {result === "win" && <Confetti />}
          <div className="wi-result-card">
            <div className={`wi-result-header ${result === "win" ? "win" : "lose"}`}>
              <div className={`wi-result-big ${result === "win" ? "win" : "lose"}`}>
                {result === "win" ? "MASTER DETECTIVE" : "CASE CLOSED"}
              </div>
              <div className="wi-result-tagline">
                {result === "win" ? "// All 8 cases solved" : "// You're off the force"}
              </div>
            </div>
            <div className="wi-result-body">
              <div className="wi-result-stats">
                <div className="wi-result-stat">
                  <div className="wi-result-stat-val" style={{ color: "var(--accent)" }}>{score}/{TOTAL_ROUNDS}</div>
                  <div className="wi-result-stat-lbl">Solved</div>
                </div>
                <div className="wi-result-stat">
                  <div className="wi-result-stat-val" style={{ color: accuracy >= 70 ? "var(--good)" : "var(--bad)" }}>{accuracy}%</div>
                  <div className="wi-result-stat-lbl">Accuracy</div>
                </div>
                <div className="wi-result-stat">
                  <div className="wi-result-stat-val" style={{ color: "var(--warn)" }}>{bestStreak}</div>
                  <div className="wi-result-stat-lbl">Best Streak</div>
                </div>
              </div>
              <div className="wi-result-message">
                {result === "win"
                  ? `Eight cases, ${score} solved, ${accuracy}% accuracy. The department is impressed, detective.`
                  : `You ran out of leads after solving ${score} case${score === 1 ? "" : "s"}. Sharpen your eye and get back out there.`}
              </div>
              <button className={`wi-result-btn ${result === "win" ? "win" : "lose"}`} onClick={resetGame}>
                {result === "win" ? "Play Again" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GAME */}
      <div className="wi-shell">
        <div className="wi-topbar">
          <div className="wi-brand">
            <div className="wi-brand-dot" />
            <div className="wi-brand-logo">WHO IS?</div>
            <div className="wi-brand-tag">Detective Case Files</div>
          </div>
          <div className="wi-stats">
            <div className="wi-pill"><span className="lbl">Case</span><span className="val">{roundIndex + 1}/{TOTAL_ROUNDS}</span></div>
            <div className="wi-pill"><span className="lbl">Lives</span><span className="val" style={{ color: lives <= 1 ? "var(--bad)" : "var(--text)" }}>{lives}</span></div>
            <div className="wi-pill"><span className="lbl">Streak</span><span className="val" style={{ color: "var(--warn)" }}>{streak}</span></div>
            <div className="wi-pill"><span className="lbl">Solved</span><span className="val" style={{ color: "var(--good)" }}>{score}</span></div>
          </div>
        </div>

        <div className="wi-body">
          {/* SCENE COLUMN */}
          <div className="wi-scene-col">
            <div>
              <div className="wi-case-tag">▶ Case File #{String(roundIndex + 1).padStart(2, "0")}</div>
              <div className="wi-case-title">{round.title}</div>
              <div className="wi-case-scenario">{round.scenario}</div>
            </div>

            <div className={`wi-stage ${flash === "correct" ? "flash-correct" : flash === "wrong" ? "flash-wrong" : ""}`}>
              <div className="wi-stage-emoji">{round.sceneEmoji}</div>
              {round.clues.map((clue) => {
                const found = foundClueIds.includes(clue.id);
                return (
                  <button
                    key={clue.id}
                    className={`wi-hotspot ${found ? "found" : ""}`}
                    style={{ left: `${clue.x}%`, top: `${clue.y}%` }}
                    onClick={() => clickClue(clue)}
                    title={found ? clue.text : "Click to inspect this clue"}
                    aria-label={found ? `Clue revealed: ${clue.text}` : "Unrevealed clue"}
                  >
                    {clue.icon}
                  </button>
                );
              })}
            </div>

            <div className="wi-suspects">
              {round.suspects.map((s) => {
                const isCorrectReveal = answeredCorrect && s.id === round.correctSuspectId;
                return (
                  <button
                    key={s.id}
                    className={`wi-suspect ${wrongShakeId === s.id ? "wrong-shake" : ""} ${isCorrectReveal ? "correct-reveal" : ""}`}
                    onClick={() => clickSuspect(s)}
                    disabled={locked}
                  >
                    <span className="emoji">{s.emoji}</span>
                    <span className="name">{s.name}</span>
                    <span className="role">{s.role}</span>
                  </button>
                );
              })}
            </div>

            {answeredCorrect && (
              <div className="wi-explain">
                <div className="wi-explain-title">Case Solved</div>
                <div className="wi-explain-text">{round.explanation}</div>
                <button className="wi-next-btn" onClick={goNext}>
                  {roundIndex + 1 >= TOTAL_ROUNDS ? "Finish Investigation →" : "Next Case →"}
                </button>
              </div>
            )}
          </div>

          {/* SIDE COLUMN */}
          <div className="wi-side-col">
            <div>
              <div className="wi-section-title" style={{ marginBottom: "0.5rem" }}>Progress</div>
              <div className="wi-progress-row">
                {ROUNDS.map((r, i) => (
                  <div
                    key={r.id}
                    className={`wi-progress-cell ${i < roundIndex || (i === roundIndex && answeredCorrect) ? "solved" : i === roundIndex ? "current" : ""}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="wi-section-title" style={{ marginBottom: "0.5rem" }}>Lives</div>
              <div className="wi-lives-row">
                {Array.from({ length: START_LIVES }, (_, i) => (
                  <span key={i} className={`wi-life ${i >= lives ? "lost" : ""}`}>❤️</span>
                ))}
              </div>
            </div>

            <div>
              <div className="wi-section-title" style={{ marginBottom: "0.5rem" }}>Controls</div>
              <div className="wi-ctrl-grid">
                <button className="wi-ctrl-btn accent" onClick={useHint} disabled={locked}>💡 Hint</button>
                <button className="wi-ctrl-btn danger" onClick={resetGame}>↺ Reset</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, gap: "0.5rem" }}>
              <div className="wi-section-title">Clue Log</div>
              <div className="wi-log" ref={logRef}>
                {log.map((entry) => (
                  <div key={entry.id} className={`wi-log-entry ${entry.type}`}>
                    <span className="wi-log-icon">{entry.icon}</span>
                    <span className="wi-log-text">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
