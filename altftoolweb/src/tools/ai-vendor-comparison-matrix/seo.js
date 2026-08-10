const seo = {
  title: "AI Vendor Comparison Matrix — Weighted 0-100 Scoring",
  metaDescription:
    "Score up to 6 AI vendors 1-5 on cost, control, support and compliance, weight each criterion, and get a ranked 0-100 shortlist with ties flagged.",
  steps: [
    "Enter each Vendor name (Add vendor allows up to 6 rows) and pick a 1-5 score for Cost, Control, Support and Compliance.",
    "Set the four criterion weights — any positive numbers work, since scores are normalised by the total weight.",
    "Read the ranked table with each vendor's Score /100 and fit band, then click Copy result to keep the matrix for the decision record.",
  ],
  intro:
    "This tool ranks competing AI vendors with a weighted-sum decision matrix: each vendor is scored 1–5 on cost, control, support and compliance, each criterion carries a weight you set, and the result is a normalised 0–100 score per vendor. It is built for teams choosing between AI API providers, model hosts or SaaS AI products who need a defensible, written-down basis for the shortlist rather than gut feel. The method is the standard additive weighted scoring model used in procurement RFP evaluations.",
  useCases: [
    "An engineering lead comparing two LLM API providers where one is cheaper but the other offers EU data residency and a stronger SLA",
    "A procurement team documenting a weighted evaluation before signing an annual AI vendor contract",
    "A startup founder deciding between a managed AI platform and a self-hosted open-model stack by weighting control and cost differently",
  ],
  benefits: [
    ["Weighted, not naive", "Each criterion's weight is normalised by the total, so a 40/20/20/20 split genuinely doubles the impact of the top criterion."],
    ["Tie and margin detection", "The ranking flags exact ties and shows how many points separate the winner from the runner-up."],
    ["Copyable audit trail", "One click copies the full ranked matrix with weights and per-criterion scores for the decision record."],
  ],
  faqs: [
    [
      "How do I compare AI vendors objectively?",
      "Use a weighted scoring matrix: pick criteria (commonly cost, control, support and compliance), assign each a weight, score every vendor 1–5 per criterion, and compute sum(weight × score) ÷ sum(weights). This tool normalises that result to a 0–100 scale so vendors are directly comparable, and equal totals are reported as a tie rather than an arbitrary winner.",
    ],
    [
      "What criteria matter most when choosing an AI vendor?",
      "The four axes most evaluations converge on are cost (unit pricing, volume tiers, hidden fees), control (data residency, model choice, exit terms and lock-in), support (SLA and response times) and compliance (SOC 2 or ISO 27001 certification, a GDPR data processing agreement, retention and audit controls). Their relative weight depends on your use case — a healthcare team typically weights compliance highest, a consumer app may weight cost.",
    ],
    [
      "What is a weighted scoring model for vendor selection?",
      "It is the simple additive form of multi-criteria decision analysis: each criterion gets a weight, each option gets a score per criterion, and the option's total is the weight-normalised sum of its scores. It is widely used in RFP evaluations because it makes trade-offs explicit and auditable, though it assumes criteria are independent of each other.",
    ],
    [
      "What score counts as a good vendor fit?",
      "On this tool's 0–100 scale, 80 and above reads as a strong fit, 60–79 a good fit, 40–59 mixed, and below 40 weak. The bands are guidance only — a vendor scoring 85 overall can still fail on a single non-negotiable requirement, so treat any must-have (for example a signed DPA) as a pass/fail gate outside the matrix.",
    ],
  ],
};

export default seo;
