const seo = {
  intro:
    "A pangram is a sentence that uses all 26 letters of the English alphabet at least once, and this checker tells you instantly whether yours qualifies. It strips out spaces, digits and punctuation, counts how many distinct letters from a to z appear, and lists by name any letter still missing — so a sentence at 24 of 26 shows you exactly which two to work in. Handy for font testers, typing teachers, puzzle writers and anyone drafting a sample line for a specimen sheet.",
  useCases: [
    "You are designing or reviewing a typeface and need a specimen line that exercises every letterform, so you test candidate sentences until one hits all 26.",
    "You are writing your own pangram for a class exercise or a puzzle and want the missing letters named as you type instead of counting them by hand.",
    "A keyboard or handwriting drill needs a practice sentence that covers the whole alphabet, and you want to confirm a shorter alternative to the fox sentence still qualifies.",
  ],
  benefits: [
    [
      "Names the gaps",
      "Rather than a pass or fail it reports the count of distinct letters found out of 26 and lists each missing letter, which turns a failed attempt into an editable to-do list.",
    ],
    [
      "Separates unique letters from total length",
      "It shows both the number of distinct letters and the total letter count, so you can tell a tight pangram from a long sentence that happens to cover the alphabet.",
    ],
    [
      "Classic examples one click away",
      "Five known pangrams are preloaded, including the 35-letter fox sentence and the 29-letter \"Sphinx of black quartz, judge my vow\", to use as a benchmark for your own.",
    ],
  ],
  faqs: [
    [
      "What counts as a pangram?",
      "A sentence that contains every one of the 26 English letters at least once. Repeats are allowed and do not affect the verdict — only the count of distinct letters matters, so the check passes the moment that count reaches 26.",
    ],
    [
      "Is \"The quick brown fox jumps over the lazy dog\" the shortest pangram?",
      "No. It uses 35 letters, while \"Sphinx of black quartz, judge my vow\" does the same job in 29. Shorter pangrams exist but usually rely on abbreviations or obscure words; a perfect pangram would use exactly 26 letters with no repeats.",
    ],
    [
      "Do numbers and punctuation matter?",
      "No. Everything except the letters a to z is discarded before the check, so commas, digits, hyphens and spaces have no effect on whether a sentence qualifies.",
    ],
    [
      "How does the case setting change the result?",
      "With \"Ignore Case\" on, A and a are treated as the same letter, which is the normal reading. Switch it off and only lowercase letters are counted, so a sentence whose only J appears as a capital would be reported as missing j.",
    ],
  ],
};

export default seo;
