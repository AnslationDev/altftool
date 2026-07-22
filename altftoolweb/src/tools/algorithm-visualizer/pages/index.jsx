"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Search,
  ArrowRight,
  Sparkles,
  Zap,
  Share2,
  GraduationCap,
  BarChart3,
  Code2,
  Info,
  Shuffle,
  Clock,
  ArrowLeftRight,
  Layers,
  ListOrdered,
  GitBranch,
  Network,
  Grid3x3,
  Quote,
  Shapes,
  ArrowUpDown,
  Rocket,
  Save,
  Copy,
  Check,
  ChevronDown,
  History,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   Data
--------------------------------------------------------------------------- */

const CATEGORIES = [
  { name: "All", icon: Shapes },
  { name: "Sorting", icon: ArrowUpDown },
  { name: "Searching", icon: Search },
  { name: "Graph", icon: Network },
  { name: "Tree", icon: GitBranch },
  { name: "Dynamic Programming", icon: Grid3x3 },
  { name: "String", icon: Quote },
  { name: "Other", icon: Layers },
];

const ALGORITHMS = [
  { name: "Bubble Sort", desc: "Simple comparison-based sorting algorithm.", complexity: "O(n²)", category: "Sorting", icon: ArrowUpDown, accent: "text-blue-500 bg-blue-500/10" },
  { name: "Selection Sort", desc: "Divide the array into sorted and unsorted parts.", complexity: "O(n²)", category: "Sorting", icon: ListOrdered, accent: "text-blue-500 bg-blue-500/10" },
  { name: "Insertion Sort", desc: "Build the sorted array one item at a time.", complexity: "O(n²)", category: "Sorting", icon: ListOrdered, accent: "text-blue-500 bg-blue-500/10" },
  { name: "Merge Sort", desc: "Divide and conquer sorting algorithm.", complexity: "O(n log n)", category: "Sorting", icon: GitBranch, accent: "text-indigo-500 bg-indigo-500/10" },
  { name: "Quick Sort", desc: "Efficient divide and conquer algorithm.", complexity: "O(n log n)", category: "Sorting", icon: Zap, accent: "text-indigo-500 bg-indigo-500/10" },
  { name: "Heap Sort", desc: "Uses binary heap data structure.", complexity: "O(n log n)", category: "Sorting", icon: Layers, accent: "text-violet-500 bg-violet-500/10" },
  { name: "Linear Search", desc: "Sequentially check each element.", complexity: "O(n)", category: "Searching", icon: Search, accent: "text-emerald-500 bg-emerald-500/10" },
  { name: "Binary Search", desc: "Efficient search in sorted array.", complexity: "O(log n)", category: "Searching", icon: Search, accent: "text-emerald-500 bg-emerald-500/10" },
  { name: "BFS", desc: "Breadth First Search in graph.", complexity: "O(V + E)", category: "Graph", icon: Network, accent: "text-orange-500 bg-orange-500/10" },
  { name: "DFS", desc: "Depth First Search in graph.", complexity: "O(V + E)", category: "Graph", icon: Network, accent: "text-orange-500 bg-orange-500/10" },
  { name: "Dijkstra", desc: "Shortest path in a weighted graph.", complexity: "O(E log V)", category: "Graph", icon: Network, accent: "text-orange-500 bg-orange-500/10" },
  { name: "Knapsack", desc: "Classic dynamic programming problem.", complexity: "O(nW)", category: "Dynamic Programming", icon: Grid3x3, accent: "text-rose-500 bg-rose-500/10" },
];

const RECENT = [
  { name: "Merge Sort", when: "Just now" },
  { name: "Binary Search", when: "10 min ago" },
  { name: "Quick Sort", when: "1 hour ago" },
  { name: "DFS", when: "3 hours ago" },
  { name: "Insertion Sort", when: "Yesterday" },
];

const FEATURES = [
  { title: "Step-by-Step Execution", desc: "See every operation performed in real-time.", icon: ArrowLeftRight, accent: "text-blue-500 bg-blue-500/10" },
  { title: "Beautiful Visualizations", desc: "Smooth animations and clear visual representation.", icon: Sparkles, accent: "text-violet-500 bg-violet-500/10" },
  { title: "Learn Better", desc: "Understand time & space complexity easily.", icon: GraduationCap, accent: "text-emerald-500 bg-emerald-500/10" },
  { title: "Share & Export", desc: "Share your visualizations or export as GIF.", icon: Share2, accent: "text-orange-500 bg-orange-500/10" },
];

const CODE = {
  Python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
  JavaScript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
};

const COMPLEXITY = [
  { label: "Best", value: "O(n log n)" },
  { label: "Average", value: "O(n log n)" },
  { label: "Worst", value: "O(n log n)" },
  { label: "Space", value: "O(n)" },
];

const SAMPLE = [38, 27, 43, 3, 9, 82, 10];

// Merge-sort divide tree levels for the sample (top → down)
const TREE_LEVELS = [
  [[38, 27, 43, 3, 9, 82, 10]],
  [[38, 27, 43, 3], [9, 82, 10]],
  [[38, 27], [43, 3], [9, 82], [10]],
  [[38], [27], [43], [3], [9], [82], [10]],
];
const SORTED_SAMPLE = [...SAMPLE].sort((a, b) => a - b);

/* ---------------------------------------------------------------------------
   Bubble-sort step engine (drives the live workspace chart)
--------------------------------------------------------------------------- */

function buildSteps(input) {
  const arr = [...input];
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;
  const sorted = [];
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      let didSwap = false;
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        didSwap = true;
      }
      steps.push({ array: [...arr], a: j, b: j + 1, sorted: [...sorted], comparisons, swaps, didSwap });
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);
  steps.push({ array: [...arr], a: -1, b: -1, sorted: [...Array(n).keys()], comparisons, swaps, done: true });
  return steps;
}

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export default function ToolHome() {
  // hero playback (decorative merge-sort tree)
  const HERO_TOTAL = 24;
  const [heroStep, setHeroStep] = useState(16);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [heroSpeed, setHeroSpeed] = useState(1);
  const [codeTab, setCodeTab] = useState("Code");
  const [lang, setLang] = useState("Python");
  const [copied, setCopied] = useState(false);

  // explore
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("Merge Sort");
  const [showAll, setShowAll] = useState(false);

  // workspace visualizer
  const [inputText, setInputText] = useState("38, 27, 43, 3, 9, 82, 10");
  const [size, setSize] = useState(7);
  const [steps, setSteps] = useState(() => buildSteps(SAMPLE));
  const [wsIndex, setWsIndex] = useState(0);
  const [wsPlaying, setWsPlaying] = useState(false);

  const parseInput = (txt) =>
    txt
      .split(/[\s,]+/)
      .map((n) => parseInt(n, 10))
      .filter((n) => !Number.isNaN(n))
      .slice(0, 16);

  const visualize = (arr) => {
    const data = arr && arr.length ? arr : parseInput(inputText);
    if (!data.length) return;
    setSteps(buildSteps(data));
    setWsIndex(0);
    setWsPlaying(true);
  };

  const randomize = () => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
    setInputText(arr.join(", "));
    visualize(arr);
  };

  // hero auto-advance
  useEffect(() => {
    if (!heroPlaying) return;
    const id = setInterval(() => {
      setHeroStep((s) => {
        if (s >= HERO_TOTAL) {
          setHeroPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 700 / heroSpeed);
    return () => clearInterval(id);
  }, [heroPlaying, heroSpeed]);

  // workspace auto-advance
  useEffect(() => {
    if (!wsPlaying) return;
    if (wsIndex >= steps.length - 1) {
      setWsPlaying(false);
      return;
    }
    const id = setTimeout(() => setWsIndex((i) => Math.min(i + 1, steps.length - 1)), 260);
    return () => clearTimeout(id);
  }, [wsPlaying, wsIndex, steps]);

  const cur = steps[Math.min(wsIndex, steps.length - 1)] || steps[0];
  const maxVal = Math.max(...cur.array, 1);
  const elapsed = (wsIndex * 0.0175).toFixed(2);

  const filteredAlgos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALGORITHMS.filter(
      (a) => (category === "All" || a.category === category) && (!q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)),
    );
  }, [category, query]);
  const visibleAlgos = showAll ? filteredAlgos : filteredAlgos.slice(0, 10);

  const copyCode = () => {
    navigator.clipboard?.writeText(CODE[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const goExplore = () => document.getElementById("av-explore")?.scrollIntoView({ behavior: "smooth" });
  const goVisualize = () => document.getElementById("av-workspace")?.scrollIntoView({ behavior: "smooth" });

  const chip = "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors";

  /* ---- render ---- */
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* =============================================== HERO */}
        <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1 text-[12px] font-semibold text-blue-500">
              <Sparkles className="w-3.5 h-3.5" /> Interactive • Visual • Educational
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Algorithm
              <br />
              <span className="text-blue-600 dark:text-blue-400">Visualizer</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-(--muted-foreground)">
              Visualize algorithms step-by-step with beautiful animations. Understand how they work under the hood.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={goVisualize} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                Start Visualizing <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={goExplore} className="inline-flex items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-5 py-2.5 text-[14px] font-semibold text-(--foreground) hover:bg-(--muted)/60 transition-colors">
                Explore Algorithms
              </button>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { icon: Layers, top: "50+", sub: "Algorithms" },
                { icon: ArrowLeftRight, top: "Step-by-Step", sub: "Execution" },
                { icon: Sparkles, top: "Smart", sub: "Explanations" },
              ].map((s) => (
                <div key={s.sub} className="rounded-xl border border-(--border) bg-(--card) px-3 py-2.5">
                  <s.icon className="w-4 h-4 text-blue-500" />
                  <p className="mt-1.5 text-[13px] font-semibold text-(--foreground)">{s.top}</p>
                  <p className="text-[11px] text-(--muted-foreground)">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visualizer panel */}
          <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-xl shadow-black/5">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px]">
              {/* tree area */}
              <div className="border-b border-(--border) p-4 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 text-(--muted-foreground)" /> Merge Sort
                </div>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Divide</p>
                <div className="mt-2 space-y-2.5">
                  {TREE_LEVELS.map((level, li) => (
                    <div key={li} className="flex items-start justify-center gap-2">
                      {level.map((group, gi) => (
                        <div key={gi} className="flex gap-0.5 rounded-md">
                          {group.map((v, vi) => (
                            <span key={vi} className="grid h-7 min-w-7 place-items-center rounded-md bg-blue-500/10 px-1 text-[11px] font-semibold text-blue-600 dark:text-blue-300">
                              {v}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                  {/* merged sorted row */}
                  <div className="flex items-center justify-center gap-1 pt-1">
                    {SORTED_SAMPLE.map((v, i) => {
                      const active = i === heroStep % SORTED_SAMPLE.length;
                      return (
                        <span
                          key={i}
                          className={`grid h-8 min-w-8 place-items-center rounded-md px-1 text-[12px] font-bold transition-colors ${
                            active ? "bg-amber-400 text-amber-950" : "bg-blue-600 text-white"
                          }`}
                        >
                          {v}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* code / info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-4 border-b border-(--border) px-3 pt-2">
                  {["Code", "Info"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setCodeTab(t)}
                      className={`-mb-px border-b-2 pb-2 text-[12px] font-semibold transition-colors ${
                        codeTab === t ? "border-blue-500 text-blue-500" : "border-transparent text-(--muted-foreground) hover:text-(--foreground)"
                      }`}
                    >
                      {t === "Code" ? <span className="inline-flex items-center gap-1"><Code2 className="w-3 h-3" />Code</span> : <span className="inline-flex items-center gap-1"><Info className="w-3 h-3" />Info</span>}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-1 pb-1.5">
                    <button onClick={copyCode} className="inline-flex h-6 w-6 items-center justify-center rounded-md text-(--muted-foreground) hover:bg-(--muted)/60 hover:text-(--foreground)">
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {codeTab === "Code" ? (
                  <>
                    <div className="flex items-center gap-1.5 px-3 py-2">
                      <div className="relative">
                        <select value={lang} onChange={(e) => setLang(e.target.value)} className="appearance-none rounded-md border border-(--border) bg-(--background) py-1 pl-2 pr-6 text-[11px] font-medium text-(--foreground) focus:outline-none">
                          <option>Python</option>
                          <option>JavaScript</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 w-3 h-3 -translate-y-1/2 text-(--muted-foreground)" />
                      </div>
                    </div>
                    <pre className="apo-scroll max-h-52 overflow-auto px-3 pb-2 font-mono text-[10.5px] leading-relaxed text-(--foreground)">
                      {CODE[lang]}
                    </pre>
                    <div className="mt-auto m-3 rounded-lg border border-(--border) bg-(--muted)/40 p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-(--muted-foreground)">Time Complexity</p>
                      <div className="mt-1.5 space-y-1">
                        {COMPLEXITY.map((c) => (
                          <div key={c.label} className="flex items-center justify-between text-[11px]">
                            <span className="text-(--muted-foreground)">{c.label}</span>
                            <span className="font-mono font-semibold text-(--foreground)">{c.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 p-3 text-[12px] leading-relaxed text-(--muted-foreground)">
                    <p className="font-semibold text-(--foreground)">About Merge Sort</p>
                    <p>A stable, divide-and-conquer algorithm that splits the array in half, recursively sorts each half, and merges them back in order.</p>
                    <p>Guarantees O(n log n) time in every case, making it reliable for large datasets, at the cost of O(n) extra space.</p>
                  </div>
                )}
              </div>
            </div>

            {/* playback bar */}
            <div className="flex flex-wrap items-center gap-2 border-t border-(--border) px-3 py-2.5">
              <button onClick={() => setHeroPlaying((p) => !p)} aria-label="Play/Pause" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                {heroPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={() => setHeroStep(0)} aria-label="First" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><ChevronsLeft className="w-4 h-4" /></button>
              <button onClick={() => setHeroStep((s) => Math.max(0, s - 1))} aria-label="Prev" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><SkipBack className="w-4 h-4" /></button>
              <button onClick={() => setHeroStep((s) => Math.min(HERO_TOTAL, s + 1))} aria-label="Next" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><SkipForward className="w-4 h-4" /></button>
              <button onClick={() => setHeroStep(HERO_TOTAL)} aria-label="Last" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><ChevronsRight className="w-4 h-4" /></button>
              <div className="ml-1 flex items-center gap-1.5">
                <span className="text-[11px] text-(--muted-foreground)">Speed</span>
                <input type="range" min="0.5" max="2" step="0.5" value={heroSpeed} onChange={(e) => setHeroSpeed(Number(e.target.value))} className="w-16 accent-blue-600" />
                <span className="text-[11px] font-medium text-(--foreground)">{heroSpeed.toFixed(1)}x</span>
              </div>
              <span className="text-[11px] text-(--muted-foreground)">Step {heroStep} / {HERO_TOTAL}</span>
              <button onClick={() => { setHeroStep(0); setHeroPlaying(false); }} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1 text-[11px] font-medium text-(--muted-foreground) hover:text-(--foreground)">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </section>

        {/* =============================================== EXPLORE */}
        <section id="av-explore" className="mt-16 scroll-mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Explore Algorithms</h2>
              <p className="mt-1 text-[14px] text-(--muted-foreground)">Choose an algorithm to visualize and understand its execution.</p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-(--muted-foreground)" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search algorithms…" className="w-full rounded-xl border border-(--border) bg-(--card) py-2.5 pl-10 pr-3 text-[14px] text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>

          <div className="apo-scroll mt-5 flex items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap">
            {CATEGORIES.map((c) => {
              const active = category === c.name;
              return (
                <button key={c.name} onClick={() => { setCategory(c.name); setShowAll(false); }} className={`${chip} shrink-0 ${active ? "bg-blue-600 text-white" : "border border-(--border) bg-(--card) text-(--muted-foreground) hover:text-(--foreground)"}`}>
                  <c.icon className="w-3.5 h-3.5" /> {c.name}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {visibleAlgos.map((a) => {
              const isSel = selected === a.name;
              return (
                <button
                  key={a.name}
                  onClick={() => setSelected(a.name)}
                  className={`group flex flex-col rounded-2xl border bg-(--card) p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 ${
                    isSel ? "border-blue-500 ring-2 ring-blue-500/20" : "border-(--border) hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${a.accent}`}>
                      <a.icon className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="mt-3 text-[14px] font-semibold text-(--foreground)">{a.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-(--muted-foreground)">{a.desc}</p>
                  <span className="mt-3 font-mono text-[13px] font-semibold text-blue-600 dark:text-blue-400">{a.complexity}</span>
                </button>
              );
            })}
          </div>

          {filteredAlgos.length === 0 && (
            <p className="mt-6 text-center text-[13px] text-(--muted-foreground)">No algorithms match your search.</p>
          )}
          {filteredAlgos.length > 10 && (
            <div className="mt-6 flex justify-center">
              <button onClick={() => setShowAll((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) bg-(--card) px-4 py-2 text-[13px] font-medium text-(--foreground) hover:bg-(--muted)/60">
                {showAll ? "Show Less" : "View All Algorithms"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* =============================================== WORKSPACE */}
        <section id="av-workspace" className="mt-16 grid grid-cols-1 gap-4 scroll-mt-6 lg:grid-cols-12">
          {/* recently used */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 lg:col-span-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-(--muted-foreground)" />
              <h3 className="text-[15px] font-bold text-(--foreground)">Your Workspace</h3>
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-(--muted-foreground)">Recently Used</p>
            <div className="mt-2 space-y-1">
              {RECENT.map((r, i) => (
                <button
                  key={r.name}
                  onClick={() => setSelected(r.name)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                    i === 0 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "hover:bg-(--muted)/60 text-(--foreground)"
                  }`}
                >
                  <span className="text-[13px] font-medium">{r.name}</span>
                  <span className="text-[11px] text-(--muted-foreground)">{r.when}</span>
                </button>
              ))}
            </div>
            <button className="mt-3 w-full rounded-xl border border-(--border) py-2 text-[12px] font-medium text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/60">
              View All History
            </button>
          </div>

          {/* custom input + chart */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 lg:col-span-6">
            <h3 className="text-[15px] font-bold text-(--foreground)">Custom Input</h3>
            <p className="mt-1 text-[12px] text-(--muted-foreground)">Enter your own array or generate random data to visualize.</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && visualize()}
                placeholder="38, 27, 43, 3, 9, 82, 10"
                className="min-w-0 flex-1 rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 font-mono text-[13px] text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button onClick={() => visualize()} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-700">
                Visualize
              </button>
              <button onClick={randomize} className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2.5 text-[13px] font-medium text-(--foreground) hover:bg-(--muted)/60">
                <Shuffle className="w-3.5 h-3.5" /> Random
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-(--muted-foreground)">Size</span>
                <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="rounded-lg border border-(--border) bg-(--background) px-2 py-2 text-[13px] text-(--foreground) focus:outline-none">
                  {[5, 7, 10, 12, 16].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* bar chart */}
            <div className="mt-5 flex h-44 items-end justify-center gap-1.5 rounded-xl border border-(--border) bg-(--muted)/30 p-3">
              {cur.array.map((v, i) => {
                const isCompare = i === cur.a || i === cur.b;
                const isSorted = cur.sorted?.includes(i);
                return (
                  <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[10px] font-semibold text-(--muted-foreground)">{v}</span>
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isCompare ? "bg-amber-400" : isSorted ? "bg-emerald-500" : "bg-blue-500/70"
                      }`}
                      style={{ height: `${Math.max((v / maxVal) * 100, 6)}%` }}
                    />
                    <span className="text-[9px] text-(--muted-foreground)">{i}</span>
                  </div>
                );
              })}
            </div>

            {/* playback + stats */}
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => setWsPlaying((p) => !p)} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                {wsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setWsIndex((i) => Math.max(0, i - 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><SkipBack className="w-4 h-4" /></button>
              <button onClick={() => setWsIndex((i) => Math.min(steps.length - 1, i + 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><SkipForward className="w-4 h-4" /></button>
              <input type="range" min="0" max={steps.length - 1} value={wsIndex} onChange={(e) => { setWsIndex(Number(e.target.value)); setWsPlaying(false); }} className="flex-1 accent-blue-600" />
              <button onClick={() => { setWsIndex(0); setWsPlaying(false); }} className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1 text-[11px] font-medium text-(--muted-foreground) hover:text-(--foreground)"><RotateCcw className="w-3 h-3" /></button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-(--border) pt-4 sm:grid-cols-4">
              {[
                { icon: ArrowLeftRight, label: "Comparisons", value: cur.comparisons, accent: "text-amber-500" },
                { icon: ArrowUpDown, label: "Swaps", value: cur.swaps, accent: "text-blue-500" },
                { icon: ListOrdered, label: "Steps", value: `${wsIndex}/${steps.length - 1}`, accent: "text-violet-500" },
                { icon: Clock, label: "Time", value: `${elapsed}s`, accent: "text-emerald-500" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <s.icon className={`w-4 h-4 ${s.accent}`} />
                  <div>
                    <p className="text-[15px] font-bold leading-none text-(--foreground)">{s.value}</p>
                    <p className="mt-0.5 text-[11px] text-(--muted-foreground)">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI explanation */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 lg:col-span-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="text-[15px] font-bold text-(--foreground)">AI Explanation</h3>
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">Beta</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-(--foreground)">
              This is <span className="font-semibold">{selected}</span>. The algorithm follows these steps:
            </p>
            <ol className="mt-3 space-y-2">
              {[
                "Compare adjacent elements in the array.",
                "Swap them if they are in the wrong order.",
                "Repeat until no swaps are needed.",
              ].map((t, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-(--muted-foreground)">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-lg border border-(--border) bg-(--muted)/40 p-3 text-[12px] leading-relaxed text-(--muted-foreground)">
              {cur.done ? "Array fully sorted — every element is in its final position." : cur.a >= 0 ? `At this step, comparing index ${cur.a} and ${cur.b}${cur.didSwap ? " and swapping them." : "."}` : "Press Visualize to start stepping through the algorithm."}
            </div>
            <button onClick={() => setWsPlaying(true)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-(--border) py-2 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10">
              <Sparkles className="w-3.5 h-3.5" /> Explain This Step
            </button>
          </div>
        </section>

        {/* =============================================== FEATURES */}
        <section className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-(--border) bg-(--card) p-5">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.accent}`}>
                <f.icon className="w-5 h-5" />
              </span>
              <p className="mt-3 text-[14px] font-semibold text-(--foreground)">{f.title}</p>
              <p className="mt-1 text-[12px] leading-snug text-(--muted-foreground)">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* =============================================== CTA */}
        <section className="mt-10 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                <Rocket className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white sm:text-xl">Master Algorithms Visually</h3>
                <p className="text-[13px] text-white/80">The best way to understand DSA concepts. Try it now!</p>
              </div>
            </div>
            <button onClick={goVisualize} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[14px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors">
              Start Visualizing Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .apo-scroll::-webkit-scrollbar { height: 6px; width: 6px }
        .apo-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, currentColor 18%, transparent); border-radius: 9999px }
      `,
        }}
      />
    </div>
  );
}
