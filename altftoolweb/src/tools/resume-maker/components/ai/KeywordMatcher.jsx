import React, { useState } from "react";
import { Search, CheckCircle, AlertCircle } from "lucide-react";
import { matchKeywords } from "./keywordUtils";

const KeywordMatcher = ({ resumeText }) => {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!jd.trim()) return;

    const res = matchKeywords(jd, resumeText);
    setResult(res);
  };

  return (
    <div className="mt-6 p-5 bg-(--card) rounded-2xl border border-(--border) shadow-md space-y-4">

      {/* HEADER */}
      <div className="flex items-center gap-2 font-semibold text-(--foreground)">
        <Search className="w-5 h-5 text-blue-500" />
        Job Match Analyzer
      </div>

      {/* INPUT */}
      <textarea
  value={jd}
  onChange={(e) => setJd(e.target.value)}
  placeholder="Paste job description here..."
  rows={4}
  className="
    w-full p-3 rounded-xl text-sm
    bg-(--background) border border-(--border)
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-all
  "
/>

      {/* BUTTON */}
      <button
        onClick={handleAnalyze}
        className="w-full sm:w-auto
    flex items-center justify-center gap-2 px-4 py-2.5
    bg-blue-500 text-white rounded-xl
    hover:bg-blue-600 active:scale-95
    transition-all duration-200 shadow-sm"
      >
        <Search className="w-4 h-4" />
        Analyze Match
      </button>

      {/* RESULT */}
      {result && (
        <div className="space-y-3 animate-fade-in">

          {/* MATCHED */}
          <div>
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm mb-1">
              <CheckCircle className="w-4 h-4" />
              Matched
            </div>

            <div className="flex flex-wrap gap-2">
              {result.matched.length === 0 ? (
                <span className="text-xs text-(--muted-foreground)">
Looks like none of the keywords match yet !!
</span>
              ) : (
                result.matched.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs bg-green-100 text-green-700
                   px-3 py-1 rounded-full
                   hover:scale-105 transition cursor-default"
                  >
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* MISSING */}
          <div>
            <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-1">
              <AlertCircle className="w-4 h-4" />
              Missing
            </div>

            <div className="flex flex-wrap gap-2">
              {result.missing.length === 0 ? (
                <span className="text-xs text-gray-400">Nothing missing 🎉</span>
              ) : (
                result.missing.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:scale transition cursor-default"
                  >
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default KeywordMatcher;
