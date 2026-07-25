"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandyButton,
  IconBubble,
  PatternStrip,
  SectionEyebrow,
  SectionTitle,
  StickerCard,
} from "./components/playful-ui";
import { cn } from "./utils/cn";

const speedMap = {
  slow: 1800,
  normal: 1100,
  fast: 650,
};

const activityTypes = ["order", "search", "coupon", "mystery"];
const cities = [
  "Tokyo",
  "Seoul",
  "Berlin",
  "New York",
  "Austin",
  "São Paulo",
  "Singapore",
  "London",
  "Barcelona",
  "Mexico City",
  "Bangkok",
  "Toronto",
  "Osaka",
  "Paris",
  "Sydney",
];
const foods = ["pizza", "ramen", "dumplings", "fried chicken", "sushi", "tacos", "waffles"];
const queries = [
  "breakup quotes",
  "late night snacks",
  "best date ideas",
  "how to apologize",
  "rainy playlist",
  "comfort movies",
  "study motivation",
  "gift ideas under $20",
  "things to do tonight",
  "viral outfits",
];
const coupons = [
  "10% off coupon",
  "free delivery coupon",
  "buy one get one coupon",
  "$5 surprise credit",
  "25% off coupon",
];
const boxRewards = [
  "mystery box",
  "gold mystery box",
  "night owl mystery box",
  "VIP mystery box",
  "spark mystery box",
];
const marqueeItems = [
  "live social proof",
  "search intent",
  "reward triggers",
  "coupon wins",
  "mystery unlocks",
  "city pulses",
  "real-time urgency",
  "behavior storytelling",
];
const spotlightDuration = 5000;

const activityMeta = {
  order: {
    label: "Order",
    eyebrow: "Fresh order",
    tone: "tertiary",
    fillClass: "bg-[var(--playful-yellow)]",
    ringClass: "border-[var(--playful-ink)]/20 bg-amber-50",
    Icon: PizzaIcon,
  },
  search: {
    label: "Search spike",
    eyebrow: "Intent pulse",
    tone: "accent",
    fillClass: "bg-[var(--playful-violet)]",
    ringClass: "border-[var(--playful-ink)]/20 bg-violet-50",
    Icon: SearchIcon,
  },
  coupon: {
    label: "Coupon win",
    eyebrow: "Reward event",
    tone: "quaternary",
    fillClass: "bg-[var(--playful-mint)]",
    ringClass: "border-[var(--playful-ink)]/20 bg-emerald-50",
    Icon: TicketIcon,
  },
  mystery: {
    label: "Mystery unlock",
    eyebrow: "Surprise drop",
    tone: "secondary",
    fillClass: "bg-[var(--playful-pink)]",
    ringClass: "border-[var(--playful-ink)]/20 bg-pink-50",
    Icon: GiftIcon,
  },
};

let seed = 100;

function nextId() {
  seed += 1;
  return seed;
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatAgo(timestamp, now) {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function createActivity(type) {
  const resolvedType = type ?? sample(activityTypes);
  const timestamp = Date.now();

  if (resolvedType === "order") {
    const location = sample(cities);
    const food = sample(foods);
    return {
      id: nextId(),
      type: "order",
      location,
      timestamp,
      detail: `Quick-send order pulse detected in ${location}`,
      message: `Someone in ${location} ordered ${food}`,
    };
  }

  if (resolvedType === "search") {
    const location = sample(cities);
    const query = sample(queries);
    const count = rand(18, 96);
    return {
      id: nextId(),
      type: "search",
      location,
      count,
      timestamp,
      detail: `Clustered search behavior is trending near ${location}`,
      message: `${count} people are searching ${query}`,
    };
  }

  if (resolvedType === "coupon") {
    const location = sample(cities);
    const coupon = sample(coupons);
    return {
      id: nextId(),
      type: "coupon",
      location,
      timestamp,
      detail: `Reward logic fired for an active session in ${location}`,
      message: `Someone in ${location} won a ${coupon}`,
    };
  }

  const location = sample(cities);
  const reward = sample(boxRewards);
  return {
    id: nextId(),
    type: "mystery",
    location,
    timestamp,
    detail: `Hidden drop mechanics opened a surprise in ${location}`,
    message: `Someone in ${location} unlocked a ${reward}`,
  };
}

function createInitialActivities() {
  const now = Date.now();
  return [
    {
      id: nextId(),
      type: "order",
      location: "Tokyo",
      timestamp: now - 4000,
      detail: "Quick-send order pulse detected in Tokyo",
      message: "Someone in Tokyo ordered pizza",
    },
    {
      id: nextId(),
      type: "search",
      location: "Global",
      count: 43,
      timestamp: now - 9000,
      detail: "Clustered search behavior is trending right now",
      message: "43 people are searching breakup quotes",
    },
    {
      id: nextId(),
      type: "coupon",
      location: "Austin",
      timestamp: now - 15000,
      detail: "Reward logic fired for an active session in Austin",
      message: "Someone in Austin won a free delivery coupon",
    },
    {
      id: nextId(),
      type: "mystery",
      location: "Osaka",
      timestamp: now - 21000,
      detail: "Hidden drop mechanics opened a surprise in Osaka",
      message: "Someone in Osaka unlocked a mystery box",
    },
    {
      id: nextId(),
      type: "order",
      location: "Seoul",
      timestamp: now - 29000,
      detail: "Quick-send order pulse detected in Seoul",
      message: "Someone in Seoul ordered ramen",
    },
    {
      id: nextId(),
      type: "search",
      location: "London",
      count: 27,
      timestamp: now - 36000,
      detail: "Clustered search behavior is trending near London",
      message: "27 people are searching late night snacks",
    },
  ];
}

function updateMetrics(activity, previous) {
  return {
    liveUsers: clamp(previous.liveUsers + rand(-9, 16), 980, 2600),
    ordersRouted: previous.ordersRouted + (activity.type === "order" ? 1 : 0),
    searchersTracked:
      previous.searchersTracked +
      (activity.type === "search" ? (activity.count ?? rand(10, 30)) : rand(0, 2)),
    couponWins: previous.couponWins + (activity.type === "coupon" ? 1 : 0),
    mysteryUnlocks: previous.mysteryUnlocks + (activity.type === "mystery" ? 1 : 0),
  };
}

function PauseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8 5v14M16 5v14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M8 6.5v11L18 12 8 6.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 14l1.1 2.4L8.5 17l-2.4 1.1L5 20.5l-1.1-2.4L1.5 17l2.4-1.1L5 14Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PizzaIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3.5 8.5c5.5-3 11.5-3 17 0L12 20.5 3.5 8.5ZM9 11h.01M13 9.75h.01M15.75 13h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="m21 21-4.35-4.35M10.75 18a7.25 7.25 0 1 1 0-14.5 7.25 7.25 0 0 1 0 14.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TicketIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 8.5A2.5 2.5 0 0 0 6.5 6H19v4a2.5 2.5 0 1 0 0 5v4H6.5A2.5 2.5 0 0 0 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function GiftIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 10h16v10H4V10ZM2.5 6.5h19v3.5h-19V6.5ZM12 6.5V20M9.25 6.5c-1.8 0-3.25-1.23-3.25-2.75S7.45 1 9.25 1C11.8 1 12 6.5 12 6.5M14.75 6.5C16.55 6.5 18 5.27 18 3.75S16.55 1 14.75 1C12.2 1 12 6.5 12 6.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PulseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 12h4l2.4-5 4.1 10 2.4-5H21"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PeopleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M16.5 20a4.5 4.5 0 0 0-9 0M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.5 19a3.5 3.5 0 0 0-2.6-3.38M17 11.5a3 3 0 1 0 0-6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricSticker({ label, value, tone, icon }) {
  return (
    <StickerCard tone={tone} className="h-full min-h-[128px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-800">
            {value}
          </p>
        </div>
        <IconBubble tone={tone} className="h-12 w-12">
          {icon}
        </IconBubble>
      </div>
    </StickerCard>
  );
}

function SpeedChoice({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("control-chip", active && "control-chip-active")}
    >
      {label}
    </button>
  );
}

function FeedRow({ activity, now }) {
  const meta = activityMeta[activity.type];
  const Icon = meta.Icon;

  return (
    <li className={cn("feed-row min-h-[152px] sm:min-h-[166px]", meta.ringClass)}>
      <div className="flex items-start gap-4">
        <IconBubble tone={meta.tone} className="h-12 w-12 shrink-0">
          <Icon className="h-5 w-5" />
        </IconBubble>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="feed-pill">{meta.label}</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {activity.location}
            </span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-800 sm:text-lg">{activity.message}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{activity.detail}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 sm:mt-0 sm:flex-col sm:items-end sm:justify-start">
        <span className="inline-flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          {formatAgo(activity.timestamp, now)}
        </span>
        <span>
          {new Date(activity.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </li>
  );
}

export default function App() {
  const [activities, setActivities] = useState(() => createInitialActivities());
  const [metrics, setMetrics] = useState({
    liveUsers: 1482,
    ordersRouted: 318,
    searchersTracked: 2640,
    couponWins: 74,
    mysteryUnlocks: 29,
  });
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState("normal");
  const [clock, setClock] = useState(Date.now());
  const [spotlightId, setSpotlightId] = useState(null);
  const [spotlightProgress, setSpotlightProgress] = useState(0);
  const activitiesRef = useRef(activities);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = window.setInterval(() => {
      const activity = createActivity();
      setActivities((current) => [activity, ...current].slice(0, 9));
      setMetrics((current) => updateMetrics(activity, current));
    }, speedMap[speed]);

    return () => window.clearInterval(timer);
  }, [isRunning, speed]);

  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);

  useEffect(() => {
    if (!activities.length) return;

    const spotlightStillExists = activities.some((activity) => activity.id === spotlightId);

    if (spotlightId === null || !spotlightStillExists) {
      setSpotlightId(activities[0].id);
      setSpotlightProgress(0);
    }
  }, [activities, spotlightId]);

  useEffect(() => {
    if (!spotlightId || !isRunning) return undefined;

    const startedAt = Date.now();
    setSpotlightProgress(0);

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setSpotlightProgress(Math.min(100, (elapsed / spotlightDuration) * 100));
    }, 80);

    const rotationTimer = window.setTimeout(() => {
      const currentActivities = activitiesRef.current;
      if (!currentActivities.length) return;

      const currentIndex = currentActivities.findIndex((activity) => activity.id === spotlightId);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextActivity = currentActivities[(safeIndex + 1) % currentActivities.length];
      setSpotlightId(nextActivity.id);
    }, spotlightDuration);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(rotationTimer);
    };
  }, [spotlightId, isRunning]);

  const spotlightActivity =
    activities.find((activity) => activity.id === spotlightId) ?? activities[0] ?? createActivity();
  const spotlightMeta = activityMeta[spotlightActivity.type];
  const SpotlightIcon = spotlightMeta.Icon;

  const locationIntensity = useMemo(() => {
    const weighted = new Map();

    activities.forEach((activity, index) => {
      const current = weighted.get(activity.location) ?? 0;
      weighted.set(activity.location, current + Math.max(1, 8 - index));
    });

    return [...weighted.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [activities]);

  const activityMix = useMemo(
    () => ({
      order: activities.filter((activity) => activity.type === "order").length,
      search: activities.filter((activity) => activity.type === "search").length,
      coupon: activities.filter((activity) => activity.type === "coupon").length,
      mystery: activities.filter((activity) => activity.type === "mystery").length,
    }),
    [activities],
  );

  const mixRows = [
    { key: "order", value: activityMix.order },
    { key: "search", value: activityMix.search },
    { key: "coupon", value: activityMix.coupon },
    { key: "mystery", value: activityMix.mystery },
  ];

  const injectActivity = (type) => {
    const activity = createActivity(type);
    setActivities((current) => [activity, ...current].slice(0, 9));
    setMetrics((current) => updateMetrics(activity, current));
  };

  const totalSignals =
    metrics.ordersRouted + metrics.searchersTracked + metrics.couponWins + metrics.mysteryUnlocks;
  const spotlightSecondsLeft = isRunning
    ? Math.max(1, Math.ceil(((100 - spotlightProgress) / 100) * (spotlightDuration / 1000)))
    : null;
  const recentLocations = [...new Set(activities.map((activity) => activity.location))].slice(0, 6);
  const queueFillPercent = (activities.length / 9) * 100;

  return (
    <div className="live-activity-root relative min-h-screen overflow-x-clip bg-[var(--playful-paper)] text-slate-800">
      <div className="pointer-events-none absolute inset-0 paper-dots opacity-70" />
      <div className="shape-confetti shape-confetti-a" />
      <div className="shape-confetti shape-confetti-b" />
      <div className="shape-confetti shape-confetti-c" />
      <div className="shape-confetti shape-confetti-d hidden lg:block" />

      <header className="sticky top-0 z-50 border-b-2 border-slate-800 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-800 bg-[var(--playful-violet)] shadow-[3px_3px_0_0_#1E293B]">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-heading text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl">
                People Are Doing This
              </span>
              <span className="ml-2 hidden font-heading text-lg font-extrabold tracking-tight text-[var(--playful-pink)] sm:inline">
                Right Now
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500 sm:inline-flex">
              <span className={cn("h-2 w-2 rounded-full", isRunning ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
              {isRunning ? `${speed} · live` : "paused"}
            </div>

            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              className="control-chip"
            >
              {isRunning ? "Pause" : "Resume"}
            </button>

            <button
              type="button"
              onClick={() => injectActivity()}
              className="control-chip control-chip-active"
            >
              Inject
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="relative isolate">
            <div className="hero-sun hidden sm:block" />
            <SectionEyebrow>Live activity simulation engine</SectionEyebrow>
            <h2 className="relative mt-5 max-w-3xl font-heading text-5xl font-extrabold tracking-[-0.04em] text-slate-800 sm:text-6xl lg:text-7xl">
              People Are Doing This{" "}
              <span className="squiggle-underline text-[var(--playful-violet)]">Right Now</span>
            </h2>
            <p className="relative mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              A playful live-feed interface that turns behavior into bright, sticky, animated
              proof: pizza orders, breakup quote searches, coupon wins, and mystery box unlocks.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <CandyButton
                onClick={() => setIsRunning((current) => !current)}
                icon={
                  isRunning ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />
                }
              >
                {isRunning ? "Pause feed" : "Resume feed"}
              </CandyButton>
              <CandyButton
                variant="secondary"
                onClick={() => injectActivity()}
                icon={<SparklesIcon className="h-4 w-4" />}
              >
                Inject signal
              </CandyButton>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MetricSticker
                label="Live users"
                value={metrics.liveUsers.toLocaleString()}
                tone="accent"
                icon={<PeopleIcon className="h-5 w-5" />}
              />
              <MetricSticker
                label="Signals today"
                value={totalSignals.toLocaleString()}
                tone="tertiary"
                icon={<PulseIcon className="h-5 w-5" />}
              />
              <MetricSticker
                label="Engine mode"
                value={isRunning ? "Running" : "Paused"}
                tone="secondary"
                icon={
                  isRunning ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />
                }
              />
            </div>
          </div>

          <div className="relative">
            <div className="panel-blob dot-panel relative min-h-[430px] overflow-hidden p-5 sm:min-h-[500px] sm:p-7">
              <div className="absolute -right-4 top-6 h-16 w-16 rounded-full border-2 border-slate-800 bg-[var(--playful-yellow)]" />
              <div className="absolute -left-2 bottom-8 h-10 w-10 rotate-12 rounded-[10px] border-2 border-slate-800 bg-[var(--playful-mint)]" />
              <div className="absolute right-12 top-24 h-0 w-0 border-l-[14px] border-r-[14px] border-b-[22px] border-l-transparent border-r-transparent border-b-[var(--playful-pink)]" />

              <StickerCard
                tone={spotlightMeta.tone}
                className="relative z-10 flex h-[430px] flex-col overflow-hidden p-6 sm:h-[490px] sm:p-8"
              >
                <div className="inline-flex items-center gap-3 self-start rounded-full border-2 border-slate-800 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500 shadow-[3px_3px_0_0_#1E293B]">
                  <IconBubble tone={spotlightMeta.tone} className="h-9 w-9">
                    <SpotlightIcon className="h-4 w-4" />
                  </IconBubble>
                  Current spotlight
                </div>

                <div className="mt-6 flex-1 overflow-hidden">
                  <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-slate-500">
                    {spotlightMeta.eyebrow}
                  </p>
                  <h2 className="mt-3 line-clamp-3 font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-800 sm:text-4xl">
                    {spotlightActivity.message}
                  </h2>
                  <p className="mt-3 line-clamp-2 text-base leading-7 text-slate-500 sm:text-lg">
                    {spotlightActivity.detail}
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-2">
                      <PinIcon className="h-4 w-4" />
                      {spotlightActivity.location}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-2">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(spotlightActivity.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="rounded-[22px] border-2 border-slate-800 bg-white p-3 shadow-[4px_4px_0_0_#1E293B]">
                    <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                      <span>Next in</span>
                      <span>
                        {isRunning
                          ? `${Math.ceil(((100 - spotlightProgress) / 100) * (spotlightDuration / 1000))}s`
                          : "paused"}
                      </span>
                    </div>
                    <div className="h-4 overflow-hidden rounded-full border-2 border-slate-800 bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--playful-violet),var(--playful-pink),var(--playful-yellow))] transition-[width] duration-75 ease-linear"
                        style={{ width: `${spotlightProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </StickerCard>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <PatternStrip items={marqueeItems} />
        </div>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <StickerCard
            tone="white"
            className="p-6 sm:p-7"
            floatingIcon={
              <IconBubble tone="accent" className="h-14 w-14">
                <PulseIcon className="h-6 w-6" />
              </IconBubble>
            }
            eyebrow="Live event stream"
            title="Rolling queue of what people are doing"
            description="Readable content lives in clean cards, while the playful decoration around it keeps the experience lively and memorable."
          >
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-800 bg-[var(--playful-yellow)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-800 shadow-[3px_3px_0_0_#1E293B]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Refreshing every {speedMap[speed]}ms
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 bg-slate-50 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
                9 signal slots · always on-stage
              </div>
            </div>

            <ol className="mt-6 space-y-4">
              {activities.map((activity) => (
                <FeedRow key={activity.id} activity={activity} now={clock} />
              ))}
            </ol>
          </StickerCard>

          <div className="space-y-6">
            <StickerCard tone="accent" className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                    Engine controls
                  </p>
                  <h3 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-800">
                    Tune the pace
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Keep it chill, normal, or hyperactive depending on how dramatic you want the
                    simulation to feel.
                  </p>
                </div>
                <IconBubble tone="accent">
                  <SparklesIcon className="h-5 w-5" />
                </IconBubble>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {["slow", "normal", "fast"].map((option) => (
                  <SpeedChoice
                    key={option}
                    label={option}
                    active={speed === option}
                    onClick={() => setSpeed(option)}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <CandyButton
                  variant="tertiary"
                  onClick={() => injectActivity("search")}
                  icon={<SearchIcon className="h-4 w-4" />}
                >
                  Trigger search spike
                </CandyButton>
                <CandyButton
                  variant="ghost"
                  onClick={() => injectActivity("coupon")}
                  icon={<TicketIcon className="h-4 w-4" />}
                >
                  Fire coupon win
                </CandyButton>
                <CandyButton
                  variant="secondary"
                  onClick={() => injectActivity("mystery")}
                  icon={<GiftIcon className="h-4 w-4" />}
                  className="sm:col-span-2"
                >
                  Open mystery box now
                </CandyButton>
              </div>
            </StickerCard>

            <StickerCard tone="quaternary" className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                    Hot locations
                  </p>
                  <h3 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-800">
                    City pulse board
                  </h3>
                </div>
                <IconBubble tone="quaternary">
                  <PinIcon className="h-5 w-5" />
                </IconBubble>
              </div>

              <div className="mt-5 space-y-4">
                {locationIntensity.map(([location, score], index) => (
                  <div key={location} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                      <span>
                        {index + 1}. {location}
                      </span>
                      <span>{score} pts</span>
                    </div>
                    <div className="mix-rail">
                      <div
                        className="mix-fill bg-[linear-gradient(90deg,var(--playful-violet),var(--playful-pink),var(--playful-yellow))]"
                        style={{ width: `${Math.min(100, 18 + score * 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </StickerCard>

            <StickerCard tone="secondary" className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                    Activity mix
                  </p>
                  <h3 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-800">
                    Queue balance
                  </h3>
                </div>
                <IconBubble tone="secondary">
                  <PulseIcon className="h-5 w-5" />
                </IconBubble>
              </div>

              <div className="mt-5 space-y-4">
                {mixRows.map((row) => {
                  const meta = activityMeta[row.key];
                  const width = `${(row.value / Math.max(activities.length, 1)) * 100}%`;
                  const Icon = meta.Icon;
                  return (
                    <div key={row.key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {meta.label}
                        </span>
                        <span>{row.value}</span>
                      </div>
                      <div className="mix-rail">
                        <div className={cn("mix-fill", meta.fillClass)} style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </StickerCard>

            <StickerCard tone="white" className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                    Live engine status
                  </p>
                  <h3 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-800">
                    Pulse monitor
                  </h3>
                </div>
                <IconBubble tone="accent">
                  <PlayIcon className="h-5 w-5" />
                </IconBubble>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
                    Feed state
                  </p>
                  <p className="mt-2 font-heading text-2xl font-extrabold text-slate-800">
                    {isRunning ? "Live" : "Paused"}
                  </p>
                </div>
                <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
                    Spotlight
                  </p>
                  <p className="mt-2 font-heading text-2xl font-extrabold text-slate-800">
                    {isRunning ? `${spotlightSecondsLeft}s` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>Queue fill</span>
                    <span>{activities.length}/9</span>
                  </div>
                  <div className="mix-rail">
                    <div
                      className="mix-fill bg-[linear-gradient(90deg,var(--playful-violet),var(--playful-pink),var(--playful-yellow))]"
                      style={{ width: `${queueFillPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>Current cadence</span>
                    <span>{speedMap[speed]}ms</span>
                  </div>
                  <div className="mix-rail">
                    <div
                      className="mix-fill bg-[var(--playful-mint)]"
                      style={{ width: speed === "slow" ? "38%" : speed === "normal" ? "66%" : "100%" }}
                    />
                  </div>
                </div>
              </div>
            </StickerCard>

            <StickerCard tone="tertiary" className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                    Recent locations
                  </p>
                  <h3 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-slate-800">
                    Signal map
                  </h3>
                </div>
                <IconBubble tone="tertiary">
                  <PinIcon className="h-5 w-5" />
                </IconBubble>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {recentLocations.map((location, index) => (
                  <span
                    key={location}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-sm font-bold shadow-[3px_3px_0_0_#1E293B]",
                      index % 3 === 0 && "border-slate-800 bg-white text-slate-700",
                      index % 3 === 1 && "border-slate-800 bg-[var(--playful-pink)] text-slate-800",
                      index % 3 === 2 && "border-slate-800 bg-[var(--playful-mint)] text-slate-800",
                    )}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-800" />
                    {location}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border-2 border-slate-800 bg-white p-4 shadow-[4px_4px_0_0_#1E293B]">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">
                  Spotlight city
                </p>
                <p className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-slate-800">
                  {spotlightActivity.location}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  The featured event is currently highlighting behavior coming from this location.
                </p>
              </div>
            </StickerCard>
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-8">
            <SectionEyebrow>Simulation breakdown</SectionEyebrow>
            <SectionTitle
              title="Every signal counts"
              description="Orders, searches, coupons, and mystery unlocks — each category tracked live as the engine runs."
              className="mt-4"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {(["order", "search", "coupon", "mystery"]).map((type) => {
              const meta = activityMeta[type];
              const Icon = meta.Icon;
              const value =
                type === "order"
                  ? metrics.ordersRouted
                  : type === "search"
                    ? metrics.searchersTracked
                    : type === "coupon"
                      ? metrics.couponWins
                      : metrics.mysteryUnlocks;

              const pct = totalSignals > 0 ? (value / totalSignals) * 100 : 0;

              return (
                <StickerCard key={type} tone={meta.tone} className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <IconBubble tone={meta.tone}>
                      <Icon className="h-5 w-5" />
                    </IconBubble>
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-500">
                      {meta.label}
                    </p>
                  </div>
                  <p className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-slate-800">
                    {value.toLocaleString()}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="mix-rail flex-1">
                      <div
                        className={cn("mix-fill", meta.fillClass)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-400">
                      {Math.round(pct)}%
                    </span>
                  </div>
                </StickerCard>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
