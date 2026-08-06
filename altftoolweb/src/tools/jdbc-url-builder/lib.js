/**
 * JDBC URL Builder.
 *
 * Every URL shape, default port, driver class and Maven coordinate below is taken from the
 * vendor's own JDBC documentation:
 *
 *  - PostgreSQL JDBC Driver, "Connecting to the Database":
 *      jdbc:postgresql://host:port/database  — query parameters after ?, & separated.
 *  - MySQL Connector/J 8.x reference, "JDBC URL Format":
 *      jdbc:mysql://host:port/database  — class name moved to com.mysql.cj.jdbc.Driver in 8.0.
 *  - Oracle JDBC developer's guide, "Data Sources and URLs" (thin driver):
 *      jdbc:oracle:thin:@//host:port/service_name   (service naming, recommended)
 *      jdbc:oracle:thin:@host:port:SID              (legacy SID naming)
 *  - Microsoft JDBC Driver for SQL Server, "Building the connection URL":
 *      jdbc:sqlserver://host:port;property=value;   — semicolon separated, and a named
 *      instance is written host\\instance with no port.
 *  - H2 database "Cheat Sheet" / Features: jdbc:h2:mem:, jdbc:h2:file:, jdbc:h2:tcp://.
 *  - Xerial sqlite-jdbc README: jdbc:sqlite:<file path> and jdbc:sqlite::memory:.
 *
 * Pure module — no React, no DOM, no clock reads.
 */

/** TCP port range from RFC 6335; port 0 is reserved and never listened on. */
export const MIN_PORT = 1;
export const MAX_PORT = 65535;

/** Separator style used for connection properties in each URL grammar. */
export const PARAM_STYLES = {
  query: "query", // ?a=b&c=d      — PostgreSQL, MySQL, SQLite (Xerial)
  semicolon: "semicolon", // ;a=b;c=d      — SQL Server, H2
  none: "none", // properties are passed through java.util.Properties instead — Oracle thin
};

export const DATABASES = [
  {
    id: "postgresql",
    label: "PostgreSQL",
    defaultPort: 5432,
    driverClass: "org.postgresql.Driver",
    maven: "org.postgresql:postgresql:42.7.4",
    paramStyle: PARAM_STYLES.query,
    needsHost: true,
    needsDatabase: true,
    tlsParams: [["sslmode", "require"]],
    defaultDatabase: "postgres",
    note: "The driver reads user and password from the properties object; putting them in the URL as ?user=&password= also works but leaks credentials into logs.",
  },
  {
    id: "mysql",
    label: "MySQL",
    defaultPort: 3306,
    driverClass: "com.mysql.cj.jdbc.Driver",
    maven: "com.mysql:mysql-connector-j:9.1.0",
    paramStyle: PARAM_STYLES.query,
    needsHost: true,
    needsDatabase: true,
    tlsParams: [["sslMode", "REQUIRED"]],
    defaultDatabase: "app",
    note: "Connector/J 8 renamed the driver class to com.mysql.cj.jdbc.Driver. The old com.mysql.jdbc.Driver still loads but logs a deprecation warning.",
  },
  {
    id: "oracle",
    label: "Oracle (thin driver)",
    defaultPort: 1521,
    driverClass: "oracle.jdbc.OracleDriver",
    maven: "com.oracle.database.jdbc:ojdbc11:23.5.0.24.07",
    paramStyle: PARAM_STYLES.none,
    needsHost: true,
    needsDatabase: true,
    defaultDatabase: "ORCLPDB1",
    note: "Service naming (@//host:port/service) is the supported form; SID naming (@host:port:SID) is legacy and only works where the SID is still registered.",
  },
  {
    id: "sqlserver",
    label: "Microsoft SQL Server",
    defaultPort: 1433,
    driverClass: "com.microsoft.sqlserver.jdbc.SQLServerDriver",
    maven: "com.microsoft.sqlserver:mssql-jdbc:12.8.1.jre11",
    paramStyle: PARAM_STYLES.semicolon,
    needsHost: true,
    needsDatabase: true,
    tlsParams: [
      ["encrypt", "true"],
      ["trustServerCertificate", "false"],
    ],
    defaultDatabase: "master",
    note: "From mssql-jdbc 10.2 encrypt defaults to true, so an unencrypted server now fails to connect unless you set encrypt=false explicitly.",
  },
  {
    id: "h2",
    label: "H2",
    defaultPort: 9092,
    driverClass: "org.h2.Driver",
    maven: "com.h2database:h2:2.3.232",
    paramStyle: PARAM_STYLES.semicolon,
    needsHost: false,
    needsDatabase: true,
    defaultDatabase: "testdb",
    note: "In embedded modes the database name is a path, not a host. An in-memory database is dropped when the last connection closes unless DB_CLOSE_DELAY=-1 is set.",
  },
  {
    id: "sqlite",
    label: "SQLite",
    defaultPort: null,
    driverClass: "org.sqlite.JDBC",
    maven: "org.xerial:sqlite-jdbc:3.47.0.0",
    paramStyle: PARAM_STYLES.query,
    needsHost: false,
    needsDatabase: true,
    defaultDatabase: "/var/data/app.db",
    note: "SQLite is a file, not a server — there is no host, port, user or password. Use an absolute path so the database does not follow the working directory.",
  },
];

/** Oracle naming styles. */
export const ORACLE_STYLES = [
  { id: "service", label: "Service name (@//host:port/service)" },
  { id: "sid", label: "SID (legacy, @host:port:SID)" },
];

/** H2 connection modes. */
export const H2_MODES = [
  { id: "mem", label: "In-memory (jdbc:h2:mem:)" },
  { id: "file", label: "Embedded file (jdbc:h2:file:)" },
  { id: "tcp", label: "Server mode (jdbc:h2:tcp://)" },
];

/** SQLite storage modes. */
export const SQLITE_MODES = [
  { id: "file", label: "File on disk" },
  { id: "memory", label: "In-memory (:memory:)" },
];

/** Characters that terminate a value in one of the grammars and cannot appear raw. */
const UNSAFE_QUERY = /[?&#\s]/;
const UNSAFE_SEMICOLON = /[;\s]/;

const findDatabase = (id) => DATABASES.find((entry) => entry.id === id) || null;

const clean = (value) => String(value ?? "").trim();

function validatePort(rawPort, db) {
  if (db.defaultPort === null) return { port: null };
  const text = clean(rawPort);
  if (text === "") return { port: db.defaultPort, defaulted: true };
  if (!/^\d+$/.test(text)) return { error: "Port must be a whole number." };
  const port = Number(text);
  if (port < MIN_PORT || port > MAX_PORT) {
    return { error: `Port must be between ${MIN_PORT} and ${MAX_PORT}.` };
  }
  return { port };
}

/** Render a property list in the grammar the driver expects. */
function renderParams(params, style) {
  if (!params.length) return "";
  if (style === PARAM_STYLES.query) {
    return `?${params.map(([key, value]) => `${key}=${value}`).join("&")}`;
  }
  if (style === PARAM_STYLES.semicolon) {
    return `;${params.map(([key, value]) => `${key}=${value}`).join(";")}`;
  }
  return "";
}

/**
 * Build a JDBC URL plus the driver class, build-file coordinate and a DriverManager snippet.
 *
 * @param {object} input
 * @param {string} input.dbId          One of DATABASES[].id
 * @param {string} [input.host]
 * @param {string} [input.port]        Blank uses the vendor default port.
 * @param {string} [input.database]    Database / service name / SID / file path.
 * @param {string} [input.user]
 * @param {boolean} [input.tls]        Add the vendor's TLS properties.
 * @param {string} [input.oracleStyle] "service" | "sid"
 * @param {string} [input.h2Mode]      "mem" | "file" | "tcp"
 * @param {string} [input.sqliteMode]  "file" | "memory"
 * @param {string} [input.instance]    SQL Server named instance (used instead of a port).
 * @param {Array<[string,string]>} [input.extraParams]
 * @returns {object} { url, driverClass, maven, gradle, snippet, params, warnings, db } or { error }
 */
export function buildJdbcUrl({
  dbId,
  host = "",
  port = "",
  database = "",
  user = "",
  tls = false,
  oracleStyle = "service",
  h2Mode = "mem",
  sqliteMode = "file",
  instance = "",
  extraParams = [],
} = {}) {
  const db = findDatabase(dbId);
  if (!db) return { error: "Pick a database engine from the list." };

  const hostName = clean(host);
  const dbName = clean(database);
  const userName = clean(user);
  const instanceName = clean(instance);
  const warnings = [];

  const usesHost =
    db.needsHost || (db.id === "h2" && h2Mode === "tcp");

  if (usesHost && !hostName) return { error: "Enter a host name or IP address." };
  // A colon in the host is almost always a "host:port" habit — the template already places a
  // colon and the Port field right after hostName, so keeping it here would double it up
  // (host:port:port) instead of doing what the user meant.
  if (hostName && hostName.includes(":")) {
    return {
      error: "Host must not include a port — put the port number in the Port field instead of writing \"host:port\" here.",
    };
  }
  // A slash or backslash in the authority would be read as the start of the path (or, on
  // SQL Server, as an instance name), so they are rejected here rather than silently kept.
  if (hostName && /[\s/\\]/.test(hostName)) {
    return { error: "Host must not contain spaces or slashes. Put a named instance in its own field." };
  }

  const useInstance = db.id === "sqlserver" && instanceName !== "";
  if (useInstance && /[\s\\/]/.test(instanceName)) {
    return { error: "Instance name must not contain spaces or slashes." };
  }

  const portResult = usesHost && !useInstance ? validatePort(port, db) : { port: null };
  if (portResult.error) return { error: portResult.error };
  const resolvedPort = portResult.port;

  const needsName = db.needsDatabase && !(db.id === "sqlite" && sqliteMode === "memory");
  if (needsName && !dbName) {
    if (db.id === "oracle") {
      return {
        error: oracleStyle === "sid" ? "Enter the Oracle SID." : "Enter the Oracle service name.",
      };
    }
    if (db.id === "sqlite") return { error: "Enter the path to the SQLite file." };
    return { error: "Enter the database name." };
  }
  if (dbName) {
    // The database name is spliced straight into the URL ahead of the connection-parameter
    // block, so a stray grammar character in it can silently defeat or inject connection
    // properties (e.g. sslmode=require) the same way an unchecked extraParams entry could —
    // apply the same per-grammar checks used for extraParams below.
    if (db.paramStyle === PARAM_STYLES.query && UNSAFE_QUERY.test(dbName)) {
      return {
        error:
          'Database name must not contain spaces, ?, & or # — a "?" starts the query-string parameters in this URL grammar, so it would silently split off or override connection properties such as sslmode=require.',
      };
    }
    if (db.paramStyle === PARAM_STYLES.semicolon && UNSAFE_SEMICOLON.test(dbName)) {
      return {
        error:
          'Database name must not contain spaces or ; — a ";" starts a new connection property in this URL grammar, so it could silently inject or override one (including encrypt/trustServerCertificate).',
      };
    }
    if (db.paramStyle === PARAM_STYLES.none && /\s/.test(dbName)) {
      return { error: "Database name must not contain spaces — quote it in SQL instead." };
    }
  }

  // Assemble the connection properties.
  const params = [];
  if (tls && Array.isArray(db.tlsParams)) params.push(...db.tlsParams.map((pair) => [...pair]));
  if (userName) {
    if (db.id === "postgresql" || db.id === "mysql") {
      params.push(["user", userName]);
    } else if (db.id === "sqlserver") {
      params.push(["user", userName]);
    } else {
      warnings.push(
        `${db.label} does not take a user name in the URL — pass it to DriverManager.getConnection(url, user, password).`,
      );
    }
  }
  for (const entry of Array.isArray(extraParams) ? extraParams : []) {
    const key = clean(entry?.[0]);
    const value = clean(entry?.[1]);
    if (!key) continue;
    if (db.paramStyle === PARAM_STYLES.none) {
      warnings.push(
        "The Oracle thin URL carries no query parameters — set them on a java.util.Properties object instead.",
      );
      break;
    }
    const unsafe = db.paramStyle === PARAM_STYLES.query ? UNSAFE_QUERY : UNSAFE_SEMICOLON;
    if (unsafe.test(key) || unsafe.test(value)) {
      return {
        error: `Parameter "${key}" contains a character that ends a value in this URL grammar. Remove spaces and separators.`,
      };
    }
    params.push([key, value]);
  }

  // Assemble the URL.
  let url = "";
  if (db.id === "postgresql") {
    url = `jdbc:postgresql://${hostName}:${resolvedPort}/${dbName}${renderParams(params, db.paramStyle)}`;
  } else if (db.id === "mysql") {
    url = `jdbc:mysql://${hostName}:${resolvedPort}/${dbName}${renderParams(params, db.paramStyle)}`;
  } else if (db.id === "oracle") {
    url =
      oracleStyle === "sid"
        ? `jdbc:oracle:thin:@${hostName}:${resolvedPort}:${dbName}`
        : `jdbc:oracle:thin:@//${hostName}:${resolvedPort}/${dbName}`;
    if (oracleStyle === "sid") {
      warnings.push(
        "SID naming is legacy. Oracle 12c and later register services, so @//host:port/service is the form that keeps working after a pluggable-database move.",
      );
    }
  } else if (db.id === "sqlserver") {
    const authority = useInstance ? `${hostName}\\${instanceName}` : `${hostName}:${resolvedPort}`;
    const allParams = [["databaseName", dbName], ...params];
    url = `jdbc:sqlserver://${authority}${renderParams(allParams, db.paramStyle)}`;
    if (useInstance) {
      warnings.push(
        "A named instance resolves its port through the SQL Server Browser service on UDP 1434. If that is blocked, give the port instead of the instance name.",
      );
    }
  } else if (db.id === "h2") {
    const h2Params = renderParams(params, db.paramStyle);
    if (h2Mode === "mem") {
      url = `jdbc:h2:mem:${dbName}${h2Params}`;
      if (!params.some(([key]) => key.toUpperCase() === "DB_CLOSE_DELAY")) {
        warnings.push(
          "Add DB_CLOSE_DELAY=-1 if the in-memory database must survive between connections — otherwise it is dropped when the last one closes.",
        );
      }
    } else if (h2Mode === "file") {
      url = `jdbc:h2:file:${dbName}${h2Params}`;
      if (!dbName.startsWith("/") && !dbName.startsWith("./") && !/^[a-zA-Z]:/.test(dbName)) {
        warnings.push(
          "A bare file name is resolved against the JVM working directory. Use an absolute path, or ./name to be explicit.",
        );
      }
    } else {
      url = `jdbc:h2:tcp://${hostName}:${resolvedPort}/${dbName}${h2Params}`;
    }
  } else if (db.id === "sqlite") {
    const sqliteParams = renderParams(params, db.paramStyle);
    url =
      sqliteMode === "memory"
        ? `jdbc:sqlite::memory:${sqliteParams}`
        : `jdbc:sqlite:${dbName}${sqliteParams}`;
    if (sqliteMode === "file" && !dbName.startsWith("/") && !/^[a-zA-Z]:/.test(dbName)) {
      warnings.push(
        "Relative SQLite paths are resolved against the JVM working directory, so the same code can open different files. Use an absolute path.",
      );
    }
  }

  if (params.some(([key]) => key.toLowerCase() === "password")) {
    warnings.push(
      "A password in the URL ends up in connection-pool logs, stack traces and `ps` output. Pass it to DriverManager.getConnection(url, user, password) instead.",
    );
  }

  const gradle = `implementation("${db.maven}")`;
  const mavenBlock = (() => {
    const [groupId, artifactId, version] = db.maven.split(":");
    return [
      "<dependency>",
      `  <groupId>${groupId}</groupId>`,
      `  <artifactId>${artifactId}</artifactId>`,
      `  <version>${version}</version>`,
      "</dependency>",
    ].join("\n");
  })();

  const snippet = [
    `String url = "${url}";`,
    `try (Connection conn = DriverManager.getConnection(url, "${userName || "USER"}", System.getenv("DB_PASSWORD"))) {`,
    "    // ...",
    "}",
  ].join("\n");

  return {
    url,
    driverClass: db.driverClass,
    maven: db.maven,
    mavenBlock,
    gradle,
    snippet,
    params,
    warnings,
    db: {
      id: db.id,
      label: db.label,
      note: db.note,
      defaultPort: db.defaultPort,
      paramStyle: db.paramStyle,
    },
    resolvedPort,
    portDefaulted: Boolean(portResult.defaulted),
  };
}
