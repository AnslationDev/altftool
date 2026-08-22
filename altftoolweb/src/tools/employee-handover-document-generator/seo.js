const seo = {
  title: "Employee Handover Generator & Readiness Score",
  metaDescription:
    "List what you own, weight items critical 3 / important 2 / routine 1, and get a handover readiness score plus a document that names open blockers.",
  steps: [
    "Fill in 'Your exit' — your name, last working day and primary successor — then click 'Add item' to list each system, task or contact you own.",
    "Set each item's Area, Criticality and Status and name who it is 'Handed to'; the weighted readiness percent and open critical items update live.",
    "Click 'Copy document' to copy the assembled handover text, or 'Copy summary' for the one-line readiness figure with blockers named.",
  ],
  intro:
    "This tool turns a list of what you own at work into a weighted handover readiness score and a structured handover document. Each item carries a criticality weight — 3 for critical, 2 for important, 1 for routine — and a completion factor from 0 for not started to 1 for documented and walked through, so readiness is the weighted sum rather than a flat count of ticked boxes. Anything critical that has not been fully transferred is reported as a blocker regardless of the overall percentage.",
  useCases: [
    "Two weeks before your last day, you need to know whether the handover is genuinely done or just looks busy.",
    "Your manager wants a single number for the exit review, and a list of exactly what is still open and who owns it.",
    "You have twenty small items documented and one production system that is not, and a flat checklist would call that 95% done.",
    "You need a handover document to circulate for countersignature that does not contain a single password.",
  ],
  benefits: [
    ["Weighted, not counted", "A critical system carries three times the weight of a routine one, so the score reflects real risk."],
    ["Blockers named separately", "Critical items that are not fully transferred are listed by name even when the overall score looks healthy."],
    ["Ownership gaps surfaced", "Any open item without a named successor is pulled into its own section of the document."],
  ],
  faqs: [
    [
      "What should be in an employee handover document?",
      "Systems and access with the next owner named, recurring tasks with their cadence and deadlines, live projects with their current state and next decision, key internal and external contacts, where the runbooks and source-of-truth documents live, and any commitment you made that outlives your last working day. Add a status line for each so the reader can see what is done and what is not.",
    ],
    [
      "Should I put passwords in a handover document?",
      "No. Record where a credential lives and who owns it, and let access be re-issued through the normal provisioning process — a handover document gets emailed, forwarded and archived, which is the worst possible place for a secret. Sharing credentials also usually breaches your employer's own information security policy.",
    ],
    [
      "How long should a handover take?",
      "Plan for documentation first, then walked-through transfer, then a final week for sign-offs and asset return; on a 30-day notice that is roughly twelve days, twelve days and six days. The useful measure is not days but open critical items — one production system nobody else can run is a bigger problem than ten undocumented routine tasks.",
    ],
    [
      "What counts as a complete handover?",
      "An item is only fully transferred when it has been documented and the successor has been walked through it — a written runbook nobody has read is most of the value but not all of it, which is why it scores 0.6 here rather than 1. A handover is safe to sign off at 85% weighted readiness with no critical item left open.",
    ],
  ],
};

export default seo;
