const seo = {
  intro:
    "An SOP document prompt builder converts a title, an owning role and a list of \"Role: action\" steps into an AI prompt that produces a complete standard operating procedure. The prompt carries the document-control fields ISO 9001:2015 clause 7.5 expects — identification, version, effective date, review date and approval — plus a RACI responsibilities table with exactly one Accountable role per step, control checks with measurable acceptance criteria, and an escalation path. It also calculates the next review date from your effective date and chosen review cycle.",
  useCases: [
    "Document a refund or chargeback process so any support agent can run it without asking the manager.",
    "Prepare procedure drafts ahead of an ISO 9001 or SOC 2 audit, with version, owner, approver and revision history already in the header.",
    "Convert tribal knowledge from a departing team member into a written procedure with named roles and evidence records.",
    "Standardise operations across branches or franchises by generating every procedure against the same section structure.",
  ],
  benefits: [
    [
      "Audit-ready header",
      "Document ID, version, owner, approver, effective date and next review date are demanded up front, not bolted on later.",
    ],
    [
      "One accountable role per step",
      "The RACI rule is enforced in the prompt, so ownership gaps surface as TODO(verify) instead of quietly disappearing.",
    ],
    [
      "Review date calculated for you",
      "Pick a quarterly, six-month, annual or two-year cycle and the next review date is worked out from the effective date, month-end included.",
    ],
  ],
  faqs: [
    [
      "What sections should a standard operating procedure have?",
      "Purpose, scope, definitions, responsibilities, materials and access, the numbered procedure, control checks, records, escalation and a revision history. Purpose and scope come first because they stop the procedure being applied to a situation it was never written for.",
    ],
    [
      "What does ISO 9001 require in an SOP?",
      "ISO 9001:2015 does not mandate a template. Clause 7.5 requires that documented information is identified and described, in a suitable format, and reviewed and approved for suitability and adequacy — which in practice means a title, an ID, a version, a date, an owner and an approver, kept under change control.",
    ],
    [
      "What is a RACI matrix in an SOP?",
      "RACI labels each activity as Responsible (does the work), Accountable (answerable for the outcome), Consulted (gives input before it completes) or Informed (told afterwards). The one hard rule is a single Accountable person per activity — two accountable owners is the most common cause of a step nobody actually does.",
    ],
    [
      "How long should an SOP be?",
      "Aim for twenty steps or fewer in one procedure. Beyond that, group the steps into named phases or split the document, because a reader who loses their place mid-procedure is the point at which errors get introduced. This builder flags any draft over twenty steps.",
    ],
  ],
};

export default seo;
