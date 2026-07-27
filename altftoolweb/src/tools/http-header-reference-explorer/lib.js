/**
 * HTTP header reference data and search.
 *
 * Header semantics follow RFC 9110 (HTTP Semantics), RFC 9111 (HTTP Caching),
 * RFC 6265 (Cookies), the Fetch Standard (CORS headers) and de-facto usage
 * documented on MDN. Directions: "request", "response" or "both".
 */

export const DIRECTIONS = ["all", "request", "response", "both"];

export const CATEGORIES = [
  "All",
  "Authentication",
  "Caching",
  "Conditional",
  "Content",
  "Negotiation",
  "CORS",
  "Cookies",
  "Security",
  "Connection",
  "Range",
  "Redirect & Context",
  "Proxy",
];

/**
 * Each entry: { name, direction, category, description, example, spec }
 * Spec references cite the defining document for the header.
 */
export const HEADERS = [
  // Authentication — RFC 9110 §11
  { name: "Authorization", direction: "request", category: "Authentication", description: "Credentials that authenticate the client with the origin server, usually a scheme name followed by a token.", example: "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...", spec: "RFC 9110 §11.6.2" },
  { name: "WWW-Authenticate", direction: "response", category: "Authentication", description: "Sent with 401 Unauthorized to state which authentication scheme and realm the client must use.", example: 'WWW-Authenticate: Basic realm="admin"', spec: "RFC 9110 §11.6.1" },
  { name: "Proxy-Authorization", direction: "request", category: "Authentication", description: "Credentials that authenticate the client with a proxy, in response to Proxy-Authenticate.", example: "Proxy-Authorization: Basic dXNlcjpwYXNz", spec: "RFC 9110 §11.7.2" },
  { name: "Proxy-Authenticate", direction: "response", category: "Authentication", description: "Sent with 407 to state the authentication scheme required by the proxy.", example: 'Proxy-Authenticate: Basic realm="proxy"', spec: "RFC 9110 §11.7.1" },

  // Caching — RFC 9111
  { name: "Cache-Control", direction: "both", category: "Caching", description: "Directives that control how caches store and reuse the message, such as max-age, no-store and private.", example: "Cache-Control: public, max-age=31536000, immutable", spec: "RFC 9111 §5.2" },
  { name: "Age", direction: "response", category: "Caching", description: "Seconds the response has spent in a cache since it was fetched from the origin.", example: "Age: 24", spec: "RFC 9111 §5.1" },
  { name: "Expires", direction: "response", category: "Caching", description: "Absolute date after which the response is stale. Cache-Control max-age wins when both are present.", example: "Expires: Wed, 21 Oct 2026 07:28:00 GMT", spec: "RFC 9111 §5.3" },
  { name: "Vary", direction: "response", category: "Caching", description: "Request headers a cache must match before reusing this response, e.g. varying HTML by Accept-Encoding.", example: "Vary: Accept-Encoding, Origin", spec: "RFC 9110 §12.5.5" },
  { name: "ETag", direction: "response", category: "Caching", description: "Opaque validator for the current representation, used by conditional requests to detect changes cheaply.", example: 'ETag: "33a64df551425fcc55e4d42a148795d9"', spec: "RFC 9110 §8.8.3" },
  { name: "Last-Modified", direction: "response", category: "Caching", description: "Date the representation was last changed; a weaker validator than ETag for conditional requests.", example: "Last-Modified: Tue, 22 Feb 2022 22:00:00 GMT", spec: "RFC 9110 §8.8.2" },

  // Conditional — RFC 9110 §13
  { name: "If-None-Match", direction: "request", category: "Conditional", description: "Makes the request conditional on the ETag not matching; the server answers 304 Not Modified on a match.", example: 'If-None-Match: "33a64df551425fcc55e4d42a148795d9"', spec: "RFC 9110 §13.1.2" },
  { name: "If-Match", direction: "request", category: "Conditional", description: "Proceed only if the ETag matches — the standard guard against lost updates on PUT.", example: 'If-Match: "33a64df551425fcc55e4d42a148795d9"', spec: "RFC 9110 §13.1.1" },
  { name: "If-Modified-Since", direction: "request", category: "Conditional", description: "Return the resource only if changed after this date; otherwise the server answers 304.", example: "If-Modified-Since: Tue, 22 Feb 2022 22:00:00 GMT", spec: "RFC 9110 §13.1.3" },
  { name: "If-Unmodified-Since", direction: "request", category: "Conditional", description: "Proceed only if the resource is unchanged since this date, else the server answers 412.", example: "If-Unmodified-Since: Tue, 22 Feb 2022 22:00:00 GMT", spec: "RFC 9110 §13.1.4" },
  { name: "If-Range", direction: "request", category: "Conditional", description: "With Range: send the partial content if the validator still matches, otherwise the whole resource.", example: 'If-Range: "33a64df551425fcc55e4d42a148795d9"', spec: "RFC 9110 §13.1.5" },

  // Content — RFC 9110 §8
  { name: "Content-Type", direction: "both", category: "Content", description: "Media type of the body, optionally with a charset or boundary parameter.", example: "Content-Type: application/json; charset=utf-8", spec: "RFC 9110 §8.3" },
  { name: "Content-Length", direction: "both", category: "Content", description: "Size of the body in bytes. Absent when Transfer-Encoding: chunked is used.", example: "Content-Length: 3495", spec: "RFC 9110 §8.6" },
  { name: "Content-Encoding", direction: "both", category: "Content", description: "Codings applied to the body, such as gzip or br, which the receiver must decode.", example: "Content-Encoding: br", spec: "RFC 9110 §8.4" },
  { name: "Content-Language", direction: "both", category: "Content", description: "Natural language of the intended audience for the body.", example: "Content-Language: en-GB", spec: "RFC 9110 §8.5" },
  { name: "Content-Disposition", direction: "response", category: "Content", description: "Whether the body renders inline or downloads as an attachment, with a suggested filename.", example: 'Content-Disposition: attachment; filename="report.pdf"', spec: "RFC 6266" },
  { name: "Content-Location", direction: "response", category: "Content", description: "URL of the returned representation when it differs from the request URL.", example: "Content-Location: /documents/report.en.pdf", spec: "RFC 9110 §8.7" },
  { name: "Transfer-Encoding", direction: "both", category: "Content", description: "Hop-by-hop framing of the body, most commonly chunked. Not allowed in HTTP/2 and HTTP/3.", example: "Transfer-Encoding: chunked", spec: "RFC 9112 §6.1" },

  // Negotiation — RFC 9110 §12
  { name: "Accept", direction: "request", category: "Negotiation", description: "Media types the client can process, with q-values expressing preference order.", example: "Accept: text/html, application/json;q=0.9, */*;q=0.8", spec: "RFC 9110 §12.5.1" },
  { name: "Accept-Encoding", direction: "request", category: "Negotiation", description: "Content codings the client can decode, such as gzip, br and zstd.", example: "Accept-Encoding: gzip, deflate, br", spec: "RFC 9110 §12.5.3" },
  { name: "Accept-Language", direction: "request", category: "Negotiation", description: "Preferred natural languages for the response, with q-values.", example: "Accept-Language: en-GB, en;q=0.9, hi;q=0.8", spec: "RFC 9110 §12.5.4" },
  { name: "Accept-Charset", direction: "request", category: "Negotiation", description: "Character sets the client prefers. Effectively obsolete — modern clients send UTF-8 implicitly.", example: "Accept-Charset: utf-8", spec: "RFC 9110 §12.5.2" },

  // CORS — Fetch Standard
  { name: "Origin", direction: "request", category: "CORS", description: "Scheme, host and port the request originated from; sent on cross-origin and most POST requests.", example: "Origin: https://app.example.com", spec: "RFC 6454 / Fetch" },
  { name: "Access-Control-Allow-Origin", direction: "response", category: "CORS", description: "Origin allowed to read the response, or * for any origin without credentials.", example: "Access-Control-Allow-Origin: https://app.example.com", spec: "Fetch Standard" },
  { name: "Access-Control-Allow-Methods", direction: "response", category: "CORS", description: "Methods permitted for the actual request, returned on a preflight response.", example: "Access-Control-Allow-Methods: GET, POST, DELETE", spec: "Fetch Standard" },
  { name: "Access-Control-Allow-Headers", direction: "response", category: "CORS", description: "Request headers permitted for the actual request, returned on a preflight response.", example: "Access-Control-Allow-Headers: Content-Type, Authorization", spec: "Fetch Standard" },
  { name: "Access-Control-Allow-Credentials", direction: "response", category: "CORS", description: "Whether the browser may expose the response when credentials (cookies, TLS certs) were sent.", example: "Access-Control-Allow-Credentials: true", spec: "Fetch Standard" },
  { name: "Access-Control-Expose-Headers", direction: "response", category: "CORS", description: "Response headers script may read beyond the CORS-safelisted set.", example: "Access-Control-Expose-Headers: X-Request-Id", spec: "Fetch Standard" },
  { name: "Access-Control-Max-Age", direction: "response", category: "CORS", description: "Seconds the browser may cache the preflight result. Chromium caps this at 7200.", example: "Access-Control-Max-Age: 7200", spec: "Fetch Standard" },
  { name: "Access-Control-Request-Method", direction: "request", category: "CORS", description: "Method of the upcoming actual request, sent by the browser on a preflight OPTIONS.", example: "Access-Control-Request-Method: DELETE", spec: "Fetch Standard" },
  { name: "Access-Control-Request-Headers", direction: "request", category: "CORS", description: "Non-safelisted headers the actual request will carry, sent on a preflight OPTIONS.", example: "Access-Control-Request-Headers: content-type, x-api-key", spec: "Fetch Standard" },

  // Cookies — RFC 6265
  { name: "Cookie", direction: "request", category: "Cookies", description: "Name=value pairs previously stored by Set-Cookie, sent back to the matching origin.", example: "Cookie: session=abc123; theme=dark", spec: "RFC 6265 §5.4" },
  { name: "Set-Cookie", direction: "response", category: "Cookies", description: "Stores a cookie in the client, with attributes such as HttpOnly, Secure, SameSite, Max-Age and Path.", example: "Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/", spec: "RFC 6265 §5.2" },

  // Security
  { name: "Strict-Transport-Security", direction: "response", category: "Security", description: "Instructs the browser to use HTTPS only for this host for max-age seconds (HSTS).", example: "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload", spec: "RFC 6797" },
  { name: "Content-Security-Policy", direction: "response", category: "Security", description: "Allowlists for scripts, styles, frames and other resources — the main defence against XSS.", example: "Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com", spec: "CSP Level 3" },
  { name: "X-Content-Type-Options", direction: "response", category: "Security", description: "nosniff stops browsers from guessing a media type different from Content-Type.", example: "X-Content-Type-Options: nosniff", spec: "Fetch Standard" },
  { name: "X-Frame-Options", direction: "response", category: "Security", description: "Blocks the page from being framed (clickjacking defence). Superseded by CSP frame-ancestors.", example: "X-Frame-Options: DENY", spec: "RFC 7034" },
  { name: "Referrer-Policy", direction: "response", category: "Security", description: "How much of the current URL is sent in the Referer header on outgoing navigation and requests.", example: "Referrer-Policy: strict-origin-when-cross-origin", spec: "Referrer Policy spec" },
  { name: "Permissions-Policy", direction: "response", category: "Security", description: "Enables or blocks browser features such as camera, geolocation and payment per origin.", example: "Permissions-Policy: camera=(), geolocation=(self)", spec: "Permissions Policy spec" },
  { name: "Cross-Origin-Opener-Policy", direction: "response", category: "Security", description: "Isolates the browsing context group from cross-origin windows; part of cross-origin isolation.", example: "Cross-Origin-Opener-Policy: same-origin", spec: "HTML Standard" },
  { name: "Cross-Origin-Embedder-Policy", direction: "response", category: "Security", description: "Requires subresources to opt in via CORS or CORP; needed for SharedArrayBuffer.", example: "Cross-Origin-Embedder-Policy: require-corp", spec: "HTML Standard" },
  { name: "Cross-Origin-Resource-Policy", direction: "response", category: "Security", description: "Declares who may embed this resource: same-origin, same-site or cross-origin.", example: "Cross-Origin-Resource-Policy: same-site", spec: "Fetch Standard" },

  // Connection
  { name: "Host", direction: "request", category: "Connection", description: "Target host and port. Mandatory in HTTP/1.1; replaced by the :authority pseudo-header in HTTP/2+.", example: "Host: api.example.com", spec: "RFC 9110 §7.2" },
  { name: "Connection", direction: "both", category: "Connection", description: "Hop-by-hop options such as keep-alive or close. Forbidden in HTTP/2 and HTTP/3.", example: "Connection: keep-alive", spec: "RFC 9110 §7.6.1" },
  { name: "Keep-Alive", direction: "both", category: "Connection", description: "Timeout and max request hints for a persistent HTTP/1.1 connection.", example: "Keep-Alive: timeout=5, max=1000", spec: "RFC 9112 App. C" },
  { name: "Upgrade", direction: "both", category: "Connection", description: "Asks to switch protocols on this connection, most commonly to WebSocket.", example: "Upgrade: websocket", spec: "RFC 9110 §7.8" },

  // Range — RFC 9110 §14
  { name: "Range", direction: "request", category: "Range", description: "Requests specific byte ranges of a resource, used for resumable downloads and media seeking.", example: "Range: bytes=0-1023", spec: "RFC 9110 §14.2" },
  { name: "Accept-Ranges", direction: "response", category: "Range", description: "Advertises that the server supports range requests, normally in bytes.", example: "Accept-Ranges: bytes", spec: "RFC 9110 §14.3" },
  { name: "Content-Range", direction: "response", category: "Range", description: "Which bytes of the full resource a 206 Partial Content response carries.", example: "Content-Range: bytes 0-1023/146515", spec: "RFC 9110 §14.4" },

  // Redirect & context
  { name: "Location", direction: "response", category: "Redirect & Context", description: "Target URL of a 3xx redirect, or the URL of a resource created by a 201.", example: "Location: https://example.com/new-page", spec: "RFC 9110 §10.2.2" },
  { name: "Referer", direction: "request", category: "Redirect & Context", description: "URL of the page that linked to or issued this request. Spelling is a historical typo in the spec.", example: "Referer: https://example.com/search?q=shoes", spec: "RFC 9110 §10.1.3" },
  { name: "User-Agent", direction: "request", category: "Redirect & Context", description: "Client software identifier string, used for logging and (reluctantly) content adaptation.", example: "User-Agent: Mozilla/5.0 (X11; Linux x86_64) ...", spec: "RFC 9110 §10.1.5" },
  { name: "Server", direction: "response", category: "Redirect & Context", description: "Software identifier of the origin server.", example: "Server: nginx/1.25.3", spec: "RFC 9110 §10.2.4" },
  { name: "Retry-After", direction: "response", category: "Redirect & Context", description: "Seconds (or a date) to wait before retrying, sent with 429 and 503 responses.", example: "Retry-After: 120", spec: "RFC 9110 §10.2.3" },
  { name: "Allow", direction: "response", category: "Redirect & Context", description: "Methods supported by the target resource, required in a 405 Method Not Allowed response.", example: "Allow: GET, HEAD, PUT", spec: "RFC 9110 §10.2.1" },
  { name: "Date", direction: "both", category: "Redirect & Context", description: "Date and time the message was generated, in IMF-fixdate format.", example: "Date: Sat, 26 Jul 2026 08:30:00 GMT", spec: "RFC 9110 §6.6.1" },
  { name: "Expect", direction: "request", category: "Redirect & Context", description: "100-continue asks the server to confirm before the client sends a large body.", example: "Expect: 100-continue", spec: "RFC 9110 §10.1.1" },
  { name: "Link", direction: "response", category: "Redirect & Context", description: "Typed relations to other resources — pagination rels, preload hints and canonical URLs.", example: 'Link: <https://api.example.com/items?page=2>; rel="next"', spec: "RFC 8288" },

  // Proxy
  { name: "Forwarded", direction: "request", category: "Proxy", description: "Standardised record of the client IP, protocol and host as seen by each proxy hop.", example: "Forwarded: for=192.0.2.60; proto=https; host=example.com", spec: "RFC 7239" },
  { name: "X-Forwarded-For", direction: "request", category: "Proxy", description: "De-facto list of client and proxy IPs, appended by each hop. Only the last hop is trustworthy.", example: "X-Forwarded-For: 203.0.113.7, 150.172.238.178", spec: "de-facto (pre-RFC 7239)" },
  { name: "X-Forwarded-Proto", direction: "request", category: "Proxy", description: "Original scheme (http or https) the client used before TLS termination at the proxy.", example: "X-Forwarded-Proto: https", spec: "de-facto" },
  { name: "X-Forwarded-Host", direction: "request", category: "Proxy", description: "Original Host header the client sent before the proxy rewrote it.", example: "X-Forwarded-Host: shop.example.com", spec: "de-facto" },
  { name: "Via", direction: "both", category: "Proxy", description: "Protocol versions and pseudonyms of intermediaries the message passed through.", example: "Via: 1.1 vegur, 1.1 varnish", spec: "RFC 9110 §7.6.3" },
];

/**
 * Filter the header table.
 * Total function: returns { results, total } and never throws on odd input.
 *
 * @param {object} input
 * @param {string} [input.query]      Free-text match against name, description and example.
 * @param {string} [input.direction]  "all" | "request" | "response" | "both".
 * @param {string} [input.category]   "All" or one of CATEGORIES.
 */
export function searchHeaders({ query = "", direction = "all", category = "All" } = {}) {
  const q = String(query || "").trim().toLowerCase();
  const dir = DIRECTIONS.includes(direction) ? direction : "all";
  const cat = CATEGORIES.includes(category) ? category : "All";

  const results = HEADERS.filter((h) => {
    if (dir !== "all" && h.direction !== dir) return false;
    if (cat !== "All" && h.category !== cat) return false;
    if (q === "") return true;
    return (
      h.name.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.example.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q)
    );
  });

  return { results, total: HEADERS.length };
}

/** Plain-text summary of one header, for the copy button. */
export function formatHeader(header) {
  if (!header || typeof header.name !== "string") return "";
  return [
    `${header.name} (${header.direction} header — ${header.category})`,
    header.description,
    `Example: ${header.example}`,
    `Defined in: ${header.spec}`,
  ].join("\n");
}
