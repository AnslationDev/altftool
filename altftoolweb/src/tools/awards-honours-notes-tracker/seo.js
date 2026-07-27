const seo = {
  intro:
    "This tracker is a structured revision table for the award questions that appear in every competitive exam's current-affairs section: each row records award, recipient, field and year, and the table is searchable, sortable by any column and exportable as CSV. It is built for SSC, banking, UPSC prelims and state PSC aspirants who currently keep award facts scattered across monthly PDFs, and it stores everything locally in the browser.",
  useCases: [
    "An SSC CGL aspirant consolidating a year of monthly current-affairs PDFs into one sortable award table before the exam",
    "A banking exam candidate quizzing themselves by sorting on Year and covering the Recipient column",
    "A UPSC prelims student exporting the CSV into their main revision notes the week before the paper",
  ],
  benefits: [
    ["One table, not twelve PDFs", "Every award fact lives in a single sortable, searchable table instead of scattered monthly compilations."],
    ["Exam-shaped fields", "Award, recipient, field and year mirror exactly how the questions are asked."],
    ["Private and portable", "Rows are stored only in your browser and export as CSV in one click."],
  ],
  faqs: [
    [
      "How do I remember awards and honours for competitive exams?",
      "Keep them in one structured table with award, recipient, field and year columns, and revise by sorting on one column while recalling the others. Active recall against a table consistently beats re-reading monthly PDFs, because exam questions test exactly these pairings.",
    ],
    [
      "Which awards are most asked in government exams?",
      "The recurring set is: Nobel Prizes, Bharat Ratna and Padma awards, the Booker and International Booker Prizes, Jnanpith and Sahitya Akademi awards, Dadasaheb Phalke Award, and the major sports honours (Khel Ratna and Arjuna awards). Questions usually pair the recipient with the year or the field.",
    ],
    [
      "Is my data uploaded anywhere?",
      "No. Entries are stored in your browser's localStorage on your device and never sent to a server. Clearing browser data removes them, so use the CSV export as a backup.",
    ],
    [
      "How many months of awards should I revise before an exam?",
      "Most exams draw current-affairs questions from roughly the last 6 to 12 months before the exam date, so track that window; for prizes announced annually (Nobel, Booker, national film awards) also keep the latest full cycle even if it falls slightly outside it.",
    ],
  ],
};

export default seo;
