/**
 * Lab Report Structure Guide — pure logic.
 *
 * Turns a word target into an IMRaD section skeleton with word budgets and a
 * what-goes-where checklist, and provides the two error calculations every
 * results section needs: percent error against an accepted value, and percent
 * difference between two measurements with no accepted value.
 *
 * No React, no DOM, no clock reads.
 */

/* ------------------------------- constants ------------------------------- */

/**
 * APA 7th edition recommends an abstract of 150-250 words, and most course
 * rubrics and journals reuse that ceiling. Used as a hard cap: any surplus is
 * redistributed to the other sections.
 */
export const ABSTRACT_MAX_WORDS = 250;
export const ABSTRACT_TYPICAL_MIN_WORDS = 150;

/** A report shorter than this has no room for separate IMRaD sections. */
export const MIN_TOTAL_WORDS = 300;
/** Beyond this you are writing a dissertation chapter, not a lab report. */
export const MAX_TOTAL_WORDS = 8000;

/**
 * IMRaD — Introduction, Methods, Results and Discussion — is the standard
 * structure for reporting original experimental work and is the shape almost
 * every lab-report rubric is built on.
 *
 * The shares below follow common university science writing-centre guidance:
 * the discussion is the largest section, the methods the most compressible,
 * and each style's shares sum to exactly 1.
 */
export const REPORT_STYLES = {
  school: {
    id: "school",
    label: "School practical write-up",
    summary: "Aim, hypothesis, apparatus, method, results, discussion, conclusion.",
    sections: [
      {
        id: "aim",
        label: "Aim",
        share: 0.05,
        tense: "present or past",
        checklist: [
          "One sentence naming the quantity or relationship being investigated.",
          "State the independent and dependent variable explicitly.",
        ],
      },
      {
        id: "hypothesis",
        label: "Hypothesis",
        share: 0.05,
        tense: "present",
        checklist: [
          "A testable prediction in if/then form, not a guess about the result.",
          "Say briefly why theory leads you to expect it.",
        ],
      },
      {
        id: "materials",
        label: "Apparatus and materials",
        share: 0.08,
        tense: "past",
        checklist: [
          "List every instrument with its measurement range and resolution.",
          "Give concentrations, masses and model numbers where they matter.",
        ],
      },
      {
        id: "method",
        label: "Method",
        share: 0.22,
        tense: "past passive",
        checklist: [
          "Written so another student could repeat it without asking you anything.",
          "Name the controlled variables and how each was kept constant.",
          "State how many repeats were taken and why.",
        ],
      },
      {
        id: "results",
        label: "Results",
        share: 0.2,
        tense: "past",
        checklist: [
          "Raw data table with units in the column headings, not in every cell.",
          "Every figure and table numbered and captioned.",
          "Report values to the resolution of the instrument, no further.",
        ],
      },
      {
        id: "discussion",
        label: "Discussion",
        share: 0.3,
        tense: "present for claims, past for your data",
        checklist: [
          "Answer the aim first, in one sentence.",
          "Compare your value with the accepted value and give the percent error.",
          "Separate random error from systematic error; say which dominates.",
          "Name one improvement that would actually reduce the dominant error.",
        ],
      },
      {
        id: "conclusion",
        label: "Conclusion",
        share: 0.1,
        tense: "past",
        checklist: [
          "State the result with its uncertainty and units.",
          "Say whether the hypothesis was supported — no new information here.",
        ],
      },
    ],
  },
  undergraduate: {
    id: "undergraduate",
    label: "Undergraduate lab report",
    summary: "Abstract, introduction, methods, results, discussion, conclusion, references.",
    sections: [
      {
        id: "abstract",
        label: "Abstract",
        share: 0.06,
        tense: "past",
        checklist: [
          "One sentence each: purpose, method, key result with number, conclusion.",
          "No citations, no abbreviations that are not defined here.",
          `Keep it under ${ABSTRACT_MAX_WORDS} words — the APA ceiling most rubrics reuse.`,
        ],
      },
      {
        id: "introduction",
        label: "Introduction",
        share: 0.18,
        tense: "present for theory, past for prior work",
        checklist: [
          "Move from established theory to the specific gap this experiment addresses.",
          "State the governing equation and define every symbol.",
          "End with the aim and the hypothesis.",
        ],
      },
      {
        id: "methods",
        label: "Materials and methods",
        share: 0.16,
        tense: "past passive",
        checklist: [
          "Reproducible by a peer without the lab manual in front of them.",
          "Instrument make, model and stated uncertainty for each measurement.",
          "Sample size and how the sample was selected or prepared.",
        ],
      },
      {
        id: "results",
        label: "Results",
        share: 0.2,
        tense: "past",
        checklist: [
          "Data presented, not interpreted — interpretation belongs in the discussion.",
          "Each figure has axis labels with units and a caption below it.",
          "Quote uncertainties and state how they were propagated.",
        ],
      },
      {
        id: "discussion",
        label: "Discussion",
        share: 0.3,
        tense: "present for interpretation",
        checklist: [
          "Answer the research question in the first sentence.",
          "Compare with the accepted or literature value, with percent error.",
          "Explain anomalies rather than dismissing them as 'human error'.",
          "State the limitations that actually bound the conclusion.",
        ],
      },
      {
        id: "conclusion",
        label: "Conclusion",
        share: 0.1,
        tense: "past",
        checklist: [
          "The result, its uncertainty and what it means, in three sentences.",
          "One concrete next experiment.",
        ],
      },
    ],
  },
  imrad: {
    id: "imrad",
    label: "Formal IMRaD report",
    summary: "Abstract, introduction, methods, results, discussion — journal shape.",
    sections: [
      {
        id: "abstract",
        label: "Abstract",
        share: 0.07,
        tense: "past",
        checklist: [
          "Structured as background, methods, results, conclusion.",
          "At least one quantitative result with its uncertainty.",
          `Hard limit of ${ABSTRACT_MAX_WORDS} words.`,
        ],
      },
      {
        id: "introduction",
        label: "Introduction",
        share: 0.2,
        tense: "present perfect for prior work",
        checklist: [
          "Funnel: field, specific problem, what is unknown, what this work does.",
          "Cite prior work for every claim that is not your own data.",
          "Final paragraph states the objective and scope.",
        ],
      },
      {
        id: "methods",
        label: "Methods",
        share: 0.18,
        tense: "past passive",
        checklist: [
          "Subheadings by procedure, not chronology.",
          "Statistical tests named with the significance level used.",
          "Enough detail for independent replication.",
        ],
      },
      {
        id: "results",
        label: "Results",
        share: 0.22,
        tense: "past",
        checklist: [
          "Text points at the figures; it does not repeat every number in them.",
          "Report effect sizes and uncertainties, not just p-values.",
          "No interpretation and no references to other studies.",
        ],
      },
      {
        id: "discussion",
        label: "Discussion",
        share: 0.33,
        tense: "present for claims",
        checklist: [
          "Open with the principal finding, stated plainly.",
          "Place the finding against the cited literature, agreeing and disagreeing.",
          "State limitations before a reviewer does.",
          "Close with implications and the next question.",
        ],
      },
    ],
  },
};

/** Sections every style should carry even though they hold no prose budget. */
export const NON_PROSE_SECTIONS = [
  { id: "title", label: "Title page", note: "Descriptive title, your name, partner names, date performed." },
  { id: "references", label: "References", note: "Every source cited in the text, in your course's citation style." },
  { id: "appendix", label: "Appendices", note: "Raw data sheets, sample calculations, risk assessment." },
];

/* ------------------------------- helpers -------------------------------- */

/**
 * Split `total` across `shares` so the parts are whole numbers that sum
 * exactly to `total` (largest-remainder method).
 */
export function allocateByShares(total, shares) {
  const t = Math.max(0, Math.round(Number(total) || 0));
  const list = Array.isArray(shares) ? shares.map((s) => Math.max(0, Number(s) || 0)) : [];
  const sum = list.reduce((acc, value) => acc + value, 0);
  if (list.length === 0 || sum <= 0) return list.map(() => 0);

  const raw = list.map((share) => (t * share) / sum);
  const floors = raw.map((value) => Math.floor(value));
  let remaining = t - floors.reduce((acc, value) => acc + value, 0);

  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  const result = [...floors];
  let cursor = 0;
  while (remaining > 0 && order.length > 0) {
    result[order[cursor % order.length].index] += 1;
    remaining -= 1;
    cursor += 1;
  }
  return result;
}

/**
 * Percent error against a known accepted value.
 * percent error = (experimental - accepted) / accepted x 100
 */
export function percentError({ experimental, accepted } = {}) {
  const exp = Number(experimental);
  const acc = Number(accepted);
  if (!Number.isFinite(exp) || !Number.isFinite(acc)) {
    return { error: "Enter both the measured value and the accepted value as numbers." };
  }
  if (acc === 0) {
    return { error: "The accepted value cannot be zero — use percent difference instead." };
  }
  const signed = ((exp - acc) / acc) * 100;
  return {
    signed,
    magnitude: Math.abs(signed),
    direction: signed > 0 ? "above" : signed < 0 ? "below" : "exactly on",
    absoluteError: Math.abs(exp - acc),
  };
}

/**
 * Percent difference between two measurements when neither is "correct".
 * percent difference = |a - b| / ((a + b) / 2) x 100
 */
export function percentDifference(a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return { error: "Enter both measurements as numbers." };
  }
  const mean = (x + y) / 2;
  if (mean === 0) {
    return { error: "The two values average to zero, so a percent difference is undefined." };
  }
  return { value: (Math.abs(x - y) / Math.abs(mean)) * 100, mean };
}

/* -------------------------------- planner -------------------------------- */

/**
 * Build the report skeleton.
 *
 * @param {object} input
 * @param {string} input.style       Key of REPORT_STYLES.
 * @param {number} input.totalWords  Word target for the prose sections.
 * @param {string[]} input.doneIds   Section ids already drafted.
 * @returns {object} plan, or { error }.
 */
export function planLabReport(input = {}) {
  const { style = "undergraduate", totalWords, doneIds = [] } = input;

  const spec = REPORT_STYLES[style];
  if (!spec) return { error: "Choose a report style." };

  if (!Number.isFinite(Number(totalWords))) return { error: "Enter a target word count." };
  const total = Math.round(Number(totalWords));
  if (total < MIN_TOTAL_WORDS) {
    return { error: `A report needs at least ${MIN_TOTAL_WORDS} words before splitting it into sections.` };
  }
  if (total > MAX_TOTAL_WORDS) {
    return { error: `Above ${MAX_TOTAL_WORDS} words this is a project report — plan it chapter by chapter.` };
  }

  let words = allocateByShares(total, spec.sections.map((section) => section.share));

  // Enforce the abstract ceiling and give the surplus back to the other sections.
  const abstractIndex = spec.sections.findIndex((section) => section.id === "abstract");
  let abstractCapped = false;
  if (abstractIndex >= 0 && words[abstractIndex] > ABSTRACT_MAX_WORDS) {
    const surplus = words[abstractIndex] - ABSTRACT_MAX_WORDS;
    words[abstractIndex] = ABSTRACT_MAX_WORDS;
    abstractCapped = true;
    const otherShares = spec.sections.map((section, index) =>
      index === abstractIndex ? 0 : section.share,
    );
    const extra = allocateByShares(surplus, otherShares);
    words = words.map((value, index) => value + extra[index]);
  }

  const done = new Set(Array.isArray(doneIds) ? doneIds : []);

  const sections = spec.sections.map((section, index) => ({
    ...section,
    words: words[index],
    percent: Math.round((words[index] / total) * 100),
    done: done.has(section.id),
  }));

  const allocated = words.reduce((acc, value) => acc + value, 0);
  const doneCount = sections.filter((section) => section.done).length;

  return {
    style: spec.id,
    styleLabel: spec.label,
    styleSummary: spec.summary,
    totalWords: total,
    allocated,
    sections,
    nonProse: NON_PROSE_SECTIONS,
    abstractCapped,
    sectionCount: sections.length,
    doneCount,
    completionPercent: sections.length > 0 ? Math.round((doneCount / sections.length) * 100) : 0,
    largestSection: sections.reduce(
      (best, section) => (section.words > best.words ? section : best),
      sections[0],
    ),
  };
}

/** Render the skeleton as a plain-text outline. */
export function planToText(plan) {
  if (!plan || plan.error) return "";
  const lines = [
    `${plan.styleLabel} — ${plan.totalWords} word target`,
    plan.styleSummary,
    "",
  ];
  plan.sections.forEach((section, index) => {
    lines.push(`${index + 1}. ${section.label} — ${section.words} words (${section.percent}%), ${section.tense} tense`);
    section.checklist.forEach((item) => lines.push(`   - ${item}`));
    lines.push("");
  });
  lines.push("Also required (no word budget):");
  plan.nonProse.forEach((item) => lines.push(`   - ${item.label}: ${item.note}`));
  return lines.join("\n").trim();
}
