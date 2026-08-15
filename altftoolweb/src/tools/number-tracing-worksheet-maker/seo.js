const seo = {
  title: "Number Tracing Worksheets in mm: Latin",
  metaDescription:
    "Set digit height in millimetres and get digits per row, numbers per page and the sheet count before printing. Latin 0-9 or Devanagari ०-९.",
  steps: [
    "Pick the Digit script — 'Latin — 0 1 2 3' or 'Devanagari — ० १ २ ३' — and the Paper size, then set First number and Last number.",
    "Set Digit height (mm) anywhere from 8 to 45, Rows per number and Page margin (mm), and tick 'Print the number word'.",
    "Read the sheets to print, digits per row and numbers per page, then press Print with printer scaling at 100%, not fit-to-page.",
  ],
  intro:
    "Number Tracing Worksheet Maker lays out printable digit-tracing sheets by millimetre geometry: you set the digit height, paper size and margin, and it calculates how many digits fit a line, how many numbers fit a page and how many sheets you must print. Digits render in Latin numerals (0-9) or Devanagari numerals (०-९), with the English or Hindi number word above each block. It is aimed at preschool and Class 1 teachers, therapists working on pencil control, and parents who want the same sheet reprinted at a consistent size.",
  useCases: [
    "Print 1 to 10 at 20 mm digit height on A4 for a nursery class, with two tracing rows per number.",
    "Make a Devanagari counting sheet (० to ९) for a Hindi-medium kindergarten alongside the Latin version.",
    "Step a child down from 25 mm digits to 12 mm digits over a term as their pencil control improves.",
    "Work out before printing how many sheets a 1 to 100 practice book will take at the size you want.",
  ],
  benefits: [
    ["True millimetre sizing", "Digit height is set in mm against real A4 or Letter dimensions, not an arbitrary font size."],
    ["Page count before you print", "Numbers are packed so a block never splits across a page break, and the sheet total is shown up front."],
    ["Latin and Devanagari", "The same layout engine renders 0-9 or ०-९, with matching English or Hindi number words."],
  ],
  faqs: [
    [
      "What size should numbers be on a tracing worksheet?",
      "Around 20-25 mm tall for ages 3-4, 15-20 mm for ages 5-6, and 10-12 mm once a child moves to ruled notebooks. Larger digits need bigger arm movements and fewer fit per line, which is the point early on — this tool accepts anything from 8 mm to 45 mm.",
    ],
    [
      "How many numbers fit on one A4 page?",
      "With 20 mm digits, a 15 mm margin and two rows per number, three numbers fit an A4 page and each row holds eight digits. Raising the digit height or the rows per number reduces that count, and the tool recalculates the page total as you change any setting.",
    ],
    [
      "Why do my printed digits come out smaller than the size I chose?",
      "Almost always because the print dialog is set to 'fit to page' or 'shrink oversized pages', which rescales the sheet. Choose 100% or 'actual size' scaling and pick the same paper size you selected here.",
    ],
    [
      "Can I make Hindi number tracing sheets?",
      "Yes — switch the script to Devanagari and the digits render as ० १ २ ३ ४ ५ ६ ७ ८ ९ (Unicode U+0966 to U+096F), with the Hindi word such as पाँच or दस printed above the tracing rows where the spelling is standard.",
    ],
  ],
};

export default seo;
