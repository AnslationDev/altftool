const seo = {
  title: "Founder Prompt Pack: 12 Briefs From One Context",
  metaDescription:
    "Twelve founder prompts — OKRs, pre-mortems, pricing tests, investor updates, hiring scorecards — auto-filled from your company, product, customer, stage.",
  steps: [
    "Fill \"Your context\" once: \"Company name\", \"What you build (one line)\", \"Who you sell to\", \"Stage\" and any \"Situation or extra detail\".",
    "Pick one of the 12 prompts by \"Category\" or \"Search\" — investor update, strategy pre-mortem, role scorecard, churn diagnosis — and your details substitute in.",
    "Check the \"Unfilled placeholders\" row and the Characters / Approximate tokens counts, then press \"Copy prompt\" or \"Copy all prompts\".",
  ],
  intro:
    "The Founder Prompt Pack turns a library of twelve founder prompts — positioning, OKRs, pre-mortems, pricing tests, investor updates, pitch narrative, objection prep, hiring scorecards, interview design, 30/60/90 plans, discovery scripts and churn diagnosis — into briefs that already contain your company, product, customer and funding stage. You fill one context form; every prompt substitutes those details into its placeholder slots and flags anything left blank so nothing reaches the model half-written. It is built for founders and operators at bootstrapped through Series A companies who want a structured brief rather than a blank chat box.",
  useCases: [
    "Draft the monthly investor update from raw notes, with a rule that unknown figures stay as [TBC] instead of being estimated by the model.",
    "Pressure-test a big bet with a pre-mortem before committing a quarter of engineering time to it.",
    "Turn a vague job advert into a hiring scorecard with dated, numeric outcomes and a three-level interview rubric.",
  ],
  benefits: [
    ["Context entered once", "Company, product, customer and stage flow into every prompt in the pack automatically."],
    ["No half-filled prompts", "Unfilled placeholders are listed by name and shown as [field] so you can see the gap before pasting."],
    ["Size before you paste", "Each build reports characters, words and an approximate token count at roughly four characters per token."],
  ],
  faqs: [
    [
      "What makes a founder prompt better than just asking the model?",
      "Specific context and an explicit output structure. A prompt that names your stage, customer and the exact sections you want back removes the model's need to guess, which is why every prompt here carries your company details and a fixed deliverable format.",
    ],
    [
      "Which AI model should I use these prompts with?",
      "Any current general-purpose chat model handles them; they are plain text with no tool calls or system-prompt tricks. Longer prompts such as the pitch narrative and objection prep run to roughly 200-300 tokens of instruction, well inside every model's input limit.",
    ],
    [
      "Can I trust the numbers an AI puts in my investor update?",
      "No — treat every figure as a draft. The investor update prompt deliberately instructs the model to insert [TBC] rather than estimate a missing number, because a fabricated metric in an investor email is far more damaging than a gap.",
    ],
    [
      "How do I stop AI-written prompts producing generic answers?",
      "Add a real situation in the context box. Prompts that include a concrete detail — a churn figure, a lost deal, a specific hire — produce concrete answers, while an empty context field leaves the model with nothing but the category to work from.",
    ],
  ],
};

export default seo;
