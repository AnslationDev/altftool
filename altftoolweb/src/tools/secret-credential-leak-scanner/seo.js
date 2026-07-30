const seo = {
  intro:
    "The Secret & Credential Leak Scanner matches pasted text, a local source or log file, or a bounded ZIP archive against nine provider-specific credential patterns — PEM private key blocks, AWS AKIA/ASIA access key IDs, GitHub ghp_/github_pat_ tokens, Slack xox tokens, Stripe sk_live/sk_test keys, Google AIza keys, three-segment JWTs, passwords embedded in postgres/mysql/mongodb/redis/amqp/http URLs, and Authorization: Bearer/Basic/Token header values — plus a generic rule for assignments whose key contains a segment like password, secret, token or api key. Every match is reported by rule, severity, source, line and column with the value itself replaced by a redacted length marker, so a finding can be shared without re-exposing the credential. It is for developers and reviewers checking a diff, a log paste or a config bundle before it leaves a trusted boundary.",
  useCases: [
    "You are about to paste a stack trace or request log into a public issue tracker and want to confirm no Authorization header or connection string with a password rode along in it.",
    "A teammate sent you a ZIP of config files to debug, and you want a line-and-column list of anything key-shaped in it before you commit any of it to a repository.",
    "You inherited an old .env-style file and need to know which of its assignments hold real-looking secrets that must be rotated versus placeholders that can stay.",
  ],
  benefits: [
    [
      "Findings never reprint the secret",
      "Each match is rendered as [REDACTED · N characters] with its line and column, so the report and the exported .txt can go into a ticket without becoming a second leak.",
    ],
    [
      "Severity is ranked, not just listed",
      "Private key blocks are critical, provider tokens and credential URLs are high, JWTs and generic secret-like assignments are medium, and when the 250-finding cap is hit the lower-severity entries are the ones dropped first.",
    ],
    [
      "Archives are opened under strict bounds",
      "A ZIP is preflighted from its central directory and refused if it declares encryption, unsupported compression, more than 30 supported text entries, or expansion past the 10 MB combined limit.",
    ],
  ],
  faqs: [
    [
      "Which secrets does this scanner actually detect?",
      "Nine named patterns plus one generic rule: PEM private key headers (RSA, EC, DSA, OPENSSH, PGP), AWS access key IDs beginning AKIA or ASIA, GitHub ghp_/gho_/ghu_/ghs_/ghr_ and github_pat_ tokens, Slack xoxb/xoxp/xoxa/xoxr/xoxs tokens, Stripe sk_live_ and sk_test_ keys, Google AIza keys, JWT-shaped eyJ… triplets, user:password in database and HTTP URLs, and Authorization headers with Bearer, Basic or Token. The generic rule flags any assignment whose key contains a segment such as password, passwd, secret, token or credential, or a pair like api key or client secret.",
    ],
    [
      "Does a clean result mean my file has no secrets?",
      "No. A clear result only means nothing matched the configured patterns — a custom-format key, an encoded value or a provider not on the list will pass silently. Use it as one check before sharing, not as proof that a source is secret-free.",
    ],
    [
      "What are the size limits?",
      "Two million characters per scanned source, 250 findings retained for display, and 10 MB for a selected file or ZIP. Inside a ZIP the scan covers at most 30 supported text entries, each up to 2 MB, with 10 MB of combined expanded text overall.",
    ],
    [
      "Why is a harmless-looking line flagged as a secret-like assignment?",
      "Because the generic rule fires on the key name plus a value of at least 12 characters, not on the value's contents — so a long placeholder assigned to API_KEY still matches. These land at medium severity precisely because they need a human to confirm whether the value is real before anything is rotated.",
    ],
  ],
};

export default seo;
