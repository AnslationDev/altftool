/**
 * Exam answer presentation self-check.
 *
 * The checklist condenses presentation guidance that appears consistently in
 * examiner reports and answer-writing guides for written university and
 * board exams (structure your answer, signpost with headings, support with
 * labelled diagrams, emphasise keywords, keep the script legible). Weights
 * reflect how often examiner reports flag each habit: structure and content
 * organisation are weighted heaviest, cosmetic habits lightest.
 */

export const CHECKLIST_CATEGORIES = [
  {
    id: "structure",
    label: "Structure",
    items: [
      { id: "intro-line", weight: 4, label: "Answer opens with a direct 1-2 line introduction that addresses the question" },
      { id: "logical-flow", weight: 5, label: "Points follow a logical order (definition → explanation → example → conclusion)" },
      { id: "paragraph-per-point", weight: 4, label: "Each distinct point sits in its own paragraph or numbered block" },
      { id: "conclusion", weight: 3, label: "A short conclusion or summary line closes the answer" },
      { id: "word-limit", weight: 3, label: "Answer length matches the marks allotted (no 3-page answer for 2 marks)" },
    ],
  },
  {
    id: "headings",
    label: "Headings & signposting",
    items: [
      { id: "headings-used", weight: 4, label: "Sub-headings or side-headings break up answers longer than a page" },
      { id: "numbering", weight: 3, label: "Lists use numbering or bullets instead of long run-on sentences" },
      { id: "question-numbering", weight: 3, label: "Question and part numbers are written exactly as in the paper" },
    ],
  },
  {
    id: "diagrams",
    label: "Diagrams & figures",
    items: [
      { id: "diagram-included", weight: 4, label: "A diagram, flowchart or table is included wherever it can replace a paragraph" },
      { id: "diagram-labelled", weight: 4, label: "Every diagram has a caption and labelled parts" },
      { id: "diagram-pencil", weight: 2, label: "Diagrams are drawn with a pencil and ruler where required" },
      { id: "diagram-referenced", weight: 2, label: "The text refers to the diagram (e.g. 'as shown in Fig. 1')" },
    ],
  },
  {
    id: "emphasis",
    label: "Emphasis & underlining",
    items: [
      { id: "keywords-underlined", weight: 3, label: "Keywords and technical terms are underlined or highlighted once" },
      { id: "definitions-marked", weight: 2, label: "Definitions and formulae stand out on their own line" },
      { id: "no-over-underlining", weight: 2, label: "Underlining is selective — not whole sentences or paragraphs" },
    ],
  },
  {
    id: "legibility",
    label: "Legibility & layout",
    items: [
      { id: "margins", weight: 2, label: "Margins are respected and space is left between answers" },
      { id: "handwriting", weight: 3, label: "Handwriting stays consistent and readable to the last page" },
      { id: "clean-corrections", weight: 2, label: "Mistakes are struck through with a single neat line, not scribbled" },
    ],
  },
];

/** All items flattened, for lookup and totals. */
export const ALL_ITEMS = CHECKLIST_CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({ ...item, categoryId: category.id, categoryLabel: category.label })),
);

/** Maximum achievable weighted score (sum of all item weights). */
export const MAX_SCORE = ALL_ITEMS.reduce((sum, item) => sum + item.weight, 0);

/**
 * Rating bands. Thresholds are the tool's own convention for turning the
 * weighted checklist into a plain-language verdict.
 */
export const RATING_BANDS = [
  { min: 85, label: "Excellent presentation", tone: "success" },
  { min: 70, label: "Good — minor polish needed", tone: "success" },
  { min: 50, label: "Adequate — several habits to fix", tone: "warn" },
  { min: 0, label: "Needs a presentation overhaul", tone: "danger" },
];

/**
 * Score the checklist.
 *
 * @param {object} input
 * @param {string[]} input.checkedIds  Ids of the checklist items the writer has ticked.
 * @returns {object} score breakdown or { error }
 */
export function computePresentationScore({ checkedIds }) {
  if (!Array.isArray(checkedIds)) {
    return { error: "Tick the habits that apply to your answer." };
  }
  const checked = new Set(checkedIds.filter((id) => typeof id === "string"));

  let earned = 0;
  const categories = CHECKLIST_CATEGORIES.map((category) => {
    const max = category.items.reduce((sum, item) => sum + item.weight, 0);
    const got = category.items.reduce(
      (sum, item) => sum + (checked.has(item.id) ? item.weight : 0),
      0,
    );
    earned += got;
    return {
      id: category.id,
      label: category.label,
      earned: got,
      max,
      percent: max > 0 ? (got / max) * 100 : 0,
    };
  });

  const percent = MAX_SCORE > 0 ? (earned / MAX_SCORE) * 100 : 0;
  const band = RATING_BANDS.find((entry) => percent >= entry.min) ?? RATING_BANDS[RATING_BANDS.length - 1];

  // Highest-weight unticked items become the top suggestions.
  const suggestions = ALL_ITEMS.filter((item) => !checked.has(item.id))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((item) => ({ id: item.id, label: item.label, weight: item.weight, category: item.categoryLabel }));

  return {
    earned,
    maxScore: MAX_SCORE,
    percent,
    band: band.label,
    bandTone: band.tone,
    checkedCount: ALL_ITEMS.filter((item) => checked.has(item.id)).length,
    totalCount: ALL_ITEMS.length,
    categories,
    suggestions,
  };
}
