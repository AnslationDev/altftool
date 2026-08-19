const seo = {
  title: "SQL EXPLAIN Prompt Builder: Read a Query Plan",
  metaDescription:
    "Flags non-sargable predicates and costly plan nodes, then writes a prompt for a node-by-node plan read and costed fixes. PostgreSQL, MySQL, SQL Server.",
  steps: [
    "Pick your engine under Database engine and paste the query into SQL statement — PostgreSQL, MySQL and MariaDB, SQLite, SQL Server and Oracle are supported.",
    "Paste any plan into EXPLAIN output (optional); the Patterns flagged in the SQL count updates as you type, since the page has only Copy prompt and Reset, no submit button.",
    "Press Copy prompt to take the generated prompt, which asks for the plan read node by node, the single most expensive step, and fixes ordered by effort against expected gain.",
  ],
  intro:
    "A SQL explain prompt builder scans a query for predicates that stop an index being used — a function wrapped around a filtered column, a LIKE with a leading wildcard, NOT IN, ORDER BY with no row limit — and scans any pasted EXPLAIN output for the plan nodes your engine prints when it falls back to scanning or sorting on disk. It then writes a prompt that asks for the plan read node by node, the single most expensive step, and fixes ordered by effort against expected gain. Supports PostgreSQL, MySQL and MariaDB, SQLite, SQL Server and Oracle, each with its own plan command and node vocabulary.",
  useCases: [
    "Understand why a query that was fast in staging does a sequential scan in production.",
    "Get a junior developer a node-by-node walk-through of an EXPLAIN ANALYZE output instead of a vague \"add an index\".",
    "Check a query before it ships, when you have the SQL but no plan and no production data to run it against.",
    "Turn a slow-query log entry into a costed list of fixes you can put in a ticket.",
  ],
  benefits: [
    [
      "Sargability checked first",
      "The patterns that most often defeat an index are found in the SQL itself, before anyone reads the plan.",
    ],
    [
      "Engine-specific vocabulary",
      "Seq Scan, type: ALL, Using filesort, TABLE ACCESS FULL — the prompt uses the names your engine actually prints.",
    ],
    [
      "Fixes with their cost stated",
      "Every suggested index has to name its exact columns and order, and every fix has to declare its write-side or behaviour cost.",
    ],
  ],
  faqs: [
    [
      "What does a sequential scan in EXPLAIN mean?",
      "It means the engine is reading every row of the table rather than seeking through an index. That is the right choice when the query returns a large fraction of the table, and the wrong one when it returns a handful of rows — in which case the usual causes are a missing index, a non-sargable predicate, or statistics that are out of date.",
    ],
    [
      "What is a non-sargable query?",
      "Sargable is short for Search ARGument ABLE: a predicate the engine can satisfy with an index seek. Wrapping the column in a function, as in WHERE LOWER(email) = ?, or starting a LIKE with a wildcard, as in LIKE '%gmail.com', makes the predicate non-sargable and forces a scan. Comparing the bare column, or adding an expression index, restores the seek.",
    ],
    [
      "How do I get a query plan in each database?",
      "PostgreSQL: EXPLAIN (ANALYZE, BUFFERS). MySQL 8 and MariaDB: EXPLAIN ANALYZE, or EXPLAIN FORMAT=JSON. SQLite: EXPLAIN QUERY PLAN. SQL Server: capture the actual execution plan, with SET STATISTICS IO, TIME ON for the counts. Oracle: EXPLAIN PLAN FOR, then select from DBMS_XPLAN.DISPLAY.",
    ],
    [
      "Why do estimated and actual rows differ in a plan?",
      "The planner works from table statistics. When estimated and actual row counts differ by an order of magnitude, the statistics are usually stale, the column values are skewed, or a correlation between two columns is invisible to the planner. Refreshing statistics is the first thing to try, before adding an index.",
    ],
  ],
};

export default seo;
