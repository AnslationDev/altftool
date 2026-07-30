"use client";

/**
 * Step Counter — scoped theme layer.
 *
 * Everything here is an ALIAS of a platform semantic token (see master.md §2/§3
 * and src/app/globals.css). The tool used to carry its own hardcoded cyan
 * palette (`--scv2-*`, raw hex for every surface), which meant the site's #1
 * traffic page was the one screen not wearing the design system. The local
 * `--sc3-*` names survive only because a handful of values are genuinely
 * tool-specific (ring track, chart grid, ambient glow) and are derived from the
 * platform tokens with color-mix rather than invented.
 *
 * Light is the default; `[data-theme="dark"]` only has to override the two
 * relationships that actually invert (page/canvas and glow strength) — every
 * other token follows the platform switch automatically.
 */

export const THEME_CSS = `
.sc3-scope{
  --sc3-page: var(--page, #F7F8FB);
  --sc3-card: var(--surface, #FFFFFF);
  --sc3-border: var(--border, #E2E8F0);
  --sc3-ink: var(--foreground, #111827);
  --sc3-ink-soft: color-mix(in srgb, var(--foreground, #111827) 76%, transparent);
  --sc3-muted: var(--muted-foreground, #607083);

  --sc3-chip: color-mix(in srgb, var(--foreground, #111827) 7%, transparent);
  --sc3-chip-ink: var(--foreground, #111827);
  --sc3-track: color-mix(in srgb, var(--foreground, #111827) 10%, transparent);
  --sc3-grid: color-mix(in srgb, var(--foreground, #111827) 7%, transparent);
  --sc3-goal-line: color-mix(in srgb, var(--foreground, #111827) 34%, transparent);
  --sc3-dot: var(--surface, #FFFFFF);
  --sc3-dot-stroke: color-mix(in srgb, var(--foreground, #111827) 32%, transparent);
  --sc3-handle: color-mix(in srgb, var(--foreground, #111827) 18%, transparent);
  --sc3-toggle-off: color-mix(in srgb, var(--foreground, #111827) 22%, transparent);

  /* White on --primary (brand-600 #0D9488) measures 3.74:1 — under the 4.5:1 AA
     needs for the 17px bold label on the Start button, which is the most
     important control on the site's busiest page. brand-700 carries white at
     5.47:1. The lighter primary stays available as --sc3-accent-text for teal
     TEXT on the page, where it is the right way round. */
  --sc3-accent: var(--primary-hover, #0F766E);
  --sc3-accent-hover: var(--primary-active, #115E59);
  --sc3-accent-ink: var(--primary-foreground, #FFFFFF);
  --sc3-accent-soft: var(--primary-soft, #CCFBF1);
  --sc3-accent-text: var(--primary-text, #0F766E);
  --sc3-accent-2: var(--secondary, #22D3EE);

  --sc3-danger: var(--danger, #EF4444);
  --sc3-danger-soft: var(--danger-soft, #FDE2DD);
  --sc3-danger-text: var(--anslation-ds-danger-text, #B91C1C);
  --sc3-warn: var(--warning, #F59E0B);
  --sc3-warn-soft: var(--warning-soft, #FDF1D6);
  --sc3-warn-text: var(--warning-text, #B45309);
  --sc3-info: var(--info, #0EA5E9);
  --sc3-info-soft: var(--info-soft, #E0F2FE);
  --sc3-info-text: var(--anslation-ds-info-text, #075985);
  --sc3-success-text: var(--anslation-ds-success-text, #166534);

  --sc3-shadow: var(--shadow-sm, 0 1px 2px rgb(15 23 42 / 6%));
  --sc3-shadow-md: var(--shadow-md, 0 8px 24px rgb(15 23 42 / 8%));
  --sc3-shadow-lg: var(--shadow-lg, 0 20px 48px rgb(15 23 42 / 12%));
  --sc3-backdrop: var(--anslation-ds-overlay, rgb(2 6 23 / 56%));

  --sc3-glow: radial-gradient(circle,
    color-mix(in srgb, var(--primary, #0D9488) 15%, transparent) 0%,
    color-mix(in srgb, var(--primary, #0D9488) 0%, transparent) 66%);
}
[data-theme="dark"] .sc3-scope{
  --sc3-page: var(--canvas, #0B1220);
  --sc3-glow: radial-gradient(circle,
    color-mix(in srgb, var(--primary, #2DD4BF) 20%, transparent) 0%,
    color-mix(in srgb, var(--primary, #2DD4BF) 0%, transparent) 66%);
}

/* --- layout primitives -------------------------------------------------- */
/*
 * The tool workspace this screen mounts into already supplies a 1rem gutter AND
 * wraps everything in overflow-x:auto (ToolDetailChrome). That makes it a
 * scroll container on both axes, which is why there is no sticky/fixed bottom
 * bar here: it would either pin to the wrong box or never pin at all, and a
 * fixed bar would float over the FAQ below the tool.
 *
 * So the primary action sits in normal flow, immediately under the count. On a
 * 390x844 phone that lands it around 65% down the first screenful — squarely in
 * the thumb arc — and it is structurally incapable of covering content.
 */

.sc3-app{
  /* Only top up the gutter the chrome does not already provide, which is what
     a notched phone in landscape actually needs. */
  padding-left: max(0px, calc(env(safe-area-inset-left) - 1rem));
  padding-right: max(0px, calc(env(safe-area-inset-right) - 1rem));
  padding-bottom: max(0px, env(safe-area-inset-bottom));
}
.sc3-layout{ display:flex; flex-direction:column; gap:1rem; }
.sc3-side{ display:flex; flex-direction:column; gap:1rem; }

@media (min-width: 768px){
  /* Desktop is the same screen with more room — not a second design. */
  .sc3-app{
    padding: 1.5rem;
    border: 1px solid var(--sc3-border);
    border-radius: var(--radius-xl, 1rem);
    background: var(--sc3-page);
  }
  .sc3-layout{
    display:grid;
    grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
    grid-template-areas: "notice notice" "ring side" "bar side";
    align-items:start;
    column-gap:1.5rem;
    row-gap:1.25rem;
  }
  .sc3-a-notice{ grid-area:notice; }
  .sc3-a-ring{ grid-area:ring; }
  .sc3-a-bar{ grid-area:bar; }
  .sc3-a-side{ grid-area:side; }
}

/* Focus is visible on every control in the tool, in both themes. */
.sc3-scope :focus-visible{
  outline: 2px solid var(--sc3-accent);
  outline-offset: 2px;
}

/* --- motion ------------------------------------------------------------- */

@keyframes sc3FadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes sc3Up{from{transform:translateY(24px);opacity:.5}to{transform:translateY(0);opacity:1}}
@keyframes sc3Fade{from{opacity:0}to{opacity:1}}
@keyframes sc3Pop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes sc3Draw{to{stroke-dashoffset:0}}
@keyframes sc3AreaIn{to{opacity:1}}
@keyframes sc3Breathe{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
@keyframes sc3SoftPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes sc3GoalPop{0%{transform:scale(1)}35%{transform:scale(1.1)}100%{transform:scale(1)}}

@media (prefers-reduced-motion: no-preference){
  .sc3-in{animation:sc3FadeUp .5s cubic-bezier(.22,1,.36,1) both}
  .sc3-ring-arc{transition:stroke-dasharray .8s cubic-bezier(.22,1,.36,1)}
  .sc3-chart-line{stroke-dasharray:1;stroke-dashoffset:1;animation:sc3Draw 1.1s .2s cubic-bezier(.4,0,.2,1) forwards}
  .sc3-chart-area{opacity:0;animation:sc3AreaIn .7s .8s ease forwards}
  .sc3-chart-dot{opacity:0;animation:sc3Pop .4s cubic-bezier(.34,1.56,.64,1) both;transform-box:fill-box;transform-origin:center}
  .sc3-glow-pulse{animation:sc3Breathe 2.6s ease-in-out infinite}
  .sc3-soft-pulse{animation:sc3SoftPulse 1.8s ease-in-out infinite}
  .sc3-goal-pop{animation:sc3GoalPop .8s cubic-bezier(.34,1.56,.64,1)}
}
`;

/** JS-side handles for the same tokens (inline styles only — no raw hex). */
export const C = {
  page: "var(--sc3-page)",
  card: "var(--sc3-card)",
  border: "var(--sc3-border)",
  ink: "var(--sc3-ink)",
  inkSoft: "var(--sc3-ink-soft)",
  muted: "var(--sc3-muted)",
  chip: "var(--sc3-chip)",
  chipInk: "var(--sc3-chip-ink)",
  accent: "var(--sc3-accent)",
  accentInk: "var(--sc3-accent-ink)",
  accentSoft: "var(--sc3-accent-soft)",
  accentText: "var(--sc3-accent-text)",
  accent2: "var(--sc3-accent-2)",
  danger: "var(--sc3-danger)",
  dangerSoft: "var(--sc3-danger-soft)",
  dangerText: "var(--sc3-danger-text)",
  warnSoft: "var(--sc3-warn-soft)",
  warnText: "var(--sc3-warn-text)",
  infoSoft: "var(--sc3-info-soft)",
  infoText: "var(--sc3-info-text)",
  successText: "var(--sc3-success-text)",
};

export const CARD_STYLE = {
  background: C.card,
  border: `1px solid ${C.border}`,
  boxShadow: "var(--sc3-shadow)",
};

export default THEME_CSS;
