const seo = {
  intro:
    "The Researcher Prompt Pack is a library of 9 fill-in-the-blank AI prompts for academic work: literature mapping, critical appraisal of single papers, research question sharpening, study-design pre-mortems, qualitative coding second opinions, statistical plan checks, abstracts, reviewer responses and grant significance paragraphs. Every prompt is built around the central failure mode of AI in research — confabulation — so each one restricts the model to material you paste, forbids invented citations outright, and requires 'not determinable from provided text' where the source is silent. Fill the blanks in your browser and copy the finished prompt into any assistant.",
  useCases: [
    "Mapping fifteen papers you have actually read into camps and live tensions, with the gap your angle occupies stated — and missing literature returned as search queries, never as invented references.",
    "Running a pre-mortem on a survey design before data collection: the reviewer-2 sentence about causal claims, the selection bias in HR-distributed recruitment, and the fix or honest limitation for each.",
    "Drafting a point-by-point response to reviewers where concessions are specific, defences are substantive, and no change is claimed that you did not actually make.",
  ],
  benefits: [
    ["Anti-confabulation by construction", "Prompts forbid invented citations, restrict critique to pasted text, and require every abstract number to appear exactly as you supplied it."],
    ["Reviewer-grade scepticism", "The design and analysis prompts attack your work the way peer review will — while you can still change the study instead of writing a limitation paragraph."],
    ["Runs locally", "Prompt assembly happens in the browser; no account, no API key and nothing you paste leaves the page."],
  ],
  faqs: [
    [
      "Can I trust AI-generated citations?",
      "No — fabricated references are among the most consistent failures of language models, and hallucinated citations have led to real retractions and sanctions. Every prompt in this pack forbids the model from adding references you did not supply; where literature is missing, the model must describe what the paper would need to show and return it as a search query for you to run in a real database.",
    ],
    [
      "Is it acceptable to use AI in academic research?",
      "Policies vary by journal, funder and institution, and many now require disclosure of AI use in writing. Using AI to organise your own reading, stress-test a design or draft prose you then verify and rewrite is broadly accepted with disclosure; presenting AI-generated analysis or text as your own without verification is not. Check the specific policy of your target venue before submission.",
    ],
    [
      "What is a study design pre-mortem?",
      "It is attacking your own design as if it had already failed peer review — before data collection, while problems are still fixable. The pre-mortem prompt works through the causal gap between design and claim, selection bias in recruitment, measurement validity, power and confounds, and for each problem returns either a design fix or the honest limitation sentence.",
    ],
    [
      "Can AI check my statistical analysis?",
      "It can catch mismatches between the question, the variables and the planned test — like treating a banded ordinal predictor as linear without noting the assumption — and name the diagnostics worth running. It is a sanity check, not an authority: verify anything load-bearing against a statistics reference or a statistician, especially power calculations.",
    ],
  ],
};

export default seo;
