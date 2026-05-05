"use client";

import { useState, useEffect, useRef } from "react";
import { Wind, MapPin, Lightbulb } from "lucide-react";

const PHASES = [
  { name: "Inhale",  dur: 4 },
  { name: "Hold",    dur: 4 },
  { name: "Exhale",  dur: 6 },
];

const TARGET_CYCLES = 5;

const TIPS = [
  { title: "10-second rule",  text: "Before reacting, count to 10 slowly. This gives your prefrontal cortex time to override the amygdala's anger response." },
  { title: "Cold water reset", text: "Splash cold water on your face or wrists. This triggers the diving reflex — your heart rate drops instantly." },
  { title: "Name the feeling", text: 'Say out loud: "I feel angry because...". Naming an emotion reduces its intensity by activating the verbal brain.' },
  { title: "Leave the room",  text: "Physically removing yourself from the trigger situation for even 60 seconds significantly reduces anger escalation." },
];

const GROUNDING = [
  { num: 5, label: "Things you can see",  placeholder: "e.g. a chair..." },
  { num: 4, label: "Things you can touch", placeholder: "e.g. the floor..." },
  { num: 3, label: "Things you can hear",  placeholder: "e.g. traffic..." },
  { num: 2, label: "Things you can smell", placeholder: "e.g. coffee..." },
  { num: 1, label: "Thing you can taste",  placeholder: "e.g. mint..." },
];

const TABS = [
  { id: "breathing",  label: "Breathing",  Icon: Wind      },
  { id: "grounding",  label: "Grounding",  Icon: MapPin    },
  { id: "tips",       label: "Quick Tips", Icon: Lightbulb },
];

export default function AngerControlExercise() {
  const [activeTab,    setActiveTab]    = useState("breathing");
  const [running,      setRunning]      = useState(false);
  const [phase,        setPhase]        = useState(0);
  const [phaseTime,    setPhaseTime]    = useState(PHASES[0].dur);
  const [cycles,       setCycles]       = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [done,         setDone]         = useState(false);
  const [grounds,      setGrounds]      = useState(Array(5).fill(""));

  const runningRef      = useRef(false);
  const phaseRef        = useRef(0);
  const phaseTimeRef    = useRef(PHASES[0].dur);
  const cyclesRef       = useRef(0);
  const totalElapsedRef = useRef(0);
  const timerRef        = useRef(null);

  const tick = () => {
    if (!runningRef.current) return;

    setPhaseTime(phaseTimeRef.current);
    totalElapsedRef.current++;
    setTotalElapsed(totalElapsedRef.current);

    phaseTimeRef.current--;

    if (phaseTimeRef.current < 0) {
      phaseRef.current++;
      if (phaseRef.current >= PHASES.length) {
        phaseRef.current = 0;
        cyclesRef.current++;
        setCycles(cyclesRef.current);
        if (cyclesRef.current >= TARGET_CYCLES) {
          runningRef.current = false;
          setRunning(false);
          setDone(true);
          return;
        }
      }
      setPhase(phaseRef.current);
      phaseTimeRef.current = PHASES[phaseRef.current].dur;
    }

    timerRef.current = setTimeout(tick, 1000);
  };

  const start = () => {
    runningRef.current = true;
    setRunning(true);
    setDone(false);
    tick();
  };

  const pause = () => {
    runningRef.current = false;
    setRunning(false);
    clearTimeout(timerRef.current);
  };

  const reset = () => {
    pause();
    phaseRef.current        = 0;
    phaseTimeRef.current    = PHASES[0].dur;
    cyclesRef.current       = 0;
    totalElapsedRef.current = 0;
    setPhase(0);
    setPhaseTime(PHASES[0].dur);
    setCycles(0);
    setTotalElapsed(0);
    setDone(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const circleScale = phase === 0 ? "scale-110" : phase === 1 ? "scale-110" : "scale-100";

  return (
    <div className="bg-(--card) rounded-2xl p-6 mb-6 border-2 border-(--border)">

      {/* Header */}
      <div className="mb-4">
        <h3 className="subheading flex items-start gap-2 mb-4 leading-tight">
          <Wind size={22} className="text-(--primary) mt-0.5 shrink-0" />
          Anger Control Exercise
        </h3>
        <p className="description text-sm mt-1">
          Interactive exercises to calm your anger in real time.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-(--background) p-1.5 rounded-xl mb-6 border border-(--border)">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); if (id !== "breathing") pause(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-secondary font-semibold transition-all duration-200 cursor-pointer
              ${activeTab === id
                ? "bg-(--primary) text-white"
                : "text-(--muted-foreground) hover:bg-(--card) hover:text-(--foreground)"
              }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── BREATHING TAB ── */}
      {activeTab === "breathing" && (
        <div>
          {/* Phase steps */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {PHASES.map((p, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 text-center border-2 transition-all duration-300 ${
                  phase === i && running
                    ? "border-(--primary) bg-(--primary)/10"
                    : "border-(--border) bg-(--background)"
                }`}
              >
                <p className="description text-xs mb-1">{p.name}</p>
                <p className="font-primary font-bold text-(--foreground) text-sm">
                  {p.dur} sec
                </p>
              </div>
            ))}
          </div>

          {/* Circle */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-(--border)" />
              <div
                className={`w-24 h-24 rounded-full bg-(--background) border-2 border-(--primary) flex flex-col items-center justify-center transition-transform duration-700 ${circleScale}`}
              >
                <p className="font-primary font-semibold text-(--foreground) text-sm">
                  {done ? "Done" : running ? PHASES[phase].name : "Ready"}
                </p>
                <p className="font-primary font-bold text-(--primary) text-2xl">
                  {done ? "" : running ? phaseTime : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-(--background) rounded-xl p-3 text-center border border-(--border)">
              <p className="font-primary font-bold text-(--foreground) text-xl">{cycles}</p>
              <p className="description text-xs">Cycles</p>
            </div>
            <div className="bg-(--background) rounded-xl p-3 text-center border border-(--border)">
              <p className="font-primary font-bold text-(--foreground) text-xl">{totalElapsed}s</p>
              <p className="description text-xs">Time</p>
            </div>
            <div className="bg-(--background) rounded-xl p-3 text-center border border-(--border)">
              <p className="font-primary font-bold text-(--primary) text-xl">{TARGET_CYCLES}</p>
              <p className="description text-xs">Target</p>
            </div>
          </div>

          {/* Done banner */}
          {done && (
            <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 rounded-xl p-4 text-center mb-4">
              <p className="font-primary font-bold text-green-600 text-sm">
                Exercise complete
              </p>
              <p className="description text-xs text-green-600 mt-1">
                Great job. You should feel calmer now.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 max-w-lg mx-auto">
            <button
              onClick={running ? pause : start}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-(--primary) text-white rounded-xl font-secondary font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-60 cursor-pointer"
            >
              {done ? "Restart" : running ? "Pause" : cycles > 0 ? "Resume" : "Start"}
            </button>
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-(--primary) text-(--primary) rounded-xl font-secondary font-semibold transition-all duration-300 hover:bg-(--primary)/10 disabled:opacity-60 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* ── GROUNDING TAB ── */}
      {activeTab === "grounding" && (
        <div>
          <p className="description text-sm mb-4">
            The 5-4-3-2-1 technique grounds you in the present and breaks the anger cycle.
          </p>
          <div className="space-y-3">
            {GROUNDING.map(({ num, label, placeholder }, i) => (
              <div key={i} className="bg-(--background) rounded-xl p-4 border border-(--border)">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-(--primary)/10 text-(--primary) font-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {num}
                  </span>
                  <span className="font-primary font-semibold text-(--foreground) text-sm">
                    {label}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={grounds[i]}
                  onChange={(e) => {
                    const updated = [...grounds];
                    updated[i] = e.target.value;
                    setGrounds(updated);
                  }}
                  className="w-full bg-(--card) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--primary) transition-colors"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setGrounds(Array(5).fill(""))}
            className="w-full mt-4 py-3 border-2 border-(--border) text-(--foreground) rounded-xl font-secondary font-semibold text-sm hover:bg-(--background) cursor-pointer transition-all"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── TIPS TAB ── */}
      {activeTab === "tips" && (
        <div className="space-y-3">
          {TIPS.map(({ title, text }, i) => (
            <div key={i} className="bg-(--background) rounded-xl p-4 border border-(--border)">
              <p className="font-primary font-semibold text-(--foreground) text-sm mb-1">
                {title}
              </p>
              <p className="description text-sm">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}