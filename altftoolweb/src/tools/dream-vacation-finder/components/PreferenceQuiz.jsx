"use client";

import { useState } from "react";
import { Shuffle, Search } from "lucide-react";
import { QUESTIONS } from "../utils/destinations";

export default function PreferenceQuiz({ onSubmit, onSurprise, isLoading }) {
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 250);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < QUESTIONS.length - 1) return;
    onSubmit(answers);
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
  };

  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const isComplete = Object.keys(answers).length >= QUESTIONS.length - 1;

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {QUESTIONS.map((q, i) => (
            <div
              key={q.id}
              className={`w-2.5 h-2.5 rounded-full transition ${
                i <= currentStep
                  ? "bg-(--primary)"
                  : i <= Object.keys(answers).length
                  ? "bg-(--primary)/40"
                  : "bg-(--border)"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-(--muted-foreground) font-medium">
          {currentStep + 1} of {QUESTIONS.length}
        </span>
      </div>

      <div className="mb-2">
        <div className="h-1.5 bg-(--page) rounded-full overflow-hidden">
          <div
            className="h-full bg-(--primary) rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-[240px] animate-in fade-in slide-in-from-right-4 duration-200">
        <h3 className="text-base font-semibold mb-4">{question.label}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt) => {
            const isSelected = answers[question.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleAnswer(question.id, opt.value)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-left transition ${
                  isSelected
                    ? "border-(--primary) bg-(--primary)/5 text-(--foreground)"
                    : "border-(--border) bg-(--page) text-(--muted-foreground) hover:border-(--primary)/40 hover:text-(--foreground)"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    isSelected
                      ? "border-(--primary) bg-(--primary)"
                      : "border-(--border)"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-(--border)">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-(--border) hover:bg-(--page) transition"
            >
              Back
            </button>
          )}
          <button
            onClick={onSurprise}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-(--border) hover:bg-(--page) transition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Surprise Me
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-sm font-medium text-(--muted-foreground) hover:text-(--foreground) transition"
          >
            Reset
          </button>
          {isComplete && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition shadow-md ${
                isLoading
                  ? "bg-(--muted)/30 text-(--muted-foreground) cursor-not-allowed"
                  : "bg-(--primary) text-white hover:opacity-90"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Finding...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find My Vacation
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
