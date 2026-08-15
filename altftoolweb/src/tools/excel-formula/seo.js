const seo = {
  title: "Excel Formula Reference: 24 Functions with Examples",
  metaDescription:
    "Search 24 Excel functions by name, syntax, description or example across Mathematical, Statistical, Logical, Text, Lookup, Date & Time and Conditional.",
  steps: [
    "Type into Search formulas by name, syntax, or description — the search also matches each function's worked example.",
    "Narrow the list with the Filter by Category buttons: All, Conditional, Date & Time, Logical, Lookup, Mathematical, Statistical or Text.",
    "Click Learn More on a card to expand its Syntax, Description and Example, such as =COUNTIF(A1:A10, \">50\") for the COUNTIF entry.",
  ],
  intro:
    "This is a searchable reference of 24 core Excel functions, each card showing the exact syntax with its required and optional arguments, a plain-English description and a worked example on real cell ranges. Functions are grouped into seven categories — Mathematical, Statistical, Logical, Text, Lookup, Date & Time and Conditional — and the search box matches on function name, syntax, description or example, so you can find a function by what you want it to do rather than by remembering its name. It is for anyone building a spreadsheet who needs the argument order right the first time.",
  useCases: [
    "You know you need to count only the cells above a threshold but cannot remember whether it is COUNTIF(range, criteria) or the other way round",
    "Writing an IF that returns text and needing to see the quoting in a real example before you type it into the formula bar",
    "Working out how to pull just the year out of a date column, by filtering to the Date & Time category and scanning YEAR, MONTH, DAY and DATEDIF together",
  ],
  benefits: [
    ["Syntax with argument order intact", "Every entry shows the full signature, with optional arguments in square brackets, so you can see what is required before you start typing."],
    ["A worked example on every function", "Each card carries a concrete example on real ranges — such as counting cells greater than 50 — not just an abstract description."],
    ["Search covers examples too", "The search box matches the description and example text as well as the name, so a plain-language phrase finds the function even when you do not know what it is called."],
  ],
  faqs: [
    [
      "What is the difference between COUNT and COUNTIF?",
      "COUNT counts only the cells in a range that contain numbers, while COUNTIF counts the cells that meet a condition you specify. COUNTIF takes two arguments — =COUNTIF(range, criteria) — so =COUNTIF(A1:A10, \">50\") counts how many values in that range exceed 50; note the criteria goes in quotation marks.",
    ],
    [
      "How does VLOOKUP work?",
      "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup]) searches for a value in the first column of a table and returns a value from the same row in the column number you give. The fourth argument controls matching: FALSE means exact match, which is what you almost always want, and leaving it out defaults to an approximate match on sorted data.",
    ],
    [
      "Which formula stops #N/A and #DIV/0! errors showing?",
      "IFERROR. Wrap the formula that might fail — =IFERROR(your_formula, \"Not found\") — and Excel shows your fallback value instead of the error code. It catches all error types, so use it only where you understand why the error occurs.",
    ],
    [
      "What is the difference between TODAY and NOW?",
      "TODAY() returns just the current date, while NOW() returns the current date and time. Both take no arguments and both are volatile, meaning they recalculate every time the workbook recalculates, so the value updates rather than staying fixed to when you typed it.",
    ],
  ],
};

export default seo;
