const seo = {
  title: "Data Retention Schedule Builder: 7-Column Table",
  metaDescription:
    "Paste records one per line, pipe-separated, for a seven-column schedule — category, purpose, system, period, trigger, method, owner — with gaps flagged.",
  intro:
    "The Data Retention Schedule Builder turns a plain list of records into a structured seven-column retention schedule covering data category, purpose, system, retention period, deletion trigger, deletion method and owner. You type one record per line with fields separated by a pipe character, and it returns a formatted table plus a count of complete rows and rows still missing a column. It is aimed at privacy, IT and operations staff who need a defensible written schedule rather than a spreadsheet nobody maintains.",
  useCases: [
    "Preparing for a privacy audit where the assessor asks for a documented retention period and deletion method for every category of personal data you hold.",
    "Mapping which system each data category actually lives in — helpdesk, ATS, CRM — so a deletion request can be routed to a named owner instead of bouncing between teams.",
    "Reviewing an inherited retention policy and finding which entries never specified a trigger event, so 'delete after 24 months' has no clock to start.",
  ],
  benefits: [
    [
      "Seven fields, enforced",
      "Every row is checked against the full header set, so a category with no owner or no deletion method is counted as needing review instead of quietly passing.",
    ],
    [
      "Trigger, not just duration",
      "The schedule separates the retention period from the event that starts it, which is the distinction most homemade retention tables miss.",
    ],
    [
      "Line-based input",
      "Records are typed one per line with pipe separators, so an existing list can be pasted in and restructured without building a spreadsheet first.",
    ],
  ],
  faqs: [
    [
      "What columns does a data retention schedule need?",
      "This builder uses seven: data category, purpose, system, retention period, trigger, deletion method and owner. The purpose and retention period pair is what demonstrates you are not keeping data longer than the reason you collected it, and the owner column is what makes the schedule actionable when a deletion date arrives.",
    ],
    [
      "How do I enter records?",
      "One record per line, with the seven fields separated by the pipe character | in header order. For example: Support tickets | Customer service | Helpdesk | 24 months | Ticket closed | Hard delete | Support. Any line with fewer than seven filled fields is counted under 'Needs review'.",
    ],
    [
      "What is a retention trigger and why is it separate from the period?",
      "The trigger is the event that starts the retention clock, such as 'ticket closed' or 'decision date', while the period is how long the clock runs from there. Without a trigger, a period like 24 months is unenforceable because nothing defines when month one began.",
    ],
    [
      "How long should I keep each type of record?",
      "There is no single answer — retention periods are set by the law that applies to the record type and jurisdiction, plus any contractual or tax obligations, so this tool records the period you decide rather than suggesting one. This is general information, not legal advice; confirm statutory minimums and maximums with a qualified privacy or legal advisor before publishing a schedule.",
    ],
  ],
};

export default seo;
