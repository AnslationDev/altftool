const seo = {
  intro:
    "The Marketer Prompt Pack is a library of 10 fill-in-the-blank AI prompts organised by funnel stage: positioning and audience mapping, ad variants and SEO briefs for awareness, nurture emails and comparison pages for consideration, landing page audits and launch messaging for conversion, and retrospectives and win-backs for retention. Each prompt fixes the audience, the offer and the output format, and bakes in the discipline good marketing already follows — one test variable per ad batch, claims traced to evidence, and honest concessions on comparison pages. You fill the blanks in your browser and copy the finished prompt into any assistant.",
  useCases: [
    "Writing five Meta ad variants that hold one angle constant and each vary a single element, with the test hypothesis stated so a winner actually teaches you something.",
    "Auditing a landing page against its traffic source by pasting the real copy and bounce data, and getting the top three fixes ranked by impact against effort.",
    "Running a campaign retrospective where the model computes stage-by-stage conversion from your actual numbers and says plainly which conclusions the sample size supports.",
  ],
  benefits: [
    ["Funnel-stage organised", "Prompts are grouped by the job — awareness, consideration, conversion, retention — so the copy matches where the reader actually is."],
    ["Testing discipline built in", "The ad and audit prompts enforce one-variable-at-a-time and refuse A/B suggestions your sample size cannot support."],
    ["Runs locally", "Prompt assembly happens in the browser; no account, no API key and nothing you type leaves the page."],
  ],
  faqs: [
    [
      "How do I write a good marketing prompt for AI?",
      "Fix four things the model cannot guess: the specific audience, the real alternative they use today, the evidence you can prove, and the exact output format. These prompts also add a refusal rule — where evidence is thin the model must write 'needs proof' instead of inventing a statistic, which is the failure mode of most AI marketing copy.",
    ],
    [
      "Can AI write ad copy that converts?",
      "It drafts variants quickly, but conversion comes from the test design, not the prose. The ad prompt here holds one angle constant across five variants and changes exactly one element per variant — hook, specificity, proof, framing or form — so when a variant wins you know why and can reuse the lesson.",
    ],
    [
      "What should a comparison page say about a competitor?",
      "Only claims checkable from the competitor's own public materials, plus an honest section on where they win. The comparison prompt requires a concede-the-point section and flags every competitor claim for manual verification, which is both the credible approach and the safe one. For anything legally sensitive, have counsel review before publishing.",
    ],
    [
      "How many metrics do I need for a useful campaign retrospective?",
      "Absolute numbers at every funnel stage plus spend — percentages alone hide scale. The retrospective prompt computes conversion between each stage from your raw counts, then explicitly separates conclusions the sample size supports from ones it cannot, so a 9-demo campaign is not treated like a thousand-lead dataset.",
    ],
  ],
};

export default seo;
