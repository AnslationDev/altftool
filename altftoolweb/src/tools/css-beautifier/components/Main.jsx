"use client";

import React, { useState, useCallback } from "react";
import {
  Layout,
  Play,
  RotateCcw,
  Sparkles,
  Copy,
  Download,
  Check,
  Sliders,
  Settings,
  HelpCircle,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

// Declaration-holding at-rules whose body contains property:value pairs
// rather than nested rule blocks (the inverse of things like @media/@supports
// /@keyframes, which hold rule-like children and must NOT get colon-spacing
// applied to their own selector-position colons, e.g. inside :not(), ::before).
const DECLARATION_AT_RULES = [
  "@font-face",
  "@page",
  "@property",
  "@counter-style",
  "@viewport",
  "@font-palette-values",
];

// Single-pass tokenizer/formatter. Walks the CSS character by character,
// tracking brace depth plus whether we're inside a string, a comment, or a
// url(...) literal, so structural whitespace/colon handling never touches
// protected content (strings, comments, url() bodies including data: URIs).
function formatCSS(css, indentSize = 2, spacingBetweenRules = true) {
  if (!css || !css.trim()) return "";

  const indentString = " ".repeat(indentSize);
  const src = css;
  const len = src.length;

  let result = "";
  let atLineStart = true;
  let depth = 0;
  // Context stack: one entry per open brace, "decl" (declarations expected,
  // e.g. a normal rule or @font-face) or "container" (nested rules expected,
  // e.g. @media/@supports/@keyframes).
  const stack = [];
  // "none": selector-position (colons must not be touched, e.g. :hover)
  // "propName": next colon is the property:value separator, add a space
  // "value": already past that colon for the current declaration
  let declState = "none";
  // Accumulates the raw text seen since the last {, }, or ; so that, right
  // before an opening brace, we can inspect it to detect at-rules.
  let curToken = "";

  function write(str) {
    if (!str) return;
    if (atLineStart) {
      result += indentString.repeat(depth);
      atLineStart = false;
    }
    result += str;
  }

  function newline() {
    result = result.replace(/[ \t]+$/, "");
    result += "\n";
    atLineStart = true;
  }

  let i = 0;
  while (i < len) {
    const ch = src[i];

    // Block comments: kept verbatim, pushed onto their own line.
    if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? len : end + 2;
      const comment = src.slice(i, commentEnd);
      write(comment);
      newline();
      curToken += comment;
      i = commentEnd;
      while (i < len && /\s/.test(src[i])) i++;
      continue;
    }

    // Quoted strings: copied verbatim, colons/semicolons/commas inside never
    // get restructured.
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < len && src[j] !== quote) {
        if (src[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, len);
      const tok = src.slice(i, j);
      write(tok);
      curToken += tok;
      i = j;
      continue;
    }

    // url(...) literals (including data: URIs): treated as an opaque token
    // so colons/semicolons/commas inside are never touched.
    if ((ch === "u" || ch === "U") && /^url\(/i.test(src.slice(i, i + 4))) {
      const prevChar = i > 0 ? src[i - 1] : "";
      if (!/[A-Za-z0-9_-]/.test(prevChar)) {
        let j = i + 4;
        let parenDepth = 1;
        while (j < len && parenDepth > 0) {
          if (src[j] === '"' || src[j] === "'") {
            const q = src[j];
            j++;
            while (j < len && src[j] !== q) {
              if (src[j] === "\\") j++;
              j++;
            }
            j++;
          } else {
            if (src[j] === "(") parenDepth++;
            else if (src[j] === ")") parenDepth--;
            j++;
          }
        }
        const tok = src.slice(i, j);
        write(tok);
        curToken += tok;
        i = j;
        continue;
      }
    }

    if (ch === "{") {
      result = result.replace(/[ \t]+$/, "");
      write(" {");
      newline();
      const trimmedSel = curToken.trim().toLowerCase();
      const isAtRule = trimmedSel.startsWith("@");
      const isDeclHolder = DECLARATION_AT_RULES.some((p) => trimmedSel.startsWith(p));
      const context = isAtRule && !isDeclHolder ? "container" : "decl";
      stack.push(context);
      depth++;
      declState = context === "decl" ? "propName" : "none";
      curToken = "";
      i++;
      while (i < len && /\s/.test(src[i])) i++;
      continue;
    }

    if (ch === "}") {
      result = result.replace(/[ \t]+$/, "");
      if (!atLineStart) newline();
      stack.pop();
      depth = Math.max(0, depth - 1);
      write("}");
      newline();
      declState = stack.length > 0 && stack[stack.length - 1] === "decl" ? "propName" : "none";
      curToken = "";
      i++;
      while (i < len && /\s/.test(src[i])) i++;
      if (spacingBetweenRules && depth === 0 && i < len) {
        newline();
      }
      continue;
    }

    if (ch === ";") {
      result = result.replace(/[ \t]+$/, "");
      write(";");
      newline();
      declState = depth > 0 && stack[stack.length - 1] === "decl" ? "propName" : "none";
      curToken = "";
      i++;
      while (i < len && /\s/.test(src[i])) i++;
      continue;
    }

    if (ch === ":") {
      curToken += ":";
      i++;
      if (declState === "propName" && depth > 0) {
        result = result.replace(/[ \t]+$/, "");
        write(": ");
        declState = "value";
        // We already wrote the canonical single space, so skip past any
        // spacing the source had of its own to avoid doubling it up.
        while (i < len && /[ \t]/.test(src[i])) i++;
      } else {
        write(":");
        // Selector-position colon (:hover, ::before, :not(), or a colon
        // inside e.g. @media (...) parens) — leave any following
        // whitespace for the normal whitespace handler to preserve as-is.
      }
      continue;
    }

    if (ch === ",") {
      result = result.replace(/[ \t]+$/, "");
      write(", ");
      curToken += ",";
      i++;
      while (i < len && /[ \t]/.test(src[i])) i++;
      continue;
    }

    if (/\s/.test(ch)) {
      let j = i;
      while (j < len && /\s/.test(src[j])) j++;
      if (!atLineStart) {
        write(" ");
        curToken += " ";
      }
      i = j;
      continue;
    }

    write(ch);
    curToken += ch;
    i++;
  }

  return result.trim();
}

export default function MainComponent() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [ruleSpacing, setRuleSpacing] = useState(true);

  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadSample = () => {
    const sample = `/* Messy CSS Sample */
body{margin:0;padding:0;font-family:sans-serif;background-color:#f4f4f4;}
.container{max-width:1200px;margin:0 auto;padding:20px;}
@media (max-width: 768px){.container{padding:10px;}body{font-size:14px;}}
h1{color:#333;font-size:2rem;margin-bottom:10px;}`;
    setInput(sample);
    setOutput("");
    setError("");
    setSuccess("Sample CSS code loaded.");
  };

  const handleBeautify = () => {
    setError("");
    setSuccess("");
    if (!input.trim()) {
      setError("Please paste some CSS code to format.");
      return;
    }

    try {
      const formatted = formatCSS(input, indentSize, ruleSpacing);
      setOutput(formatted);
      setSuccess("CSS beautified successfully!");
    } catch (err) {
      setError(`Failed to beautify CSS: ${err.message}`);
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
    a.download = "styles.beautified.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess("File downloaded successfully!");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Layout className="h-8 w-8 text-teal-500 shrink-0" /> CSS Beautifier
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Format, organize, and pretty-print messy or minified CSS code instantly in your browser.
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

      {/* Input panel */}
      <div className="space-y-6">
        
        <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-(--border) pb-3 flex-wrap gap-2">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-sm uppercase tracking-wider">
              Input CSS Code
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
            placeholder="Paste your unformatted or minified CSS here..."
            className="w-full h-56 bg-(--page) border border-(--border) text-(--foreground) text-xs sm:text-sm rounded-lg p-4 outline-none focus:border-teal-500 font-mono resize-y shadow-inner"
          />
        </div>

        {/* Configuration settings (revealed progressive disclosure) */}
        {input.trim().length > 0 && (
          <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4 animate-fade-in">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-xs uppercase tracking-wider border-b border-(--border) pb-3">
              <Settings className="h-4 w-4 text-teal-500" /> Formatting Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Indentation size */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Indentation Size
                </label>
                <div className="flex gap-2">
                  {[2, 4, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => setIndentSize(size)}
                      className={`flex-1 py-1.5 text-xs font-semibold border rounded cursor-pointer transition-all ${
                        indentSize === size
                          ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                          : "border-(--border) hover:border-slate-400 text-slate-600"
                      }`}
                    >
                      {size} Spaces
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector spacing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Selector Spacing
                </label>
                <button
                  onClick={() => setRuleSpacing(!ruleSpacing)}
                  className={`w-full py-1.5 text-xs font-semibold border rounded cursor-pointer transition-all ${
                    ruleSpacing
                      ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      : "border-(--border) hover:border-slate-400 text-slate-600"
                  }`}
                >
                  {ruleSpacing ? "Add blank lines between rules" : "Keep rules compact"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Action triggers */}
        <div className="flex justify-between items-center flex-wrap gap-4 bg-(--surface) border border-(--border) p-4 rounded-xl shadow-sm">
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-4 py-2 border border-(--border) hover:border-red-500 rounded-lg text-xs font-semibold text-red-500 bg-(--page) cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear Input
          </button>

          <button
            onClick={handleBeautify}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Play className="h-4 w-4" /> Beautify CSS Code
          </button>
        </div>

        {/* Output Panel */}
        {output && (
          <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-(--border) pb-3 flex-wrap gap-2">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-sm uppercase tracking-wider">
                Beautified CSS Code
              </h3>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download (.css)
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
              className="w-full h-72 bg-slate-900 border border-slate-800 text-slate-300 text-xs sm:text-sm rounded-lg p-4 outline-none font-mono resize-y"
            />
          </div>
        )}

      </div>

    </div>
  );
}
