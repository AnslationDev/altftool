const STORAGE_KEY = "mysql-visualization-tools-state";
const HISTORY_KEY = "mysql-visualization-tools-history";

const stripIdentifier = (value = "") =>
  value.trim().replace(/^[`"']|[`"']$/g, "");

const splitSqlStatements = (sql) => {
  const statements = [];
  let current = "";
  let quote = null;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const prev = sql[index - 1];

    if ((char === "'" || char === '"' || char === "`") && prev !== "\\") {
      quote = quote === char ? null : quote || char;
    }

    if (char === ";" && !quote) {
      if (current.trim()) statements.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
};

const splitDefinitions = (body) => {
  const parts = [];
  let current = "";
  let depth = 0;
  let quote = null;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    const prev = body[index - 1];

    if ((char === "'" || char === '"' || char === "`") && prev !== "\\") {
      quote = quote === char ? null : quote || char;
    }

    if (!quote) {
      if (char === "(") depth += 1;
      if (char === ")") depth -= 1;
    }

    if (char === "," && depth === 0 && !quote) {
      if (current.trim()) parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
};

const normalizeSql = (sql) =>
  sql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/#.*$/gm, "");

const parseKeyList = (definition) => {
  const match = definition.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1].split(",").map(stripIdentifier).filter(Boolean);
};

const createColumn = (definition) => {
  const match = definition.match(/^`?([A-Za-z_][\w$]*)`?\s+(.+)$/s);
  if (!match) return null;

  const [, name, rest] = match;
  const typeMatch = rest.match(/^([A-Za-z]+(?:\s*\([^)]*\))?(?:\s+unsigned)?)/i);
  const upper = rest.toUpperCase();

  return {
    name: stripIdentifier(name),
    type: typeMatch ? typeMatch[1].replace(/\s+/g, " ").trim() : "UNKNOWN",
    nullable: !upper.includes("NOT NULL"),
    primary: upper.includes("PRIMARY KEY"),
    unique: upper.includes("UNIQUE"),
    autoIncrement: upper.includes("AUTO_INCREMENT"),
    references: null,
    raw: definition,
  };
};

const parseReference = (definition) => {
  const ref = definition.match(
    /FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+`?([A-Za-z_][\w$]*)`?\s*\(([^)]+)\)/i
  );
  if (!ref) return null;

  return {
    columns: ref[1].split(",").map(stripIdentifier).filter(Boolean),
    targetTable: stripIdentifier(ref[2]),
    targetColumns: ref[3].split(",").map(stripIdentifier).filter(Boolean),
  };
};

const parseInlineReference = (definition) => {
  const ref = definition.match(
    /^`?([A-Za-z_][\w$]*)`?.*?\bREFERENCES\s+`?([A-Za-z_][\w$]*)`?\s*\(([^)]+)\)/i
  );
  if (!ref) return null;

  return {
    columns: [stripIdentifier(ref[1])],
    targetTable: stripIdentifier(ref[2]),
    targetColumns: ref[3].split(",").map(stripIdentifier).filter(Boolean),
  };
};

export const parseMySqlSchema = (sql = "") => {
  const cleaned = normalizeSql(sql);
  const warnings = [];
  const tables = [];
  const relationships = [];

  splitSqlStatements(cleaned).forEach((statement) => {
    const create = statement.match(
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([A-Za-z_][\w$]*)`?\s*\(([\s\S]*)\)\s*(?:ENGINE|DEFAULT|CHARSET|COLLATE|$)/i
    );

    if (!create) {
      if (statement.trim()) warnings.push("Only CREATE TABLE statements are visualized.");
      return;
    }

    const table = {
      name: stripIdentifier(create[1]),
      columns: [],
      primaryKeys: [],
      uniqueKeys: [],
      foreignKeys: [],
    };

    splitDefinitions(create[2]).forEach((definition) => {
      const upper = definition.toUpperCase();
      const tableReference = parseReference(definition);

      if (upper.startsWith("PRIMARY KEY")) {
        table.primaryKeys.push(...parseKeyList(definition));
        return;
      }

      if (upper.startsWith("UNIQUE") || upper.startsWith("CONSTRAINT")) {
        const keys = parseKeyList(definition);
        if (keys.length) table.uniqueKeys.push(...keys);
      }

      if (tableReference) {
        table.foreignKeys.push(tableReference);
        return;
      }

      if (upper.startsWith("KEY ") || upper.startsWith("INDEX ") || upper.startsWith("CONSTRAINT ")) {
        return;
      }

      const column = createColumn(definition);
      if (!column) return;

      const inlineReference = parseInlineReference(definition);
      if (inlineReference) {
        column.references = inlineReference;
        table.foreignKeys.push(inlineReference);
      }

      table.columns.push(column);
    });

    table.columns = table.columns.map((column) => ({
      ...column,
      primary: column.primary || table.primaryKeys.includes(column.name),
      unique: column.unique || table.uniqueKeys.includes(column.name),
    }));
    table.primaryKeys = [
      ...new Set([
        ...table.primaryKeys,
        ...table.columns.filter((column) => column.primary).map((column) => column.name),
      ]),
    ];

    tables.push(table);
  });

  const tableNames = new Set(tables.map((table) => table.name));

  tables.forEach((table) => {
    table.foreignKeys.forEach((key) => {
      key.columns.forEach((column, index) => {
        const targetColumn = key.targetColumns[index] || key.targetColumns[0] || "";
        relationships.push({
          id: `${table.name}.${column}->${key.targetTable}.${targetColumn}`,
          source: table.name,
          sourceColumn: column,
          target: key.targetTable,
          targetColumn,
          valid: tableNames.has(key.targetTable),
        });
      });
    });
  });

  relationships
    .filter((relationship) => !relationship.valid)
    .forEach((relationship) => {
      warnings.push(
        `${relationship.source}.${relationship.sourceColumn} references missing table ${relationship.target}.`
      );
    });

  return {
    tables,
    relationships,
    stats: {
      tables: tables.length,
      columns: tables.reduce((sum, table) => sum + table.columns.length, 0),
      relationships: relationships.length,
      primaryKeys: tables.reduce((sum, table) => sum + table.primaryKeys.length, 0),
    },
    warnings,
  };
};

export const buildDiagramElements = (schema, savedPositions = {}, queryAnalysis = {}) => {
  const activeTables = (queryAnalysis.referencedTables || []).map((name) => name.toLowerCase());
  const activeColumns = (queryAnalysis.selectedColumns || [])
    .flatMap((value) => value.replace(/[`;]/g, "").split(".").slice(-1))
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value && value !== "*");

  const nodes = schema.tables.map((table, index) => {
    const columnsHeight = Math.min(table.columns.length, 10) * 30;
    const fallback = {
      x: 40 + (index % 3) * 340,
      y: 40 + Math.floor(index / 3) * 300,
    };

    return {
      id: table.name,
      type: "tableNode",
      position: savedPositions[table.name] || fallback,
      data: {
        label: {
          table,
          active: activeTables.includes(table.name.toLowerCase()),
          activeColumns,
        },
      },
      style: {
        width: 280,
        minHeight: 86 + columnsHeight,
        border: "0",
        borderRadius: 18,
        background: "transparent",
        color: "#e5faff",
        boxShadow: "0 20px 50px rgba(8, 145, 178, 0.18)",
        overflow: "hidden",
      },
    };
  });

  const edges = schema.relationships
    .filter((relationship) => relationship.valid)
    .map((relationship) => ({
      id: relationship.id,
      source: relationship.source,
      target: relationship.target,
      label: `${relationship.sourceColumn} -> ${relationship.targetColumn}`,
      animated:
        activeTables.includes(relationship.source.toLowerCase()) ||
        activeTables.includes(relationship.target.toLowerCase()),
      type: "smoothstep",
      style: {
        stroke:
          activeTables.includes(relationship.source.toLowerCase()) &&
          activeTables.includes(relationship.target.toLowerCase())
            ? "#34d399"
            : "#22d3ee",
        strokeWidth: 2,
      },
      labelStyle: { fill: "#a7f3d0", fontSize: 11 },
      labelBgStyle: { fill: "rgba(2, 6, 23, 0.86)", fillOpacity: 0.9 },
    }));

  return { nodes, edges };
};

export const analyzeQuery = (query = "", schema) => {
  const tableNames = schema.tables.map((table) => table.name);
  const referencedTables = tableNames.filter((tableName) => {
    const escaped = tableName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(query);
  });

  const joinCount = (query.match(/\bJOIN\b/gi) || []).length;
  const selectedColumns = [...query.matchAll(/\bSELECT\s+([\s\S]*?)\s+FROM\b/gi)]
    .flatMap((match) => match[1].split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    referencedTables,
    joinCount,
    selectedColumns,
    hasWhere: /\bWHERE\b/i.test(query),
    hasGroup: /\bGROUP\s+BY\b/i.test(query),
    hasOrder: /\bORDER\s+BY\b/i.test(query),
  };
};

export const saveState = (state) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

export const saveHistoryItem = (sql, schema) => {
  if (typeof window === "undefined" || !sql.trim() || !schema.tables.length) return [];

  const item = {
    id: crypto.randomUUID(),
    name: schema.tables.map((table) => table.name).slice(0, 3).join(", "),
    sql,
    stats: schema.stats,
    createdAt: new Date().toISOString(),
  };

  const history = loadHistory().filter((entry) => entry.sql !== sql);
  const next = [item, ...history].slice(0, 8);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
};

export const loadHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
};
