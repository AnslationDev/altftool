const seo = {
  title: "Person in News Tracker for Exam Current Affairs",
  metaDescription:
    "Log who was appointed as what and when — person, role, organisation, date — in a sortable table saved in your browser, with one-click CSV export.",
  steps: [
    "Fill the 'Add an entry' form — Person, 'Role / appointment', Organisation, Date and a one-line 'Why in news' — then click 'Add entry'.",
    "Use 'Search the table' to filter by name, role or organisation, and click any column header to sort ascending or descending (dates sort chronologically).",
    "Click 'Copy CSV' to copy the visible rows as CSV; entries persist in your browser's localStorage between visits.",
  ],
  intro:
    "This tracker is a structured revision table for appointment and personality questions in competitive-exam current affairs: each row records the person, their role or appointment, the organisation, the date and a one-line reason they were in the news. Built for SSC, banking, UPSC prelims and state PSC aspirants, it is searchable, sortable by any column, stored only in your browser, and exportable as CSV.",
  useCases: [
    "A banking exam aspirant logging every new governor, chairman and CEO announcement as it happens instead of cramming a list the final week",
    "An SSC candidate self-testing by sorting on Role and recalling the person and date from memory",
    "A UPSC prelims student keeping sports and science personalities (record holders, mission crews) alongside official appointments in one table",
  ],
  benefits: [
    ["Exam-shaped fields", "Person, role, organisation and date mirror exactly how appointment questions are asked."],
    ["Chronological sorting", "Dates are stored in ISO form, so sorting by date always gives a correct timeline of appointments."],
    ["Private and portable", "Rows live only in your browser's localStorage and export as CSV in one click."],
  ],
  faqs: [
    [
      "Which appointments are most asked in government exams?",
      "The recurring set is constitutional and top official posts: President, Vice-President, Chief Justice of India, RBI Governor, service chiefs, Election Commissioners, CAG, Attorney General, and heads of major PSUs and international bodies. Questions typically pair the person with the post or ask the ordinal (for example, the 51st CJI).",
    ],
    [
      "How far back do exams ask person-in-news questions?",
      "Mostly from the 6 to 12 months before the exam date, but constitutional post holders are asked regardless of when they took office — you should always know the current President, CJI and RBI Governor even if they were appointed years earlier.",
    ],
    [
      "What details should I note for each appointment?",
      "Record the exact post name, the organisation, the date of taking charge and the ordinal number where one exists (15th President, 51st CJI). Exams often build wrong options from predecessors or from the announcement date instead of the swearing-in date.",
    ],
    [
      "Is my data uploaded anywhere?",
      "No. Entries are stored in your browser's localStorage on your device and never sent to a server. Clearing browser data removes them, so use the CSV export as a backup.",
    ],
  ],
};

export default seo;
