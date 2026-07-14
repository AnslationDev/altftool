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

function formatCSS(css, indentSize = 2, spacingBetweenRules = true) {
  if (!css || !css.trim()) return "";
  
  const indentString = " ".repeat(indentSize);
  
  // Basic token cleaning around special characters
  let clean = css
    .replace(/\s*([\{\};,])\s*/g, "$1") // Clear spacing around braces, semicolons, commas
    .replace(/;\s*}/g, "}") // Fix trailing semicolon within braces
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m + "\n") // Clean comments
    .replace(/\s*{\s*/g, " {\n") // Place open braces on new lines
    .replace(/;\s*/g, ";\n") // Semicolons on new lines
    .replace(/,\s*/g, ", ") // Spacing after commas
    .replace(/:\s*/g, ": "); // Spacing after colons

  const lines = clean.split("\n");
  const formattedLines = [];
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Adjust indentation level for closing brackets
    if (line.includes("}")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add line with current indentation
    formattedLines.push(indentString.repeat(indentLevel) + line);

    // Adjust indentation level for opening brackets
    if (line.includes("{")) {
      indentLevel++;
    }

    // Add spacer between rules if configured
    if (spacingBetweenRules && line.includes("}") && indentLevel === 0) {
      formattedLines.push("");
    }
  }

  return formattedLines.join("\n").trim();
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
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
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
