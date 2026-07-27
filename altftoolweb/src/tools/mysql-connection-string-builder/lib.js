/**
 * MySQL connection string builder.
 *
 * Generates three widely used formats:
 *  1. URI form   — mysql://user:pass@host:3306/db?param=... (Node mysql2,
 *     SQLAlchemy-style URLs; special characters percent-encoded per RFC 3986).
 *  2. Go DSN     — user:pass@tcp(host:3306)/db?param=... as defined by
 *     go-sql-driver/mysql's DSN grammar.
 *  3. JDBC URL   — jdbc:mysql://host:3306/db?param=... per MySQL Connector/J.
 */

/** Default MySQL server port (MySQL reference manual, --port). */
export const MYSQL_DEFAULT_PORT = 3306;

export const PORT_MIN = 1;
export const PORT_MAX = 65535;

/**
 * TLS/SSL modes as defined by MySQL's --ssl-mode client option
 * (and Connector/J's sslMode property, same value set).
 */
export const SSL_MODES = [
  { value: "", label: "(omit — driver default, usually PREFERRED)" },
  { value: "DISABLED", label: "DISABLED — no encryption" },
  { value: "PREFERRED", label: "PREFERRED — encrypt if server supports it (default)" },
  { value: "REQUIRED", label: "REQUIRED — always encrypt, no certificate check" },
  { value: "VERIFY_CA", label: "VERIFY_CA — encrypt and verify server CA" },
  { value: "VERIFY_IDENTITY", label: "VERIFY_IDENTITY — verify CA and host name (strictest)" },
];

/**
 * Map an --ssl-mode value to the go-sql-driver/mysql "tls" DSN parameter.
 * go-sql-driver accepts: false, true (verify), skip-verify (encrypt only),
 * preferred (opportunistic). REQUIRED (encrypt without verification) is
 * therefore skip-verify; both VERIFY modes map to tls=true.
 */
export const GO_TLS_BY_SSL_MODE = {
  DISABLED: "false",
  PREFERRED: "preferred",
  REQUIRED: "skip-verify",
  VERIFY_CA: "true",
  VERIFY_IDENTITY: "true",
};

/** Common character sets; utf8mb4 is the modern default (MySQL 8.0 default charset). */
export const CHARSET_OPTIONS = ["", "utf8mb4", "utf8mb3", "latin1", "ascii", "binary"];

const HOST_FORBIDDEN = /[\s/?#@()]/;

/**
 * Build MySQL connection strings in URI, Go DSN and JDBC forms.
 *
 * @param {object} input
 * @param {string} input.host                Host name or IP.
 * @param {number|string} input.port         TCP port; blank → omit (3306 default).
 * @param {string} input.database            Schema/database name.
 * @param {string} input.user                User name (optional).
 * @param {string} input.password            Password (optional).
 * @param {string} input.charset             Character set, e.g. utf8mb4.
 * @param {string} input.timezone            IANA zone ("Asia/Kolkata") or "UTC"; used as
 *                                           Go "loc" and JDBC "connectionTimeZone".
 * @param {string} input.sslMode             One of SSL_MODES values or "".
 * @param {number|string} input.connectTimeoutSeconds Connect timeout, seconds; blank → omit.
 * @param {number|string} input.connectionLimit      Pool size for mysql2 createPool; blank → omit.
 * @param {boolean} input.parseTime          Go driver: parse DATE/DATETIME into time.Time.
 * @returns {{ uri:string, goDsn:string, jdbc:string, params:Array<[string,string]> } | {error:string}}
 */
export function buildMysqlConnection({
  host,
  port = "",
  database,
  user = "",
  password = "",
  charset = "",
  timezone = "",
  sslMode = "",
  connectTimeoutSeconds = "",
  connectionLimit = "",
  parseTime = false,
}) {
  const cleanHost = String(host ?? "").trim();
  if (cleanHost === "") return { error: "Enter a host name or IP address." };
  if (HOST_FORBIDDEN.test(cleanHost)) {
    return { error: "Host must not contain spaces, slashes, parentheses, #, ? or @." };
  }

  let portNumber = null;
  if (String(port).trim() !== "") {
    portNumber = Number(port);
    if (!Number.isInteger(portNumber) || portNumber < PORT_MIN || portNumber > PORT_MAX) {
      return { error: `Port must be a whole number between ${PORT_MIN} and ${PORT_MAX}.` };
    }
  }

  const cleanDb = String(database ?? "").trim();
  if (cleanDb === "") return { error: "Enter the database (schema) name." };

  const cleanUser = String(user ?? "");
  const cleanPassword = String(password ?? "");
  if (cleanUser === "" && cleanPassword !== "") {
    return { error: "A password needs a user name to go with it." };
  }

  if (sslMode !== "" && !SSL_MODES.some((mode) => mode.value === sslMode)) {
    return { error: "Choose a valid SSL mode." };
  }

  const cleanCharset = String(charset ?? "").trim();
  const cleanTimezone = String(timezone ?? "").trim();
  if (/\s/.test(cleanTimezone)) {
    return { error: "Time zone must be an IANA name like Asia/Kolkata or UTC — no spaces." };
  }

  let timeoutSeconds = null;
  if (String(connectTimeoutSeconds).trim() !== "") {
    timeoutSeconds = Number(connectTimeoutSeconds);
    if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 1) {
      return { error: "Connect timeout must be a whole number of seconds, at least 1." };
    }
  }

  let poolLimit = null;
  if (String(connectionLimit).trim() !== "") {
    poolLimit = Number(connectionLimit);
    if (!Number.isInteger(poolLimit) || poolLimit < 1) {
      return { error: "Connection limit must be a whole number, at least 1." };
    }
  }

  const hostPort = portNumber === null ? cleanHost : `${cleanHost}:${portNumber}`;

  // --- URI form (mysql2 / SQLAlchemy style) ---
  const uriParams = [];
  if (cleanCharset !== "") uriParams.push(["charset", cleanCharset]);
  if (sslMode !== "") uriParams.push(["ssl-mode", sslMode]);
  if (timeoutSeconds !== null) uriParams.push(["connectTimeout", String(timeoutSeconds * 1000)]); // mysql2 takes ms
  if (poolLimit !== null) uriParams.push(["connectionLimit", String(poolLimit)]);
  let userinfo = "";
  if (cleanUser !== "") {
    userinfo = encodeURIComponent(cleanUser);
    if (cleanPassword !== "") userinfo += `:${encodeURIComponent(cleanPassword)}`;
    userinfo += "@";
  }
  const uriQuery =
    uriParams.length === 0
      ? ""
      : `?${uriParams.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}`;
  const uri = `mysql://${userinfo}${hostPort}/${encodeURIComponent(cleanDb)}${uriQuery}`;

  // --- Go DSN (go-sql-driver/mysql) ---
  const goParams = [];
  if (cleanCharset !== "") goParams.push(["charset", cleanCharset]);
  if (parseTime) goParams.push(["parseTime", "true"]);
  if (cleanTimezone !== "") goParams.push(["loc", encodeURIComponent(cleanTimezone)]);
  if (sslMode !== "") goParams.push(["tls", GO_TLS_BY_SSL_MODE[sslMode]]);
  if (timeoutSeconds !== null) goParams.push(["timeout", `${timeoutSeconds}s`]);
  const goAuth =
    cleanUser === "" ? "" : cleanPassword === "" ? `${cleanUser}@` : `${cleanUser}:${cleanPassword}@`;
  const goQuery = goParams.length === 0 ? "" : `?${goParams.map(([k, v]) => `${k}=${v}`).join("&")}`;
  const goDsn = `${goAuth}tcp(${hostPort})/${cleanDb}${goQuery}`;

  // --- JDBC URL (Connector/J) ---
  const jdbcParams = [];
  if (cleanCharset !== "") jdbcParams.push(["characterEncoding", cleanCharset]);
  if (cleanTimezone !== "") jdbcParams.push(["connectionTimeZone", cleanTimezone]);
  if (sslMode !== "") jdbcParams.push(["sslMode", sslMode]);
  if (timeoutSeconds !== null) jdbcParams.push(["connectTimeout", String(timeoutSeconds * 1000)]); // Connector/J takes ms
  const jdbcQuery =
    jdbcParams.length === 0
      ? ""
      : `?${jdbcParams.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}`;
  const jdbc = `jdbc:mysql://${hostPort}/${cleanDb}${jdbcQuery}`;

  return { uri, goDsn, jdbc, params: uriParams };
}
