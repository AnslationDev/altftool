const seo = {
  title: "Essay Feedback Prompt Builder — Quote-Anchored",
  metaDescription:
    "Builds an AI reviewer prompt with a comment budget of one per 150 words (3-15), quote-anchored feedback and an optional no-rewriting rule.",
  steps: [
    "Fill in \"Type of essay\" and \"Approximate length in words\" (50-10,000), tick the Feedback dimensions to review, and optionally add the assignment brief and writer's level.",
    "Keep \"Forbid the AI from rewriting passages itself\" ticked and choose whether to \"End with a top-3 'next draft priorities' list\".",
    "Check the Comment budget — one quote-anchored comment per 150 words of essay — read the Generated prompt panel, and press \"Copy prompt\" to paste it into any AI chat before your essay.",
  ],
  intro:
    "The Essay Feedback Prompt Builder generates an AI reviewer prompt that gives formative, quote-anchored feedback on the dimensions you choose — structure, evidence, clarity, argument and mechanics. It budgets roughly one substantive comment per 150 words (clamped between 3 and 15), and every comment must follow the observation-why-action pattern under kind-specific-helpful critique norms. Students and teachers get revision-focused feedback instead of a vague grade or an unwanted rewrite.",
  useCases: [
    "A student gets structured feedback on a 1,500-word argumentative essay draft — 10 anchored comments plus a top-3 priorities list — before submitting.",
    "A teacher builds a consistent feedback prompt for a whole class set, limiting the review to structure and evidence to match this week's learning goal.",
    "An ESL writer requests clarity-only feedback that names each wordy or ambiguous sentence but is forbidden from rewriting it.",
  ],
  benefits: [
    ["A real comment budget", "Feedback volume scales with essay length — one comment per ~150 words — so nothing is skimmed or buried."],
    ["Quote-anchored comments", "Every comment must quote the exact phrase it refers to, ending the problem of feedback the writer cannot locate."],
    ["Feedback, not rewriting", "An optional rule forbids the AI from rewriting passages, keeping the revision work — and the learning — with the writer."],
  ],
  faqs: [
    [
      "How many comments will the AI give on my essay?",
      "About one substantive comment per 150 words, with a minimum of 3 and a maximum of 15. A 1,500-word essay gets exactly 10 comments; anything over roughly 2,250 words is capped at 15 so the feedback stays prioritised rather than exhaustive.",
    ],
    [
      "What does 'quote-anchored' feedback mean?",
      "Every comment must include the exact phrase or sentence it refers to, in quotation marks, followed by why it matters and one concrete revision action. This removes the most common failure of both AI and human feedback: comments the writer cannot connect to a specific place in their text.",
    ],
    [
      "Can I stop the AI from rewriting my essay?",
      "Yes — the no-rewriting rule is on by default. The prompt instructs the AI to describe each fix and let the writer make it, which keeps the work authentically the student's and aligns with most academic-integrity policies on AI assistance.",
    ],
    [
      "Is it okay to use AI feedback on graded schoolwork?",
      "That depends on your institution's rules — many allow AI feedback on drafts but not AI-written text, and some require disclosure. This tool only builds the feedback prompt; check your syllabus or academic-integrity policy before pasting graded work into any AI service.",
    ],
  ],
};

export default seo;
