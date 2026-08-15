const seo = {
  title: "Dark Pattern Self-Audit: 6 Consent & Checkout",
  metaDescription:
    "Audit your consent banner, checkout or cancellation flow against six named signals: prominence, preselection, confirmshaming, hidden cost and more.",
  steps: [
    "Paste your banner, checkout or cancellation wording plus your own journey observations into the Consent, checkout, or cancellation copy and observations box.",
    "Leave Strict review on to require every checklist signal, or clear it for proportional coverage.",
    "Read the Audit report for each of the six signals marked Found or Missing, then Copy or Download the coverage summary.",
  ],
  intro:
    "The Dark-Pattern Self-Audit scores a consent, checkout or cancellation flow against the six manipulative-design signals regulators raise most often: unequal visual prominence of accept versus reject, preselected options, confirmshaming copy, hidden or late-added costs, cancellation that is not self-service, and repeated prompts that wear the user down. Paste the actual interface copy plus your own observations of the journey and each signal comes back Found or Missing, with a coverage percentage and a list of what still needs review. It is written for product, design and privacy teams doing a pre-launch pass on their own funnel.",
  useCases: [
    "You are shipping a new cookie banner and need to record, before launch, that Accept and Reject are the same size and neither is pre-ticked",
    "Legal has asked whether your subscription can be cancelled without contacting support, and you want the answer written down against a named checklist rather than in an email thread",
    "A competitor got a regulatory complaint over drip pricing and you are checking your own checkout shows the total including fees at the first price the user sees",
  ],
  benefits: [
    ["Six named signals, not a vague vibe check", "Prominence, preselection, confirmshaming, hidden cost, direct cancellation and repeated prompts are each judged separately and listed by name."],
    ["Strict mode refuses partial credit", "Turn it on and every signal has to be evidenced, so an unaddressed item shows as needing review rather than being averaged away."],
    ["Produces a written record", "The output names exactly which signals were not evidenced, which is what a design review or a compliance file actually needs."],
  ],
  faqs: [
    [
      "Does it scan a live website automatically?",
      "No — you paste the interface copy and your own notes on the flow, and it checks that text against the six signals. That is deliberate, because several of the signals (button prominence, repeated prompts, whether cancellation needs a phone call) can only be judged by walking the journey yourself.",
    ],
    [
      "What counts as a dark pattern in a consent banner?",
      "The usual failures are a prominent Accept next to a buried or greyed-out Reject, options that are switched on by default, and guilt-tripping decline copy. Under the GDPR consent must be a freely given, specific, informed and unambiguous affirmative act, and the Court of Justice held in the Planet49 case that a pre-ticked box does not qualify.",
    ],
    [
      "How is the score worked out?",
      "It is coverage, not a grade: the number of the six signals evidenced in your text divided by six, so four of six reads as 67%. A high score means you documented each signal, not that a regulator would agree with your assessment.",
    ],
    [
      "Is a clean result proof that we comply?",
      "No. This is a self-audit prompt, not a legal determination, and it cannot see your flow's actual layout, timing or accessibility. Test the complete journey with a keyboard, on mobile and with a screen reader, and have a qualified privacy or consumer-law adviser sign off before you rely on the result.",
    ],
  ],
};

export default seo;
