"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  Armchair,
  Bell,
  BellOff,
  Check,
  Flame,
  Footprints,
  Info,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

const STATS_KEY = "altf:posture-reminder:stats";
const PREFS_KEY = "altf:posture-reminder:prefs";
const CHECK_KEY = "altf:posture-reminder:check";

const ADHERENCE_GOAL = 70;

const EXERCISES = [
  {
    id: "chin-tucks",
    name: "Chin tucks",
    area: "Neck",
    duration: 45,
    text: "Sit tall, look straight ahead, and glide your chin straight back to make a double chin — no tilting. Hold 5 seconds, release. Repeat 8 times.",
  },
  {
    id: "blade-squeezes",
    name: "Shoulder blade squeezes",
    area: "Upper back",
    duration: 45,
    text: "Drop your shoulders down and back, then squeeze the blades together as if pinching a pencil between them. Hold 5 seconds, release. Repeat 10 times.",
  },
  {
    id: "doorway-chest",
    name: "Doorway chest stretch",
    area: "Chest",
    duration: 60,
    text: "Forearms on a doorframe, elbows at shoulder height, step through with one foot until you feel a stretch across the chest. Hold 30 seconds each side.",
  },
  {
    id: "spinal-twist",
    name: "Seated spinal twist",
    area: "Spine",
    duration: 60,
    text: "Sit tall, place your right hand on the outside of your left thigh, and rotate gently to the left from the mid-back. Hold 20 seconds, then swap sides.",
  },
  {
    id: "neck-side",
    name: "Neck side stretch",
    area: "Neck",
    duration: 60,
    text: "Anchor your left hand under the chair seat, tilt your right ear toward your right shoulder until you feel a stretch. Hold 20 seconds each side. No pulling.",
  },
  {
    id: "wrist-flexor",
    name: "Wrist flexor stretch",
    area: "Wrists",
    duration: 60,
    text: "Arm straight out, palm up, fingers pointing down. Use the other hand to gently draw the fingers back. Hold 20 seconds each side.",
  },
  {
    id: "wrist-extensor",
    name: "Wrist extensor stretch",
    area: "Wrists",
    duration: 45,
    text: "Arm straight out, palm down, fingers pointing down. Gently press the back of the hand toward you. Hold 20 seconds each side.",
  },
  {
    id: "hip-flexor",
    name: "Hip flexor lunge",
    area: "Hips",
    duration: 90,
    text: "Half-kneel with one knee down, squeeze that glute and shift your hips forward until you feel the front of the hip open. Hold 30 seconds each side.",
  },
  {
    id: "back-extension",
    name: "Standing back extension",
    area: "Lower back",
    duration: 30,
    text: "Stand, hands on your lower back, and lean gently backward, looking slightly up. Hold 3 seconds. Repeat 8 times. Stop short of any pinch.",
  },
  {
    id: "calf-raises",
    name: "Calf raises",
    area: "Legs",
    duration: 45,
    text: "Stand behind your chair, fingertips on the backrest for balance. Rise onto the balls of your feet, pause 1 second at the top, lower slowly. 15 reps.",
  },
  {
    id: "water-walk",
    name: "Walk to fill your water bottle",
    area: "Whole body",
    duration: 120,
    text: "The best movement break is the one with an errand attached. Get up, walk to the furthest tap or kitchen, fill up, walk back. Take the long way.",
  },
  {
    id: "figure-4",
    name: "Seated figure-4 glute stretch",
    area: "Hips",
    duration: 90,
    text: "Cross your right ankle over your left knee, sit tall, and hinge forward from the hips until you feel it in the right glute. Hold 30 seconds each side.",
  },
  {
    id: "upper-trap",
    name: "Upper trap release",
    area: "Neck",
    duration: 60,
    text: "Tilt your ear toward your shoulder, then rotate your nose slightly up and away. Hold 20 seconds each side. This is the corner that carries your stress.",
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    area: "Shoulders",
    duration: 30,
    text: "Roll both shoulders up, back, and down in slow, exaggerated circles. 10 backward, then 5 forward. Let the arms hang heavy.",
  },
  {
    id: "levator",
    name: "Levator scapulae stretch",
    area: "Neck",
    duration: 60,
    text: "Turn your head 45 degrees to the right, then look down toward your armpit. Hold 20 seconds each side. Targets the ache behind the shoulder blade.",
  },
  {
    id: "hamstring",
    name: "Standing hamstring stretch",
    area: "Legs",
    duration: 60,
    text: "Heel on the floor in front, toes up, hinge forward from the hips with a flat back until you feel the back of the thigh. Hold 25 seconds each side.",
  },
  {
    id: "cat-cow",
    name: "Seated cat-cow",
    area: "Spine",
    duration: 60,
    text: "Hands on knees. Inhale, arch and open the chest. Exhale, round the spine and tuck the chin. Move slowly with the breath for 8 rounds.",
  },
  {
    id: "thoracic-ext",
    name: "Thoracic extension over the chair",
    area: "Mid back",
    duration: 45,
    text: "Sit with the backrest at your shoulder blades, hands behind your head, and lean back over the top of the chair. Breathe out as you extend. 6 slow reps.",
  },
  {
    id: "sit-to-stand",
    name: "Sit-to-stand squats",
    area: "Legs",
    duration: 60,
    text: "From your chair, stand up without using your hands, then lower back down under control. 10 reps. The most useful strength move at a desk.",
  },
  {
    id: "ankle-pumps",
    name: "Ankle circles and pumps",
    area: "Ankles",
    duration: 45,
    text: "Lift one foot, draw 10 slow circles each direction, then point and flex 10 times. Swap feet. Keeps blood moving out of the lower leg.",
  },
  {
    id: "hand-fans",
    name: "Finger fans and fists",
    area: "Hands",
    duration: 30,
    text: "Spread your fingers wide, hold 3 seconds, then make a loose fist. 10 rounds. Follow with a slow shake-out.",
  },
  {
    id: "side-bend",
    name: "Standing side bend",
    area: "Obliques",
    duration: 45,
    text: "Stand, reach your right arm overhead, and lean gently to the left, keeping the hips square. Hold 15 seconds each side.",
  },
  {
    id: "breathing",
    name: "Diaphragm reset",
    area: "Breathing",
    duration: 60,
    text: "One hand on your chest, one on your belly. Breathe in through the nose for 4 so the belly rises, out through the mouth for 6. Six rounds. Slouching kills breath depth.",
  },
  {
    id: "march",
    name: "March in place",
    area: "Whole body",
    duration: 60,
    text: "Stand and march, driving the knees to hip height and swinging the opposite arm. 60 seconds. Add a gentle torso rotation if you have room.",
  },
  {
    id: "wall-angels",
    name: "Wall angels",
    area: "Upper back",
    duration: 60,
    text: "Back to a wall, heels a few inches out, arms in a goalpost against the wall. Slide them up and down while keeping the wrists and lower back in contact. 8 slow reps.",
  },
];

const CHECKPOINTS = [
  { id: "feet", label: "Feet flat on the floor", hint: "Or on a footrest. Crossed legs and dangling feet both dump load onto the low back." },
  { id: "knees", label: "Knees at about 90 degrees", hint: "Hips level with or just above the knees, with a two-finger gap behind the knee." },
  { id: "lumbar", label: "Lower back supported", hint: "Your lumbar curve should meet the backrest. A rolled towel works if the chair does not." },
  { id: "elbows", label: "Elbows at about 90 degrees", hint: "Forearms roughly level with the desk, wrists straight, shoulders not lifted to reach the keys." },
  { id: "screen", label: "Screen at eye level, arm's length away", hint: "Top of the screen at or just below eye height, so you look slightly down." },
  { id: "shoulders", label: "Shoulders relaxed and down", hint: "Ears over shoulders, chin gently tucked. Not perched forward toward the screen." },
];

const INTERVAL_PRESETS = [30, 45, 60];

const pad2 = (n) => String(n).padStart(2, "0");
const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fmtClock = (secs) => {
  const s = Math.max(0, Math.round(secs));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
};
const fmtMins = (secs) => {
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const emptyDay = () => ({ prompted: 0, completed: 0, movementSeconds: 0, standSeconds: 0 });

function ProgressRing({ fraction, label, sub, tone }) {
  const R = 86;
  const C = 2 * Math.PI * R;
  const clamped = Math.min(1, Math.max(0, fraction));
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--muted)" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke={tone}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 0.3s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-semibold tabular-nums">{label}</p>
        <p className="mt-1 px-4 text-center text-xs font-semibold uppercase text-[var(--muted-foreground)]">
          {sub}
        </p>
      </div>
    </div>
  );
}

function PostureDiagram() {
  const stroke = "var(--foreground)";
  const accent = "var(--primary)";
  const muted = "var(--muted-foreground)";
  return (
    <svg
      viewBox="0 0 420 300"
      className="h-auto w-full"
      role="img"
      aria-label="Side view of correct seated desk posture: feet flat, knees and elbows near 90 degrees, lower back supported, screen at eye level"
    >
      <line x1="10" y1="270" x2="410" y2="270" stroke={muted} strokeWidth="1.5" opacity="0.6" />

      <path d="M110,190 L190,190" stroke={muted} strokeWidth="4" strokeLinecap="round" />
      <path d="M110,190 L104,118" stroke={muted} strokeWidth="4" strokeLinecap="round" />
      <path d="M150,190 L150,266" stroke={muted} strokeWidth="3" strokeLinecap="round" />
      <path d="M130,266 L170,266" stroke={muted} strokeWidth="3" strokeLinecap="round" />
      <path d="M107,168 q10,-6 0,-14" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" />

      <line x1="200" y1="150" x2="405" y2="150" stroke={muted} strokeWidth="4" strokeLinecap="round" />
      <line x1="396" y1="150" x2="396" y2="266" stroke={muted} strokeWidth="3" strokeLinecap="round" />

      <rect x="300" y="95" width="90" height="53" rx="3" fill="none" stroke={muted} strokeWidth="3" />
      <line x1="345" y1="148" x2="345" y2="150" stroke={muted} strokeWidth="3" />

      <line
        x1="160"
        y1="92"
        x2="396"
        y2="92"
        stroke={accent}
        strokeWidth="1.5"
        strokeDasharray="5 4"
        opacity="0.8"
      />
      <text x="248" y="86" fontSize="10" fill={accent} fontWeight="600">
        eye level
      </text>

      <circle cx="145" cy="92" r="14" fill="none" stroke={stroke} strokeWidth="3" />
      <path d="M135,182 L140,110" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M140,110 L146,152" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M146,152 L215,148" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M135,182 L195,182" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M195,182 L200,262" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M200,262 L228,266" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />

      <path d="M179,182 A16,16 0 0 0 195,198" fill="none" stroke={accent} strokeWidth="2" />
      <text x="160" y="207" fontSize="10" fill={accent} fontWeight="600">
        90&#176;
      </text>
      <path d="M146,138 A14,14 0 0 1 160,152" fill="none" stroke={accent} strokeWidth="2" />
      <text x="163" y="136" fontSize="10" fill={accent} fontWeight="600">
        90&#176;
      </text>

      {[
        { n: 1, x: 345, y: 78, label: "" },
        { n: 2, x: 128, y: 104, label: "" },
        { n: 3, x: 92, y: 160, label: "" },
        { n: 4, x: 176, y: 146, label: "" },
        { n: 5, x: 232, y: 246, label: "" },
      ].map((p) => (
        <g key={p.n}>
          <circle cx={p.x} cy={p.y} r="9" fill={accent} />
          <text
            x={p.x}
            y={p.y + 3.5}
            fontSize="10"
            fontWeight="700"
            textAnchor="middle"
            fill="var(--primary-foreground)"
          >
            {p.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("movement");
  const [phase, setPhase] = useState("idle");
  const [paused, setPaused] = useState(false);
  const [targetEpoch, setTargetEpoch] = useState(0);
  const [remaining, setRemaining] = useState(45 * 60);
  const [intervalMins, setIntervalMins] = useState(45);
  const [sitMins, setSitMins] = useState(45);
  const [standMins, setStandMins] = useState(15);
  const [exerciseId, setExerciseId] = useState(EXERCISES[0].id);
  const [soundOn, setSoundOn] = useState(true);
  const [notifyState, setNotifyState] = useState("unsupported");
  const [stats, setStats] = useState({});
  const [checked, setChecked] = useState({});
  const [today, setToday] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const audioRef = useRef(null);
  const phaseRef = useRef("idle");
  const exerciseRef = useRef(EXERCISES[0].id);
  const soundRef = useRef(true);
  const titleRef = useRef("");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    exerciseRef.current = exerciseId;
  }, [exerciseId]);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    titleRef.current = document.title;
    setToday(dateKey(new Date()));
    try {
      const stored = JSON.parse(window.localStorage.getItem(STATS_KEY) || "{}");
      if (stored && typeof stored === "object" && !Array.isArray(stored)) setStats(stored);
    } catch {
      /* ignore */
    }
    try {
      const prefs = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "null");
      if (Number.isFinite(prefs?.intervalMins) && prefs.intervalMins >= 5 && prefs.intervalMins <= 180) {
        setIntervalMins(prefs.intervalMins);
        setRemaining(prefs.intervalMins * 60);
      }
      if (Number.isFinite(prefs?.sitMins) && prefs.sitMins >= 10 && prefs.sitMins <= 120) setSitMins(prefs.sitMins);
      if (Number.isFinite(prefs?.standMins) && prefs.standMins >= 5 && prefs.standMins <= 60) {
        setStandMins(prefs.standMins);
      }
      if (typeof prefs?.soundOn === "boolean") setSoundOn(prefs.soundOn);
      if (prefs?.mode === "sitstand" || prefs?.mode === "movement") setMode(prefs.mode);
    } catch {
      /* ignore */
    }
    try {
      const savedCheck = JSON.parse(window.localStorage.getItem(CHECK_KEY) || "null");
      if (savedCheck && typeof savedCheck === "object") setChecked(savedCheck);
    } catch {
      /* ignore */
    }
    if ("Notification" in window) setNotifyState(Notification.permission);
    setHydrated(true);
    return () => {
      document.title = titleRef.current;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const keys = Object.keys(stats).sort();
      const pruned = {};
      keys.slice(-60).forEach((k) => {
        pruned[k] = stats[k];
      });
      window.localStorage.setItem(STATS_KEY, JSON.stringify(pruned));
    } catch {
      /* ignore */
    }
  }, [stats, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ intervalMins, sitMins, standMins, soundOn, mode })
      );
    } catch {
      /* ignore */
    }
  }, [intervalMins, sitMins, standMins, soundOn, mode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CHECK_KEY, JSON.stringify(checked));
    } catch {
      /* ignore */
    }
  }, [checked, hydrated]);

  const chime = useCallback((kind) => {
    if (!soundRef.current) return;
    try {
      if (!audioRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioRef.current = new Ctx();
      }
      const ctx = audioRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const notes = kind === "up" ? [440, 587.33, 739.99] : [659.25, 440];
      notes.forEach((freq, i) => {
        const start = ctx.currentTime + i * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.12, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.9);
      });
    } catch {
      /* ignore */
    }
  }, []);

  const notify = useCallback((title, body) => {
    try {
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      if (!document.hidden) return;
      const n = new Notification(title, { body, tag: "altf-posture", silent: true });
      window.setTimeout(() => n.close(), 8000);
    } catch {
      /* ignore */
    }
  }, []);

  const addStat = useCallback((patch) => {
    const key = dateKey(new Date());
    setStats((prev) => {
      const day = prev[key] || emptyDay();
      return {
        ...prev,
        [key]: {
          prompted: day.prompted + (patch.prompted || 0),
          completed: day.completed + (patch.completed || 0),
          movementSeconds: day.movementSeconds + (patch.movementSeconds || 0),
          standSeconds: day.standSeconds + (patch.standSeconds || 0),
        },
      };
    });
  }, []);

  const beginWaiting = useCallback((mins) => {
    setPhase("waiting");
    setPaused(false);
    setTargetEpoch(Date.now() + mins * 60000);
    setRemaining(mins * 60);
  }, []);

  const beginSit = useCallback((mins) => {
    setPhase("sit");
    setPaused(false);
    setTargetEpoch(Date.now() + mins * 60000);
    setRemaining(mins * 60);
  }, []);

  const beginStand = useCallback((mins) => {
    setPhase("stand");
    setPaused(false);
    setTargetEpoch(Date.now() + mins * 60000);
    setRemaining(mins * 60);
  }, []);

  const beginBreak = useCallback(() => {
    const pool = EXERCISES.filter((e) => e.id !== exerciseRef.current);
    const ex = pool[Math.floor(Math.random() * pool.length)];
    exerciseRef.current = ex.id;
    setExerciseId(ex.id);
    setPhase("break");
    setPaused(false);
    setTargetEpoch(Date.now() + ex.duration * 1000);
    setRemaining(ex.duration);
  }, []);

  const onWaitingDone = useCallback(() => {
    addStat({ prompted: 1 });
    chime("up");
    notify("Time to move", "Stand up and take a one minute movement break.");
    beginBreak();
  }, [addStat, beginBreak, chime, notify]);

  const onBreakDone = useCallback(() => {
    const ex = EXERCISES.find((e) => e.id === exerciseRef.current) || EXERCISES[0];
    addStat({ completed: 1, movementSeconds: ex.duration });
    chime("down");
    beginWaiting(intervalMins);
  }, [addStat, beginWaiting, chime, intervalMins]);

  const onSitDone = useCallback(() => {
    addStat({ prompted: 1 });
    chime("up");
    notify("Stand up", `Raise the desk — ${standMins} minutes standing.`);
    beginStand(standMins);
  }, [addStat, beginStand, chime, notify, standMins]);

  const onStandDone = useCallback(() => {
    addStat({ completed: 1, standSeconds: standMins * 60 });
    chime("down");
    notify("Sit back down", `Lower the desk — ${sitMins} minutes seated.`);
    beginSit(sitMins);
  }, [addStat, beginSit, chime, notify, sitMins, standMins]);

  useEffect(() => {
    if (phase === "idle" || paused) return undefined;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const ms = targetEpoch - Date.now();
      if (ms <= 0) {
        cancelled = true;
        const current = phaseRef.current;
        if (current === "waiting") onWaitingDone();
        else if (current === "break") onBreakDone();
        else if (current === "sit") onSitDone();
        else if (current === "stand") onStandDone();
        return;
      }
      setRemaining(ms / 1000);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [phase, paused, targetEpoch, onWaitingDone, onBreakDone, onSitDone, onStandDone]);

  const clock = fmtClock(remaining);

  useEffect(() => {
    if (phase === "idle") {
      document.title = titleRef.current;
      return undefined;
    }
    const tag =
      phase === "break" ? "Move" : phase === "stand" ? "Standing" : phase === "sit" ? "Seated" : "Next break";
    document.title = `${clock} · ${paused ? "Paused" : tag}`;
    return undefined;
  }, [phase, paused, clock]);

  const start = () => {
    chime("down");
    if (mode === "sitstand") beginSit(sitMins);
    else beginWaiting(intervalMins);
  };

  const stop = () => {
    if (phase === "stand" && !paused) {
      const done = standMins * 60 - Math.max(0, (targetEpoch - Date.now()) / 1000);
      if (done > 30) addStat({ standSeconds: done });
    }
    setPhase("idle");
    setPaused(false);
    setRemaining((mode === "sitstand" ? sitMins : intervalMins) * 60);
  };

  const pause = () => {
    setPaused(true);
    setRemaining(Math.max(0, (targetEpoch - Date.now()) / 1000));
  };

  const resume = () => {
    setTargetEpoch(Date.now() + remaining * 1000);
    setPaused(false);
  };

  const markDone = () => {
    onBreakDone();
  };

  const skipBreak = () => {
    chime("down");
    beginWaiting(intervalMins);
  };

  const swapExercise = () => {
    beginBreak();
  };

  const moveNow = () => {
    addStat({ prompted: 1 });
    chime("up");
    beginBreak();
  };

  const standNow = () => {
    addStat({ prompted: 1 });
    chime("up");
    beginStand(standMins);
  };

  const sitNow = () => {
    const done = standMins * 60 - Math.max(0, (targetEpoch - Date.now()) / 1000);
    if (done > 30) addStat({ standSeconds: done });
    chime("down");
    beginSit(sitMins);
  };

  const requestNotify = async () => {
    try {
      if (!("Notification" in window)) {
        setNotifyState("unsupported");
        return;
      }
      const result = await Notification.requestPermission();
      setNotifyState(result);
    } catch {
      setNotifyState("denied");
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setPhase("idle");
    setPaused(false);
    setRemaining((next === "sitstand" ? sitMins : intervalMins) * 60);
  };

  const history = useMemo(() => {
    if (!today) return [];
    const [y, m, d] = today.split("-").map(Number);
    const base = new Date(y, m - 1, d);
    const rows = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
      const key = dateKey(day);
      const entry = stats[key] || emptyDay();
      const adherence = entry.prompted ? (entry.completed / entry.prompted) * 100 : 0;
      rows.push({
        key,
        label: day.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2),
        ...entry,
        adherence,
        hit: entry.prompted > 0 && adherence >= ADHERENCE_GOAL,
        isToday: i === 0,
      });
    }
    return rows;
  }, [stats, today]);

  const streak = useMemo(() => {
    if (!today) return 0;
    const [y, m, d] = today.split("-").map(Number);
    const base = new Date(y, m - 1, d);
    let count = 0;
    for (let i = 0; i < 365; i += 1) {
      const day = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
      const entry = stats[dateKey(day)];
      const ok = entry && entry.prompted > 0 && (entry.completed / entry.prompted) * 100 >= ADHERENCE_GOAL;
      if (ok) count += 1;
      else if (i > 0) break;
    }
    return count;
  }, [stats, today]);

  const todayStats = stats[today] || emptyDay();
  const adherence = todayStats.prompted ? (todayStats.completed / todayStats.prompted) * 100 : 0;
  const historyMax = Math.max(1, ...history.map((h) => h.completed));
  const exercise = EXERCISES.find((e) => e.id === exerciseId) || EXERCISES[0];
  const checkedCount = CHECKPOINTS.filter((c) => checked[c.id]).length;

  const totalSecs =
    phase === "break"
      ? exercise.duration
      : phase === "stand"
        ? standMins * 60
        : phase === "sit"
          ? sitMins * 60
          : intervalMins * 60;
  const fraction = phase === "idle" ? 1 : remaining / totalSecs;
  const tone =
    phase === "break"
      ? "var(--anslation-ds-success)"
      : phase === "stand"
        ? "var(--anslation-ds-info)"
        : "var(--primary)";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Accessibility className="h-4 w-4" />
            Desk health
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Posture &amp; Movement Reminder</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            The problem was never the chair — it is holding one position for three hours. Set an interval, get
            nudged, and take a real movement break from a bank of {EXERCISES.length} desk-friendly stretches and
            resets. Standing desk? Switch to sit-stand cycles instead.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_380px]">
          <div
            className={`rounded-lg border bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] ${
              phase === "break" ? "altf-posture-in" : ""
            }`}
            style={{
              borderColor: phase === "break" ? "var(--anslation-ds-success)" : "var(--border)",
            }}
          >
            {phase === "break" ? (
              <div className="text-center">
                <p
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--anslation-ds-success)" }}
                >
                  Movement break
                </p>
                <h2 className="mt-2 text-3xl font-semibold leading-tight">{exercise.name}</h2>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                    {exercise.area}
                  </span>
                  <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
                    {exercise.duration >= 60
                      ? `${(exercise.duration / 60).toFixed(exercise.duration % 60 ? 1 : 0)} min`
                      : `${exercise.duration} sec`}
                  </span>
                </div>
                <div className="my-5">
                  <ProgressRing
                    fraction={fraction}
                    label={clock}
                    sub="hold the break"
                    tone={tone}
                  />
                </div>
                <p className="mx-auto max-w-md rounded-md bg-[var(--muted)] p-4 text-left text-sm leading-6 text-[var(--muted-foreground)]">
                  {exercise.text}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={markDone}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)]"
                  >
                    <Check className="h-4 w-4" />
                    Done
                  </button>
                  <button type="button" onClick={swapExercise} className="btn-secondary min-h-11 px-4 text-sm">
                    <Shuffle className="h-4 w-4" />
                    Swap
                  </button>
                  <button type="button" onClick={skipBreak} className="btn-secondary min-h-11 px-4 text-sm">
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-4 inline-flex rounded-md border border-[var(--border)] p-0.5">
                  {[
                    { id: "movement", label: "Movement breaks" },
                    { id: "sitstand", label: "Sit-stand cycle" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => switchMode(opt.id)}
                      className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                        mode === opt.id
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {phase === "idle"
                    ? "Ready"
                    : paused
                      ? "Paused"
                      : phase === "stand"
                        ? "Standing"
                        : phase === "sit"
                          ? "Seated"
                          : "Next break"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight">
                  {phase === "idle"
                    ? mode === "sitstand"
                      ? `${sitMins} min sitting, then ${standMins} min standing`
                      : `Move every ${intervalMins} minutes`
                    : paused
                      ? "Timer paused"
                      : phase === "stand"
                        ? "You are standing — shift your weight now and then"
                        : phase === "sit"
                          ? "Seated block running"
                          : "Keep working — you will get a nudge"}
                </h2>
                <div className="my-5">
                  <ProgressRing
                    fraction={fraction}
                    label={clock}
                    sub={
                      phase === "stand"
                        ? "until you sit"
                        : phase === "sit"
                          ? "until you stand"
                          : phase === "idle"
                            ? "first block"
                            : "until you move"
                    }
                    tone={tone}
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2" aria-live="polite">
                  {phase === "idle" ? (
                    <button
                      type="button"
                      onClick={start}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)]"
                    >
                      <Play className="h-4 w-4" />
                      {mode === "sitstand" ? "Start the cycle" : "Start reminders"}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={paused ? resume : pause}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)]"
                      >
                        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        {paused ? "Resume" : "Pause"}
                      </button>
                      {mode === "movement" ? (
                        <button type="button" onClick={moveNow} className="btn-secondary min-h-11 px-4 text-sm">
                          <Footprints className="h-4 w-4" />
                          Move now
                        </button>
                      ) : phase === "sit" ? (
                        <button type="button" onClick={standNow} className="btn-secondary min-h-11 px-4 text-sm">
                          <Accessibility className="h-4 w-4" />
                          Stand now
                        </button>
                      ) : (
                        <button type="button" onClick={sitNow} className="btn-secondary min-h-11 px-4 text-sm">
                          <Armchair className="h-4 w-4" />
                          Sit now
                        </button>
                      )}
                      <button type="button" onClick={stop} className="btn-secondary min-h-11 px-4 text-sm">
                        <RotateCcw className="h-4 w-4" />
                        Stop
                      </button>
                    </>
                  )}
                </div>
                {phase === "idle" && (
                  <p className="mt-4 text-xs text-[var(--muted-foreground)]">
                    Timing survives background tabs, and the tab title carries the countdown.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">Settings</h2>
              {mode === "movement" ? (
                <>
                  <p className="mt-3 text-sm font-semibold">Remind me every</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {INTERVAL_PRESETS.map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setIntervalMins(mins);
                          if (phase === "idle") setRemaining(mins * 60);
                        }}
                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                          intervalMins === mins
                            ? "border-[var(--primary)] text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                  <label className="mt-3 block">
                    <span className="text-sm font-semibold">Custom interval (minutes)</span>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={intervalMins}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (Number.isFinite(next) && next >= 5 && next <= 180) {
                          setIntervalMins(Math.round(next));
                          if (phase === "idle") setRemaining(Math.round(next) * 60);
                        }
                      }}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                      Anywhere from 5 to 180 minutes. Around 30 minutes is where most workplace guidance lands.
                    </span>
                  </label>
                </>
              ) : (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-sm font-semibold">Sit (min)</span>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={sitMins}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          if (Number.isFinite(next) && next >= 10 && next <= 120) {
                            setSitMins(Math.round(next));
                            if (phase === "idle") setRemaining(Math.round(next) * 60);
                          }
                        }}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">Stand (min)</span>
                      <input
                        type="number"
                        min={5}
                        max={60}
                        value={standMins}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          if (Number.isFinite(next) && next >= 5 && next <= 60) setStandMins(Math.round(next));
                        }}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      [45, 15],
                      [30, 30],
                      [50, 10],
                    ].map(([s, st]) => (
                      <button
                        key={`${s}-${st}`}
                        type="button"
                        onClick={() => {
                          setSitMins(s);
                          setStandMins(st);
                          if (phase === "idle") setRemaining(s * 60);
                        }}
                        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                          sitMins === s && standMins === st
                            ? "border-[var(--primary)] text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {s}/{st}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    Build up gradually. Standing all day swaps one static posture for another and brings its own
                    aches — the win is in changing position, not in standing longer.
                  </p>
                </>
              )}

              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  onClick={() => setSoundOn((v) => !v)}
                  className="btn-secondary min-h-11 justify-start px-3 text-sm"
                  aria-pressed={soundOn}
                >
                  {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  Chime {soundOn ? "on" : "off"}
                </button>
                {notifyState === "granted" ? (
                  <p className="flex items-center gap-2 rounded-md bg-[var(--muted)] px-3 py-2.5 text-sm text-[var(--muted-foreground)]">
                    <Bell className="h-4 w-4" style={{ color: "var(--anslation-ds-success)" }} />
                    Notifications on — sent only when this tab is hidden.
                  </p>
                ) : notifyState === "denied" ? (
                  <p className="flex items-start gap-2 rounded-md bg-[var(--muted)] px-3 py-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
                    Notifications are blocked for this site. The chime and tab title still work — re-enable them
                    in your browser site settings if you want them back.
                  </p>
                ) : notifyState === "unsupported" ? (
                  <p className="flex items-start gap-2 rounded-md bg-[var(--muted)] px-3 py-2.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
                    This browser does not support notifications. The chime and tab title still work.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={requestNotify}
                    className="btn-secondary min-h-11 justify-start px-3 text-sm"
                  >
                    <Bell className="h-4 w-4" />
                    Enable notifications
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-lg font-semibold">Today</h2>
              <div className="mt-3 grid grid-cols-2 gap-3" aria-live="polite">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-2xl font-semibold text-[var(--primary)]">
                    {todayStats.completed}
                    <span className="text-sm font-normal text-[var(--muted-foreground)]">
                      /{todayStats.prompted}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">breaks done vs prompted</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p
                    className="text-2xl font-semibold"
                    style={{
                      color:
                        todayStats.prompted === 0
                          ? "var(--foreground)"
                          : adherence >= ADHERENCE_GOAL
                            ? "var(--anslation-ds-success)"
                            : "var(--anslation-ds-warning)",
                    }}
                  >
                    {todayStats.prompted === 0 ? "--" : `${Math.round(adherence)}%`}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">adherence</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-2xl font-semibold">{fmtMins(todayStats.movementSeconds)}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">movement time</p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="flex items-center gap-1 text-2xl font-semibold">
                    <Flame
                      className="h-5 w-5"
                      style={{ color: streak > 0 ? "var(--anslation-ds-warning)" : "var(--muted-foreground)" }}
                    />
                    {streak}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">day streak at {ADHERENCE_GOAL}%+</p>
                </div>
              </div>
              <div className="mt-3 rounded-md bg-[var(--muted)] p-3">
                <p className="text-sm font-semibold">
                  {fmtMins(todayStats.standSeconds)} standing today
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Counted from completed standing blocks in sit-stand mode.
                </p>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase text-[var(--muted-foreground)]">Last 7 days</p>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {history.map((day) => {
                  const height = day.completed > 0 ? Math.max(8, (day.completed / historyMax) * 100) : 3;
                  return (
                    <div key={day.key} className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                        {day.completed}
                      </span>
                      <div className="flex h-20 w-full items-end rounded-md bg-[var(--muted)] px-1 pb-1 pt-1">
                        <div
                          className="w-full rounded-sm transition-all"
                          style={{
                            height: `${height}%`,
                            background: day.hit ? "var(--anslation-ds-success)" : "var(--primary)",
                            opacity: day.completed > 0 ? 1 : 0.35,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          day.isToday ? "font-semibold text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {day.isToday ? "Today" : day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Posture self-check</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Run through this once, then adjust the chair and desk to match. Tick what is already true.
                </p>
              </div>
              <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                {checkedCount}/{CHECKPOINTS.length} aligned
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                <PostureDiagram />
              </div>
              <div className="grid content-start gap-2">
                {CHECKPOINTS.map((point, i) => {
                  const on = Boolean(checked[point.id]);
                  return (
                    <label
                      key={point.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition ${
                        on ? "border-[var(--primary)] bg-[var(--muted)]" : "border-[var(--border)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setChecked((prev) => ({ ...prev, [point.id]: !prev[point.id] }))}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      />
                      <span>
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          {i < 5 && (
                            <span
                              className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
                              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                            >
                              {i + 1}
                            </span>
                          )}
                          {point.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {point.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Is sitting the new smoking?</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              No — and the slogan gets the science backwards. The comparison does not hold: the effect sizes are
              nowhere near tobacco, and researchers who study this have pushed back on the phrase for years.
              What the evidence actually supports is narrower and more useful.
            </p>
            <div className="mt-4 grid gap-2">
              {[
                [
                  "The dose is the duration, not the chair",
                  "Risk tracks with long uninterrupted bouts of sitting. Breaking those bouts up changes the picture even when total sitting time barely moves.",
                ],
                [
                  "Activity offsets a lot of it",
                  "Large pooled analyses found that people who sit a great deal but move enough during the day carry far less of the excess risk. Sitting is worst as a marker of an otherwise still day.",
                ],
                [
                  "Standing is not the cure",
                  "Swapping a static sit for a static stand trades back ache for leg, foot, and vein complaints. Sit-stand desks help because they make you change position, not because standing is virtuous.",
                ],
                [
                  "Static load is the mechanism",
                  "Held postures keep the same muscles under low-level contraction and the same discs under steady pressure, while blood and lymph pool. Movement flushes all three. The best posture is the next one.",
                ],
              ].map(([title, text]) => (
                <div key={title} className="rounded-md bg-[var(--muted)] p-3">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{text}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Your break counts, adherence, and standing time stay on your device in this browser. Nothing is
              uploaded.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-lg font-semibold">The movement bank</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {EXERCISES.length} breaks, drawn at random so you never get the same one twice in a row.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXERCISES.map((ex) => (
              <div
                key={ex.id}
                className={`rounded-md border p-3 transition ${
                  ex.id === exerciseId && phase === "break"
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{ex.name}</p>
                  <span className="shrink-0 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--primary)]">
                    {ex.area}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{ex.text}</p>
                <p className="mt-1.5 text-xs font-semibold text-[var(--muted-foreground)]">
                  {ex.duration >= 60
                    ? `${(ex.duration / 60).toFixed(ex.duration % 60 ? 1 : 0)} min`
                    : `${ex.duration} sec`}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            General wellbeing guidance for awareness, not medical advice, diagnosis, or treatment. These
            stretches suit most healthy desk workers, but they are not physiotherapy and they are not built for
            your body. Nothing here should hurt — ease off if it does. Stop and see a doctor or physiotherapist
            for pain that persists, worsens, or wakes you at night, and for any numbness, tingling, weakness,
            radiating leg or arm pain, dizziness, or symptoms following an injury. If you are pregnant, recently
            had surgery, or have a known spine, joint, heart, or circulatory condition, check with your clinician
            before starting.
          </p>
        </section>
      </div>

      <style>{`
        .altf-posture-in { animation: altf-posture-fade 0.4s ease-out; }
        @keyframes altf-posture-fade {
          from { opacity: 0.4; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .altf-posture-in { animation: none; }
        }
      `}</style>
    </main>
  );
}
