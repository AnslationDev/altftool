/**
 * Design-to-development handoff checklist.
 *
 * The item library below encodes the artefacts a development team needs before it
 * can build a screen without going back to the designer. Items are tagged with the
 * platforms and feature flags they apply to, so the generated list only contains
 * work that is actually relevant to the project being handed over.
 *
 * Severity model (used for the weighted readiness score):
 *   blocker  - development cannot start correctly without it
 *   standard - normal expectation of a complete handoff
 *   nice     - improves the handoff but is not required to start
 */

export const PLATFORMS = ["web", "ios", "android", "cross"];

/** Weight applied to each severity when scoring. Blockers count 3x a nice-to-have. */
export const SEVERITY_WEIGHT = { blocker: 3, standard: 2, nice: 1 };

export const SEVERITY_ORDER = ["blocker", "standard", "nice"];

/** Feature flags a project can declare. All default to false in `normaliseContext`. */
export const FEATURE_FLAGS = [
  "hasDesignSystem",
  "hasMotion",
  "hasForms",
  "hasDarkMode",
  "isLocalized",
  "hasDataViews",
  "hasA11yTarget",
];

/**
 * Each item: { id, text, severity, platforms?, requires?, forbids? }
 *  - platforms: only include when the project platform is in this list
 *  - requires : every listed flag must be true
 *  - forbids  : none of the listed flags may be true
 */
export const HANDOFF_SECTIONS = [
  {
    id: "files",
    title: "Files & source of truth",
    items: [
      { id: "single-source", text: "One file (or page) is marked as the single source of truth and older explorations are archived.", severity: "blocker" },
      { id: "naming", text: "Frames are named for the screen and state they represent, not 'Frame 42' or 'Copy of'.", severity: "standard" },
      { id: "versions", text: "A dated version or branch is tagged so the build can be pinned to what was reviewed.", severity: "standard" },
      { id: "access", text: "Every engineer on the team has view + inspect access without requesting it.", severity: "blocker" },
      { id: "changelog", text: "A short changelog lists what changed since the last handoff.", severity: "nice" },
    ],
  },
  {
    id: "tokens",
    title: "Tokens & styles",
    items: [
      { id: "colour-tokens", text: "Colours are applied as named styles or variables, with zero one-off hex values left on layers.", severity: "blocker", requires: ["hasDesignSystem"] },
      { id: "colour-list", text: "Every colour used is listed with its hex value and its intended semantic role.", severity: "blocker", forbids: ["hasDesignSystem"] },
      { id: "type-scale", text: "Type styles list family, weight, size, line-height and letter-spacing for each role.", severity: "blocker" },
      { id: "spacing", text: "Spacing follows a stated scale (for example a 4pt or 8pt grid) and exceptions are called out.", severity: "standard" },
      { id: "radius-shadow", text: "Corner radii and elevation/shadow values are named rather than eyeballed per component.", severity: "standard" },
      { id: "dark-pairs", text: "Every colour token has a dark-mode counterpart and contrast was re-checked in dark.", severity: "blocker", requires: ["hasDarkMode"] },
      { id: "token-export", text: "Tokens are exported in a machine-readable format (JSON, CSS custom properties or platform theme file).", severity: "nice", requires: ["hasDesignSystem"] },
    ],
  },
  {
    id: "components",
    title: "Components & states",
    items: [
      { id: "states", text: "Interactive components show default, hover, focus, active, disabled and loading states.", severity: "blocker" },
      { id: "focus-ring", text: "The keyboard focus indicator is drawn, not assumed, and is visible on every background it appears on.", severity: "blocker", requires: ["hasA11yTarget"] },
      { id: "empty-error", text: "Empty, error and 'no results' states are designed for each data-driven surface.", severity: "blocker", requires: ["hasDataViews"] },
      { id: "skeletons", text: "Loading and skeleton treatments are specified, including how long before they appear.", severity: "standard", requires: ["hasDataViews"] },
      { id: "overflow", text: "Long text, long names and large numbers are shown truncating or wrapping as intended.", severity: "standard" },
      { id: "variants", text: "Component variants map to props an engineer can name (size, tone, emphasis), not to visual nicknames.", severity: "standard", requires: ["hasDesignSystem"] },
      { id: "reuse", text: "Anything reused twice is a component instance, so the build does not fork it.", severity: "standard" },
    ],
  },
  {
    id: "layout",
    title: "Layout & responsiveness",
    items: [
      { id: "breakpoints", text: "Layouts are supplied at each breakpoint you support, including the narrowest one.", severity: "blocker", platforms: ["web", "cross"] },
      { id: "min-width", text: "A 320-375px width layout exists and does not scroll horizontally.", severity: "blocker", platforms: ["web", "cross", "ios", "android"] },
      { id: "auto-layout", text: "Frames use auto layout / constraints so resize behaviour is explicit rather than guessed.", severity: "standard" },
      { id: "safe-area", text: "Safe areas, notch and home-indicator insets are respected in the top and bottom regions.", severity: "blocker", platforms: ["ios", "cross"] },
      { id: "system-bars", text: "Status bar and navigation bar treatment (colour, light/dark icons, edge-to-edge) is specified.", severity: "standard", platforms: ["android", "cross"] },
      { id: "tap-targets", text: "Tap targets are at least 44x44pt (iOS) / 48x48dp (Android) including padding.", severity: "blocker", platforms: ["ios", "android", "cross"] },
      { id: "grid", text: "Container max-width, column count and gutters are stated for wide screens.", severity: "standard", platforms: ["web", "cross"] },
    ],
  },
  {
    id: "content",
    title: "Content & data",
    items: [
      { id: "real-copy", text: "Final or realistic copy is in place; no lorem ipsum in anything being built.", severity: "blocker" },
      { id: "microcopy", text: "Button labels, validation messages and toasts are written out, not implied.", severity: "blocker", requires: ["hasForms"] },
      { id: "validation", text: "Field-level rules are documented: required, format, max length and when validation fires.", severity: "blocker", requires: ["hasForms"] },
      { id: "formats", text: "Date, time, number and currency formats are specified per locale.", severity: "standard", requires: ["isLocalized"] },
      { id: "pseudo-loc", text: "Layouts were checked with roughly 30% longer strings for expansion-heavy languages.", severity: "standard", requires: ["isLocalized"] },
      { id: "rtl", text: "Right-to-left mirroring is shown for at least one representative screen.", severity: "standard", requires: ["isLocalized"] },
      { id: "edge-data", text: "Edge-case data is illustrated: zero items, one item, and a very large count.", severity: "standard", requires: ["hasDataViews"] },
    ],
  },
  {
    id: "assets",
    title: "Assets & export",
    items: [
      { id: "export-settings", text: "Icons and images carry export settings (SVG for icons; 1x/2x/3x or WebP/AVIF for raster).", severity: "blocker" },
      { id: "icon-grid", text: "Icons sit on a consistent grid with consistent stroke width and optical sizing.", severity: "standard" },
      { id: "image-rules", text: "Crop, focal point and aspect-ratio rules are stated for user-supplied images.", severity: "standard" },
      { id: "fonts", text: "Font files or webfont sources are supplied along with their licence terms.", severity: "blocker" },
      { id: "alt-text", text: "Meaningful images have alt text written; decorative ones are explicitly marked decorative.", severity: "blocker", requires: ["hasA11yTarget"] },
    ],
  },
  {
    id: "motion",
    title: "Motion & interaction",
    items: [
      { id: "durations", text: "Durations and easing curves are named per transition instead of left to the developer.", severity: "blocker", requires: ["hasMotion"] },
      { id: "triggers", text: "Each animation states its trigger, what it animates, and whether it can be interrupted.", severity: "standard", requires: ["hasMotion"] },
      { id: "reduced-motion", text: "A reduced-motion fallback is defined for every non-essential animation.", severity: "blocker", requires: ["hasMotion"] },
      { id: "gestures", text: "Swipe, long-press and drag behaviours are documented with their thresholds.", severity: "standard", requires: ["hasMotion"], platforms: ["ios", "android", "cross"] },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    items: [
      { id: "contrast", text: "Text contrast meets 4.5:1 (3:1 for text 18.66px bold or 24px+) and UI borders meet 3:1.", severity: "blocker", requires: ["hasA11yTarget"] },
      { id: "order", text: "Reading and focus order is annotated where it differs from the visual order.", severity: "standard", requires: ["hasA11yTarget"] },
      { id: "labels", text: "Icon-only controls have accessible names written down.", severity: "blocker", requires: ["hasA11yTarget"] },
      { id: "not-colour-alone", text: "No status or meaning is carried by colour alone; an icon, label or pattern backs it up.", severity: "standard", requires: ["hasA11yTarget"] },
      { id: "zoom", text: "The design still works at 200% browser zoom or the largest supported dynamic type size.", severity: "standard", requires: ["hasA11yTarget"] },
    ],
  },
  {
    id: "process",
    title: "Process & sign-off",
    items: [
      { id: "walkthrough", text: "A live walkthrough is booked with the engineers who will build it.", severity: "standard" },
      { id: "open-questions", text: "Known unknowns are listed as open questions with an owner against each.", severity: "standard" },
      { id: "scope", text: "Out-of-scope items are written down so they are not silently built or silently dropped.", severity: "standard" },
      { id: "qa-criteria", text: "Acceptance criteria describe how QA will decide the screen matches the design.", severity: "nice" },
      { id: "analytics", text: "Events to instrument are named, with the properties each event should carry.", severity: "nice" },
    ],
  },
];

/** Fill in defaults and reject an unknown platform. */
export function normaliseContext(input) {
  const raw = input && typeof input === "object" ? input : {};
  const platform = typeof raw.platform === "string" ? raw.platform : "web";
  if (!PLATFORMS.includes(platform)) {
    return { error: `Platform must be one of: ${PLATFORMS.join(", ")}.` };
  }
  const ctx = { platform };
  for (const flag of FEATURE_FLAGS) ctx[flag] = raw[flag] === true;
  return ctx;
}

function itemApplies(item, ctx) {
  if (Array.isArray(item.platforms) && !item.platforms.includes(ctx.platform)) return false;
  if (Array.isArray(item.requires) && !item.requires.every((flag) => ctx[flag] === true)) return false;
  if (Array.isArray(item.forbids) && item.forbids.some((flag) => ctx[flag] === true)) return false;
  return true;
}

/**
 * Build the checklist for a project context.
 * @returns {{sections:Array, items:Array, counts:Object}|{error:string}}
 */
export function buildChecklist(input) {
  const ctx = normaliseContext(input);
  if (ctx.error) return ctx;

  const sections = [];
  const items = [];
  const counts = { total: 0, blocker: 0, standard: 0, nice: 0 };

  for (const section of HANDOFF_SECTIONS) {
    const kept = section.items
      .filter((item) => itemApplies(item, ctx))
      .map((item) => ({
        id: `${section.id}.${item.id}`,
        sectionId: section.id,
        sectionTitle: section.title,
        text: item.text,
        severity: item.severity,
      }));
    if (kept.length === 0) continue;
    sections.push({ id: section.id, title: section.title, items: kept });
    for (const item of kept) {
      items.push(item);
      counts.total += 1;
      counts[item.severity] += 1;
    }
  }

  if (counts.total === 0) {
    return { error: "No checklist items match this combination of platform and features." };
  }

  return { context: ctx, sections, items, counts };
}

/** Readiness bands, applied to the weighted percentage. */
export const READINESS_BANDS = [
  { min: 100, label: "Ready to hand off" },
  { min: 80, label: "Nearly ready" },
  { min: 50, label: "Needs work" },
  { min: 0, label: "Not ready" },
];

function bandFor(percent) {
  for (const band of READINESS_BANDS) {
    if (percent >= band.min) return band.label;
  }
  return READINESS_BANDS[READINESS_BANDS.length - 1].label;
}

/**
 * Score a checklist. Items are weighted by severity, and any unticked blocker
 * caps the result below "Ready to hand off" no matter what the percentage says.
 * @param {Array} items  items from buildChecklist
 * @param {Array<string>} checkedIds  ids that have been ticked
 */
export function scoreChecklist(items, checkedIds) {
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Generate a checklist before scoring it." };
  }
  const checked = new Set(Array.isArray(checkedIds) ? checkedIds : []);

  let total = 0;
  let done = 0;
  let weightTotal = 0;
  let weightDone = 0;
  let blockersTotal = 0;
  let blockersDone = 0;
  const openBlockers = [];

  for (const item of items) {
    const weight = SEVERITY_WEIGHT[item.severity] ?? SEVERITY_WEIGHT.standard;
    const isDone = checked.has(item.id);
    total += 1;
    weightTotal += weight;
    if (isDone) {
      done += 1;
      weightDone += weight;
    }
    if (item.severity === "blocker") {
      blockersTotal += 1;
      if (isDone) blockersDone += 1;
      else openBlockers.push(item);
    }
  }

  const percent = weightTotal > 0 ? (weightDone / weightTotal) * 100 : 0;
  const rounded = Math.round(percent * 10) / 10;
  const blockersClear = blockersTotal === 0 || blockersDone === blockersTotal;
  const rawLabel = bandFor(rounded);
  const label = !blockersClear && rawLabel === "Ready to hand off" ? "Nearly ready" : rawLabel;

  return {
    total,
    done,
    remaining: total - done,
    percent: rounded,
    simplePercent: total > 0 ? Math.round((done / total) * 1000) / 10 : 0,
    blockersTotal,
    blockersDone,
    openBlockers,
    blockersClear,
    readiness: label,
    ready: blockersClear && rounded === 100,
  };
}

/** Render the checklist as GitHub-flavoured markdown task lists. */
export function toMarkdown(sections, checkedIds, title) {
  if (!Array.isArray(sections) || sections.length === 0) return "";
  const checked = new Set(Array.isArray(checkedIds) ? checkedIds : []);
  const lines = [`# ${title || "Design handoff checklist"}`, ""];
  for (const section of sections) {
    lines.push(`## ${section.title}`);
    for (const item of section.items) {
      const box = checked.has(item.id) ? "x" : " ";
      const tag = item.severity === "blocker" ? " **(blocker)**" : "";
      lines.push(`- [${box}] ${item.text}${tag}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}
