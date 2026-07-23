"use client";

import { useState, useCallback } from "react";
import { Sparkles, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { generateQuiz } from "../utils/vocabUtils";

export default function QuizSection({ words }) {
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const newQuestion = useCallback(() => {
    const q = generateQuiz(words, 4);
    if (!q) return;
    setQuiz(q);
    setSelected(null);
    setResult(null);
  }, [words]);

  const handleSelect = (opt) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === quiz.answer;
    setResult(correct);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--foreground)]">Quiz</h3>
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          Score: <span className="font-bold text-emerald-600">{score.correct}</span>/{score.total}
        </div>
      </div>

      <div className="p-6">
        {!quiz ? (
          <div className="text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Ready to test your vocabulary?</p>
            <button onClick={newQuestion} className="mt-3 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110">
              Start Quiz
            </button>
          </div>
        ) : (
          <div>
            <p className="text-center text-sm font-semibold text-[var(--muted-foreground)]">Choose the word that matches:</p>
            <p className="mt-2 text-center text-lg font-bold text-[var(--foreground)]">{quiz.question}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {quiz.options.map((opt, i) => {
                const isCorrect = opt === quiz.answer;
                const isSelected = opt === selected;
                let cls = "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]";
                if (isSelected && result) cls = isCorrect ? "border-emerald-500 bg-emerald-500/5" : "border-rose-500 bg-rose-500/5";
                else if (result && isCorrect && !isSelected) cls = "border-emerald-500/50 bg-emerald-500/5";
                return (
                  <button key={i} onClick={() => handleSelect(opt)}
                    className={`rounded-xl border p-3 text-center text-sm font-bold text-[var(--foreground)] transition-all ${cls}`}
                    disabled={!!selected}
                  >
                    {opt}
                    {isSelected && result && (isCorrect ? <CheckCircle className="ml-1.5 inline h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="ml-1.5 inline h-3.5 w-3.5 text-rose-600" />)}
                    {result && isCorrect && !isSelected && <CheckCircle className="ml-1.5 inline h-3.5 w-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {result !== null && (
              <div className={`mt-4 text-center text-sm font-bold ${result ? "text-emerald-600" : "text-rose-600"}`}>
                {result ? "Correct! ✓" : `Wrong — answer: ${quiz.answer}`}
              </div>
            )}

            <div className="mt-4 text-center">
              <button onClick={newQuestion} className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)]/10 px-5 py-2 text-sm font-bold text-[var(--primary)] transition-all hover:bg-[var(--primary)]/20">
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
