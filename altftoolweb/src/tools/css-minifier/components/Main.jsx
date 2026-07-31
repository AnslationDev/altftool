"use client";

import React, { useState } from "react";
import {
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Copy,
  Download,
  Check,
  Settings,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function compressCSS(css, preserveImportantComments = true) {
  if (!css || !css.trim()) return "";

  let minified = css;

  // Protect quoted string literals (content values, url(), attr selectors,
  // etc.) before anything else touches the text, so comment-stripping and
  // whitespace-collapse can never reach inside them and corrupt the literal
  // value the author wrote (e.g. content: "/* not a comment */" or a
  // comma/space-sensitive string like content: "Hello,  World").
  const strings = [];
  minified = minified.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, (match) => {
    strings.push(match);
    return `___STRING_PLACEHOLDER_${strings.length - 1}___`;
  });

  if (preserveImportantComments) {
    // Temporarily replace important comments starting with /*! with placeholders
    const placeholders = [];
    minified = minified.replace(/\/\*!([\s\S]*?)\*\//g, (match) => {
      placeholders.push(match);
      return `___COMMENT_PLACEHOLDER_${placeholders.length - 1}___`;
    });

    // Strip general comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, "");

    // Compress whitespace rules
    minified = minified
      .replace(/\s+/g, " ")
      .replace(/\s*([\{\};,])\s*/g, "$1")
      .replace(/;\}/g, "}");

    // Restore placeholders. The surrounding whitespace-collapse pass above
    // already normalised whatever separator (if any) originally followed the
    // comment, so the comment text itself is restored verbatim — no forced
    // newline, which previously made output larger than the input and left
    // a stray extra space before the next token.
    placeholders.forEach((comment, index) => {
      minified = minified.replace(`___COMMENT_PLACEHOLDER_${index}___`, () => comment);
    });
  } else {
    // Strip all comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, "");

    // Compress whitespace rules
    minified = minified
      .replace(/\s+/g, " ")
      .replace(/\s*([\{\};,])\s*/g, "$1")
      .replace(/;\}/g, "}");
  }

  // Restore quoted string literals verbatim, exactly as written.
  strings.forEach((str, index) => {
    minified = minified.replace(`___STRING_PLACEHOLDER_${index}___`, () => str);
  });

  return minified.trim();
}

export default function MainComponent() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [preserveComments, setPreserveComments] = useState(true);

  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadSample = () => {
    if (
      input.trim() &&
      !window.confirm("Load the sample CSS? This will replace your current input and cannot be undone.")
    ) {
      return;
    }
    const sample = `/*!
 * Custom CSS Framework License
 * (c) 2026 Developer Team
 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Outfit', sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
}

.card {
  border-radius: 12px;
  background-color: #1e293b;
  border: 1px solid #334155;
  padding: 24px;
  margin-bottom: 16px;
}`;
    setInput(sample);
    setOutput("");
    setStats(null);
    setError("");
    setSuccess("Sample CSS loaded into the input workspace.");
  };

  const handleMinify = () => {
    setError("");
    setSuccess("");
    if (!input.trim()) {
      setError("Please paste stylesheet code to execute compression.");
      return;
    }

    try {
      const minified = compressCSS(input, preserveComments);
      setOutput(minified);

      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const bytesSaved = Math.max(0, originalSize - minifiedSize);
      const ratio = originalSize > 0 ? ((bytesSaved / originalSize) * 100).toFixed(1) : 0;

      setStats({
        original: originalSize,
        minified: minifiedSize,
        saved: bytesSaved,
        ratio: ratio,
      });

      setSuccess("CSS minified successfully!");
    } catch (err) {
      setError(`Compression error: ${err.message}`);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    const ok = await safeCopyText(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "styles.min.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess("Compressed CSS file downloaded.");
  };

  const handleClear = () => {
    if (
      (input.trim() || output.trim()) &&
      !window.confirm("Clear the input and output? This cannot be undone.")
    ) {
      return;
    }
    setInput("");
    setOutput("");
    setStats(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Zap className="h-8 w-8 text-teal-500 shrink-0 animate-pulse" /> CSS Minifier
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Compress stylesheet definitions and remove redundant spaces to optimize asset delivery size.
        </p>
      </div>

      {/* Notifications */}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm"
        >
          {success}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm"
        >
          {error}
        </div>
      )}

      {/* Input Form */}
      <div className="space-y-6">
        
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-(--border) pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-sm uppercase tracking-wider">
              Paste CSS Stylesheet
            </h3>
            <button
              onClick={loadSample}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" /> Load Sample CSS
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste raw or verbose CSS code here..."
            className="w-full h-56 bg-(--page) border border-(--border) text-(--foreground) text-xs sm:text-sm rounded-lg p-4 outline-none focus:border-teal-500 font-mono resize-y shadow-inner"
          />
        </div>

        {/* Configuration settings (revealed progressive disclosure) */}
        {input.trim().length > 0 && (
          <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4 animate-fade-in">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-xs uppercase tracking-wider border-b border-(--border) pb-3">
              <Settings className="h-4 w-4 text-teal-500" /> Compression Options
            </h3>

            <div>
              <button
                onClick={() => setPreserveComments(!preserveComments)}
                className={`w-full md:w-auto px-6 py-2 text-xs font-semibold border rounded cursor-pointer transition-all ${
                  preserveComments
                    ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    : "border-(--border) hover:border-slate-400 text-slate-600"
                }`}
              >
                {preserveComments ? "Preserve important license comments (/*! ... */)" : "Discard all comments"}
              </button>
            </div>
          </div>
        )}

        {/* Action Triggers */}
        <div className="flex justify-between items-center flex-wrap gap-4 bg-(--surface) border border-(--border) p-4 rounded-xl shadow-sm">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-4 py-2 border border-(--border) hover:border-red-500 rounded-lg text-xs font-semibold text-red-500 bg-(--page) cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear Input
          </button>

          <button
            onClick={handleMinify}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Play className="h-4 w-4" /> Minify CSS Code
          </button>
        </div>

        {/* Statistics Metric Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            
            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Original Size</span>
              <span className="text-lg font-extrabold text-(--foreground)">{formatBytes(stats.original)}</span>
            </div>

            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Minified Size</span>
              <span className="text-lg font-extrabold text-teal-500">{formatBytes(stats.minified)}</span>
            </div>

            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bytes Saved</span>
              <span className="text-lg font-extrabold text-emerald-600">{formatBytes(stats.saved)}</span>
            </div>

            <div className="bg-(--surface) p-4 rounded-xl border border-(--border) shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Savings Ratio</span>
              <span className="text-lg font-extrabold text-emerald-600">{stats.ratio}%</span>
            </div>

          </div>
        )}

        {/* Output Panel */}
        {output && (
          <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-(--border) pb-3 flex-wrap gap-2">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-sm uppercase tracking-wider">
                Minified CSS Code
              </h3>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download (.min.css)
                </button>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={output}
              className="w-full h-40 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-4 outline-none font-mono resize-y shadow-inner"
            />
          </div>
        )}

      </div>

    </div>
  );
}
