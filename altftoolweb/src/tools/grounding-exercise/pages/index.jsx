"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Brain,
  Check,
  ChevronRight,
  Citrus,
  Copy,
  Ear,
  Eye,
  Footprints,
  Frown,
  Hand,
  HandHeart,
  LifeBuoy,
  Meh,
  Phone,
  RotateCcw,
  Smile,
  Sparkles,
  Wind,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const LOG_KEY = "altf:grounding-exercise:log";

const techniques = [
  { id: "54321", label: "5-4-3-2-1", icon: Anchor, blurb: "The classic sensory reset" },
  { id: "physical", label: "Physical", icon: Footprints, blurb: "Back into your body" },
  { id: "cognitive", label: "Cognitive", icon: Brain, blurb: "Give the mind a job" },
  { id: "soothe", label: "Self-soothing", icon: HandHeart, blurb: "Kindness, not effort" },
];

const techniqueNames = {
  "54321": "5-4-3-2-1 sensory",
  physical: "Physical grounding",
  cognitive: "Cognitive grounding",
  soothe: "Self-soothing",
};

const senses = [
  {
    id: "see",
    count: 5,
    icon: Eye,
    short: "See",
    title: "5 things you can see",
    prompt:
      "Look around slowly. Name five things you can see — the duller the better. A door handle. A crack in the paint. The colour of your sleeve.",
    hints: ["a lamp", "my hands", "the window", "a chair leg", "a shadow"],
  },
  {
    id: "touch",
    count: 4,
    icon: Hand,
    short: "Feel",
    title: "4 things you can feel",
    prompt:
      "Notice what is already touching you — the chair holding your weight, the floor under your feet, fabric on your skin, air on your face.",
    hints: ["the chair", "my feet on the floor", "my shirt collar", "cool air"],
  },
  {
    id: "hear",
    count: 3,
    icon: Ear,
    short: "Hear",
    title: "3 things you can hear",
    prompt: "Let the sounds come to you. A fan. Traffic. Your own breathing. You don’t have to hunt for them.",
    hints: ["a fan", "traffic outside", "my breathing"],
  },
  {
    id: "smell",
    count: 2,
    icon: Wind,
    short: "Smell",
    title: "2 things you can smell",
    prompt: "If nothing comes, that’s completely fine — name two smells you like instead. Coffee. Rain on hot dust.",
    hints: ["coffee", "soap on my hands"],
  },
  {
    id: "taste",
    count: 1,
    icon: Citrus,
    short: "Taste",
    title: "1 thing you can taste",
    prompt: "Tea, toothpaste, or simply the taste of your own mouth. Or name one taste you’re glad exists.",
    hints: ["chai"],
  },
];

const beforeScale = [
  { value: 1, label: "Calm" },
  { value: 2, label: "A bit tense" },
  { value: 3, label: "Anxious" },
  { value: 4, label: "Very anxious" },
  { value: 5, label: "Overwhelmed" },
];

const physicalSteps = [
  "Run cold water over the inside of your wrists for 30 seconds. Notice the temperature change.",
  "Press both feet flat into the floor. Let the ground take your weight for a moment.",
  "Hold something cold — a bottle, a glass, an ice cube — and describe it to yourself.",
  "Push your palms together hard for 10 seconds, then let go and feel the release.",
  "Stretch your arms overhead, then let them drop heavily.",
];

const soothingSteps = [
  "Place one hand on your heart and one on your belly. Feel your belly rise under your hand.",
  "Wrap your arms around yourself and give a slow squeeze, the way you’d hold a friend.",
  "Say to yourself, out loud if you can: this is a hard moment. Hard moments pass.",
];

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const emptySlots = () =>
  senses.reduce((acc, sense) => {
    acc[sense.id] = Array.from({ length: sense.count }, () => ({ text: "", done: false }));
    return acc;
  }, {});

const emptyList = (n) => Array.from({ length: n }, () => "");

function SupportCard({ highlight = false }) {
  return (
    <section
      className={`rounded-lg border bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] ${
        highlight ? "border-[var(--primary)]" : "border-[var(--border)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
          <LifeBuoy className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">If this keeps coming back</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Grounding helps you get through a moment. It isn’t treatment, and it isn’t meant to be. If anxiety or panic
            shows up often, or it’s shaping how you live, that’s worth talking about with a doctor or a mental-health
            professional. Needing help with it is ordinary — a lot of people do.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { name: "Tele-MANAS", number: "14416", note: "Govt. of India, 24x7, free" },
              { name: "Vandrevala Foundation", number: "9999666555", note: "24x7 counselling" },
              { name: "AASRA", number: "9820466726", note: "24x7 crisis support" },
            ].map((line) => (
              <div key={line.name} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  <Phone className="h-3.5 w-3.5" />
                  {line.name}
                </p>
                <a
                  href={`tel:${line.number}`}
                  className="mt-1 block text-lg font-semibold text-[var(--primary)] underline decoration-transparent hover:decoration-current focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] rounded-sm"
                >
                  {line.number}
                </a>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{line.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            If you’re in immediate danger or thinking about harming yourself, please contact emergency services (112 in
            India) or get to the nearest hospital. You don’t have to sort it out alone first.
          </p>
        </div>
      </div>
    </section>
  );
}

function Disclaimer() {
  return (
    <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
      <p className="text-sm leading-6 text-[var(--muted-foreground)]">
        This exercise is offered for awareness and self-help, not medical advice, diagnosis, or treatment. Grounding
        techniques are widely used but they are not a substitute for professional care — please consult a doctor or a
        qualified mental-health professional about anything that concerns you. Everything you type here stays on your
        device.
      </p>
    </section>
  );
}

function ProgressDots({ total, filled }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-2.5 w-2.5 rounded-full transition ${
            index < filled ? "bg-[var(--primary)]" : "border border-[var(--border)] bg-[var(--background)]"
          }`}
        />
      ))}
    </div>
  );
}

function BreathCue({ reduceMotion, cycleSeconds = { in: 4, out: 6 } }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - start), 100);
    return () => clearInterval(id);
  }, []);

  const inMs = cycleSeconds.in * 1000;
  const outMs = cycleSeconds.out * 1000;
  const cycleMs = inMs + outMs;
  const within = elapsed % cycleMs;
  const inhaling = within < inMs;
  const cycles = Math.floor(elapsed / cycleMs);
  const countdown = inhaling
    ? Math.ceil((inMs - within) / 1000)
    : Math.ceil((cycleMs - within) / 1000);
  const scale = reduceMotion
    ? 0.86
    : inhaling
      ? 0.6 + 0.4 * (within / inMs)
      : 1 - 0.4 * ((within - inMs) / outMs);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <span className="absolute h-44 w-44 rounded-full border border-[var(--border)]" />
        <span
          className="absolute rounded-full bg-[var(--primary)] opacity-15"
          style={{ height: "11rem", width: "11rem", transform: `scale(${scale})`, transition: "transform 120ms linear" }}
        />
        <span
          className="absolute rounded-full border-2 border-[var(--primary)]"
          style={{ height: "11rem", width: "11rem", transform: `scale(${scale})`, transition: "transform 120ms linear" }}
        />
        <div className="relative text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
            {inhaling ? "Breathe in" : "Breathe out"}
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{countdown}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]" aria-live="polite">
        {inhaling ? "In through your nose, 4 counts" : "Out through your mouth, 6 counts — slower than the in-breath"}
      </p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        {cycles === 0 ? "Two rounds is plenty. There’s no rush." : `${cycles} round${cycles === 1 ? "" : "s"} done`}
      </p>
      {reduceMotion && (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">Motion reduced — follow the count instead.</p>
      )}
    </div>
  );
}

function FeelingCheck({ value, onSelect }) {
  const options = [
    { id: "better", label: "A bit better", icon: Smile },
    { id: "same", label: "About the same", icon: Meh },
    { id: "worse", label: "Worse", icon: Frown },
  ];

  return (
    <div>
      <p className="text-sm font-semibold">How do you feel now?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              aria-pressed={active}
              className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-semibold transition ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
        Any answer is a fine answer. This is only for your own log, and it never leaves this device.
      </p>
    </div>
  );
}

function SlotRow({ slot, index, sense, noTyping, onText, onTap }) {
  const inputId = `${sense.id}-slot-${index}`;
  // "Filled" reflects entries from either mode, so toggling typing/tapping mid-exercise
  // never hides items already entered under the other mode.
  const filled = slot.done || slot.text.trim().length > 0;

  if (noTyping) {
    return (
      <button
        type="button"
        onClick={() => onTap(index)}
        aria-pressed={slot.done}
        className={`flex h-12 w-full items-center gap-3 rounded-md border px-3 text-left text-sm font-semibold transition ${
          filled
            ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
        }`}
      >
        <span
          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
            filled ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)]"
          }`}
        >
          {filled ? <Check className="h-3.5 w-3.5" /> : <span className="text-xs">{index + 1}</span>}
        </span>
        {filled ? "Found it" : "Tap when you’ve found one"}
      </button>
    );
  }

  return (
    <label className="block" htmlFor={inputId}>
      <span className="sr-only">
        {sense.title} — item {index + 1}
      </span>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border text-xs ${
            filled
              ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "border-[var(--border)] text-[var(--muted-foreground)]"
          }`}
        >
          {filled ? <Check className="h-3.5 w-3.5" /> : index + 1}
        </span>
        <input
          id={inputId}
          type="text"
          value={slot.text}
          onChange={(event) => onText(index, event.target.value)}
          placeholder={sense.hints[index] || "…"}
          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] pl-12 pr-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
      </div>
    </label>
  );
}

export default function ToolHome() {
  const [technique, setTechnique] = useState("54321");
  const [phase, setPhase] = useState("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [slots, setSlots] = useState(emptySlots);
  const [noTyping, setNoTyping] = useState(false);
  const [skipBreaths, setSkipBreaths] = useState(false);
  const [before, setBefore] = useState(null);
  const [after, setAfter] = useState(null);
  const [log, setLog] = useState([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [copied, setCopied] = useState(false);

  const [physicalDone, setPhysicalDone] = useState(() => physicalSteps.map(() => false));
  const [colours, setColours] = useState(() => emptyList(5));
  const [physicalAfter, setPhysicalAfter] = useState(null);

  const [countdownValue, setCountdownValue] = useState(100);
  const [countdownGuess, setCountdownGuess] = useState("");
  const [countdownNudge, setCountdownNudge] = useState("");
  const [dateSaid, setDateSaid] = useState(false);
  const [cognitiveAfter, setCognitiveAfter] = useState(null);

  const [sootheDone, setSootheDone] = useState(() => soothingSteps.map(() => false));
  const [grateful, setGrateful] = useState(() => emptyList(3));
  const [sootheAfter, setSootheAfter] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLog(parsed);
      }
    } catch {
      setLog([]);
    }
    try {
      setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
      setReduceMotion(false);
    }
  }, []);

  const persist = useCallback((next) => {
    // Cap once and reuse the same capped array for both state and storage, so in-memory
    // stats/log never disagree with what a reload actually recovers.
    const capped = next.slice(-200);
    setLog(capped);
    try {
      window.localStorage.setItem(LOG_KEY, JSON.stringify(capped));
    } catch {
      /* storage unavailable — the session still works, it just won’t be remembered */
    }
  }, []);

  const addEntry = useCallback(
    (id, feeling) => {
      const now = new Date();
      const entry = {
        at: now.toISOString(),
        day: dayKey(now),
        technique: id,
        before: id === "54321" ? before : null,
        after: feeling,
      };
      // Every completed round gets its own log entry — no dedup window, so repeated
      // practice of the same technique is counted rather than silently overwritten.
      persist([...log, entry]);
    },
    [before, log, persist]
  );

  const stats = useMemo(() => {
    const days = new Set(log.map((entry) => entry.day));
    const cursor = new Date();
    if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (days.has(dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { total: log.length, days: days.size, streak };
  }, [log]);

  const currentSense = senses[stepIndex];
  const filledCount = currentSense
    ? slots[currentSense.id].filter((slot) => slot.done || slot.text.trim().length > 0).length
    : 0;

  const setSlotText = (index, text) => {
    setSlots((prev) => ({
      ...prev,
      [currentSense.id]: prev[currentSense.id].map((slot, i) => (i === index ? { ...slot, text } : slot)),
    }));
  };

  const toggleSlot = (index) => {
    setSlots((prev) => ({
      ...prev,
      [currentSense.id]: prev[currentSense.id].map((slot, i) => (i === index ? { ...slot, done: !slot.done } : slot)),
    }));
  };

  const restart = () => {
    setPhase("intro");
    setStepIndex(0);
    setSlots(emptySlots());
    setBefore(null);
    setAfter(null);
    setCopied(false);
  };

  const goNext = () => {
    if (stepIndex >= senses.length - 1) {
      setPhase("done");
      return;
    }
    if (skipBreaths) {
      setStepIndex((value) => value + 1);
      setPhase("step");
      return;
    }
    setPhase("breath");
  };

  const summary = useMemo(() => {
    const lines = ["5-4-3-2-1 grounding — my session", ""];
    senses.forEach((sense) => {
      const items = slots[sense.id]
        .map((slot, index) => slot.text.trim() || (slot.done ? `found #${index + 1}` : ""))
        .filter(Boolean);
      if (items.length) lines.push(`${sense.title}: ${items.join(", ")}`);
    });
    lines.push("");
    if (before) lines.push(`Before: ${beforeScale.find((item) => item.value === before)?.label}`);
    if (after) lines.push(`After: ${after}`);
    lines.push(`Finished: ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [after, before, slots]);

  const copySummary = async () => {
    const ok = await safeCopyText(summary);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const checkCountdown = () => {
    const guess = Number(countdownGuess);
    if (!countdownGuess.trim() || Number.isNaN(guess)) return;
    if (guess === countdownValue - 7) {
      setCountdownValue(guess);
      setCountdownGuess("");
      setCountdownNudge("");
      return;
    }
    setCountdownNudge("Not quite — and that’s genuinely fine, the arithmetic is the point, not the answer. Try again.");
  };

  const revealCountdown = () => {
    setCountdownValue((value) => value - 7);
    setCountdownGuess("");
    setCountdownNudge("");
  };

  const todayLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }, []);

  const showWorseSupport =
    after === "worse" || physicalAfter === "worse" || cognitiveAfter === "worse" || sootheAfter === "worse";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Anchor className="h-4 w-4" />
            Take a moment
          </div>
          <h1 className="text-4xl font-semibold leading-tight">5-4-3-2-1 Grounding Exercise</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            When your head is racing, your senses are still in the room. This walks you through the 5-4-3-2-1 technique
            one sense at a time, with a slow breath between each — and three other techniques for when this one doesn’t
            fit. Nothing you type is sent anywhere.
          </p>
        </section>

        <section className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {techniques.map((item) => {
            const Icon = item.icon;
            const active = technique === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTechnique(item.id)}
                aria-pressed={active}
                className={`rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-[var(--primary)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                    active ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] text-[var(--primary)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-semibold">{item.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{item.blurb}</p>
              </button>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_340px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            {technique === "54321" && (
              <>
                {phase !== "intro" && (
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    {senses.map((sense, index) => {
                      const Icon = sense.icon;
                      const done = index < stepIndex || phase === "done";
                      const active = index === stepIndex && phase !== "done";
                      return (
                        <div
                          key={sense.id}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            active
                              ? "border-[var(--primary)] text-[var(--primary)]"
                              : done
                                ? "border-[var(--border)] text-[var(--muted-foreground)]"
                                : "border-[var(--border)] text-[var(--muted-foreground)] opacity-55"
                          }`}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                          {sense.short}
                        </div>
                      );
                    })}
                  </div>
                )}

                {phase === "intro" && (
                  <div>
                    <h2 className="text-2xl font-semibold">Before we start</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                      You don’t have to do this perfectly, and you don’t have to fill every box. The point is to spend a
                      couple of minutes noticing the room instead of the thought. Go at whatever pace you like.
                    </p>

                    <div className="mt-6">
                      <p className="text-sm font-semibold">How are you feeling right now? (optional)</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-5">
                        {beforeScale.map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setBefore(before === item.value ? null : item.value)}
                            aria-pressed={before === item.value}
                            className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
                              before === item.value
                                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                                : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setNoTyping((value) => !value)}
                        aria-pressed={noTyping}
                        className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-left text-sm font-semibold transition hover:border-[var(--primary)]"
                      >
                        <span>
                          No-typing mode
                          <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                            Just tap “found it” for each one
                          </span>
                        </span>
                        <span
                          className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${
                            noTyping ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                          }`}
                        >
                          <span
                            className="block h-4 w-4 rounded-full bg-[var(--card)] transition"
                            style={{ transform: noTyping ? "translateX(16px)" : "translateX(0)" }}
                          />
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSkipBreaths((value) => !value)}
                        aria-pressed={skipBreaths}
                        className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-left text-sm font-semibold transition hover:border-[var(--primary)]"
                      >
                        <span>
                          Skip the breathing pauses
                          <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                            Go straight from sense to sense
                          </span>
                        </span>
                        <span
                          className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${
                            skipBreaths ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                          }`}
                        >
                          <span
                            className="block h-4 w-4 rounded-full bg-[var(--card)] transition"
                            style={{ transform: skipBreaths ? "translateX(16px)" : "translateX(0)" }}
                          />
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPhase("step")}
                      className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-[var(--primary)] px-6 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                    >
                      Start with 5 things you can see
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {phase === "step" && currentSense && (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
                          <currentSense.icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="text-2xl font-semibold">{currentSense.title}</h2>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                            {currentSense.prompt}
                          </p>
                        </div>
                      </div>
                      <ProgressDots total={currentSense.count} filled={filledCount} />
                    </div>

                    <div className="mt-6 grid gap-3">
                      {slots[currentSense.id].map((slot, index) => (
                        <SlotRow
                          key={`${currentSense.id}-${index}`}
                          slot={slot}
                          index={index}
                          sense={currentSense}
                          noTyping={noTyping}
                          onText={setSlotText}
                          onTap={toggleSlot}
                        />
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={goNext}
                        className="inline-flex h-12 items-center gap-2 rounded-md bg-[var(--primary)] px-6 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                      >
                        {stepIndex >= senses.length - 1 ? "Finish" : "Next sense"}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      {stepIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
                          className="btn-secondary min-h-12 px-4"
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNoTyping((value) => !value)}
                        className="text-xs font-semibold text-[var(--primary)]"
                      >
                        {noTyping ? "Switch to typing" : "Switch to tapping"}
                      </button>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                      Blanks are allowed. Move on whenever you like — half of this exercise is just the looking.
                    </p>
                  </div>
                )}

                {phase === "breath" && (
                  <div className="py-4">
                    <h2 className="text-center text-2xl font-semibold">One slow breath</h2>
                    <p className="mx-auto mt-2 max-w-md text-center text-sm leading-6 text-[var(--muted-foreground)]">
                      A longer out-breath than in-breath is the part that settles your nervous system. Follow the circle
                      for a round or two, then carry on.
                    </p>
                    <div className="mt-6">
                      <BreathCue reduceMotion={reduceMotion} />
                    </div>
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setStepIndex((value) => value + 1);
                          setPhase("step");
                        }}
                        className="inline-flex h-12 items-center gap-2 rounded-md bg-[var(--primary)] px-6 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
                      >
                        Continue to {senses[Math.min(stepIndex + 1, senses.length - 1)].short.toLowerCase()}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {phase === "done" && (
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--primary)]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <h2 className="mt-4 text-2xl font-semibold">You’re here. You’re safe.</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                      You just named the room around you, one sense at a time. Whatever your mind was doing a few minutes
                      ago, you’re in this room, in this moment, and this moment is okay. Take one more slow breath before
                      you go back to your day.
                    </p>

                    {senses.some((sense) =>
                      slots[sense.id].some((slot) => slot.done || slot.text.trim().length > 0)
                    ) && (
                      <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--muted)] p-4">
                        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">What you noticed</p>
                        <div className="mt-3 grid gap-2">
                          {senses.map((sense) => {
                            const items = slots[sense.id]
                              .map((slot, index) => slot.text.trim() || (slot.done ? `#${index + 1}` : ""))
                              .filter(Boolean);
                            if (!items.length) return null;
                            const Icon = sense.icon;
                            return (
                              <div key={sense.id} className="flex items-start gap-2 text-sm">
                                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                                <span className="text-[var(--muted-foreground)]">{items.join(" · ")}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <FeelingCheck
                        value={after}
                        onSelect={(value) => {
                          setAfter(value);
                          addEntry("54321", value);
                        }}
                      />
                    </div>

                    {after === "worse" && (
                      <div className="mt-4 rounded-md border border-[var(--primary)] bg-[var(--muted)] p-4">
                        <p className="text-sm font-semibold">That’s okay, and it doesn’t mean you did it wrong.</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                          Some moments are bigger than a two-minute technique, and grounding doesn’t land every time. Try
                          the physical or self-soothing tab if you want something different — and please have a look at
                          the support numbers below. Talking to someone is a reasonable next step, not an overreaction.
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button type="button" onClick={restart} className="btn-secondary min-h-10 px-4 py-2 text-sm">
                        <RotateCcw className="h-4 w-4" />
                        Go again
                      </button>
                      <button type="button" onClick={copySummary} className="btn-secondary min-h-10 px-4 py-2 text-sm">
                        <Copy className="h-4 w-4" />
                        {copied ? "Copied" : "Copy what I noticed"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {technique === "physical" && (
              <div>
                <h2 className="text-2xl font-semibold">Physical grounding</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                  When your thoughts won’t co-operate, go around them. Cold and pressure give your body something
                  undeniable to report back on. Do as many as you want.
                </p>

                <div className="mt-6 grid gap-2">
                  {physicalSteps.map((step, index) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() =>
                        setPhysicalDone((prev) => prev.map((value, i) => (i === index ? !value : value)))
                      }
                      aria-pressed={physicalDone[index]}
                      className={`flex items-start gap-3 rounded-md border p-4 text-left text-sm leading-6 transition ${
                        physicalDone[index]
                          ? "border-[var(--primary)] bg-[var(--muted)]"
                          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          physicalDone[index]
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)]"
                        }`}
                      >
                        {physicalDone[index] && <Check className="h-3 w-3" />}
                      </span>
                      <span className={physicalDone[index] ? "" : "text-[var(--muted-foreground)]"}>{step}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Name 5 colours you can see in this room</p>
                    <ProgressDots total={5} filled={colours.filter((c) => c.trim()).length} />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    {colours.map((colour, index) => (
                      <label key={index} className="block">
                        <span className="sr-only">Colour {index + 1}</span>
                        <input
                          type="text"
                          value={colour}
                          onChange={(event) =>
                            setColours((prev) => prev.map((c, i) => (i === index ? event.target.value : c)))
                          }
                          placeholder={["blue", "grey", "brown", "white", "green"][index]}
                          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <FeelingCheck
                    value={physicalAfter}
                    onSelect={(value) => {
                      setPhysicalAfter(value);
                      addEntry("physical", value);
                    }}
                  />
                </div>
              </div>
            )}

            {technique === "cognitive" && (
              <div>
                <h2 className="text-2xl font-semibold">Cognitive grounding</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Anxiety takes up working memory. So does arithmetic. Give your mind a small, boring job and there’s
                  less room for the spiral.
                </p>

                <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--muted)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Say today’s date out loud</p>
                  <p className="mt-2 text-xl font-semibold">{todayLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    Then add where you are and how old you are. Slowly. Out loud beats in your head, if you have the
                    privacy for it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDateSaid((value) => !value)}
                    aria-pressed={dateSaid}
                    className={`mt-4 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                      dateSaid
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {dateSaid ? "Said it" : "Mark as done"}
                  </button>
                </div>

                <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] p-5">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Count backwards from 100 by 7s</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="rounded-lg bg-[var(--muted)] px-5 py-3">
                      <p className="text-3xl font-semibold tabular-nums text-[var(--primary)]" aria-live="polite">
                        {countdownValue}
                      </p>
                    </div>
                    <span className="text-sm text-[var(--muted-foreground)]">minus 7 is…</span>
                    <label className="block">
                      <span className="sr-only">Your answer</span>
                      <input
                        type="number"
                        value={countdownGuess}
                        onChange={(event) => setCountdownGuess(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") checkCountdown();
                        }}
                        disabled={countdownValue <= 2}
                        className="h-12 w-32 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-50"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={checkCountdown}
                      disabled={countdownValue <= 2}
                      className="inline-flex h-12 items-center rounded-md bg-[var(--primary)] px-5 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:opacity-50"
                    >
                      Check
                    </button>
                  </div>

                  {countdownValue <= 2 && (
                    <p className="mt-4 text-sm font-semibold text-[var(--primary)]">
                      That’s the whole way down. Notice how much attention that took.
                    </p>
                  )}
                  {countdownNudge && (
                    <p className="mt-3 text-sm text-[var(--muted-foreground)]" aria-live="polite">
                      {countdownNudge}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={revealCountdown}
                      disabled={countdownValue <= 2}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Show me the next one
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCountdownValue(100);
                        setCountdownGuess("");
                        setCountdownNudge("");
                      }}
                      className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Start over
                    </button>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                    Getting it wrong is not the failure state here — being absorbed enough to get it wrong is roughly the
                    point. If 7s feel like too much, count backwards from 50 by 3s instead.
                  </p>
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <FeelingCheck
                    value={cognitiveAfter}
                    onSelect={(value) => {
                      setCognitiveAfter(value);
                      addEntry("cognitive", value);
                    }}
                  />
                </div>
              </div>
            )}

            {technique === "soothe" && (
              <div>
                <h2 className="text-2xl font-semibold">Self-soothing</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                  Nothing to solve and nothing to get right. Warmth and touch tell your body it isn’t under threat, which
                  is sometimes the only message that gets through.
                </p>

                <div className="mt-6 grid gap-2">
                  {soothingSteps.map((step, index) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setSootheDone((prev) => prev.map((value, i) => (i === index ? !value : value)))}
                      aria-pressed={sootheDone[index]}
                      className={`flex items-start gap-3 rounded-md border p-4 text-left text-sm leading-6 transition ${
                        sootheDone[index]
                          ? "border-[var(--primary)] bg-[var(--muted)]"
                          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          sootheDone[index]
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)]"
                        }`}
                      >
                        {sootheDone[index] && <Check className="h-3 w-3" />}
                      </span>
                      <span className={sootheDone[index] ? "" : "text-[var(--muted-foreground)]"}>{step}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--background)] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Name 3 things you’re grateful for</p>
                    <ProgressDots total={3} filled={grateful.filter((g) => g.trim()).length} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                    Small ones count more than big ones. Hot water. A person who texts back.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {grateful.map((item, index) => (
                      <label key={index} className="block">
                        <span className="sr-only">Grateful for {index + 1}</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(event) =>
                            setGrateful((prev) => prev.map((g, i) => (i === index ? event.target.value : g)))
                          }
                          placeholder={["hot chai", "my bed", "a friend"][index]}
                          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--muted)] p-5">
                  <p className="text-center text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Breathe with this while your hand rests
                  </p>
                  <div className="mt-4">
                    <BreathCue reduceMotion={reduceMotion} />
                  </div>
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <FeelingCheck
                    value={sootheAfter}
                    onSelect={(value) => {
                      setSootheAfter(value);
                      addEntry("soothe", value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <aside className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Your private log</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ["Sessions", stats.total],
                  ["Days", stats.days],
                  ["Streak", stats.streak],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-center">
                    <p className="text-2xl font-semibold text-[var(--primary)] tabular-nums">{value}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{label}</p>
                  </div>
                ))}
              </div>
              {log.length === 0 ? (
                <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
                  Nothing logged yet. Finish a technique and answer the feelings check and it’ll show up here — stored on
                  this device only, never uploaded.
                </p>
              ) : (
                <>
                  <div className="mt-4 grid gap-1.5">
                    {[...log]
                      .slice(-5)
                      .reverse()
                      .map((entry) => (
                        <div
                          key={entry.at}
                          className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs"
                        >
                          <span className="font-semibold">{techniqueNames[entry.technique] || entry.technique}</span>
                          <span className="text-[var(--muted-foreground)]">
                            {new Date(entry.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
                            {entry.after || "—"}
                          </span>
                        </div>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Clear your entire session log? This can’t be undone.")) {
                        persist([]);
                      }
                    }}
                    className="mt-3 text-xs font-semibold text-[var(--muted-foreground)] underline"
                  >
                    Clear my log
                  </button>
                </>
              )}
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                A streak is nice, but missing days isn’t a failure — this is a tool, not a habit you owe anyone.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Why this works</p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Anxiety pulls your attention into a predicted future. Naming what your senses are picking up right now
                needs deliberate attention, and attention is a limited resource — the noticing quietly crowds out some of
                the spiralling. The long out-breath does its own bit of work, nudging the body’s calming response.
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                It won’t fix what you’re anxious about. It buys you a few minutes of steadier ground to stand on while
                you decide what to do next.
              </p>
            </div>
          </aside>
        </section>

        <div className="mt-6">
          <SupportCard highlight={showWorseSupport} />
        </div>

        <Disclaimer />
      </div>
    </main>
  );
}
