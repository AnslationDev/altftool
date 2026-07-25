"use client";

// src/components/DiffChecker/DiffOptions.jsx
import { RotateCcw, Download, SquareSplitHorizontal, Merge  } from "lucide-react";
import ExplainChanges from "./ExplainChanges";
import DiffModeToggle from "./DiffModeToggle";
import IgnorePatternsDropdown from "./IgnorePatternsDropDown";
// import {useState} from "react";

// const [mode, setMode] = useState("line");

const DiffOptions = ({
  mode,
  setMode,
  diff,
  ignoreWhitespace,
  setIgnoreWhitespace,
  ignoreCase,
  setIgnoreCase,
  viewMode,
  setViewMode,
  handleReset,
  handleDownload,
  ignorePatterns, setIgnorePatterns
}) => 
  (
  <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-[var(--border)]">

  {/* Checkboxes */}
  <div className="flex items-center gap-2">
    <input
      id="diff-ignore-whitespace"
      type="checkbox"
      checked={ignoreWhitespace}
      onChange={(e) => setIgnoreWhitespace(e.target.checked)}
      className="w-4 h-4 accent-[var(--primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
    />
    <label htmlFor="diff-ignore-whitespace" className="text-sm text-[var(--muted-foreground)] cursor-pointer">
      Ignore Whitespace
    </label>
  </div>

  <div className="flex items-center gap-2">
    <input
      id="diff-ignore-case"
      type="checkbox"
      checked={ignoreCase}
      onChange={(e) => setIgnoreCase(e.target.checked)}
      className="w-4 h-4 accent-[var(--primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
    />
    <label htmlFor="diff-ignore-case" className="text-sm text-[var(--muted-foreground)] cursor-pointer">
      Ignore Case
    </label>
  </div>

  <DiffModeToggle mode={mode} setMode={setMode} />
  <IgnorePatternsDropdown
    ignorePatterns={ignorePatterns}
    setIgnorePatterns={setIgnorePatterns}
  />

  {/* Right Controls */}
  <div className="flex gap-2 ml-auto items-center">

    <ExplainChanges diff={diff} />

    <button
      onClick={() => setViewMode("split")}
      aria-label="Split view"
      aria-pressed={viewMode === "split"}
      className={`flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg text-sm transition border active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
        viewMode === "split"
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
          : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
      }`}
    >
      <SquareSplitHorizontal size={18} />
      <span className="hidden sm:inline">Split View</span>
    </button>

    <button
      onClick={() => setViewMode("unified")}
      aria-label="Unified view"
      aria-pressed={viewMode === "unified"}
      className={`flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg text-sm transition border active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
        viewMode === "unified"
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
          : "bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--muted)]"
      }`}
    >
      <Merge size={18} />
      <span className="hidden sm:inline">Unified View</span>
    </button>
  </div>

  {/* Action Buttons */}
  <button
    onClick={handleReset}
    aria-label="Reset both text inputs"
    className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
  >
    <RotateCcw className="w-4 h-4" /> Reset
  </button>

  <button
    onClick={handleDownload}
    aria-label="Download diff as text file"
    className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
  >
    <Download className="w-4 h-4" /> Download Diff
  </button>
</div>
);


export default DiffOptions;
