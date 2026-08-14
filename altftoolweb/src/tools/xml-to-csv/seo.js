const seo = {
  title: "XML to CSV Converter - Flatten Nested Tags Online",
  metaDescription:
    "Paste or upload XML up to 8 MB and get RFC 4180 CSV: repeating elements become rows, nested tags dotted columns, attributes @-prefixed columns.",
  steps: [
    "Paste your document into \"XML input\" or click \"Upload .xml\" (files up to 8 MB).",
    "Pick the \"Column delimiter\" - comma, semicolon, tab or pipe - and toggle \"Include a header row\" and \"Include attributes as columns\".",
    "Check the detected row element and the first-25-row preview, then click \"Copy CSV\" or \"Download\" to save a UTF-8 BOM .csv or .tsv file.",
  ],
  intro:
    "This XML to CSV converter turns the repeating elements in an XML document into spreadsheet rows, flattening nested tags into dotted column names and attributes into @-prefixed columns. Output follows RFC 4180: fields containing the delimiter, a double quote or a line break are wrapped in double quotes, and embedded quotes are doubled. It is built for anyone who has been handed a product feed, bank statement or API dump as XML and needs it in Excel, Google Sheets or a database import.",
  useCases: [
    "Load a supplier product feed shipped as XML into Google Sheets for price comparison.",
    "Flatten an API response with nested <order><item> elements into one row per item for analysis.",
    "Convert an exported XML report into a semicolon-delimited file that European Excel opens without a text-import wizard.",
  ],
  benefits: [
    ["Finds the row element for you", "It picks the deepest element that repeats under a shared parent, so <catalog><book>…</book></catalog> becomes one row per book."],
    ["RFC 4180 compliant output", "Commas, quotes and line breaks inside your data are quoted and escaped properly instead of silently breaking a column."],
    ["Nothing leaves your device", "The XML is parsed by JavaScript in the page, so confidential feeds and statements never reach a server."],
  ],
  faqs: [
    [
      "How does the converter decide what becomes a row?",
      "It looks for the deepest element whose children repeat under the same name. In <catalog><book/><book/></catalog> the repeating name is book, so each <book> becomes one CSV row. If nothing repeats, the root's child elements are used instead.",
    ],
    [
      "What happens to XML attributes?",
      "Each attribute becomes its own column, named with an @ marker — an id attribute on the row element gives a column called @id, and a currency attribute on <price> gives price@currency. You can switch attributes off entirely with one checkbox.",
    ],
    [
      "How are nested elements handled?",
      "Nested paths are joined with a dot, so <author><name> inside a record produces a column called author.name. Where the same child appears more than once, the second and later copies are numbered — tag, tag[2], tag[3].",
    ],
    [
      "Why does my CSV open as gibberish in Excel?",
      "Excel guesses ANSI encoding unless the file starts with a UTF-8 byte-order mark, so the download here writes that BOM automatically. If your data uses semicolons as the natural separator, switch the delimiter to semicolon, which is what Excel expects in most European locales.",
    ],
  ],
};

export default seo;
