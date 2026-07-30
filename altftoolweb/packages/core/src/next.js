const PERMISSIONS_POLICY = {
  public:
    "camera=(self), microphone=(self), geolocation=(self), fullscreen=(self), payment=(), usb=(), serial=()",
  admin:
    "camera=(), microphone=(), geolocation=(self), fullscreen=(self), payment=(), usb=(), serial=()",
};

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "media-src 'self' data: blob: https:",
  "connect-src 'self' https: ws: wss:",
  "frame-src 'self' https: blob:",
  "worker-src 'self' blob: https:",
  "manifest-src 'self'",
  // report-uri is the legacy directive Firefox/Safari still rely on;
  // report-to points at the modern Reporting API group registered via the
  // Reporting-Endpoints header below. Both point at the same collector so
  // every browser's violation reports land somewhere visible instead of
  // only a visitor's own DevTools console — the prerequisite for ever
  // safely graduating this policy from Report-Only to enforced.
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
];

export function createSecurityHeaders(app = "public") {
  const headers = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    { key: "X-Download-Options", value: "noopen" },
    { key: "Origin-Agent-Cluster", value: "?1" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Content-Security-Policy-Report-Only",
      value: CSP_DIRECTIVES.join("; "),
    },
    {
      // Registers the "csp-endpoint" group the CSP's report-to directive
      // references. Modern (Reporting API) browsers deliver batched
      // violation reports here; older ones use report-uri directly.
      key: "Reporting-Endpoints",
      value: 'csp-endpoint="/api/csp-report"',
    },
    {
      key: "Permissions-Policy",
      value: PERMISSIONS_POLICY[app] || PERMISSIONS_POLICY.public,
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
  ];

  if (app === "admin") {
    headers.push({
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive",
    });
  }

  return headers;
}

export function withSecurityHeaders(nextConfig = {}, app = "public") {
  const existingHeaders = nextConfig.headers;

  return {
    ...nextConfig,
    async headers() {
      const inherited = typeof existingHeaders === "function" ? await existingHeaders() : [];
      // Catch-all security defaults FIRST, app-specific rules after: when two
      // sources match the same path and set the same header key, Next.js lets
      // the last one win, so apps can relax a default on specific routes
      // (e.g. framing headers on /embed/widget/*) without losing the rest.
      return [
        {
          source: "/:path*",
          headers: createSecurityHeaders(app),
        },
        ...inherited,
      ];
    },
  };
}
