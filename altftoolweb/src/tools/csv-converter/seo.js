const seo = {
  title: "Free CSV Converter — JSON, HTML, XML & SQL",
  h1: "CSV Converter",
  metaDescription:
    "Paste CSV and get JSON, an HTML table, XML, SQL INSERTs or Python dicts. RFC 4180 parsing handles quoted commas and line breaks. Runs in your browser.",
  intro:
    "The CSV Converter rewrites pasted CSV as JSON, an HTML table, XML, SQL INSERT statements or a Python list of dicts. Parsing is a hand-written RFC 4180 character scanner rather than a split on the delimiter: it tracks quote state character by character, so a comma, a CRLF line break or a doubled \"\" quote inside a quoted field is read the way Excel wrote it instead of tearing the row apart. Conversion runs in a React useMemo in your browser and re-runs as you type — there is no upload step, no server call and no file leaving your device. Each target then applies its own escaping: HTML entities, XML character data, ANSI doubled single quotes for SQL, and backslash escapes for Python string literals.",
  useCases: [
    "Turning a spreadsheet export into a typed JSON fixture for tests or a front-end mock, with numbers, booleans and blank cells converted instead of left as strings",
    "Seeding a database table from a supplier price list or contact export by generating INSERT statements against a table name you set yourself",
    "Converting a semicolon- or tab-separated export out of a European Excel install into an HTML table you can paste straight into a page or CMS block",
  ],
  benefits: [
    [
      "RFC 4180 parsing, not a naive split",
      "Quoted commas, embedded CRLF line breaks and doubled quotes are resolved by a character-level scanner, so real spreadsheet exports survive the conversion intact.",
    ],
    [
      "Five outputs from one paste",
      "JSON, HTML table, XML, SQL INSERT and Python dicts regenerate instantly when you switch format — the CSV stays in the box, nothing is re-pasted.",
    ],
    [
      "Escaping matched to each target",
      "HTML entities, XML character data, ANSI single-quote doubling in SQL and \\n / \\\" escapes inside Python literals are each applied by the writer for that format.",
    ],
    [
      "Nothing is uploaded",
      "There is no file picker and no server round-trip: parsing and conversion happen on your device. Free, no signup, up to 20,000 records or about 4 MB of pasted text at a time.",
    ],
  ],
  faqs: [
    [
      "Is this CSV converter free?",
      "Yes — free, with no account and no trial limit. The only cap is a safety limit of 20,000 records or roughly 4 MB of pasted text per conversion, which exists so a huge paste can't lock up the browser tab.",
    ],
    [
      "Can I upload a CSV file, or do I have to paste it?",
      "Paste only — there is no file picker. Open the .csv in a text editor and paste the contents, or copy the cells straight out of Excel or Google Sheets and switch the delimiter to Tab, since spreadsheet clipboards are tab-separated. The result comes back through the Copy output button; there is no download step.",
    ],
    [
      "How do I convert CSV to JSON with this tool?",
      "Paste the CSV and leave the format on JSON. You get a pretty-printed array of objects, indented two spaces, one object per data row keyed by your header names. With type detection on, 42 becomes a number, true/yes and false/no become booleans, and an empty cell becomes null.",
    ],
    [
      "How do I put a comma inside a CSV field?",
      "Wrap the whole field in double quotes: \"Sharma, Priya\" is one field, not two. RFC 4180 also allows a line break inside a quoted field, and a literal double quote is written twice — \"Lee \"\"Jay\"\" Min\" parses as Lee \"Jay\" Min. All three rules are implemented here.",
    ],
    [
      "Does it handle semicolon or tab-separated files?",
      "Yes — pick comma, semicolon, tab or pipe from the delimiter list. Semicolon files are what Excel writes in locales that use a comma as the decimal separator, such as Germany and France, so a European export that looks mangled usually just needs the semicolon setting.",
    ],
    [
      "Are the generated SQL INSERT statements safe to run?",
      "They escape single quotes by doubling them, which is the ANSI SQL rule, and an empty cell becomes NULL rather than an empty string. Review them before running against a live database: the table name comes from the field you type, column names are derived from your header row and lower-cased to snake_case, and types are inferred from the data rather than read from your schema.",
    ],
    [
      "Will type detection destroy my zip codes and IDs?",
      "Leading zeros are safe — the number pattern rejects them, so 01234 stays the string \"01234\". A plain digit string with no leading zero, such as a 10-digit phone number, does become a number, so untick \"Detect numbers, booleans and blanks\" when every cell must stay text.",
    ],
    [
      "What happens if some rows have more columns than the header?",
      "Short rows are padded with empty values so every record has the same width, and the count is reported as \"Rows with a different column count\" so you can spot a broken export. Duplicate header names are de-duplicated (name, name_2), and a blank header becomes column_1, column_2 and so on.",
    ],
  ],
  steps: [
    "Paste your CSV into the input box — or copy the cells out of Excel or Google Sheets and set the delimiter to Tab.",
    "Choose an output format (JSON, HTML table, XML, SQL INSERT or Python dicts) and match the delimiter, header-row and type-detection settings to your data.",
    "Check the parsed preview of the first five rows, then press Copy output to take the converted result.",
  ],
};

export default seo;
