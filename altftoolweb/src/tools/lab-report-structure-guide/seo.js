const seo = {
  title: "Lab Report Structure: IMRaD Plan + Percent Error",
  metaDescription:
    "Builds an IMRaD skeleton with a word budget and checklist per section for a 300-8,000 word report, plus percent error from your own figures.",
  steps: [
    "Choose a \"Report style\" - School practical write-up, Undergraduate lab report or Formal IMRaD report - and set the \"Word target\" anywhere from 300 to 8,000 words.",
    "Work down the \"Section skeleton\", ticking each section as you draft it; every card carries its own word budget and the checklist of what a marker looks for there.",
    "Enter \"Your measured value\" and the \"Accepted / literature value\" for the percent error headline, with signed percent error, absolute error and percent difference beneath it; \"Copy skeleton\" copies the whole plan.",
  ],
  intro:
    "A lab report structure guide lays out the IMRaD skeleton — Introduction, Methods, Results and Discussion — and assigns each section a word budget, a grammatical tense and a checklist of what a marker expects to find there. It also runs the two calculations a results section always needs: percent error, (measured − accepted) ÷ accepted × 100, and percent difference when there is no accepted value. Written for school practicals, undergraduate lab courses and formal journal-shaped reports, with the abstract capped at the 250-word APA ceiling most rubrics reuse.",
  useCases: [
    "Split a 1,500-word undergraduate report so the discussion gets 450 words instead of the 80 that are left at 2 a.m.",
    "Check whether a measured value of 9.62 m/s² against the accepted 9.81 m/s² is a 2% error or a 20% one before writing the discussion.",
    "Give a school student a tick-list of what belongs in Method versus Results so the two stop blurring together.",
    "Convert a finished experiment into a journal-shaped IMRaD outline before drafting a project report.",
  ],
  benefits: [
    ["Section-by-section checklist", "Each section lists what a marker looks for, so nothing is left to guesswork."],
    ["Word budgets that add up", "Allocations sum exactly to your target and give the discussion the largest share."],
    ["Error maths built in", "Percent error and percent difference are calculated from your own numbers, with divide-by-zero handled."],
  ],
  faqs: [
    [
      "What is the IMRaD structure of a lab report?",
      "IMRaD stands for Introduction, Methods, Results and Discussion — the standard order for reporting original experimental work. The introduction says why the experiment was done, methods says how, results says what happened, and discussion says what it means; abstract, references and appendices sit around that core.",
    ],
    [
      "How do you calculate percent error in a lab report?",
      "Percent error = (measured value − accepted value) ÷ accepted value × 100. Measuring g as 9.62 m/s² against the accepted 9.81 m/s² gives −1.94%, a result 1.94% below the accepted value. If there is no accepted value, use percent difference: |a − b| ÷ ((a + b) ÷ 2) × 100.",
    ],
    [
      "How long should a lab report abstract be?",
      "Aim for 150-250 words. APA 7th edition recommends that range and most course rubrics and journals reuse the 250-word ceiling, so an abstract does not get longer just because the report does.",
    ],
    [
      "What tense should a lab report be written in?",
      "Methods and results go in the past tense, usually passive — the solution was heated, the mass was recorded — because they describe what was done on one occasion. Established theory and your interpretation in the discussion go in the present tense, because they are claims about how things are.",
    ],
  ],
};

export default seo;
