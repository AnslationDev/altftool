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
  Shapes,
  ArrowUpDown,
  Rocket,
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
  { name: "Dynamic Programming", icon: Grid3x3 },
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

// Merge-sort divide tree levels for the sample (top → down). Must mirror the
// `mid = len(arr) // 2; left = arr[:mid]; right = arr[mid:]` split shown in
// the Code panel: for the 7-value SAMPLE, mid=3 so the first split is a
// 3-item group followed by a 4-item group (not the other way round), and
// each subsequent level re-splits every group the same way.
const TREE_LEVELS = [
  [[38, 27, 43, 3, 9, 82, 10]],
  [[38, 27, 43], [3, 9, 82, 10]],
  [[38], [27, 43], [3, 9], [82, 10]],
  [[38], [27], [43], [3], [9], [82], [10]],
];
const SORTED_SAMPLE = [...SAMPLE].sort((a, b) => a - b);

/* ---------------------------------------------------------------------------
   Per-algorithm step engines (drive the live workspace chart)

   Every engine returns an array of steps shaped as:
     { array, a, b, sorted, comparisons, swaps, done?, didSwap?, found?, foundIndex? }
   `a`/`b` are the indices currently highlighted (compare or probe), `sorted`
   is the set of indices to render green. Only algorithms with a real engine
   below can be selected and run — see RUNNABLE_ALGORITHMS.
--------------------------------------------------------------------------- */

function buildBubbleSteps(input) {
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

function buildSelectionSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let swaps = 0;
  const sortedIdx = [];
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      steps.push({ array: [...arr], a: minIdx, b: j, sorted: [...sortedIdx], comparisons, swaps });
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      steps.push({ array: [...arr], a: i, b: minIdx, sorted: [...sortedIdx], comparisons, swaps, didSwap: true });
    }
    sortedIdx.push(i);
  }
  if (n > 0) sortedIdx.push(n - 1);
  steps.push({ array: [...arr], a: -1, b: -1, sorted: [...Array(n).keys()], comparisons, swaps, done: true });
  return steps;
}

function buildInsertionSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: n > 0 ? [0] : [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let swaps = 0;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0) {
      comparisons++;
      steps.push({
        array: [...arr],
        a: j - 1,
        b: j,
        sorted: Array.from({ length: i }, (_, k) => k),
        comparisons,
        swaps,
      });
      if (arr[j - 1] > arr[j]) {
        [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
        swaps++;
        j--;
      } else {
        break;
      }
    }
  }
  steps.push({ array: [...arr], a: -1, b: -1, sorted: [...Array(n).keys()], comparisons, swaps, done: true });
  return steps;
}

function buildMergeSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let swaps = 0;
  const sortedSet = new Set();

  function merge(lo, mid, hi) {
    const left = arr.slice(lo, mid);
    const right = arr.slice(mid, hi);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      comparisons++;
      if (left[i] <= right[j]) {
        arr[k] = left[i++];
      } else {
        arr[k] = right[j++];
        swaps++;
      }
      steps.push({ array: [...arr], a: k, b: -1, sorted: [...sortedSet], comparisons, swaps });
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i++];
      steps.push({ array: [...arr], a: k, b: -1, sorted: [...sortedSet], comparisons, swaps });
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j++];
      steps.push({ array: [...arr], a: k, b: -1, sorted: [...sortedSet], comparisons, swaps });
      k++;
    }
    for (let idx = lo; idx < hi; idx++) sortedSet.add(idx);
  }

  function mergeSortRange(lo, hi) {
    if (hi - lo <= 1) {
      if (hi - lo === 1) sortedSet.add(lo);
      return;
    }
    const mid = lo + Math.floor((hi - lo) / 2);
    mergeSortRange(lo, mid);
    mergeSortRange(mid, hi);
    merge(lo, mid, hi);
  }

  mergeSortRange(0, n);
  steps.push({ array: [...arr], a: -1, b: -1, sorted: [...Array(n).keys()], comparisons, swaps, done: true });
  return steps;
}

function buildQuickSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let swaps = 0;
  const sortedSet = new Set();

  function quickSort(lo, hi) {
    if (lo > hi) return;
    if (lo === hi) {
      sortedSet.add(lo);
      return;
    }
    const pivot = arr[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      steps.push({ array: [...arr], a: j, b: hi, sorted: [...sortedSet], comparisons, swaps });
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          steps.push({ array: [...arr], a: i, b: j, sorted: [...sortedSet], comparisons, swaps, didSwap: true });
        }
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    swaps++;
    sortedSet.add(i + 1);
    steps.push({ array: [...arr], a: i + 1, b: hi, sorted: [...sortedSet], comparisons, swaps, didSwap: true });
    quickSort(lo, i);
    quickSort(i + 2, hi);
  }

  if (n > 0) quickSort(0, n - 1);
  steps.push({ array: [...arr], a: -1, b: -1, sorted: [...Array(n).keys()], comparisons, swaps, done: true });
  return steps;
}

function buildHeapSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let swaps = 0;
  const sortedSet = new Set();

  function heapify(size, root) {
    let largest = root;
    const l = 2 * root + 1;
    const r = 2 * root + 2;
    if (l < size) {
      comparisons++;
      steps.push({ array: [...arr], a: l, b: largest, sorted: [...sortedSet], comparisons, swaps });
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < size) {
      comparisons++;
      steps.push({ array: [...arr], a: r, b: largest, sorted: [...sortedSet], comparisons, swaps });
      if (arr[r] > arr[largest]) largest = r;
    }
    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      swaps++;
      steps.push({ array: [...arr], a: root, b: largest, sorted: [...sortedSet], comparisons, swaps, didSwap: true });
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    swaps++;
    sortedSet.add(end);
    steps.push({ array: [...arr], a: 0, b: end, sorted: [...sortedSet], comparisons, swaps, didSwap: true });
    heapify(end, 0);
  }
  if (n > 0) sortedSet.add(0);
  steps.push({ array: [...arr], a: -1, b: -1, sorted: [...Array(n).keys()], comparisons, swaps, done: true });
  return steps;
}

function buildLinearSearchSteps(input, target) {
  const arr = [...input];
  const n = arr.length;
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let foundIndex = -1;
  for (let i = 0; i < n; i++) {
    comparisons++;
    const isMatch = arr[i] === target;
    steps.push({ array: [...arr], a: i, b: -1, sorted: isMatch ? [i] : [], comparisons, swaps: 0, found: isMatch });
    if (isMatch) {
      foundIndex = i;
      break;
    }
  }
  steps.push({
    array: [...arr],
    a: -1,
    b: -1,
    sorted: foundIndex >= 0 ? [foundIndex] : [],
    comparisons,
    swaps: 0,
    done: true,
    foundIndex,
  });
  return steps;
}

function buildBinarySearchSteps(input, target) {
  // Binary search requires sorted data — the workspace sorts a copy first
  // and says so in the UI (see the note shown under Custom Input).
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const steps = [{ array: [...arr], a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0 }];
  let comparisons = 0;
  let lo = 0;
  let hi = n - 1;
  let foundIndex = -1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    comparisons++;
    const isMatch = arr[mid] === target;
    steps.push({ array: [...arr], a: mid, b: -1, sorted: isMatch ? [mid] : [], comparisons, swaps: 0, found: isMatch });
    if (isMatch) {
      foundIndex = mid;
      break;
    }
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  steps.push({
    array: [...arr],
    a: -1,
    b: -1,
    sorted: foundIndex >= 0 ? [foundIndex] : [],
    comparisons,
    swaps: 0,
    done: true,
    foundIndex,
  });
  return steps;
}

const STEP_BUILDERS = {
  "Bubble Sort": (arr) => buildBubbleSteps(arr),
  "Selection Sort": (arr) => buildSelectionSteps(arr),
  "Insertion Sort": (arr) => buildInsertionSteps(arr),
  "Merge Sort": (arr) => buildMergeSteps(arr),
  "Quick Sort": (arr) => buildQuickSteps(arr),
  "Heap Sort": (arr) => buildHeapSteps(arr),
  "Linear Search": (arr, target) => buildLinearSearchSteps(arr, target),
  "Binary Search": (arr, target) => buildBinarySearchSteps(arr, target),
};

const RUNNABLE_ALGORITHMS = new Set(Object.keys(STEP_BUILDERS));

function isSearchAlgorithm(name) {
  return name === "Linear Search" || name === "Binary Search";
}

// Short, accurate step lists for the "AI Explanation" panel — keyed by the
// exact algorithm name so the copy always matches what is selected.
const ALGO_EXPLANATIONS = {
  "Bubble Sort": [
    "Compare each pair of adjacent elements in the array.",
    "Swap them if the left one is bigger than the right one.",
    "Repeat full passes until a pass makes no swaps.",
  ],
  "Selection Sort": [
    "Scan the unsorted part of the array to find its smallest value.",
    "Swap that smallest value into the front of the unsorted part.",
    "Shrink the unsorted part by one and repeat.",
  ],
  "Insertion Sort": [
    "Take the next element from the unsorted part of the array.",
    "Shift larger sorted elements one place right to make room.",
    "Insert the element into its correct position in the sorted part.",
  ],
  "Merge Sort": [
    "Split the array in half recursively until each piece has one element.",
    "Merge pairs of sorted pieces back together in order.",
    "Repeat merging until the whole array is one sorted sequence.",
  ],
  "Quick Sort": [
    "Pick a pivot element (the last element of the range).",
    "Partition the range so smaller values end up left of the pivot and larger ones right.",
    "Recursively quick sort the left and right partitions.",
  ],
  "Heap Sort": [
    "Build a max-heap from the array so the largest value sits at the root.",
    "Swap the root with the last unsorted element, then shrink the heap by one.",
    "Re-heapify the reduced heap and repeat until every element is sorted.",
  ],
  "Linear Search": [
    "Check the array's elements one by one from the start.",
    "Compare each element to the target value.",
    "Stop as soon as a match is found, or report not found at the end.",
  ],
  "Binary Search": [
    "Look at the middle element of the sorted search range.",
    "If it's the target, stop; if the target is smaller, search the left half, otherwise the right half.",
    "Repeat, halving the range, until the target is found or the range is empty.",
  ],
  BFS: [
    "Visit a starting node and add its neighbours to a queue.",
    "Repeatedly dequeue a node, visit it, and enqueue its unvisited neighbours.",
    "Continue until the queue is empty — nodes are visited in order of distance from the start.",
  ],
  DFS: [
    "Visit a starting node and pick one unvisited neighbour to move to.",
    "Keep moving to unvisited neighbours, going as deep as possible.",
    "Backtrack when stuck and continue from the last node with an unvisited neighbour.",
  ],
  Dijkstra: [
    "Track the shortest known distance to every node, starting at infinity.",
    "Repeatedly pick the unvisited node with the smallest known distance and relax its edges.",
    "Stop once every node has been visited — each distance is now the shortest path.",
  ],
  Knapsack: [
    "Build a table of the best value achievable for each weight limit and item count.",
    "For each item, decide whether including it beats leaving it out at that weight.",
    "Read the final cell of the table for the best achievable value.",
  ],
};

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

  // recently used — real selections only, newest first (see selectAlgorithm)
  const [recentlyUsed, setRecentlyUsed] = useState([]);
  const [showAllRecent, setShowAllRecent] = useState(false);

  // workspace visualizer
  const [inputText, setInputText] = useState("38, 27, 43, 3, 9, 82, 10");
  const [target, setTarget] = useState("43");
  const [size, setSize] = useState(7);
  const [steps, setSteps] = useState(() => STEP_BUILDERS["Merge Sort"](SAMPLE));
  const [wsIndex, setWsIndex] = useState(0);
  const [wsPlaying, setWsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const copyTimerRef = useRef(null);
  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);

  // "now" is captured in state (lazily at mount, then ticked from an
  // interval) so relative-time formatting below stays a pure function of
  // props/state — it never calls Date.now() during render.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const selectAlgorithm = (name) => {
    setSelected(name);
    setRecentlyUsed((prev) => [{ name, at: Date.now() }, ...prev.filter((r) => r.name !== name)].slice(0, 12));
  };

  const parseInput = (txt) =>
    txt
      .split(/[\s,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n))
      .slice(0, 16);

  const visualize = (arr) => {
    const data = arr && arr.length ? arr : parseInput(inputText);
    if (!data.length) return;
    const builder = STEP_BUILDERS[selected];
    if (!builder) {
      setSteps([{ array: data, a: -1, b: -1, sorted: [], comparisons: 0, swaps: 0, unsupported: true }]);
      setWsIndex(0);
      setWsPlaying(false);
      setElapsedMs(0);
      return;
    }
    const nextSteps = isSearchAlgorithm(selected) ? builder(data, Number(target)) : builder(data);
    setSteps(nextSteps);
    setWsIndex(0);
    setWsPlaying(true);
    setElapsedMs(0);
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

  // workspace auto-advance — each real 260ms tick also accounts for the
  // "Time" stat below, so it reflects actual playback duration rather than
  // a step-index formula that was never wired to the real interval.
  const WS_STEP_MS = 260;
  useEffect(() => {
    if (!wsPlaying) return;
    if (wsIndex >= steps.length - 1) {
      setWsPlaying(false);
      return;
    }
    const id = setTimeout(() => {
      setWsIndex((i) => Math.min(i + 1, steps.length - 1));
      setElapsedMs((ms) => ms + WS_STEP_MS);
    }, WS_STEP_MS);
    return () => clearTimeout(id);
  }, [wsPlaying, wsIndex, steps]);

  const cur = steps[Math.min(wsIndex, steps.length - 1)] || steps[0];
  const maxVal = Math.max(...cur.array, 1);
  const minVal = Math.min(...cur.array, 0);
  const barRange = maxVal - minVal || 1;
  const isRunnable = RUNNABLE_ALGORITHMS.has(selected);
  const isSearchSelected = isSearchAlgorithm(selected);

  const filteredAlgos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALGORITHMS.filter(
      (a) => (category === "All" || a.category === category) && (!q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)),
    );
  }, [category, query]);
  const visibleAlgos = showAll ? filteredAlgos : filteredAlgos.slice(0, 10);
  const visibleRecent = showAllRecent ? recentlyUsed : recentlyUsed.slice(0, 5);

  const formatRelativeTime = (ts) => {
    const diffSec = Math.max(0, Math.round((now - ts) / 1000));
    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.round(diffMin / 60);
    return `${diffHr}h ago`;
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(CODE[lang]);
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1600);
  };

  const explainNextStep = () => {
    setWsPlaying(false);
    setWsIndex((i) => Math.min(i + 1, steps.length - 1));
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
                { icon: Layers, top: String(ALGORITHMS.length), sub: "Algorithms" },
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
                {/* Divide phase */}
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
                  <ChevronsRight className="w-3 h-3 rotate-90" /> Divide
                </div>
                <div className="apo-scroll mt-2 space-y-2 overflow-x-auto pb-1">
                  {TREE_LEVELS.map((level, li) => (
                    <div key={li} className="flex items-center justify-center gap-2.5">
                      {level.map((group, gi) => (
                        <div key={gi} className="flex gap-0.5 rounded-lg border border-blue-500/15 bg-blue-500/5 p-1">
                          {group.map((v, vi) => (
                            <span key={vi} className="grid h-6 min-w-6 place-items-center rounded-md bg-blue-500/10 px-1 text-[10.5px] font-semibold text-blue-600 dark:text-blue-300">
                              {v}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Merge phase */}
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
                  <ChevronsRight className="w-3 h-3 -rotate-90" /> Merge
                </div>
                <div className="apo-scroll mt-2 overflow-x-auto pb-1">
                  <div className="flex items-center justify-center gap-1">
                    {SORTED_SAMPLE.map((v, i) => {
                      const revealed = Math.round((heroStep / HERO_TOTAL) * SORTED_SAMPLE.length);
                      const isCurrent = i === revealed - 1;
                      const isMerged = i < revealed;
                      return (
                        <span
                          key={i}
                          className={`grid h-8 min-w-8 place-items-center rounded-md px-1 text-[12px] font-bold transition-all duration-200 ${
                            isCurrent
                              ? "scale-110 bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30"
                              : isMerged
                                ? "bg-blue-600 text-white"
                                : "bg-(--muted)/60 text-(--muted-foreground)"
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
                    <button
                      onClick={copyCode}
                      aria-label={copied ? "Code copied" : "Copy code"}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-(--muted-foreground) hover:bg-(--muted)/60 hover:text-(--foreground)"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
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
                  onClick={() => selectAlgorithm(a.name)}
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
            {recentlyUsed.length === 0 ? (
              <p className="mt-2 text-[12px] leading-relaxed text-(--muted-foreground)">
                Algorithms you pick below will show up here.
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                {visibleRecent.map((r, i) => (
                  <button
                    key={r.name}
                    onClick={() => selectAlgorithm(r.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                      i === 0 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "hover:bg-(--muted)/60 text-(--foreground)"
                    }`}
                  >
                    <span className="text-[13px] font-medium">{r.name}</span>
                    <span className="text-[11px] text-(--muted-foreground)">{formatRelativeTime(r.at)}</span>
                  </button>
                ))}
              </div>
            )}
            {recentlyUsed.length > 5 && (
              <button
                onClick={() => setShowAllRecent((v) => !v)}
                className="mt-3 w-full rounded-xl border border-(--border) py-2 text-[12px] font-medium text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/60"
              >
                {showAllRecent ? "Show Less" : "View All History"}
              </button>
            )}
          </div>

          {/* custom input + chart */}
          <div className="rounded-2xl border border-(--border) bg-(--card) p-5 lg:col-span-6">
            <h3 className="text-[15px] font-bold text-(--foreground)">Custom Input</h3>
            <p className="mt-1 text-[12px] text-(--muted-foreground)">
              {!isRunnable
                ? `${selected} isn't animated in this array playground yet — pick a sorting or search algorithm above to run it.`
                : isSearchSelected
                  ? "Enter your array and the target value to search for."
                  : "Enter your own array or generate random data to visualize."}
            </p>
            {selected === "Binary Search" ? (
              <p className="mt-1 text-[11px] text-(--muted-foreground)">
                Binary search needs sorted data, so the array below is sorted first.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && visualize()}
                placeholder="38, 27, 43, 3, 9, 82, 10"
                aria-label="Array to visualize"
                className="min-w-0 flex-1 rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 font-mono text-[13px] text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              {isSearchSelected ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-(--muted-foreground)">Target</span>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    aria-label="Target value to search for"
                    className="w-20 rounded-lg border border-(--border) bg-(--background) px-2 py-2 text-[13px] text-(--foreground) focus:outline-none"
                  />
                </div>
              ) : null}
              <button onClick={() => visualize()} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-blue-700">
                Visualize
              </button>
              <button onClick={randomize} className="inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2.5 text-[13px] font-medium text-(--foreground) hover:bg-(--muted)/60">
                <Shuffle className="w-3.5 h-3.5" aria-hidden="true" /> Random
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
            {cur.unsupported ? (
              <div className="mt-5 flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--muted)/30 p-4 text-center">
                <Info className="w-5 h-5 text-(--muted-foreground)" aria-hidden="true" />
                <p className="text-[13px] font-medium text-(--foreground)">{selected} needs graph or table input, not a flat array.</p>
                <p className="text-[12px] text-(--muted-foreground)">
                  This playground currently animates array-based algorithms — try Bubble Sort, Quick Sort, Linear Search or Binary Search instead.
                </p>
              </div>
            ) : (
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
                        style={{ height: `${((v - minVal) / barRange) * 94 + 6}%` }}
                      />
                      <span className="text-[9px] text-(--muted-foreground)">{i}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* playback + stats */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setWsPlaying((p) => !p)}
                disabled={cur.unsupported}
                aria-label={wsPlaying ? "Pause" : "Play"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {wsPlaying ? <Pause className="w-3.5 h-3.5" aria-hidden="true" /> : <Play className="w-3.5 h-3.5" aria-hidden="true" />}
              </button>
              <button
                onClick={() => setWsIndex((i) => Math.max(0, i - 1))}
                aria-label="Previous step"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"
              >
                <SkipBack className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => setWsIndex((i) => Math.min(steps.length - 1, i + 1))}
                aria-label="Next step"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"
              >
                <SkipForward className="w-4 h-4" aria-hidden="true" />
              </button>
              <input
                type="range"
                min="0"
                max={steps.length - 1}
                value={wsIndex}
                onChange={(e) => { setWsIndex(Number(e.target.value)); setWsPlaying(false); }}
                aria-label="Step position"
                className="flex-1 accent-blue-600"
              />
              <button
                onClick={() => { setWsIndex(0); setWsPlaying(false); setElapsedMs(0); }}
                aria-label="Reset to first step"
                className="inline-flex items-center gap-1 rounded-lg border border-(--border) px-2 py-1 text-[11px] font-medium text-(--muted-foreground) hover:text-(--foreground)"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-(--border) pt-4 sm:grid-cols-4">
              {[
                { icon: ArrowLeftRight, label: "Comparisons", value: cur.comparisons, accent: "text-amber-500" },
                { icon: ArrowUpDown, label: "Swaps", value: cur.swaps, accent: "text-blue-500" },
                { icon: ListOrdered, label: "Steps", value: `${wsIndex}/${steps.length - 1}`, accent: "text-violet-500" },
                { icon: Clock, label: "Time", value: `${(elapsedMs / 1000).toFixed(2)}s`, accent: "text-emerald-500" },
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
              This is <span className="font-semibold">{selected}</span>.{" "}
              {isRunnable
                ? "The algorithm follows these steps:"
                : "It follows these steps conceptually — this playground doesn't animate graph/table algorithms yet:"}
            </p>
            <ol className="mt-3 space-y-2">
              {(ALGO_EXPLANATIONS[selected] || []).map((t, i) => (
                <li key={i} className="flex gap-2 text-[12px] text-(--muted-foreground)">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <div className="mt-3 rounded-lg border border-(--border) bg-(--muted)/40 p-3 text-[12px] leading-relaxed text-(--muted-foreground)">
              {cur.unsupported
                ? `${selected} needs a graph or table input, so there is nothing to step through here yet.`
                : cur.done
                  ? isSearchSelected
                    ? cur.foundIndex >= 0
                      ? `Found the target at index ${cur.foundIndex}.`
                      : "Target not found — every element was checked."
                    : "Array fully sorted — every element is in its final position."
                  : cur.a >= 0
                    ? isSearchSelected
                      ? `Checking index ${cur.a} (value ${cur.array[cur.a]})${cur.found ? " — match!" : "."}`
                      : `At this step, comparing index ${cur.a}${cur.b >= 0 ? ` and ${cur.b}` : ""}${cur.didSwap ? " and swapping them." : "."}`
                    : "Press Visualize to start stepping through the algorithm."}
            </div>
            <button
              onClick={explainNextStep}
              disabled={cur.unsupported || wsIndex >= steps.length - 1}
              aria-label="Advance to the next step and explain it"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-(--border) py-2 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" /> Explain Next Step
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
