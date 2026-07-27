const seo = {
  intro:
    "The AI Usage Log for Assignments records, entry by entry, which AI tools helped with which parts of a submission — the section of the work, the tool, how the output was used, what was asked and when — and exports it as a clean Markdown or plain-text declaration. Its fields follow what university academic-integrity policies and UNESCO's 2023 guidance on generative AI in education ask students to declare when AI use is permitted. It is built for students and teaching staff who need a consistent, honest record attached to submissions.",
  useCases: [
    "A student attaching a declaration log to an essay after using ChatGPT to summarise sources and Grammarly to proofread",
    "A computer science student recording which functions in a coding assignment were debugged with an AI assistant",
    "A lecturer giving students a standard log format so declarations arrive consistent and comparable across the class",
  ],
  benefits: [
    ["Policy-shaped fields", "Captures the five things integrity policies ask for: which part, which tool, how it was used, what was asked, and when."],
    ["Eight graded use modes", "From brainstorming to verbatim quoted output, so the log reflects the real level of reliance."],
    ["Export-ready", "Produces Markdown or plain text with a built-in declaration sentence, ready to paste into an appendix."],
  ],
  faqs: [
    [
      "Do I need to declare AI use in my assignment?",
      "If your institution or unit permits AI use, almost all of them require a declaration of how it was used; if AI use is prohibited for the unit, a declaration does not make it acceptable. Check the assignment brief or unit guide first — policies differ per unit, not just per university — and ask the coordinator when unsure.",
    ],
    [
      "What should an AI usage declaration include?",
      "Per use: the part of the work the AI touched, the tool's name, how the output was used (brainstorming, editing, drafting, and so on), a short summary of the prompt, and the date. This is the field set common to university declaration templates and UNESCO's guidance on transparent generative-AI use in education.",
    ],
    [
      "Is using Grammarly or a spell checker something I have to log?",
      "It depends on the unit's policy. Many institutions exempt basic spelling and grammar checkers but require declaration once a tool rewrites sentences or generates text — Grammarly's generative rewrite features usually cross that line. Logging it costs one line and is never wrong; omitting it can be an integrity breach where the policy requires it.",
    ],
    [
      "Can I use AI output word-for-word if I log it?",
      "Only if the unit policy allows it, and then it must be treated like any other source: quoted or clearly marked and cited, not silently pasted. This log has a dedicated 'output used verbatim (quoted and cited)' mode so that the heaviest form of reliance is declared explicitly.",
    ],
  ],
};

export default seo;
