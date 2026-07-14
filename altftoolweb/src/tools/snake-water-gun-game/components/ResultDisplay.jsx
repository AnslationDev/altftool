import { CHOICE_EMOJIS, CHOICE_LABELS, getResultMessage } from "../utils/gameLogic";

function ResultBadge({ result }) {
  if (result === "win") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--anslation-ds-success)] bg-[var(--anslation-ds-success-soft)] px-3 py-1 text-xs font-bold text-[var(--anslation-ds-success)]">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Win
      </span>
    );
  }
  if (result === "lose") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--anslation-ds-danger)] bg-[var(--anslation-ds-danger-soft)] px-3 py-1 text-xs font-bold text-[var(--anslation-ds-danger)]">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Loss
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-bold text-[var(--muted-foreground)]">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
      </svg>
      Draw
    </span>
  );
}

export default function ResultDisplay({ playerChoice, computerChoice, result, round }) {
  if (!playerChoice || !computerChoice) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 text-center sm:p-6">
        <p className="text-sm font-semibold text-[var(--muted-foreground)]">Pick your move to start the round</p>
      </div>
    );
  }

  const showAnimation = result === "win";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">You picked</p>
          <span className="mt-2 block text-4xl sm:text-5xl" aria-hidden="true">
            {CHOICE_EMOJIS[playerChoice]}
          </span>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{CHOICE_LABELS[playerChoice]}</p>
        </div>

        <div className="flex items-center justify-center">
          <svg className="h-6 w-6 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Computer picked</p>
          <span className="mt-2 block text-4xl sm:text-5xl" aria-hidden="true">
            {CHOICE_EMOJIS[computerChoice]}
          </span>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{CHOICE_LABELS[computerChoice]}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <ResultBadge result={result} />
        <p className={`text-center text-base font-semibold leading-6 ${showAnimation ? "motion-safe:animate-pulse text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
          {getResultMessage(result, playerChoice, computerChoice)}
        </p>
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Round #{round}</p>
      </div>
    </div>
  );
}
