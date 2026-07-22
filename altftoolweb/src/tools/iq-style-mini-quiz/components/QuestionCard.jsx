"use client";

import { CheckCircle2, XCircle, ChevronRight } from "lucide-react";

export default function QuestionCard({ question, onAnswer, answered, selectedOption }) {
  if (!question) return null;

  const isCorrect = selectedOption === question.correctIndex;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-bold uppercase text-[var(--muted-foreground)]">
          Question {question.order}
        </span>
        <span className="rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-bold capitalize text-[var(--muted-foreground)]">
          {question.difficulty}
        </span>
      </div>

      <p className="mb-6 text-lg font-semibold leading-7 text-[var(--foreground)]">
        {question.question}
      </p>

      <div className="space-y-3">
        {question.options.map((option, i) => {
          let style =
            "border-[var(--border)] bg-[var(--card)] hover:bg-[var(--section-highlight)] hover:border-[var(--primary)]";

          if (answered) {
            if (i === question.correctIndex) {
              style = "border-emerald-500 bg-emerald-500/10";
            } else if (i === selectedOption && i !== question.correctIndex) {
              style = "border-rose-500 bg-rose-500/10";
            } else {
              style = "border-[var(--border)] bg-[var(--card)] opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => !answered && onAnswer(i)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${style} ${
                !answered ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-sm font-bold text-[var(--foreground)]">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-sm font-medium text-[var(--foreground)]">{option}</span>
              {answered && i === question.correctIndex && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              )}
              {answered && i === selectedOption && i !== question.correctIndex && (
                <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`mt-6 rounded-xl border p-4 ${
          isCorrect
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-rose-500/30 bg-rose-500/10"
        }`}>
          <p className={`flex items-center gap-2 text-sm font-bold ${
            isCorrect ? "text-emerald-600" : "text-rose-600"
          }`}>
            {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
