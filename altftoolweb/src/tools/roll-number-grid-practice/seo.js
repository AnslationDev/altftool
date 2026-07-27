const seo = {
  intro:
    "This interactive trainer simulates the roll number bubble grid on an OMR answer sheet: one 0–9 column per digit, graded the way an optical scanner reads it — a correct single mark scores, a blank column reads as no digit, and a double-marked column is rejected. Exam candidates for NEET, SSC, board exams and other OMR-based tests use it to build the muscle memory to encode their roll number quickly and without errors.",
  useCases: [
    "A first-time NEET candidate practising 12-digit grids so the real admit-card number goes in without a second thought",
    "A board exam student who once bubbled a digit in the wrong column drilling ten random numbers before the exam",
    "A coaching class running a timed challenge — fastest error-free grid in under 30 seconds wins",
  ],
  benefits: [
    ["Scanner-accurate grading", "Blanks and double marks are flagged exactly as OMR scanners treat them — not just wrong digits."],
    ["Fresh numbers every round", "Generate unlimited random practice roll numbers from 4 to 15 digits."],
    ["Timed feedback", "See seconds taken alongside accuracy so speed and correctness improve together."],
  ],
  faqs: [
    [
      "What happens if I fill the wrong roll number on an OMR sheet?",
      "The scanner attributes your answers to the wrong (or a non-existent) roll number, which can mean an absent mark or a result assigned to someone else. Most boards attempt manual reconciliation using the written boxes and invigilator records, but there is no guarantee — which is why the grid deserves deliberate practice.",
    ],
    [
      "Can I mark two bubbles in one column of the roll number grid?",
      "No. A column carrying more than one mark is rejected as invalid by the OMR scanner, corrupting that digit of your roll number. Each column must have exactly one fully darkened bubble matching the digit written in the box above it.",
    ],
    [
      "How long should filling the roll number grid take?",
      "Under 30 seconds for a 10–12 digit number is a safe target — roughly 2 seconds per column to locate the digit and darken it fully. Exams allot a few minutes for candidate details, but rushing this step is the most common source of OMR rejection.",
    ],
    [
      "Why do OMR sheets ask for the roll number in both boxes and bubbles?",
      "The handwritten boxes exist for human verification and reconciliation; only the bubbles are machine-read. If the two disagree, the bubbled value is what the scanner uses, so practising the bubble grid matters more than neat handwriting.",
    ],
  ],
};

export default seo;
