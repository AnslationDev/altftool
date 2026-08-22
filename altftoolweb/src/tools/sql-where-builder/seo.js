const seo = {
  title: "SQL WHERE Clause Builder for Five Dialects",
  metaDescription:
    "Build a WHERE clause with correct quoting for MySQL, PostgreSQL, SQL Server, SQLite and Oracle, plus a parameterised version and IS NULL for null checks.",
  steps: [
    "Pick the SQL dialect — MySQL / MariaDB, PostgreSQL, SQL Server, SQLite or Oracle — and enter the Table name.",
    "For each Condition set Column, Operator, Value type and Value, join the next one with AND or OR, and press Add condition to keep going.",
    "The WHERE clause renders with that dialect's identifier quoting and escaping, alongside the Full query and a \"Parameterised (safe from injection)\" version with its ordered Parameters list.",
  ],
  intro:
    "SQL WHERE Builder assembles a WHERE clause from a list of column-operator-value conditions and renders it with the quoting rules of your database engine — backticks for MySQL, double quotes for PostgreSQL, SQLite and Oracle, square brackets for SQL Server. String literals follow the SQL standard, where an embedded apostrophe is escaped by doubling it, with MySQL's extra backslash escaping applied only for MySQL. It is aimed at developers, analysts and support engineers who write ad-hoc queries and want the syntax right the first time.",
  useCases: [
    "Turning a support ticket's filter list into a WHERE clause for a one-off PostgreSQL query",
    "Getting the correct placeholder style ($1, ?, @p1 or :1) for a prepared statement in a new codebase",
    "Checking how a value containing an apostrophe, such as O'Brien, must be escaped before pasting it into a query",
  ],
  benefits: [
    ["Engine-correct quoting", "Identifiers use ` \" or [ ] per dialect and escape characters are doubled, so pasted SQL parses first time."],
    ["Parameterised output", "Every clause also comes back with placeholders and a matching parameter array for prepared statements."],
    ["Three-valued-logic safe", "Null checks emit IS NULL / IS NOT NULL rather than = NULL, which would evaluate to UNKNOWN and match nothing."],
  ],
  faqs: [
    [
      "How do I escape a single quote in a SQL string?",
      "Double it: 'O''Brien' is the standard SQL:2016 way to write O'Brien inside a string literal. MySQL also treats backslash as an escape character unless NO_BACKSLASH_ESCAPES is set, so a backslash must be written as \\\\ there but stays single in PostgreSQL.",
    ],
    [
      "Does AND or OR come first in a SQL WHERE clause?",
      "AND binds tighter than OR, so a = 1 OR b = 2 AND c = 3 is read as a = 1 OR (b = 2 AND c = 3). If you meant the OR to apply first you must add parentheses — the builder flags any clause that mixes both operators.",
    ],
    [
      "Why can't I use = NULL in a WHERE clause?",
      "Because SQL uses three-valued logic: comparing anything to NULL yields UNKNOWN, not TRUE, so the row is never returned. Use IS NULL or IS NOT NULL, which is what the builder emits for null checks.",
    ],
    [
      "What placeholder does each database use for bound parameters?",
      "MySQL and SQLite use ?, PostgreSQL uses numbered $1, $2, SQL Server uses named @p1, @p2 and Oracle uses :1, :2. The builder produces the right style for the selected dialect alongside the ordered parameter array.",
    ],
  ],
};

export default seo;
