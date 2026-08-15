const seo = {
  title: "SQL Formatter: Beautify, Compress or Escape a Query",
  metaDescription:
    "Beautify SQL onto clause lines, compress it to one line, or escape it as a string literal — quoted text and -- or /* */ comments stay untouched.",
  steps: [
    "Paste into the source.sql box ('Paste or type SQL here...'), or press Sample to load the example query and Clear to empty it.",
    "Choose Beautify, Compress or Escape, drag the Indent slider between 2 and 8 spaces, and toggle 'Uppercase SQL keywords'.",
    "Compare the Input Characters, Output Lines, Statements and Character Delta cards, then Copy the output or Download it as formatted.sql (compressed.sql in Compress mode).",
  ],
  intro:
    "Enter SQL reformats a SQL statement three ways — beautify it onto indented clause lines, compress it to a single line, or escape it into a quoted string literal — using a keyword list of 25 clause starters such as SELECT, LEFT JOIN, GROUP BY and INSERT INTO plus 16 inline keywords. Before any transformation runs, string literals, quoted identifiers, `--` line comments and `/* */` block comments are swapped out for placeholder tokens and restored afterwards, so nothing inside them is re-cased or re-spaced. It is for developers cleaning up a query pulled out of a log, an ORM dump or a one-line application string.",
  useCases: [
    "You copied a 400-character query out of a slow-query log as one unbroken line and need it laid out on clause boundaries before you can see where the join went wrong.",
    "You are embedding a query in application code and want it compressed to a single line, then escaped with doubled single quotes so it drops into a string literal without breaking.",
    "A colleague sent SQL in all lowercase and your team's convention is uppercase keywords, so you flip the casing toggle and paste the result back into the review.",
  ],
  benefits: [
    [
      "Literals and comments are never touched",
      "Quoted strings, backtick and double-quoted identifiers, and both comment styles are tokenised out before casing, spacing and line breaks are applied, so a keyword inside a string stays lowercase.",
    ],
    [
      "Indent width you choose",
      "The indent slider runs from 2 to 8 spaces in steps of 2, and clause keywords are dedented one level so SELECT, FROM and JOIN line up as the outline of the query.",
    ],
    [
      "Before-and-after metrics",
      "Character count, line count, statement count and how many recognised keywords appear are shown for the input and the output side by side.",
    ],
  ],
  faqs: [
    [
      "What does the escape mode do to my query?",
      "It compresses the SQL to one line, then doubles every single quote to '' and every backslash to \\\\ — the standard SQL escaping for embedding a statement inside a quoted string literal. Escaping text is not a substitute for parameterised queries; use bound parameters for anything containing user input.",
    ],
    [
      "Which keywords does it break lines on?",
      "25 clause keywords: SELECT, FROM, WHERE, GROUP BY, ORDER BY, HAVING, LIMIT, OFFSET, VALUES, SET, the six JOIN variants plus plain JOIN, UNION and UNION ALL, INSERT INTO, UPDATE, DELETE FROM, and CREATE, ALTER and DROP TABLE. A further 16 — AS, AND, OR, ON, IN, IS, NOT, NULL, LIKE, BETWEEN, CASE, WHEN, THEN, ELSE, END — are re-cased but kept inline.",
    ],
    [
      "Does it work with MySQL, PostgreSQL and SQL Server dialects?",
      "For the common clause structure, yes — the formatter is text-based rather than tied to one parser, and it protects backtick identifiers for MySQL as well as double-quoted ones for PostgreSQL and standard SQL. Dialect-specific syntax outside the keyword list is passed through untouched rather than reformatted.",
    ],
    [
      "Is my SQL sent anywhere when I format it?",
      "No. Formatting, compression, escaping and the metrics all run in your browser as you type, so queries containing table names, schemas or sample values never leave the page.",
    ],
  ],
};

export default seo;
