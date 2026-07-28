const seo = {
  intro:
    "Split Excel turns one workbook into several standalone .xlsx files, either by exporting each worksheet on its own or by cutting a chosen sheet into row batches, equal parts, or one file per value in a column. Worksheet names in each output are sanitised to Excel's own rules — 31 characters maximum with : \\ / ? * [ ] removed — so every file opens without a repair prompt. It suits anyone who has to hand out slices of a master spreadsheet without sharing the whole thing.",
  useCases: [
    "Sending each regional manager only the rows for their own branch from a single sales workbook",
    "Breaking a 30,000-row master sheet into 5,000-row files because an import tool caps uploads",
    "Exporting a 12-tab budget workbook into 12 separate files, one per department",
  ],
  benefits: [
    ["Header row on every file", "Column names are copied to the top of each output sheet, so all parts import with the same schema."],
    ["Excel-legal sheet names", "Names are trimmed to 31 characters and stripped of the characters Excel rejects, avoiding corrupt-file warnings."],
    ["Runs offline in the browser", "The workbook is parsed and rewritten locally with SheetJS — no upload and no server-side copy of your data."],
  ],
  faqs: [
    [
      "How do I split an Excel file into multiple files?",
      "Upload the workbook, pick a split mode and download the parts. Choosing 'Max rows per file' with 5,000 on a 12,000-row sheet gives three files of 5,000, 5,000 and 2,000 rows, each with the header row repeated; 'One file per worksheet' instead writes every tab out as its own workbook.",
    ],
    [
      "Can I split an Excel sheet by the value in a column?",
      "Yes. Select 'One file per column value' and choose the column — each distinct value becomes its own workbook, named after that value, with blank cells collected into a '(blank)' file. The split stops at 300 output files so the browser stays responsive.",
    ],
    [
      "Do formulas and formatting survive the split?",
      "No — the output files contain cell values, not formulas, charts, conditional formatting or macros. If you need calculated results preserved, that is exactly what you get, because each formula is written out as the value it evaluated to in the source file.",
    ],
    [
      "What is the maximum worksheet name length in the split files?",
      "31 characters, which is Excel's own limit for a worksheet name. Longer group names are truncated and the characters : \\ / ? * [ ] are replaced with a hyphen, since Excel refuses to open a file whose sheet name contains them.",
    ],
  ],
};

export default seo;
