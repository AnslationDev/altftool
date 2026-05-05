export function formatNumber(n, rounding) {
  if (!Number.isFinite(n)) return "";

  if (rounding?.mode === "fixed") {
    return Number(n.toFixed(rounding.digits)).toLocaleString();
  }

  // auto
  const abs = Math.abs(n);
  const digits = abs >= 1 ? 4 : 6;
  const trimmed = Number(n.toFixed(digits));
  return trimmed.toLocaleString();
}
