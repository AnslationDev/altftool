/**
 * AI Vendor Due Diligence Checklist — generates a tailored question list for
 * evaluating an AI vendor before signing.
 *
 * The question bank encodes widely recognised diligence anchors:
 * - SOC 2 Type II and ISO/IEC 27001 for security assurance,
 *   ISO/IEC 42001 (2023) for AI management systems.
 * - GDPR Article 28 processor terms (DPA), subprocessor notification with a
 *   right to object, and Chapter V transfer mechanisms (SCCs / adequacy).
 * - The EU AI Act's provider/deployer obligation split.
 * - Training-on-customer-data and human-review practices, the two issues that
 *   most differentiate AI vendors from ordinary SaaS.
 */

export const VENDOR_TYPE_OPTIONS = [
  { id: "model-api", label: "Foundation model API provider" },
  { id: "embedded-saas", label: "SaaS product with AI features" },
  { id: "custom", label: "Custom AI development / consultancy" },
];

/** Ranked so higher sensitivity can upgrade question priority. */
export const SENSITIVITY_OPTIONS = [
  { id: "public", label: "Public / non-sensitive data", rank: 0 },
  { id: "internal", label: "Internal business data", rank: 1 },
  { id: "confidential", label: "Confidential / customer data", rank: 2 },
  { id: "regulated", label: "Regulated data (health, financial, children's)", rank: 3 },
];

export const PRIORITY_MUST = "must";
export const PRIORITY_RECOMMENDED = "recommended";

/** Rank at or above which access-control and incident questions become must-ask. */
const CONFIDENTIAL_RANK = 2;

/**
 * Build the tailored due-diligence question list.
 * @returns {object} { categories, totalQuestions, mustCount, recommendedCount, ... } or { error }.
 */
export function buildDueDiligenceChecklist({
  vendorTypeId,
  sensitivityId,
  euData = false,
  regulatedIndustry = false,
}) {
  const vendorType = VENDOR_TYPE_OPTIONS.find((v) => v.id === vendorTypeId);
  if (!vendorType) return { error: "Choose the type of AI vendor you are evaluating." };
  const sensitivity = SENSITIVITY_OPTIONS.find((s) => s.id === sensitivityId);
  if (!sensitivity) return { error: "Choose the sensitivity of the data the vendor will touch." };

  const sensitive = sensitivity.rank >= CONFIDENTIAL_RANK;

  const dataHandling = [
    { text: "In which regions is our data processed and stored, and can we pin data residency?", priority: PRIORITY_MUST },
    { text: "How long are prompts, outputs and logs retained, and is a zero- or short-retention option available?", priority: PRIORITY_MUST },
    { text: "Is data encrypted in transit and at rest, and how are keys managed?", priority: PRIORITY_MUST },
    {
      text: "Which vendor staff can access our data, under what approval, and is that access logged and reviewable?",
      priority: sensitive ? PRIORITY_MUST : PRIORITY_RECOMMENDED,
    },
  ];
  if (sensitive) {
    dataHandling.push({
      text: "Do you support customer-managed encryption keys (BYOK) or private/dedicated deployment for sensitive workloads?",
      priority: PRIORITY_RECOMMENDED,
    });
  }

  const training = [
    { text: "Is our data used to train or improve models by default, and is the opt-out contractual — not just a dashboard setting?", priority: PRIORITY_MUST },
    { text: "Are human reviewers ever shown our prompts or outputs (e.g. for abuse review), and under what controls?", priority: PRIORITY_MUST },
    {
      text: "If we fine-tune or customise, who owns the resulting model and data, and can we export and delete them?",
      priority: vendorType.id === "custom" ? PRIORITY_MUST : PRIORITY_RECOMMENDED,
    },
  ];

  const subprocessors = [
    { text: "Provide the full subprocessor list — including underlying model providers and hosting — with processing locations.", priority: PRIORITY_MUST },
    {
      text: "Will we be notified in advance of subprocessor changes, with a contractual right to object?",
      priority: euData ? PRIORITY_MUST : PRIORITY_RECOMMENDED,
    },
  ];
  if (vendorType.id === "embedded-saas" || vendorType.id === "model-api") {
    subprocessors.push({
      text: "Which base models power the service, and what notice do we get before a model is swapped or deprecated?",
      priority: PRIORITY_MUST,
    });
  }

  const security = [
    { text: "Do you hold a current SOC 2 Type II report and/or ISO/IEC 27001 certificate, and will you share the report under NDA?", priority: PRIORITY_MUST },
    { text: "What tenant-isolation and AI-specific controls exist against prompt injection and cross-customer data leakage?", priority: PRIORITY_MUST },
    { text: "Are you certified or working toward ISO/IEC 42001 (AI management systems), or aligned to the NIST AI RMF?", priority: PRIORITY_RECOMMENDED },
    { text: "What is your penetration-testing cadence and vulnerability disclosure process?", priority: PRIORITY_RECOMMENDED },
  ];

  const compliance = [
    {
      text: "Will you sign a data processing agreement with GDPR Article 28 processor terms?",
      priority: euData ? PRIORITY_MUST : PRIORITY_RECOMMENDED,
    },
    { text: "Do you indemnify customers against IP/copyright claims arising from model outputs, and with what cap?", priority: PRIORITY_RECOMMENDED },
  ];
  if (euData) {
    compliance.push(
      { text: "What is the legal mechanism for transfers of EU personal data (adequacy, SCCs), and where is it documented?", priority: PRIORITY_MUST },
      { text: "How do you classify the service under the EU AI Act, and which provider vs deployer obligations fall on us?", priority: PRIORITY_RECOMMENDED },
    );
  }
  if (regulatedIndustry) {
    compliance.push({
      text: "Do you support our sector obligations (e.g. HIPAA BAA, PCI DSS scoping, financial-services record-keeping)?",
      priority: PRIORITY_MUST,
    });
  }

  const exitReliability = [
    { text: "What uptime SLA, support response times and service credits apply, and what are the rate limits at our projected scale?", priority: PRIORITY_RECOMMENDED },
    { text: "On termination, how and when is our data returned and deleted, and do we get a deletion certification?", priority: PRIORITY_MUST },
    {
      text: "What is your security-incident notification commitment to customers, in hours, and is it contractual?",
      priority: euData || sensitive ? PRIORITY_MUST : PRIORITY_RECOMMENDED,
    },
  ];

  const categories = [
    { id: "data-handling", label: "Data handling & retention", questions: dataHandling },
    { id: "training", label: "Training on your data", questions: training },
    { id: "subprocessors", label: "Subprocessors & model provenance", questions: subprocessors },
    { id: "security", label: "Security & certifications", questions: security },
    { id: "compliance", label: "Compliance & legal", questions: compliance },
    { id: "exit", label: "Reliability & exit", questions: exitReliability },
  ].map((category) => ({
    ...category,
    questions: category.questions.map((question, index) => ({
      id: `${category.id}-${index + 1}`,
      ...question,
    })),
  }));

  let mustCount = 0;
  let recommendedCount = 0;
  categories.forEach((category) => {
    category.questions.forEach((question) => {
      if (question.priority === PRIORITY_MUST) mustCount += 1;
      else recommendedCount += 1;
    });
  });

  return {
    categories,
    totalQuestions: mustCount + recommendedCount,
    mustCount,
    recommendedCount,
    vendorTypeLabel: vendorType.label,
    sensitivityLabel: sensitivity.label,
  };
}

/** Render the checklist as copy-ready Markdown grouped by category. */
export function checklistToMarkdown(checklist) {
  if (!checklist || !Array.isArray(checklist.categories)) return "";
  const lines = [
    "# AI vendor due diligence questions",
    `Vendor type: ${checklist.vendorTypeLabel}`,
    `Data sensitivity: ${checklist.sensitivityLabel}`,
    `${checklist.mustCount} must-ask · ${checklist.recommendedCount} recommended`,
    "",
  ];
  checklist.categories.forEach((category) => {
    lines.push(`## ${category.label}`);
    category.questions.forEach((question) => {
      lines.push(`- [ ] ${question.priority === PRIORITY_MUST ? "**[MUST]**" : "[Recommended]"} ${question.text}`);
    });
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}
