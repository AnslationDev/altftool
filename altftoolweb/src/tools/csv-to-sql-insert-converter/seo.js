const seo = {
  title: "CSV to SQL INSERT Converter: RFC 4180, 4 Dialects",
  metaDescription:
    "Turns CSV into batched multi-row INSERTs — up to 1,000 rows each, 20,000 per run — with RFC 4180 parsing, type inference and per-dialect quoting.",
  steps: [
    "Paste your rows into CSV data, set Table name, and tick \"First row is a header with column names\" if the first line holds the headers.",
    "Choose SQL dialect — PostgreSQL, MySQL / MariaDB, SQLite or SQL Server — and set Rows per INSERT anywhere from 1 to 1,000.",
    "Rows converted updates as you type, up to the 20,000-row cap; press Copy SQL to take the batched multi-row INSERT statements.",
  ],
  intro:
    "This converter turns CSV rows into ready-to-run SQL INSERT statements, parsing the input per RFC 4180 (quoted fields, doubled-quote escapes, embedded commas and newlines) and inferring integer, decimal, boolean or text for each column from its values. It emits dialect-correct output for PostgreSQL, MySQL, SQLite and SQL Server — backtick vs double-quote vs bracket identifiers, '' quote escaping, doubled backslashes for MySQL, and 1/0 instead of TRUE/FALSE where the engine lacks boolean literals. Batching groups up to 1,000 rows per multi-row INSERT, and everything runs locally in the browser.",
  useCases: [
    "Seeding a development database from a spreadsheet export without writing a one-off import script",
    "Converting a 5,000-row product CSV into batched multi-row INSERTs that load far faster than 5,000 single-row statements",
    "Moving reference data between engines, letting the tool switch identifier quoting and boolean literals from MySQL style to PostgreSQL style",
  ],
  benefits: [
    ["RFC 4180 parsing", "Quoted fields, commas and even newlines inside quotes are parsed correctly, not split naively on commas."],
    ["Dialect-aware output", "Identifier quoting, string escaping and boolean literals adapt to PostgreSQL, MySQL, SQLite or SQL Server."],
    ["Type inference", "Columns whose values are all numeric or all true/false are emitted unquoted, so numbers load as numbers."],
  ],
  faqs: [
    [
      "How do I escape a single quote in a SQL INSERT statement?",
      "Double it: O'Neill becomes 'O''Neill'. This is the SQL-standard escape and works in every major engine. In MySQL's default mode the backslash is also an escape character inside strings, so this converter additionally doubles backslashes when MySQL is selected.",
    ],
    [
      "Is a multi-row INSERT faster than many single-row INSERTs?",
      "Yes, usually dramatically — one statement with many VALUES tuples amortises parsing, network round-trips and per-statement transaction overhead. Practical batch sizes are 100 to 1,000 rows per statement; this tool lets you pick anywhere in that range and splits the file into as many statements as needed.",
    ],
    [
      "How are empty CSV cells converted to SQL?",
      "By default an empty cell becomes NULL, and a cell containing the literal word NULL always does. If you untick the option, empty cells are written as the empty string '' instead — the right choice when the column is NOT NULL text. Missing trailing cells in short rows are always written as NULL and flagged in a warning.",
    ],
    [
      "Does my CSV data leave the browser?",
      "No. Parsing, type inference and SQL generation all run client-side in JavaScript; nothing is uploaded. The tool caps input at 20,000 rows per run to keep the browser responsive on large files.",
    ],
  ],
};

export default seo;
