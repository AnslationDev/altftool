export const METER_EV_MIN = -2;
export const METER_EV_MAX = 16;

export function clampExposureMeterValue(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return METER_EV_MIN;
  return Math.max(METER_EV_MIN, Math.min(METER_EV_MAX, numeric));
}

export function exposureMeterPercent(value) {
  const clamped = clampExposureMeterValue(value);
  return ((clamped - METER_EV_MIN) / (METER_EV_MAX - METER_EV_MIN)) * 100;
}
