/**
 * PostgreSQL connection string builder.
 *
 * Follows the libpq connection URI syntax documented in the PostgreSQL manual
 * ("Connection Strings", libpq §"Connection URIs"):
 *   postgresql://[user[:password]@][host][:port][/dbname][?param=value&...]
 * plus the equivalent keyword/value DSN form ("host=... port=... dbname=...").
 * Special characters in userinfo, dbname and parameter values must be
 * percent-encoded in the URI form.
 */

/** Default PostgreSQL server port (PostgreSQL docs, runtime config "port"). */
export const PG_DEFAULT_PORT = 5432;

/** Valid TCP port range (IANA). */
export const PORT_MIN = 1;
export const PORT_MAX = 65535;

/** sslmode values accepted by libpq, weakest to strictest (libpq "SSL Support" table). */
export const SSL_MODES = [
  { value: "", label: "(omit — driver default, usually prefer)" },
  { value: "disable", label: "disable — never use SSL" },
  { value: "allow", label: "allow — SSL only if server insists" },
  { value: "prefer", label: "prefer — try SSL, fall back to plain (libpq default)" },
  { value: "require", label: "require — SSL, but no certificate verification" },
  { value: "verify-ca", label: "verify-ca — SSL and verify server certificate CA" },
  { value: "verify-full", label: "verify-full — verify CA and host name (strictest)" },
];

/** Both URI scheme designators are accepted by libpq. */
export const URI_SCHEMES = ["postgresql", "postgres"];

const HOST_FORBIDDEN = /[\s/?#@]/;

/**
 * Quote a value for the keyword/value DSN form. Per libpq docs, single quotes
 * and backslashes inside quoted values are escaped with a backslash, and
 * quoting is needed when the value is empty or contains spaces or quotes.
 */
export function quoteKeywordValue(value) {
  const raw = String(value);
  if (raw === "" || /[\s'\\]/.test(raw)) {
    return `'${raw.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  }
  return raw;
}

/**
 * Build both the URI and keyword/value forms of a PostgreSQL connection string.
 *
 * @param {object} input
 * @param {string} input.scheme            "postgresql" or "postgres".
 * @param {string} input.host              Host name or IP (IPv6 allowed, will be bracketed).
 * @param {number|string} input.port       TCP port; blank → omit (driver uses 5432).
 * @param {string} input.database          Database name.
 * @param {string} input.user              Role name (optional).
 * @param {string} input.password          Password (optional).
 * @param {string} input.sslmode           One of SSL_MODES values or "".
 * @param {number|string} input.connectTimeout  Seconds; blank → omit. libpq "connect_timeout".
 * @param {string} input.applicationName   Shown in pg_stat_activity; libpq "application_name".
 * @param {string} input.schema            Sets search_path via "options=-csearch_path=...".
 * @param {number|string} input.poolMaxConns  pgxpool-specific "pool_max_conns"; blank → omit.
 * @returns {{ uri:string, keywordValue:string, params:Array<[string,string]> } | {error:string}}
 */
export function buildPostgresConnection({
  scheme = "postgresql",
  host,
  port = "",
  database,
  user = "",
  password = "",
  sslmode = "",
  connectTimeout = "",
  applicationName = "",
  schema = "",
  poolMaxConns = "",
}) {
  if (!URI_SCHEMES.includes(scheme)) {
    return { error: "Scheme must be postgresql:// or postgres://." };
  }
  const cleanHost = String(host ?? "").trim();
  if (cleanHost === "") return { error: "Enter a host name or IP address." };
  const isIpv6 = cleanHost.includes(":");
  if (!isIpv6 && HOST_FORBIDDEN.test(cleanHost)) {
    return { error: "Host must not contain spaces, slashes, #, ? or @." };
  }

  let portPart = "";
  if (String(port).trim() !== "") {
    const portNumber = Number(port);
    if (!Number.isInteger(portNumber) || portNumber < PORT_MIN || portNumber > PORT_MAX) {
      return { error: `Port must be a whole number between ${PORT_MIN} and ${PORT_MAX}.` };
    }
    portPart = `:${portNumber}`;
  }

  const cleanDb = String(database ?? "").trim();
  if (cleanDb === "") return { error: "Enter the database name." };

  const cleanUser = String(user ?? "");
  const cleanPassword = String(password ?? "");
  if (cleanUser === "" && cleanPassword !== "") {
    return { error: "A password needs a user name to go with it." };
  }

  if (sslmode !== "" && !SSL_MODES.some((mode) => mode.value === sslmode)) {
    return { error: "Choose a valid sslmode." };
  }

  const params = [];
  if (sslmode !== "") params.push(["sslmode", sslmode]);

  if (String(connectTimeout).trim() !== "") {
    const timeout = Number(connectTimeout);
    if (!Number.isInteger(timeout) || timeout < 1) {
      return { error: "connect_timeout must be a whole number of seconds, at least 1." };
    }
    params.push(["connect_timeout", String(timeout)]);
  }

  const cleanAppName = String(applicationName ?? "").trim();
  if (cleanAppName !== "") params.push(["application_name", cleanAppName]);

  const cleanSchema = String(schema ?? "").trim();
  if (cleanSchema !== "") {
    if (/\s/.test(cleanSchema)) {
      return { error: "Schema (search_path) must not contain spaces." };
    }
    // search_path is set through the libpq "options" runtime parameter.
    params.push(["options", `-csearch_path=${cleanSchema}`]);
  }

  if (String(poolMaxConns).trim() !== "") {
    const pool = Number(poolMaxConns);
    if (!Number.isInteger(pool) || pool < 1) {
      return { error: "pool_max_conns must be a whole number, at least 1." };
    }
    params.push(["pool_max_conns", String(pool)]);
  }

  // --- URI form ---
  let userinfo = "";
  if (cleanUser !== "") {
    userinfo = encodeURIComponent(cleanUser);
    if (cleanPassword !== "") userinfo += `:${encodeURIComponent(cleanPassword)}`;
    userinfo += "@";
  }
  const hostPart = isIpv6 ? `[${cleanHost}]` : cleanHost;
  const query =
    params.length === 0
      ? ""
      : `?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}`;
  const uri = `${scheme}://${userinfo}${hostPart}${portPart}/${encodeURIComponent(cleanDb)}${query}`;

  // --- keyword/value form ---
  const kvPairs = [["host", cleanHost]];
  if (portPart !== "") kvPairs.push(["port", portPart.slice(1)]);
  kvPairs.push(["dbname", cleanDb]);
  if (cleanUser !== "") kvPairs.push(["user", cleanUser]);
  if (cleanPassword !== "") kvPairs.push(["password", cleanPassword]);
  for (const [key, value] of params) kvPairs.push([key, value]);
  const keywordValue = kvPairs.map(([k, v]) => `${k}=${quoteKeywordValue(v)}`).join(" ");

  return { uri, keywordValue, params };
}
