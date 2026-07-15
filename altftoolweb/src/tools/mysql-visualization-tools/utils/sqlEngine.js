const clean = (value = "") => value.replace(/[`;]/g, "").trim();

export const formatSql = (query = "") =>
  query
    .replace(/\s+/g, " ")
    .replace(/\b(select|from|where|join|on|group by|order by|limit)\b/gi, "\n$1")
    .replace(/^\n/, "")
    .replace(/\b(select|from|where|join|on|group by|order by|limit|count|sum|avg|min|max)\b/gi, (value) => value.toUpperCase())
    .replace(/\s*,\s*/g, ", ")
    .trim()
    .concat(query.trim().endsWith(";") ? "" : ";");

const compare = (left, op, right) => {
  const l = Number.isNaN(Number(left)) ? `${left}` : Number(left);
  const r = Number.isNaN(Number(right)) ? right : Number(right);
  if (op === "=") return l == r;
  if (op === "!=" || op === "<>") return l != r;
  if (op === ">") return l > r;
  if (op === "<") return l < r;
  if (op === ">=") return l >= r;
  if (op === "<=") return l <= r;
  if (op.toUpperCase() === "LIKE") return `${l}`.toLowerCase().includes(`${right}`.replace(/%/g, "").toLowerCase());
  return false;
};

const valueOf = (row, key) => row[clean(key).toLowerCase()] ?? row[clean(key).split(".").pop().toLowerCase()];

const parseLiteral = (value) => clean(value).replace(/^['"]|['"]$/g, "");

export const executeSql = (query, workspaceTables) => {
  const sql = query.trim();
  if (!sql) return { columns: [], rows: [], error: "", meta: "Write a SELECT query to run it." };
  if (!/^select\b/i.test(sql)) return { columns: [], rows: [], error: "Only SELECT queries are supported in the browser engine." };

  const fromMatch = sql.match(/\bFROM\s+`?([A-Za-z_][\w$]*)`?/i);
  const selectMatch = sql.match(/\bSELECT\s+([\s\S]*?)\s+FROM\b/i);
  if (!fromMatch || !selectMatch) return { columns: [], rows: [], error: "Add SELECT columns and a FROM table." };

  const byName = Object.fromEntries(workspaceTables.map((table) => [table.name.toLowerCase(), table]));
  const baseTable = byName[fromMatch[1].toLowerCase()];
  if (!baseTable) return { columns: [], rows: [], error: `Table "${fromMatch[1]}" was not found.` };

  let rows = baseTable.rows.map((row) => {
    const out = {};
    Object.entries(row).forEach(([key, value]) => {
      out[key.toLowerCase()] = value;
      out[`${baseTable.name.toLowerCase()}.${key.toLowerCase()}`] = value;
    });
    return out;
  });

  const joins = [...sql.matchAll(/\bJOIN\s+`?([A-Za-z_][\w$]*)`?\s+ON\s+([A-Za-z_][\w$.]*)\s*=\s*([A-Za-z_][\w$.]*)/gi)];
  for (const join of joins) {
    const joinTable = byName[join[1].toLowerCase()];
    if (!joinTable) return { columns: [], rows: [], error: `Joined table "${join[1]}" was not found.` };
    rows = rows.flatMap((left) =>
      joinTable.rows
        .map((rightRow) => {
          const right = { ...left };
          Object.entries(rightRow).forEach(([key, value]) => {
            right[`${joinTable.name.toLowerCase()}.${key.toLowerCase()}`] = value;
            if (right[key.toLowerCase()] === undefined) right[key.toLowerCase()] = value;
          });
          return right;
        })
        .filter((combined) => valueOf(combined, join[2]) == valueOf(combined, join[3]))
    );
  }

  const whereMatch = sql.match(/\bWHERE\s+(.+?)(?:\bGROUP\s+BY\b|\bORDER\s+BY\b|\bLIMIT\b|;|$)/i);
  if (whereMatch) {
    const condition = whereMatch[1].match(/([A-Za-z_][\w$.]*)\s*(=|!=|<>|>=|<=|>|<|LIKE)\s*('[^']*'|"[^"]*"|[\w.-]+)/i);
    if (!condition) return { columns: [], rows: [], error: "The WHERE clause is not supported yet. Use one basic comparison." };
    rows = rows.filter((row) => compare(valueOf(row, condition[1]), condition[2], parseLiteral(condition[3])));
  }

  const selectParts = selectMatch[1].split(",").map((part) => part.trim()).filter(Boolean);
  const groupMatch = sql.match(/\bGROUP\s+BY\s+([A-Za-z_][\w$.]*)/i);
  const aggregate = selectParts.find((part) => /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(part));

  if (groupMatch || aggregate) {
    const groupKey = groupMatch ? clean(groupMatch[1]).toLowerCase() : "__all";
    const groups = new Map();
    rows.forEach((row) => {
      const key = groupKey === "__all" ? "all" : valueOf(row, groupKey);
      groups.set(key, [...(groups.get(key) || []), row]);
    });
    rows = [...groups.entries()].map(([key, groupRows]) => {
      const out = {};
      if (groupKey !== "__all") out[groupKey.split(".").pop()] = key;
      selectParts.forEach((part) => {
        const agg = part.match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(([^)]*)\)(?:\s+AS\s+([A-Za-z_][\w$]*))?/i);
        if (!agg) return;
        const label = (agg[3] || `${agg[1].toLowerCase()}_${clean(agg[2]).replace("*", "all").split(".").pop()}`).toLowerCase();
        const values = groupRows.map((row) => Number(valueOf(row, agg[2]))).filter((value) => !Number.isNaN(value));
        if (agg[1].toUpperCase() === "COUNT") out[label] = groupRows.length;
        if (agg[1].toUpperCase() === "SUM") out[label] = values.reduce((sum, value) => sum + value, 0);
        if (agg[1].toUpperCase() === "AVG") out[label] = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
        if (agg[1].toUpperCase() === "MIN") out[label] = Math.min(...values);
        if (agg[1].toUpperCase() === "MAX") out[label] = Math.max(...values);
      });
      return out;
    });
  } else if (!(selectParts.length === 1 && selectParts[0] === "*")) {
    rows = rows.map((row) =>
      Object.fromEntries(selectParts.map((part) => {
        const [expr, alias] = part.split(/\s+AS\s+/i);
        const key = clean(expr).split(".").pop().toLowerCase();
        return [clean(alias || key), valueOf(row, expr)];
      }))
    );
  } else {
    rows = rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => !key.includes("."))));
  }

  const orderMatch = sql.match(/\bORDER\s+BY\s+([A-Za-z_][\w$.]*)(?:\s+(ASC|DESC))?/i);
  if (orderMatch) {
    const key = clean(orderMatch[1]).split(".").pop().toLowerCase();
    const dir = /DESC/i.test(orderMatch[2] || "") ? -1 : 1;
    rows = [...rows].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
  }

  const limitMatch = sql.match(/\bLIMIT\s+(\d+)/i);
  if (limitMatch) rows = rows.slice(0, Number(limitMatch[1]));

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return { columns, rows, error: "", meta: `${rows.length} row(s) returned.` };
};
