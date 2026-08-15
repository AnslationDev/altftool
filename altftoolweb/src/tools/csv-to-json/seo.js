const seo = {
  title: "CSV to JSON Converter — Edit Rows, Pretty or Minified",
  metaDescription:
    "Upload, drag in or paste CSV; edit cells in a paginated table, then export a JSON array of objects as pretty_data.json or minified_data.json.",
  intro:
    "CSV to JSON converts a comma-separated file into a JSON array of objects, using the header row as the key names for every record. The parser respects double-quoted fields, so commas inside quotes stay part of the value and a doubled \"\" is read as a literal quote character. Before converting you can edit cells, delete or add rows in a paginated table, then export either pretty-printed JSON with two-space indentation or a minified single-line file.",
  useCases: [
    "A client sent product data as a spreadsheet export and your API seed script expects an array of objects, so you need the header row turned into keys without hand-typing the structure.",
    "You are mocking a frontend list view and want realistic sample records with an id, an email and a createdAt timestamp attached to each row before the real backend exists.",
    "An export has a few blank cells and one address field containing commas, and you need to spot and fix both in a table view before the JSON reaches your import.",
  ],
  benefits: [
    ["Quoted fields parsed correctly", "A field wrapped in double quotes keeps its internal commas and line content intact, so \"Delhi, India\" stays one value instead of splitting into two columns."],
    ["Fix the data before you export", "The paginated table lets you edit any cell, delete a bad row or append a new one, and the JSON is generated from what you see rather than from the raw upload."],
    ["Flags gaps before conversion", "An insights strip counts total rows, empty cells and unique values, and labels each column Number or String, so a broken export is obvious before it becomes JSON."],
  ],
  faqs: [
    [
      "Will numbers in my CSV become JSON numbers?",
      "No — every value is emitted as a JSON string, so an age column produces \"25\" rather than 25. The column detector labels a column Number when all its values parse numerically, but it does not change the output type; cast the fields after import if your consumer needs real numbers.",
    ],
    [
      "How do I load my CSV?",
      "Three ways: choose a .csv file, drag the file anywhere onto the page, or paste the CSV text directly — a paste containing a comma and more than five characters is picked up automatically.",
    ],
    [
      "What is the difference between the pretty and minified output?",
      "Pretty output is JSON.stringify with two-space indentation and downloads as pretty_data.json; minified strips all whitespace onto one line and downloads as minified_data.json. Minified is smaller to ship, pretty is easier to read in a diff.",
    ],
    [
      "What does the mock API toggle add?",
      "It wraps each row with three extra fields: a random id, a sequential mock_email in the form 1@mockapi.dev, and a createdAt ISO 8601 timestamp taken at conversion time. It is intended for prototyping fixtures, not for data you are importing for real.",
    ],
  ],
};

export default seo;
