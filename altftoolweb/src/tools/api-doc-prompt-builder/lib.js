/**
 * API Doc Prompt Builder.
 *
 * Parses an endpoint list ("GET /users/{id}" one per line), validates the
 * HTTP methods against the RFC registry, extracts path parameters, and
 * writes a documentation prompt that demands params, auth, error cases and
 * examples for every endpoint in the chosen output format.
 */

/**
 * HTTP request methods defined by RFC 9110 §9 (GET, HEAD, POST, PUT,
 * DELETE, CONNECT, OPTIONS, TRACE) plus PATCH from RFC 5789.
 */
export const HTTP_METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "CONNECT",
  "TRACE",
];

/**
 * Common error statuses with reason phrases from RFC 9110 §15
 * (429 from RFC 6585). Used to seed the error-case section.
 */
export const COMMON_ERROR_STATUSES = [
  { code: 400, phrase: "Bad Request", when: "malformed body or query parameter" },
  { code: 401, phrase: "Unauthorized", when: "missing or invalid credentials" },
  { code: 403, phrase: "Forbidden", when: "valid credentials but no permission" },
  { code: 404, phrase: "Not Found", when: "resource id does not exist" },
  { code: 409, phrase: "Conflict", when: "state conflict, e.g. duplicate or stale version" },
  { code: 422, phrase: "Unprocessable Content", when: "well-formed body that fails validation" },
  { code: 429, phrase: "Too Many Requests", when: "rate limit exceeded" },
  { code: 500, phrase: "Internal Server Error", when: "unexpected server failure" },
];

export const AUTH_SCHEMES = [
  { id: "none", label: "None / public", directive: "State explicitly that the endpoints are public." },
  { id: "bearer", label: "Bearer token (JWT/OAuth2)", directive: "Document the Authorization: Bearer header, token acquisition and expiry behaviour." },
  { id: "apikey", label: "API key", directive: "Document the key header or query parameter name and where keys are issued." },
  { id: "basic", label: "HTTP Basic", directive: "Document the Authorization: Basic scheme and its base64 (not encryption) nature." },
  { id: "session", label: "Session cookie", directive: "Document the cookie name, login endpoint and CSRF requirements." },
];

export const DOC_STYLES = [
  {
    id: "openapi",
    label: "OpenAPI 3.1 (YAML)",
    directive:
      "Produce a single valid OpenAPI 3.1 YAML document: info, servers, paths with operationId, parameters with schema types, requestBody, responses keyed by status code, and components for shared schemas and securitySchemes.",
  },
  {
    id: "markdown",
    label: "Markdown reference",
    directive:
      "Produce a Markdown reference: one H2 per endpoint (METHOD /path), a parameters table (name, in, type, required, description), request/response examples in fenced JSON blocks, and an errors table.",
  },
  {
    id: "readme",
    label: "README quickstart",
    directive:
      "Produce a README section: base URL, auth setup, then one curl example per endpoint with the expected JSON response, ordered by the likeliest first call.",
  },
];

/** Bounds that keep the prompt practical. */
export const LIMITS = { endpoints: { min: 1, max: 40 } };

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

const PATH_PARAM_PATTERN = /\{([^{}/]+)\}/g;
/** Also accept Express/Rails-style ":id" params and normalise them to {id}. */
const COLON_PARAM_PATTERN = /:([A-Za-z_][A-Za-z0-9_]*)/g;

export function getAuthScheme(authId) {
  return AUTH_SCHEMES.find((scheme) => scheme.id === authId) || null;
}

export function getDocStyle(styleId) {
  return DOC_STYLES.find((style) => style.id === styleId) || null;
}

/**
 * Parse "METHOD /path" lines into endpoint objects.
 * Accepts {param} and :param placeholders (":param" is normalised to "{param}").
 * @returns {{error:string}|{endpoints:Array<{method:string,path:string,pathParams:string[]}>}}
 */
export function parseEndpoints(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { error: "List at least one endpoint, e.g. GET /users/{id} — one per line." };
  }
  const endpoints = [];
  const seen = new Set();
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.length === 0) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) {
      return { error: `Line ${index + 1} ("${line}") is not "METHOD /path".` };
    }
    const method = parts[0].toUpperCase();
    if (!HTTP_METHODS.includes(method)) {
      return {
        error: `Line ${index + 1}: "${parts[0]}" is not an HTTP method (RFC 9110 defines ${HTTP_METHODS.slice(0, 6).join(", ")}…).`,
      };
    }
    let path = parts.slice(1).join(" ");
    if (!path.startsWith("/")) {
      return { error: `Line ${index + 1}: the path must start with "/" (got "${path}").` };
    }
    path = path.replace(COLON_PARAM_PATTERN, (unused, name) => `{${name}}`);
    const key = `${method} ${path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const pathParams = [...path.matchAll(PATH_PARAM_PATTERN)].map((match) => match[1]);
    endpoints.push({ method, path, pathParams });
  }
  if (endpoints.length < LIMITS.endpoints.min) {
    return { error: "List at least one endpoint, e.g. GET /users/{id} — one per line." };
  }
  if (endpoints.length > LIMITS.endpoints.max) {
    return { error: `Keep it to ${LIMITS.endpoints.max} endpoints per prompt — split larger APIs by resource.` };
  }
  return { endpoints };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the documentation prompt.
 * @returns {{error:string}|{text:string, parsed:object}}
 */
export function buildApiDocPrompt({ apiName, baseUrl, authId, styleId, notes, parsed } = {}) {
  if (!parsed || parsed.error) return { error: parsed?.error || "Enter a valid endpoint list first." };
  const name = typeof apiName === "string" && apiName.trim() ? apiName.trim() : "";
  if (!name) return { error: "Enter the API name." };
  const auth = getAuthScheme(authId);
  if (!auth) return { error: "Choose an authentication scheme." };
  const style = getDocStyle(styleId);
  if (!style) return { error: "Choose an output format." };
  const base = typeof baseUrl === "string" ? baseUrl.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const totalPathParams = parsed.endpoints.reduce(
    (sum, endpoint) => sum + endpoint.pathParams.length,
    0,
  );

  const lines = [
    `Write API documentation for "${name}". Documentation only — do not invent endpoints beyond the list below.`,
    "",
    `OUTPUT FORMAT: ${style.directive}`,
  ];
  if (base) lines.push(`BASE URL: ${base}`);
  lines.push(
    `AUTHENTICATION: ${auth.label}. ${auth.directive}`,
    "",
    `ENDPOINTS (${parsed.endpoints.length}):`,
  );
  for (const endpoint of parsed.endpoints) {
    const paramNote =
      endpoint.pathParams.length > 0
        ? ` — path params: ${endpoint.pathParams.join(", ")}`
        : "";
    lines.push(`- ${endpoint.method} ${endpoint.path}${paramNote}`);
  }
  lines.push(
    "",
    "FOR EVERY ENDPOINT DOCUMENT:",
    "1. One-sentence purpose, starting with a verb.",
    "2. Every parameter: name, location (path/query/header/body), type, required or optional, constraints, and a realistic example value. Path parameters listed above must all appear.",
    "3. A realistic request example and a realistic success response example with the correct status code (200/201/204 as appropriate).",
    "4. Error cases — at minimum the applicable ones from:",
    ...COMMON_ERROR_STATUSES.map(
      (status) => `   - ${status.code} ${status.phrase}: ${status.when}`,
    ),
    "   with this API's error body shape shown once and referenced.",
    "",
    "RULES:",
    "- Where a detail is not derivable from the endpoint list (field names, constraints, rate limits), insert TODO(verify): rather than inventing it.",
    "- Use the same field-naming convention across all examples.",
    "- Document pagination, filtering and sorting conventions once, then reference them per endpoint.",
    "- State which endpoints are idempotent (per RFC 9110: GET, HEAD, PUT, DELETE, OPTIONS, TRACE) and what retrying each unsafe endpoint does.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return {
    text,
    parsed,
    auth,
    style,
    totalPathParams,
    ...measureText(text),
  };
}
