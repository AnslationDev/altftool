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
      type="checkbox"
      checked={ignoreWhitespace}
      onChange={(e) => setIgnoreWhitespace(e.target.checked)}
      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
    />
    <span className="text-sm text-[var(--muted-foreground)]">
      Ignore Whitespace
    </span>
  </div>

  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={ignoreCase}
      onChange={(e) => setIgnoreCase(e.target.checked)}
      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
    />
    <span className="text-sm text-[var(--muted-foreground)]">
      Ignore Case
    </span>
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition border ${
        viewMode === "split"
          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
          : "bg-[var(--card)] text-gray-600 border-[var(--border)] hover:bg-gray-100"
      }`}
    >
      <SquareSplitHorizontal size={18} />
      <span className="hidden sm:inline">Split View</span>
    </button>

    <button
      onClick={() => setViewMode("unified")}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition border ${
        viewMode === "unified"
          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
          : "bg-[var(--card)] text-gray-600 border-[var(--border)] hover:bg-gray-100"
      }`}
    >
      <Merge size={18} />
      <span className="hidden sm:inline">Unified View</span>
    </button>
  </div>

  {/* Action Buttons */}
  <button
    onClick={handleReset}
    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-gray-100 transition"
  >
    <RotateCcw className="w-4 h-4" /> Reset
  </button>

  <button
    onClick={handleDownload}
    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition"
  >
    <Download className="w-4 h-4" /> Download Diff
  </button>
</div>
);


export default DiffOptions;
