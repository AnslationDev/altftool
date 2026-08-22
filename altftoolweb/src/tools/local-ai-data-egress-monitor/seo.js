const seo = {
  title: "HAR Egress Check: Did Your Local AI Phone Home?",
  metaDescription:
    "Load a HAR trace to sort every host into loopback, expected or unlisted, and count outbound bodies, credential headers and sensitive query names.",
  steps: [
    "Press Open HAR to load a .har or .json capture — up to 10 MB and the first 10,000 entries — or paste it into the HAR JSON box.",
    "List the hosts the app is allowed to reach under Expected remote hosts, one per line, as exact names or *.trusted.example wildcards.",
    "Read the Host inventory for unlisted hosts carrying outbound bodies, then press Counts-only report to save local-ai-egress-summary.json.",
  ],
  intro:
    "The Local AI Data-Egress Monitor reads a HAR network trace in your browser and sorts every recorded request into three scopes — loopback, expected, and unlisted — so you can see whether an app claiming to run locally actually talked to anything else. For each host it counts requests carrying an outbound body, requests sending one of four credential headers (authorization, cookie, proxy-authorization, x-api-key), and requests whose URL contains one of fourteen sensitive query names such as prompt, input, message, email or api_key. It is for people evaluating a local LLM app, browser extension or desktop tool who want evidence from the trace rather than a marketing claim.",
  useCases: [
    "A desktop app advertises itself as fully offline, and you want to check a recorded HAR session for any request that left 127.0.0.1 and carried a POST body.",
    "You are reviewing an AI browser extension before rolling it out to a team, and need a per-host summary of which endpoints received credential headers and how many bytes went out.",
    "You allowlist the two API hosts your local model server is supposed to reach, and want everything outside those rules — including subdomains you did not expect — flagged as unlisted.",
  ],
  benefits: [
    [
      "Scope classification, not a raw request dump",
      "Requests are bucketed as loopback (localhost, 127.0.0.1, ::1, 0.0.0.0), expected (matching your allowlist), or unlisted, and unlisted hosts sort to the top.",
    ],
    [
      "Wildcard allowlist rules",
      "Expected hosts accept exact names or *.example.com patterns, and the tool rejects anything containing a path or whitespace so a malformed rule cannot silently pass traffic.",
    ],
    [
      "Shareable report that leaks nothing",
      "The exported summary carries counts and scopes only — hostnames, URLs, header values, query values and bodies are all excluded, so it is safe to paste into a ticket.",
    ],
  ],
  faqs: [
    [
      "How do I check whether a local AI app is sending my prompts to a server?",
      "Record a HAR trace of the app's session, load it here, and look at the unlisted-scope hosts with a non-zero body-request count. Requests with an outbound body going to a host that is neither loopback nor on your allowlist are the ones worth investigating, especially if they also carry a prompt, input or message query name.",
    ],
    [
      "Which headers and query parameters does it flag?",
      "Four credential headers — authorization, cookie, proxy-authorization and x-api-key — and fourteen sensitive query names: access_token, apikey, api_key, authorization, content, email, input, key, message, prompt, query, search, text and token. It reports that these names appeared, never their values.",
    ],
    [
      "How large a HAR file can it handle?",
      "Up to 10 MB of source text and the first 10,000 entries, whichever comes first; anything beyond that is reported as truncated rather than silently dropped. It accepts a standard HAR with log.entries, a bare entries array, or a top-level array of entries.",
    ],
    [
      "Does a clean result prove the app is fully local?",
      "No. A HAR only captures what the recorder saw during that session, so traffic outside the capture window, non-HTTP channels, or requests made by a helper process will not appear. It also cannot tell you whether a body that did leave contained anything sensitive — it only reports that a body existed and how large it was.",
    ],
  ],
};

export default seo;
