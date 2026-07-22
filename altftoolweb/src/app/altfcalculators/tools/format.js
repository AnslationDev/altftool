// Small formatting / math helpers shared by calculator tools.

// A finite number or null. Returns null for empty/invalid input.
export function num(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Round to `d` decimals and drop trailing zeros.
export function round(n, d = 2) {
  if (!Number.isFinite(n)) return n;
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
}

// Group digits with thousands separators, keeping up to `d` decimals.
export function fmt(n, d = 2) {
  if (!Number.isFinite(n)) return "—";
  return round(n, d).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  });
}

// Fixed-decimal money-style formatter (no symbol — the UI supplies the symbol).
export function money(n, d = 2) {
  if (!Number.isFinite(n)) return "—";
  return round(n, d).toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

// Clamp a number into [min, max].
export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// Greatest common divisor (integers).
export function gcd(a, b) {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// Least common multiple (integers).
export function lcm(a, b) {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  if (!a || !b) return 0;
  return (a / gcd(a, b)) * b;
}

// Parse a whitespace/comma/semicolon separated list of finite numbers.
export function parseNumbers(text) {
  return String(text)
    .split(/[\s,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

// "1 day" / "3 days" — simple pluraliser.
export function plural(n, one, many) {
  return `${n} ${Math.abs(n) === 1 ? one : many || one + "s"}`;
}
