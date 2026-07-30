const seo = {
  intro:
    "This converter turns a JSON array of records into a spreadsheet: it finds the first tabular array anywhere in the document — even nested under `data.results` — flattens each object into dot-path columns like `customer.name`, and takes the union of every record's keys as the header row, so records with missing fields still line up. Values are escaped the CSV way, quoting any field containing the delimiter, a line break or a quote and doubling embedded quotes. You can download comma CSV, semicolon CSV, tab-separated TSV, or an `.xls` file that opens directly in Excel with the sheet name you choose.",
  useCases: [
    "An API returned a paginated list under `data.items` and your finance team wants it in Excel today, not after you write an export script",
    "Records in the export are ragged — some have a `discount` field and some do not — and a naive converter would shift columns out of alignment",
    "You are in a locale where Excel expects semicolons, and a comma CSV opens as one column per row",
  ],
  benefits: [
    ["Finds the record array for you", "You can paste the whole response; it searches for the first array of objects rather than requiring you to extract it first."],
    ["Ragged records still align", "Headers are the union of keys across every row, so a field present in only some records gets its own column and blanks elsewhere."],
    ["Excel opens it as text, not guesses", "The .xls export sets a text number format on every cell, so leading zeros in IDs and codes survive instead of being eaten."],
  ],
  faqs: [
    [
      "What happens to nested objects and arrays?",
      "Nested objects are flattened into dot-path columns — `{\"customer\":{\"name\":\"…\"}}` becomes a `customer.name` column, at any depth. An array of scalars is joined into one cell with `, ` separators, while an array of objects is written into the cell as JSON, since it has no single-column representation.",
    ],
    [
      "Which delimiter should I pick?",
      "Comma is the default and what Excel and Google Sheets expect in en-US locales. Semicolon is the right choice in most European locales, where the comma is the decimal separator. Tab produces a .tsv, which is the most reliable option when you intend to paste straight into a sheet.",
    ],
    [
      "Is the Excel download a real .xlsx file?",
      "No — it is an HTML table saved with an .xls extension and the `application/vnd.ms-excel` type, a legacy format Excel, LibreOffice and Numbers all open natively. It carries your sheet name and header styling; if you need true .xlsx with formulas or multiple sheets, open this file and re-save it from Excel.",
    ],
    [
      "How are commas and quotes inside values handled?",
      "A field is wrapped in double quotes whenever it contains the delimiter, a double quote, or a carriage return or newline, and any double quote inside it is doubled — the standard CSV escaping rule. So a value like `Sharma, Maya` stays in one cell rather than splitting into two.",
    ],
  ],
};

export default seo;
