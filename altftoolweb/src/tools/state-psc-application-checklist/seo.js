const seo = {
  title: "State PSC Deadlines: Fee Date, Form Date",
  metaDescription:
    "Counts down registration, the fee date, form date, correction window and exam — and flags that an out-of-state SC/OBC certificate gives no reservation.",
  steps: [
    "Pick your Commission and \"Category claimed\", set \"Today's date\", and tick \"My certificate is from this same state\" only if the certificate was issued by that state.",
    "Copy the dates out of the advertisement into \"Dates from the advertisement\" — \"Last date to deposit the fee\", \"Last date to submit the form\", \"Correction window opens\" and \"closes\", and \"Preliminary exam\".",
    "Read \"Days to the next deadline\" with the binding-dates-passed count and the \"What trips people up at\" alerts, work the checklist to 100% ready, then press \"Copy plan\".",
  ],
  intro:
    "This tracker counts down every dated stage of a state Public Service Commission cycle — registration opening, the last date to deposit the fee, the last date to submit the form, the correction window and the exam — and pairs it with the certificate list that particular commission will accept. It treats the fee date rather than the submission date as the binding deadline, because money paid after the fee window does not attach to the application and the form then cannot be submitted at all. It also flags the trap that catches out-of-state candidates: a category certificate issued by another state gives no reservation, no fee concession and no age relaxation at a state commission.",
  useCases: [
    "Seeing at a glance that the UPPSC fee window shuts two days before the form window, so the money has to move first.",
    "Checking, before paying, whether an OBC certificate from Bihar will be accepted by the Maharashtra commission — it will not, and the candidate is counted as unreserved.",
    "Working out how many days are left on a correction window and which fields can still be changed.",
  ],
  benefits: [
    ["The fee date is the real deadline", "Two last dates are tracked separately, and the earlier binding one is counted down."],
    ["Out-of-order dates caught", "Warns when the dates entered from an advertisement contradict each other."],
    ["Commission-specific traps", "Language papers, one-time registration, state-only classifications like MBC, 2A or OBC-A."],
  ],
  faqs: [
    [
      "Can I use my SC or OBC certificate from another state for a state PSC exam?",
      "No. State commissions reserve seats for the SC, ST and backward classes of that state, so a certificate issued elsewhere gives no reservation, no fee concession and no age relaxation. You may still sit the examination as an unreserved candidate. The Supreme Court settled the principle in Marri Chandra Shekhar Rao in 1990, and every state notification restates it.",
    ],
    [
      "Why is the last date for fee payment earlier than the last date to submit the form?",
      "Because the commission has to reconcile the bank's payment file before it will let the form through. A payment made after the fee window does not attach to your application, and the submit button will not accept the form without it. Treat the fee date as the deadline and pay several days ahead of it — bank downtime on the final day is common.",
    ],
    [
      "What can I change in the correction window?",
      "Only the fields the commission names in its correction notice — usually spelling of a name, photograph, category, and sometimes the exam centre. Category changes that would reduce the fee are normally refused, and the window never reopens an application that was never submitted. Most commissions charge a correction fee per attempt.",
    ],
    [
      "Does my OBC non-creamy-layer certificate have to be recent?",
      "Yes, and this is the commonest cause of rejection at document verification. The certificate has to be valid on the closing date of the application, which in practice means issued for the current financial year, because the income test is a rolling one. Apply for a fresh certificate as soon as the advertisement appears rather than after the result.",
    ],
  ],
};

export default seo;
