const seo = {
  title: "netlify.toml Generator: Redirects & SPA Fallback",
  metaDescription:
    "Assemble a valid netlify.toml: build command, SPA /* to /index.html 200 rewrite, redirects with valid statuses, OWASP security headers, edge functions.",
  steps: [
    "Fill in Build settings — Build command, Publish directory, optional Base directory, Node version and Functions directory — and keep the 'Single-page app fallback' (/* to /index.html, status 200) checkbox on for SPAs.",
    "Add [[redirects]] rows with From, To, a Status limited to 301/302/200/404/410/451 and an optional Force checkbox, tick header presets like 'Security headers on /*', and declare edge function Path and Function name rows.",
    "Review the generated netlify.toml preview with its section and redirect counts, then click 'Copy file' and save it at your repository root.",
  ],
  intro:
    "This generator assembles a valid netlify.toml — Netlify's file-based configuration format — covering the [build] block, [build.environment], [[redirects]], [[headers]], [functions] and [[edge_functions]] sections. It is built for developers deploying static sites, SPAs and serverless apps to Netlify who want correct TOML syntax, valid redirect status codes and OWASP-baseline security headers without hand-writing the file.",
  useCases: [
    "A React or Vue developer adding the /* to /index.html status-200 rewrite so client-side routes stop returning 404 on refresh",
    "A team moving build settings out of the Netlify UI into version control, including the build command, publish directory and pinned Node version",
    "A site owner adding security headers (X-Frame-Options, X-Content-Type-Options, HSTS) and immutable caching for fingerprinted assets in one pass",
  ],
  benefits: [
    ["Valid statuses only", "Redirect rules are limited to the statuses Netlify's engine accepts — 301, 302, 200 rewrites, 404, 410 and 451."],
    ["Security header presets", "One-click OWASP-baseline headers and a 2-year HSTS policy matching the hstspreload.org requirement."],
    ["Correct TOML escaping", "Quotes, backslashes and newlines in commands and values are escaped per the TOML spec, so the file always parses."],
  ],
  faqs: [
    [
      "How do I fix 404 errors on page refresh for a single-page app on Netlify?",
      "Add a rewrite from /* to /index.html with status 200 in netlify.toml — the [[redirects]] block this generator creates with the SPA fallback checkbox. Status 200 makes it a rewrite rather than a redirect, so the URL stays the same while index.html is served and your client-side router takes over.",
    ],
    [
      "What is the difference between a 301 redirect and a 200 rewrite in netlify.toml?",
      "A 301 (or 302) sends the browser to the new URL and the address bar changes; a 200 rewrite serves the target content at the original URL without the browser knowing. Rewrites are used for SPA fallbacks and for proxying to external APIs, since the to field can be a full https:// URL.",
    ],
    [
      "Does netlify.toml override settings in the Netlify dashboard?",
      "Yes — for any setting defined in both places, the netlify.toml value wins over the UI configuration. That is why teams commit the file to version control: the build command, publish directory and environment are reviewed like any other code change.",
    ],
    [
      "What does force = true do in a Netlify redirect?",
      "By default Netlify serves an existing static file instead of applying a matching redirect rule; force = true makes the rule win even when a file exists at that path. Without it, a /* SPA fallback will not shadow real files — which is usually what you want — and with it you can deliberately override published content.",
    ],
  ],
};

export default seo;
