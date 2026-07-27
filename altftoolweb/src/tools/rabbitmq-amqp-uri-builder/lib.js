/**
 * RabbitMQ AMQP 0-9-1 URI builder.
 *
 * Rules encoded here come from the official RabbitMQ URI specification
 * (https://www.rabbitmq.com/docs/uri-spec), which profiles RFC 3986:
 *   amqp[s]://[username[:password]@]host[:port][/vhost][?query]
 *
 * - The vhost is a SINGLE path segment; every character outside the RFC 3986
 *   "unreserved" set must be percent-encoded, so the default vhost "/" is
 *   written "%2F". An absent path segment means the default vhost.
 * - An empty path ("amqp://host") also selects the default vhost, but an
 *   explicit trailing "/" ("amqp://host/") selects the vhost named "" (empty
 *   string), which is almost never what anyone wants — this builder therefore
 *   always writes the vhost segment explicitly when one is given.
 */

/** IANA-assigned port for AMQP 0-9-1 without TLS (RabbitMQ default listener). */
export const AMQP_DEFAULT_PORT = 5672;

/** IANA-assigned port for AMQP 0-9-1 over TLS ("amqps"). */
export const AMQPS_DEFAULT_PORT = 5671;

/** RabbitMQ ships with the default virtual host named "/" out of the box. */
export const DEFAULT_VHOST = "/";

/** Default credentials RabbitMQ creates on a fresh install (guest/guest, localhost only). */
export const DEFAULT_USERNAME = "guest";

/** TCP port range bounds — 16-bit unsigned port numbers per RFC 793. */
export const PORT_MIN = 1;
export const PORT_MAX = 65535;

/**
 * Query keys recognised by RabbitMQ client libraries (Java, .NET, Erlang) per
 * the "Query parameters" section of the RabbitMQ URI spec:
 * - heartbeat: negotiated heartbeat interval in SECONDS
 * - connection_timeout: TCP connection timeout in MILLISECONDS
 * - channel_max: maximum channel number the client requests
 */
export const QUERY_KEYS = ["heartbeat", "connection_timeout", "channel_max"];

/**
 * channel-max is a 16-bit AMQP short int; 0 means "no limit" and RabbitMQ's own
 * default server limit is 2047 channels per connection.
 */
export const CHANNEL_MAX_LIMIT = 65535;

const HOST_PATTERN = /^(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9])$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

/**
 * Percent-encode a URI component. encodeURIComponent already covers everything
 * RFC 3986 requires for userinfo and path segments except the sub-delims
 * !'()* — RabbitMQ's spec says to encode anything outside "unreserved", so
 * those are encoded too for maximum client compatibility.
 */
export function encodeComponent(value) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function parseOptionalNonNegativeInt(raw, label) {
  if (raw === "" || raw === null || raw === undefined) return { value: null };
  const num = Number(raw);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
    return { error: `${label} must be a whole number of 0 or more.` };
  }
  return { value: num };
}

/**
 * Build a RabbitMQ connection URI.
 *
 * @param {object} input
 * @param {"amqp"|"amqps"} input.scheme
 * @param {string} input.host                    Hostname, IPv4, or bracketless IPv6 literal.
 * @param {string|number} [input.port]           Empty string uses the scheme default.
 * @param {string} [input.username]
 * @param {string} [input.password]
 * @param {string} [input.vhost]                 Virtual host name, e.g. "/" or "production".
 * @param {string|number} [input.heartbeatSeconds]
 * @param {string|number} [input.connectionTimeoutMs]
 * @param {string|number} [input.channelMax]
 * @param {boolean} [input.omitDefaultPort=false] Leave the port out when it equals the scheme default.
 * @returns {object} { uri, scheme, effectivePort, isTls, vhostSegment, queryString } or { error }.
 */
export function buildAmqpUri({
  scheme,
  host,
  port = "",
  username = "",
  password = "",
  vhost = DEFAULT_VHOST,
  heartbeatSeconds = "",
  connectionTimeoutMs = "",
  channelMax = "",
  omitDefaultPort = false,
}) {
  if (scheme !== "amqp" && scheme !== "amqps") {
    return { error: "Scheme must be amqp or amqps." };
  }

  const trimmedHost = String(host ?? "").trim();
  if (trimmedHost === "") return { error: "Enter a broker hostname or IP address." };

  const isIpv6 = trimmedHost.includes(":");
  if (isIpv6 && !IPV6_PATTERN.test(trimmedHost)) {
    return { error: "The host looks like an IPv6 literal but contains invalid characters." };
  }
  if (!isIpv6 && !HOST_PATTERN.test(trimmedHost)) {
    return {
      error:
        "Host may only contain letters, digits, dots and hyphens, and cannot start or end with a dot or hyphen.",
    };
  }

  const defaultPort = scheme === "amqps" ? AMQPS_DEFAULT_PORT : AMQP_DEFAULT_PORT;
  let effectivePort = defaultPort;
  const portRaw = String(port).trim();
  if (portRaw !== "") {
    const portNum = Number(portRaw);
    if (!Number.isInteger(portNum) || portNum < PORT_MIN || portNum > PORT_MAX) {
      return { error: `Port must be a whole number between ${PORT_MIN} and ${PORT_MAX}.` };
    }
    effectivePort = portNum;
  }

  if (password !== "" && username === "") {
    return { error: "A password needs a username — RFC 3986 userinfo is username:password." };
  }

  const heartbeat = parseOptionalNonNegativeInt(heartbeatSeconds, "Heartbeat (seconds)");
  if (heartbeat.error) return { error: heartbeat.error };
  const timeout = parseOptionalNonNegativeInt(connectionTimeoutMs, "Connection timeout (ms)");
  if (timeout.error) return { error: timeout.error };
  const chanMax = parseOptionalNonNegativeInt(channelMax, "Channel max");
  if (chanMax.error) return { error: chanMax.error };
  if (chanMax.value !== null && chanMax.value > CHANNEL_MAX_LIMIT) {
    return { error: `Channel max cannot exceed ${CHANNEL_MAX_LIMIT} (AMQP 16-bit field).` };
  }

  let userinfo = "";
  if (username !== "") {
    userinfo = encodeComponent(username);
    if (password !== "") userinfo += `:${encodeComponent(password)}`;
    userinfo += "@";
  }

  const hostPart = isIpv6 ? `[${trimmedHost}]` : trimmedHost;
  const portPart =
    omitDefaultPort && effectivePort === defaultPort ? "" : `:${effectivePort}`;

  // The vhost is one path segment; "" (empty string) is a legal but unusual vhost name.
  const vhostSegment = vhost === "" ? "" : `/${encodeComponent(vhost)}`;

  const queryPairs = [];
  if (heartbeat.value !== null) queryPairs.push(["heartbeat", heartbeat.value]);
  if (timeout.value !== null) queryPairs.push(["connection_timeout", timeout.value]);
  if (chanMax.value !== null) queryPairs.push(["channel_max", chanMax.value]);
  const queryString = queryPairs.map(([k, v]) => `${k}=${v}`).join("&");

  const uri = `${scheme}://${userinfo}${hostPart}${portPart}${vhostSegment}${
    queryString ? `?${queryString}` : ""
  }`;

  return {
    uri,
    scheme,
    isTls: scheme === "amqps",
    effectivePort,
    defaultPort,
    vhost,
    vhostSegment: vhostSegment === "" ? "(default vhost — no segment)" : vhostSegment,
    queryString,
    hasCredentials: username !== "",
  };
}
