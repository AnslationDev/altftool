/**
 * SQL Explain Prompt Builder.
 *
 * Scans a SQL statement for patterns that commonly stop an index being used,
 * scans pasted EXPLAIN output for the plan nodes each engine prints when it
 * falls back to scanning or spilling, and writes a prompt that asks for a
 * plain-language walk-through of the plan plus concrete fixes.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** How each engine produces a plan, and what its expensive nodes are called. */
export const ENGINES = [
  {
    id: "postgres",
    label: "PostgreSQL",
    command: "EXPLAIN (ANALYZE, BUFFERS) <your query>",
    costlyNodes: ["Seq Scan", "Nested Loop", "Sort", "Hash Join", "Materialize", "Bitmap Heap Scan"],
    note: "Compare the estimated rows with the actual rows on each node — a large gap usually means stale statistics.",
  },
  {
    id: "mysql",
    label: "MySQL / MariaDB",
    command: "EXPLAIN ANALYZE <your query>  (or EXPLAIN FORMAT=JSON)",
    costlyNodes: ["type: ALL", "type: index", "Using filesort", "Using temporary", "Using join buffer"],
    note: "type: ALL is a full table scan; rows is an estimate, so compare it against the table's real row count.",
  },
  {
    id: "sqlite",
    label: "SQLite",
    command: "EXPLAIN QUERY PLAN <your query>",
    costlyNodes: ["SCAN", "USE TEMP B-TREE"],
    note: "SCAN without an index means a full table read; SEARCH USING INDEX is what you want to see.",
  },
  {
    id: "sqlserver",
    label: "SQL Server",
    command: "SET STATISTICS IO, TIME ON — then capture the actual execution plan",
    costlyNodes: ["Table Scan", "Clustered Index Scan", "Key Lookup", "Sort", "Hash Match"],
    note: "A Key Lookup next to an Index Seek usually means the index needs the missing column included.",
  },
  {
    id: "oracle",
    label: "Oracle",
    command: "EXPLAIN PLAN FOR <your query>; then SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);",
    costlyNodes: ["TABLE ACCESS FULL", "NESTED LOOPS", "SORT", "HASH JOIN", "MERGE JOIN CARTESIAN"],
    note: "MERGE JOIN CARTESIAN almost always means a join condition is missing.",
  },
];

/** Reader level, which sets how much SQL vocabulary the answer may assume. */
export const LEVELS = [
  {
    id: "beginner",
    label: "New to query plans",
    directive:
      "Explain what each plan node does using an everyday analogy before naming it, and define index, scan, seek and join order on first use.",
  },
  {
    id: "developer",
    label: "Application developer",
    directive:
      "Assume SQL fluency but not planner internals. Focus on which predicate stopped an index being used and what to change in the query or schema.",
  },
  {
    id: "dba",
    label: "DBA or performance engineer",
    directive:
      "Skip the basics. Go straight to cardinality estimates versus actual rows, join order, buffer or IO counts, and whether the fix is an index, a rewrite, statistics or a configuration change.",
  },
];

/**
 * Predicate and clause patterns that commonly prevent index use or force extra
 * work. "Sargable" (Search ARGument ABLE) describes a predicate the engine can
 * satisfy with an index seek; wrapping a column in a function, or leading a
 * LIKE with a wildcard, makes it non-sargable.
 */
export const SQL_CHECKS = [
  {
    id: "selectStar",
    label: "SELECT *",
    test: /select\s+\*/i,
    finding:
      "SELECT * reads every column, which prevents a covering index and inflates network and buffer cost. Ask which columns are actually needed.",
  },
  {
    id: "leadingWildcard",
    label: "LIKE with a leading wildcard",
    test: /like\s+'%/i,
    finding:
      "LIKE '%…' cannot use a B-tree index and forces a scan. Ask whether a trigram, full-text or reversed index applies.",
  },
  {
    id: "functionOnColumn",
    label: "Function wrapped around a filtered column",
    test: /where[\s\S]*?\b(?:lower|upper|date|cast|convert|coalesce|substr|substring|year|month|trunc|to_char)\s*\(/i,
    finding:
      "A function around a column in WHERE makes the predicate non-sargable. Ask whether the query can be rewritten to compare the bare column, or whether an expression index is warranted.",
  },
  {
    id: "orInWhere",
    label: "OR across different columns",
    test: /where[\s\S]*?\s+or\s+/i,
    finding:
      "OR across different columns often defeats a single composite index. Ask whether splitting into a UNION ALL of two indexed queries is faster.",
  },
  {
    id: "notIn",
    label: "NOT IN / <>",
    test: /\bnot\s+in\s*\(|<>/i,
    finding:
      "NOT IN and <> are rarely index-friendly, and NOT IN behaves unexpectedly when the subquery returns NULL. Ask whether NOT EXISTS is both safer and faster.",
  },
  {
    id: "orderNoLimit",
    label: "ORDER BY with no LIMIT",
    test: /order\s+by[\s\S]*$/i,
    negate: /limit\s+\d+|fetch\s+first|top\s*\(?\s*\d+|rownum\s*<=/i,
    finding:
      "ORDER BY without a row limit sorts the whole result set, which can spill to disk. Ask whether the caller needs every row or just the first page.",
  },
  {
    id: "distinct",
    label: "DISTINCT",
    test: /select\s+distinct\b/i,
    finding:
      "DISTINCT often hides a join that fans out rows. Ask whether fixing the join condition removes the need to deduplicate.",
  },
  {
    id: "subquery",
    label: "Correlated subquery in SELECT or WHERE",
    test: /\(\s*select\b/i,
    finding:
      "A subquery that references the outer row may be evaluated once per row. Ask whether it can become a join or a lateral join.",
  },
  {
    id: "unboundedDml",
    label: "UPDATE or DELETE with no WHERE",
    test: /^\s*(?:update|delete)\b(?![\s\S]*\bwhere\b)/i,
    finding:
      "This statement has no WHERE clause and will touch every row in the table. Confirm that is intended before running it.",
  },
  {
    id: "implicitJoin",
    label: "Comma join instead of explicit JOIN",
    test: /from\s+[a-z_][\w.]*(?:\s+(?:as\s+)?[a-z_]\w*)?\s*,\s*[a-z_][\w.]*/i,
    finding:
      "Comma-separated tables in FROM make a missing join predicate invisible, which produces a cartesian product. Ask for explicit JOIN ... ON.",
  },
];

/** Practical bounds. */
export const LIMITS = {
  /** Long enough for a real query, short enough to stay inside a prompt. */
  sqlChars: { min: 12, max: 12000 },
  planChars: { max: 20000 },
};

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

const JOIN_PATTERN = /\b(inner|left|right|full|cross)?\s*(?:outer\s+)?join\b/gi;
const CTE_PATTERN = /\bwith\s+[a-z_][\w]*\s+as\s*\(/gi;
const UNION_PATTERN = /\bunion(\s+all)?\b/gi;
const GROUP_PATTERN = /\bgroup\s+by\b/i;
const HAVING_PATTERN = /\bhaving\b/i;
const WINDOW_PATTERN = /\bover\s*\(/i;

export function getEngine(id) {
  return ENGINES.find((item) => item.id === id) || null;
}

export function getLevel(id) {
  return LEVELS.find((item) => item.id === id) || null;
}

/**
 * Run the sargability and shape checks over a SQL statement.
 * @returns {{error:string}|{findings:Array,shape:object}}
 */
export function analyzeSql(sql) {
  if (typeof sql !== "string" || sql.trim().length < LIMITS.sqlChars.min) {
    return { error: "Paste the SQL statement you want explained." };
  }
  if (sql.length > LIMITS.sqlChars.max) {
    return {
      error: `Keep the statement under ${LIMITS.sqlChars.max} characters — explain one query at a time.`,
    };
  }
  const text = sql.trim();

  const findings = [];
  for (const check of SQL_CHECKS) {
    if (!check.test.test(text)) continue;
    if (check.negate && check.negate.test(text)) continue;
    findings.push({ id: check.id, label: check.label, finding: check.finding });
  }

  const joins = (text.match(JOIN_PATTERN) || []).length;
  const ctes = (text.match(CTE_PATTERN) || []).length;
  const unions = (text.match(UNION_PATTERN) || []).length;

  return {
    findings,
    shape: {
      joins,
      ctes,
      unions,
      grouped: GROUP_PATTERN.test(text),
      having: HAVING_PATTERN.test(text),
      windowed: WINDOW_PATTERN.test(text),
      characters: text.length,
    },
  };
}

/**
 * Look for the engine's costly plan nodes in pasted EXPLAIN output.
 * @returns {{nodes:string[],lines:number}}
 */
export function scanPlan(planText, engine) {
  if (typeof planText !== "string" || planText.trim().length === 0 || !engine) {
    return { nodes: [], lines: 0 };
  }
  const text = planText.slice(0, LIMITS.planChars.max);
  const lower = text.toLowerCase();
  const nodes = engine.costlyNodes.filter((node) => lower.includes(node.toLowerCase()));
  return { nodes, lines: text.trim().split(/\r?\n/).length };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Build the query-plan explanation prompt.
 * @returns {{error:string}|{text:string,...}}
 */
export function buildSqlExplainPrompt({
  sql,
  planText,
  engineId,
  levelId,
  tableSizes,
  wantRewrite,
  notes,
} = {}) {
  const engine = getEngine(engineId);
  if (!engine) return { error: "Choose the database engine." };
  const level = getLevel(levelId);
  if (!level) return { error: "Choose who the explanation is for." };

  const analysis = analyzeSql(sql);
  if (analysis.error) return { error: analysis.error };

  const plan = scanPlan(planText, engine);
  const sizes = typeof tableSizes === "string" ? tableSizes.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";
  const hasPlan = plan.lines > 0;

  const lines = [
    `Explain this ${engine.label} query and its execution plan.`,
    "",
    `READER: ${level.label}`,
    level.directive,
    "",
    "QUERY:",
    "```sql",
    sql.trim(),
    "```",
  ];

  if (hasPlan) {
    lines.push(
      "",
      `EXECUTION PLAN (${plan.lines} line${plan.lines === 1 ? "" : "s"}):`,
      "```",
      planText.trim(),
      "```",
    );
    if (plan.nodes.length > 0) {
      lines.push(
        "",
        `COSTLY NODES ALREADY SPOTTED IN THE PLAN: ${plan.nodes.join(", ")}. Explain what each one is doing here and whether it is justified at this data size.`,
      );
    }
  } else {
    lines.push(
      "",
      `NO PLAN SUPPLIED. Start by telling me exactly how to capture one: ${engine.command}. Then reason about the likely plan and label that reasoning as an assumption.`,
    );
  }

  if (sizes) {
    lines.push("", `TABLE SIZES AND INDEXES: ${sizes}`);
  } else {
    lines.push(
      "",
      "TABLE SIZES NOT SUPPLIED. Say which row counts and existing indexes you would need to be sure, and mark size-dependent advice TODO(verify).",
    );
  }

  lines.push(
    "",
    "QUERY SHAPE:",
    `- joins: ${analysis.shape.joins}`,
    `- common table expressions: ${analysis.shape.ctes}`,
    `- unions: ${analysis.shape.unions}`,
    `- aggregation: ${analysis.shape.grouped ? "GROUP BY present" : "none"}${analysis.shape.having ? ", HAVING present" : ""}`,
    `- window functions: ${analysis.shape.windowed ? "yes" : "no"}`,
  );

  if (analysis.findings.length > 0) {
    lines.push("", `PATTERNS FOUND IN THE SQL (${analysis.findings.length}) — address each one explicitly:`);
    for (const finding of analysis.findings) {
      lines.push(`- ${finding.label}: ${finding.finding}`);
    }
  } else {
    lines.push(
      "",
      "No obvious non-sargable predicate was found by pattern matching. Still check the join order and the selectivity of each filter.",
    );
  }

  lines.push(
    "",
    "ANSWER IN THIS ORDER:",
    "1. One sentence: what the query returns, in business terms.",
    "2. The plan read bottom-up, one short paragraph per node: what it does, how many rows it handles, and why the planner chose it.",
    "3. The single most expensive step, and the reason it is expensive.",
    "4. Fixes, ordered by effort against expected gain. For each: the exact change, the reason it helps, and its cost — index size, write slowdown, or a behaviour change.",
    "5. What to measure after the change to confirm it worked.",
    "",
    "RULES:",
    `- ${engine.note}`,
    "- Never claim a speed-up factor you cannot derive from the plan. Say \"fewer rows scanned\" rather than inventing a percentage.",
    "- If a fix changes results — a different join type, dropping DISTINCT — say so explicitly.",
    "- Do not suggest an index without naming its exact columns and their order.",
  );

  if (wantRewrite) {
    lines.push(
      "- Also give a rewritten version of the query, with a comment on every line you changed and a note on whether the result set is identical.",
    );
  }
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    engine,
    level,
    findings: analysis.findings,
    findingCount: analysis.findings.length,
    shape: analysis.shape,
    planNodes: plan.nodes,
    planLines: plan.lines,
    hasPlan,
    ...measureText(text),
  };
}
