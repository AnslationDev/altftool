const seo = {
  title: "Creator Contract Rights Timeline: Usage",
  metaDescription:
    "Turn a brand deal's durations into three dates: usage end, exclusivity end and the renewal notice deadline, plus a five-clause scan of the wording.",
  steps: [
    "Paste the rights wording into \"Contract rights and dates\" and set the \"Posting / effective date\".",
    "Enter \"Usage duration (days)\", \"Exclusivity duration (days)\" and \"Renewal notice before expiry (days)\" — the defaults are 90, 60 and 15.",
    "Read the Usage end, Exclusivity end and Renewal review dates, plus the Clause signal / Mentioned table that marks Territory or Edits as \"Not found\".",
  ],
  intro:
    "This tool turns the durations buried in a brand deal into three dates: usage end = posting date + usage days, exclusivity end = posting date + exclusivity days, and the renewal review date = usage end minus the notice period. Paste the rights wording and it also scans it for five clause signals — paid usage or whitelisting, exclusivity, renewal, territory, and edits or derivatives — and tells you which are mentioned and which are missing. It is a scheduling aid for creators juggling several deals, not contract interpretation.",
  useCases: [
    "A brand deal says 90 days of paid usage and 60 days of category exclusivity from posting, and you want the two actual calendar dates before you accept a competing offer",
    "You need to know the last day to give written notice on a renewal option, so the option does not lapse while you are deciding",
    "A draft agreement arrives and you want a quick check on whether it says anything at all about territory or the right to edit your content before you send it to a lawyer",
  ],
  benefits: [
    ["Three dates from the durations", "Usage end, exclusivity end and the renewal notice deadline, calculated from one anchor date instead of counted on a calendar."],
    ["The notice date works backwards", "The renewal review date is derived by subtracting the notice period from the usage end, which is the deadline people actually miss."],
    ["Flags what the contract does not say", "The clause scan reports territory, edits and renewal as \"not found\" when the wording never mentions them — the silence is the finding."],
  ],
  faqs: [
    [
      "How is the exclusivity end date calculated?",
      "Exclusivity end = posting or effective date + exclusivity days. With the common 60-day term and a 15 August posting date, exclusivity runs to 14 October. Usage is calculated the same way from its own duration, which is often longer — 90 days is typical for paid social.",
    ],
    [
      "When do I have to give notice on a renewal option?",
      "By the usage end date minus the notice period. If usage ends after 90 days and the contract requires 15 days' written notice, the deadline falls on day 75 from posting. Missing it is what turns a negotiable renewal into an automatic lapse or an automatic extension, depending on the wording.",
    ],
    [
      "What is the difference between usage rights and exclusivity?",
      "Usage is how long the brand may run your content; exclusivity is how long you may not work with their competitors. They are separate clocks with separate durations, which is why the tool reports two end dates — a deal can grant 12 months of usage while restricting you for only 30 days, or the reverse.",
    ],
    [
      "Can I rely on this instead of reading the contract?",
      "No. It arranges dates and highlights keywords; it does not interpret the agreement, and the signed wording always controls. Before signing, have the contract reviewed for territory, media, sublicensing, editing rights, AI training use, name and likeness, termination, morality clauses, indemnity and payment terms — and consult a lawyer for anything material.",
    ],
  ],
};

export default seo;
