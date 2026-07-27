/**
 * Caddy v2 Caddyfile generation.
 *
 * Directive names and behaviour follow the Caddy v2 Caddyfile docs:
 *  - A site address without an explicit http:// scheme gets automatic HTTPS
 *    (Caddy provisions and renews certificates itself).
 *  - encode, reverse_proxy, root, file_server, try_files, header, redir, log
 *    are all standard Caddyfile directives.
 *  - The SPA fallback pattern `try_files {path} /index.html` is the one from
 *    the official docs for single-page applications.
 */

/**
 * HSTS max-age of one year (31536000 s) — the minimum required for the
 * hstspreload.org preload list and the value used in most deployment guides.
 */
export const HSTS_DEFAULT_MAX_AGE = 31536000;

/** Sanity cap for HSTS max-age input: two years, per common preload guidance. */
export const HSTS_MAX_AGE_CAP = 63072000;

/**
 * Baseline security response headers (OWASP secure headers project
 * recommendations).
 */
export const SECURITY_HEADERS = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
];

export const MODES = [
  { id: "reverse_proxy", label: "Reverse proxy to an app server" },
  { id: "file_server", label: "Static file server" },
];

/** Site addresses: hostname[:port] or port-only ":8080"; scheme optional, no spaces. */
const ADDRESS_PATTERN =
  /^(:\d{1,5}|(https?:\/\/)?[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?(:\d{1,5})?)$/;
/** Upstreams: host:port (or unix/ socket path). */
const UPSTREAM_PATTERN = /^([a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?(:\d{1,5})?|unix\/.+)$/;

/**
 * Build a Caddyfile.
 *
 * @param {object} input
 * @param {string} input.siteAddress   e.g. "example.com" (automatic HTTPS) or ":8080".
 * @param {"reverse_proxy"|"file_server"} input.mode
 * @param {string} input.upstream      proxy target, e.g. "localhost:3000".
 * @param {string} input.root          web root for file_server, e.g. "/srv/site".
 * @param {boolean} input.spa          add the SPA fallback try_files rule.
 * @param {boolean} input.compress     add `encode zstd gzip`.
 * @param {boolean} input.securityHeaders add baseline security headers.
 * @param {boolean} input.hsts         add Strict-Transport-Security.
 * @param {number}  input.hstsMaxAge   HSTS max-age seconds.
 * @param {boolean} input.wwwRedirect  add a www.<host> -> <host> permanent redirect block.
 * @param {boolean} input.logging      add an access log block.
 * @returns {{config: string, notes: string[], directiveCount: number} | {error: string}}
 */
export function buildCaddyfile({
  siteAddress,
  mode,
  upstream,
  root,
  spa = false,
  compress = true,
  securityHeaders = true,
  hsts = false,
  hstsMaxAge = HSTS_DEFAULT_MAX_AGE,
  wwwRedirect = false,
  logging = false,
}) {
  const address = typeof siteAddress === "string" ? siteAddress.trim() : "";
  if (address === "" || !ADDRESS_PATTERN.test(address)) {
    return { error: "Enter a valid site address such as example.com, sub.example.com or :8080." };
  }
  if (!MODES.some((option) => option.id === mode)) {
    return { error: "Choose reverse proxy or file server mode." };
  }

  const lines = [];
  const notes = [];
  let directiveCount = 0;

  lines.push(`${address} {`);

  if (compress) {
    // Caddy negotiates the best supported encoding; zstd is preferred over gzip.
    lines.push("    encode zstd gzip");
    directiveCount += 1;
  }

  const headerLines = [];
  if (hsts) {
    const maxAge = Number(hstsMaxAge);
    if (!Number.isInteger(maxAge) || maxAge <= 0) {
      return { error: "HSTS max-age must be a positive whole number of seconds." };
    }
    if (maxAge > HSTS_MAX_AGE_CAP) {
      return { error: "HSTS max-age above two years is almost certainly a unit mistake." };
    }
    headerLines.push(
      `        Strict-Transport-Security "max-age=${maxAge}; includeSubDomains"`,
    );
    notes.push(
      "HSTS makes browsers refuse plain-HTTP for the whole max-age window — enable it only once HTTPS works everywhere, including subdomains.",
    );
  }
  if (securityHeaders) {
    for (const [name, value] of SECURITY_HEADERS) {
      headerLines.push(`        ${name} "${value}"`);
    }
  }
  if (headerLines.length > 0) {
    lines.push("    header {");
    lines.push(...headerLines);
    lines.push("    }");
    directiveCount += 1;
  }

  if (mode === "reverse_proxy") {
    const target = typeof upstream === "string" ? upstream.trim() : "";
    if (target === "" || !UPSTREAM_PATTERN.test(target)) {
      return { error: "Enter a valid upstream such as localhost:3000 or 127.0.0.1:8080." };
    }
    lines.push(`    reverse_proxy ${target}`);
    directiveCount += 1;
    notes.push(
      "reverse_proxy passes Host and X-Forwarded-* headers upstream automatically — no manual proxy_set_header lines needed.",
    );
  } else {
    const webRoot = typeof root === "string" ? root.trim() : "";
    if (webRoot === "" || webRoot.includes(" ") || !webRoot.startsWith("/")) {
      return { error: "Enter an absolute web root path such as /srv/mysite (no spaces)." };
    }
    lines.push(`    root * ${webRoot}`);
    if (spa) {
      // Official SPA pattern: serve index.html for any path that is not a real file.
      lines.push("    try_files {path} /index.html");
      directiveCount += 1;
    }
    lines.push("    file_server");
    directiveCount += 2;
  }

  if (logging) {
    const safeName = address.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.-]/g, "_");
    lines.push("    log {");
    lines.push(`        output file /var/log/caddy/${safeName}.log`);
    lines.push("    }");
    directiveCount += 1;
  }

  lines.push("}");

  const bareHost = address.replace(/^https?:\/\//, "").replace(/:\d+$/, "");
  const isPortOnly = address.startsWith(":");
  if (wwwRedirect) {
    if (isPortOnly || bareHost.startsWith("www.")) {
      return { error: "The www redirect needs a bare domain address like example.com." };
    }
    lines.push("");
    lines.push(`www.${bareHost} {`);
    lines.push(`    redir https://${bareHost}{uri} permanent`);
    lines.push("}");
    directiveCount += 1;
  }

  if (isPortOnly) {
    notes.push("Port-only addresses serve plain HTTP on all interfaces; automatic HTTPS needs a hostname.");
  } else if (!address.startsWith("http://")) {
    notes.push("With a hostname and no http:// prefix, Caddy provisions and renews TLS certificates automatically.");
  }

  return { config: lines.join("\n"), notes, directiveCount };
}
