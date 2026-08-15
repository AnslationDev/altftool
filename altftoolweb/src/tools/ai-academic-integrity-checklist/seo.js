const seo = {
  title: "AI Academic Integrity Checklist: 10-Item",
  metaDescription:
    "Ten questions on permission, disclosure, authorship and AI-citation checks. Critical fails flag high risk; get a fix list and a compliance score.",
  steps: [
    "Answer all ten checklist items Yes, No or N/A — they run through permission, disclosure, authorship, verification and data handling, four of them tagged critical.",
    "The Compliance score recomputes live and the Status row reads 'Aligned with typical policies', 'Proceed with caution' or 'High risk — do not submit yet'.",
    "Work through 'Items to fix before submitting', where each failure is labelled Critical, Important or Advisory, then press 'Copy result' to take the list away.",
  ],
  intro:
    "The AI Academic Integrity Checklist is a ten-item self-audit that checks whether your AI use on an assignment matches the requirements common across institutional policies: permission, disclosure, authorship of the submitted work, verification of AI output, and data handling. Items are tiered by severity — any failed critical item (like undisclosed AI use where disclosure is required) flags the submission as high risk, while important and advisory gaps produce a caution. Students get a concrete pass/fix list instead of a vague worry.",
  useCases: [
    "A student who used AI for brainstorming and grammar feedback runs the checklist the night before submission to confirm nothing needs disclosing or fixing.",
    "A graduate student verifies that every AI-suggested citation in a literature review actually exists before sending it to a supervisor.",
    "A teacher shares the checklist with a class as a pre-submission routine for assignments where AI assistance is permitted with disclosure.",
  ],
  benefits: [
    ["Severity-tiered results", "Critical items (permission, disclosure, authorship) are separated from important safeguards and good-practice notes, so you know what actually blocks submission."],
    ["Covers the policy dimensions that recur", "Permission, disclosure, authorship, verification and data handling — the axes most university AI policies are built on."],
    ["A copyable fix list", "Failed items come out as a prioritised list you can work through, with a compliance score out of 100."],
  ],
  faqs: [
    [
      "Do I need to disclose that I used AI on my assignment?",
      "It depends on your institution and often on the individual course: many syllabi now require an acknowledgement statement, a citation of the tool, or a description of how AI was used, while some ban AI use entirely and some require nothing. The checklist's disclosure items exist because undisclosed use where disclosure is required is one of the most common AI-related integrity violations.",
    ],
    [
      "What counts as a critical failure in this checklist?",
      "Four items are critical: not knowing your institution's AI rules for the assignment, using AI in a way that is not permitted, failing to disclose when disclosure is required, and submitting AI-generated output as your own work. A \"No\" on any of these typically constitutes a violation on its own under common policies, so the tool marks the submission high risk.",
    ],
    [
      "Why does the checklist ask whether AI citations actually exist?",
      "Because AI assistants are known to fabricate plausible-looking citations — papers, authors and page numbers that do not exist. Submitting a hallucinated reference is an integrity problem even when AI use itself was permitted, so verifying every AI-suggested source is an important-tier item.",
    ],
    [
      "Is this checklist a substitute for my university's policy?",
      "No. It generalises the requirements that recur across institutional policies, but your own institution's policy is the only authority, and rules can differ per course and per assignment. Use the result as a pre-submission routine and ask your instructor when anything is unclear.",
    ],
  ],
};

export default seo;
