const seo = {
  title: "Rubric Prompt Builder — Weighted Criteria, Exact",
  metaDescription:
    "Generate an AI prompt for an analytic grading rubric: weights become whole point maxima that sum exactly to your total, with 3-5 performance levels.",
  steps: [
    "Describe the 'Assignment being graded', set 'Total points' and pick 3, 4 or 5 Levels, then list 2 to 10 criteria whose 'Weight %' values must total exactly 100%.",
    "The tool converts the weights into whole point maxima by largest-remainder apportionment — the per-criterion points shown always sum exactly to the rubric total.",
    "Review the 'Generated prompt', optionally ticking 'Ask for a feedback sentence stem per criterion', then press 'Copy prompt' to paste it into your AI assistant.",
  ],
  intro:
    "The Rubric Prompt Builder generates an AI prompt that produces an analytic grading rubric: weighted criteria as rows, performance levels as columns, and observable descriptors in every cell. Criterion weights are converted into whole point maxima with largest-remainder apportionment, so a 100-point rubric weighted 30/30/25/15 always allocates exactly 30, 30, 25 and 15 points. Teachers and course designers get a rubric prompt with fixed numbers the AI cannot drift from.",
  useCases: [
    "A writing instructor builds a 100-point essay rubric with four weighted criteria and the standard 4-level Exemplary–Proficient–Developing–Beginning scale.",
    "A science teacher creates a 50-point lab report rubric where methodology carries 40% of the weight and presentation only 10%.",
    "A training manager drafts a rubric for evaluating internal certification projects, with feedback sentence stems reviewers can reuse.",
  ],
  benefits: [
    ["Points that always add up", "Weights become whole point maxima that sum exactly to your total — no rounding surprises at grading time."],
    ["Observable descriptors", "The prompt bans vague adjectives and demands measurable evidence in every cell, at every level."],
    ["Standard level scales", "Choose 3, 4 or 5 performance levels with conventional education labels rather than inventing your own."],
  ],
  faqs: [
    [
      "What is an analytic rubric and why does this tool build one?",
      "An analytic rubric scores each criterion separately on its own row, unlike a holistic rubric that gives one overall score. Analytic rubrics are the standard for transparent grading because students see exactly where points were earned or lost, and this tool fixes each row's maximum points before the AI writes a single descriptor.",
    ],
    [
      "How are points divided between criteria?",
      "By largest-remainder apportionment: each weight percentage is turned into a fractional point quota, whole points are assigned by the floor first, and any leftover points go to the criteria with the largest fractional remainders. The per-criterion maxima therefore always sum exactly to the rubric total.",
    ],
    [
      "How many performance levels should a rubric have?",
      "Three to five levels is standard practice; this tool offers exactly those options. Four levels (Exemplary, Proficient, Developing, Beginning) is the most common choice — it mirrors widely used academic rubric frameworks and avoids a safe middle option that graders overuse on odd-numbered scales.",
    ],
    [
      "Do the criterion weights have to total 100%?",
      "Yes. The tool validates that weights sum to exactly 100% before generating a prompt and shows the current sum when they do not, because a rubric whose weights do not total 100% cannot be mapped cleanly onto a fixed point total.",
    ],
  ],
};

export default seo;
