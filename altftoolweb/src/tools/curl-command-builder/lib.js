/**
 * Pure curl command composition.
 *
 * Flag behaviour follows the curl manual (curl 8.x, `man 1 curl`). Nothing is
 * fetched or executed here — the module only turns options into a string.
 */

/** Methods curl can send. Custom verbs are allowed too, via -X. */
export const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

/** Methods that are defined as having no request body (RFC 9110 §9.3). */
export const BODYLESS_METHODS = ["GET", "HEAD", "DELETE", "OPTIONS"];

export const AUTH_TYPES = [
  { id: "none", label: "No auth" },
  { id: "basic", label: "Basic (-u user:pass)" },
  { id: "bearer", label: "Bearer token" },
  { id: "apikey", label: "API key header" },
];

export const BODY_TYPES = [
  { id: "none", label: "No body" },
  { id: "json", label: "JSON (application/json)" },
  { id: "form", label: "Form URL-encoded" },
  { id: "multipart", label: "Multipart form (-F)" },
  { id: "raw", label: "Raw body" },
  { id: "file", label: "File contents (-d @file)" },
];

export const HTTP_VERSIONS = [
  { id: "default", label: "Negotiate (default)", flag: "" },
  { id: "http1.1", label: "Force HTTP/1.1", flag: "--http1.1" },
  { id: "http2", label: "Force HTTP/2", flag: "--http2" },
  { id: "http3", label: "Force HTTP/3", flag: "--http3" },
];

/** curl's own default connect timeout is 300 s; anything above a day is a typo. */
export const MAX_TIMEOUT_SECONDS = 86400;
/** curl caps --retry at a sane operational number for this builder. */
export const MAX_RETRIES = 20;

const SAFE_ARG = /^[A-Za-z0-9_@%+=:,./-]+$/;
const METHOD_TOKEN = /^[A-Za-z]+$/;

/** Quote a single shell argument using POSIX single-quote escaping. */
export function shellQuote(value) {
  const raw = String(value ?? "");
  if (raw === "") return "''";
  if (SAFE_ARG.test(raw)) return raw;
  return `'${raw.replace(/'/g, `'\\''`)}'`;
}

/** Split a textarea into trimmed, non-empty lines. */
export function toList(value) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Parse "Name: value" header lines. Lines without a colon are reported back. */
export function parseHeaderLines(lines) {
  const valid = [];
  const invalid = [];
  for (const line of toList(lines)) {
    const index = line.indexOf(":");
    if (index <= 0) {
      invalid.push(line);
      continue;
    }
    const name = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!name) invalid.push(line);
    else valid.push([name, value]);
  }
  return { valid, invalid };
}

/** Parse "key=value" pairs, keeping everything after the first = as the value. */
export function parsePairLines(lines) {
  const valid = [];
  const invalid = [];
  for (const line of toList(lines)) {
    const index = line.indexOf("=");
    if (index <= 0) {
      invalid.push(line);
      continue;
    }
    valid.push([line.slice(0, index).trim(), line.slice(index + 1)]);
  }
  return { valid, invalid };
}

/** Append query parameters to a URL with percent-encoding. */
export function appendQuery(url, pairs) {
  if (!pairs.length) return url;
  const encoded = pairs
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  return url.includes("?") ? `${url}&${encoded}` : `${url}?${encoded}`;
}

/**
 * Build a curl invocation.
 *
 * @returns {{command:string, flags:Array<[string,string]>, warnings:string[],
 *            url:string, method:string}} or {error:string}
 */
export function buildCurlCommand(options = {}) {
  const {
    url = "",
    method = "GET",
    headerLines = "",
    queryLines = "",
    authType = "none",
    username = "",
    password = "",
    token = "",
    apiKeyHeader = "X-API-Key",
    apiKeyValue = "",
    bodyType = "none",
    body = "",
    formLines = "",
    bodyFilePath = "",
    followRedirects = false,
    insecure = false,
    silent = false,
    showErrors = false,
    includeHeaders = false,
    verbose = false,
    compressed = false,
    outputFile = "",
    remoteName = false,
    maxTime = "",
    connectTimeout = "",
    retries = "",
    proxy = "",
    httpVersion = "default",
    cookieJar = "",
    writeOutStatus = false,
    multiline = false,
  } = options;

  const rawUrl = String(url ?? "").trim();
  if (!rawUrl) return { error: "Enter a URL, for example https://api.example.com/v1/users." };
  if (/\s/.test(rawUrl)) return { error: "The URL contains a space. Percent-encode it as %20 first." };

  const verb = String(method ?? "").trim().toUpperCase();
  if (!METHOD_TOKEN.test(verb)) return { error: "The HTTP method must be letters only, such as GET or POST." };

  const numeric = (value, label, max) => {
    const raw = String(value ?? "").trim();
    if (raw === "") return { ok: true, value: null };
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return { ok: false, message: `${label} must be zero or more.` };
    if (parsed > max) return { ok: false, message: `${label} above ${max} is almost certainly a mistake.` };
    return { ok: true, value: parsed };
  };

  const maxTimeCheck = numeric(maxTime, "Max time", MAX_TIMEOUT_SECONDS);
  if (!maxTimeCheck.ok) return { error: maxTimeCheck.message };
  const connectCheck = numeric(connectTimeout, "Connect timeout", MAX_TIMEOUT_SECONDS);
  if (!connectCheck.ok) return { error: connectCheck.message };
  const retryCheck = numeric(retries, "Retry count", MAX_RETRIES);
  if (!retryCheck.ok) return { error: retryCheck.message };

  const headers = parseHeaderLines(headerLines);
  if (headers.invalid.length > 0) {
    return { error: `Header lines need a colon, like "Accept: application/json". Fix: ${headers.invalid[0]}` };
  }

  const query = parsePairLines(queryLines);
  if (query.invalid.length > 0) {
    return { error: `Query parameters need key=value. Fix: ${query.invalid[0]}` };
  }

  const form = parsePairLines(formLines);
  if ((bodyType === "form" || bodyType === "multipart") && form.invalid.length > 0) {
    return { error: `Form fields need key=value. Fix: ${form.invalid[0]}` };
  }
  if ((bodyType === "form" || bodyType === "multipart") && form.valid.length === 0) {
    return { error: "Add at least one key=value form field, or switch the body type to None." };
  }
  if (bodyType === "raw" && !String(body).trim()) {
    return { error: "Raw body is empty. Type the body or switch the body type to None." };
  }
  if (bodyType === "json" && !String(body).trim()) {
    return { error: "JSON body is empty. Type the JSON payload or switch the body type to None." };
  }
  if (bodyType === "file" && !String(bodyFilePath).trim()) {
    return { error: "Enter the path of the file whose contents curl should send." };
  }
  if (authType === "basic" && !String(username).trim()) {
    return { error: "Basic auth needs a username." };
  }
  if (authType === "bearer" && !String(token).trim()) {
    return { error: "Bearer auth needs a token value." };
  }
  if (authType === "apikey" && (!String(apiKeyHeader).trim() || !String(apiKeyValue).trim())) {
    return { error: "An API key needs both a header name and a value." };
  }
  if (outputFile && remoteName) {
    return { error: "Use either -o with a filename or -O for the remote name, not both." };
  }

  let jsonValid = true;
  if (bodyType === "json") {
    try {
      JSON.parse(body);
    } catch {
      jsonValid = false;
    }
  }

  const finalUrl = appendQuery(rawUrl, query.valid);
  const flags = [];
  const args = [];

  const push = (arg, flagName, meaning) => {
    args.push(arg);
    if (flagName) flags.push([flagName, meaning]);
  };

  const bodyPresent = bodyType !== "none";
  const methodIsImplied =
    (verb === "GET" && !bodyPresent) || (verb === "POST" && bodyPresent && bodyType !== "file");

  if (!methodIsImplied) {
    push(`-X ${verb}`, "-X", `Send the request with the ${verb} method.`);
  }

  if (silent) push("-s", "-s", "Hide the progress meter and error text.");
  if (showErrors) push("-S", "-S", "Still print the error message when -s is on.");
  if (verbose) push("-v", "-v", "Print the full request and response headers to stderr.");
  if (includeHeaders) push("-i", "-i", "Include the response headers in the output body.");
  if (followRedirects) push("-L", "-L", "Follow 3xx redirects to the new location.");
  if (compressed) push("--compressed", "--compressed", "Ask for gzip/br and decompress the response automatically.");
  if (insecure) push("-k", "-k", "Skip TLS certificate verification.");

  const versionSpec = HTTP_VERSIONS.find((item) => item.id === httpVersion);
  if (versionSpec && versionSpec.flag) {
    push(versionSpec.flag, versionSpec.flag, versionSpec.label);
  }

  if (connectCheck.value !== null) {
    push(`--connect-timeout ${connectCheck.value}`, "--connect-timeout", "Give up if the TCP/TLS handshake takes longer than this.");
  }
  if (maxTimeCheck.value !== null) {
    push(`--max-time ${maxTimeCheck.value}`, "--max-time", "Abort the whole transfer after this many seconds.");
  }
  if (retryCheck.value !== null && retryCheck.value > 0) {
    push(`--retry ${retryCheck.value}`, "--retry", "Retry transient failures with exponential backoff.");
  }

  if (proxy) push(`-x ${shellQuote(proxy)}`, "-x", "Route the request through this proxy.");
  if (cookieJar) {
    push(`-c ${shellQuote(cookieJar)}`, "-c", "Write received cookies to this jar file.");
    push(`-b ${shellQuote(cookieJar)}`, "-b", "Send cookies previously stored in the jar.");
  }

  if (authType === "basic") {
    const pair = password ? `${username}:${password}` : `${username}`;
    push(`-u ${shellQuote(pair)}`, "-u", "Send HTTP Basic credentials (base64 of user:password).");
  } else if (authType === "bearer") {
    push(`-H ${shellQuote(`Authorization: Bearer ${token}`)}`, "-H", "Send the bearer token in the Authorization header.");
  } else if (authType === "apikey") {
    push(`-H ${shellQuote(`${apiKeyHeader}: ${apiKeyValue}`)}`, "-H", "Send the API key in a custom header.");
  }

  if (bodyType === "json") {
    push(`-H ${shellQuote("Content-Type: application/json")}`, "-H", "Declare the request body as JSON.");
  }

  for (const [name, value] of headers.valid) {
    args.push(`-H ${shellQuote(`${name}: ${value}`)}`);
  }
  if (headers.valid.length > 0) {
    flags.push(["-H", "Add a custom request header."]);
  }

  if (bodyType === "json" || bodyType === "raw") {
    push(`-d ${shellQuote(body)}`, "-d", "Send this data as the request body.");
  } else if (bodyType === "form") {
    for (const [key, value] of form.valid) {
      args.push(`--data-urlencode ${shellQuote(`${key}=${value}`)}`);
    }
    flags.push(["--data-urlencode", "URL-encode each field and send as application/x-www-form-urlencoded."]);
  } else if (bodyType === "multipart") {
    for (const [key, value] of form.valid) {
      args.push(`-F ${shellQuote(`${key}=${value}`)}`);
    }
    flags.push(["-F", "Send a multipart/form-data field; prefix a value with @ to upload a file."]);
  } else if (bodyType === "file") {
    push(`-d @${shellQuote(bodyFilePath)}`, "-d @file", "Read the request body from a file on disk.");
  }

  if (outputFile) push(`-o ${shellQuote(outputFile)}`, "-o", "Write the response body to this file.");
  if (remoteName) push("-O", "-O", "Save the response using the file name from the URL.");
  if (writeOutStatus) {
    push(`-w ${shellQuote("\\n%{http_code} %{time_total}s\\n")}`, "-w", "Print the status code and total time after the transfer.");
  }

  args.push(shellQuote(finalUrl));

  const oneLine = ["curl", ...args].join(" ");
  const wrapped = ["curl", ...args].join(" \\\n  ");

  const warnings = [];
  if (!/^https?:\/\//i.test(finalUrl) && !/^[a-z][a-z0-9+.-]*:\/\//i.test(finalUrl)) {
    warnings.push("No scheme in the URL, so curl will assume http://. Type https:// explicitly for anything authenticated.");
  }
  if (/^http:\/\//i.test(finalUrl) && authType !== "none") {
    warnings.push("You are sending credentials over plain http://. Anyone on the path can read them — use https://.");
  }
  if (insecure) {
    warnings.push("-k disables certificate checking, which defeats TLS entirely. Use it only against a local test server, never in production.");
  }
  if (BODYLESS_METHODS.includes(verb) && bodyPresent) {
    warnings.push(`${verb} requests are not defined to carry a body; many proxies and servers will drop it.`);
  }
  if (authType === "basic" && password) {
    warnings.push("A password on the command line is visible in shell history and in ps output. Use -u user and let curl prompt, or a .netrc file.");
  }
  if (authType === "bearer" || authType === "apikey") {
    warnings.push("Secrets pasted into a command line end up in your shell history. Reference an environment variable such as $TOKEN instead.");
  }
  if (bodyType === "json" && !jsonValid) {
    warnings.push("The body is not valid JSON, so the server will most likely answer 400. curl itself does not validate it.");
  }
  if (bodyPresent && verb === "POST" && !methodIsImplied) {
    warnings.push("-X POST is redundant when -d is present; curl already switches to POST.");
  }
  if (followRedirects && authType !== "none") {
    warnings.push("With -L curl drops the Authorization header when the redirect crosses to another host, so a redirected call may return 401.");
  }
  if (silent && !showErrors) {
    warnings.push("-s hides errors too. In scripts pair it with -S so failures still print, and add -f to make curl exit non-zero on HTTP 4xx/5xx.");
  }

  return {
    command: multiline ? wrapped : oneLine,
    oneLine,
    wrapped,
    flags,
    warnings,
    url: finalUrl,
    method: verb,
    headerCount: headers.valid.length,
    bodyType,
  };
}
