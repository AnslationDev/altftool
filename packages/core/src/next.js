const PERMISSIONS_POLICY = {
  public:
    "camera=(self), microphone=(self), geolocation=(self), fullscreen=(self), payment=(), usb=(), serial=()",
  admin:
    "camera=(), microphone=(), geolocation=(), fullscreen=(self), payment=(), usb=(), serial=()",
};

export function createSecurityHeaders(app = "public") {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
