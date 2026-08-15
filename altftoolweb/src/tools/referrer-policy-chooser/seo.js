const seo = {
  title: "Referrer Policy Chooser: See the Exact Referer Sent",
  metaDescription:
    "Enter a source and destination URL and see the Referer header all eight Referrer-Policy values send, with downgrade rules and risky query keys flagged.",
  steps: [
    "Enter \"Page the request starts from\" and \"Destination URL\", or click a preset chip such as Third-party script, HTTPS to HTTP, Same-origin link or Outbound user link.",
    "Pick one of the eight values in \"Policy to inspect\" — strict-origin-when-cross-origin carries a (browser default) suffix — and the W3C algorithm computes the \"Referer header sent\" for that exact URL pair.",
    "\"All eight policies for this navigation\" compares every value side by side, and \"Where to declare\" gives the Response header, Meta tag, Per element and Per link snippets, each with its own Copy button; Copy comparison takes the whole table.",
  ],
  intro:
    "This chooser applies the W3C Referrer Policy algorithm to a source and destination URL you supply, and prints the exact Referer header each of the eight policy values would produce, including the same-origin and secure-to-insecure downgrade rules. It flags query parameters that look like tokens, session ids or email addresses, because those only escape when a policy sends the full URL. Modern browsers default to strict-origin-when-cross-origin, which sends the full URL within your own origin, the origin alone when leaving it, and nothing at all on a downgrade.",
  useCases: [
    "Prove to a team that a password-reset URL with a token in the query string leaks to a third-party script under the old default.",
    "Decide between strict-origin-when-cross-origin and same-origin when adding an outbound-link feature.",
    "Check what a partner's HTTP-only ingest endpoint receives from your HTTPS pages.",
    "Generate the header, meta tag and per-element snippet for whichever policy you settle on.",
  ],
  benefits: [
    ["Computed, not described", "The Referer value is derived from the spec algorithm for your actual URLs, not summarised in prose."],
    ["Downgrade handled correctly", "origin and origin-when-cross-origin still send the origin over plain HTTP; the strict variants do not."],
    ["Sensitive parameters highlighted", "Query keys containing token, session, email and similar are called out when a policy would forward them."],
  ],
  faqs: [
    [
      "What is the default referrer policy in browsers?",
      "strict-origin-when-cross-origin. Chrome, Firefox and Safari all moved to it in 2020-2021, replacing no-referrer-when-downgrade. It sends the full URL for same-origin requests, only the origin cross-origin, and no header at all when a secure page requests an insecure one.",
    ],
    [
      "What is the difference between strict-origin and origin?",
      "Both trim the referrer to scheme, host and port, but origin still sends it when an HTTPS page requests an HTTP resource, putting your origin on the wire in cleartext. strict-origin drops the header entirely on that downgrade, which is why it is the safer of the two.",
    ],
    [
      "Does the Referer header include the query string?",
      "Only when the policy sends the full URL — that is unsafe-url, no-referrer-when-downgrade, and the same-origin case of same-origin, origin-when-cross-origin and strict-origin-when-cross-origin. The fragment after the hash is always removed, as are any username and password in the URL.",
    ],
    [
      "How do I stop the referrer leaking on one specific link?",
      'Use rel="noreferrer" on that anchor, or referrerpolicy="no-referrer" for finer control. rel="noreferrer" also implies noopener, which stops the opened page reaching back through window.opener. A document-wide Referrer-Policy response header is still the right default; the attribute is for exceptions.',
    ],
  ],
};

export default seo;
