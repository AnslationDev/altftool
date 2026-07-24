export const REDACTION_MODES = ["solid", "blur", "pixelate"];

export function clamp(value, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.min(maximum, Math.max(minimum, parsed));
}

export function normaliseRegion(region, duration = Number.POSITIVE_INFINITY) {
  const safeDuration =
    Number.isFinite(Number(duration)) && Number(duration) >= 0
      ? Number(duration)
      : Number.POSITIVE_INFINITY;
  const start = clamp(region.start, 0, safeDuration);
  const end = clamp(region.end, start, safeDuration);
  const x = clamp(region.x, 0, 99);
  const y = clamp(region.y, 0, 99);
  const width = clamp(region.width, 1, 100 - x);
  const height = clamp(region.height, 1, 100 - y);

  return {
    ...region,
    start,
    end,
    x,
    y,
    width,
    height,
    mode: REDACTION_MODES.includes(region.mode) ? region.mode : "solid",
  };
}

export function createDefaultRegion({ id, time = 0, duration = 0 } = {}) {
  const safeDuration = Math.max(0, Number(duration) || 0);
  const safeTime = clamp(time, 0, safeDuration);
  const start =
    safeDuration > 0 && safeTime >= safeDuration
      ? Math.max(0, safeDuration - Math.min(5, safeDuration))
      : safeTime;
  const end = Math.min(safeDuration, start + 5);

  return normaliseRegion(
    {
      id,
      start,
      end,
      x: 30,
      y: 35,
      width: 40,
      height: 20,
      mode: "solid",
    },
    safeDuration,
  );
}

export function activeRegionsAtTime(regions, time) {
  const safeTime = Number(time);
  if (!Number.isFinite(safeTime)) return [];
  return regions.filter((region) => safeTime >= region.start && safeTime <= region.end);
}

export function updateRegion(regions, id, patch, duration) {
  return regions.map((region) =>
    region.id === id ? normaliseRegion({ ...region, ...patch }, duration) : region,
  );
}

export function regionToPixels(region, frameWidth, frameHeight) {
  const width = Math.max(0, Number(frameWidth) || 0);
  const height = Math.max(0, Number(frameHeight) || 0);

  return {
    x: Math.round((region.x / 100) * width),
    y: Math.round((region.y / 100) * height),
    width: Math.round((region.width / 100) * width),
    height: Math.round((region.height / 100) * height),
  };
}

export function formatTimestamp(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  const tenths = Math.floor((safeSeconds % 1) * 10);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}.${tenths}`;
}
