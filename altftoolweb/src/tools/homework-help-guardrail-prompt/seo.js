const seo = {
  title: "AI Homework Prompt That Won’t Write the Answer",
  metaDescription:
    "Builds a tutoring prompt that bans the submittable artefact per assignment type: essay prose, final answers, working code, at three strictness levels.",
  steps: [
    "Enter the Subject and an optional Student level, then pick an Assignment type — Essay / written work, Maths / problem sets, Programming, Science / lab report or Foreign language — and the note underneath states the hard ban that type carries.",
    "Choose Guardrail strictness between Strict — questions only, Standard — analogous examples allowed and Light — may verify finished work, and tick the box that reminds the student about their school's AI-disclosure rules at the end of a session.",
    "Active guardrail rules counts how many rules are in force, the rows confirm the Assignment type, Scaffolding level and Disclosure reminder, and Generated prompt holds the finished text; Copy prompt puts it on the clipboard to paste into the AI assistant.",
  ],
  intro:
    "The Homework Help Guardrail Prompt builds an AI coach prompt that helps a student learn without producing anything they could submit. It encodes the help/harm line used in academic-integrity policy: explaining concepts and checking reasoning is allowed, while the submittable artefact — final prose, final numeric answers, or working code — is banned per assignment type, with rules that explicitly resist \"just give me the answer\" pressure. Parents and teachers choose from three strictness levels, from questions-only to verify-but-never-fix.",
  useCases: [
    "A parent sets up a maths coach that explains methods and works different examples, but never states the answer to the assigned problem.",
    "A CS teacher shares a programming helper prompt that explains error messages and points to the broken line without ever writing code.",
    "A school pilots AI-assisted homework support with a strict, questions-only configuration that matches its integrity policy.",
  ],
  benefits: [
    ["Type-specific hard bans", "Each assignment type bans its own submittable artefact — essay prose, final answers, working code, translations — not just \"don't cheat\"."],
    ["Pressure-resistant rules", "The prompt tells the AI to restate its rules when asked to drop them, role-play them away, or make work \"undetectable\"."],
    ["Attempt-first coaching", "The AI must see the student's attempt or thinking before helping, mirroring how tutoring centres work."],
  ],
  faqs: [
    [
      "What is the difference between AI help and AI doing the homework?",
      "The line most academic-integrity policies draw is work product: explaining a concept, checking reasoning or suggesting next steps is help, while producing text, answers or code the student submits is doing the work. This prompt encodes that line as explicit bans per assignment type.",
    ],
    [
      "Can a student just ask the AI to ignore the guardrails?",
      "The prompt instructs the AI to ignore any later message that tries to remove the rules and to restate them instead, which blocks casual pressure. No prompt can make an AI assistant perfectly rule-proof, so for high-stakes settings it should be combined with spot-checking, not relied on alone.",
    ],
    [
      "What do the three strictness levels change?",
      "Strict allows only guiding questions and naming concepts, with no worked examples at all. Standard additionally allows fully working a clearly different, analogous example. Light also lets the AI say whether the student's finished answer is right or wrong and where — but never supply the corrected version.",
    ],
    [
      "Does this replace my school's academic integrity policy?",
      "No. The prompt is a practical enforcement aid; what counts as permitted help is defined by each institution's own policy, and many require disclosure of any AI assistance. The optional disclosure reminder exists precisely to point students back to their school's rules.",
    ],
  ],
};

export default seo;
