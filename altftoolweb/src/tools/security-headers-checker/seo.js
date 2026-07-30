const seo = {
  intro:
    "Paste a block of HTTP response headers — from curl -I, curl -v or the Headers panel in devtools — and this checker parses every line and grades the response against the defensive headers browsers actually act on: Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, frame-ancestors and X-Frame-Options, Referrer-Policy, Permissions-Policy and the Cross-Origin Opener, Resource and Embedder policies. It reads the values rather than just noting presence, so a max-age under a year, a script-src that still allows 'unsafe-inline', a cookie missing Secure or a Referrer-Policy of unsafe-url are each called out on their own. Scoring uses a fixed published rubric — the weight of every check is listed on the page — and the tool never contacts your server, so it reflects exactly the text you pasted and nothing else.",
  useCases: [
    "You have a curl -I dump from staging and one from production side by side and need to know which defensive headers the staging response is missing before the release goes out.",
    "A pen-test report says your Content-Security-Policy is ineffective and you want the directive-by-directive breakdown showing that script-src still allows 'unsafe-inline' with no nonce beside it.",
    "Your Set-Cookie lines are being rejected or leaking, and you need each cookie's Secure, HttpOnly, SameSite and __Host- prefix rules checked against the spec in one place.",
  ],
  benefits: [
    [
      "Reads values, not just header names",
      "A Strict-Transport-Security of max-age=15552000 is reported as 180 days rather than a green tick, and max-age=0 is flagged as actively switching HSTS off for the host.",
    ],
    [
      "Explains what each CSP directive permits",
      "Every directive in the policy gets a plain-English line — which sources it allows, whether 'unsafe-inline' is neutralised by an adjacent nonce, and which of base-uri, object-src, frame-ancestors and form-action are absent.",
    ],
    [
      "A rubric you can see, not a mystery number",
      "The point weight of every check is printed on the page, checks that do not apply are removed from the denominator, and the same paste always produces the same score.",
    ],
  ],
  faqs: [
    [
      "Does this connect to my website?",
      "No. There is no network request of any kind — you paste the headers and the parsing runs in your browser tab. That is deliberate, since it lets you audit an internal or authenticated response a public scanner could never reach, but it also means the tool can only grade the text in front of it.",
    ],
    [
      "Which headers does it actually check?",
      "Strict-Transport-Security (max-age, includeSubDomains, preload), Content-Security-Policy and its report-only variant, X-Content-Type-Options, X-Frame-Options and CSP frame-ancestors, Referrer-Policy, Permissions-Policy and legacy Feature-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Cross-Origin-Embedder-Policy, Set-Cookie flags, the CORS pair Access-Control-Allow-Origin and Allow-Credentials, version-disclosing banner headers such as Server and X-Powered-By, and retired headers including Public-Key-Pins, Expect-CT and X-XSS-Protection.",
    ],
    [
      "How is the grade calculated?",
      "By a fixed rubric printed under the results: Content-Security-Policy 20 points, Strict-Transport-Security 15, X-Content-Type-Options 10, framing protection 10, Referrer-Policy 10, cookie flags 10 when a cookie is set, and 5 each for Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, absence of version disclosure and absence of obsolete headers. The percentage is earned points over applicable points, and the letter bands are A+ at 95, A at 90, B at 80, C at 70 and D at 60.",
    ],
    [
      "Is a good grade proof my site is secure?",
      "No. Response headers are one layer. A perfect header set sits happily in front of an injection flaw, a broken authorisation check or an exposed admin route, and the tool cannot see your TLS configuration, your certificate chain or anything about how the application behaves. Treat the report as a configuration checklist, not a verdict on the site.",
    ],
  ],
};

export default seo;
