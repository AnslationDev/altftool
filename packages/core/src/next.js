const PERMISSIONS_POLICY = {
  public:
    "camera=(self), microphone=(self), geolocation=(self), fullscreen=(self), payment=(), usb=(), serial=()",
  admin:
    "camera=(), microphone=(), geolocation=(), fullscreen=(self), payment=(), usb=(), serial=()",
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
];

export function createSecurityHeaders(app = "public") {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    { key: "X-Download-Options", value: "noopen" },
    { key: "Origin-Agent-Cluster", value: "?1" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Content-Security-Policy-Report-Only",
      value: CSP_DIRECTIVES.join("; "),
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
}

export function withSecurityHeaders(nextConfig = {}, app = "public") {
  const existingHeaders = nextConfig.headers;

  return {
    ...nextConfig,
    async headers() {
      const inherited = typeof existingHeaders === "function" ? await existingHeaders() : [];
      return [
        ...inherited,
        {
          source: "/:path*",
          headers: createSecurityHeaders(app),
        },
      ];
    },
  };
}
