const seo = {
  title: "Reference Letter Prompt Builder: Honest Percentiles",
  metaDescription:
    "Rank 3 of 120 is 2.5%, so it claims 'top 5%', never 'top 1%'. Under 20 people it drops percentages, and splits your word target six ways.",
  steps: [
    "Enter Person you are recommending, Letter type, Your relationship, Months you have known them and In what capacity you observed them.",
    "List one incident per line under 'Specific things you saw them do', then give Their rank in the cohort, Size of that cohort and Target length (words).",
    "Read the Strongest honest claim, the Example specificity scores and the Section word budget, then press Copy prompt to take the finished prompt.",
  ],
  intro:
    "The Recommendation Letter Prompt Builder converts what you personally observed into an AI prompt that produces a specific, defensible reference letter instead of a page of superlatives. It calculates the strongest percentile claim your cohort size honestly supports — rank 3 of 120 is 2.5%, which rounds up to 'top 5%', never down to 'top 1%' — and splits your target length across the six sections of a letter so each part gets a word allowance. Each example you supply is scored for whether it names an artefact, states an outcome and offers a comparison.",
  useCases: [
    "Write a graduate school letter where you can only speak to one module and one project, and need the letter to say so honestly.",
    "Work out whether 'top 10%' is a claim you can actually make from a class of 45, or whether you should name the real numbers instead.",
    "Turn a list of remembered incidents into a letter prompt that will not silently upgrade them into achievements.",
    "Draft an employment reference that stays inside what you observed as a manager rather than what you assume about the person.",
  ],
  benefits: [
    [
      "Percentile you can defend",
      "The claim is rounded up to the next conventional band, so the letter never overstates the rank.",
    ],
    [
      "Small cohorts handled honestly",
      "Under 20 people the tool drops percentages entirely and writes out the real numbers.",
    ],
    [
      "Anecdotes scored before you write",
      "Each example is checked for a named artefact, a stated outcome and a peer comparison.",
    ],
  ],
  faqs: [
    [
      "How long should a letter of recommendation be?",
      "One page for an employment reference, one to two pages for academic admissions. In words that is roughly 300 to 500 for a job reference and 500 to 800 for a graduate application; at 12pt single-spaced with one-inch margins a page holds about 500 words. This tool enforces the range for the letter type you pick.",
    ],
    [
      "Can I say a student is in the top 1% of their class?",
      "Only if the cohort is large enough for that to be arithmetically possible. In a class of 40 the best possible rank is 1, which is 2.5% — so 'top 5%' is the strongest honest claim. This tool computes the exact percentage from rank and cohort size and rounds up to the next conventional band, and it refuses to produce a percentage at all for cohorts under 20.",
    ],
    [
      "What makes a recommendation letter credible?",
      "Specific incidents the writer personally witnessed, with a named course, project or artefact and a stated outcome. Committees discount adjectives like 'brilliant' and 'exceptional' that arrive without evidence. Stating plainly what you did not see also builds trust — a short honest letter reads better than one that overclaims familiarity.",
    ],
    [
      "Is gendered language a real problem in reference letters?",
      "Research on academic and medical reference letters has repeatedly found that letters for women contain more communal terms — warm, helpful, nurturing, hard-working — while letters for men contain more agentic terms such as ambitious, independent and brilliant, even for candidates with comparable records. The prompt this tool builds explicitly instructs the model to describe the same evidence in neutral terms regardless of the candidate.",
    ],
  ],
};

export default seo;
