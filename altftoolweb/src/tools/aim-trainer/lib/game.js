// Pure gameplay constants and helpers for the Aim Trainer.
// No browser APIs at module scope — everything here is plain math.

export const TIMED_DURATION_MS = 30000;
export const PRECISION_LIVES = 3;
export const MIN_TARGET_PX = 44; // minimum touch target size

/** Fixed target diameter for Timed mode, scaled to the arena width. */
export function timedTargetSize(arenaWidth) {
  if (!arenaWidth) return 56;
  return Math.round(Math.min(80, Math.max(MIN_TARGET_PX, arenaWidth * 0.14)));
}

/** Largest diameter a Precision target swells to. */
export function precisionMaxSize(arenaWidth) {
  if (!arenaWidth) return 88;
  return Math.round(Math.min(112, Math.max(64, arenaWidth * 0.2)));
}

/** Precision target lifetime shrinks as the run gets longer. */
export function precisionLifetimeMs(hits) {
  return Math.max(1050, 2100 - hits * 45);
}

/**
 * Diameter of a Precision target at a given age: it grows from the minimum
 * touch size up to maxSize, then shrinks back down before vanishing. It never
 * dips below MIN_TARGET_PX so it always stays tappable.
 */
export function precisionSizeAt(age, lifetimeMs, maxSize) {
  const growPhase = lifetimeMs * 0.35;
  const progress =
    age < growPhase
      ? age / growPhase
      : Math.max(0, 1 - (age - growPhase) / (lifetimeMs - growPhase));
  return MIN_TARGET_PX + (maxSize - MIN_TARGET_PX) * progress;
}

/** Random spawn point that keeps the whole disc inside the arena. */
export function randomTargetPosition(arenaWidth, arenaHeight, diameter) {
  const margin = diameter / 2 + 6;
  const spanX = Math.max(arenaWidth - margin * 2, 1);
  const spanY = Math.max(arenaHeight - margin * 2, 1);
  return {
    x: margin + Math.random() * spanX,
    y: margin + Math.random() * spanY,
  };
}
