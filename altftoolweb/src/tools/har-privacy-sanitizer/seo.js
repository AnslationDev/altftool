const seo = {
  title: "HAR File Sanitizer - Strip Cookies, Tokens and Bodies",
  metaDescription:
    "Remove Authorization and Cookie headers, tokens in URLs and request or response bodies from a HAR before you share it. Runs locally; 15M-character cap.",
  steps: [
    "Paste your capture into the HAR JSON box, press Choose file to pick a local .har or .json, or press Load HAR sample — the input is capped at 15,000,000 characters.",
    "Under Sanitization options leave all five boxes ticked — Sensitive headers, Cookies, Sensitive URL values, Request bodies and Response bodies — and press Run local inspection.",
    "The HAR privacy summary reports Entries, Headers removed, Cookies removed, URL secrets removed and Total removals, shows a Sanitized HAR preview, and Download report saves the cleaned copy as sanitized-network-log.har.",
  ],
  intro:
    "This tool strips the secrets out of a HAR file before you attach it to a bug report or a support ticket. It walks every entry in log.entries and removes credential-bearing headers (Authorization, Cookie, Set-Cookie, Proxy-Authorization, x-api-key and the usual token headers), empties the request and response cookie arrays, drops sensitive query parameters such as token, access_token, code, password, secret and signature from both the queryString array and the URL itself, and deletes request and response bodies. Each of the five protections is a toggle, and the run reports exactly how many of each kind it removed.",
  useCases: [
    "A vendor asks for a HAR to debug a failing API call and you need to hand it over without leaking your session cookie",
    "You are attaching a network capture to a public GitHub issue and want the OAuth code and id_token out of the redirect URLs",
    "You are filing an internal ticket and must remove response bodies containing customer records before the capture leaves your team",
  ],
  benefits: [
    [
      "Cleans URLs, not just the query array",
      "Sensitive parameters are removed from request.url and its fragment too, plus any user:password embedded in the URL — the places redaction usually misses.",
    ],
    [
      "Pattern matching, not a fixed list",
      "Names ending or starting with token, secret, password, credential, signature or session are caught even when the exact key is not on the list.",
    ],
    [
      "Tells you what it took out",
      "Reports counts of headers, cookies, query parameters, URL secrets and request and response bodies removed, so you can sanity-check before sharing.",
    ],
  ],
  faqs: [
    [
      "What is a HAR file and why is it risky to share?",
      "A HAR is a JSON log of every request your browser made, exported from the Network panel of the developer tools. It records full URLs, headers, cookies and often the request and response bodies, so an unedited HAR typically contains live session cookies and bearer tokens that let anyone replay your session.",
    ],
    [
      "Which headers does it remove?",
      "Authorization, Cookie, Set-Cookie and Proxy-Authorization, plus API and token headers including x-api-key, api-key, x-auth-token, x-access-token, x-goog-api-key, x-csrf-token, x-xsrf-token, x-amz-security-token and x-aws-ec2-metadata-token. Anything matching the api-key, access-token, auth-token, csrf-token, xsrf-token, session-token or security-token pattern is also dropped.",
    ],
    [
      "How large a HAR can it handle?",
      "Up to 15,000,000 characters of JSON and 5,000 entries; beyond either limit it stops with an error rather than processing a partial file. If your capture is bigger, re-record a shorter session covering just the failing request.",
    ],
    [
      "Does my HAR get uploaded anywhere?",
      "No. The file is parsed and rewritten in your browser and the sanitised JSON is produced locally, which matters because the input is exactly the file you must not send to a third party.",
    ],
  ],
};

export default seo;
