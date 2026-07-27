/**
 * SQL WHERE clause builder.
 *
 * Operator set and precedence follow ISO/IEC 9075 (SQL standard) predicates:
 * comparison, LIKE, IN, BETWEEN and IS NULL. AND binds tighter than OR in
 * every SQL engine, which is why each OR group is wrapped in parentheses when
 * combined with others.
 *
 * Parameter marker styles:
 *  - "?"      JDBC / ODBC / SQLite / MySQL positional marker
 *  - "$n"     PostgreSQL numbered parameter ($1, $2, …)
 *  - ":name"  Oracle / SQLite / SQLAlchemy named parameter
 *  - "@name"  SQL Server / BigQuery named parameter
 *  - literal  values inlined with SQL-standard '' quote escaping
 */

export const OPERATORS = [
  { id: "eq", sql: "=", label: "= equals", arity: "one" },
  { id: "ne", sql: "<>", label: "<> not equal", arity: "one" },
  { id: "gt", sql: ">", label: "> greater than", arity: "one" },
  { id: "gte", sql: ">=", label: ">= at least", arity: "one" },
  { id: "lt", sql: "<", label: "< less than", arity: "one" },
  { id: "lte", sql: "<=", label: "<= at most", arity: "one" },
  { id: "like", sql: "LIKE", label: "LIKE pattern", arity: "one" },
  { id: "nlike", sql: "NOT LIKE", label: "NOT LIKE pattern", arity: "one" },
  { id: "in", sql: "IN", label: "IN list", arity: "list" },
  { id: "nin", sql: "NOT IN", label: "NOT IN list", arity: "list" },
  { id: "between", sql: "BETWEEN", label: "BETWEEN two values", arity: "two" },
  { id: "nbetween", sql: "NOT BETWEEN", label: "NOT BETWEEN two values", arity: "two" },
  { id: "isnull", sql: "IS NULL", label: "IS NULL", arity: "none" },
  { id: "notnull", sql: "IS NOT NULL", label: "IS NOT NULL", arity: "none" },
];

export const PARAM_STYLES = [
  { id: "literal", label: "Inline literals ('value')" },
  { id: "qmark", label: "? — JDBC / SQLite / MySQL" },
  { id: "dollar", label: "$1, $2 — PostgreSQL" },
  { id: "named", label: ":name — Oracle / SQLAlchemy" },
  { id: "at", label: "@name — SQL Server / BigQuery" },
];

export const VALUE_TYPES = [
  { id: "text", label: "Text" },
  { id: "number", label: "Number" },
  { id: "column", label: "Column / raw SQL" },
];

/**
 * Column names may be plain identifiers, dotted paths (t.col) or already
 * quoted. Anything else is rejected rather than silently emitted.
 */
const FIELD_RE = /^(?:[A-Za-z_][A-Za-z0-9_$]*|"[^"]+"|`[^`]+`|\[[^\]]+\])(?:\.(?:[A-Za-z_][A-Za-z0-9_$]*|"[^"]+"|`[^`]+`|\[[^\]]+\]))*$/;

const NUMBER_RE = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

/** Escape a text value as a SQL string literal ('' escapes a quote — ISO 9075). */
export function sqlStringLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Derive a safe named-parameter base from a column name. */
function paramBase(field) {
  const base = field.replace(/[^A-Za-z0-9_]/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
  return base === "" ? "param" : base;
}

/**
 * Build a WHERE clause from condition groups.
 *
 * @param {object} input
 * @param {Array<{combinator:"AND"|"OR", conditions:Array<{field:string, operator:string, value:string, value2:string, valueType:string}>}>} input.groups
 * @param {"AND"|"OR"} input.groupCombinator  how the groups join together
 * @param {string} input.paramStyle           one of PARAM_STYLES ids
 * @returns {{clause:string, params:Array<{name:string,value:string}>, conditionCount:number}|{error:string}}
 */
export function buildWhereClause({ groups, groupCombinator = "AND", paramStyle = "literal" }) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return { error: "Add at least one condition group." };
  }
  if (groupCombinator !== "AND" && groupCombinator !== "OR") {
    return { error: "Groups can only be joined with AND or OR." };
  }
  if (!PARAM_STYLES.some((style) => style.id === paramStyle)) {
    return { error: "Choose a parameter style." };
  }

  const params = [];
  const usedNames = new Map();

  const nextPlaceholder = (field, value) => {
    if (paramStyle === "literal") return null;
    if (paramStyle === "qmark") {
      params.push({ name: `?${params.length + 1}`, value });
      return "?";
    }
    if (paramStyle === "dollar") {
      const name = `$${params.length + 1}`;
      params.push({ name, value });
      return name;
    }
    const sigil = paramStyle === "named" ? ":" : "@";
    const base = paramBase(field);
    const count = (usedNames.get(base) ?? 0) + 1;
    usedNames.set(base, count);
    const name = `${sigil}${base}${count > 1 ? `_${count}` : ""}`;
    params.push({ name, value });
    return name;
  };

  const renderValue = (condition, raw, position) => {
    const value = String(raw ?? "").trim();
    if (value === "") {
      return { error: `Condition on "${condition.field}" is missing ${position}.` };
    }
    if (condition.valueType === "column") {
      if (!FIELD_RE.test(value)) {
        return { error: `"${value}" is not a valid column reference.` };
      }
      return { text: value };
    }
    if (condition.valueType === "number" && !NUMBER_RE.test(value)) {
      return { error: `"${value}" is not a valid number for "${condition.field}".` };
    }
    const placeholder = nextPlaceholder(condition.field, value);
    if (placeholder) return { text: placeholder };
    return { text: condition.valueType === "number" ? value : sqlStringLiteral(value) };
  };

  const groupSql = [];
  let conditionCount = 0;

  for (const group of groups) {
    const conditions = Array.isArray(group.conditions) ? group.conditions : [];
    const parts = [];
    for (const condition of conditions) {
      const field = String(condition.field ?? "").trim();
      if (field === "") continue; // blank rows are simply skipped
      if (!FIELD_RE.test(field)) {
        return {
          error: `"${field}" is not a valid column name. Use letters, digits, _, dots, or quote it.`,
        };
      }
      const operator = OPERATORS.find((op) => op.id === condition.operator);
      if (!operator) return { error: `Unknown operator on "${field}".` };

      if (operator.arity === "none") {
        parts.push(`${field} ${operator.sql}`);
      } else if (operator.arity === "one") {
        const rendered = renderValue(condition, condition.value, "a value");
        if (rendered.error) return { error: rendered.error };
        parts.push(`${field} ${operator.sql} ${rendered.text}`);
      } else if (operator.arity === "two") {
        const low = renderValue(condition, condition.value, "the low value");
        if (low.error) return { error: low.error };
        const high = renderValue(condition, condition.value2, "the high value");
        if (high.error) return { error: high.error };
        parts.push(`${field} ${operator.sql} ${low.text} AND ${high.text}`);
      } else {
        const items = String(condition.value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        if (items.length === 0) {
          return { error: `IN list on "${field}" needs at least one comma-separated value.` };
        }
        const renderedItems = [];
        for (const item of items) {
          const rendered = renderValue(condition, item, "a value");
          if (rendered.error) return { error: rendered.error };
          renderedItems.push(rendered.text);
        }
        parts.push(`${field} ${operator.sql} (${renderedItems.join(", ")})`);
      }
      conditionCount += 1;
    }
    if (parts.length > 0) {
      groupSql.push({ text: parts.join(` ${group.combinator === "OR" ? "OR" : "AND"} `), size: parts.length });
    }
  }

  if (conditionCount === 0) {
    return { error: "Fill in at least one condition (column name plus a value)." };
  }

  // Parenthesise multi-condition groups whenever more than one group exists —
  // AND binds tighter than OR (ISO 9075), so this keeps the intended grouping.
  const clause = groupSql
    .map((group) => (groupSql.length > 1 && group.size > 1 ? `(${group.text})` : group.text))
    .join(`\n${groupCombinator} `);

  return { clause: `WHERE ${clause}`, params, conditionCount };
}
