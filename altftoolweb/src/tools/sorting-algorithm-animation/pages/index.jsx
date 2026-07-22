"use client";

import React, { useState, useEffect, useRef } from "react";
import { BarChart3, Play, Pause, RefreshCw, SkipBack, StepForward } from "lucide-react";

const ALGORITHMS = {
  "Bubble Sort": {
    sort: (arr) => {
      const steps = [];
      const a = [...arr];
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
          }
          steps.push({ arr: [...a], comparing: [j, j + 1], sorted: a.length - i });
        }
      }
      steps.push({ arr: [...a], comparing: [], sorted: 0 });
      return steps;
    },
  },
  "Selection Sort": {
    sort: (arr) => {
      const steps = [];
      const a = [...arr];
      for (let i = 0; i < a.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < a.length; j++) {
          if (a[j] < a[minIdx]) minIdx = j;
          steps.push({ arr: [...a], comparing: [j, minIdx], sorted: i });
        }
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        steps.push({ arr: [...a], comparing: [], sorted: i + 1 });
      }
      steps.push({ arr: [...a], comparing: [], sorted: 0 });
      return steps;
    },
  },
  "Insertion Sort": {
    sort: (arr) => {
      const steps = [];
      const a = [...arr];
      for (let i = 1; i < a.length; i++) {
        let j = i;
        while (j > 0 && a[j - 1] > a[j]) {
          [a[j], a[j - 1]] = [a[j - 1], a[j]];
          j--;
          steps.push({ arr: [...a], comparing: [j, j + 1], sorted: i });
        }
        steps.push({ arr: [...a], comparing: [], sorted: i });
      }
      steps.push({ arr: [...a], comparing: [], sorted: 0 });
      return steps;
    },
  },
};

export default function ToolHome() {
  const [algorithm, setAlgorithm] = useState("Bubble Sort");
  const [arraySize, setArraySize] = useState(15);
  const [speed, setSpeed] = useState(50);
  const [array, setArray] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sorted, setSorted] = useState(false);
  const intervalRef = useRef(null);

  const generateArray = () => {
    const arr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 5);
    setArray(arr);
    setSteps([]);
    setCurrentStep(0);
    setPlaying(false);
    setSorted(false);
  };

  useEffect(() => {
    generateArray();
  }, [arraySize]);

  const startSort = () => {
    const algo = ALGORITHMS[algorithm];
    const result = algo.sort(array);
    setSteps(result);
    setCurrentStep(0);
    setPlaying(true);
    setSorted(false);
  };

  useEffect(() => {
    if (playing && steps.length > 0) {
      const delay = 200 - speed * 1.5;
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            setSorted(true);
            return prev;
          }
          return prev + 1;
        });
      }, Math.max(10, delay));
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, steps.length, speed]);

  const stepData = steps[currentStep];
  const maxVal = Math.max(...array, 1);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Sorting Algorithm Animation</h1>
              <p className="text-xs text-muted-foreground mt-1">Watch sorting algorithms in action with animated bar chart visualizations.</p>
            </div>
          </div>
        </section>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.keys(ALGORITHMS).map((a) => (
              <button
                key={a}
                onClick={() => { setAlgorithm(a); setSteps([]); setCurrentStep(0); setPlaying(false); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  algorithm === a ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Size: {arraySize}</span>
              <input type="range" min={5} max={50} value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))} className="w-24 accent-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Speed: {speed}%</span>
              <input type="range" min={1} max={100} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-24 accent-primary" />
            </div>
            <button onClick={generateArray} className="px-4 py-2 rounded-lg border border-border text-xs font-bold text-foreground hover:bg-surface-soft flex items-center gap-1">
              <RefreshCw size={14} /> New Array
            </button>
            <button onClick={startSort} disabled={playing || steps.length > 0} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 flex items-center gap-1 disabled:opacity-50">
              <Play size={14} /> Sort
            </button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-foreground uppercase">{algorithm}</h2>
            {steps.length > 0 && (
              <span className="text-[10px] text-muted-foreground">Step {currentStep + 1}/{steps.length}</span>
            )}
          </div>

          <div className="flex items-end gap-1 min-h-[250px] p-4 bg-surface-soft rounded-xl border border-border" style={{ alignItems: "flex-end" }}>
            {(stepData ? stepData.arr : array).map((val, idx) => {
              const height = (val / maxVal) * 100;
              let color = "bg-primary/40";
              if (stepData) {
                if (stepData.comparing?.includes(idx)) color = "bg-amber-500";
                if (stepData.sorted !== undefined && idx >= stepData.sorted && stepData.sorted > 0) color = "bg-green-500";
              }
              if (sorted) color = "bg-green-500";
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t transition-all duration-100 ease-linear"
                  style={{ height: `${height}%`, backgroundColor: color.replace("bg-", "") }}
                />
              );
            })}
          </div>

          {steps.length > 0 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => { setCurrentStep(0); setPlaying(false); }} className="p-2 rounded-lg border border-border hover:bg-surface-soft">
                <SkipBack size={16} className="text-foreground" />
              </button>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                className="p-2 rounded-lg border border-border hover:bg-surface-soft"
                disabled={currentStep === 0}
              >
                <StepForward size={16} className="rotate-180 text-foreground" />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                className={`px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${playing ? "bg-amber-500 text-white" : "bg-primary text-primary-foreground"}`}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
                {playing ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="p-2 rounded-lg border border-border hover:bg-surface-soft"
                disabled={currentStep === steps.length - 1}
              >
                <StepForward size={16} className="text-foreground" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
