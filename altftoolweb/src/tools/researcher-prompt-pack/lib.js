/**
 * Researcher Prompt Pack — prompt library + a pure template engine.
 *
 * No React, no JSX, no DOM. Every export is deterministic: same input -> same output.
 * Placeholders inside a template are written as {{snake_case}}.
 */

/**
 * Placeholder syntax. Kept as a source string so callers can build their own
 * stateful RegExp instances instead of sharing lastIndex with this one.
 */
export const PLACEHOLDER_SOURCE = "\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}";

/**
 * ~4 characters per token for English prose is the vendor-published rule of thumb
 * used by OpenAI's tokenizer documentation. It is an estimate for sizing a prompt
 * against a context window, never an exact billing figure.
 */
export const CHARS_PER_TOKEN = 4;

/**
 * Above this estimated size a prompt starts to crowd small context windows
 * (8K-token models leave roughly this much room once a long answer is reserved).
 */
export const LONG_PROMPT_TOKENS = 700;

export const CATEGORIES = [
  "Literature & Reading",
  "Methods & Design",
  "Analysis",
  "Academic Writing",
  "Review & Response",
];

export const PROMPTS = [
  {
    id: "lit-map",
    title: "Literature map from your reading list",
    category: "Literature & Reading",
    goal: "Organise papers you have actually read into camps, tensions and the gap you can claim.",
    tags: ["literature review", "mapping", "synthesis", "gap"],
    tip: "Only list papers you have read — the model must organise your reading, not invent citations to pad it.",
    variables: [
      { key: "topic", label: "Research topic", placeholder: "remote work and junior employee skill acquisition" },
      { key: "papers", label: "Papers you have read (author, year, one-line finding)", placeholder: "Smith 2021: mentoring frequency dropped 40% remote; Diaz 2022: no effect on output quality; ..." },
      { key: "my_angle", label: "Your emerging angle", placeholder: "the loss is in tacit knowledge, not measurable output" },
    ],
    template: `Organise my literature into a map. CRITICAL RULE: use ONLY the papers I list. Never add, complete or "recall" a citation I did not give you — invented references are the one unforgivable error in this task.

Topic: {{topic}}
Papers I have read: {{papers}}
My emerging angle: {{my_angle}}

Produce: (1) the papers grouped into camps by claim or approach, each camp named in a phrase; (2) the live tensions — where my papers directly disagree, stated as "X finds A, Y finds B, and the difference plausibly comes from [method/population/measure]"; (3) what every camp assumes without testing — the shared blind spot; (4) where my angle sits: which camp it extends, which it challenges, and the specific gap in the listed literature it occupies; (5) the two papers my map most obviously needs but does not have — described by what they would need to show, NOT as invented citations — phrased as search queries I can run myself.`,
  },
  {
    id: "paper-interrogation",
    title: "Critical read of one paper",
    category: "Literature & Reading",
    goal: "A structured interrogation of a paper's claims, methods and actual evidential support.",
    tags: ["critical reading", "appraisal", "methods", "claims"],
    tip: "Paste the abstract and methods sections — critique of a paper the model has not seen is confabulation.",
    variables: [
      { key: "paper_text", label: "Abstract + methods (paste)", placeholder: "paste the abstract and the methods section, or the full text if short" },
      { key: "my_use", label: "How you plan to use this paper", placeholder: "as key support for my claim that mentoring quality predicts retention" },
    ],
    template: `Critically interrogate this paper based strictly on the text I paste — if a question cannot be answered from the pasted text, say "not determinable from provided text" rather than assuming.

Paper text: {{paper_text}}
How I plan to use it: {{my_use}}

Work through: (1) the central claim as the authors state it, versus the claim their evidence actually supports — where the abstract oversells, quote both; (2) design: what was measured, on whom, over what period, and the biggest threat to validity for this design (confounding, selection, attrition, measurement) — the specific threat, not the textbook list; (3) the effect size and its practical meaning, if reported — flag if only significance is given; (4) generalisability limits relevant to MY use; (5) verdict: does this paper support the use I stated — fully, partially with caveats you specify, or not really — and the exact sentence I could honestly write citing it.

End with the two follow-up checks worth doing: a look at who cites this paper and whether replications exist.`,
  },
  {
    id: "research-question",
    title: "Sharpen a research question",
    category: "Methods & Design",
    goal: "Test a draft research question for answerability, scope and the study it implies.",
    tags: ["research question", "scope", "feasibility", "design"],
    tip: "Include your constraints honestly — a question that needs a decade of panel data is not your question.",
    variables: [
      { key: "draft_question", label: "Your draft question", placeholder: "How does remote work affect junior employees?" },
      { key: "field", label: "Field and level", placeholder: "organisational psychology, masters thesis" },
      { key: "constraints", label: "Real constraints", placeholder: "6 months, no budget, access to one mid-size company, survey and interviews possible" },
    ],
    template: `Stress-test my research question before I commit a thesis to it.

Draft question: {{draft_question}}
Field and level: {{field}}
Real constraints: {{constraints}}

Evaluate: (1) is it a question or a topic — if a topic, show the difference; (2) each vague term, with three concrete operationalisations per term and the trade-off of each; (3) answerability under my constraints — what data would a real answer require, and can my constraints produce it; (4) the "so what" test: whose decision changes depending on the answer, and would both possible answers (effect found / no effect) be interesting, or is only one publishable — a bad sign you should flag.

Then give three sharpened versions: the safest (clearly answerable within constraints), the most interesting (highest contribution if it works, with its risk named), and the compromise. For each: the implied study design in two sentences and the likely main limitation. Recommend one for my level and say why — a masters thesis needs completable, not heroic.`,
  },
  {
    id: "methods-critique",
    title: "Pre-mortem your study design",
    category: "Methods & Design",
    goal: "Attack your own design the way reviewer 2 will, while you can still change it.",
    tags: ["methods", "design", "validity", "pre-mortem", "reviewer"],
    tip: "Run this before data collection — every problem found afterwards is a limitation paragraph instead of a fix.",
    variables: [
      { key: "design", label: "Your design (describe fully)", placeholder: "survey 200 employees on mentoring quality + retention intent; interviews with 12; regression controlling for tenure" },
      { key: "claim", label: "The claim you hope to make", placeholder: "mentoring quality predicts retention intent beyond salary and tenure" },
      { key: "population", label: "Sample and recruitment", placeholder: "one tech company, HR sends the survey, participation voluntary" },
    ],
    template: `Pre-mortem my study design. Assume it FAILED in peer review — work backwards to why, now, while I can still fix it.

Design: {{design}}
The claim I hope to make: {{claim}}
Sample and recruitment: {{population}}

Attack in order: (1) the causal gap between my design and my claim — write the exact reviewer sentence pointing out what my correlational/observational elements cannot support, and the strongest claim the design DOES license; (2) selection and non-response bias from my recruitment route — who systematically will not answer, and which direction that biases the result; (3) measurement: for each key construct, how the operationalisation could fail to capture it, and common-method variance if everything comes from one survey; (4) power and analysis: is the sample plausibly adequate for the analysis named — show the reasoning; (5) confounds a sceptic names first.

For each problem: the fix if one exists at my stage (design change, added measure, different claim), or the honest limitation sentence if not. Rank the problems by how likely they are to sink the paper. Note: verify power calculations with a proper tool — treat yours as a sanity check.`,
  },
  {
    id: "coding-themes",
    title: "Qualitative coding second opinion",
    category: "Analysis",
    goal: "Pressure-test your themes against your own excerpts — merges, splits and negative cases.",
    tags: ["qualitative", "coding", "themes", "interviews"],
    tip: "Paste anonymised excerpts only — strip names, employers and anything identifying before pasting.",
    variables: [
      { key: "themes", label: "Your current themes", placeholder: "1) invisible learning loss 2) compensatory self-teaching 3) mentor guilt" },
      { key: "excerpts", label: "Anonymised excerpts (paste a sample)", placeholder: "P4: 'I only realised what I wasn't learning when...' P9: '...'" },
      { key: "method", label: "Your stated method", placeholder: "reflexive thematic analysis, Braun and Clarke" },
    ],
    template: `Act as a second coder pressure-testing my qualitative analysis. My themes must survive contact with my own data.

My themes: {{themes}}
Sample of anonymised excerpts: {{excerpts}}
Stated method: {{method}}

Do: (1) code the excerpts independently against my themes — for each excerpt, which theme it supports, with the phrase doing the work quoted; (2) flag excerpts that fit NO theme — candidate new themes or evidence my scheme is incomplete; (3) flag excerpts I would likely code differently than you did, and why the difference matters; (4) test each theme: is it a genuine pattern of meaning or just a topic summary — for my stated method that distinction is load-bearing; propose merges where two themes share one underlying idea and splits where one theme hides two; (5) name the negative case my writeup needs: the excerpt that most resists my overall story.

Do not manufacture agreement — where the data is genuinely ambiguous, say so; that goes in my reflexivity notes.`,
  },
  {
    id: "stats-plan-check",
    title: "Statistical analysis plan sanity check",
    category: "Analysis",
    goal: "Check the test matches the question, the data and the assumptions before you run it.",
    tags: ["statistics", "analysis plan", "assumptions", "tests"],
    tip: "Describe the actual variables and their scales — most wrong tests come from misdescribed variables.",
    variables: [
      { key: "question", label: "The question being tested", placeholder: "does mentoring quality predict retention intent controlling for tenure and salary" },
      { key: "variables", label: "Variables and their scales", placeholder: "retention intent: 5-item Likert averaged; mentoring quality: 0-10; tenure: years; salary: banded ordinal" },
      { key: "plan", label: "Your planned analysis", placeholder: "OLS regression, n=180 expected" },
    ],
    template: `Sanity-check my statistical plan BEFORE I run anything. Be the sceptical methodologist, not the reassuring one.

Question: {{question}}
Variables and scales: {{variables}}
Planned analysis: {{plan}}

Check: (1) does the planned test actually answer the stated question — if it answers a related but different question, state both precisely; (2) variable treatment: is each scale being handled defensibly (Likert averages as continuous, ordinal predictors entered as linear — name each judgement being made silently and its risk); (3) the assumptions of my planned test, but only the ones that plausibly bite with my variables — and how to check each with a specific diagnostic; (4) what happens to the estimate if the key assumption fails, and the standard robust alternative; (5) multiple comparisons or flexibility risks: where my plan leaves room to fish, and the pre-registration-style sentence that closes it.

End with the analysis plan rewritten as numbered steps I could paste into a pre-registration, including the decision rule for each diagnostic. Remind me to verify the details against a statistics reference or statistician — you are a check, not the authority.`,
  },
  {
    id: "abstract-drafting",
    title: "Abstract against the journal's structure",
    category: "Academic Writing",
    goal: "A structured abstract built strictly from your stated findings, at the journal's word limit.",
    tags: ["abstract", "writing", "journal", "structure"],
    tip: "Give the real numbers — an abstract with 'significant improvement' and no effect size is a red flag to reviewers.",
    variables: [
      { key: "findings", label: "Your actual findings (with numbers)", placeholder: "mentoring quality predicted retention intent, beta .31 p<.001, model R2 .24, n=214" },
      { key: "structure", label: "Journal's required structure and limit", placeholder: "Background, Methods, Results, Conclusions; 250 words max" },
      { key: "contribution", label: "The one-line contribution", placeholder: "first study separating mentoring quality from frequency in remote settings" },
    ],
    template: `Draft my abstract. Use ONLY the findings and numbers I give you — never round differently, never add a result I did not state, never inflate.

My findings: {{findings}}
Required structure and word limit: {{structure}}
The contribution in one line: {{contribution}}

Rules: follow the journal's structure exactly, with every reported number appearing exactly as I gave it; conclusions may not exceed what the findings support — no policy recommendations from a single cross-sectional result; no "novel", "crucial" or "paves the way"; past tense for what was done, present tense only for what the field knows; the contribution sentence carries the weight, place it where it lands hardest.

Give me: the abstract within the word limit with the count stated, then a 40-word version for conference submission, then the three phrases in my draft most likely to trigger a reviewer objection (with the objection each triggers). If my findings as stated cannot honestly fill the required structure — e.g. no methods detail — list what is missing instead of writing filler.`,
  },
  {
    id: "reviewer-response",
    title: "Response to reviewers letter",
    category: "Review & Response",
    goal: "A point-by-point response that concedes what should be conceded and defends what should not.",
    tags: ["peer review", "revisions", "response letter", "rebuttal"],
    tip: "Decide which comments you will concede before prompting — the strategy is yours, the diplomacy is the model's.",
    variables: [
      { key: "comments", label: "Reviewer comments (paste, numbered)", placeholder: "R1.1: sample is single-company, generalisability limited. R1.2: why no objective retention data? R2.1: ..." },
      { key: "my_positions", label: "Your position on each (concede/partial/defend)", placeholder: "R1.1 concede, add limitation + future work; R1.2 defend: turnover lag makes it infeasible; R2.1 partial" },
      { key: "changes_made", label: "Changes you actually made", placeholder: "added limitation para section 5.2; new robustness check table 4" },
    ],
    template: `Draft my response-to-reviewers letter. The decisions are already made — your job is executing them with the right tone: grateful without grovelling, firm without prickliness.

Comments: {{comments}}
My position on each: {{my_positions}}
Changes actually made: {{changes_made}}

For each comment, produce the standard structure: restate the comment briefly, respond, and point to the change with its location ("Section 5.2, p.14, lines 3-9" style placeholders where I have not given the location). Rules per position type — CONCEDE: thank, agree specifically (not "the reviewer is right" but WHAT they are right about), state the change; PARTIAL: agree with the valid part explicitly before the boundary; DEFEND: never defensive — give the substantive reason, cite what in the manuscript supports it, and offer the smallest accommodating change (a clarifying sentence) so the editor sees movement.

Never claim a change I did not list. Where my changes do not fully address a conceded point, flag the mismatch to me instead of papering over it. Open with a short paragraph to the editor summarising the major changes in three bullets.`,
  },
  {
    id: "grant-significance",
    title: "Significance paragraph for a proposal",
    category: "Academic Writing",
    goal: "A significance argument that chains problem to gap to payoff without empty superlatives.",
    tags: ["grant", "proposal", "significance", "funding"],
    tip: "Know the funder's stated priorities and quote them — significance is argued to an audience, not in the abstract.",
    variables: [
      { key: "project", label: "The project in two sentences", placeholder: "testing whether structured remote onboarding restores tacit skill transfer, RCT across 14 firms" },
      { key: "problem_evidence", label: "Evidence the problem matters (with numbers)", placeholder: "40% of junior hires now start remote; skill-gap costs estimated at X in study Y" },
      { key: "funder_priorities", label: "Funder's stated priorities (quote them)", placeholder: "'future of work' and 'evidence-based workforce interventions' from the call text" },
    ],
    template: `Write the significance paragraph for a grant proposal. The argument must be a chain, not a mood.

Project: {{project}}
Evidence the problem matters: {{problem_evidence}}
Funder's stated priorities, quoted: {{funder_priorities}}

Build the chain explicitly: (1) the problem, sized with MY numbers only — if my evidence is thin, say "your evidence here is thin, strengthen with..." rather than inventing statistics; (2) why existing approaches leave the specific gap this project fills — one sentence, concrete; (3) what becomes possible if the project succeeds — the payoff for the field AND for the funder's quoted priorities, using their own language once, naturally; (4) why this team/design/moment — the credibility line.

Rules: no "novel", "unprecedented", "urgent need" or "paves the way"; every claim either carries a number I supplied or is a logical step from one; four to six sentences total. Then give a second version at half the length for the summary box, and name the weakest link in my chain — the reviewer's likeliest attack point — so I can reinforce it before submission.`,
  },
];

/** Every distinct {{placeholder}} in a template, in first-appearance order. */
export function extractVariables(template) {
  if (typeof template !== "string" || template === "") return [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");
  const found = [];
  const seen = new Set();
  let match = pattern.exec(template);
  while (match !== null) {
    const key = match[1];
    if (!seen.has(key)) {
      seen.add(key);
      found.push(key);
    }
    match = pattern.exec(template);
  }
  return found;
}

/** Rough size estimate only — see CHARS_PER_TOKEN. Never negative, never NaN. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

export function getPrompt(id) {
  return PROMPTS.find((prompt) => prompt.id === id) || null;
}

/** Case-insensitive AND search across title, goal, category and tags. */
export function searchPrompts({ query = "", category = "All" } = {}) {
  const terms = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return PROMPTS.filter((prompt) => {
    if (category && category !== "All" && prompt.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = `${prompt.title} ${prompt.goal} ${prompt.category} ${prompt.tags.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Substitute values into a template.
 * Blank or missing values keep their {{placeholder}} visible and are reported
 * in `missing` so nothing silently disappears from the copied prompt.
 */
export function fillPrompt({ template, values } = {}) {
  if (typeof template !== "string" || template.trim() === "") {
    return { error: "Choose a prompt first — there is no template to fill in." };
  }
  if (values !== undefined && (values === null || typeof values !== "object")) {
    return { error: "Variable values must be given as an object of key/value pairs." };
  }

  const supplied = values || {};
  const variables = extractVariables(template);
  const missing = [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");

  const text = template.replace(pattern, (_whole, key) => {
    const raw = supplied[key];
    const value = raw === undefined || raw === null ? "" : String(raw).trim();
    if (value === "") {
      if (!missing.includes(key)) missing.push(key);
      return `{{${key}}}`;
    }
    return value;
  });

  const estimatedTokens = estimateTokens(text);

  return {
    text,
    variables,
    missing,
    totalCount: variables.length,
    filledCount: variables.length - missing.length,
    characters: text.length,
    words: countWords(text),
    estimatedTokens,
    isLong: estimatedTokens > LONG_PROMPT_TOKENS,
  };
}
