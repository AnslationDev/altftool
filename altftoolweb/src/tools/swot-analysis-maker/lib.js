/**
 * SWOT Analysis Maker — build the grid, check it, and derive the TOWS pairings.
 *
 * THE FRAMEWORK
 *   SWOT sorts findings on two axes:
 *     origin  — internal (things you control) vs external (things you only react to)
 *     effect  — helpful vs harmful to the objective
 *   That gives the four quadrants:
 *     Strengths      internal + helpful
 *     Weaknesses     internal + harmful
 *     Opportunities  external + helpful
 *     Threats        external + harmful
 *   The two-axis form is the one taught in strategy courses and is what makes the
 *   common mistake obvious: "the market is growing" is an Opportunity, not a Strength,
 *   because you do not control it.
 *
 * TOWS — turning the grid into strategies
 *   Heinz Weihrich, "The TOWS Matrix — A Tool for Situational Analysis" (Long Range
 *   Planning, vol. 15 no. 2, 1982), crossed the quadrants to produce four strategy types:
 *     SO  maxi-maxi   use a strength to take an opportunity      (attack)
 *     WO  mini-maxi   fix a weakness so you can take one         (build)
 *     ST  maxi-mini   use a strength to blunt a threat           (defend)
 *     WT  mini-mini   reduce a weakness that a threat exploits   (retreat / mitigate)
 *   A SWOT with no TOWS is a list; TOWS is where it becomes a decision.
 *
 * THE CHECKS THIS TOOL MAKES ARE ITS OWN EDITORIAL THRESHOLDS, NOT RESEARCH FINDINGS:
 *   - a quadrant with fewer than MIN_ITEMS_PER_QUADRANT entries is thin
 *   - a quadrant with more than MAX_ITEMS_PER_QUADRANT stops being readable in a grid
 *   - an entry longer than MAX_ITEM_LENGTH characters is a paragraph, not a bullet
 *
 * Pure module: text in, structured data and Markdown out. No clock, no DOM.
 */

/** Below this a quadrant looks under-explored. This tool's own editorial threshold. */
export const MIN_ITEMS_PER_QUADRANT = 3;

/** Above this a quadrant no longer reads as a grid cell. This tool's own threshold. */
export const MAX_ITEMS_PER_QUADRANT = 7;

/** Hard cap so a pasted document cannot turn into a thousand-row grid. */
export const HARD_ITEM_CAP = 30;

/** An entry longer than this is prose rather than a bullet. */
export const MAX_ITEM_LENGTH = 120;

/** Largest number of TOWS pairings the tool will enumerate for one cross. */
export const MAX_PAIRS_PER_CROSS = 25;

/** The four quadrants, with the two axes that define them. */
export const QUADRANTS = [
  {
    id: "strengths",
    label: "Strengths",
    letter: "S",
    origin: "Internal",
    effect: "Helpful",
    prompt: "What do you do better than the alternatives, and control outright?",
    examples: ["Owned distribution", "Lower unit cost than rivals", "Team with 10 years in the domain"],
  },
  {
    id: "weaknesses",
    label: "Weaknesses",
    letter: "W",
    origin: "Internal",
    effect: "Harmful",
    prompt: "What holds you back that is yours to fix?",
    examples: ["Single point of failure in fulfilment", "No brand recognition outside one city", "Undocumented codebase"],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    letter: "O",
    origin: "External",
    effect: "Helpful",
    prompt: "What is changing outside that you could ride?",
    examples: ["New regulation opens a channel", "A rival is exiting the segment", "Input costs falling"],
  },
  {
    id: "threats",
    label: "Threats",
    letter: "T",
    origin: "External",
    effect: "Harmful",
    prompt: "What is changing outside that could hurt you?",
    examples: ["Two funded entrants", "Key supplier consolidating", "Rates rising into your refinancing window"],
  },
];

/** The four TOWS crosses of Weihrich (1982). */
export const TOWS_STRATEGIES = [
  {
    id: "so",
    code: "SO",
    name: "Maxi-maxi",
    from: "strengths",
    against: "opportunities",
    intent: "Attack — use a strength to take an opportunity.",
    template: (a, b) => `Use "${a}" to capture "${b}".`,
  },
  {
    id: "wo",
    code: "WO",
    name: "Mini-maxi",
    from: "weaknesses",
    against: "opportunities",
    intent: "Build — fix a weakness that is blocking an opportunity.",
    template: (a, b) => `Fix "${a}" so you can capture "${b}".`,
  },
  {
    id: "st",
    code: "ST",
    name: "Maxi-mini",
    from: "strengths",
    against: "threats",
    intent: "Defend — use a strength to blunt a threat.",
    template: (a, b) => `Use "${a}" to defend against "${b}".`,
  },
  {
    id: "wt",
    code: "WT",
    name: "Mini-mini",
    from: "weaknesses",
    against: "threats",
    intent: "Mitigate — reduce a weakness a threat would exploit.",
    template: (a, b) => `Reduce "${a}" before "${b}" exploits it.`,
  },
];

/**
 * Split a textarea's contents into clean bullet items.
 * Blank lines are dropped and leading list markers ("-", "*", "1.") are stripped.
 */
export function parseItems(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line !== "")
    .slice(0, HARD_ITEM_CAP);
}

/**
 * Build the analysis.
 *
 * @param {object} input  { title, strengths, weaknesses, opportunities, threats }
 *                        each quadrant is one string, one item per line
 * @returns {object} quadrants, counts, balance and warnings — or { error }
 */
export function analyzeSwot(input = {}) {
  const quadrants = QUADRANTS.map((q) => {
    const items = parseItems(input[q.id] ?? "");
    return { ...q, items, count: items.length };
  });

  const total = quadrants.reduce((sum, q) => sum + q.count, 0);
  if (total === 0)
    return { error: "Add at least one item to one of the four quadrants to build a SWOT." };

  const byId = Object.fromEntries(quadrants.map((q) => [q.id, q]));

  const internal = byId.strengths.count + byId.weaknesses.count;
  const external = byId.opportunities.count + byId.threats.count;
  const helpful = byId.strengths.count + byId.opportunities.count;
  const harmful = byId.weaknesses.count + byId.threats.count;

  // Share of the four quadrants that reach the minimum item count.
  const filledQuadrants = quadrants.filter((q) => q.count >= MIN_ITEMS_PER_QUADRANT).length;
  const completeness = (filledQuadrants / QUADRANTS.length) * 100;

  const warnings = [];
  for (const q of quadrants) {
    if (q.count === 0) {
      warnings.push(`${q.label} is empty — a SWOT with a blank quadrant is a half-analysis.`);
    } else if (q.count < MIN_ITEMS_PER_QUADRANT) {
      warnings.push(
        `${q.label} has only ${q.count} item${q.count === 1 ? "" : "s"} — aim for at least ${MIN_ITEMS_PER_QUADRANT}.`,
      );
    } else if (q.count > MAX_ITEMS_PER_QUADRANT) {
      warnings.push(
        `${q.label} has ${q.count} items — more than ${MAX_ITEMS_PER_QUADRANT} stops reading as a grid; merge the weakest.`,
      );
    }
    const longItems = q.items.filter((item) => item.length > MAX_ITEM_LENGTH).length;
    if (longItems > 0) {
      warnings.push(
        `${q.label} has ${longItems} entr${longItems === 1 ? "y" : "ies"} over ${MAX_ITEM_LENGTH} characters — shorten to a bullet.`,
      );
    }
  }
  if (internal > 0 && external === 0)
    warnings.push("Everything listed is internal — nothing about the market, rivals or regulation.");
  if (external > 0 && internal === 0)
    warnings.push("Everything listed is external — nothing you actually control.");

  return {
    title: typeof input.title === "string" && input.title.trim() !== "" ? input.title.trim() : "SWOT analysis",
    quadrants,
    total,
    internal,
    external,
    helpful,
    harmful,
    internalShare: total > 0 ? (internal / total) * 100 : 0,
    helpfulShare: total > 0 ? (helpful / total) * 100 : 0,
    completeness,
    filledQuadrants,
    warnings,
  };
}

/**
 * Cross the quadrants into TOWS strategy candidates.
 * Each cross is capped at MAX_PAIRS_PER_CROSS so a big grid does not explode.
 */
export function buildTows(analysis) {
  if (!analysis || analysis.error) return { error: analysis?.error ?? "Nothing to cross." };
  const byId = Object.fromEntries(analysis.quadrants.map((q) => [q.id, q]));

  return {
    crosses: TOWS_STRATEGIES.map((strategy) => {
      const left = byId[strategy.from].items;
      const right = byId[strategy.against].items;
      const pairs = [];
      for (const a of left) {
        for (const b of right) {
          if (pairs.length >= MAX_PAIRS_PER_CROSS) break;
          pairs.push({ a, b, text: strategy.template(a, b) });
        }
        if (pairs.length >= MAX_PAIRS_PER_CROSS) break;
      }
      return {
        ...strategy,
        possible: left.length * right.length,
        truncated: left.length * right.length > pairs.length,
        pairs,
      };
    }),
  };
}

/** Render the grid as a Markdown table plus the TOWS section. */
export function toMarkdown(analysis, options = {}) {
  if (!analysis || analysis.error) return "";
  const includeTows = options.includeTows ?? true;
  const lines = [`# ${analysis.title}`, ""];

  lines.push("| Helpful | Harmful |", "| --- | --- |");
  const cell = (q) =>
    q.items.length === 0 ? "_(empty)_" : q.items.map((i) => `• ${i}`).join("<br>");
  const byId = Object.fromEntries(analysis.quadrants.map((q) => [q.id, q]));
  lines.push(`| **Strengths** (internal)<br>${cell(byId.strengths)} | **Weaknesses** (internal)<br>${cell(byId.weaknesses)} |`);
  lines.push(`| **Opportunities** (external)<br>${cell(byId.opportunities)} | **Threats** (external)<br>${cell(byId.threats)} |`);
  lines.push("");

  for (const q of analysis.quadrants) {
    lines.push(`## ${q.label} (${q.origin.toLowerCase()}, ${q.effect.toLowerCase()})`);
    if (q.items.length === 0) lines.push("_Nothing listed._");
    else for (const item of q.items) lines.push(`- ${item}`);
    lines.push("");
  }

  if (includeTows) {
    const tows = buildTows(analysis);
    if (!tows.error) {
      lines.push("## TOWS strategies (Weihrich, 1982)", "");
      for (const cross of tows.crosses) {
        lines.push(`### ${cross.code} — ${cross.name}`);
        lines.push(`_${cross.intent}_`);
        if (cross.pairs.length === 0) lines.push("_Not enough items to cross._");
        else for (const pair of cross.pairs) lines.push(`- ${pair.text}`);
        if (cross.truncated)
          lines.push(`- _…${cross.possible - cross.pairs.length} more combinations not listed._`);
        lines.push("");
      }
    }
  }

  return lines.join("\n").trim();
}

/** Render the four lists as CSV: quadrant, origin, effect, item. */
export function toCsv(analysis) {
  if (!analysis || analysis.error) return "";
  const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = [["Quadrant", "Origin", "Effect", "Item"].map(escape).join(",")];
  for (const q of analysis.quadrants) {
    for (const item of q.items) {
      rows.push([q.label, q.origin, q.effect, item].map(escape).join(","));
    }
  }
  return rows.join("\n");
}
