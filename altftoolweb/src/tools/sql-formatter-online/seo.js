const seo = {
  title: "SQL Formatter Online: Clause-Per-Line, No Upload",
  metaDescription:
    "Split a one-line query onto SELECT, FROM, WHERE and JOIN lines with 1-8 space indent and your keyword case. Tokenized in your browser, never uploaded.",
  steps: [
    "Paste your query into the \"SQL to format\" box, which starts on a sample SELECT with JOIN, GROUP BY, HAVING and ORDER BY crammed onto single lines.",
    "Set \"Indent width (spaces)\" to anything from 1 to 8 and \"Keyword case\" to UPPERCASE, lowercase or \"Leave as typed\".",
    "The Formatted panel prints the clause-per-line query with Statements, SELECT clauses, Tokens and the minified length beside it; \"Copy SQL\" takes the formatted text and \"Copy one-line\" takes the One-line version.",
  ],
  intro:
    "A SQL formatter rewrites the whitespace in a query so each clause starts on its own line and every list item is indented consistently, without changing a single token. This one tokenizes the statement using SQL:2016 lexical rules — single-quoted literals with '' doubling, double-quoted and backtick identifiers, -- line comments and /* */ blocks — then re-emits it with SELECT, FROM, WHERE, GROUP BY, HAVING and ORDER BY on their own lines and JOIN, AND and OR indented under them. It runs entirely in your browser, so the query is never uploaded.",
  useCases: [
    "Read a 900-character single-line query pulled out of an application log or an ORM's debug output",
    "Normalise indentation and keyword case before committing a migration so code review shows real changes, not whitespace",
    "Flip a formatted query back to one line to paste into a shell, a JSON payload or a ticket",
  ],
  benefits: [
    ["Nothing leaves the browser", "The tokenizer runs client-side, so production SQL is not sent to a server."],
    ["Token-safe", "String literals, quoted identifiers and comments are copied through byte-for-byte."],
    ["Configurable", "1 to 8 spaces of indent, and keywords in UPPERCASE, lowercase or exactly as typed."],
  ],
  faqs: [
    [
      "Does formatting change what my query does?",
      "No. The formatter only changes whitespace between tokens and, optionally, the case of reserved words such as SELECT and JOIN. It never touches the contents of a string literal, a quoted identifier or a comment, and it never reorders or removes a token, so the parsed statement is identical.",
    ],
    [
      "Is my SQL uploaded anywhere?",
      "No. Tokenizing and formatting happen in JavaScript in your own browser tab; there is no network request in the process. That matters because real queries usually contain table names, column names and sometimes literal values from production.",
    ],
    [
      "Which SQL dialects does it handle?",
      "The lexer is dialect-neutral and covers the syntax shared by PostgreSQL, MySQL, SQL Server and SQLite: '' string escaping, double-quoted and backtick identifiers, square-bracket identifiers, the :: cast operator and the -> and ->> JSON operators. Because it is lexical rather than a parser, dialect-specific keywords it does not recognise are simply passed through unchanged.",
    ],
    [
      "Why is AND on a new line but BETWEEN … AND kept inline?",
      "A leading AND at the start of a line makes the conditions in a WHERE clause countable at a glance. The AND that belongs to BETWEEN is part of a single predicate, not a new condition, so the formatter tracks it and keeps it on the same line as its BETWEEN.",
    ],
  ],
};

export default seo;
