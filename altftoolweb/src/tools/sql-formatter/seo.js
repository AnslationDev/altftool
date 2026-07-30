const seo = {
  title: "SQL Formatter & Minifier — Query Beautifier",
  h1: "SQL Formatter and Minifier",
  metaDescription:
    "Format messy SQL into clause-per-line blocks or minify it to one line. Uppercases 21 keywords, indents AND/OR, runs in your browser — nothing uploaded.",
  intro:
    "SQL Formatter rewrites a single-line query into clause-per-line blocks using a chain of regular expressions: it collapses every run of whitespace to one space, uppercases a 21-entry keyword list matched longest-phrase-first so DELETE FROM is recognised before FROM, then forces a line break ahead of FROM, WHERE, the four JOIN variants, GROUP BY, ORDER BY, HAVING, LIMIT and OFFSET, indents AND and OR by two spaces, and breaks after every comma. A Minify toggle does the reverse — all whitespace collapsed to single spaces and commas normalised to a comma plus one space — for pasting a query into a shell, a JSON value or a ticket. Both passes run as JavaScript in your own browser tab and are recomputed as you type, so the query is never sent to a server.",
  useCases: [
    "Reading a 900-character query pulled straight out of an ORM's debug output or a slow-query log",
    "Uppercasing keywords and putting each clause on its own line before pasting SQL into a pull request or a bug ticket",
    "Collapsing a formatted multi-line query back onto one line so it fits in a shell command, a JSON config value or a spreadsheet cell",
  ],
  benefits: [
    [
      "Nothing leaves your browser",
      "Formatting and minifying are plain JavaScript in the page — there is no network request in either path, so production table and column names stay on your machine.",
    ],
    [
      "Format and minify from one box",
      "A two-button toggle switches the same input between clause-per-line output and a single-line version, with no re-pasting.",
    ],
    [
      "Consistent keyword case",
      "21 reserved words — including LEFT JOIN, INNER JOIN, GROUP BY, INSERT INTO and DELETE FROM — are matched case-insensitively, longest phrase first, and re-emitted in uppercase.",
    ],
    [
      "Free, instant, no signup",
      "No account, no upload and no rate limit; the output pane and the input character counter update on every keystroke.",
    ],
  ],
  faqs: [
    [
      "How do I format SQL online for free?",
      "Paste the query into the input box and the formatted version appears immediately in the right-hand pane — no account, no upload and no button to press. This tool applies its regex passes locally in the browser, and the Copy button puts the result on your clipboard via the Clipboard API.",
    ],
    [
      "Does formatting SQL change what the query does?",
      "In normal queries, no — it only changes whitespace and the case of 21 reserved words, which the SQL engine ignores. One real caveat: the line breaks are applied with regular expressions rather than a SQL parser, so a comma inside a string literal such as 'hello, world' is also broken onto a new line, and that newline becomes part of the string. Check the output before running any query containing literal text with commas or parentheses.",
    ],
    [
      "What is the difference between formatting and minifying SQL?",
      "Format expands: it puts each clause on its own line, indents AND and OR by two spaces, breaks after commas, and uppercases the keyword list. Minify collapses: it reduces every run of whitespace to a single space and normalises commas to a comma plus one space, producing one long line. Minify deliberately leaves your original keyword case alone — only Format uppercases.",
    ],
    [
      "Which SQL keywords does this formatter recognise?",
      "Twenty-one: SELECT, FROM, WHERE, JOIN, LEFT JOIN, RIGHT JOIN, INNER JOIN, FULL JOIN, ON, AND, OR, GROUP BY, ORDER BY, HAVING, LIMIT, OFFSET, INSERT INTO, VALUES, UPDATE, SET and DELETE FROM. Twelve of those also trigger a new line: FROM, WHERE, the four JOIN forms plus bare JOIN, GROUP BY, ORDER BY, HAVING, LIMIT and OFFSET.",
    ],
    [
      "Is my SQL uploaded to a server?",
      "No. The formatting and minifying functions are ordinary JavaScript running inside your browser tab, and the tool makes no fetch or API call of any kind. That matters because real queries usually contain table names, column names and sometimes literal values from a production database.",
    ],
    [
      "Can I change the indent size or keyword case?",
      "Not here — the indent is fixed at two spaces and Format always uppercases the recognised keywords. If you need configurable indentation (1 to 8 spaces), a choice of uppercase, lowercase or preserved keyword case, and a tokenizer that leaves string literals and comments untouched, use the SQL Formatter Online tool in the same Developer category instead.",
    ],
    [
      "Which SQL dialects does it work with?",
      "The keyword list is ANSI-common, so it behaves the same for PostgreSQL, MySQL, SQL Server, SQLite, BigQuery and Snowflake. Because the rules are lexical rather than dialect-aware, keywords outside those 21 — WINDOW, QUALIFY, MERGE, PIVOT and the like — are simply passed through unchanged rather than given their own line.",
    ],
  ],
  steps: [
    "Paste your query into the Input SQL box, or press Sample to load the example SELECT with a LEFT JOIN, GROUP BY and LIMIT.",
    "Choose Format to expand it to one clause per line with AND and OR indented, or Minify to collapse it back onto a single line.",
    "Press Copy to send the result to your clipboard; the badge below the output pane shows how many characters your input holds.",
  ],
};

export default seo;
