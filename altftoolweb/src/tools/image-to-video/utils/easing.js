export const EASING_OPTIONS = [
  { value: "linear",    label: "Linear"    },
  { value: "easeIn",    label: "Ease In"   },
  { value: "easeOut",   label: "Ease Out"  },
  { value: "easeInOut", label: "Ease In‑Out" },
  { value: "cinematic", label: "Cinematic" },
];

export function applyEasing(t, type) {
  const p = Math.max(0, Math.min(1, t));
  switch (type) {
    case "easeIn":    return p * p * p;
    case "easeOut":   return 1 - Math.pow(1 - p, 3);
    case "easeInOut": return p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3)/2;
    case "cinematic": return p < 0.3
      ? (p / 0.3) * 0.15
      : p < 0.7
        ? 0.15 + ((p - 0.3) / 0.4) * 0.7
        : 0.85 + ((p - 0.7) / 0.3) * 0.15;
    default: return p;
  }
}