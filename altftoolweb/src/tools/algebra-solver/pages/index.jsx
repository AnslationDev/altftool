"use client";

import { useState, useCallback } from "react";
import Header from "../components/Header";
import StepDisplay from "../components/StepDisplay";
import SolutionResult from "../components/SolutionResult";
import { EQUATION_TYPES, SAMPLE_EQUATIONS } from "../constants";
import { solveLinear, solveQuadratic, solveSystem } from "../utils/algebraSolver";

export default function AlgebraSolver() {
  const [equationType, setEquationType] = useState("linear");
  const [input, setInput] = useState(SAMPLE_EQUATIONS.linear[0]);
  const [result, setResult] = useState(null);

  const handleSolve = useCallback(() => {
    if (!input.trim()) return;
    let res;
    if (equationType === "linear") res = solveLinear(input);
    else if (equationType === "quadratic") res = solveQuadratic(input);
    else if (equationType === "system") res = solveSystem(input);
    setResult(res);
  }, [input, equationType]);

  const handleSample = useCallback((eq) => {
    setInput(eq);
    setResult(null);
  }, []);

  const handleTypeChange = useCallback((type) => {
    setEquationType(type);
    setInput(SAMPLE_EQUATIONS[type][0]);
    setResult(null);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSolve();
    }
  };

  return (
    <div className="bg-[var(--background)] px-4 py-6 text-[var(--foreground)] transition-colors sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Header />

        <div className="space-y-6">
          {/* Equation Type Selector */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h3 className="text-base font-bold text-[var(--foreground)]">Equation Type</h3>
            </div>
            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {EQUATION_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTypeChange(t.id)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      equationType === t.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                    }`}
                  >
                    <p className="text-sm font-bold text-[var(--foreground)]">{t.label}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">{t.desc}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--primary)]">{t.example}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {equationType === "system" ? "Enter System of Equations" : "Enter Equation"}
              </h3>
            </div>
            <div className="p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={equationType === "system" ? "2x + y = 7, x - y = 2" : "2x + 5 = 13"}
                  className="h-14 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-lg font-bold text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
                <button
                  onClick={handleSolve}
                  disabled={!input.trim()}
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-40"
                >
                  Solve
                </button>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">Sample Equations</p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_EQUATIONS[equationType].map((eq) => (
                    <button
                      key={eq}
                      onClick={() => handleSample(eq)}
                      className={`rounded-lg px-2.5 py-1 font-mono text-xs transition-all ${
                        input === eq
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--section-highlight)] text-[var(--foreground)] hover:bg-[var(--primary)]/10"
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Solution */}
          {result && (
            <>
              <SolutionResult result={result} />
              <StepDisplay steps={result.steps} />
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          All calculations run in your browser. No data is stored or uploaded.
        </p>
      </div>
    </div>
  );
}
