const seo = {
  intro:
    "This XML to Excel converter reads an XML document, finds the element that repeats, and writes one worksheet row per record as a real .xlsx file — not a renamed CSV. Numbers and TRUE/FALSE values are written as typed cells so they sort and sum correctly, while identifiers with leading zeros and references longer than 15 digits are kept as text, which is where most XML-to-spreadsheet conversions quietly corrupt data. It follows the Office Open XML (ECMA-376) worksheet limits of 1,048,576 rows, 16,384 columns and 31-character sheet names.",
  useCases: [
    "Turn an XML invoice export into an .xlsx your accountant can filter and pivot.",
    "Convert an XML product feed into a spreadsheet without a leading-zero SKU losing its zeros.",
    "Get an XML API response into OpenDocument format for LibreOffice Calc.",
  ],
  benefits: [
    ["Typed cells, not text", "Amounts arrive as numbers and TRUE/FALSE as booleans, so SUM and filters work the moment the file opens."],
    ["Leading zeros survive", "Values like 007 or 0221 and integers above 9,007,199,254,740,991 are written as text instead of being rounded or trimmed."],
    ["Three output formats", "Download .xlsx, legacy .xls or .ods, all generated in the browser with no upload."],
  ],
  faqs: [
    [
      "Does this produce a real Excel file or a CSV renamed to .xlsx?",
      "A real file. The workbook is generated in your browser in Office Open XML format, with column widths set and each cell written with its own type, so Excel opens it without a text-import prompt.",
    ],
    [
      "Why is my product code shown as text instead of a number?",
      "Because it has a leading zero or is longer than 15 significant digits. Excel would render 007 as 7 and round a 20-digit reference, so any value with a significant leading zero, or above 9,007,199,254,740,991, is deliberately kept as text.",
    ],
    [
      "How many rows can the output have?",
      "Up to 1,048,576 rows and 16,384 columns — the hard limits of the Office Open XML worksheet format. Documents that would exceed either limit are rejected with a message rather than being silently truncated.",
    ],
    [
      "What name does the worksheet get?",
      "By default the repeating element's name — a document full of <invoice> elements gives a sheet called invoice. You can override it; Excel forbids the characters : \\ / ? * [ ] and caps names at 31 characters, so those are corrected automatically.",
    ],
  ],
};

export default seo;
