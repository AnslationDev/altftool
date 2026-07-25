"use client";

// src/components/DiffChecker/DiffInputs.jsx
import { Copy } from "lucide-react";
import {useState} from "react";
import DiffModeToggle from "./DiffModeToggle";

const DiffInputs = ({
  originalText,
  setOriginalText,
  modifiedText,
  setModifiedText,
}) => {
  const [copiedSide, setCopiedSide] = useState("");

  const handleCopy = async (side, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(""), 1200);
    } catch {
      setCopiedSide("");
    }
  };

  const [mode, setMode] = useState("line");

  const textareaClass =
    "w-full h-48 p-3 border border-(--border) rounded-lg font-mono text-sm transition outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 motion-reduce:transition-none";
  const copyClass =
    "mt-2 min-h-11 text-sm text-(--primary) flex items-center gap-1 cursor-pointer rounded-lg px-2 transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label htmlFor="diff-original-text" className="block content mb-2">
          Original Text
        </label>
        <textarea
          id="diff-original-text"
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Paste original content here..."
          className={textareaClass}
        />
        <button
          onClick={() => handleCopy("original", originalText)}
          aria-label="Copy original text to clipboard"
          className={copyClass}
        >
          <Copy className="w-4 h-4" /> {copiedSide === "original" ? "Copied!" : "Copy"}
        </button>
      </div>

      <div>
        <label htmlFor="diff-modified-text" className="block content mb-2">
          Modified Text
        </label>
        <textarea
          id="diff-modified-text"
          value={modifiedText}
          onChange={(e) => setModifiedText(e.target.value)}
          placeholder="Paste modified content here..."
          className={textareaClass}
        />
        <button
          onClick={() => handleCopy("modified", modifiedText)}
          aria-label="Copy modified text to clipboard"
          className={copyClass}
        >
          <Copy className="w-4 h-4" /> {copiedSide === "modified" ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default DiffInputs;
