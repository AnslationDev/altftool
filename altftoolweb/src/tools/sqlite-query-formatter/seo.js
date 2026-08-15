const seo = {
  title: "SQLite Query Formatter with PRAGMA and Bind",
  metaDescription:
    "Breaks SELECT, FROM, JOIN, WHERE and GROUP BY onto their own lines, folds keyword case, and keeps '' escapes, [brackets] and :name params intact.",
  steps: [
    "Paste your statement into the \"SQLite SQL to format\" textarea — PRAGMA, '' escapes, [bracket] and `backtick` identifiers and ?, :name, @name, $name binds are all parsed.",
    "Set Keyword case to UPPERCASE keywords, lowercase keywords or Keep as typed, and pick an Indent width of 2, 4 or 8 spaces.",
    "Read the Formatted SQL panel, one clause per line, then press Copy SQL — or Reset to restore the sample query.",
  ],
  intro:
    "This formatter rewrites SQLite SQL with each major clause — SELECT, FROM, JOIN, WHERE, GROUP BY, ORDER BY, LIMIT — on its own line, keywords case-folded against the official SQLite keyword list, and conditions split at top-level AND/OR. It understands SQLite specifics that generic formatters trip over: PRAGMA statements, doubled-quote string escapes ('It''s'), [bracket] and `backtick` identifiers, and ?, :name, @name and $name bind parameters. Formatting is purely lexical, so the output executes identically to the input.",
  useCases: [
    "Cleaning up a long single-line query copied from application logs before adding it to a code review",
    "Standardising keyword casing and indentation across a migration file that mixes several authors' styles",
    "Making an EXPLAIN QUERY PLAN target readable so you can see which JOIN and WHERE clauses to index",
  ],
  benefits: [
    ["SQLite-aware lexer", "PRAGMA, bind parameters, [bracket] identifiers and '' escapes are parsed correctly, not mangled."],
    ["Semantics preserved", "Only whitespace and keyword letter-case change; strings and identifiers are untouched byte for byte."],
    ["Clear error reporting", "Unterminated strings, comments and bracket identifiers are reported with their position instead of producing broken output."],
  ],
  faqs: [
    [
      "Does formatting SQL change how SQLite executes it?",
      "No. SQLite ignores extra whitespace and treats keywords case-insensitively, so a purely lexical reformat produces a byte-different but semantically identical statement. This tool never reorders tokens, only inserts line breaks and changes keyword letter-case.",
    ],
    [
      "How do I escape a single quote in an SQLite string?",
      "Double it: 'It''s done' is the string It's done. SQLite follows the SQL standard here and does not support backslash escapes inside string literals, which is why this formatter treats '' as part of the same string token rather than the end of one.",
    ],
    [
      "What identifier quoting styles does SQLite accept?",
      "Four: \"double quotes\" (the SQL standard), `backticks` (MySQL compatibility), [square brackets] (SQL Server compatibility) and no quoting at all for identifiers that are not keywords. All four are recognised by this formatter and passed through unchanged.",
    ],
    [
      "What is a PRAGMA statement in SQLite?",
      "PRAGMA is SQLite's mechanism for reading and changing library behaviour per connection or per database file — for example PRAGMA foreign_keys = ON enables foreign-key enforcement and PRAGMA journal_mode = WAL switches to write-ahead logging. PRAGMA is SQLite-only, which is why general SQL formatters often refuse to parse it.",
    ],
  ],
};

export default seo;
