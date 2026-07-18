"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CigaretteOff,
  Clock,
  Coffee,
  Copy,
  Droplets,
  Heart,
  HeartPulse,
  Lock,
  Phone,
  RotateCcw,
  Shuffle,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Wind,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STATE_KEY = "altf:quit-smoking-tracker:state";

const MINUTES_PER_CIGARETTE = 11;

const HOUR = 60;
const DAY = 24 * 60;
const YEAR = 365 * DAY;

const milestones = [
  {
    at: 20,
    label: "20 minutes",
    title: "Heart rate and blood pressure drop",
    detail:
      "The nicotine spike that keeps your heart working harder starts to fade. Your pulse and blood pressure begin easing back toward your own baseline.",
  },
  {
    at: 12 * HOUR,
    label: "12 hours",
    title: "Carbon monoxide in your blood normalises",
    detail:
      "Carbon monoxide from smoke competes with oxygen for space on your red blood cells. As it clears, your blood carries oxygen properly again.",
  },
  {
    at: 24 * HOUR,
    label: "24 hours",
    title: "Heart attack risk begins to drop",
    detail: "A single smoke-free day already starts shifting your risk of a heart attack downward.",
  },
  {
    at: 48 * HOUR,
    label: "48 hours",
    title: "Nerve endings regrow — smell and taste sharpen",
    detail:
      "Damaged nerve endings start to repair. Food stops tasting flat. This is the point where most people notice something concrete.",
  },
  {
    at: 72 * HOUR,
    label: "72 hours",
    title: "Bronchial tubes relax, breathing gets easier",
    detail:
      "Your airways relax and lung capacity increases. Nicotine withdrawal usually peaks around here too — it is the hardest day and it does pass.",
  },
  {
    at: 14 * DAY,
    label: "2 weeks – 3 months",
    title: "Circulation improves, lung function up to 30% better",
    detail:
      "Walking gets easier and exercise stops feeling like a fight. Lung function can improve by as much as 30% across this window.",
  },
  {
    at: 30 * DAY,
    label: "1 – 9 months",
    title: "Coughing eases, cilia regrow",
    detail:
      "The tiny hairs that sweep your lungs clean grow back, so your lungs start handling mucus and infection properly. Coughing and shortness of breath decrease.",
  },
  {
    at: YEAR,
    label: "1 year",
    title: "Coronary heart disease risk halved",
    detail: "Your excess risk of coronary heart disease is about half that of someone still smoking.",
  },
  {
    at: 5 * YEAR,
    label: "5 years",
    title: "Stroke risk approaches a non-smoker’s",
    detail: "Arteries and blood vessels widen back out. Stroke risk can fall to that of someone who never smoked.",
  },
  {
    at: 10 * YEAR,
    label: "10 years",
    title: "Lung cancer death risk halved",
    detail:
      "Your risk of dying from lung cancer is about half that of a continuing smoker, and risk of several other cancers drops too.",
  },
  {
    at: 15 * YEAR,
    label: "15 years",
    title: "Coronary heart disease risk equals a non-smoker’s",
    detail: "The full journey. On this measure, your heart is where it would be if you had never started.",
  },
];

const distractions = [
  "Walk to the end of the street and back. That is about four minutes — longer than the craving.",
  "Wash your face with cold water, slowly.",
  "Text someone you have been meaning to reply to.",
  "Do 15 push-ups, or 15 seconds of anything that makes you breathe harder.",
  "Chew gum, or eat something crunchy — carrot, apple, roasted chana.",
  "Put on one song and listen to the whole thing without doing anything else.",
  "Make tea. The kettle, the pouring, the waiting — all of it is time.",
  "Wash the dishes in the sink right now. Boring works.",
  "Brush your teeth. Nobody wants a cigarette straight after.",
  "Step outside and name five things you can see. Then come back in.",
  "Tidy one drawer. Only one.",
  "Squeeze something hard for 30 seconds — a stress ball, a rolled towel.",
  "Water the plants, or repot the one that has been waiting.",
  "Write down what set this craving off. Patterns are useful later.",
  "Stretch your arms overhead and roll your shoulders back ten times.",
  "Look up how much you have saved on this page. Then look at your goal.",
];

const fourDs = [
  {
    key: "Delay",
    icon: Clock,
    text: "Do not say never. Say not for the next few minutes. Cravings peak and fade in about 3–5 minutes whether or not you smoke — you only have to outlast that.",
  },
  {
    key: "Deep breathe",
    icon: Wind,
    text: "Breathe in for 4, out for 6, ten times. The long out-breath calms the same jitters you would have handed to nicotine.",
  },
  {
    key: "Drink water",
    icon: Droplets,
    text: "Slowly, a full glass. It occupies your hands and mouth, and dehydration makes withdrawal feel worse than it is.",
  },
  {
    key: "Distract",
    icon: Shuffle,
    text: "Change rooms, change task, change company. A craving needs your attention to keep going.",
  },
];

const datePresets = [
  { label: "Just now", ms: 0 },
  { label: "Yesterday", ms: DAY * 60000 },
  { label: "1 week ago", ms: 7 * DAY * 60000 },
  { label: "1 month ago", ms: 30 * DAY * 60000 },
  { label: "3 months ago", ms: 91 * DAY * 60000 },
  { label: "1 year ago", ms: 365 * DAY * 60000 },
];

const goalPresets = [
  { label: "New phone", amount: 40000 },
  { label: "Weekend trip", amount: 15000 },
  { label: "A year of gym", amount: 12000 },
  { label: "Emergency fund", amount: 50000 },
];

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const pad = (value) => String(value).padStart(2, "0");

const toLocalInput = (ms) => {
  const date = new Date(ms);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
};

const fromLocalInput = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, hh, mm] = match.map(Number);
  return new Date(y, m - 1, d, hh, mm).getTime();
};

const splitDuration = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
};

const humanRemaining = (ms) => {
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= 1) return "in under a minute";
  if (minutes < 60) return `in ${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 48) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.ceil(hours / 24);
  if (days < 60) return `in ${days} days`;
  const months = Math.round(days / 30.44);
  if (months < 24) return `in ${months} months`;
  return `in ${(days / 365.25).toFixed(1)} years`;
};

const humanLife = (minutesTotal) => {
  const minutes = Math.floor(minutesTotal);
  if (minutes < 60) return `${minutes} min`;
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${mins}m`;
};

function StatTile({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-[var(--primary)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{sub}</p>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value * 100)).toFixed(2)}%` }}
      />
    </div>
  );
}

export default function ToolHome() {
  const [quitAt, setQuitAt] = useState(null);
  const [cigsPerDay, setCigsPerDay] = useState(10);
  const [packCost, setPackCost] = useState(350);
  const [cigsPerPack, setCigsPerPack] = useState(20);
  const [longestMs, setLongestMs] = useState(0);
  const [attempts, setAttempts] = useState(1);
  const [goalLabel, setGoalLabel] = useState("New phone");
  const [goalAmount, setGoalAmount] = useState(40000);
  const [now, setNow] = useState(0);

  const [cravingOpen, setCravingOpen] = useState(false);
  const [cravingEndsAt, setCravingEndsAt] = useState(null);
  const [distraction, setDistraction] = useState(distractions[0]);
  const [soundOn, setSoundOn] = useState(true);
  const [slipOpen, setSlipOpen] = useState(false);
  const [slipNote, setSlipNote] = useState("");
  const [copied, setCopied] = useState(false);

  const audioRef = useRef(null);
  const chimedRef = useRef(false);

  useEffect(() => {
    const start = Date.now();
    let loaded = null;
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      loaded = null;
    }
    setNow(start);
    if (loaded && typeof loaded === "object") {
      setQuitAt(typeof loaded.quitAt === "number" ? loaded.quitAt : start);
      if (typeof loaded.cigsPerDay === "number") setCigsPerDay(loaded.cigsPerDay);
      if (typeof loaded.packCost === "number") setPackCost(loaded.packCost);
      if (typeof loaded.cigsPerPack === "number") setCigsPerPack(loaded.cigsPerPack);
      if (typeof loaded.longestMs === "number") setLongestMs(loaded.longestMs);
      if (typeof loaded.attempts === "number") setAttempts(loaded.attempts);
      if (typeof loaded.goalLabel === "string") setGoalLabel(loaded.goalLabel);
      if (typeof loaded.goalAmount === "number") setGoalAmount(loaded.goalAmount);
    } else {
      setQuitAt(start);
    }
    setDistraction(distractions[Math.floor(Math.random() * distractions.length)]);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (quitAt === null) return;
    try {
      window.localStorage.setItem(
        STATE_KEY,
        JSON.stringify({ quitAt, cigsPerDay, packCost, cigsPerPack, longestMs, attempts, goalLabel, goalAmount })
      );
    } catch {
      /* storage unavailable — the tracker still works for this session */
    }
  }, [quitAt, cigsPerDay, packCost, cigsPerPack, longestMs, attempts, goalLabel, goalAmount]);

  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.close().catch(() => {});
        audioRef.current = null;
      }
    },
    []
  );

  const ensureAudio = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioRef.current) audioRef.current = new Ctx();
      if (audioRef.current.state === "suspended") audioRef.current.resume();
      return audioRef.current;
    } catch {
      return null;
    }
  }, []);

  const playChime = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + index * 0.22;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.1, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.2);
      });
    } catch {
      /* audio is a nicety, never a requirement */
    }
  }, []);

  const cravingLeft = cravingEndsAt ? Math.max(0, Math.ceil((cravingEndsAt - now) / 1000)) : 180;

  useEffect(() => {
    if (!cravingEndsAt || chimedRef.current) return;
    if (now >= cravingEndsAt) {
      chimedRef.current = true;
      if (soundOn) playChime();
    }
  }, [now, cravingEndsAt, soundOn, playChime]);

  const costPerCig = (Number(packCost) || 0) / Math.max(1, Number(cigsPerPack) || 1);
  const perDay = Math.max(0, Number(cigsPerDay) || 0);
  const dailySpend = perDay * costPerCig;

  const elapsedMs = quitAt === null ? 0 : Math.max(0, now - quitAt);
  const inFuture = quitAt !== null && quitAt > now;
  const elapsedMinutes = elapsedMs / 60000;
  const cigsAvoided = (elapsedMs / 86400000) * perDay;
  const moneySaved = cigsAvoided * costPerCig;
  const lifeMinutes = cigsAvoided * MINUTES_PER_CIGARETTE;
  const clock = splitDuration(elapsedMs);

  const nextIndex = milestones.findIndex((item) => item.at > elapsedMinutes);
  const next = nextIndex === -1 ? null : milestones[nextIndex];
  const prevAt = nextIndex <= 0 ? 0 : milestones[nextIndex - 1].at;
  const nextProgress = next ? (elapsedMinutes - prevAt) / (next.at - prevAt) : 1;
  const unlockedCount = milestones.filter((item) => item.at <= elapsedMinutes).length;

  const goalDate = useMemo(() => {
    const target = Number(goalAmount) || 0;
    if (target <= 0 || dailySpend <= 0) return null;
    if (moneySaved >= target) return { reached: true };
    const daysNeeded = (target - moneySaved) / dailySpend;
    const date = new Date(now + daysNeeded * 86400000);
    return { reached: false, daysNeeded, date };
  }, [goalAmount, dailySpend, moneySaved, now]);

  const projections = useMemo(() => {
    const points = [
      { label: "1 week", days: 7 },
      { label: "1 month", days: 30.44 },
      { label: "6 months", days: 182.6 },
      { label: "1 year", days: 365.25 },
      { label: "5 years", days: 1826 },
    ];
    return points.map((point) => ({
      label: point.label,
      cigs: point.days * perDay,
      money: point.days * dailySpend,
      life: point.days * perDay * MINUTES_PER_CIGARETTE,
    }));
  }, [perDay, dailySpend]);

  const report = useMemo(() => {
    if (quitAt === null) return "";
    return [
      "Quit Smoking Tracker",
      `Quit date: ${new Date(quitAt).toLocaleString("en-IN")}`,
      `Smoke-free: ${clock.days}d ${clock.hours}h ${clock.minutes}m`,
      `Cigarettes not smoked: ${num.format(Math.floor(cigsAvoided))}`,
      `Money saved: ${inr.format(moneySaved)}`,
      `Life regained: ${humanLife(lifeMinutes)} (at ~11 minutes per cigarette)`,
      `Milestones reached: ${unlockedCount} of ${milestones.length}`,
      `Longest smoke-free run: ${splitDuration(Math.max(longestMs, elapsedMs)).days} days`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
    ].join("\n");
  }, [quitAt, clock, cigsAvoided, moneySaved, lifeMinutes, unlockedCount, longestMs, elapsedMs]);

  const copyReport = async () => {
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const resetQuitDate = () => {
    const stamp = Date.now();
    setLongestMs((value) => Math.max(value, elapsedMs));
    setAttempts((value) => value + 1);
    setQuitAt(stamp);
    setNow(stamp);
    setSlipOpen(false);
    setSlipNote("Clock restarted. Your longest run is saved below — you already know you can do that much.");
  };

  const startCraving = () => {
    ensureAudio();
    chimedRef.current = false;
    setCravingEndsAt(Date.now() + 180000);
    setDistraction(distractions[Math.floor(Math.random() * distractions.length)]);
  };

  const bestMs = Math.max(longestMs, elapsedMs);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <CigaretteOff className="h-4 w-4" />
            Smoke-free tracker
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Quit Smoking Tracker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Your body starts repairing itself twenty minutes after your last cigarette, and it does not stop for fifteen
            years. Set your quit date and watch the real medical milestones unlock — along with the money and the time
            you are getting back. Everything stays on your device.
          </p>
        </section>

        {quitAt !== null && (
          <>
            <section className="mt-6 grid gap-6 2xl:grid-cols-[340px_1fr]">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <h2 className="text-sm font-semibold">Your quit</h2>

                <label className="mt-4 block">
                  <span className="text-sm font-semibold">Quit date and time</span>
                  <input
                    type="datetime-local"
                    value={toLocalInput(quitAt)}
                    onChange={(event) => {
                      const parsed = fromLocalInput(event.target.value);
                      if (parsed !== null) setQuitAt(parsed);
                    }}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {datePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuitAt(Date.now() - preset.ms)}
                      className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {inFuture && (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    That is in the future — your counter starts then. No judgement either way.
                  </p>
                )}

                <div className="mt-5 grid gap-4">
                  <label className="block">
                    <span className="text-sm font-semibold">Cigarettes per day (before quitting)</span>
                    <input
                      type="number"
                      min="0"
                      value={cigsPerDay}
                      onChange={(event) => setCigsPerDay(Number(event.target.value))}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Cost per pack (₹)</span>
                    <input
                      type="number"
                      min="0"
                      value={packCost}
                      onChange={(event) => setPackCost(Number(event.target.value))}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold">Cigarettes per pack</span>
                    <input
                      type="number"
                      min="1"
                      value={cigsPerPack}
                      onChange={(event) => setCigsPerPack(Number(event.target.value))}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                </div>

                <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">That habit was costing you</p>
                  <p className="mt-1 text-lg font-semibold">{inr.format(dailySpend * 30.44)} a month</p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {inr.format(dailySpend * 365.25)} a year · {inr.format(costPerCig)} per cigarette
                  </p>
                </div>

                <div className="mt-5 grid gap-2">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">Longest smoke-free run</p>
                    <p className="mt-1 font-semibold">
                      {splitDuration(bestMs).days} days {splitDuration(bestMs).hours} hours
                    </p>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-xs text-[var(--muted-foreground)]">Attempt number</p>
                    <p className="mt-1 font-semibold">{attempts}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Smoke-free for</p>
                      <div className="mt-3 flex flex-wrap items-baseline gap-4" aria-live="polite">
                        {[
                          [clock.days, clock.days === 1 ? "day" : "days"],
                          [clock.hours, "hours"],
                          [clock.minutes, "min"],
                          [clock.seconds, "sec"],
                        ].map(([value, label]) => (
                          <div key={label}>
                            <span className="text-4xl font-semibold tabular-nums text-[var(--primary)]">{value}</span>
                            <span className="ml-1 text-sm text-[var(--muted-foreground)]">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy progress"}
                    </button>
                  </div>

                  {next && (
                    <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">Next up: {next.title}</p>
                        <p className="text-xs font-semibold text-[var(--primary)]">
                          {humanRemaining(next.at * 60000 - elapsedMs)}
                        </p>
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={nextProgress} />
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                        {unlockedCount} of {milestones.length} milestones reached
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatTile
                    icon={CigaretteOff}
                    label="Cigarettes not smoked"
                    value={num.format(Math.floor(cigsAvoided))}
                    sub={`At ${perDay} a day, that is ${num.format(Math.floor(cigsAvoided / Math.max(1, cigsPerPack)))} packs never opened.`}
                  />
                  <StatTile
                    icon={Wallet}
                    label="Money saved"
                    value={inr.format(moneySaved)}
                    sub={`Growing by ${inr.format(dailySpend)} every day you stay stopped.`}
                  />
                  <StatTile
                    icon={Heart}
                    label="Life regained"
                    value={humanLife(lifeMinutes)}
                    sub="Based on the widely cited estimate that each cigarette costs about 11 minutes of life."
                  />
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_340px]">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
                    <HeartPulse className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold">Your health recovery timeline</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                      These are the documented milestones after a last cigarette, drawn from public-health guidance. They
                      unlock in order, on your clock — nothing here is decorative.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {milestones.map((milestone, index) => {
                    const unlocked = milestone.at <= elapsedMinutes;
                    const isNext = index === nextIndex;
                    const reachedOn = new Date(quitAt + milestone.at * 60000);
                    return (
                      <div
                        key={milestone.label}
                        className={`rounded-md border p-4 transition ${
                          unlocked
                            ? "border-[var(--primary)] bg-[var(--card)]"
                            : isNext
                              ? "border-[var(--border)] bg-[var(--muted)]"
                              : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                              unlocked
                                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                            }`}
                          >
                            {unlocked ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <p className="text-xs font-semibold uppercase text-[var(--primary)]">{milestone.label}</p>
                              {unlocked ? (
                                <p className="text-xs text-[var(--muted-foreground)]">
                                  Reached {reachedOn.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              ) : (
                                <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                                  {humanRemaining(milestone.at * 60000 - elapsedMs)}
                                </p>
                              )}
                            </div>
                            <p className={`mt-1 font-semibold ${unlocked ? "" : "text-[var(--muted-foreground)]"}`}>
                              {milestone.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{milestone.detail}</p>
                            {isNext && (
                              <div className="mt-3">
                                <ProgressBar value={nextProgress} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                  Timings are population averages from public-health sources (CDC, NHS, WHO and the US Surgeon General’s
                  reports). Your own recovery depends on how long and how much you smoked, and on your general health.
                </p>
              </div>

              <aside className="grid gap-6 self-start">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[var(--primary)]" />
                    <h2 className="text-sm font-semibold">Turn it into something</h2>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <label className="block">
                      <span className="text-sm font-semibold">What do you want?</span>
                      <input
                        type="text"
                        value={goalLabel}
                        onChange={(event) => setGoalLabel(event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold">What does it cost? (₹)</span>
                      <input
                        type="number"
                        min="0"
                        value={goalAmount}
                        onChange={(event) => setGoalAmount(Number(event.target.value))}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {goalPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setGoalLabel(preset.label);
                          setGoalAmount(preset.amount);
                        }}
                        className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                    {!goalDate && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Add a cost and your daily habit above to see when the money gets there.
                      </p>
                    )}
                    {goalDate?.reached && (
                      <p className="text-sm font-semibold text-[var(--primary)]">
                        You have already saved enough for {goalLabel || "it"}. Go and get it — you earned that.
                      </p>
                    )}
                    {goalDate && !goalDate.reached && (
                      <>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {inr.format(Number(goalAmount) || 0)} of not smoking
                        </p>
                        <p className="mt-1 text-lg font-semibold leading-6">
                          That is a {goalLabel || "goal"} by{" "}
                          <span className="text-[var(--primary)]">
                            {goalDate.date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                          {Math.ceil(goalDate.daysNeeded)} more days at {inr.format(dailySpend)} a day.
                        </p>
                        <div className="mt-3">
                          <ProgressBar value={moneySaved / Math.max(1, Number(goalAmount) || 1)} />
                        </div>
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                          {inr.format(moneySaved)} saved so far
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
                    <h2 className="text-sm font-semibold">What is ahead</h2>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    If you stay stopped, measured from your quit date.
                  </p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-xs uppercase text-[var(--muted-foreground)]">
                          <th className="pb-2 font-semibold">By</th>
                          <th className="pb-2 font-semibold">Cigs</th>
                          <th className="pb-2 font-semibold">Saved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projections.map((row) => (
                          <tr key={row.label} className="border-t border-[var(--border)]">
                            <td className="py-2 font-semibold">{row.label}</td>
                            <td className="py-2 tabular-nums text-[var(--muted-foreground)]">
                              {num.format(Math.round(row.cigs))}
                            </td>
                            <td className="py-2 tabular-nums font-semibold text-[var(--primary)]">
                              {inr.format(row.money)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </aside>
            </section>

            <section className="mt-6 grid gap-6 2xl:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <h2 className="text-2xl font-semibold">Craving right now?</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  A craving is not a countdown to smoking. It rises, peaks in about 3–5 minutes, and falls whether or not
                  you feed it. Start the timer and let it lose.
                </p>

                {!cravingOpen ? (
                  <button
                    type="button"
                    onClick={() => setCravingOpen(true)}
                    className="mt-5 inline-flex h-12 items-center gap-2 rounded-md bg-[var(--primary)] px-6 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                  >
                    <Coffee className="h-4 w-4" />
                    I’m craving right now
                  </button>
                ) : (
                  <div className="mt-5">
                    <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] p-5 text-center">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Ride it out</p>
                      <p className="mt-2 text-5xl font-semibold tabular-nums text-[var(--primary)]" aria-live="polite">
                        {pad(Math.floor(cravingLeft / 60))}:{pad(cravingLeft % 60)}
                      </p>
                      {cravingEndsAt && cravingLeft === 0 ? (
                        <p className="mt-3 text-sm font-semibold">
                          That craving passed, and you are still here. That is exactly how the next one goes too.
                        </p>
                      ) : (
                        <div className="mt-3">
                          <ProgressBar value={cravingEndsAt ? (180 - cravingLeft) / 180 : 0} />
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={startCraving}
                          className="inline-flex h-10 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                        >
                          {cravingEndsAt ? <RotateCcw className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                          {cravingEndsAt ? "Restart 3 minutes" : "Start 3 minutes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSoundOn((value) => !value)}
                          aria-pressed={soundOn}
                          className="btn-secondary min-h-10 px-3 py-1.5 text-sm"
                        >
                          {soundOn ? "Chime on" : "Chime off"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCravingOpen(false);
                            setCravingEndsAt(null);
                          }}
                          className="btn-secondary min-h-10 px-3 py-1.5 text-sm"
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {fourDs.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold">
                              <Icon className="h-4 w-4 text-[var(--primary)]" />
                              {item.key}
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">{item.text}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Try this instead</p>
                        <button
                          type="button"
                          onClick={() => setDistraction(distractions[Math.floor(Math.random() * distractions.length)])}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                        >
                          <Shuffle className="h-3.5 w-3.5" />
                          Another
                        </button>
                      </div>
                      <p className="mt-2 text-sm leading-6">{distraction}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
                <h2 className="text-2xl font-semibold">Had a cigarette?</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Then you had a cigarette. It is information about what you were doing, who you were with, and what you
                  were feeling — not a verdict on you. Most people who quit for good do it across several attempts; that
                  is the normal shape of quitting, not a personal weakness.
                </p>

                {!slipOpen ? (
                  <button
                    type="button"
                    onClick={() => setSlipOpen(true)}
                    className="btn-secondary mt-5 min-h-12 px-4"
                  >
                    I slipped
                  </button>
                ) : (
                  <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--muted)] p-5">
                    <p className="text-sm font-semibold">What do you want to do with the clock?</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                      One cigarette does not undo weeks of repair — your milestones are not deleted. Some people keep the
                      date and carry on; others prefer an honest restart. Either is a legitimate answer.
                    </p>
                    <div className="mt-4 grid gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSlipOpen(false);
                          setSlipNote("Date kept. One cigarette in a quit is still a quit — carry on.");
                        }}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-left text-sm font-semibold transition hover:border-[var(--primary)]"
                      >
                        Keep my quit date
                        <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                          It was one cigarette, and I am still stopped
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={resetQuitDate}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-left text-sm font-semibold transition hover:border-[var(--primary)]"
                      >
                        Restart from now
                        <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                          Your longest run of {splitDuration(bestMs).days} days is kept on record
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlipOpen(false)}
                        className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)] underline"
                      >
                        Never mind, close this
                      </button>
                    </div>
                  </div>
                )}

                {slipNote && (
                  <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)]" aria-live="polite">
                    {slipNote}
                  </p>
                )}

                <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                    Worth knowing
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    Your record run is {splitDuration(bestMs).days} days. Whatever happens next, that already happened —
                    you have done it once, which is more than a person who has never tried. The useful question after a
                    slip is not “what is wrong with me”, it is “what was going on right before”.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Willpower is not the only tool available</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                    Quitting unaided works for some people, but nicotine replacement therapy, prescription medication and
                    counselling roughly triple your odds of success — and combining medication with support does better
                    still. If you have tried before and it did not hold, that is a strong argument for getting help, not
                    against it. Talk to a doctor about what would suit you.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                        National Tobacco Quitline (India)
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[var(--primary)]">1800-11-2356</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Toll-free counselling and support</p>
                    </div>
                    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Ask your doctor about</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                        Nicotine patches, gum or lozenges, prescription options, and structured counselling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                These figures are estimates for awareness and motivation, not medical advice, diagnosis or treatment. The
                recovery timeline uses population averages from public-health guidance and the ~11-minutes-per-cigarette
                figure is a widely cited statistical estimate, not a promise about any one person. For advice about your
                own health, quitting plan or medication, please consult a doctor. Your data stays on this device.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
