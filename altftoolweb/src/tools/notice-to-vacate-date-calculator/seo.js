const seo = {
  title: "Notice to Vacate Date Calculator: TPA s.106",
  metaDescription:
    "Counts the notice period from receipt, not posting, under TPA s.106(2) — adds deemed postal days and checks the 15-day or 6-month statutory floor.",
  steps: [
    "Enter 'Date the notice was sent or handed over' and choose 'How it was served' — registered post with acknowledgement due and speed post each add 3 days to reach deemed receipt, a private courier adds 2, and hand delivery, email with a delivery receipt or affixation add none. Pick 'Known receipt date (enter it below)' if you hold the acknowledgement.",
    "Set 'Notice length' and 'Counted in' (Days or Calendar months), or tap a preset such as '15 days (TPA s.106 default)' or '6 months (TPA s.106 farming/manufacturing)'. Choose 'What the premises are used for', and tick the rent-month box if the agreement makes the notice expire at the end of a rent month.",
    "The 'Vacate by end of' date appears with the possession date and total notice days from receipt, a row-by-row trail from dispatch through to 'Days still to run', and a 'Statutory minimum check' saying whether you clear the 15-day or six-month floor and by how many days you fall short. 'Copy result' takes the date summary.",
  ],
  intro:
    "The Notice to Vacate Date Calculator converts a notice dispatch date, a mode of service and a notice length into the exact date a tenant must hand over and the date possession falls due. It follows section 106(2) of the Transfer of Property Act, 1882, under which the notice period commences from the date the notice is received, and section 9 of the General Clauses Act, 1897, under which the day of receipt itself is excluded. It also flags whether the notice clears the fifteen-day (or six-month) statutory floor in section 106(1).",
  useCases: [
    "Fix the handover date after posting a termination notice by registered post, where receipt is a few days after dispatch.",
    "Check that a fifteen-day notice for a shop or flat has actually run its full course before filing an eviction suit.",
    "Work out the expiry date when the agreement says the notice must end on the last day of a rent month.",
    "Estimate what a tenant who overstays owes in states that have adopted the Model Tenancy Act, 2021.",
  ],
  benefits: [
    [
      "Counts from receipt, not posting",
      "Adds deemed postal delivery days so the period starts where the statute says it starts.",
    ],
    [
      "Statutory floor check",
      "Compares your notice against the 15-day and 6-month minimums in TPA s.106(1) and reports the shortfall in days.",
    ],
    [
      "Rent-month alignment",
      "Optionally pushes expiry to the end of a rent month, the way many written agreements require.",
    ],
  ],
  faqs: [
    [
      "How much notice is needed to vacate a rented property in India?",
      "Where the agreement is silent, section 106(1) of the Transfer of Property Act, 1882 requires fifteen days' notice for a month-to-month lease used for any purpose other than farming or manufacturing, and six months' notice for a year-to-year agricultural or manufacturing lease. A registered agreement that specifies one, two or three months overrides these defaults.",
    ],
    [
      "Does the notice period start when I post the notice or when the tenant receives it?",
      "From receipt. Section 106(2) of the Transfer of Property Act, inserted by the 2003 amendment, states that the period mentioned in sub-section (1) shall commence from the date of receipt of notice. Posting a fifteen-day notice therefore gives more than fifteen days in practice.",
    ],
    [
      "Does the notice still have to expire at the end of a tenancy month?",
      "Not under the statute. The old requirement that the notice expire with the end of a month of the tenancy was removed by the 2003 amendment to section 106. Many written agreements still impose it as a contractual term, so read the agreement before you fix the date.",
    ],
    [
      "What happens if the tenant does not leave on the vacate date?",
      "In a state that has enacted the Model Tenancy Act, 2021, section 22(2) entitles the landlord to compensation of twice the monthly rent for the first two months and four times the monthly rent afterwards, alongside a possession claim before the Rent Court. Elsewhere the landlord sues for possession and mesne profits. Take legal advice before acting.",
    ],
  ],
};

export default seo;
