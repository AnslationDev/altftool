"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Columns,
  Upload,
  Globe,
  RefreshCw,
  FileText,
  AlertCircle,
  Check,
  Trash2,
  Sliders,
  Copy,
  Info,
  Maximize2,
  Sparkles,
} from "lucide-react";

// LCS-based Diff Alignment Algorithm
function diffLines(linesA, linesB) {
  const n = linesA.length;
  const m = linesB.length;
  const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n, j = m;
  const diff = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      diff.unshift({ type: "equal", valA: linesA[i - 1], valB: linesB[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: "added", valA: "", valB: linesB[j - 1] });
      j--;
    } else {
      diff.unshift({ type: "removed", valA: linesA[i - 1], valB: "" });
      i--;
    }
  }
  return diff;
}

export default function MainComponent() {
  const [jsonA, setJsonA] = useState("");
  const [jsonB, setJsonB] = useState("");

  // URL fetch fields
  const [urlA, setUrlA] = useState("");
  const [urlB, setUrlB] = useState("");

  const [diffResult, setDiffResult] = useState([]);
  const [stats, setStats] = useState({ added: 0, removed: 0, total: 0 });
  const [isCompared, setIsCompared] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFetchingA, setIsFetchingA] = useState(false);
  const [isFetchingB, setIsFetchingB] = useState(false);

  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);

  // Sync scroll listeners
  useEffect(() => {
    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;
    if (!leftEl || !rightEl) return;

    const handleLeftScroll = () => {
      if (rightEl.scrollTop !== leftEl.scrollTop) {
        rightEl.scrollTop = leftEl.scrollTop;
      }
    };

    const handleRightScroll = () => {
      if (leftEl.scrollTop !== rightEl.scrollTop) {
        leftEl.scrollTop = rightEl.scrollTop;
      }
    };

    leftEl.addEventListener("scroll", handleLeftScroll);
    rightEl.addEventListener("scroll", handleRightScroll);

    return () => {
      leftEl.removeEventListener("scroll", handleLeftScroll);
      rightEl.removeEventListener("scroll", handleRightScroll);
    };
  }, [diffResult]);

  const loadSample = () => {
    const a = {
      name: "Altftool suite",
      version: "1.2.0",
      active: true,
      features: ["conversion", "media", "utilities"],
      author: { name: "Developer Team", year: 2026 }
    };
    const b = {
      name: "Altftool suite",
      version: "1.3.0",
      active: false,
      features: ["conversion", "media", "utilities", "developer-helpers"],
      author: { name: "Developer Team" }
    };
    setJsonA(JSON.stringify(a, null, 2));
    setJsonB(JSON.stringify(b, null, 2));
    setIsCompared(false);
    setError("");
    setSuccess("Sample JSON data loaded in Left and Right panels.");
  };

  const handleFetchA = async () => {
    if (!urlA) return;
    setIsFetchingA(true);
    setError("");
    try {
      const res = await fetch(urlA);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      setJsonA(JSON.stringify(json, null, 2));
      setSuccess("Fetched JSON A successfully!");
    } catch (err) {
      setError(`Failed to fetch from URL A: ${err.message}`);
    } finally {
      setIsFetchingA(false);
    }
  };

  const handleFetchB = async () => {
    if (!urlB) return;
    setIsFetchingB(true);
    setError("");
    try {
      const res = await fetch(urlB);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      setJsonB(JSON.stringify(json, null, 2));
      setSuccess("Fetched JSON B successfully!");
    } catch (err) {
      setError(`Failed to fetch from URL B: ${err.message}`);
    } finally {
      setIsFetchingB(false);
    }
  };

  const handleUploadA = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setJsonA(JSON.stringify(json, null, 2));
        setSuccess("Loaded JSON A from file!");
      } catch (err) {
        setError(`Failed to parse file A: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleUploadB = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setJsonB(JSON.stringify(json, null, 2));
        setSuccess("Loaded JSON B from file!");
      } catch (err) {
        setError(`Failed to parse file B: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCompare = () => {
    setError("");
    setSuccess("");
    setDiffResult([]);

    if (!jsonA.trim() || !jsonB.trim()) {
      setError("Please fill out both JSON inputs to execute comparison.");
      return;
    }

    let parsedA, parsedB;

    try {
      parsedA = JSON.parse(jsonA);
    } catch (err) {
      setError(`Invalid JSON inside Panel A: ${err.message}`);
      return;
    }

    try {
      parsedB = JSON.parse(jsonB);
    } catch (err) {
      setError(`Invalid JSON inside Panel B: ${err.message}`);
      return;
    }

    // Format both JSON arrays pretty-printed
    const linesA = JSON.stringify(parsedA, null, 2).split("\n");
    const linesB = JSON.stringify(parsedB, null, 2).split("\n");

    const diff = diffLines(linesA, linesB);

    let added = 0;
    let removed = 0;
    diff.forEach((line) => {
      if (line.type === "added") added++;
      if (line.type === "removed") removed++;
    });

    setDiffResult(diff);
    setStats({ added, removed, total: diff.length });
    setIsCompared(true);
    setSuccess("JSON structures compared successfully!");
  };

  const clearAll = () => {
    setJsonA("");
    setJsonB("");
    setUrlA("");
    setUrlB("");
    setDiffResult([]);
    setIsCompared(false);
    setError("");
    setSuccess("");
  };

  // Compile line counter helper
  let lineA = 0;
  let lineB = 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Columns className="h-8 w-8 text-teal-500 shrink-0" /> JSON Compare
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Compare two JSON streams side-by-side. Paste raw snippets, upload local files, or query remote JSON APIs.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Double Column Input Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Input: JSON A */}
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-(--border) pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-teal-500" /> JSON Document A (Left)
            </h3>
            
            <div className="flex gap-2">
              <input
                ref={fileInputARef}
                type="file"
                accept=".json"
                onChange={handleUploadA}
                className="hidden"
              />
              <button
                onClick={() => fileInputARef.current.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" /> Upload JSON
              </button>
            </div>
          </div>

          {/* URL fetch field */}
          <div className="flex gap-2">
            <input
              type="text"
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              placeholder="Paste JSON API URL to load (CORS enabled)..."
              className="flex-1 px-3 py-1.5 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded outline-none focus:border-teal-500"
            />
            <button
              onClick={handleFetchA}
              disabled={isFetchingA}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isFetchingA ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Fetch"}
            </button>
          </div>

          <textarea
            value={jsonA}
            onChange={(e) => {
              setJsonA(e.target.value);
              setIsCompared(false);
            }}
            placeholder="Paste your original JSON object here..."
            className="w-full h-72 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-3 outline-none focus:border-teal-500 font-mono resize-none shadow-inner"
          />
        </div>

        {/* Right Input: JSON B */}
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-(--border) pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
              <FileText className="h-4.5 w-4.5 text-teal-500" /> JSON Document B (Right)
            </h3>
            
            <div className="flex gap-2">
              <input
                ref={fileInputBRef}
                type="file"
                accept=".json"
                onChange={handleUploadB}
                className="hidden"
              />
              <button
                onClick={() => fileInputBRef.current.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" /> Upload JSON
              </button>
            </div>
          </div>

          {/* URL fetch field */}
          <div className="flex gap-2">
            <input
              type="text"
              value={urlB}
              onChange={(e) => setUrlB(e.target.value)}
              placeholder="Paste JSON API URL to load (CORS enabled)..."
              className="flex-1 px-3 py-1.5 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded outline-none focus:border-teal-500"
            />
            <button
              onClick={handleFetchB}
              disabled={isFetchingB}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isFetchingB ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Fetch"}
            </button>
          </div>

          <textarea
            value={jsonB}
            onChange={(e) => {
              setJsonB(e.target.value);
              setIsCompared(false);
            }}
            placeholder="Paste your modified JSON object here..."
            className="w-full h-72 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-3 outline-none focus:border-teal-500 font-mono resize-none shadow-inner"
          />
        </div>

      </div>

      {/* Action panel triggers */}
      <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-5 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <button
          onClick={loadSample}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-(--border) hover:border-teal-500 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) cursor-pointer"
        >
          <Sparkles className="h-4 w-4" /> Load Sample JSON
        </button>

        <div className="flex gap-3">
          {isCompared && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 px-4 py-2 border border-(--border) hover:border-red-500 rounded-lg text-xs font-semibold text-red-500 bg-(--page) cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </button>
          )}
          <button
            onClick={handleCompare}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Columns className="h-4.5 w-4.5 animate-pulse" /> Compare JSON Documents
          </button>
        </div>
      </div>

      {/* Diff Result Showcase */}
      {isCompared && (
        <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-6 animate-fade-in">
          
          {/* Comparison summary stats */}
          <div className="flex flex-wrap gap-6 items-center justify-between border-b border-(--border) pb-3">
            <h3 className="font-bold text-(--foreground) flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-teal-500" /> Comparison Result
            </h3>

            <div className="flex gap-4 text-xs font-bold">
              <span className="text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded">Added lines: {stats.added}</span>
              <span className="text-red-500 bg-red-500/10 px-2.5 py-1 rounded">Removed lines: {stats.removed}</span>
              {stats.added === 0 && stats.removed === 0 && (
                <span className="text-teal-600 bg-teal-500/10 px-2.5 py-1 rounded">Both documents match 100%!</span>
              )}
            </div>
          </div>

          {/* Synchronized scroll side-by-side list */}
          <div className="grid grid-cols-2 gap-4 border border-(--border) rounded-lg overflow-hidden bg-slate-900 font-mono text-[10px] sm:text-xs">
            
            {/* Left diff column (JSON A - Removed) */}
            <div
              ref={leftScrollRef}
              className="h-[400px] overflow-y-auto border-r border-slate-800 py-3 scrollbar-thin select-none"
            >
              {diffResult.map((line, idx) => {
                const isPlaceholder = line.type === "added";
                if (!isPlaceholder) lineA++;
                const isRemoved = line.type === "removed";
                
                return (
                  <div
                    key={idx}
                    className={`flex items-start min-h-[1.5rem] w-full px-3 ${
                      isRemoved ? "bg-red-900/40 text-red-300" : isPlaceholder ? "opacity-20" : "text-slate-300"
                    }`}
                  >
                    <span className="w-10 text-right text-slate-500 mr-4 select-none pr-1">
                      {!isPlaceholder ? lineA : ""}
                    </span>
                    <pre className="whitespace-pre-wrap flex-1 break-all">{line.valA || (isPlaceholder ? "~" : "")}</pre>
                  </div>
                );
              })}
            </div>

            {/* Right diff column (JSON B - Added) */}
            <div
              ref={rightScrollRef}
              className="h-[400px] overflow-y-auto py-3 scrollbar-thin select-none"
            >
              {diffResult.map((line, idx) => {
                const isPlaceholder = line.type === "removed";
                if (!isPlaceholder) lineB++;
                const isAdded = line.type === "added";

                return (
                  <div
                    key={idx}
                    className={`flex items-start min-h-[1.5rem] w-full px-3 ${
                      isAdded ? "bg-emerald-950/40 text-emerald-300" : isPlaceholder ? "opacity-20" : "text-slate-300"
                    }`}
                  >
                    <span className="w-10 text-right text-slate-500 mr-4 select-none pr-1">
                      {!isPlaceholder ? lineB : ""}
                    </span>
                    <pre className="whitespace-pre-wrap flex-1 break-all">{line.valB || (isPlaceholder ? "~" : "")}</pre>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
