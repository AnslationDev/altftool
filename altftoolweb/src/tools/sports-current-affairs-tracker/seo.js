const seo = {
  intro:
    "This tracker is a structured revision table for the sports questions in competitive-exam current affairs: each row records the tournament, sport, winner, runner-up, venue and year — the exact fields exam questions pair against each other. Built for SSC, banking, railway and state PSC aspirants, it is searchable, sortable by any column, stored only in your browser, and exportable as CSV.",
  useCases: [
    "An SSC aspirant consolidating a year of cricket, tennis and multi-sport results into one sortable table before the exam",
    "A railway exam candidate self-testing by sorting on Tournament and recalling winner and venue from memory",
    "A state PSC student logging each trophy and its venue as finals happen instead of cramming a compilation the final week",
  ],
  benefits: [
    ["Exam-shaped fields", "Tournament, winner, runner-up, venue and year mirror exactly how sports questions are framed."],
    ["Runner-up recorded too", "Beaten finalists are a favourite wrong-option source — the table makes you log them alongside the winner."],
    ["Private and portable", "Rows live only in your browser's localStorage and export as CSV in one click."],
  ],
  faqs: [
    [
      "Which sports events are most asked in government exams?",
      "The recurring set is cricket World Cups and the IPL, the four tennis Grand Slams, the Olympics and Asian Games, football World Cups, hockey World Cups, badminton majors and the World Chess Championship. Questions usually pair the winner with the year, the venue or the beaten finalist.",
    ],
    [
      "What details should I note for each tournament?",
      "Winner, runner-up, venue or host country, and year — plus any India angle such as an Indian winner, medal or hosting role, since exam setters favour those. Wrong options are typically built from the runner-up or the previous edition's winner.",
    ],
    [
      "How far back do sports current affairs questions go?",
      "Mostly the 6 to 12 months before the exam, but landmark results — World Cup wins, Olympic medals for India, a world championship title — can be asked years later as static GK, so keep them in the table permanently.",
    ],
    [
      "Is my data uploaded anywhere?",
      "No. Entries are stored in your browser's localStorage on your device and never sent to a server. Clearing browser data removes them, so use the CSV export as a backup.",
    ],
  ],
};

export default seo;
