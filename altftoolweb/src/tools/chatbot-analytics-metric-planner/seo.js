const seo = {
  title: "Chatbot Metric Planner: Containment & Deflection",
  metaDescription:
    "Fix each chatbot metric's formula before launch — containment, escalation, deflection, CSAT, fallback — and project deflected contacts and annual savings.",
  steps: [
    "Enter Expected bot conversations per month, Target containment rate (%) and the Fully loaded cost of one human-handled contact (INR) — enter 0 to skip the savings projection.",
    "Tick the definitions your analytics will capture from day one under Metrics to instrument before launch; each one shows its exact formula and a Watch out pitfall.",
    "Read Contacts deflected each month with the implied escalation rate and the projected saving per month and per year, then press Copy plan for the summary.",
  ],
  intro:
    "This planner fixes the definition of every chatbot success metric — containment, escalation, deflection, CSAT, goal completion and fallback rate — before the bot goes live, and projects deflected contact volume as monthly conversations multiplied by the target containment rate. It is for support leads and conversation designers who have to defend a bot's business case, and who need each metric's formula agreed with analytics before the first conversation is logged rather than argued about after launch.",
  useCases: [
    "A support manager building the business case for a bot who needs deflected contacts per month and the rupee saving at their own cost per contact",
    "A conversation designer agreeing with the analytics team exactly what counts as a 'contained' conversation before instrumentation is written",
    "A team reviewing a bot 90 days after launch that has no goal-completion definition and cannot tell whether flows actually succeed",
  ],
  benefits: [
    ["Formulas, not vibes", "Every metric ships with the exact numerator and denominator to instrument."],
    ["Pitfalls flagged", "Each metric names the way it is most commonly gamed or misread."],
    ["Business case attached", "Turns a containment target into deflected contacts and an annual saving."],
  ],
  faqs: [
    [
      "What is a good chatbot containment rate?",
      "It depends entirely on scope: a bot answering a narrow set of FAQ intents can reasonably contain 60-80%, while one fronting complex account or billing work often sits at 20-40%. Compare against your own pre-launch baseline rather than a published benchmark, because containment is defined differently by almost every vendor.",
    ],
    [
      "How is containment rate calculated?",
      "Containment rate = conversations the bot resolved with no human handoff divided by total bot conversations, times 100. The critical decision is whether abandoned conversations count as contained — they should not, so require an explicit resolution signal such as a confirmed answer, a completed task or a no-return window before counting one.",
    ],
    [
      "What is the difference between containment and deflection?",
      "Containment measures what share of conversations the bot finished on its own; deflection measures how many human contacts were actually avoided. They differ because some bot conversations would never have become a ticket, so deflection is always the smaller and harder number, and savings math built on raw containment overstates the result.",
    ],
    [
      "Which chatbot metrics should I track before launch?",
      "At minimum containment, escalation, goal or task completion per flow, fallback rate and bot CSAT with its response rate. Instrument all of them before the first release — a metric added three months later has no comparable history, so you cannot tell whether a change helped.",
    ],
  ],
};

export default seo;
