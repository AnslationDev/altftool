const seo = {
  title: "Multiplication Table Generator: Any Number, 1 to 100",
  metaDescription:
    "Single table, full grid or up to six tables compared, with perfect squares flagged, the last-digit cycle spelled out and a CSV export.",
  steps: [
    "Set Number, Start and End, or tap a range preset such as 1–12, 1–20 or 20–30 and a Quick Select Number.",
    "Switch between the Single Table, Grid View and Compare tabs — Compare holds up to six tables on one chart.",
    "Read the Digit Pattern, Sum Check and perfect-square count, then press CSV to download multiplication-table-<number>.csv.",
  ],
  intro:
    "Multiplication Table generates the table of any number over a multiplier range you choose, up to 1 to 100, in three views: a single table with a bar chart, a full grid where every cell is row x column, and a compare mode that plots up to six tables against each other. Alongside the products it marks perfect squares, shows the last-digit cycle for the chosen number, and checks the total against the sum formula n(n+1)/2 multiplied by the table number. Any single table can be exported as CSV with the multiplier, product and a perfect-square flag.",
  useCases: [
    "A child is stuck on the 7s and you want the 1 to 12 table on screen with the last-digit pattern spelled out, because 7, 4, 1, 8, 5 is easier to hold on to than twelve separate facts.",
    "You are printing a classroom wall chart and need the full grid from 1 to 20, not just one row at a time.",
    "You want to show why the 9 times table feels easier than the 7s by plotting 7, 9 and 12 on the same chart and comparing the step sizes.",
  ],
  benefits: [
    [
      "Three ways to look at the same facts",
      "Single table, full grid and side-by-side comparison of up to six numbers, so you can drill one table or show how several relate.",
    ],
    [
      "Patterns are marked, not left to be spotted",
      "Perfect squares are highlighted in the results and chart, prime multipliers are flagged, and the repeating last-digit cycle is written out.",
    ],
    [
      "Ranges beyond the usual 1 to 12",
      "Presets cover 1 to 10 through 1 to 50 plus mid-ranges like 10 to 20 and 20 to 30, so you can practise the awkward stretch instead of restarting at one.",
    ],
  ],
  faqs: [
    [
      "What range of tables can I generate?",
      "Any table number, with multipliers from 1 to 100. Eight presets are one click away, including 1 to 10, 1 to 12, 1 to 20, 1 to 50, 10 to 20 and 20 to 30, and quick-pick numbers run 2 to 12 plus 15, 20, 25, 50 and 100.",
    ],
    [
      "How is the sum of a multiplication table calculated?",
      "Add the multipliers with the arithmetic-series formula n(n+1)/2 and multiply by the table number. For the table of 7 up to 12 that is 12 x 13 / 2 = 78, times 7 = 546, and the summary shows this check next to the actual total.",
    ],
    [
      "Why are some products highlighted differently?",
      "Those are perfect squares, products whose square root is a whole number, such as 49 in the table of 7. They are coloured green in the chart, flagged in the table, and counted in the summary, which makes the diagonal of the grid view obvious.",
    ],
    [
      "Can I export or print the table?",
      "Yes. The CSV export writes one row per multiplier with three columns, Multiplier, Product and Is Perfect Square, and downloads as multiplication-table-<number>.csv. There is also a copyable text summary with the range, row count, sum, average, maximum, minimum and perfect-square count.",
    ],
  ],
};

export default seo;
