const seo = {
  intro:
    "Most Content Security Policies do not stop XSS. They contain `'unsafe-inline'`, which permits the exact injected `<script>` tag the policy was written to block; or they rely on a host allow-list containing a CDN that serves AngularJS; or they omit `base-uri`, so a single injected `<base>` tag re-points every relative script URL at an attacker's server. This auditor parses the header value you paste, resolves the CSP Level 3 fallback chain to work out which source list really governs each resource type, states in plain English what every directive permits, and reports the weaknesses in severity order. It analyses the policy text — it does not load your site.",
  useCases: [
    "Review a CSP before it ships, and see immediately whether the nonce you added actually took effect or whether an 'unsafe-inline' further along the source list makes it moot",
    "Explain to a reviewer why a policy that looks thorough provides no XSS protection, using the per-directive breakdown of what each source list permits",
    "Find the directives you never wrote — base-uri, form-action and frame-ancestors have no fallback to default-src, so a policy full of default-src rules still leaves all three wide open",
  ],
  benefits: [
    ["Resolves the real fallback chain", "script-src-elem falls back to script-src, frame-src and worker-src fall back through child-src, and base-uri, form-action, sandbox and frame-ancestors fall back to nothing. The table shows which directive is actually in force for each resource type."],
    ["Knows the rules that surprise people", "'unsafe-inline' is ignored when a nonce is present; 'strict-dynamic' switches off the entire host allow-list; an unquoted keyword is parsed as a host name; a repeated directive is silently dropped; frame-ancestors does nothing inside a meta tag."],
    ["Severity you can act on", "Findings are ranked, each names the directive it came from, and each carries a specific fix rather than a generic warning. No score is invented — the verdict is the highest severity present."],
  ],
  faqs: [
    [
      "Why is my CSP rated as having no XSS protection when it has lots of directives?",
      "Almost always because script-src contains 'unsafe-inline' with no nonce or hash alongside it. That single keyword permits any inline script, including the one an attacker injects, so nothing else in the policy is protecting the page from XSS. The fix is a per-response nonce on your legitimate inline scripts, at which point browsers ignore 'unsafe-inline' automatically.",
    ],
    [
      "What does 'strict-dynamic' actually do?",
      "It tells the browser to ignore every host source, scheme source and 'self' in that directive, and instead to trust any script loaded by a script that was already trusted through a nonce or hash. That makes the host allow-list irrelevant, which is the point: allow-lists are the weakest part of most policies because one allow-listed CDN serving AngularJS or a JSONP endpoint is enough to defeat them.",
    ],
    [
      "Why does base-uri matter so much?",
      "base-uri has no fallback to default-src, so if you do not write it, it is not set. An attacker who can inject one `<base href=\"https://evil.example\">` tag changes the resolution of every relative URL on the page, including relative `<script src>` values — so your scripts load from their server, from an origin your allow-list never mentioned. `base-uri 'none'` costs nothing and closes it.",
    ],
    [
      "Does this tool fetch my site to check the header?",
      "No. It analyses the policy text you paste and nothing else, which means it works on a policy that is not deployed yet and never transmits your configuration. It also means it cannot see whether your pages actually emit the nonce, whether an allow-listed host currently serves a bypass gadget, or what the policy blocks in practice — for that you need report-to and real traffic.",
    ],
  ],
};

export default seo;
