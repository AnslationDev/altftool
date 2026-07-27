const seo = {
  intro:
    "A CSV converter reads comma-separated data and rewrites it as JSON, an HTML table, XML, SQL INSERT statements or a Python list of dictionaries. Parsing follows RFC 4180, so a field wrapped in double quotes may contain the delimiter, a line break, or an escaped quote written as two double quotes — the cases that break spreadsheet exports pasted into naive converters. It is aimed at developers and analysts moving an export from one system into another without writing a script.",
  useCases: [
    "Turn a spreadsheet export into a JSON fixture for tests or a front-end mock, with numbers and booleans typed rather than left as strings",
    "Generate SQL INSERT statements to seed a table from a supplier price list, with single quotes escaped correctly",
    "Convert a tab-separated export into an HTML table you can paste straight into a page or a CMS block",
  ],
  benefits: [
    ["RFC 4180 parsing", "Quoted commas, embedded newlines and doubled quotes are read the way Excel writes them."],
    ["Five targets, one paste", "JSON, HTML, XML, SQL and Python from the same input, switchable without re-pasting."],
    ["Safe escaping per format", "HTML entities, XML character data, ANSI single-quote doubling and Python string escapes are each applied properly."],
  ],
  faqs: [
    [
      "How do I put a comma inside a CSV field?",
      "Wrap the whole field in double quotes: \"Sharma, Priya\" is one field, not two. RFC 4180 also allows a line break inside a quoted field, and a literal double quote is written twice — \"Lee \"\"Jay\"\" Min\" parses as Lee \"Jay\" Min. This tool implements all three rules.",
    ],
    [
      "Does the converter guess data types?",
      "Yes, when type detection is on. A cell matching an optional sign, digits and optional decimals becomes a JSON number; true/yes and false/no become booleans; an empty cell becomes null (NULL in SQL, None in Python). Turn detection off and every cell stays a string, which is safer for identifiers such as zip codes and phone numbers that start with a zero.",
    ],
    [
      "Are the generated SQL INSERT statements safe to run?",
      "They escape single quotes by doubling them, which is the ANSI SQL rule, and empty cells become NULL rather than ''. Still review them before running against a live database: column names are derived from your header row and lower-cased to snake_case, and types are inferred from the data, not from your actual schema.",
    ],
    [
      "What about semicolon or tab separated files?",
      "Pick the delimiter from the list — comma, semicolon, tab or pipe. Semicolon files are what Excel produces in locales that use a comma as the decimal separator, such as Germany and France, so a European export that looks broken usually just needs the semicolon setting.",
    ],
  ],
};

export default seo;
