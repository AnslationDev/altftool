export const HEIGHT_MIN = 50;
export const HEIGHT_MAX = 250;
export const WEIGHT_MIN = 20;
export const WEIGHT_MAX = 300;

/** Validate the paired body-size inputs used to calculate cardiac index. */
export function calculateBodySurfaceArea(heightValue, weightValue) {
  const heightText = String(heightValue ?? "").trim();
  const weightText = String(weightValue ?? "").trim();
  const rangeMessage = `Enter both height (${HEIGHT_MIN}–${HEIGHT_MAX} cm) and weight (${WEIGHT_MIN}–${WEIGHT_MAX} kg) to calculate the cardiac index.`;

  if (!heightText || !weightText) return { error: rangeMessage };

  const heightCm = Number(heightText);
  const weightKg = Number(weightText);
  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    heightCm < HEIGHT_MIN ||
    heightCm > HEIGHT_MAX ||
    weightKg < WEIGHT_MIN ||
    weightKg > WEIGHT_MAX
  ) {
    return { error: rangeMessage };
  }

  return {
    heightCm,
    weightKg,
    bsa: Math.sqrt((heightCm * weightKg) / 3600),
  };
}
