const seo = {
  title: "Assignment Word Count Planner with Section Targets",
  metaDescription:
    "Split an essay word budget across weighted sections — 10% intro, 80% body, 10% conclusion preloaded — with exact targets and per-section progress.",
  steps: [
    "Enter your Total word budget (default 2000) — the 10% introduction, 80% body, 10% conclusion split comes preloaded as weighted sections.",
    "Adjust each section's Weight % and log Words written; Add section and the remove buttons reshape the structure for reports or dissertations.",
    "Read the table of Target, Written, Remaining and Progress per section — targets always sum exactly to the budget — plus the ±10% tolerance band; Copy plan copies it as text.",
  ],
  intro:
    "This planner divides an assignment's total word budget across its sections in proportion to the weight you give each one, using the largest-remainder method so the per-section targets always add up exactly to the limit. It preloads the structure taught in most academic writing guides — roughly 10% introduction, 80% body and 10% conclusion — and tracks words written against each target so students can see precisely how much every section still needs.",
  useCases: [
    "A student starting a 2,000-word essay who wants concrete targets — about 200 words for the introduction, 1,600 for the body and 200 for the conclusion — before writing a line",
    "A dissertation writer splitting a 10,000-word budget across literature review, methodology, results and discussion chapters with custom weights",
    "Someone mid-draft logging words written per section to find which chapter is furthest behind before a deadline",
  ],
  benefits: [
    ["Targets that sum exactly", "Largest-remainder rounding means section targets always total the full budget, never 1,998 or 2,003."],
    ["Progress per section", "Each section shows words written, words remaining and an over-budget flag, not just one global count."],
    ["Fully editable structure", "Add, remove or reweight sections for essays, reports, dissertations or reflective journals."],
  ],
  faqs: [
    [
      "How many words should each section of an essay be?",
      "A common guideline is about 10% of the total for the introduction, 80% for the main body and 10% for the conclusion, so a 2,000-word essay gets roughly 200, 1,600 and 200 words respectively. Longer pieces such as dissertations use different splits — a literature review alone often takes 20-30% — so adjust the weights to your brief.",
    ],
    [
      "Is there a tolerance on university word counts?",
      "Many institutions allow around plus or minus 10% of the stated limit before applying penalties, so a 2,000-word essay is often safe between 1,800 and 2,200 words. This is a convention, not a universal rule — some markers stop reading at the limit — so always confirm the policy in your module handbook.",
    ],
    [
      "Do references and the bibliography count toward the word limit?",
      "Usually the reference list and bibliography are excluded, while in-text citations are included, but practice varies by institution. Check your assignment brief; this planner counts whatever words you choose to log against each section.",
    ],
    [
      "How does the planner split the word budget between sections?",
      "It allocates the total in proportion to each section's weight and rounds using the largest-remainder method, which guarantees the whole-number targets sum exactly to the budget. If your weights do not add to 100 the tool still splits proportionally and tells you the actual sum.",
    ],
  ],
};

export default seo;
