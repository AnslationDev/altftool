const seo = {
  intro:
    "This pack assembles twelve project-delivery prompts — weekly status update, RAID log, risk escalation, stakeholder email, delay announcement, kickoff brief, milestone plan, scope change request, retrospective design, meeting-notes-to-actions, dependency interrogation and resource conflict — around the project context you enter once. Two extra controls do the work that most prompt libraries leave out: an output length that injects a hard word budget of 120, 250 or 500 words, and a reader profile that injects an explicit instruction about jargon, detail and where the ask belongs. Every prompt also forbids the model from inventing a date, owner or figure, telling it to write [TBC] instead.",
  useCases: [
    "Turn a week of scattered notes into a status update with a justified RAG colour and an explicit ask.",
    "Write a risk escalation for an executive that leads with date and cost impact and names a decision deadline.",
    "Convert messy meeting notes into separated decisions, actions with owners, and open questions.",
  ],
  benefits: [
    ["Reader-aware output", "Choosing team, sponsor, executive or client rewrites the instruction on jargon, detail and ask placement."],
    ["Hard word budgets", "Brief, standard and detailed map to 120, 250 and 500 words so the output fits the channel it is going into."],
    ["No invented facts", "Prompts instruct the model to write [TBC], [owner TBC] or [date TBC] instead of guessing a missing figure."],
  ],
  faqs: [
    [
      "What should a weekly project status update contain?",
      "A status colour with a one-line reason, progress this period, plan for next period, risks or issues needing a decision, and explicit asks. The status prompt here enforces that order and requires an Amber or Red to name the specific date or scope at risk.",
    ],
    [
      "What is a RAID log?",
      "RAID stands for Risks, Assumptions, Issues and Dependencies — a single register that separates what might happen from what is already happening. The RAID prompt asks for risks in cause-event-effect form with probability, impact, mitigation, an escalation trigger and an owner role.",
    ],
    [
      "How long should a status update be?",
      "Match it to the channel: roughly 120 words for an email body that must be readable in a preview pane, 250 for a one-page update, 500 for a written report section. Those three budgets are the presets this tool passes to the model.",
    ],
    [
      "Can AI write my project reports for me?",
      "It can structure and draft them, but it cannot verify them. Because a model will happily fill a gap with a plausible date, these prompts explicitly instruct it to mark unknowns as [TBC], and you should still reconcile every number against your plan and finance records before sending.",
    ],
  ],
};

export default seo;
