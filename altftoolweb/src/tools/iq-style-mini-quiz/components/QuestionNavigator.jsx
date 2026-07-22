"use client";

export default function QuestionNavigator({ questions, currentIndex, onGoTo }) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q, i) => {
        let bg = "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)]";
        if (i === currentIndex) {
          bg = "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]";
        } else if (q.isAnswered) {
          bg = q.selectedOption === q.correctIndex
            ? "bg-emerald-500/10 border-emerald-500 text-emerald-600"
            : "bg-rose-500/10 border-rose-500 text-rose-600";
        } else if (q.isSkipped) {
          bg = "bg-amber-500/10 border-amber-500 text-amber-600";
        }

        return (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition-all hover:scale-105 ${bg}`}
            aria-label={`Go to question ${i + 1}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
