const seo = {
  intro:
    "Braille Dot Chart Trainer teaches the six-dot braille cell: dots 1, 2 and 3 down the left column and 4, 5 and 6 down the right, giving 64 possible patterns including the blank cell. It shows a full dot-number chart for a-z, 0-9 and common punctuation, transliterates typed text into uncontracted (grade 1) cells, and quizzes you on letters in three directions — cell to letter, dot numbers to letter, and letter to dots. Useful for teachers, accessibility staff and anyone starting braille from scratch.",
  useCases: [
    "Learn the alphabet in the order it was designed: a-j first, then k-t which add dot 3, then u-z which add dots 3 and 6.",
    "Check how a name or short label would be written in uncontracted braille before ordering a sign or label.",
    "Drill the cells you keep confusing with the letter-to-dots quiz, which tells you exactly which dots were missing or extra.",
    "Show a class why the number sign matters — the cells for 1 to 0 are the same as the letters a to j.",
  ],
  benefits: [
    ["Real cell structure, not pictures", "Every character is stored as its dot numbers, so the chart, the text view and the quiz all agree."],
    ["Precise quiz feedback", "A wrong dot answer lists the missing and extra dot numbers instead of just marking it wrong."],
    ["Indicators shown explicitly", "Capital, number and letter indicator cells appear in the output, so the cell count matches real braille."],
  ],
  faqs: [
    [
      "How are the six braille dots numbered?",
      "Dots 1, 2 and 3 run down the left column from top to bottom, and dots 4, 5 and 6 run down the right column the same way. A cell of six dots gives 64 patterns in total, counting the blank cell used as a space.",
    ],
    [
      "What is the pattern behind the braille alphabet?",
      "The first ten letters, a to j, use only the top four dots (1, 2, 4 and 5). Letters k to t repeat those ten shapes with dot 3 added, and u, v, x, y and z repeat a to e with dots 3 and 6 added. W is dots 2-4-5-6 and breaks the pattern because the original French alphabet had no w.",
    ],
    [
      "How are numbers written in braille?",
      "A number sign (dots 3-4-5-6) is placed before the digits, after which the letters a to i stand for 1 to 9 and j stands for 0. If a letter from a to j follows the digits directly, a grade 1 indicator (dots 5-6) is used to show it is a letter again.",
    ],
    [
      "Is this grade 1 or grade 2 braille?",
      "Grade 1, also called uncontracted braille, where each print letter maps to one cell. Most published braille books use grade 2, which contracts common words and letter groups into single cells; that larger system is not produced here.",
    ],
  ],
};

export default seo;
