const seo = {
  title: "NCERT Chapter Tracker: Read vs Revised Progress",
  metaDescription:
    "Mark each NCERT chapter Not started, Reading, Read once or Revised. Presets use rationalised counts (Class 10 Science 13) and stay editable.",
  steps: [
    "Choose a book under \"Add a preset NCERT book\", such as \"Class 10 Science (rationalised) - 13 ch\", and press \"Add preset\"; \"Custom book\" lets you name your own and set its Chapters count from 1 to 40.",
    "Tap a chapter square to cycle its status through Not started, Reading, Read once and Revised.",
    "\"Overall read\" weights each book by its chapter count and reports the % revised alongside; \"Copy summary\" copies the per-book breakdown, and progress stays in this browser's local storage until you press Reset.",
  ],
  intro:
    "This tracker records the reading and revision status of every chapter in your NCERT textbooks — Not started, Reading, Read once or Revised — and computes weighted progress across all books. Preset chapter counts follow the rationalised NCERT editions in print since academic year 2023-24 (for example, 13 chapters in Class 10 Science and 10 in Class 12 Chemistry), and every count stays editable for older prints. It is built for board-exam students and UPSC/NEET/JEE aspirants who study several NCERTs in parallel and lose track of what has actually been revised.",
  useCases: [
    "A Class 10 student tracks Science and Maths chapter-by-chapter through the board year, separating 'read once' from 'properly revised'",
    "A NEET aspirant monitors revision coverage across Class 11 and 12 Biology, Physics and Chemistry NCERTs in one place",
    "A UPSC aspirant doing an NCERT foundation round marks progress book by book without a spreadsheet",
  ],
  benefits: [
    ["Chapter-level truth", "Four statuses per chapter distinguish reading, one full pass and real revision."],
    ["Weighted overall progress", "The total percentage weights each book by its chapter count, not a misleading average of books."],
    ["Rationalised presets", "One tap adds common NCERT books with the post-2023 rationalised chapter counts, all editable."],
  ],
  faqs: [
    [
      "How many chapters are in the rationalised NCERT books?",
      "The rationalised editions in print since 2023-24 trimmed most senior textbooks: Class 10 Science has 13 chapters, Class 10 Maths 14, Class 12 Physics 14, Class 12 Chemistry 10 and Class 12 Biology 13. Pre-2023 prints carry more chapters, which is why the tracker lets you edit every count to match the copy you own.",
    ],
    [
      "What does the rationalised NCERT syllabus mean?",
      "In 2022 NCERT dropped or merged content across textbooks to reduce load after the pandemic, and the trimmed 'rationalised' editions became the printed standard from the 2023-24 session. CBSE boards examine the rationalised content, though some competitive-exam toppers still read deleted portions from older prints for background.",
    ],
    [
      "How should I mark a chapter I have only skimmed?",
      "Use Reading, not Read once. Reserve Read once for a complete pass with notes or highlights, and Revised for a genuine second pass — the tracker's '% revised' figure is only meaningful if Revised means real revision, since revision is what examiners reward.",
    ],
    [
      "Is my chapter progress saved if I close the browser?",
      "Yes — progress is stored in your browser's local storage on your device, so it survives reloads and restarts on the same browser. It is never uploaded, and clearing site data or pressing Reset removes it.",
    ],
  ],
};

export default seo;
