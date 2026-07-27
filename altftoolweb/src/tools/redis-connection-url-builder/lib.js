/**
 * Redis connection URL builder.
 *
 * Follows the redis:// / rediss:// URI scheme (IANA provisional registration,
 * used by redis-cli -u and all major clients):
 *   redis://[[username][:password]@][host][:port][/db-number]
 * rediss:// is the same with TLS. The logical database index is the path
 * segment; usernames are ACL users introduced in Redis 6 — the legacy AUTH
 * form carries only a password after the colon (redis://:password@host).
 */

/** Default Redis server port (redis.conf default "port 6379"). */
export const REDIS_DEFAULT_PORT = 6379;

export const PORT_MIN = 1;
export const PORT_MAX = 65535;

/**
 * Default number of logical databases per server (redis.conf "databases 16"),
 * giving valid indexes 0–15 unless the server is configured differently.
 */
export const DEFAULT_DATABASES = 16;
export const DB_INDEX_MAX_CONFIGURABLE = 0xffffffff; // sanity ceiling only

/** ACL default user name — connecting as "default" is the same as no user (Redis 6 ACL docs). */
export const ACL_DEFAULT_USER = "default";

const HOST_FORBIDDEN = /[\s/?#@]/;

/**
 * Build a redis:// or rediss:// URL plus the matching redis-cli command.
 *
 * @param {object} input
 * @param {boolean} input.tls              true → rediss:// (TLS).
 * @param {string}  input.host             Host name or IP.
 * @param {number|string} input.port       TCP port; blank → omit (6379 default).
 * @param {number|string} input.dbIndex    Logical DB index; blank → omit (0 default).
 * @param {string}  input.username         ACL user (Redis 6+); blank for legacy AUTH.
 * @param {string}  input.password         Password (optional, percent-encoded).
 * @param {boolean} input.warnHighDb       Internal: returns warning when dbIndex ≥ 16.
 * @returns {{ url:string, cliCommand:string, warning:string|null } | {error:string}}
 */
export function buildRedisUrl({
  tls = false,
  host,
  port = "",
  dbIndex = "",
  username = "",
  password = "",
}) {
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

  let dbPart = "";
  let warning = null;
  if (String(dbIndex).trim() !== "") {
    const db = Number(dbIndex);
    if (!Number.isInteger(db) || db < 0) {
      return { error: "Database index must be a whole number, 0 or higher." };
    }
    if (db > DB_INDEX_MAX_CONFIGURABLE) {
      return { error: "Database index is absurdly large — check the figure." };
    }
    if (db >= DEFAULT_DATABASES) {
      warning = `Index ${db} only works if the server raises "databases" above the default ${DEFAULT_DATABASES} (valid default range is 0–15).`;
    }
    if (db !== 0) dbPart = `/${db}`;
  }

  const cleanUser = String(username ?? "").trim();
  const cleanPassword = String(password ?? "");
  if (cleanUser !== "" && cleanPassword === "") {
    return { error: "An ACL username needs a password — passwordless ACL users cannot authenticate over a URL." };
  }

  let userinfo = "";
  if (cleanPassword !== "") {
    // Legacy AUTH: ":password@"; ACL: "username:password@".
    userinfo = `${encodeURIComponent(cleanUser)}:${encodeURIComponent(cleanPassword)}@`;
  }

  const scheme = tls ? "rediss" : "redis";
  const hostPart = isIpv6 ? `[${cleanHost}]` : cleanHost;
  const url = `${scheme}://${userinfo}${hostPart}${portPart}${dbPart}`;
  const cliCommand = `redis-cli -u '${url.replace(/'/g, "'\\''")}'`;

  return { url, cliCommand, warning };
}
