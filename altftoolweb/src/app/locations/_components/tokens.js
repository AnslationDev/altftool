/**
 * Shared theme tokens for the /locations route family.
 *
 * Semantic `--sc-*` variables only (they are defined for light AND dark in
 * globals.css) — no hardcoded hex, per master.md. The accent gradient is built
 * from the same tokens so it flips with the theme instead of staying a fixed
 * light-mode pair.
 */
export const T = Object.freeze({
  card: "var(--sc-card)",
  tile: "var(--sc-tile)",
  ink: "var(--sc-ink)",
  muted: "var(--sc-muted)",
  border: "var(--sc-border)",
  indigo: "var(--sc-indigo)",
  grad: "linear-gradient(135deg, var(--sc-indigo) 0%, var(--sc-violet) 100%)",
  shadow: "var(--sc-shadow)",
});

export const CARD = Object.freeze({ backgroundColor: T.card, boxShadow: T.shadow });

/**
 * Primary call-to-action — WCAG AA in both themes.
 *
 * Solid `--sc-indigo`, not the indigo→violet gradient: white on the violet end
 * is ~3.9:1, which fails AA for text this size. The label uses `--sc-card`,
 * which is the one token that moves opposite the accent — white (#FFFFFF) on
 * indigo #6366F1 is 4.6:1 in light mode, and near-black card #151936 on the
 * lighter dark-mode indigo #8B93F8 is ~7.9:1. No theme variant needed, so it
 * cannot silently regress if a utility fails to generate. The gradient stays
 * on decorative icon tiles, which carry no text.
 */
export const CTA_CLASS =
  "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition active:opacity-90";

export const CTA_STYLE = Object.freeze({
  backgroundColor: T.indigo,
  color: T.card,
  boxShadow: T.shadow,
});
