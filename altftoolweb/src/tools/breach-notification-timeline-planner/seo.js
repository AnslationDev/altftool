const seo = {
  title: "Data Breach Notification Timeline Planner (72 Hours)",
  metaDescription:
    "Turn the discovery date into milestones: containment +4h, scope review +12h, authority decision 72h, individuals 96h, post-incident review +168h.",
  intro:
    "The Breach Notification Timeline Planner turns a single incident-discovery date into a dated milestone schedule, counting forward in hours from the moment awareness is recorded: containment and evidence preservation at +4 hours, initial scope and risk review at +12, the authority-notification decision at your configured target (72 hours by default), the affected-person decision at yours (96 by default), and a post-incident review at +168 hours, one week out. It is for whoever is running the response and needs the internal clock written down while the incident is still unfolding. Both notification targets are editable so the schedule reflects the regime or internal policy you actually operate under, which you name on the output.",
  useCases: [
    "An incident is confirmed on a Friday afternoon and you need the authority-decision deadline as an actual date and time before people go home for the weekend.",
    "You are running a tabletop exercise and want a printed schedule of when each decision point falls so the team can rehearse against the clock.",
    "Your internal policy is stricter than the statutory window — say a 48-hour authority decision — and you want the milestone dates recalculated to the internal target rather than the legal maximum.",
  ],
  benefits: [
    ["Anchors the clock to awareness", "Everything counts forward from the recorded discovery moment, which is the point every notification regime keys off and the one most often left undocumented."],
    ["Includes the steps before notification", "Containment at +4 hours and an initial scope and risk review at +12 sit ahead of the notification decisions, because you cannot assess notifiability without them."],
    ["Editable targets, named policy", "The authority and affected-person windows are inputs rather than hardcoded, and the jurisdiction or policy you type is carried onto the output so the schedule states which rule it was built against."],
  ],
  faqs: [
    [
      "Why is 72 hours the default for notifying an authority?",
      "Because it is the most widely used window: under the GDPR's Article 33, a controller must notify the supervisory authority without undue delay and, where feasible, no later than 72 hours after becoming aware of a personal data breach. Other regimes use different clocks, so change the field to match the one that governs you.",
    ],
    [
      "When does the clock start?",
      "From awareness — the point at which you have a reasonable degree of certainty a breach has occurred — not from when the incident happened or when it was fully investigated. This planner uses the discovery date you enter as that anchor, which is why documenting when awareness occurred is the first item on its checklist.",
    ],
    [
      "Do I always have to tell the affected individuals?",
      "Usually only when the breach is likely to result in a high risk to their rights and freedoms, which is why the affected-person decision is a separate, later milestone than the authority one. The assessment itself still has to happen and be recorded even where you conclude notification is not required.",
    ],
    [
      "Can I rely on this schedule for compliance?",
      "No — it is an internal planning aid that arithmetic alone produces from the hours you enter. It does not encode any statute, does not account for sector rules, multiple jurisdictions, processor-to-controller timelines or regulator guidance, so confirm the current law and take advice from your legal counsel or data protection officer before acting on it.",
    ],
  ],
};

export default seo;
