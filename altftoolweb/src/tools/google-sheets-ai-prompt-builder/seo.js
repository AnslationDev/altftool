const seo = {
  title: "Google Sheets AI Prompt Builder with A1 Ranges",
  metaDescription:
    "Name the tab, range and headers once: get a prompt with correct A1 quoting, each header's column letter and QUERY Col index, and the cell budget checked.",
  steps: [
    "Enter the \"Tab name\", the \"Range (A1 notation)\" in a form such as A1:E500, A2:E or A:E, and the \"Header row number\".",
    "List your \"Column headers, left to right\" separated by commas or new lines, set \"What should the assistant do?\" and \"Where should the answer go?\", and tick \"The header row is frozen\" if it is.",
    "\"Full reference\" prints the correctly quoted A1 reference against the 10,000,000-cell budget, with size, data rows, headers named and prompt length listed; \"Copy prompt\" copies the finished prompt.",
  ],
  intro:
    "Google Sheets AI Prompt Builder writes a spreadsheet-assistant prompt that names the tab, the A1 range, the header row and every column — quoting the tab name the way A1 notation requires and mapping each header to both its column letter and its QUERY Col index. The range is measured against the real Google Sheets limits: 10,000,000 cells per spreadsheet, 18,278 columns per sheet ending at ZZZ, and 50,000 characters per cell. It suits anyone whose AI answers reference columns that do not exist or break the moment a tab name contains a space.",
  useCases: [
    "Turn 'summarise my ad data' into a prompt that names 'Q1 Sales'!A1:E500, the header row, and all five column names.",
    "Get a QUERY formula prompt that already tells the assistant whether to use Col1 style or A, B, C style column references.",
    "Catch the quoting problem before it bites: a tab called Q1 Sales must be written 'Q1 Sales'!A1:E500 in every formula.",
    "Spot that the range you picked is open-ended (A2:E), so the assistant has no idea how many data rows it is actually reading.",
  ],
  benefits: [
    ["Correct A1 quoting", "Applies the real rule — quote the tab name unless it is letters, digits and underscores and starts with a letter or underscore."],
    ["QUERY-aware column map", "Each header is listed with its column letter and its Col index, which is where most QUERY formulas go wrong."],
    ["Cell budget checked", "Flags a range past the 10,000,000-cell spreadsheet limit instead of letting the assistant invent an answer."],
  ],
  faqs: [
    [
      "How do I reference a sheet with a space in its name?",
      "Wrap the tab name in single quotes: 'Q1 Sales'!A1:E500. Quotes are needed whenever the name is anything other than letters, digits and underscores starting with a letter or underscore, and a single quote inside the name is escaped by doubling it, as in 'Bob''s Data'.",
    ],
    [
      "What is the cell limit in Google Sheets?",
      "A Google Sheets spreadsheet holds up to 10,000,000 cells in total across all its tabs, a single sheet holds at most 18,278 columns with ZZZ as the last one, and one cell holds up to 50,000 characters. There is no fixed row limit — rows are constrained by the cell budget and how wide the sheet is.",
    ],
    [
      "Why does my QUERY formula return an error?",
      "The two most common causes are referring to columns in the wrong style and comparing dates as plain strings. Use A, B, C when the first argument is a plain range and Col1, Col2, Col3 when it is a virtual array from a function, and write date comparisons as date 'yyyy-mm-dd' rather than a bare text value.",
    ],
    [
      "Does this tool read my spreadsheet?",
      "No. You type a tab name, a range and your header names — never the cell values — and the prompt is assembled in your browser. Nothing is uploaded, and you paste the finished prompt into your assistant yourself.",
    ],
  ],
};

export default seo;
