/**
 * Nginx log_format composition (ngx_http_log_module).
 *
 * Facts encoded here:
 *  - The built-in "combined" format is:
 *    '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent
 *     "$http_referer" "$http_user_agent"'
 *  - log_format accepts escape=default|json|none (json since nginx 1.11.8,
 *    none since 1.13.10).
 *  - Format names share a namespace with other log_format names and must be
 *    valid nginx identifiers.
 * Variable descriptions and typical samples follow the ngx_http_core_module /
 * ngx_http_log_module / ngx_http_upstream_module docs. Sample IPs use the
 * TEST-NET-3 range (203.0.113.0/24) reserved for documentation by RFC 5737.
 */

/**
 * Catalogue of commonly logged variables.
 * wrap: how the plain (combined-style) template decorates the variable —
 * "quote" for values that can contain spaces, "bracket" for timestamps,
 * "none" for atoms.
 */
export const NGINX_LOG_VARIABLES = [
  { name: "$remote_addr", desc: "Client IP address", sample: "203.0.113.42", wrap: "none" },
  { name: "$remote_user", desc: "User from basic auth", sample: "alice", wrap: "none" },
  { name: "$time_local", desc: "Local time, CLF format", sample: "26/Jul/2026:10:15:32 +0000", wrap: "bracket" },
  { name: "$time_iso8601", desc: "ISO 8601 timestamp", sample: "2026-07-26T10:15:32+00:00", wrap: "bracket" },
  { name: "$msec", desc: "Unix time with milliseconds", sample: "1784110532.417", wrap: "none" },
  { name: "$request", desc: "Full request line", sample: "GET /products?page=2 HTTP/1.1", wrap: "quote" },
  { name: "$request_method", desc: "HTTP method", sample: "GET", wrap: "none" },
  { name: "$uri", desc: "Normalised request URI", sample: "/products", wrap: "none" },
  { name: "$args", desc: "Query string", sample: "page=2", wrap: "quote" },
  { name: "$status", desc: "Response status code", sample: "200", wrap: "none" },
  { name: "$body_bytes_sent", desc: "Response body bytes", sample: "5324", wrap: "none" },
  { name: "$bytes_sent", desc: "Total bytes incl. headers", sample: "5691", wrap: "none" },
  { name: "$request_length", desc: "Request size in bytes", sample: "482", wrap: "none" },
  { name: "$request_time", desc: "Total request seconds", sample: "0.087", wrap: "none" },
  { name: "$upstream_response_time", desc: "Upstream seconds", sample: "0.062", wrap: "none" },
  { name: "$upstream_addr", desc: "Upstream server hit", sample: "127.0.0.1:3000", wrap: "quote" },
  { name: "$upstream_status", desc: "Upstream status code", sample: "200", wrap: "none" },
  { name: "$http_referer", desc: "Referer request header", sample: "https://example.com/", wrap: "quote" },
  { name: "$http_user_agent", desc: "User-Agent header", sample: "Mozilla/5.0 (X11; Linux x86_64)", wrap: "quote" },
  { name: "$http_x_forwarded_for", desc: "X-Forwarded-For header", sample: "198.51.100.7", wrap: "quote" },
  { name: "$host", desc: "Request host name", sample: "www.example.com", wrap: "none" },
  { name: "$server_name", desc: "Matching server_name", sample: "example.com", wrap: "none" },
  { name: "$scheme", desc: "http or https", sample: "https", wrap: "none" },
  { name: "$server_protocol", desc: "Protocol version", sample: "HTTP/2.0", wrap: "none" },
  { name: "$ssl_protocol", desc: "TLS protocol used", sample: "TLSv1.3", wrap: "none" },
  { name: "$ssl_cipher", desc: "TLS cipher used", sample: "TLS_AES_256_GCM_SHA384", wrap: "none" },
  { name: "$connection", desc: "Connection serial number", sample: "8721", wrap: "none" },
  { name: "$connection_requests", desc: "Requests on this connection", sample: "3", wrap: "none" },
  { name: "$gzip_ratio", desc: "Compression ratio achieved", sample: "3.42", wrap: "none" },
  { name: "$request_id", desc: "Unique request id (16 random bytes, hex)", sample: "444ec26c8ff2ee43a1a01a3ff9c60eee", wrap: "none" },
];

/** Variable names of nginx's built-in "combined" format, in order. */
export const COMBINED_VARIABLES = [
  "$remote_addr",
  "$remote_user",
  "$time_local",
  "$request",
  "$status",
  "$body_bytes_sent",
  "$http_referer",
  "$http_user_agent",
];

/** log_format escape parameter values (ngx_http_log_module). */
export const ESCAPE_MODES = [
  { id: "default", label: "default — escape quotes and control chars" },
  { id: "json", label: "json — valid JSON string escaping (nginx 1.11.8+)" },
  { id: "none", label: "none — no escaping (nginx 1.13.10+)" },
];

/** nginx identifier rule for the format name. */
export const FORMAT_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Names reserved because nginx predefines them. */
export const RESERVED_FORMAT_NAMES = ["combined"];

const byName = new Map(NGINX_LOG_VARIABLES.map((variable) => [variable.name, variable]));

/** Decorate one variable for the plain template ("combined" conventions). */
function decorate(variable) {
  if (variable.wrap === "quote") return `"${variable.name}"`;
  if (variable.wrap === "bracket") return `[${variable.name}]`;
  return variable.name;
}

/** Decorate one sample value the same way the template decorates its variable. */
function decorateSample(variable) {
  if (variable.wrap === "quote") return `"${variable.sample}"`;
  if (variable.wrap === "bracket") return `[${variable.sample}]`;
  return variable.sample;
}

/**
 * Build the log_format directive, access_log line and a sample log line.
 *
 * @param {object} input
 * @param {string} input.formatName    nginx identifier for the format.
 * @param {"plain"|"json"} input.style plain combined-style line or one JSON object per line.
 * @param {string} input.escapeMode    default | json | none.
 * @param {string[]} input.variableNames selected variables, in output order.
 * @returns {{directive, accessLog, sampleLine, variableCount} | {error}}
 */
export function buildLogFormat({ formatName, style, escapeMode, variableNames }) {
  const name = typeof formatName === "string" ? formatName.trim() : "";
  if (!FORMAT_NAME_PATTERN.test(name)) {
    return { error: "Format name must start with a letter or underscore and use only letters, digits and underscores." };
  }
  if (RESERVED_FORMAT_NAMES.includes(name)) {
    return { error: `"${name}" is predefined by nginx — pick another name.` };
  }
  if (!ESCAPE_MODES.some((mode) => mode.id === escapeMode)) {
    return { error: "Choose a valid escape mode (default, json or none)." };
  }
  if (!Array.isArray(variableNames) || variableNames.length === 0) {
    return { error: "Select at least one variable to log." };
  }
  const variables = [];
  for (const variableName of variableNames) {
    const variable = byName.get(variableName);
    if (!variable) return { error: `Unknown nginx variable: ${variableName}` };
    variables.push(variable);
  }

  let directive;
  let sampleLine;
  if (style === "json") {
    // One JSON object per line; escape=json keeps values valid JSON strings.
    const fields = variables.map(
      (variable) => `"${variable.name.slice(1)}":"${variable.name}"`,
    );
    const template = `{${fields.join(",")}}`;
    directive = `log_format ${name} escape=json\n  '${template}';`;
    sampleLine = `{${variables
      .map((variable) => `"${variable.name.slice(1)}":"${variable.sample}"`)
      .join(",")}}`;
  } else {
    const template = variables.map(decorate).join(" ");
    const escapePrefix = escapeMode === "default" ? "" : `escape=${escapeMode} `;
    directive = `log_format ${name} ${escapePrefix}'${template}';`;
    sampleLine = variables.map(decorateSample).join(" ");
  }

  return {
    directive,
    accessLog: `access_log /var/log/nginx/access.log ${name};`,
    sampleLine,
    variableCount: variables.length,
  };
}
