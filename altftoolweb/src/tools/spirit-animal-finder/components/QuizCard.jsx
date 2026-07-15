import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function QuizCard({ question, questionIndex, totalQuestions, selectedAnswer, onSelectAnswer, onPrev, onNext, onFinish }) {
  const isFirst = questionIndex === 0;
  const isLast = questionIndex === totalQuestions - 1;
  const hasAnswer = selectedAnswer !== null && selectedAnswer !== undefined;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-wide">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition ${
                i < questionIndex ? "bg-[var(--primary)]" : i === questionIndex ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
              }`}
            />
          ))}
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-5 leading-relaxed">
        {question.question}
      </h3>

      <div className="space-y-3 mb-6">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelectAnswer(idx)}
            className={`w-full text-left p-4 rounded-xl border transition ${
              selectedAnswer === idx
                ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                  selectedAnswer === idx
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)]"
                }`}
              >
                {selectedAnswer === idx && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span className="text-sm sm:text-base">{option.text}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:border-[var(--primary)] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {isLast ? (
          <button
            onClick={onFinish}
            disabled={!hasAnswer}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            Find My Spirit Animal
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!hasAnswer}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
