"use client";

import { CHOICE_EMOJIS, CHOICE_LABELS } from "../utils/gameLogic";

export default function ChoiceButton({ choice, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onClick(choice)}
      disabled={disabled}
      aria-label={`Choose ${CHOICE_LABELS[choice]}`}
      className="inline-flex h-24 w-full flex-col items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-[var(--primary)] hover:bg-[var(--muted)] hover:shadow-[var(--anslation-ds-shadow-md)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 sm:h-28"
    >
      <span className="text-3xl sm:text-4xl" aria-hidden="true">
        {CHOICE_EMOJIS[choice]}
      </span>
      <span className="text-sm font-semibold">{CHOICE_LABELS[choice]}</span>
    </button>
  );
}
