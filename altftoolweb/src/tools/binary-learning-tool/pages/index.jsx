"use client";

import React, { useState } from "react";
import { Binary, RefreshCw, Check, HelpCircle } from "lucide-react";

export default function ToolHome() {
  const [mode, setMode] = useState("decimal-to-binary");
  const [decimalInput, setDecimalInput] = useState("42");
  const [binaryInput, setBinaryInput] = useState("101010");
  const [binaryResult, setBinaryResult] = useState("");
  const [decimalResult, setDecimalResult] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizFeedback, setQuizFeedback] = useState(null);

  const toBinary = () => {
    const num = parseInt(decimalInput, 10);
    if (isNaN(num)) return;
    const bin = num.toString(2);
    setBinaryResult(bin.padStart(8, "0"));
  };

  const toDecimal = () => {
    const num = parseInt(binaryInput, 2);
    if (isNaN(num)) return;
    setDecimalResult(num.toString());
  };

  const generateQuiz = () => {
    const num = Math.floor(Math.random() * 256);
    setQuiz({ num, bin: num.toString(2).padStart(8, "0") });
    setQuizAnswer("");
    setQuizFeedback(null);
  };

  const checkQuiz = () => {
    if (!quiz) return;
    if (parseInt(quizAnswer, 2) === quiz.num) {
      setQuizFeedback("correct");
    } else {
      setQuizFeedback("incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <Binary className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Binary Learning Tool</h1>
              <p className="text-xs text-muted-foreground mt-1">Learn binary numbers with converters, bit visualization, and quizzes.</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap gap-2">
                {["decimal-to-binary", "binary-to-decimal"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                      mode === m ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-foreground"
                    }`}
                  >
                    {m === "decimal-to-binary" ? "Decimal → Binary" : "Binary → Decimal"}
                  </button>
                ))}
              </div>

              {mode === "decimal-to-binary" ? (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-foreground uppercase">Decimal Number</label>
                  <input
                    type="number"
                    value={decimalInput}
                    onChange={(e) => setDecimalInput(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={toBinary}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} /> Convert to Binary
                  </button>
                  {binaryResult && (
                    <div className="p-6 bg-surface-soft rounded-xl border border-border text-center">
                      <div className="text-3xl font-mono font-black tracking-widest text-primary">{binaryResult}</div>
                      <div className="flex justify-center gap-1 mt-3">
                        {binaryResult.split("").map((b, i) => (
                          <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold border ${b === "1" ? "bg-primary/20 border-primary text-primary" : "bg-surface-soft border-border text-muted-foreground"}`}>
                            {b}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center gap-1 mt-1">
                        {binaryResult.split("").map((_, i) => (
                          <div key={i} className="w-8 text-[8px] text-muted-foreground text-center font-mono">{Math.pow(2, 7 - i)}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-foreground uppercase">Binary Number</label>
                  <input
                    value={binaryInput}
                    onChange={(e) => setBinaryInput(e.target.value.replace(/[^01]/g, ""))}
                    placeholder="e.g., 101010"
                    className="w-full bg-surface-soft border border-border rounded-xl text-sm p-4 outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  <button
                    onClick={toDecimal}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} /> Convert to Decimal
                  </button>
                  {decimalResult !== "" && (
                    <div className="p-6 bg-surface-soft rounded-xl border border-border text-center">
                      <div className="text-4xl font-black text-primary">{decimalResult}</div>
                      <p className="text-xs text-muted-foreground mt-1">decimal</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={14} className="text-primary" />
                Binary Quiz
              </h2>
              <button
                onClick={generateQuiz}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> New Question
              </button>

              {quiz && (
                <div className="space-y-4 p-4 bg-surface-soft rounded-xl border border-border">
                  <p className="text-sm text-foreground font-bold">What is <span className="text-primary">{quiz.num}</span> in binary?</p>
                  <input
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value.replace(/[^01]/g, ""))}
                    placeholder="Enter binary..."
                    className="w-full bg-background border border-border rounded-xl text-sm p-3 outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                  <button
                    onClick={checkQuiz}
                    className="w-full py-2.5 border border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary/10 flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Check Answer
                  </button>
                  {quizFeedback === "correct" && (
                    <div className="text-center text-sm font-bold text-green-500 p-3 bg-green-500/10 rounded-xl border border-green-500">
                      Correct! {quiz.num} = {quiz.bin}
                    </div>
                  )}
                  {quizFeedback === "incorrect" && (
                    <div className="text-center text-sm font-bold text-red-500 p-3 bg-red-500/10 rounded-xl border border-red-500">
                      Not quite! {quiz.num} = {quiz.bin}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Bit Position Reference</h2>
              <div className="grid grid-cols-8 gap-1">
                {[128, 64, 32, 16, 8, 4, 2, 1].map((val, i) => (
                  <div key={i} className="text-center p-2 bg-surface-soft rounded-lg border border-border">
                    <div className="text-[9px] font-bold text-muted-foreground">2^{7-i}</div>
                    <div className="text-xs font-black text-primary">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
