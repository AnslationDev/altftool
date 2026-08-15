const seo = {
  title: "Caddyfile Generator for Caddy v2 - Proxy, SPA, HSTS",
  metaDescription:
    "Build a Caddy v2 site block from a form - reverse proxy or file server, encode zstd gzip, security headers, guarded HSTS, www redirect and access logs.",
  steps: [
    "Enter the Site address (example.com, app.example.com, or :8080 for plain HTTP) and pick the Serve mode — reverse proxy with an Upstream (app server), or static files with a Web root.",
    "Toggle 'encode zstd gzip' compression, baseline security headers, the www redirect, access logging to /var/log/caddy/, HSTS with its max-age in seconds, and the SPA fallback try_files {path} /index.html.",
    "The site block renders live with a directive count; press Copy Caddyfile, save it as Caddyfile, and validate with caddy validate.",
  ],
  intro:
    "This generator assembles a complete Caddy v2 Caddyfile site block from a form — reverse proxy or static file server, encode zstd gzip compression, baseline security headers, optional HSTS, a www-to-apex redirect and file-based access logging. It follows the Caddyfile conventions from the official docs, including automatic HTTPS for hostname addresses and the try_files {path} /index.html fallback pattern for single-page applications.",
  useCases: [
    "A developer putting Caddy in front of a Node or Go app on localhost:3000 with automatic HTTPS and zero manual certificate work",
    "Deploying a React, Vue or Svelte build as static files with the SPA fallback so client-side routes do not 404",
    "Adding a www.example.com to example.com permanent redirect plus security headers to an existing single-domain Caddyfile",
  ],
  benefits: [
    ["Automatic HTTPS aware", "Hostname addresses get Caddy's built-in certificate provisioning; port-only addresses are flagged as plain HTTP."],
    ["Correct SPA fallback", "Uses the documented try_files {path} /index.html pattern so real files win and everything else serves the app shell."],
    ["Guarded HSTS", "HSTS defaults to the one-year preload minimum of 31536000 seconds and refuses values over two years as likely unit mistakes."],
  ],
  faqs: [
    [
      "Does Caddy really handle HTTPS automatically?",
      "Yes — for any site address with a hostname and no explicit http:// prefix, Caddy obtains, installs and renews TLS certificates automatically via ACME (Let's Encrypt or ZeroSSL). The only prerequisites are that DNS points at the server and ports 80 and 443 are reachable.",
    ],
    [
      "How do I reverse proxy an app with a Caddyfile?",
      "A two-line site block is enough: example.com { reverse_proxy localhost:3000 }. Caddy's reverse_proxy forwards the Host header and sets X-Forwarded-For and X-Forwarded-Proto automatically, which nginx requires several proxy_set_header lines to achieve.",
    ],
    [
      "How do I serve a single-page application with Caddy?",
      "Combine root, try_files and file_server: root * /srv/app, then try_files {path} /index.html, then file_server. Real files like JS bundles are served directly, and any other path — such as a client-side route like /dashboard — falls back to index.html.",
    ],
    [
      "What HSTS max-age should I set?",
      "31536000 seconds (one year) is the standard value and the minimum for the hstspreload.org list. Start lower (for example 300) while testing, because HSTS makes browsers refuse plain-HTTP connections to your domain — and with includeSubDomains, to every subdomain — until the timer expires.",
    ],
  ],
};

export default seo;
