"use client";

/**
 * Token-first tint pairs for icon tiles and accents.
 * Every value resolves through the anslation-ds semantic layer, so both
 * themes stay correct without any hardcoded hex values. The icon colour is
 * mixed toward the foreground so it keeps contrast on the soft tint in
 * light AND dark mode.
 */
const TONES = {
  primary: {
    base: "var(--anslation-ds-primary)",
    soft: "var(--anslation-ds-primary-soft)",
  },
  info: {
    base: "var(--anslation-ds-secondary)",
    soft: "var(--anslation-ds-secondary-soft)",
  },
  success: {
    base: "var(--anslation-ds-success)",
    soft: "var(--anslation-ds-success-soft)",
  },
  warning: {
    base: "var(--anslation-ds-warning)",
    soft: "var(--anslation-ds-warning-soft)",
  },
  danger: {
    base: "var(--anslation-ds-danger)",
    soft: "var(--anslation-ds-danger-soft)",
  },
};

export function toneStyle(tone = "primary") {
  const t = TONES[tone] || TONES.primary;
  return {
    backgroundColor: t.soft,
    color: `color-mix(in srgb, ${t.base} 72%, var(--foreground))`,
  };
}

export function toneColor(tone = "primary") {
  const t = TONES[tone] || TONES.primary;
  return `color-mix(in srgb, ${t.base} 72%, var(--foreground))`;
}

export default TONES;
