const seo = {
  title: "CORS Configuration Linter: Fetch-Spec Preflight",
  metaDescription:
    "Paste response headers and see which Fetch check fails: wildcard with credentials, a missing Vary: Origin, or Authorization not covered by *.",
  steps: [
    "Paste your Response headers straight from curl -i -X OPTIONS or the Network panel - the status line is optional.",
    "Under The request to check, set Request Origin, Method, Request headers the script sets and Request Content-Type, and tick Request includes credentials.",
    "A verdict plus a Pass/Fail line per Fetch check, Findings ranked by severity and Headers as parsed appear below; press Copy report to take the write-up.",
  ],
  intro:
    "Cross-Origin Resource Sharing is decided entirely by a handful of response headers, and the rules that govern them are stricter and stranger than most configurations assume. `Access-Control-Allow-Origin: *` silently stops working the moment credentials are involved. A wildcard in `Access-Control-Allow-Headers` does not cover `Authorization`. An origin with a trailing slash never matches anything. This linter parses the headers you paste, applies the WHATWG Fetch standard's CORS checks to a request you describe, and tells you both what the browser will do and which combinations are unsafe. Nothing is sent anywhere — it reads the text you give it.",
  useCases: [
    "Work out why a preflight keeps failing when the headers look correct, by seeing which of the four Fetch checks — origin, credentials, method, headers — actually returns failure",
    "Review an API gateway or nginx CORS block before it ships, catching a wildcard-plus-credentials pairing or a missing Vary: Origin that would poison a shared CDN cache",
    "Triage a pentest finding about origin reflection by confirming exactly which header combination was returned and what the follow-up probe should be",
  ],
  benefits: [
    ["Spec rules, not keyword matching", "Implements the CORS-preflight fetch checks: safelisted methods and headers, the credentials/wildcard incompatibility, and the Authorization carve-out that a wildcard does not cover."],
    ["Tells you what is broken, not just what is risky", "A repeated Allow-Origin, a comma-separated list, a trailing slash and a mixed-case host are all configurations a browser rejects outright — they are reported as blocking, separately from policy weaknesses."],
    ["Honest about what headers cannot prove", "Origin reflection cannot be confirmed from one response. The tool says so and hands you the exact two probes that turn the suspicion into evidence, instead of asserting a vulnerability."],
  ],
  faqs: [
    [
      "Why does Access-Control-Allow-Origin: * stop working when I send cookies?",
      "The Fetch standard treats the wildcard and credentials as mutually exclusive. When a request's credentials mode is `include`, the browser requires Allow-Origin to name one exact origin; a `*` fails the check and the response is blocked. The same applies to `*` in Allow-Methods, Allow-Headers and Expose-Headers, which are all read as literal names rather than wildcards once credentials are in play.",
    ],
    [
      "Why is Vary: Origin necessary?",
      "If your Allow-Origin value depends on the request's Origin, the response is not the same for every caller. Without `Vary: Origin` a shared cache — a CDN, a reverse proxy, or the browser's own HTTP cache — can store the response generated for one origin and serve it to another. The second caller then gets an Allow-Origin naming somebody else, which breaks the request and can leak which origins are allow-listed.",
    ],
    [
      "Does Access-Control-Allow-Headers: * cover the Authorization header?",
      "No, and this is the single most common cause of a preflight that fails for no visible reason. The Fetch standard explicitly excludes Authorization from the wildcard, so a request carrying an Authorization header needs that name listed literally: `Access-Control-Allow-Headers: Authorization, *`.",
    ],
    [
      "Does this tool make requests to my server?",
      "No. It parses the header text you paste and reasons about it locally. That means it cannot discover whether your server reflects an arbitrary Origin — for that it tells you which probes to run and what an unsafe response would look like. Everything else, including the full preflight simulation, is computed from the headers in front of it.",
    ],
  ],
};

export default seo;
