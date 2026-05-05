"use client";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  SpellCheck,
  Copy,
  RotateCcw,
} from "lucide-react";
import Header from "./Header";
import Features from "./Features";
// import FAQSection from "./components/FAQs";

export default function MainComponent() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [copied, setCopied] = useState(false);

  const applySuggestion = (offset, length, suggestion) => {
    const before = text.slice(0, offset);
    const after = text.slice(offset + length);
    const newText = before + suggestion + after;
    setText(newText);
    setErrors([]);
  };

  const checkSpelling = async () => {
    if (!text.trim()) {
      setErrors([]);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text,
          language: "en-US",
        }),
      });

      const data = await res.json();
      setErrors(data.matches || []);
    } catch (err) {
      console.error("API Error:", err);
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setText("");
    setErrors([]);
  };

  const applyAllSuggestions = () => {
    if (errors.length === 0) return;

    let newText = text;
    let offsetAdjustment = 0;

    errors.forEach((err) => {
      if (err.replacements.length > 0) {
        const adjustedOffset = err.offset + offsetAdjustment;
        const before = newText.slice(0, adjustedOffset);
        const after = newText.slice(adjustedOffset + err.length);
        const replacement = err.replacements[0].value;
        newText = before + replacement + after;
        offsetAdjustment += replacement.length - err.length;
      }
    });

    setText(newText);
    setErrors([]);
  };

  useEffect(() => {
    const handler = setTimeout(() => {}, 600);
    return () => clearTimeout(handler);
  }, [text]);

  return (
    <div className="space-y-8 p-5">
      <Header />
      {/* ========================== INPUT + RESULTS GRID ========================== */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* ========================== LEFT INPUT PANEL ========================== */}
        <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6 flex flex-col">
          {/* HEADER */}

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
                <SpellCheck className="h-5 w-5 text-(--primary)" />
                Text Input
              </h2>
              <p className="text-(--muted-foreground)">
                Enter or paste your text to check spelling & grammar
              </p>
            </div>

            <div className="flex gap-2">
              {/* COPY BUTTON */}
              <button
                onClick={copyToClipboard}
                disabled={!text}
                className="
                  p-2 rounded-lg border border-(--border)
                  hover:bg-(--muted) transition
                "
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-(--foreground)" />
                )}
              </button>

              {/* CLEAR BUTTON */}
              <button
                onClick={clearAll}
                disabled={!text}
                className="
                  p-2 rounded-lg border border-(--border)
                  hover:bg-(--muted) transition
                "
              >
                <RotateCcw className="h-4 w-4 text-(--foreground)" />
              </button>
            </div>
          </div>

          {/* TEXTAREA */}
          <textarea
            placeholder="Type or paste your text..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="
              grow min-h-65 p-4 rounded-xl resize-none
              bg-(--background) text-(--foreground)
              border border-(--border)
              focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/40
              outline-none transition
            "
          ></textarea>

          {/* ACTION BUTTONS */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={checkSpelling}
              disabled={loading || !text.trim()}
              className="
                px-5 py-3 rounded-xl text-sm font-semibold
                bg-(--primary) text-(--primary-foreground)
                shadow hover:shadow-lg transition
                w-full sm:w-auto cursor-pointer
              "
            >
              {loading ? "Checking..." : "Check Spelling & Grammar"}
            </button>

            {errors.length > 0 && (
              <button
                onClick={applyAllSuggestions}
                className="
                  px-5 py-3 rounded-xl text-sm font-semibold
                  bg-(--muted) text-(--foreground)
                  border border-(--border)
                  hover:bg-(--muted)/80 transition
                  w-full sm:w-auto
                "
              >
                Apply All Suggestions
              </button>
            )}
          </div>
        </div>

        {/* ========================== RIGHT RESULTS PANEL ========================== */}
        <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6 flex flex-col">
          <h2 className="text-xl font-bold text-(--foreground)">Results</h2>
          <p className="text-(--muted-foreground) mb-4">
            {errors.length > 0
              ? `Found ${errors.length} issue${errors.length > 1 ? "s" : ""}`
              : "No issues found"}
          </p>

          {/* ERRORS LIST */}
          <div className=" grow overflow-y-auto pr-3 space-y-4 max-h-87.5">
            {errors.length > 0 ? (
              errors.map((err, i) => (
                <div
                  key={i}
                  className="
                    border border-red-400/40 bg-red-500/10
                    rounded-xl p-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-1" />

                    <div className=" grow">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Mistake word */}
                        <span
                          className="
                          px-2 py-1 rounded-md text-sm font-mono
                          bg-(--muted) text-(--foreground)
                          border border-(--border)
                        "
                        >
                          {text.substring(err.offset, err.offset + err.length)}
                        </span>

                        <span className="text-sm text-(--muted-foreground)">
                          {err.message}
                        </span>
                      </div>

                      {/* Suggestions */}
                      {err.replacements.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-sm font-medium">
                            Suggestions:
                          </span>

                          {err.replacements.slice(0, 5).map((s, j) => (
                            <button
                              key={j}
                              onClick={() =>
                                applySuggestion(err.offset, err.length, s.value)
                              }
                              className="
                                px-3 py-1 rounded-lg text-sm
                                border border-(--border)
                                hover:bg-(--muted) transition
                              "
                            >
                              {s.value}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-lg font-semibold text-(--foreground)">
                  No Issues Found
                </h3>
                <p className="text-(--muted-foreground)">
                  Your text looks clean!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================== Features ========================== */}
      <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-(--foreground)">Features</h2>
        <p className="text-(--muted-foreground) mb-6">
          Powerful grammar and spell checking powered by LanguageTool
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-(--primary)/10">
              <SpellCheck className="h-5 w-5 text-(--primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-(--foreground)">
                Real-Time Checking
              </h3>
              <p className="text-sm text-(--muted-foreground)">
                Get instant feedback while writing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-(--primary)/10">
              <CheckCircle className="h-5 w-5 text-(--primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-(--foreground)">
                Smart Suggestions
              </h3>
              <p className="text-sm text-(--muted-foreground)">
                Improve your writing with contextual tips.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-(--primary)/10">
              <Copy className="h-5 w-5 text-(--primary)" />
            </div>
            <div>
              <h3 className="font-semibold text-(--foreground)">
                Easy Corrections
              </h3>
              <p className="text-sm text-(--muted-foreground)">
                Apply suggestions instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================== TIPS SECTION ========================== */}
      <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-(--foreground)">
          Tips for Better Writing
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 mt-4">
          <div>
            <h3 className="font-semibold mb-2 text-(--foreground)">
              Common Mistakes
            </h3>
            <ul className="text-sm space-y-1 text-(--muted-foreground)">
              <li>• Confusing their / there / they&apos;re</li>
              <li>• Mixing your / you&apos;re</li>
              <li>• Incorrect double negatives</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-(--foreground)">
              Best Practices
            </h3>
            <ul className="text-sm space-y-1 text-(--muted-foreground)">
              <li>• Read aloud before finalizing</li>
              <li>• Take breaks while writing</li>
              <li>• Prefer active voice</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========================== FAQ SECTION ========================== */}
      <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-6">
      <Features/>
      </div>
    </div>
  );
}
