const seo = {
  title: "SQL WHERE Clause Builder: AND/OR Groups, IN, NULL",
  metaDescription:
    "Compose AND/OR groups with =, LIKE, IN, BETWEEN and IS NULL into a parenthesised WHERE clause with inline literals or ?, $1, :name or @name binds.",
  steps: [
    "Choose a Parameter style — \"Inline literals ('value')\", '? — JDBC / SQLite / MySQL', '$1, $2 — PostgreSQL', ':name — Oracle / SQLAlchemy' or '@name — SQL Server / BigQuery' — and set 'Join groups with' to AND or OR.",
    "In each Group set 'Conditions joined with', then fill Column, Operator (from '= equals' through 'IN list', 'BETWEEN two values' and 'IS NOT NULL'), the Value and a Value type of Text, Number or 'Column / raw SQL'; 'Add condition' and 'Add group' extend the builder.",
    "The 'Generated WHERE clause' panel updates live with multi-condition groups parenthesised and lists the Conditions count and Bind parameters — press 'Copy clause' to take the SQL, or Reset to restore the starting groups.",
  ],
  intro:
    "This builder composes SQL WHERE clauses visually from AND/OR condition groups, covering all the standard predicates — comparisons, LIKE, IN lists, BETWEEN ranges and IS NULL checks — and parenthesising groups correctly because AND binds tighter than OR in every SQL engine. Values can be emitted as safely escaped inline literals or as bind parameters in ?, $1, :name or @name style to match JDBC, PostgreSQL, Oracle or SQL Server conventions. It is for developers and analysts assembling non-trivial filters without hand-balancing parentheses.",
  useCases: [
    "Building a filter like status = 'active' AND age >= 18 AND (city = 'Delhi' OR city = 'Mumbai') with the parentheses placed correctly",
    "Generating a PostgreSQL query with $1..$n placeholders plus the ordered parameter list to paste into application code",
    "Translating a business rule with IN lists and BETWEEN date ranges into SQL without remembering each operator's exact syntax",
  ],
  benefits: [
    ["Correct precedence", "Multi-condition OR groups are wrapped in parentheses automatically, so AND/OR mixing never changes meaning silently."],
    ["Five parameter styles", "Inline literals, ?, $n, :name and @name markers cover SQLite, JDBC, PostgreSQL, Oracle and SQL Server."],
    ["SQL-standard quote escaping", "Text values are escaped with SQL-standard '' quote-doubling and column names are validated before they are emitted. A value containing a backslash is flagged with a warning to use a bind parameter instead, since some engines' backslash-escaping in string literals falls outside plain '' escaping."],
  ],
  faqs: [
    [
      "Does AND or OR take precedence in a SQL WHERE clause?",
      "AND binds tighter than OR, per the SQL standard and every major engine. So a = 1 OR b = 2 AND c = 3 means a = 1 OR (b = 2 AND c = 3). This builder parenthesises each group it generates, so the clause always means exactly what the visual grouping shows.",
    ],
    [
      "What is the difference between ?, $1, :name and @name parameters?",
      "They are the same concept — bind parameters — in different dialects: ? is the positional marker used by JDBC, ODBC, SQLite and MySQL; $1, $2 are PostgreSQL's numbered parameters; :name is used by Oracle, SQLite and SQLAlchemy; and @name by SQL Server and BigQuery. Bind parameters keep values out of the SQL text, which prevents SQL injection.",
    ],
    [
      "How do I write a WHERE clause for a range of values?",
      "Use BETWEEN: amount BETWEEN 100 AND 500 is equivalent to amount >= 100 AND amount <= 500 — the bounds are inclusive on both ends. For dates, be careful that BETWEEN '2026-01-01' AND '2026-01-31' excludes any time-of-day after midnight on the 31st when the column is a timestamp.",
    ],
    [
      "Why does column = NULL never match anything in SQL?",
      "Because NULL is unknown, any comparison with it — even NULL = NULL — evaluates to unknown rather than true. The SQL standard provides IS NULL and IS NOT NULL predicates for null tests, which is why this builder offers them as distinct operators that take no value.",
    ],
  ],
};

export default seo;
