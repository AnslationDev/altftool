/**
 * Indian Resume Prompt Builder.
 *
 * Two jobs, both pure:
 *  1. Size the resume — how many pages it should be, and how many bullet points
 *     actually fit on those pages once the fixed blocks (header, summary, skills,
 *     education) have taken their share of the lines.
 *  2. Assemble a rewriting prompt that carries Indian recruiter conventions and
 *     applicant-tracking-system (ATS) parsing constraints into the model.
 *
 * No React, no JSX, no DOM. Same input -> same output.
 *
 * Sources for the constants below:
 *  - Page/line geometry: A4 (297 mm tall) with 19 mm (0.75 in) top and bottom
 *    margins leaves ~259 mm of text height; at 11 pt with 1.15 line spacing a
 *    line occupies ~5.6 mm, giving ~46 usable lines per page.
 *  - Line width: A4 (210 mm) less 19 mm side margins = 172 mm of text; at 11 pt
 *    that is ~95 characters, and English prose averages ~6.5 characters per word
 *    including the space, so ~14 words per line.
 *  - Bullet length and counts (3-5 bullets on the current role, 2-3 on older
 *    ones) follow standard reverse-chronological resume-writing guidance.
 *  - Page-count bands follow the convention Indian recruiters and job boards
 *    publish: one page for freshers and early-career, two once you pass roughly
 *    five years, three only for long or highly technical careers.
 *  - The XYZ achievement pattern ("Accomplished [X] as measured by [Y], by
 *    doing [Z]") is the formula popularised by Google recruiting.
 */

/** Usable text lines on one A4 page at 11 pt / 1.15 spacing with 0.75 in margins. */
export const LINES_PER_PAGE = 46;

/** Words that fit on one full-width line at 11 pt across a 172 mm text column. */
export const WORDS_PER_LINE = 14;

/** Name line, contact line, links line, and the blank line under the block. */
export const HEADER_LINES = 4;

/** A section heading plus the blank line that follows it. */
export const SECTION_GAP_LINES = 2;

/** Job title + employer on one line, dates + location on the next. */
export const ROLE_HEADER_LINES = 2;

/**
 * Vertical cost of one bullet. A bullet capped at BULLET_MAX_WORDS words wraps
 * to at most two lines at WORDS_PER_LINE words per line, so two is the safe
 * planning figure.
 */
export const BULLET_LINES = 2;

/** Keep a bullet to two printed lines: 2 x WORDS_PER_LINE, so 28 words. */
export const BULLET_MAX_WORDS = BULLET_LINES * WORDS_PER_LINE;

/** Average words consumed by one skill in a comma-separated skills line. */
export const WORDS_PER_SKILL = 2;

/** Degree/board on one line, institution + year + score on the next. */
export const EDUCATION_ENTRY_LINES = 2;

/** Bullet counts per role, most recent role first. */
export const MIN_BULLETS_PER_ROLE = 2;
export const MAX_BULLETS_RECENT_ROLE = 6;
export const MAX_BULLETS_OLDER_ROLE = 4;

/**
 * Page-count bands by total years of experience. Upper bound is exclusive of
 * the next band's floor.
 */
export const PAGE_BANDS = [
  { maxYears: 5, pages: 1, note: "Under five years — Indian recruiters expect a single page." },
  { maxYears: 15, pages: 2, note: "Five to fifteen years — two pages is the norm." },
  { maxYears: Infinity, pages: 3, note: "Fifteen years or more — three pages is acceptable for a long or deeply technical career." },
];

/**
 * Keyword coverage guidance. There is no published ATS threshold that rejects a
 * resume at a fixed percentage — that is a myth. What is defensible is that a
 * resume mirroring most of the job description's own terminology reads as a
 * closer match to both parsers and humans, so this band is presented as a
 * target to aim at, not a pass mark.
 */
export const KEYWORD_TARGET_MIN_PERCENT = 60;
export const KEYWORD_TARGET_GOOD_PERCENT = 80;

/** How the model should sound. */
export const TONE_OPTIONS = [
  {
    id: "impact",
    label: "Impact-led (default)",
    phrase: "confident and achievement-led, every bullet leading with a result",
  },
  {
    id: "formal",
    label: "Formal / conservative",
    phrase: "formal and understated, suited to PSUs, banking, legal and government roles",
  },
  {
    id: "startup",
    label: "Startup / product",
    phrase: "direct and ownership-heavy, suited to Indian startups and product teams",
  },
];

/**
 * Fields Indian recruiters and job portals commonly expect, each with the
 * ATS consequence of including it. Photographs, date of birth, marital status
 * and parents' names are still printed on many Indian resume templates but
 * carry no hiring value and can confuse parsers, so they are listed as things
 * to drop rather than things to add.
 */
export const INDIA_FIELDS = [
  {
    id: "notice",
    label: "Notice period",
    line: "State the notice period in the header (for example \"Notice period: 30 days\") — Indian recruiters screen on it before they read the experience.",
  },
  {
    id: "ctc",
    label: "Current and expected CTC",
    line: "State current and expected CTC in lakhs per annum as a single header line — most Indian job portals and recruiters ask for it in the first message anyway.",
  },
  {
    id: "location",
    label: "Location and willingness to relocate",
    line: "State current city and relocation preference — this is a hard filter on Naukri and LinkedIn searches.",
  },
  {
    id: "academics",
    label: "10th / 12th percentages and CGPA",
    line: "List 10th and 12th percentages and degree CGPA or percentage — Indian campus and early-career screening still uses them.",
  },
  {
    id: "portals",
    label: "Naukri / LinkedIn profile links",
    line: "Add plain-text LinkedIn and Naukri profile URLs — write them out in full, never as hyperlinked words, because parsers drop link text.",
  },
];

/** What the model is being asked to produce. */
export const TASKS = [
  {
    id: "bullets",
    label: "Rewrite my experience bullets",
    instruction:
      "Rewrite each bullet I paste using the XYZ pattern — \"Accomplished [X] as measured by [Y], by doing [Z]\" — opening with a past-tense action verb and carrying a number wherever I have given you one.",
  },
  {
    id: "summary",
    label: "Write my professional summary",
    instruction:
      "Write a three-to-four line professional summary that opens with my title and years of experience, names my two strongest quantified results, and closes on what I bring to the target role. No first person, no \"results-driven\", no \"hardworking\".",
  },
  {
    id: "tailor",
    label: "Tailor my resume to a job description",
    instruction:
      "Compare my resume against the job description I paste. Mirror the description's own wording for every requirement I genuinely meet, reorder bullets so the most relevant results come first, and list separately any requirement I do not evidence so I can decide how to address it honestly.",
  },
  {
    id: "full",
    label: "Rebuild the full resume",
    instruction:
      "Rebuild the whole resume in reverse-chronological order with these sections in this order: Summary, Skills, Experience, Education, and only then anything optional. Use exactly those headings so applicant tracking systems map the sections correctly.",
  },
];

/** Recommended page count for a given number of years of experience. */
export function recommendedPages(years) {
  const value = Number(years);
  if (!Number.isFinite(value) || value < 0) return null;
  const band = PAGE_BANDS.find((entry) => value < entry.maxYears) || PAGE_BANDS[PAGE_BANDS.length - 1];
  return { pages: band.pages, note: band.note };
}

/** Lines a block of prose occupies at WORDS_PER_LINE words per line. */
export function linesForWords(words) {
  const value = Number(words);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value / WORDS_PER_LINE);
}

/** Split a comma / newline / semicolon separated list into clean lowercase terms. */
export function splitKeywords(text) {
  if (typeof text !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const raw of text.split(/[,;\n]+/)) {
    const term = raw.trim().toLowerCase().replace(/\s+/g, " ");
    if (term === "" || seen.has(term)) continue;
    seen.add(term);
    out.push(term);
  }
  return out;
}

const escapeForRegex = (term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * How many of the job description's keywords already appear in the resume text.
 * Matching is whole-term and case-insensitive; "react" does not match
 * "reactive" because the term is bounded on both sides.
 */
export function computeKeywordMatch({ jobKeywords, resumeText } = {}) {
  const terms = splitKeywords(jobKeywords);
  const haystack = typeof resumeText === "string" ? resumeText.toLowerCase() : "";

  if (terms.length === 0) {
    return {
      total: 0,
      matched: [],
      missing: [],
      matchedCount: 0,
      coveragePercent: null,
      verdict: "Add the job description's key terms to measure coverage.",
    };
  }

  const matched = [];
  const missing = [];
  for (const term of terms) {
    const pattern = new RegExp(`(^|[^a-z0-9+#])${escapeForRegex(term)}([^a-z0-9+#]|$)`, "i");
    if (pattern.test(haystack)) matched.push(term);
    else missing.push(term);
  }

  const coveragePercent = Math.round((matched.length / terms.length) * 100);
  let verdict;
  if (coveragePercent >= KEYWORD_TARGET_GOOD_PERCENT) {
    verdict = "Strong overlap with the job description's own wording.";
  } else if (coveragePercent >= KEYWORD_TARGET_MIN_PERCENT) {
    verdict = "Reasonable overlap — work the missing terms in where they are genuinely true of you.";
  } else {
    verdict = "Thin overlap — the resume is not speaking the job description's language yet.";
  }

  return {
    total: terms.length,
    matched,
    missing,
    matchedCount: matched.length,
    coveragePercent,
    verdict,
  };
}

/**
 * Work out how many bullets fit, and where they should go.
 *
 * @param {object} input
 * @param {number} input.targetPages       Pages the resume may occupy (1-3).
 * @param {number} input.roleCount         Number of roles listed, most recent first.
 * @param {number} [input.summaryWords]    Words in the professional summary (0 = no summary).
 * @param {number} [input.skillsCount]     Number of skills listed.
 * @param {number} [input.educationCount]  Number of education entries.
 * @param {number} [input.extraLines]      Lines taken by optional blocks (certifications, projects, India header lines).
 * @returns {object} plan, or { error } for input that cannot produce a layout.
 */
export function planResumeLayout({
  targetPages,
  roleCount,
  summaryWords = 0,
  skillsCount = 0,
  educationCount = 0,
  extraLines = 0,
} = {}) {
  const pages = Number(targetPages);
  const roles = Number(roleCount);
  const summary = Number(summaryWords);
  const skills = Number(skillsCount);
  const education = Number(educationCount);
  const extras = Number(extraLines);

  if (!Number.isFinite(pages) || pages < 1) {
    return { error: "A resume needs at least one page." };
  }
  if (pages > 3) {
    return { error: "Cap the resume at three pages — beyond that recruiters stop reading." };
  }
  if (!Number.isFinite(roles) || roles < 1) {
    return { error: "List at least one role so bullets can be allocated." };
  }
  if (roles > 12) {
    return { error: "Twelve roles is the practical limit — group anything older into a single 'Earlier roles' line." };
  }
  if (!Number.isFinite(summary) || summary < 0) return { error: "Summary length cannot be negative." };
  if (!Number.isFinite(skills) || skills < 0) return { error: "Skill count cannot be negative." };
  if (!Number.isFinite(education) || education < 0) return { error: "Education entry count cannot be negative." };
  if (!Number.isFinite(extras) || extras < 0) return { error: "Extra lines cannot be negative." };

  const wholePages = Math.floor(pages);
  const wholeRoles = Math.floor(roles);
  const availableLines = wholePages * LINES_PER_PAGE;

  const summaryLines = summary > 0 ? SECTION_GAP_LINES + linesForWords(summary) : 0;
  const skillsLines =
    skills > 0 ? SECTION_GAP_LINES + linesForWords(skills * WORDS_PER_SKILL) : 0;
  const experienceLines = SECTION_GAP_LINES + wholeRoles * ROLE_HEADER_LINES;
  const educationLines =
    education > 0 ? SECTION_GAP_LINES + Math.floor(education) * EDUCATION_ENTRY_LINES : 0;
  const extrasLines = Math.floor(extras);

  const fixedLines =
    HEADER_LINES + summaryLines + skillsLines + experienceLines + educationLines + extrasLines;

  const lineBudgetForBullets = availableLines - fixedLines;
  const bulletsThatFit = Math.max(0, Math.floor(lineBudgetForBullets / BULLET_LINES));

  // Every role gets the minimum first, then spare bullets go to the most recent
  // roles one at a time until the caps or the budget run out.
  const allocation = new Array(wholeRoles).fill(MIN_BULLETS_PER_ROLE);
  let spare = bulletsThatFit - wholeRoles * MIN_BULLETS_PER_ROLE;
  const capFor = (index) => (index === 0 ? MAX_BULLETS_RECENT_ROLE : MAX_BULLETS_OLDER_ROLE);

  let added = true;
  while (spare > 0 && added) {
    added = false;
    for (let index = 0; index < wholeRoles && spare > 0; index += 1) {
      if (allocation[index] < capFor(index)) {
        allocation[index] += 1;
        spare -= 1;
        added = true;
      }
    }
  }

  const totalBullets = allocation.reduce((sum, count) => sum + count, 0);
  const estimatedLines = fixedLines + totalBullets * BULLET_LINES;
  const estimatedPages = Math.round((estimatedLines / LINES_PER_PAGE) * 10) / 10;
  const fits = estimatedLines <= availableLines;
  const spareLines = availableLines - estimatedLines;

  let advice;
  if (!fits) {
    advice =
      "Over the page budget even at the minimum of two bullets a role. Cut the oldest roles to a one-line 'Earlier roles' entry, shorten the summary, or allow one more page.";
  } else if (spareLines >= LINES_PER_PAGE * 0.6 && wholePages > 1) {
    advice =
      "Comfortably under the budget — the content as described would sit on fewer pages. Either add depth to the recent roles or drop a page.";
  } else {
    advice = "The described content fits the page budget with the bullet allocation shown.";
  }

  return {
    targetPages: wholePages,
    availableLines,
    fixedLines,
    breakdown: {
      header: HEADER_LINES,
      summary: summaryLines,
      skills: skillsLines,
      experience: experienceLines,
      education: educationLines,
      extras: extrasLines,
    },
    lineBudgetForBullets: Math.max(0, lineBudgetForBullets),
    bulletsThatFit,
    allocation,
    totalBullets,
    bulletMaxWords: BULLET_MAX_WORDS,
    estimatedLines,
    estimatedPages,
    fits,
    spareLines,
    advice,
  };
}

/**
 * Build the full prompt plus the sizing plan and keyword coverage.
 *
 * @param {object} input
 * @param {string} input.taskId          One of TASKS ids.
 * @param {string} input.targetRole      Target job title (required).
 * @param {number} input.yearsExperience Total years of experience.
 * @param {number} input.roleCount       Roles to be listed.
 * @param {number} input.targetPages     Pages allowed.
 * @param {string} [input.industry]      Target industry or sector.
 * @param {string} input.toneId          One of TONE_OPTIONS ids.
 * @param {string} [input.jobKeywords]   Comma-separated terms lifted from the job description.
 * @param {string} [input.resumeText]    Current resume text, used only for keyword coverage.
 * @param {string[]} [input.indiaFieldIds] Ids from INDIA_FIELDS to include.
 * @param {number} [input.summaryWords]  Words allowed for the summary.
 * @param {number} [input.skillsCount]   Skills listed.
 * @param {number} [input.educationCount] Education entries.
 * @returns {object} { prompt, plan, keywords, checklist } or { error }.
 */
export function buildIndianResumePrompt({
  taskId,
  targetRole,
  yearsExperience,
  roleCount,
  targetPages,
  industry = "",
  toneId,
  jobKeywords = "",
  resumeText = "",
  indiaFieldIds = [],
  summaryWords = 45,
  skillsCount = 12,
  educationCount = 2,
} = {}) {
  const task = TASKS.find((entry) => entry.id === taskId) || TASKS[0];
  const tone = TONE_OPTIONS.find((entry) => entry.id === toneId) || TONE_OPTIONS[0];

  const role = String(targetRole ?? "").trim();
  if (role === "") return { error: "Enter the job title you are targeting." };

  const years = Number(yearsExperience);
  if (!Number.isFinite(years) || years < 0) {
    return { error: "Enter your total years of experience as a number of zero or more." };
  }
  if (years > 60) return { error: "Years of experience above 60 is not a realistic career length." };

  const chosenFields = INDIA_FIELDS.filter((field) =>
    Array.isArray(indiaFieldIds) ? indiaFieldIds.includes(field.id) : false,
  );

  // Each India-specific header line printed costs one line of the page budget.
  const plan = planResumeLayout({
    targetPages,
    roleCount,
    summaryWords: task.id === "bullets" ? 0 : summaryWords,
    skillsCount,
    educationCount,
    extraLines: chosenFields.length,
  });
  if (plan.error) return { error: plan.error };

  const keywords = computeKeywordMatch({ jobKeywords, resumeText });
  const guidance = recommendedPages(years);

  const bulletPlanLine = plan.allocation
    .map((count, index) => `${index === 0 ? "most recent role" : `role ${index + 1}`}: ${count} bullets`)
    .join("; ");

  const lines = [
    `Act as a recruiter who screens ${role} applications in India${industry ? ` in the ${industry} sector` : ""} and knows how applicant tracking systems parse a resume.`,
    "",
    task.instruction,
    "",
    "MY DETAILS",
    `Target role: ${role}`,
    industry ? `Target sector: ${industry}` : null,
    `Total experience: ${years} year${years === 1 ? "" : "s"}`,
    `Roles to list: ${plan.allocation.length}, most recent first`,
    "",
    "LENGTH BUDGET — treat these as hard limits",
    `Total length: ${plan.targetPages} A4 page${plan.targetPages === 1 ? "" : "s"} (about ${plan.availableLines} lines of text).`,
    `Bullets: ${bulletPlanLine}. Do not exceed these counts.`,
    `Each bullet: ${plan.bulletMaxWords} words maximum, so it never wraps past two printed lines.`,
    task.id === "bullets" ? null : `Professional summary: ${summaryWords} words maximum.`,
    `Skills: about ${skillsCount} terms on a single comma-separated line, hard skills and tools only.`,
    "",
    "ATS RULES",
    "Use exactly these section headings, in this order: Summary, Skills, Experience, Education. No creative headings.",
    "Single column, no tables, no text boxes, no columns, no icons, no graphics, and nothing in the page header or footer — parsers routinely drop all of it.",
    "Write dates as MMM YYYY - MMM YYYY (for example Mar 2021 - Present). Do not use only years.",
    "Spell out an acronym once on first use with the short form in brackets, then use the short form — the parser and the recruiter search on different ones.",
    "Write links out in full as plain text rather than hyperlinking a word.",
    "",
    "WRITING RULES",
    `Tone: ${tone.phrase}.`,
    "Every bullet opens with a past-tense action verb and carries a number wherever one exists — team size, rupees, percentage, volume, or time saved.",
    "Never invent an employer, a date, a qualification or a metric. If a bullet has no number, ask me for one rather than estimating it.",
    "No first-person pronouns, no objective statement, and none of: hardworking, results-driven, team player, dynamic professional, passionate.",
  ];

  if (chosenFields.length > 0) {
    lines.push("", "INDIA-SPECIFIC HEADER LINES");
    for (const field of chosenFields) lines.push(`- ${field.line}`);
  }

  lines.push(
    "",
    "LEAVE OUT",
    "Photograph, date of birth, marital status, gender, father's or husband's name, full postal address and \"references available on request\". None of it helps the decision and several of the fields confuse parsers.",
  );

  if (keywords.total > 0) {
    lines.push(
      "",
      "KEYWORDS FROM THE JOB DESCRIPTION",
      `Work these in wherever they are genuinely true of me: ${splitKeywords(jobKeywords).join(", ")}.`,
    );
    if (keywords.missing.length > 0) {
      lines.push(
        `These are absent from my current text — flag each one and ask me whether I have the experience before writing it in: ${keywords.missing.join(", ")}.`,
      );
    }
  }

  lines.push(
    "",
    "OUTPUT",
    "Return the finished text ready to paste into a plain single-column document, then a short list of anything you could not write because I did not give you the number or the fact.",
  );

  const prompt = lines.filter((line) => line !== null).join("\n");

  const checklist = [
    `Save as .docx or a text-based PDF — never an exported image or a scan.`,
    `Keep the file name in the form Firstname-Lastname-${role.replace(/\s+/g, "-")}.pdf.`,
    guidance
      ? `At ${years} year${years === 1 ? "" : "s"} of experience the convention is ${guidance.pages} page${guidance.pages === 1 ? "" : "s"}. ${guidance.note}`
      : "Check the page count against your years of experience.",
    keywords.total > 0
      ? `Keyword coverage is ${keywords.coveragePercent}% of the ${keywords.total} terms you pasted. ${keywords.verdict}`
      : "Paste the job description's key terms to measure keyword coverage.",
    plan.advice,
  ];

  return {
    prompt,
    plan,
    keywords,
    guidance,
    task,
    tone,
    checklist,
    characters: prompt.length,
    words: prompt.trim() === "" ? 0 : prompt.trim().split(/\s+/).length,
  };
}
