const seo = {
  title: "DSAR Identity Verification Planner: 1-3 Factors",
  metaDescription:
    "Set DSAR identity checks by disclosure risk: 1 factor for low, 2 medium, 3 high, plus one more for sensitive data, chosen from proof you already hold.",
  steps: [
    "Pick the Request type - Access / copy, Correction, Deletion or Account control - and set Disclosure risk to Low, Medium or High.",
    "List the Already-held verification factors you can check, such as a signed-in session, verified email or recent support ticket ID, then switch on Sensitive data involved where third-party data may be exposed.",
    "Read the chosen factors against the target of 1, 2 or 3 plus the sensitive uplift, with the standing reminder to delete temporary proof, then use Download for identity-minimizing-dsar-planner.txt.",
  ],
  intro:
    "The Identity-Minimizing DSAR Planner works out how many identity factors you should require before answering a data subject access, correction, deletion or account-control request, and picks them from proof you already hold rather than asking for new documents. It maps disclosure risk to a target of 1 factor for low risk, 2 for medium and 3 for high, adding one more when the response may expose sensitive or third-party data. Privacy operations staff and small-team DPOs get a proportionate verification plan plus a reminder to delete temporary proof on a documented schedule.",
  useCases: [
    "A support agent gets a deletion request from someone already signed in with a verified email, and needs to decide whether asking for a passport scan is justified or excessive.",
    "A privacy lead is writing the verification section of a DSAR handling procedure and wants a defensible rule for when two factors are enough and when a third is required.",
    "A team is about to release a data export that includes messages naming other people, and needs to raise the assurance bar for that one response without changing the policy for routine access requests.",
  ],
  benefits: [
    [
      "Starts from proof you already hold",
      "Selects from the signed-in session, verified email or ticket ID on file before ever suggesting a new identity document.",
    ],
    [
      "Risk-scaled, not one-size-fits-all",
      "Low, medium and high disclosure risk produce different factor targets, so a routine access copy is not gated like a deletion.",
    ],
    [
      "Flags the sensitive-data uplift explicitly",
      "Turning on the sensitive or third-party toggle adds a factor to the target and shows it in the output, so the extra step is documented.",
    ],
  ],
  faqs: [
    [
      "How many identity checks should I ask for before answering a DSAR?",
      "As few as will give reasonable assurance: this planner targets 1 factor at low disclosure risk, 2 at medium and 3 at high, plus 1 more when sensitive or third-party data may be exposed. The point is proportionality, not a fixed number, so a signed-in user asking for their own order history should not face the same checks as an unauthenticated deletion request.",
    ],
    [
      "Can I require a copy of someone's ID to verify a data request?",
      "Only when the risk cannot be managed with factors you already hold, which is why the tool exhausts existing factors first and warns against collecting new identity documents by default. Requesting a government ID creates a fresh sensitive record you then have to protect and delete, so treat it as the last option and check your own regulator's guidance before making it routine.",
    ],
    [
      "What counts as an already-held verification factor?",
      "Anything you can check without asking the requester to hand over new personal data: an active signed-in session, an email address you previously verified, a recent support ticket ID, or a match against details already in the account. You list them in the tool and it selects the top few up to the risk-based target.",
    ],
    [
      "What should I do with verification evidence after the request is closed?",
      "Delete it on a documented schedule rather than leaving it in the ticket, which the tool prints as a standing step in every plan. Proof gathered only to authenticate a request has no further purpose once the request is answered; this is informational guidance, so confirm retention periods with your legal or compliance advisor.",
    ],
  ],
};

export default seo;
