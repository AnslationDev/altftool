/**
 * Figma AI Prompt Builder — frame presets, column-grid arithmetic, component
 * naming rules and prompt assembly.
 *
 * The grid formula is the standard one used by every layout grid in Figma:
 *   column width = (frame width - 2 x margin - (columns - 1) x gutter) / columns
 * Frame sizes below are Figma's own default frame presets.
 */

/** Figma default frame presets, width x height in pixels. */
export const FRAME_PRESETS = [
  { id: "desktop", label: "Desktop — 1440 x 1024", width: 1440, height: 1024, margin: 80, gutter: 24, columns: 12 },
  { id: "desktop-hd", label: "Desktop HD — 1920 x 1080", width: 1920, height: 1080, margin: 120, gutter: 32, columns: 12 },
  { id: "tablet", label: "Tablet — 768 x 1024", width: 768, height: 1024, margin: 32, gutter: 24, columns: 8 },
  { id: "mobile", label: "Mobile — 375 x 812", width: 375, height: 812, margin: 16, gutter: 16, columns: 4 },
];

/**
 * The 8-point grid is a widely used spacing convention, not a Figma rule:
 * every spacing, size and radius value is a multiple of 8 (or 4 for small
 * steps) so components stack cleanly at any zoom.
 */
export const BASE_GRID_UNIT = 8;
export const HALF_GRID_UNIT = 4;

/** Practical bounds so the grid maths stays meaningful. */
export const MIN_COLUMNS = 1;
export const MAX_COLUMNS = 24;
export const MIN_FRAME_WIDTH = 200;
export const MAX_FRAME_WIDTH = 8000;

/**
 * A minimum readable column width. Below roughly this many pixels a column
 * cannot hold a word of body copy, so the grid is not doing any real work.
 */
export const MIN_USEFUL_COLUMN_WIDTH = 24;

export const TASK_TYPES = [
  {
    id: "wireframe",
    label: "Describe a wireframe",
    instruction:
      "Describe a low-fidelity wireframe for the screen below, section by section from the top of the frame down.",
    deliverable:
      "each section with its purpose, the components in it, its height in pixels and how many grid columns it spans",
    rules: [
      "Describe structure and hierarchy only — no colours, no imagery, no brand language.",
      "Give every section a height that is a multiple of the base grid unit.",
      "Say what the single most important element on the screen is and why it wins.",
    ],
  },
  {
    id: "naming",
    label: "Clean up layer names",
    instruction:
      "Propose a layer and frame naming scheme for this file and show how to apply it.",
    deliverable:
      "the naming pattern, ten before-and-after examples, and the rule for when a layer keeps its default name",
    rules: [
      "Use forward slashes to group component names — Figma turns Button/Primary/Large into nested folders in the Assets panel.",
      "Never leave a default name like Frame 27, Rectangle 12 or Group 4 on anything that ships.",
      "Name layers for what they are, not what they look like: Price, not Big Green Text.",
    ],
  },
  {
    id: "variants",
    label: "Plan component variants",
    instruction: "Plan the variant properties for this component set.",
    deliverable:
      "each property with its allowed values, the total number of variants that produces, and which combinations should not exist",
    rules: [
      "Write properties as Property=Value pairs and keep property names consistent across the whole library.",
      "Multiply the values out and state the variant count — if it goes past a few dozen, split the component instead.",
      "Use a boolean property for anything that is genuinely on or off, not a two-value string.",
    ],
  },
  {
    id: "tokens",
    label: "Name design tokens",
    instruction: "Propose names for the design tokens this file needs.",
    deliverable:
      "a token table with the name, the category, the raw value and the one-line rule for when to use it",
    rules: [
      "Separate primitive tokens (the raw values) from semantic tokens (the ones components reference).",
      "Never put a literal colour or size in a semantic token name — surface-raised, not grey-100.",
      "Keep the naming pattern identical across colour, spacing, radius and typography.",
    ],
  },
  {
    id: "audit",
    label: "Audit the design system",
    instruction:
      "Audit this file for inconsistencies against its own design system and rank what to fix first.",
    deliverable:
      "the issues grouped by type, each with how many instances it affects and the effort to fix it",
    rules: [
      "Look for detached instances, one-off colours and text styles, and spacing values off the base grid.",
      "Rank by instance count times blast radius, not by how annoying the issue feels.",
      "Say which issues can be fixed by a select-all-and-swap and which need a designer's judgement.",
    ],
  },
  {
    id: "a11y",
    label: "Accessibility review",
    instruction: "Review this screen for accessibility problems that can be seen in the design file.",
    deliverable:
      "each finding with the element, the rule it breaks, the measured value and the fix",
    rules: [
      "Check text contrast against WCAG 2.2: 4.5:1 for body text and 3:1 for text at 18pt or 14pt bold and above.",
      "Check that interactive targets are at least 24 by 24 CSS pixels, which is the WCAG 2.2 AA target size minimum.",
      "Flag anything that carries meaning through colour alone, and note where focus order is ambiguous.",
    ],
  },
  {
    id: "handoff",
    label: "Write dev handoff notes",
    instruction: "Write handoff notes for the engineer building this screen.",
    deliverable:
      "the layout behaviour, the responsive rules, the states of every interactive element, and the open questions",
    rules: [
      "Describe layout in terms of auto layout direction, spacing and resizing behaviour, not absolute positions.",
      "Cover every state: default, hover, focus, active, disabled, loading, error and empty.",
      "List what is deliberately undecided so nobody has to guess.",
    ],
  },
];

export const FIDELITY_LEVELS = [
  { id: "low", label: "Low fidelity — boxes and labels", line: "Low fidelity. Grey boxes, placeholder labels, no styling decisions." },
  { id: "mid", label: "Mid fidelity — real copy, no brand", line: "Mid fidelity. Real copy and real hierarchy, but no brand colour or imagery." },
  { id: "high", label: "High fidelity — full visual design", line: "High fidelity. Full type scale, colour and spacing decisions applied." },
];

/** Round a value to the nearest multiple of step. */
export function snapTo(value, step = BASE_GRID_UNIT) {
  const numeric = Number(value);
  const unit = Number(step);
  if (!Number.isFinite(numeric) || !Number.isFinite(unit) || unit <= 0) return null;
  return Math.round(numeric / unit) * unit;
}

/** True when the value sits exactly on a multiple of the base grid unit. */
export function isOnGrid(value, step = BASE_GRID_UNIT) {
  const numeric = Number(value);
  const unit = Number(step);
  if (!Number.isFinite(numeric) || !Number.isFinite(unit) || unit <= 0) return false;
  return Math.abs(numeric % unit) < 1e-9;
}

/**
 * Column grid arithmetic.
 *   content width = frame width - 2 x margin
 *   column width  = (content width - (columns - 1) x gutter) / columns
 * Returns { error } for any grid that cannot physically exist.
 */
export function computeColumnGrid({ frameWidth, margin, gutter, columns } = {}) {
  const width = Number(frameWidth);
  const side = Number(margin);
  const gap = Number(gutter);
  const count = Math.trunc(Number(columns));

  if (!Number.isFinite(width) || width < MIN_FRAME_WIDTH || width > MAX_FRAME_WIDTH) {
    return { error: `Frame width must be between ${MIN_FRAME_WIDTH} and ${MAX_FRAME_WIDTH} pixels.` };
  }
  if (!Number.isFinite(side) || side < 0) {
    return { error: "Side margin cannot be negative." };
  }
  if (!Number.isFinite(gap) || gap < 0) {
    return { error: "Gutter cannot be negative." };
  }
  if (!Number.isFinite(count) || count < MIN_COLUMNS || count > MAX_COLUMNS) {
    return { error: `Use between ${MIN_COLUMNS} and ${MAX_COLUMNS} columns.` };
  }

  const contentWidth = width - side * 2;
  if (contentWidth <= 0) {
    return { error: `Margins of ${side}px on both sides leave no room inside a ${width}px frame.` };
  }

  const totalGutter = (count - 1) * gap;
  if (totalGutter >= contentWidth) {
    return {
      error: `${count} columns with a ${gap}px gutter need ${totalGutter}px of gutter, which is more than the ${contentWidth}px of content width available.`,
    };
  }

  const columnWidth = (contentWidth - totalGutter) / count;

  return {
    frameWidth: width,
    margin: side,
    gutter: gap,
    columns: count,
    contentWidth,
    totalGutter,
    columnWidth,
    columnWidthRounded: Math.round(columnWidth * 100) / 100,
    columnWidthSnapped: snapTo(columnWidth, BASE_GRID_UNIT),
    columnOnGrid: isOnGrid(columnWidth, BASE_GRID_UNIT),
    marginOnGrid: isOnGrid(side, BASE_GRID_UNIT),
    gutterOnGrid: isOnGrid(gap, BASE_GRID_UNIT),
    tooNarrow: columnWidth < MIN_USEFUL_COLUMN_WIDTH,
  };
}

/** Width in pixels of a span of N columns, including the gutters between them. */
export function spanWidth(grid, span) {
  if (!grid || grid.error) return null;
  const count = Math.trunc(Number(span));
  if (!Number.isFinite(count) || count < 1 || count > grid.columns) return null;
  return count * grid.columnWidth + (count - 1) * grid.gutter;
}

const NAME_CLEAN_RE = /[^A-Za-z0-9 ]+/g;

/** Title-case one path segment and strip characters that make names noisy. */
export function cleanNameSegment(raw) {
  return String(raw ?? "")
    .replace(NAME_CLEAN_RE, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Build a Figma component name. Slashes are meaningful: Button/Primary/Large
 * appears as a nested folder in the Assets panel, one level per slash.
 */
export function buildComponentName(pathParts) {
  const segments = (Array.isArray(pathParts) ? pathParts : String(pathParts ?? "").split("/"))
    .map((part) => cleanNameSegment(part))
    .filter(Boolean);
  if (segments.length === 0) return { error: "Give the component at least one name segment." };
  return {
    name: segments.join("/"),
    segments,
    nestingDepth: segments.length - 1,
  };
}

/** Multiply variant property values out to the total number of variants. */
export function countVariants(properties) {
  if (!Array.isArray(properties) || properties.length === 0) {
    return { error: "List at least one variant property." };
  }
  let total = 1;
  const rows = [];
  for (const property of properties) {
    const values = String(property?.values ?? "")
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.length === 0) {
      return { error: `Property "${property?.name || "unnamed"}" has no values.` };
    }
    total *= values.length;
    rows.push({ name: cleanNameSegment(property?.name) || "Property", values });
  }
  return { total, rows };
}

/**
 * Assemble the finished Figma AI prompt.
 * Returns { error } for unusable input rather than a partial prompt.
 */
export function buildFigmaPrompt({
  screenName = "",
  purpose = "",
  frameWidth = 1440,
  frameHeight = 1024,
  margin = 80,
  gutter = 24,
  columns = 12,
  taskId = "wireframe",
  fidelityId = "mid",
  componentPath = "",
  autoLayout = true,
  useGridUnit = true,
  extraContext = "",
} = {}) {
  const screen = String(screenName ?? "").trim();
  if (!screen) return { error: "Name the screen or component you are working on." };

  const purposeText = String(purpose ?? "").trim();
  if (!purposeText) return { error: "Say in one sentence what this screen is for." };

  const task = TASK_TYPES.find((entry) => entry.id === taskId);
  if (!task) return { error: "Pick what you want the assistant to produce." };

  const grid = computeColumnGrid({ frameWidth, margin, gutter, columns });
  if (grid.error) return { error: grid.error };

  const height = Number(frameHeight);
  if (!Number.isFinite(height) || height <= 0) {
    return { error: "Frame height must be greater than zero." };
  }

  const fidelity = FIDELITY_LEVELS.find((entry) => entry.id === fidelityId) || FIDELITY_LEVELS[1];

  const warnings = [];
  if (!grid.columnOnGrid) {
    warnings.push(
      `Columns land on ${grid.columnWidthRounded}px, which is not a multiple of ${BASE_GRID_UNIT} — expect half-pixel edges unless components snap to the grid rather than to the columns.`,
    );
  }
  if (!grid.marginOnGrid) {
    warnings.push(`A ${grid.margin}px margin is off the ${BASE_GRID_UNIT}px grid.`);
  }
  if (!grid.gutterOnGrid) {
    warnings.push(`A ${grid.gutter}px gutter is off the ${BASE_GRID_UNIT}px grid.`);
  }
  if (grid.tooNarrow) {
    warnings.push(
      `At ${grid.columnWidthRounded}px a column is too narrow to hold a word of body copy — use fewer columns.`,
    );
  }

  let componentName = null;
  if (String(componentPath ?? "").trim()) {
    const built = buildComponentName(componentPath);
    if (built.error) return { error: built.error };
    componentName = built;
    if (built.nestingDepth === 0) {
      warnings.push(
        `"${built.name}" has no slash, so it will not group in the Assets panel — try Group/${built.name}.`,
      );
    }
  }

  const lines = [];
  lines.push(`Screen or component: ${screen}`);
  lines.push(`Purpose: ${purposeText}`);
  lines.push("");
  lines.push(
    `Frame: ${grid.frameWidth} x ${height} px, ${grid.columns} column${grid.columns === 1 ? "" : "s"}, ${grid.margin}px side margins, ${grid.gutter}px gutters.`,
  );
  lines.push(
    `That gives ${grid.contentWidth}px of content width and a column width of ${grid.columnWidthRounded}px.`,
  );
  if (grid.columns >= 2) {
    const half = spanWidth(grid, Math.floor(grid.columns / 2));
    if (half !== null) {
      lines.push(
        `A ${Math.floor(grid.columns / 2)}-column block is ${Math.round(half * 100) / 100}px wide including its gutters.`,
      );
    }
  }
  if (componentName) {
    lines.push(
      `Component naming path: ${componentName.name} (${componentName.nestingDepth} level${componentName.nestingDepth === 1 ? "" : "s"} of nesting in the Assets panel).`,
    );
  }
  lines.push("");
  lines.push(`Task: ${task.instruction}`);
  lines.push(`Return: ${task.deliverable}.`);
  lines.push(`Fidelity: ${fidelity.line}`);
  lines.push("");
  lines.push("Rules:");
  task.rules.forEach((rule) => lines.push(`- ${rule}`));
  if (useGridUnit) {
    lines.push(
      `- Every spacing, size and radius value must be a multiple of ${BASE_GRID_UNIT}px, or ${HALF_GRID_UNIT}px for values under ${BASE_GRID_UNIT * 2}px.`,
    );
  }
  if (autoLayout) {
    lines.push(
      "- Assume auto layout everywhere: describe direction, spacing between items, padding and hug-or-fill resizing rather than absolute x and y positions.",
    );
  }
  lines.push("- Give every measurement in pixels. Do not say 'some padding' or 'a bit of space'.");
  lines.push("- If something is genuinely a judgement call, list it as an open question instead of deciding it silently.");

  const context = String(extraContext ?? "").trim();
  if (context) {
    lines.push("");
    lines.push(`Extra context: ${context}`);
  }

  const prompt = lines.join("\n");

  return {
    prompt,
    warnings,
    grid,
    componentName,
    frameHeight: height,
    characterCount: prompt.length,
  };
}
