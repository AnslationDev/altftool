const seo = {
  intro:
    "The Accountant Prompt Pack is a library of 9 fill-in-the-blank AI prompts for the recurring work of practice and industry accounting: reconciliation difference triage, journal narratives, variance analysis, plain-English report explanations, fee and scope emails, records chasing, close checklists and control reviews. Every prompt carries the same standing rule — the model works only from the figures and rule text you paste, shows its arithmetic, and flags judgement calls as judgement instead of inventing thresholds from memory. You fill the blanks in your browser and copy the finished prompt into any assistant.",
  useCases: [
    "Triaging a 4,806.00 reconciliation difference with the divisibility tests applied first, then a search checklist ordered by likelihood that skips what you already ruled out.",
    "Turning a pasted budget-vs-actual table into a board-ready variance narrative that separates rate, volume and timing effects and computes every percentage shown.",
    "Drafting a fee increase email after three years of scope creep that argues from the engagement letter's transaction limits rather than apologising for charging.",
  ],
  benefits: [
    ["Never invents figures", "Each prompt instructs the model to compute from supplied numbers, show the arithmetic, and answer 'requires investigation' where attribution is impossible."],
    ["Rules from your paste, not model memory", "The tax-rule explainer works strictly from official wording you provide, because a model's remembered thresholds may be outdated or from the wrong jurisdiction."],
    ["Runs locally", "Prompt assembly happens in the browser; no account, no API key and nothing you type leaves the page."],
  ],
  faqs: [
    [
      "Can I use AI for accounting work without breaching client confidentiality?",
      "Only with anonymised data and within your firm's and regulator's policies. These prompts are designed to work from figures, rule text and situations rather than names — but you remain responsible for what you paste, so strip client identifiers and check the assistant's data-handling terms before using real balances.",
    ],
    [
      "What do the divisibility tests in a reconciliation tell you?",
      "A difference divisible by 9 suggests a transposition error (writing 4,806 as 4,086 creates a difference of 720, which is 9 x 80), and a difference divisible by 2 suggests an item posted to the wrong side — so you search for a single item of exactly half the difference. The reconciliation prompt applies both tests to your exact figure before generating the wider search checklist.",
    ],
    [
      "Is AI output professional accounting advice?",
      "No. It is drafting and analysis support, and every prompt in this pack says so explicitly — journal entries note where judgement is involved, the rule explainer keeps formal advice inside your engagement, and material treatments should be signed off by a qualified reviewer under your normal review process.",
    ],
    [
      "How do I explain financial statements to a client with no finance background?",
      "Answer their actual worry first, then connect the numbers as a cause-and-effect story with each claim tied to a figure. The plain-English prompt enforces this order, anchors every percentage to an absolute amount, allows at most one analogy, and keeps the whole explanation under 250 words so it survives being read aloud in a meeting.",
    ],
  ],
};

export default seo;
