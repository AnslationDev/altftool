const seo = {
  title: "AI Vendor Due Diligence Checklist: Questions",
  metaDescription:
    "Generate must-ask and recommended questions on training data, retention, subprocessors, SOC 2 / ISO 27001 / ISO 42001 and GDPR exit terms.",
  steps: [
    "Choose from the Vendor type dropdown — Foundation model API provider, SaaS product with AI features or Custom AI development / consultancy — and set Data sensitivity anywhere from Public / non-sensitive data to Regulated data (health, financial, children's).",
    "Tick EU personal data involved so the GDPR Article 28 processor-terms and transfer questions are promoted to must-ask, and Regulated industry (health, finance, insurance) if it applies.",
    "The Questions generated count updates immediately, split into Must ask and Recommended badges under category headings, and Copy as Markdown puts the whole checklist on the clipboard.",
  ],
  intro:
    "The AI Vendor Due Diligence Checklist generates the specific questions to ask an AI vendor before signing — covering data handling and retention, training on your data, subprocessors and model provenance, security certifications (SOC 2 Type II, ISO/IEC 27001, ISO/IEC 42001), GDPR processor terms and exit rights. Questions are tailored to your vendor type and data sensitivity, and split into must-ask and recommended. It is built for procurement leads, security reviewers and founders evaluating model APIs, AI-enabled SaaS or custom AI development partners.",
  useCases: [
    "A procurement team assembling the security questionnaire for a foundation model API before a company-wide rollout",
    "A startup founder checking whether a SaaS vendor's AI feature trains on customer data and whether the opt-out is contractual",
    "A privacy officer preparing GDPR-specific questions — Article 28 DPA terms, transfer mechanisms and subprocessor objection rights — for an EU deployment",
  ],
  benefits: [
    ["AI-specific, not generic SaaS", "Covers training-on-your-data, human review of prompts, model deprecation and prompt-injection isolation — the questions ordinary vendor checklists miss."],
    ["Prioritised for real meetings", "Every question is tagged must-ask or recommended, so a 30-minute vendor call covers what matters first."],
    ["Copy-ready Markdown", "Export the whole checklist with checkboxes for your procurement doc or ticket."],
  ],
  faqs: [
    [
      "What should I ask an AI vendor about training on my data?",
      "Ask two things: whether your prompts, outputs or files are used to train or improve models by default, and whether the opt-out is written into the contract rather than buried in a dashboard setting. Also ask whether human reviewers ever see your data (for example in abuse review) and under what controls — many vendors that don't train on data still allow human review.",
    ],
    [
      "What certifications should an AI vendor have?",
      "SOC 2 Type II and ISO/IEC 27001 are the baseline security attestations most enterprise buyers require, and you should ask to see the actual report under NDA rather than the badge. For AI-specific governance, ISO/IEC 42001 (published in 2023) certifies an AI management system, and alignment with the NIST AI Risk Management Framework is a good signal where certification is absent.",
    ],
    [
      "What is a subprocessor and why does it matter for AI vendors?",
      "A subprocessor is any third party the vendor uses to process your data — for AI products that usually includes the underlying model provider and the cloud host, which many buyers overlook. Ask for the full list with locations, and for advance notification of changes with a contractual right to object; under GDPR Article 28 a processor may only engage subprocessors with the controller's authorisation.",
    ],
    [
      "Do I need a DPA with an AI vendor?",
      "If the vendor processes personal data on your behalf, GDPR Article 28 requires a data processing agreement covering instructions, confidentiality, security, subprocessors, and deletion or return of data at contract end. For EU data you also need a lawful transfer mechanism such as standard contractual clauses or an adequacy decision. This checklist flags both as must-ask when EU personal data is involved — final review belongs with your legal counsel.",
    ],
  ],
};

export default seo;
