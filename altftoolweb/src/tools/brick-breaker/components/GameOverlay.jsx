"use client";

/**
 * Blocking overlay shown over the play area for paused / cleared / game over /
 * won states. Uses design tokens only (UI chrome, not game art).
 */
export default function GameOverlay({ title, children, actionLabel, onAction }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card/90 p-4 text-center backdrop-blur-sm">
      <p className="text-xl font-bold text-foreground">{title}</p>
      {children}
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
