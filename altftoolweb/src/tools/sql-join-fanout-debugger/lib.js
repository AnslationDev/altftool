/**
 * SQL JOIN fan-out debugger — row multiplication and aggregate distortion.
 *
 * Rules implemented (all read on 2026-07-29):
 *
 * R1. A joined table is a subset of the cartesian product.
 *     ISO/IEC 9075-2 (SQL/Foundation) §7.10 <joined table> defines an INNER or
 *     LEFT OUTER join as the rows of CP = T1 CROSS JOIN T2 for which the join
 *     condition evaluates to True (plus, for LEFT, the null-extended rows of T1
 *     that matched nothing). So one left row that matches m right rows yields m
 *     result rows: the join MULTIPLIES rows, it does not merely widen them.
 *
 * R2. Fan-out composes multiplicatively down a join tree.
 *     Joining a base table to two independent 1:many children with average
 *     multiplicities m1 and m2 produces m1 * m2 rows per base row, because each
 *     child match is paired with every match of the other child (R1 applied
 *     twice). Rows of any table T in the tree are therefore each repeated
 *     dupFactor(T) = (product of every multiplicity) / (product of the
 *     multiplicities on the root->T path) times.
 *
 * R3. Aggregates ignore nulls, except COUNT(*).
 *     ISO/IEC 9075-2 §10.9 <aggregate function>: every set function except
 *     COUNT(*) removes null values from the argument before aggregating. This
 *     is what makes the ROW_NUMBER + CASE de-duplication fix work.
 *
 * R4. Which aggregates survive duplication.
 *     SUM, COUNT(*), COUNT(col) are additive over rows, so duplicating each row
 *     of T d times multiplies them by d. MIN and MAX are idempotent under
 *     duplication (min of a multiset is unchanged by repeating members), and
 *     COUNT(DISTINCT col) is defined on the set of distinct values
 *     (ISO/IEC 9075-2 §10.9, DISTINCT removes duplicates before the set
 *     function is applied), so both survive exactly. AVG = SUM/COUNT is
 *     unchanged only when every row is duplicated the SAME number of times;
 *     with uneven fan-out it silently becomes a fan-out-weighted average.
 *     SUM(DISTINCT col) de-duplicates by VALUE, not by row, so it does not
 *     restore a true SUM whenever two source rows share the same value.
 *
 * R5. WHERE is evaluated after FROM.
 *     ISO/IEC 9075-2 §7.4 <table expression>: the from clause is evaluated
 *     first, then the where clause, then group by, then having. A WHERE
 *     predicate on a right-table column is therefore applied to the already
 *     null-extended rows of a LEFT JOIN; those rows give UNKNOWN and are
 *     discarded (§7.4 keeps only rows whose search condition is True), which
 *     turns the LEFT JOIN back into an INNER JOIN. Moving the predicate into
 *     the ON clause keeps the join outer.
 *
 * R6. NULL join keys never match.
 *     ISO/IEC 9075-2 §8.2 <comparison predicate>: if either operand is null the
 *     comparison is Unknown — including NULL = NULL. A join keeps only rows
 *     whose condition is True (§7.10), so a row with a null key joins to
 *     nothing and is dropped by an INNER JOIN.
 *
 * The row-count model assumes uniform fan-out (every parent row matches the
 * stated average) and independent match rates across joins. Those assumptions
 * are surfaced to the caller in `assumptions`.
 */

/** Join key cardinalities the user can pick, with the multiplicity each implies. */
export const CARDINALITIES = [
  {
    id: "one_to_one",
    label: "1:1 — at most one matching row",
    defaultMultiplicity: 1,
    fixedMultiplicity: 1,
    fansOut: false,
  },
  {
    id: "one_to_many",
    label: "1:many — several matching rows per parent row",
    defaultMultiplicity: 3,
    fixedMultiplicity: null,
    fansOut: true,
  },
  {
    id: "many_to_many",
    label: "many:many — both sides repeat",
    defaultMultiplicity: 4,
    fixedMultiplicity: null,
    fansOut: true,
  },
];

/**
 * Aggregate functions and how they behave when their table's rows are
 * duplicated d times by a join (rule R4).
 *  - behaviour "scales"     : result is multiplied by d
 *  - behaviour "idempotent" : result is unchanged for any d
 *  - behaviour "weighted"   : value survives uniform d, distorted by uneven d
 *  - behaviour "value_dedupe": collapses equal values, so never a true SUM
 */
export const AGG_FUNCTIONS = [
  { id: "sum", label: "SUM(col)", sql: "SUM", needsColumn: true, behaviour: "scales" },
  { id: "count_star", label: "COUNT(*)", sql: "COUNT", needsColumn: false, behaviour: "scales" },
  { id: "count_col", label: "COUNT(col)", sql: "COUNT", needsColumn: true, behaviour: "scales" },
  {
    id: "count_distinct",
    label: "COUNT(DISTINCT col)",
    sql: "COUNT",
    needsColumn: true,
    behaviour: "idempotent",
  },
  { id: "avg", label: "AVG(col)", sql: "AVG", needsColumn: true, behaviour: "weighted" },
  { id: "min", label: "MIN(col)", sql: "MIN", needsColumn: true, behaviour: "idempotent" },
  { id: "max", label: "MAX(col)", sql: "MAX", needsColumn: true, behaviour: "idempotent" },
  {
    id: "sum_distinct",
    label: "SUM(DISTINCT col)",
    sql: "SUM",
    needsColumn: true,
    behaviour: "value_dedupe",
  },
];

/** Guard rails so an absurd description cannot produce a meaningless answer. */
export const MAX_TABLES = 6;
export const MAX_AGGREGATES = 10;
/** Largest average multiplicity accepted; beyond this the join is not a join, it is a mistake. */
export const MAX_MULTIPLICITY = 10000;
/** Largest base row count accepted (1 trillion rows). */
export const MAX_BASE_ROWS = 1e12;
/** Largest number of demo rows parsed per inline table. */
export const MAX_DEMO_ROWS = 60;

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_$]*$/;
const TABLE_NAME = /^[A-Za-z_][A-Za-z0-9_$]*(\.[A-Za-z_][A-Za-z0-9_$]*)?$/;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value === "string" && value.trim() !== "") return Number(value.trim());
  return NaN;
};

/** Path from the root table down to `index`, as table indexes. */
function pathToRoot(tables, index) {
  const path = [];
  let cursor = index;
  while (cursor !== null && cursor !== undefined) {
    path.unshift(cursor);
    cursor = tables[cursor].parent;
  }
  return path;
}

function qualified(alias, column) {
  return `${alias}.${column}`;
}

/**
 * Analyse a described join: how many rows come out, how far each table's rows
 * are duplicated, and which aggregates that breaks.
 *
 * @param {object} input
 * @param {number} input.baseRows       Rows in the base (grain-defining) table.
 * @param {Array}  input.tables         [{ name, alias, joinKey, primaryKey, grain,
 *                                        parent, cardinality, multiplicity,
 *                                        joinType, unmatchedPct, nullKeyPct,
 *                                        whereOnRightTable }]
 *                                      tables[0] is the base and has parent null.
 * @param {Array}  input.aggregates     [{ fn, tableIndex, column }]
 * @returns {object} analysis or { error }
 */
export function analyzeJoinPlan({ baseRows, tables, aggregates } = {}) {
  if (!Array.isArray(tables) || tables.length === 0) {
    return { error: "Describe at least one table — the base table that defines your grain." };
  }
  if (tables.length > MAX_TABLES) {
    return { error: `More than ${MAX_TABLES} tables described. Analyse the joins in smaller groups.` };
  }
  const rows = toNumber(baseRows);
  if (!isFiniteNumber(rows) || rows <= 0) {
    return { error: "Base table row count must be a positive number." };
  }
  if (rows > MAX_BASE_ROWS) {
    return { error: "Base table row count above 1,000,000,000,000 — enter a realistic row count." };
  }

  const clean = [];
  for (let i = 0; i < tables.length; i += 1) {
    const table = tables[i] || {};
    const name = String(table.name ?? "").trim();
    const alias = String(table.alias ?? "").trim();
    const joinKey = String(table.joinKey ?? "").trim();
    const primaryKey = String(table.primaryKey ?? "").trim() || joinKey;
    if (!TABLE_NAME.test(name)) {
      return { error: `Table ${i + 1}: "${name || "(empty)"}" is not a valid table name.` };
    }
    if (!IDENTIFIER.test(alias)) {
      return { error: `Table "${name}": alias "${alias || "(empty)"}" is not a valid identifier.` };
    }
    if (!IDENTIFIER.test(joinKey)) {
      return { error: `Table "${name}": join key "${joinKey || "(empty)"}" is not a valid column name.` };
    }
    if (!IDENTIFIER.test(primaryKey)) {
      return { error: `Table "${name}": primary key "${primaryKey}" is not a valid column name.` };
    }
    if (clean.some((other) => other.alias === alias)) {
      return { error: `Alias "${alias}" is used twice — every table in a join needs its own alias.` };
    }

    if (i === 0) {
      clean.push({
        index: 0,
        name,
        alias,
        joinKey,
        primaryKey,
        grain: String(table.grain ?? "").trim(),
        parent: null,
        cardinality: "one_to_one",
        multiplicity: 1,
        joinType: "base",
        unmatchedPct: 0,
        nullKeyPct: 0,
        whereOnRightTable: false,
        actsAsInner: false,
      });
      continue;
    }

    const parent = Number(table.parent);
    if (!Number.isInteger(parent) || parent < 0 || parent >= i) {
      return {
        error: `Table "${name}": its parent must be a table listed above it, so the join tree has no cycle.`,
      };
    }
    const cardinality = CARDINALITIES.find((c) => c.id === table.cardinality);
    if (!cardinality) {
      return { error: `Table "${name}": pick a join key cardinality (1:1, 1:many or many:many).` };
    }
    let multiplicity =
      cardinality.fixedMultiplicity !== null
        ? cardinality.fixedMultiplicity
        : toNumber(table.multiplicity);
    if (!isFiniteNumber(multiplicity) || multiplicity <= 0) {
      return { error: `Table "${name}": average matching rows must be greater than zero.` };
    }
    if (multiplicity > MAX_MULTIPLICITY) {
      return {
        error: `Table "${name}": ${multiplicity} matching rows per parent row is beyond the ${MAX_MULTIPLICITY} limit.`,
      };
    }
    if (cardinality.fansOut && multiplicity < 1) {
      multiplicity = Number(multiplicity);
    }

    const joinType = table.joinType === "left" ? "left" : "inner";
    const unmatchedPct = toNumber(table.unmatchedPct ?? 0);
    const nullKeyPct = toNumber(table.nullKeyPct ?? 0);
    if (!isFiniteNumber(unmatchedPct) || unmatchedPct < 0 || unmatchedPct > 100) {
      return { error: `Table "${name}": unmatched parent rows must be between 0 and 100 per cent.` };
    }
    if (!isFiniteNumber(nullKeyPct) || nullKeyPct < 0 || nullKeyPct > 100) {
      return { error: `Table "${name}": null join keys must be between 0 and 100 per cent.` };
    }
    if (nullKeyPct > unmatchedPct) {
      return {
        error: `Table "${name}": null-key rows (${nullKeyPct}%) cannot exceed unmatched rows (${unmatchedPct}%) — a null key never matches, so it is always part of the unmatched share.`,
      };
    }
    const whereOnRightTable = Boolean(table.whereOnRightTable);

    clean.push({
      index: i,
      name,
      alias,
      joinKey,
      primaryKey,
      grain: String(table.grain ?? "").trim(),
      parent,
      cardinality: cardinality.id,
      multiplicity,
      joinType,
      unmatchedPct,
      nullKeyPct,
      whereOnRightTable,
      // R5: a LEFT JOIN filtered in WHERE behaves exactly like an INNER JOIN.
      actsAsInner: joinType === "inner" || (joinType === "left" && whereOnRightTable),
    });
  }

  const aggList = Array.isArray(aggregates) ? aggregates : [];
  if (aggList.length > MAX_AGGREGATES) {
    return { error: `More than ${MAX_AGGREGATES} aggregates listed. Check them in smaller batches.` };
  }
  const cleanAggs = [];
  for (let i = 0; i < aggList.length; i += 1) {
    const agg = aggList[i] || {};
    const fn = AGG_FUNCTIONS.find((f) => f.id === agg.fn);
    if (!fn) return { error: `Aggregate ${i + 1}: pick a function (SUM, COUNT, AVG, MIN, MAX).` };
    const tableIndex = Number(agg.tableIndex);
    if (!Number.isInteger(tableIndex) || tableIndex < 0 || tableIndex >= clean.length) {
      return { error: `Aggregate ${i + 1}: choose which table the column comes from.` };
    }
    const column = String(agg.column ?? "").trim();
    if (fn.needsColumn && !IDENTIFIER.test(column)) {
      return {
        error: `Aggregate ${i + 1} (${fn.label}): "${column || "(empty)"}" is not a valid column name.`,
      };
    }
    cleanAggs.push({ fn: fn.id, tableIndex, column: fn.needsColumn ? column : "*" });
  }

  // ---- R2: structural fan-out -------------------------------------------
  const totalMultiplier = clean.reduce((product, table) => product * table.multiplicity, 1);

  const perTable = clean.map((table) => {
    const path = pathToRoot(clean, table.index);
    const rowsPerBase = path.reduce((product, idx) => product * clean[idx].multiplicity, 1);
    const dupFactor = rowsPerBase === 0 ? 0 : totalMultiplier / rowsPerBase;
    return {
      index: table.index,
      name: table.name,
      alias: table.alias,
      grain: table.grain,
      joinType: table.joinType,
      cardinality: table.cardinality,
      multiplicity: table.multiplicity,
      rowsPerBase,
      rowsInResult: rows * rowsPerBase,
      dupFactor,
      duplicated: dupFactor > 1,
    };
  });

  // ---- row loss (R5, R6) -------------------------------------------------
  let survivalFactor = 1;
  let effectiveRowFactor = 1;
  for (const table of clean) {
    if (table.parent === null) continue;
    const matchRate = 1 - table.unmatchedPct / 100;
    if (table.actsAsInner) {
      survivalFactor *= matchRate;
      effectiveRowFactor *= matchRate * table.multiplicity;
    } else {
      // True LEFT OUTER: unmatched parent rows survive as one null-extended row.
      effectiveRowFactor *= matchRate * table.multiplicity + (1 - matchRate);
    }
  }
  const baseRowsSurviving = rows * survivalFactor;
  const baseRowsDropped = rows - baseRowsSurviving;
  const expectedJoinedRows = rows * effectiveRowFactor;

  // ---- R4: which aggregates break ---------------------------------------
  const aggregateVerdicts = cleanAggs.map((agg) => {
    const fn = AGG_FUNCTIONS.find((f) => f.id === agg.fn);
    const table = perTable[agg.tableIndex];
    // How many times each contributing row is repeated. COUNT(*) counts result
    // rows, so it is inflated by the whole join, not by one table's duplication.
    const rowDupFactor = agg.fn === "count_star" ? totalMultiplier : table.dupFactor;
    const expression =
      agg.fn === "count_star"
        ? "COUNT(*)"
        : agg.fn === "count_distinct"
          ? `COUNT(DISTINCT ${qualified(table.alias, agg.column)})`
          : agg.fn === "sum_distinct"
            ? `SUM(DISTINCT ${qualified(table.alias, agg.column)})`
            : `${fn.sql}(${qualified(table.alias, agg.column)})`;

    // resultFactor = reported value / true value. null means data-dependent.
    let resultFactor = 1;
    let status = "ok";
    let verdict = "";
    if (fn.behaviour === "idempotent") {
      resultFactor = 1;
      status = "ok";
      verdict =
        agg.fn === "count_distinct"
          ? "Correct. DISTINCT reduces the duplicated rows to a set before counting, so repetition cannot change it."
          : "Correct. Repeating a row cannot change the smallest or largest value in the group.";
    } else if (fn.behaviour === "value_dedupe") {
      resultFactor = null;
      status = "unsafe";
      verdict =
        "Not a fix. SUM(DISTINCT) removes duplicate VALUES, not duplicate rows — two source rows that happen to hold the same amount collapse into one, so the answer is data-dependent.";
    } else if (fn.behaviour === "weighted") {
      resultFactor = 1;
      status = rowDupFactor > 1 ? "distorted" : "ok";
      verdict =
        rowDupFactor > 1
          ? `Unchanged only while every row is repeated exactly ${formatFactorText(rowDupFactor)}. The moment the fan-out varies row to row this silently becomes a fan-out-weighted average.`
          : "Correct. This table's rows are not duplicated by the join.";
    } else {
      resultFactor = rowDupFactor;
      status = rowDupFactor > 1 ? "inflated" : "ok";
      verdict =
        rowDupFactor > 1
          ? `Inflated ${formatFactorText(rowDupFactor)} — every contributing row is counted ${formatFactorText(rowDupFactor)}.`
          : "Correct. This table's rows are not duplicated by the join.";
    }
    return {
      fn: agg.fn,
      label: fn.label,
      expression,
      tableIndex: agg.tableIndex,
      tableName: table.name,
      column: agg.column,
      rowDupFactor,
      resultFactor,
      status,
      verdict,
    };
  });

  // ---- warnings ----------------------------------------------------------
  const warnings = [];
  const fanning = perTable.filter((t) => t.index > 0 && t.multiplicity > 1);
  const branches = {};
  for (const table of clean) {
    if (table.parent === null) continue;
    if (table.multiplicity > 1) branches[table.parent] = (branches[table.parent] || 0) + 1;
  }
  for (const parentIndex of Object.keys(branches)) {
    if (branches[parentIndex] > 1) {
      warnings.push({
        id: `branch-${parentIndex}`,
        kind: "fanout",
        title: `${branches[parentIndex]} fanning joins hang off ${clean[Number(parentIndex)].name}`,
        detail:
          "Two independent 1:many children of the same parent are paired with each other, so their multiplicities multiply. That is the cartesian blow-up, not a key problem.",
      });
    }
  }
  for (const table of clean) {
    if (table.cardinality === "many_to_many") {
      warnings.push({
        id: `m2m-${table.index}`,
        kind: "fanout",
        title: `${table.name} is joined many:many`,
        detail:
          "A many:many key duplicates rows on BOTH sides. Every aggregate touching either side of this join is affected, not just the child.",
      });
    }
    if (table.joinType === "left" && table.whereOnRightTable) {
      warnings.push({
        id: `leftwhere-${table.index}`,
        kind: "silent_inner",
        title: `LEFT JOIN ${table.name} is filtered in WHERE — it is an INNER JOIN`,
        detail:
          "WHERE runs after the join (ISO/IEC 9075-2 §7.4). The null-extended rows make the predicate UNKNOWN and are discarded, so the outer join is undone. Moving the predicate into ON keeps it outer.",
      });
    }
    if (table.actsAsInner && table.unmatchedPct > 0) {
      warnings.push({
        id: `drop-${table.index}`,
        kind: "row_loss",
        title: `${formatPercentText(table.unmatchedPct)} of rows are dropped at the join to ${table.name}`,
        detail:
          "An inner join keeps only rows whose condition is True, so parent rows with no match disappear from the result entirely — the total is too LOW at the same time as the fan-out makes it too high.",
      });
    }
    if (table.nullKeyPct > 0) {
      warnings.push({
        id: `null-${table.index}`,
        kind: "null_key",
        title: `${formatPercentText(table.nullKeyPct)} of ${table.name} join keys are NULL`,
        detail:
          "NULL = NULL is UNKNOWN, not true (ISO/IEC 9075-2 §8.2), so those rows match nothing at all — including other NULL keys.",
      });
    }
  }

  const sql = buildJoinSql({ tables: clean, aggregates: cleanAggs, perTable });

  return {
    baseRows: rows,
    tableCount: clean.length,
    fanOutFactor: totalMultiplier,
    fanOutClean: totalMultiplier === 1,
    joinedRowsStructural: rows * totalMultiplier,
    expectedJoinedRows,
    baseRowsSurviving,
    baseRowsDropped,
    extraRows: expectedJoinedRows - rows,
    fanningJoinCount: fanning.length,
    perTable,
    aggregates: aggregateVerdicts,
    warnings,
    sql,
    assumptions: [
      "Every parent row is assumed to match the stated average number of rows (uniform fan-out).",
      "Match rates on different joins are assumed independent of each other.",
      "Row counts are expected values; a real query returns whole rows.",
    ],
  };
}

function formatFactorText(factor) {
  const rounded = Math.round(factor * 1000) / 1000;
  return `${rounded}x`;
}

function formatPercentText(pct) {
  const rounded = Math.round(pct * 100) / 100;
  return `${rounded}%`;
}

/**
 * Emit the naive query and the two corrected forms for a validated plan.
 * Exported so the corrected SQL can be regenerated on its own.
 * @returns {object} { naive, preAggregate, window, onClause }
 */
export function buildJoinSql({ tables, aggregates, perTable }) {
  const base = tables[0];
  const joinLine = (table) => {
    const parent = tables[table.parent];
    const keyword = table.joinType === "left" ? "LEFT JOIN" : "JOIN";
    return `${keyword} ${table.name} ${table.alias}\n  ON ${table.alias}.${table.joinKey} = ${parent.alias}.${parent.joinKey}`;
  };

  // Output aliases must be unique even if the same function, column and table
  // are listed twice.
  const usedNames = new Set();
  const outName = (agg) => {
    const table = tables[agg.tableIndex];
    const stem =
      agg.fn === "count_star"
        ? `${table.alias}_row_count`
        : `${table.alias}_${agg.column}_${agg.fn}`.toLowerCase();
    let name = stem;
    let suffix = 2;
    while (usedNames.has(name)) {
      name = `${stem}_${suffix}`;
      suffix += 1;
    }
    usedNames.add(name);
    return name;
  };
  const names = aggregates.map(outName);

  const selectItem = (agg, name) => {
    const table = tables[agg.tableIndex];
    if (agg.fn === "count_star") return `COUNT(*) AS ${name}`;
    const fn = AGG_FUNCTIONS.find((f) => f.id === agg.fn);
    const inner =
      agg.fn === "count_distinct" || agg.fn === "sum_distinct"
        ? `DISTINCT ${table.alias}.${agg.column}`
        : `${table.alias}.${agg.column}`;
    return `${fn.sql}(${inner}) AS ${name}`;
  };

  const joins = tables.slice(1).map(joinLine).join("\n");
  const selectList =
    aggregates.length > 0
      ? aggregates.map((agg, i) => `  ${selectItem(agg, names[i])}`).join(",\n")
      : "  COUNT(*) AS row_count";

  const grainNote = base.grain ? `not ${base.grain}` : `not one row per ${base.name} row`;
  const naive = `-- As written: one row per matched combination of every joined table,\n-- ${grainNote}.\nSELECT\n${selectList}\nFROM ${base.name} ${base.alias}\n${joins};`;

  // --- Fix 1: pre-aggregate each fanning child to the parent's grain -------
  // Only aggregates that COMPOSE through a per-key pre-aggregate are rewritten:
  // SUM->SUM(SUM), COUNT->SUM(COUNT), MIN->MIN(MIN), MAX->MAX(MAX),
  // AVG->SUM(SUM)/SUM(COUNT). COUNT(DISTINCT)/SUM(DISTINCT) do NOT compose,
  // because distinct values can repeat across different keys.
  const fanning = tables.filter((t) => t.parent !== null && perTable[t.index].multiplicity > 1);
  const composable = { sum: "SUM", count_col: "SUM", min: "MIN", max: "MAX", avg: "AVG" };
  let preAggregate;
  if (fanning.length === 0) {
    preAggregate = "-- No join in this plan fans out, so there is nothing to pre-aggregate.";
  } else {
    const derived = fanning
      .map((table) => {
        const parent = tables[table.parent];
        const cols = [`         COUNT(*) AS ${table.alias}_rows`];
        aggregates.forEach((agg, i) => {
          if (agg.tableIndex !== table.index || agg.fn === "count_star") return;
          if (!composable[agg.fn]) return;
          if (agg.fn === "avg") {
            cols.push(`         SUM(${agg.column}) AS ${names[i]}_sum`);
            cols.push(`         COUNT(${agg.column}) AS ${names[i]}_cnt`);
            return;
          }
          const inner = agg.fn === "count_col" ? `COUNT(${agg.column})` : `${AGG_FUNCTIONS.find((f) => f.id === agg.fn).sql}(${agg.column})`;
          cols.push(`         ${inner} AS ${names[i]}`);
        });
        return `LEFT JOIN (\n  SELECT ${table.joinKey},\n${cols.join(",\n")}\n  FROM ${table.name}\n  GROUP BY ${table.joinKey}\n) ${table.alias}\n  ON ${table.alias}.${table.joinKey} = ${parent.alias}.${parent.joinKey}`;
      })
      .join("\n");
    const nonFanning = tables
      .slice(1)
      .filter((t) => perTable[t.index].multiplicity <= 1)
      .map(joinLine)
      .join("\n");
    const outerParts = aggregates.map((agg, i) => {
      const table = tables[agg.tableIndex];
      const isFanning = fanning.some((f) => f.index === agg.tableIndex);
      if (!isFanning) return { text: `  ${selectItem(agg, names[i])}`, isComment: false };
      if (agg.fn === "count_star") {
        return { text: `  SUM(${table.alias}.${table.alias}_rows) AS ${names[i]}`, isComment: false };
      }
      if (agg.fn === "avg") {
        return {
          text: `  SUM(${table.alias}.${names[i]}_sum) / NULLIF(SUM(${table.alias}.${names[i]}_cnt), 0) AS ${names[i]}`,
          isComment: false,
        };
      }
      if (!composable[agg.fn]) {
        return {
          text: `  -- ${agg.fn === "count_distinct" ? "COUNT" : "SUM"}(DISTINCT ${table.alias}.${agg.column}) does not compose through a per-key\n  --   pre-aggregate: the same value can appear under different keys. COUNT(DISTINCT ...)\n  --   is fan-out safe, so keep it on the original join.`,
          isComment: true,
        };
      }
      return { text: `  ${composable[agg.fn]}(${table.alias}.${names[i]}) AS ${names[i]}`, isComment: false };
    });
    // Commas belong only between real select items; comment lines carry none.
    const realCount = outerParts.filter((part) => !part.isComment).length;
    let emitted = 0;
    const outer = outerParts
      .map((part) => {
        if (part.isComment) return part.text;
        emitted += 1;
        return emitted < realCount ? `${part.text},` : part.text;
      })
      .join("\n");
    preAggregate = `-- Fix 1: collapse each fanning table to one row per join key BEFORE joining,\n-- so every derived table is 1:1 with ${base.name} and nothing multiplies.\nSELECT\n${outer}\nFROM ${base.name} ${base.alias}\n${[nonFanning, derived].filter(Boolean).join("\n")};`;
  }

  // --- Fix 2: window de-duplication on each table's own primary key -------
  const usedTables = [];
  for (const agg of aggregates) {
    if (!usedTables.includes(agg.tableIndex)) usedTables.push(agg.tableIndex);
  }
  let windowSql;
  if (aggregates.length === 0) {
    windowSql = "-- Add at least one aggregate to generate the window de-duplication form.";
  } else {
    const rowNumbers = usedTables
      .map((index) => {
        const table = tables[index];
        return `    ROW_NUMBER() OVER (PARTITION BY ${table.alias}.${table.primaryKey}\n                       ORDER BY ${table.alias}.${table.primaryKey}) AS rn_${table.alias}`;
      })
      .join(",\n");
    const innerCols = [];
    for (const agg of aggregates) {
      if (agg.fn === "count_star") continue;
      const table = tables[agg.tableIndex];
      const col = `    ${table.alias}.${agg.column} AS ${`${table.alias}_${agg.column}`.toLowerCase()}`;
      if (!innerCols.includes(col)) innerCols.push(col);
    }
    const outerCols = aggregates
      .map((agg, i) => {
        const table = tables[agg.tableIndex];
        if (agg.fn === "count_star") {
          return `  COUNT(CASE WHEN rn_${table.alias} = 1 THEN 1 END) AS ${names[i]}`;
        }
        const fn = AGG_FUNCTIONS.find((f) => f.id === agg.fn);
        const src = `${table.alias}_${agg.column}`.toLowerCase();
        if (fn.behaviour === "idempotent") {
          return `  ${fn.sql}(${agg.fn === "count_distinct" ? "DISTINCT " : ""}${src}) AS ${names[i]}`;
        }
        if (agg.fn === "sum_distinct") {
          return `  SUM(CASE WHEN rn_${table.alias} = 1 THEN ${src} END) AS ${names[i]}  -- DISTINCT dropped: de-duplicating rows is what you meant`;
        }
        return `  ${fn.sql}(CASE WHEN rn_${table.alias} = 1 THEN ${src} END) AS ${names[i]}`;
      })
      .join(",\n");
    const innerBlock = innerCols.length > 0 ? `${innerCols.join(",\n")},\n` : "";
    windowSql = `-- Fix 2: keep the fanned-out rows, but let each source row contribute once.\n-- Aggregates other than COUNT(*) ignore NULLs (ISO/IEC 9075-2 §10.9),\n-- so the CASE that returns NULL on every repeat row removes the double count.\nSELECT\n${outerCols}\nFROM (\n  SELECT\n${innerBlock}${rowNumbers}\n  FROM ${base.name} ${base.alias}\n${joins.replace(/^/gm, "  ")}\n) d;`;
  }

  // --- Fix 3: only when a LEFT JOIN is filtered in WHERE -------------------
  const brokenOuter = tables.filter((t) => t.joinType === "left" && t.whereOnRightTable);
  const onClause =
    brokenOuter.length === 0
      ? null
      : `-- Fix 3: the predicate belongs in ON, not WHERE, or the LEFT JOIN is an INNER JOIN.\n${brokenOuter
          .map((table) => {
            const parent = tables[table.parent];
            return `LEFT JOIN ${table.name} ${table.alias}\n  ON ${table.alias}.${table.joinKey} = ${parent.alias}.${parent.joinKey}\n AND ${table.alias}.<your_predicate>   -- moved out of WHERE`;
          })
          .join("\n")}`;

  return { naive, preAggregate, window: windowSql, onClause };
}

/* ------------------------------------------------------------------ */
/* Worked numeric demo: orders -> order_items and orders -> payments   */
/* ------------------------------------------------------------------ */

/** Column layout of each editable demo table. */
export const DEMO_TABLE_SPECS = {
  orders: { columns: ["order_id", "order_total"], key: null },
  order_items: { columns: ["item_id", "order_id", "amount"], key: 1 },
  payments: { columns: ["payment_id", "order_id", "amount"], key: 1 },
};

/** Default demo rows. Chosen so the naive SUM lands on exactly 3x the true total. */
export const DEMO_DEFAULTS = {
  ordersText: "1001, 500\n1002, 300\n1003, 500",
  itemsText: "5001, 1001, 200\n5002, 1001, 150\n5003, 1001, 150\n5004, 1002, 300\n5005, 1003, 250\n5006, 1003, 150\n5007, 1003, 100",
  paymentsText: "9001, 1001, 500\n9002, 1002, 100\n9003, 1002, 100\n9004, 1002, 100\n9005, 1003, 500",
};

/**
 * Parse one inline demo table. Blank cells in a foreign-key column become NULL.
 * @returns {object} { rows } or { error }
 */
export function parseDemoTable(text, spec, tableName) {
  if (typeof text !== "string") return { error: `${tableName}: expected text rows.` };
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line !== "" && !line.startsWith("--"));
  if (lines.length === 0) return { error: `${tableName} is empty — add at least one row.` };
  if (lines.length > MAX_DEMO_ROWS) {
    return { error: `${tableName} has more than ${MAX_DEMO_ROWS} rows; trim it to keep the demo readable.` };
  }
  const rows = [];
  const seenIds = new Set();
  for (let i = 0; i < lines.length; i += 1) {
    const cells = lines[i].split(",").map((cell) => cell.trim());
    if (cells.length !== spec.columns.length) {
      return {
        error: `${tableName} row ${i + 1}: expected ${spec.columns.length} values (${spec.columns.join(", ")}), got ${cells.length}.`,
      };
    }
    const row = {};
    for (let c = 0; c < spec.columns.length; c += 1) {
      const column = spec.columns[c];
      const raw = cells[c];
      if (raw === "" || raw.toUpperCase() === "NULL") {
        if (c === spec.key) {
          row[column] = null;
          continue;
        }
        return { error: `${tableName} row ${i + 1}: ${column} cannot be blank.` };
      }
      const value = Number(raw);
      if (!Number.isFinite(value)) {
        return { error: `${tableName} row ${i + 1}: "${raw}" in ${column} is not a number.` };
      }
      if (c === 0 && !Number.isInteger(value)) {
        return { error: `${tableName} row ${i + 1}: ${column} must be a whole number.` };
      }
      if (c === 2 && Math.abs(value) > 1e12) {
        return { error: `${tableName} row ${i + 1}: amount is beyond the readable range for a demo.` };
      }
      row[column] = value;
    }
    const id = row[spec.columns[0]];
    if (seenIds.has(id)) {
      return { error: `${tableName}: ${spec.columns[0]} ${id} appears twice — a primary key must be unique.` };
    }
    seenIds.add(id);
    rows.push(row);
  }
  return { rows };
}

const sumOf = (rows, column) => rows.reduce((total, row) => total + row[column], 0);
const ratio = (naive, truth) => (truth === 0 ? null : naive / truth);

/**
 * Run the worked demo end to end on the given rows: the true totals, the totals
 * the naive three-way join reports, and the totals each fix reports.
 * @returns {object} demo result or { error }
 */
export function runFanOutDemo({ ordersText, itemsText, paymentsText } = {}) {
  const ordersParsed = parseDemoTable(ordersText, DEMO_TABLE_SPECS.orders, "orders");
  if (ordersParsed.error) return { error: ordersParsed.error };
  const itemsParsed = parseDemoTable(itemsText, DEMO_TABLE_SPECS.order_items, "order_items");
  if (itemsParsed.error) return { error: itemsParsed.error };
  const paymentsParsed = parseDemoTable(paymentsText, DEMO_TABLE_SPECS.payments, "payments");
  if (paymentsParsed.error) return { error: paymentsParsed.error };

  const orders = ordersParsed.rows;
  const items = itemsParsed.rows;
  const payments = paymentsParsed.rows;

  const trueOrderTotal = sumOf(orders, "order_total");
  const trueItemsAmount = sumOf(items, "amount");
  const truePaymentsAmount = sumOf(payments, "amount");

  const orderIds = new Set(orders.map((order) => order.order_id));
  const itemsByOrder = new Map();
  const paymentsByOrder = new Map();
  let orphanItems = 0;
  let orphanPayments = 0;
  let nullKeyItems = 0;
  let nullKeyPayments = 0;
  for (const item of items) {
    if (item.order_id === null) {
      nullKeyItems += 1;
      orphanItems += 1;
      continue;
    }
    if (!orderIds.has(item.order_id)) {
      orphanItems += 1;
      continue;
    }
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id).push(item);
  }
  for (const payment of payments) {
    if (payment.order_id === null) {
      nullKeyPayments += 1;
      orphanPayments += 1;
      continue;
    }
    if (!orderIds.has(payment.order_id)) {
      orphanPayments += 1;
      continue;
    }
    if (!paymentsByOrder.has(payment.order_id)) paymentsByOrder.set(payment.order_id, []);
    paymentsByOrder.get(payment.order_id).push(payment);
  }

  // R1/R2: the inner three-way join is the cross product of the two child sets.
  const joined = [];
  const droppedOrders = [];
  for (const order of orders) {
    const orderItems = itemsByOrder.get(order.order_id) || [];
    const orderPayments = paymentsByOrder.get(order.order_id) || [];
    if (orderItems.length === 0 || orderPayments.length === 0) {
      droppedOrders.push(order.order_id);
      continue;
    }
    for (const item of orderItems) {
      for (const payment of orderPayments) {
        joined.push({ order, item, payment });
      }
    }
  }

  const naiveOrderTotal = joined.reduce((total, row) => total + row.order.order_total, 0);
  const naiveItemsAmount = joined.reduce((total, row) => total + row.item.amount, 0);
  const naivePaymentsAmount = joined.reduce((total, row) => total + row.payment.amount, 0);
  const naiveCountStar = joined.length;
  const distinctOrderIds = new Set(joined.map((row) => row.order.order_id));
  const naiveCountDistinctOrders = distinctOrderIds.size;
  const naiveAvgOrderTotal = joined.length === 0 ? null : naiveOrderTotal / joined.length;
  const trueAvgOrderTotal = orders.length === 0 ? null : trueOrderTotal / orders.length;
  const distinctTotals = new Set(joined.map((row) => row.order.order_total));
  const naiveSumDistinctOrderTotal = [...distinctTotals].reduce((total, value) => total + value, 0);
  const naiveMinOrderTotal = joined.length === 0 ? null : Math.min(...joined.map((row) => row.order.order_total));
  const naiveMaxOrderTotal = joined.length === 0 ? null : Math.max(...joined.map((row) => row.order.order_total));
  const trueMinOrderTotal = orders.length === 0 ? null : Math.min(...orders.map((order) => order.order_total));
  const trueMaxOrderTotal = orders.length === 0 ? null : Math.max(...orders.map((order) => order.order_total));

  // Fix 1 — pre-aggregate each child to one row per order, then LEFT JOIN.
  let fixPreAggOrderTotal = 0;
  let fixPreAggItems = 0;
  let fixPreAggPayments = 0;
  for (const order of orders) {
    fixPreAggOrderTotal += order.order_total;
    fixPreAggItems += sumOf(itemsByOrder.get(order.order_id) || [], "amount");
    fixPreAggPayments += sumOf(paymentsByOrder.get(order.order_id) || [], "amount");
  }

  // Fix 2 — window de-duplication over the SAME fanned-out rowset.
  const seenOrders = new Set();
  const seenItems = new Set();
  const seenPayments = new Set();
  let fixWindowOrderTotal = 0;
  let fixWindowItems = 0;
  let fixWindowPayments = 0;
  for (const row of joined) {
    if (!seenOrders.has(row.order.order_id)) {
      seenOrders.add(row.order.order_id);
      fixWindowOrderTotal += row.order.order_total;
    }
    if (!seenItems.has(row.item.item_id)) {
      seenItems.add(row.item.item_id);
      fixWindowItems += row.item.amount;
    }
    if (!seenPayments.has(row.payment.payment_id)) {
      seenPayments.add(row.payment.payment_id);
      fixWindowPayments += row.payment.amount;
    }
  }

  const perOrder = orders.map((order) => {
    const itemCount = (itemsByOrder.get(order.order_id) || []).length;
    const paymentCount = (paymentsByOrder.get(order.order_id) || []).length;
    return {
      orderId: order.order_id,
      orderTotal: order.order_total,
      itemCount,
      paymentCount,
      joinedRows: itemCount * paymentCount,
      contribution: order.order_total * itemCount * paymentCount,
    };
  });

  return {
    counts: {
      orders: orders.length,
      items: items.length,
      payments: payments.length,
      joinedRows: joined.length,
      droppedOrders: droppedOrders.length,
      droppedOrderIds: droppedOrders,
      orphanItems,
      orphanPayments,
      nullKeyItems,
      nullKeyPayments,
    },
    truth: {
      orderTotal: trueOrderTotal,
      itemsAmount: trueItemsAmount,
      paymentsAmount: truePaymentsAmount,
      orderCount: orders.length,
      avgOrderTotal: trueAvgOrderTotal,
      minOrderTotal: trueMinOrderTotal,
      maxOrderTotal: trueMaxOrderTotal,
    },
    naive: {
      orderTotal: naiveOrderTotal,
      itemsAmount: naiveItemsAmount,
      paymentsAmount: naivePaymentsAmount,
      countStar: naiveCountStar,
      countDistinctOrders: naiveCountDistinctOrders,
      avgOrderTotal: naiveAvgOrderTotal,
      sumDistinctOrderTotal: naiveSumDistinctOrderTotal,
      minOrderTotal: naiveMinOrderTotal,
      maxOrderTotal: naiveMaxOrderTotal,
    },
    factors: {
      orderTotal: ratio(naiveOrderTotal, trueOrderTotal),
      itemsAmount: ratio(naiveItemsAmount, trueItemsAmount),
      paymentsAmount: ratio(naivePaymentsAmount, truePaymentsAmount),
      rows: ratio(naiveCountStar, orders.length),
    },
    deltas: {
      orderTotal: naiveOrderTotal - trueOrderTotal,
      itemsAmount: naiveItemsAmount - trueItemsAmount,
      paymentsAmount: naivePaymentsAmount - truePaymentsAmount,
      rows: naiveCountStar - orders.length,
      sumDistinctOrderTotal: naiveSumDistinctOrderTotal - trueOrderTotal,
    },
    fixPreAggregate: {
      orderTotal: fixPreAggOrderTotal,
      itemsAmount: fixPreAggItems,
      paymentsAmount: fixPreAggPayments,
      keepsUnmatchedOrders: true,
    },
    fixWindow: {
      orderTotal: fixWindowOrderTotal,
      itemsAmount: fixWindowItems,
      paymentsAmount: fixWindowPayments,
      keepsUnmatchedOrders: false,
    },
    perOrder,
    sql: DEMO_SQL,
  };
}

/** The three demo queries, fixed text so the page shows exactly what it computed. */
export const DEMO_SQL = {
  naive: `-- Naive: one row per (item x payment), not one row per order
SELECT
  SUM(o.order_total) AS order_total_sum,   -- double counted
  SUM(oi.amount)     AS items_amount_sum,  -- double counted
  SUM(p.amount)      AS payments_amount_sum,
  COUNT(*)           AS row_count,
  COUNT(DISTINCT o.order_id) AS order_count  -- this one survives
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN payments    p  ON p.order_id  = o.order_id;`,
  preAggregate: `-- Fix 1: pre-aggregate each child to one row per order_id,
-- so both derived tables are 1:1 with orders and nothing multiplies.
SELECT
  SUM(o.order_total)     AS order_total_sum,
  SUM(i.items_amount)    AS items_amount_sum,
  SUM(p.payments_amount) AS payments_amount_sum,
  COUNT(*)               AS order_count
FROM orders o
LEFT JOIN (
  SELECT order_id, SUM(amount) AS items_amount
  FROM order_items
  GROUP BY order_id
) i ON i.order_id = o.order_id
LEFT JOIN (
  SELECT order_id, SUM(amount) AS payments_amount
  FROM payments
  GROUP BY order_id
) p ON p.order_id = o.order_id;`,
  window: `-- Fix 2: keep the fanned-out rows, let each source row contribute once.
-- SUM ignores NULLs (ISO/IEC 9075-2 §10.9), so the CASE that returns NULL
-- on every repeat row removes the double count.
SELECT
  SUM(CASE WHEN rn_order   = 1 THEN order_total     END) AS order_total_sum,
  SUM(CASE WHEN rn_item    = 1 THEN item_amount     END) AS items_amount_sum,
  SUM(CASE WHEN rn_payment = 1 THEN payment_amount  END) AS payments_amount_sum
FROM (
  SELECT
    o.order_total,
    oi.amount AS item_amount,
    p.amount  AS payment_amount,
    ROW_NUMBER() OVER (PARTITION BY o.order_id   ORDER BY o.order_id)   AS rn_order,
    ROW_NUMBER() OVER (PARTITION BY oi.item_id   ORDER BY oi.item_id)   AS rn_item,
    ROW_NUMBER() OVER (PARTITION BY p.payment_id ORDER BY p.payment_id) AS rn_payment
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  JOIN payments    p  ON p.order_id  = o.order_id
) d;`,
};

/**
 * The four related traps, with the clause of the standard that produces each.
 * Static reference text, kept in lib so the UI holds no rules of its own.
 */
export const JOIN_TRAPS = [
  {
    id: "fanout",
    title: "Fan-out: the join multiplied your rows",
    symptom: "SUM is a clean multiple of the right answer; COUNT(*) is bigger than the table you started from.",
    cause:
      "A joined table is a filtered cross product (ISO/IEC 9075-2 §7.10). One parent row matching m child rows becomes m result rows, and two fanning children of the same parent multiply: m1 x m2.",
    fix: "Pre-aggregate each child to the parent's grain in a derived table, or de-duplicate with ROW_NUMBER over each table's own primary key.",
  },
  {
    id: "inner_drop",
    title: "INNER JOIN silently dropped rows",
    symptom: "The total is too low, and the row count went DOWN after adding a join.",
    cause:
      "An inner join keeps only rows for which the join condition is True (§7.10). Parent rows with no matching child vanish completely — no warning, no null row.",
    fix: "LEFT JOIN keeps the unmatched parent rows, null-extended. COUNT(*) before and after the join tells you how many were lost.",
  },
  {
    id: "left_where",
    title: "LEFT JOIN + WHERE on the right table = INNER JOIN",
    symptom: "You wrote LEFT JOIN, but rows with no match still disappeared.",
    cause:
      "WHERE is evaluated after the from clause (§7.4). The null-extended rows make any predicate on a right-table column UNKNOWN, and only True rows are kept, so the outer join is undone.",
    fix: "Move the predicate into the ON clause, or write it as (p.status = 'x' OR p.order_id IS NULL).",
  },
  {
    id: "null_key",
    title: "NULLs in the join key match nothing",
    symptom: "A slice of rows is missing and the key column looks fine at a glance.",
    cause:
      "Any comparison with NULL is Unknown, including NULL = NULL (§8.2). A row with a null key therefore never satisfies an equality join condition — not even against another null.",
    fix: "COUNT(*) WHERE key IS NULL on both sides before joining; use a sentinel value or an IS NOT DISTINCT FROM style predicate if nulls must match.",
  },
];
