/**
 * Microsoft SQL Server connection string builder.
 *
 * Generates two standard formats:
 *  1. ADO.NET (System.Data/Microsoft.Data.SqlClient):
 *       Server=host\INSTANCE,1433;Database=db;User Id=u;Password=p;
 *       Encrypt=True;TrustServerCertificate=False;Connection Timeout=15;
 *     Per the SqlConnection.ConnectionString rules, a value containing ";"
 *     or leading/trailing spaces must be wrapped in double quotes, with
 *     embedded double quotes doubled.
 *  2. JDBC (Microsoft JDBC Driver for SQL Server):
 *       jdbc:sqlserver://host:1433;instanceName=INST;databaseName=db;
 *       user=u;password=p;encrypt=true;trustServerCertificate=false;loginTimeout=15;
 *     Per the driver docs, property values containing ";", "{" or "}" must be
 *     enclosed in braces.
 */

/** Default SQL Server TCP port (SQL Server docs, default instance port). */
export const MSSQL_DEFAULT_PORT = 1433;

export const PORT_MIN = 1;
export const PORT_MAX = 65535;

/** Authentication modes supported by the builder. */
export const AUTH_MODES = [
  { value: "sql", label: "SQL Server authentication (user + password)" },
  { value: "windows", label: "Windows / Integrated authentication" },
];

const HOST_FORBIDDEN = /[\s/?#@,;\\]/;
const INSTANCE_FORBIDDEN = /[\s/?#@,;\\]/;

/** Quote a value for ADO.NET if it contains ";" or double quotes or outer spaces. */
export function quoteAdoValue(value) {
  const raw = String(value);
  if (/[;"]/.test(raw) || raw !== raw.trim()) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

/** Brace-escape a value for a JDBC property if it contains ";", "{" or "}". */
export function escapeJdbcValue(value) {
  const raw = String(value);
  if (/[;{}]/.test(raw)) {
    // The driver requires braces; a literal "}" inside is doubled.
    return `{${raw.replace(/}/g, "}}")}}`;
  }
  return raw;
}

/**
 * Build ADO.NET and JDBC SQL Server connection strings.
 *
 * @param {object} input
 * @param {string} input.host                 Host name or IP.
 * @param {string} input.instanceName         Named instance, e.g. SQLEXPRESS (optional).
 * @param {number|string} input.port          TCP port; blank → omit (1433 default instance).
 * @param {string} input.database             Database name.
 * @param {string} input.authMode             "sql" or "windows".
 * @param {string} input.user                 SQL login (required for sql auth).
 * @param {string} input.password             Password (required for sql auth).
 * @param {boolean} input.encrypt             Encrypt=True / encrypt=true.
 * @param {boolean} input.trustServerCertificate  Skip server certificate validation.
 * @param {number|string} input.timeoutSeconds    Connection/login timeout in seconds; blank → omit.
 * @param {string} input.applicationName      Application Name / applicationName (optional).
 * @returns {{ adoNet:string, jdbc:string } | { error:string }}
 */
export function buildSqlServerConnection({
  host,
  instanceName = "",
  port = "",
  database,
  authMode = "sql",
  user = "",
  password = "",
  encrypt = true,
  trustServerCertificate = false,
  timeoutSeconds = "",
  applicationName = "",
}) {
  const cleanHost = String(host ?? "").trim();
  if (cleanHost === "") return { error: "Enter a host name or IP address." };
  if (HOST_FORBIDDEN.test(cleanHost)) {
    return { error: "Host must not contain spaces, slashes, commas, semicolons or backslashes." };
  }

  const cleanInstance = String(instanceName ?? "").trim();
  if (cleanInstance !== "" && INSTANCE_FORBIDDEN.test(cleanInstance)) {
    return { error: "Instance name must not contain spaces, slashes, commas or semicolons." };
  }

  let portNumber = null;
  if (String(port).trim() !== "") {
    portNumber = Number(port);
    if (!Number.isInteger(portNumber) || portNumber < PORT_MIN || portNumber > PORT_MAX) {
      return { error: `Port must be a whole number between ${PORT_MIN} and ${PORT_MAX}.` };
    }
  }
  if (cleanInstance === "" && portNumber === null) {
    // Fine: driver uses 1433 — but flag nothing; this is the default-instance case.
  }

  const cleanDb = String(database ?? "").trim();
  if (cleanDb === "") return { error: "Enter the database name." };

  if (!AUTH_MODES.some((mode) => mode.value === authMode)) {
    return { error: "Choose an authentication mode." };
  }

  const cleanUser = String(user ?? "");
  const cleanPassword = String(password ?? "");
  if (authMode === "sql") {
    if (cleanUser.trim() === "") {
      return { error: "SQL Server authentication needs a user (login) name." };
    }
  }

  let timeout = null;
  if (String(timeoutSeconds).trim() !== "") {
    timeout = Number(timeoutSeconds);
    if (!Number.isInteger(timeout) || timeout < 0) {
      return { error: "Timeout must be a whole number of seconds, 0 or higher." };
    }
  }

  const cleanAppName = String(applicationName ?? "").trim();

  // --- ADO.NET ---
  let serverValue = cleanHost;
  if (cleanInstance !== "") serverValue += `\\${cleanInstance}`;
  if (portNumber !== null) serverValue += `,${portNumber}`;

  const adoPairs = [
    ["Server", serverValue],
    ["Database", cleanDb],
  ];
  if (authMode === "windows") {
    adoPairs.push(["Integrated Security", "SSPI"]);
  } else {
    adoPairs.push(["User Id", cleanUser]);
    adoPairs.push(["Password", cleanPassword]);
  }
  adoPairs.push(["Encrypt", encrypt ? "True" : "False"]);
  adoPairs.push(["TrustServerCertificate", trustServerCertificate ? "True" : "False"]);
  if (timeout !== null) adoPairs.push(["Connection Timeout", String(timeout)]);
  if (cleanAppName !== "") adoPairs.push(["Application Name", cleanAppName]);
  const adoNet = adoPairs.map(([k, v]) => `${k}=${quoteAdoValue(v)};`).join("");

  // --- JDBC ---
  const jdbcHost = portNumber !== null ? `${cleanHost}:${portNumber}` : cleanHost;
  const jdbcProps = [];
  if (cleanInstance !== "") jdbcProps.push(["instanceName", cleanInstance]);
  jdbcProps.push(["databaseName", cleanDb]);
  if (authMode === "windows") {
    jdbcProps.push(["integratedSecurity", "true"]);
  } else {
    jdbcProps.push(["user", cleanUser]);
    jdbcProps.push(["password", cleanPassword]);
  }
  jdbcProps.push(["encrypt", encrypt ? "true" : "false"]);
  jdbcProps.push(["trustServerCertificate", trustServerCertificate ? "true" : "false"]);
  if (timeout !== null) jdbcProps.push(["loginTimeout", String(timeout)]);
  if (cleanAppName !== "") jdbcProps.push(["applicationName", cleanAppName]);
  const jdbc = `jdbc:sqlserver://${jdbcHost};${jdbcProps
    .map(([k, v]) => `${k}=${escapeJdbcValue(v)};`)
    .join("")}`;

  return { adoNet, jdbc };
}
