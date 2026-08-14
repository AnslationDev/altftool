const seo = {
  title: "API Rate Limit Header Designer – IETF & X-RateLimit-*",
  metaDescription:
    "Design RateLimit and RateLimit-Policy or legacy X-RateLimit headers, plus a 429 with Retry-After and an RFC 9457 problem+json body, ready to copy.",
  steps: [
    "Choose a Header style — IETF draft RateLimit headers, Legacy X-RateLimit-* headers, or Both — and enter the Limit and Window length in seconds.",
    "Set the example Remaining and Seconds-until-reset values, a Quota policy name and an optional docs URL for the problem type.",
    "Press Copy spec to grab the '200 OK — send on every response' header block and the full 429 Too Many Requests response with its problem+json body.",
  ],
  intro:
    "This tool designs a complete, standards-based rate limiting contract for an HTTP API: the headers sent on every response, the 429 Too Many Requests response, and the machine-readable error body. It emits the IETF httpapi draft's structured RateLimit and RateLimit-Policy fields or the legacy X-RateLimit-* trio, a Retry-After header per RFC 9110, and an RFC 9457 application/problem+json body. API designers get a copy-paste spec that clients can actually implement backoff against.",
  useCases: [
    "An API team defining a 100-requests-per-minute policy and needing the exact header lines for their gateway and public docs",
    "A platform migrating from X-RateLimit-* to the IETF RateLimit draft, emitting both families during the transition",
    "A backend developer writing the 429 handler and wanting a correct problem+json body with Retry-After for client SDKs",
  ],
  benefits: [
    ["Standards, not folklore", "429 from RFC 6585, Retry-After from RFC 9110, problem body from RFC 9457, RateLimit fields from the IETF httpapi draft."],
    ["Both header generations", "Generates the structured RateLimit/RateLimit-Policy fields, the legacy X-RateLimit trio, or both for migrations."],
    ["Consistent numbers", "Validates that remaining never exceeds the limit and reset never exceeds the window, so examples cannot contradict the policy."],
  ],
  faqs: [
    [
      "What headers should an API send for rate limiting?",
      "The current IETF httpapi draft defines two: RateLimit-Policy (the quota rule, e.g. \"default\";q=100;w=60 for 100 requests per 60 seconds) and RateLimit (live state, e.g. \"default\";r=37;t=25 for 37 remaining and reset in 25 seconds). The older de-facto convention is X-RateLimit-Limit, X-RateLimit-Remaining and X-RateLimit-Reset, which many APIs like GitHub's still use.",
    ],
    [
      "Should rate limit headers be sent on every response or only on 429?",
      "On every response. If clients only learn their remaining quota when they are already blocked, they cannot pace themselves; sending limit, remaining and reset on 200s lets well-behaved clients throttle proactively, and the 429 then only adds Retry-After.",
    ],
    [
      "Is X-RateLimit-Reset a timestamp or a number of seconds?",
      "Both conventions exist, which is exactly why it must be documented: GitHub sends a Unix epoch timestamp, while Twitter's original API and many gateways send delta-seconds until the window resets. The IETF draft avoids the ambiguity by defining t as seconds until reset, and Retry-After (RFC 9110) is defined as either an HTTP-date or delta-seconds.",
    ],
    [
      "What should the body of a 429 response contain?",
      "RFC 9457 problem details JSON served as application/problem+json: a type URI pointing at your rate limit documentation, title \"Too Many Requests\", status 429, and a detail sentence stating the limit and when to retry. That gives SDKs one parseable error shape instead of scraping human-readable messages.",
    ],
  ],
};

export default seo;
