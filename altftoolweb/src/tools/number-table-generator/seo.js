const seo = {
  title: "Multiplication Table Generator: Any Range 1-100",
  metaDescription:
    "Print times tables from x1 to x10 for any range of numbers 1-100, shade multiples of a number you pick, and copy any table as plain text lines.",
  steps: [
    "Set 'Start Number (1–100)' and 'End Number (1–100)' — the default range 1 to 12 prints twelve times tables side by side.",
    "Type a number into 'Highlight Multiples Of' (e.g. 5) to shade every product divisible by it across all the tables.",
    "Click Copy on any table's header to place its ten lines, formatted like '7 × 3 = 21', on the clipboard as plain text.",
  ],
  intro:
    "The Number Table Generator prints multiplication tables for every number in a range you choose, each running from ×1 to ×10, with any start and end between 1 and 100. A highlight field shades every product that is a multiple of a number you name, so patterns like the multiples of 5 or 9 show up across all the tables at once. Each table has its own copy button that puts the ten lines on your clipboard as plain text, ready to paste into a worksheet.",
  useCases: [
    "You are making a homework sheet for a child working through the 6, 7 and 8 times tables and want all three printed side by side rather than one at a time.",
    "You want to show a class why the multiples of 9 form a diagonal — set the range to 1–12 and highlight multiples of 9 to make the pattern visible across every table.",
    "You need the table of 17 as text for a quiz document, and copying the ten formatted lines beats retyping them.",
  ],
  benefits: [
    [
      "A whole range at once",
      "Generates every table between your start and end numbers together, up to 100 tables, instead of one number per page load.",
    ],
    [
      "Highlight makes the pattern visible",
      "Shading every product divisible by a chosen number turns the grid into a teaching aid rather than a list of answers.",
    ],
    [
      "Copy-ready text output",
      "Each copy button yields ten lines in the form 7 × 3 = 21, so the output pastes cleanly into a worksheet or notes app.",
    ],
  ],
  faqs: [
    [
      "How far do the tables go?",
      "Each table runs from ×1 to ×10, giving ten rows per number. You can generate tables for any number from 1 to 100, so the largest product available is 100 × 10 = 1000.",
    ],
    [
      "Can I generate more than one times table at a time?",
      "Yes. Set a start and end number and every table in that range is produced together — entering 1 and 12 gives the standard set of twelve tables, and entering 1 and 100 gives all hundred.",
    ],
    [
      "What does the highlight multiples field do?",
      "It shades every product in every table that divides evenly by the number you enter. Type 5 and all the products ending in 0 or 5 light up, which is a quick way to show learners how multiples repeat across different tables.",
    ],
    [
      "Which times tables should a child learn first?",
      "Most primary curricula work up to the 12 times table, which is why 1 to 12 is the default range here. The usual order is 2, 5 and 10 first because their patterns are easiest to spot, then 3, 4 and 6, leaving 7, 8 and 9 for last.",
    ],
  ],
};

export default seo;
