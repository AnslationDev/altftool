const seo = {
  intro:
    "This tracker is a structured revision table for the summit and index questions in competitive-exam current affairs: each row records the summit or report name, the organisation or publisher behind it, the host or venue, the year, and India's rank or outcome. Built for SSC, banking, UPSC prelims and state PSC aspirants, it is searchable, sortable by any column, stored only in your browser, and exportable as CSV.",
  useCases: [
    "A UPSC prelims aspirant keeping every 'which country hosted' summit fact of the last year in one sortable table",
    "A banking exam candidate tracking India's rank in each index edition (hunger, happiness, press freedom) as reports release",
    "An SSC student self-testing by sorting on the report name and recalling publisher and rank from memory",
  ],
  benefits: [
    ["Exam-shaped columns", "Name, publisher, host, year and India's rank mirror exactly how summit and index questions are framed."],
    ["Publisher pairing built in", "Index-publisher mismatches are classic trap options — the table forces you to record the pairing every time."],
    ["Private and portable", "Rows live only in your browser's localStorage and export as CSV in one click."],
  ],
  faqs: [
    [
      "Which indices and reports are most asked in government exams?",
      "The recurring set is the Global Hunger Index (Concern Worldwide & Welthungerhilfe), World Happiness Report (UN SDSN), Human Development Index (UNDP), World Press Freedom Index (Reporters Without Borders), Global Gender Gap Report (World Economic Forum) and Corruption Perceptions Index (Transparency International). Questions usually pair the report with its publisher or India's latest rank.",
    ],
    [
      "How do I remember which organisation publishes which index?",
      "Record the pairing explicitly every time you log an index — recognition of the pair is what exams test, and wrong-publisher options are the standard trap. Sorting this table by organisation groups all of a publisher's reports together, which makes the associations stick.",
    ],
    [
      "Do exams ask India's exact rank in an index?",
      "Frequently, yes — prelims and banking exams ask the rank in the latest edition, sometimes with the total number of countries. Record both (for example '105 of 127') and always verify against the official report, since ranks change every edition and methodology revisions can shift them.",
    ],
    [
      "Is my data uploaded anywhere?",
      "No. Entries are stored in your browser's localStorage on your device and never sent to a server. Clearing browser data removes them, so use the CSV export as a backup.",
    ],
  ],
};

export default seo;
