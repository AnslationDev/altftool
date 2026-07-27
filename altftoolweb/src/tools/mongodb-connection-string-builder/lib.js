/**
 * MongoDB connection string builder.
 *
 * Follows the official MongoDB Connection String URI format:
 *   mongodb://[user:password@]host1[:port1][,...hostN[:portN]][/[defaultauthdb]][?options]
 *   mongodb+srv://host.domain[/[defaultauthdb]][?options]
 * Per the spec, user name and password must percent-encode the characters
 * ":", "/", "?", "#", "[", "]", "@" and "%". With +srv, exactly one host name
 * is allowed, no port may be given, DNS SRV records supply the members, and
 * TLS defaults to true.
 */

/** Default mongod/mongos port (MongoDB manual, "Default MongoDB Port"). */
export const MONGO_DEFAULT_PORT = 27017;

export const PORT_MIN = 1;
export const PORT_MAX = 65535;

/** Read preference modes (MongoDB manual, "Read Preference"). */
export const READ_PREFERENCES = [
  { value: "", label: "(omit — default is primary)" },
  { value: "primary", label: "primary — all reads from the primary (default)" },
  { value: "primaryPreferred", label: "primaryPreferred — primary, else a secondary" },
  { value: "secondary", label: "secondary — only secondaries" },
  { value: "secondaryPreferred", label: "secondaryPreferred — secondary, else primary" },
  { value: "nearest", label: "nearest — lowest network latency member" },
];

/** Write concern w values commonly used in the URI (MongoDB manual, "Write Concern"). */
export const WRITE_CONCERNS = [
  { value: "", label: "(omit — default is w: majority on modern drivers)" },
  { value: "majority", label: "majority — acknowledged by a majority of members" },
  { value: "1", label: "1 — acknowledged by the primary only" },
  { value: "0", label: "0 — fire and forget (no acknowledgement)" },
];

const HOST_FORBIDDEN = /[\s/?#@,\[\]]/;

function validateHost(raw) {
  const cleaned = String(raw ?? "").trim();
  if (cleaned === "") return null;
  if (HOST_FORBIDDEN.test(cleaned)) return null;
  return cleaned;
}

/**
 * Build a MongoDB connection URI.
 *
 * @param {object} input
 * @param {boolean} input.srv                  Use mongodb+srv:// (DNS seed list).
 * @param {string}  input.hosts               Comma-separated host[:port] list (one host for srv).
 * @param {string}  input.database            Default auth database path segment (optional).
 * @param {string}  input.user                User name (optional, percent-encoded).
 * @param {string}  input.password            Password (optional, percent-encoded).
 * @param {string}  input.replicaSet          replicaSet option (optional, not for srv-managed).
 * @param {string}  input.authSource          authSource option, e.g. "admin" (optional).
 * @param {string}  input.readPreference      One of READ_PREFERENCES values.
 * @param {string}  input.writeConcern        One of WRITE_CONCERNS values.
 * @param {string}  input.tls                 "" (omit) | "true" | "false".
 * @param {boolean} input.retryWrites         Emit retryWrites=true (drivers default true already).
 * @param {number|string} input.maxPoolSize   maxPoolSize option; blank → omit (driver default 100).
 * @param {string}  input.appName             appName shown in server logs/profiler (optional).
 * @returns {{ uri:string, hostCount:number, params:Array<[string,string]> } | {error:string}}
 */
export function buildMongoConnection({
  srv = false,
  hosts,
  database = "",
  user = "",
  password = "",
  replicaSet = "",
  authSource = "",
  readPreference = "",
  writeConcern = "",
  tls = "",
  retryWrites = false,
  maxPoolSize = "",
  appName = "",
}) {
  const rawHosts = String(hosts ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h !== "");
  if (rawHosts.length === 0) return { error: "Enter at least one host." };

  if (srv && rawHosts.length > 1) {
    return { error: "mongodb+srv:// takes exactly one host name — the SRV DNS record lists the members." };
  }

  const hostParts = [];
  for (const entry of rawHosts) {
    // Split off an optional :port (IPv6 literals not supported in this simple builder).
    const colonCount = (entry.match(/:/g) || []).length;
    if (colonCount > 1) {
      return { error: `"${entry}" has more than one colon — enter host or host:port per entry.` };
    }
    const [hostRaw, portRaw] = entry.split(":");
    const host = validateHost(hostRaw);
    if (!host) {
      return { error: `"${entry}" is not a valid host — no spaces, slashes, commas, #, ? or @.` };
    }
    if (portRaw !== undefined) {
      if (srv) return { error: "mongodb+srv:// must not include a port — the SRV record supplies it." };
      const port = Number(portRaw);
      if (!Number.isInteger(port) || port < PORT_MIN || port > PORT_MAX) {
        return { error: `Port in "${entry}" must be a whole number between ${PORT_MIN} and ${PORT_MAX}.` };
      }
      hostParts.push(`${host}:${port}`);
    } else {
      hostParts.push(host);
    }
  }

  const cleanUser = String(user ?? "");
  const cleanPassword = String(password ?? "");
  if (cleanUser === "" && cleanPassword !== "") {
    return { error: "A password needs a user name to go with it." };
  }

  if (readPreference !== "" && !READ_PREFERENCES.some((p) => p.value === readPreference)) {
    return { error: "Choose a valid read preference." };
  }
  if (writeConcern !== "" && !WRITE_CONCERNS.some((w) => w.value === writeConcern)) {
    return { error: "Choose a valid write concern." };
  }
  if (tls !== "" && tls !== "true" && tls !== "false") {
    return { error: "TLS must be omitted, true or false." };
  }

  const params = [];
  const cleanReplicaSet = String(replicaSet ?? "").trim();
  if (cleanReplicaSet !== "") params.push(["replicaSet", cleanReplicaSet]);
  const cleanAuthSource = String(authSource ?? "").trim();
  if (cleanAuthSource !== "") params.push(["authSource", cleanAuthSource]);
  if (readPreference !== "") params.push(["readPreference", readPreference]);
  if (writeConcern !== "") params.push(["w", writeConcern]);
  if (tls !== "") params.push(["tls", tls]);
  if (retryWrites) params.push(["retryWrites", "true"]);
  if (String(maxPoolSize).trim() !== "") {
    const pool = Number(maxPoolSize);
    if (!Number.isInteger(pool) || pool < 1) {
      return { error: "maxPoolSize must be a whole number, at least 1." };
    }
    params.push(["maxPoolSize", String(pool)]);
  }
  const cleanAppName = String(appName ?? "").trim();
  if (cleanAppName !== "") params.push(["appName", cleanAppName]);

  let userinfo = "";
  if (cleanUser !== "") {
    userinfo = encodeURIComponent(cleanUser);
    if (cleanPassword !== "") userinfo += `:${encodeURIComponent(cleanPassword)}`;
    userinfo += "@";
  }

  const scheme = srv ? "mongodb+srv" : "mongodb";
  const cleanDb = String(database ?? "").trim();
  const dbPart = cleanDb === "" ? (params.length > 0 ? "/" : "") : `/${encodeURIComponent(cleanDb)}`;
  const query =
    params.length === 0
      ? ""
      : `?${params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")}`;

  const uri = `${scheme}://${userinfo}${hostParts.join(",")}${dbPart}${query}`;
  return { uri, hostCount: hostParts.length, params };
}
