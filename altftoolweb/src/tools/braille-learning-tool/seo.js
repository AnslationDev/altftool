const seo = {
  title: "Braille Learning Tool: 49 Characters, 4 Practice Modes",
  metaDescription:
    "Learn the six-dot cell for A–Z, 0–9 and 13 punctuation marks across Learn, Quiz, Practice and Reference. Mastery at 80% over five or more tries.",
  intro:
    "This Braille learning tool teaches the six-dot cell — a 3 × 2 grid where each character is a pattern of raised dots — across 49 characters: the 26 letters A–Z, the digits 0–9 and 13 punctuation marks. Four modes cover it: Learn shows every cell with a plain-English dot description, Quiz shows a pattern and asks for the character, Practice reverses that, and Reference is a full sortable chart. Per-character accuracy is tracked in your browser, and a character is marked mastered once you are at least 80% correct on it over five or more attempts.",
  useCases: [
    "You are a sighted parent, teacher or aide starting to learn the alphabet so you can label things at home or check a child's worksheet.",
    "You keep confusing the letters that share a dot shape rotated — d, f, h and j — and want repeated drills on just those until they stop swapping in your head.",
    "You need to read numbers on a lift panel or a sign and want to learn the numeric indicator and how digits reuse the letters A to J.",
  ],
  benefits: [
    ["Drills in both directions", "Quiz mode goes pattern to character and Practice mode goes character to pattern, which are separate skills — recognising a cell is easier than recalling one."],
    ["Tracks mastery per character, not overall", "Each character carries its own correct-versus-total record, so the progress grid shows exactly which letters are still shaky rather than a single average score."],
    ["Built for low-vision use too", "A high-contrast palette and a large-text mode enlarge both the dot diagrams and the interface, and every cell carries a text label for screen readers."],
  ],
  faqs: [
    [
      "How many dots are in a Braille cell?",
      "Six, arranged in two columns of three and numbered 1–3 down the left column and 4–6 down the right. Every letter, digit and punctuation mark in this tool is one of the 63 possible raised-dot combinations of that grid.",
    ],
    [
      "How are numbers written in Braille?",
      "With a numeric indicator — dots 3, 4, 5 and 6 — placed before the digit, after which the letters A through J stand for 1 through 9 and 0. So the cell for A means the letter a on its own, but the digit 1 when it follows the numeric indicator.",
    ],
    [
      "When does the tool count a character as mastered?",
      "Once you have answered it at least five times with 80% or better accuracy. Characters with fewer than three attempts show as new, and anything in between counts as learning, so the grid separates untested characters from ones you are genuinely getting wrong.",
    ],
    [
      "Does this teach contracted (Grade 2) Braille?",
      "No — it covers uncontracted Grade 1 only: one cell per letter, digit or punctuation mark. Grade 2, which most published Braille uses, adds a large set of contractions and shortforms where one cell can stand for a whole word or letter group, and is a separate stage of learning best taken up with a qualified instructor or a certified course.",
    ],
  ],
};

export default seo;
