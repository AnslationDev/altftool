const seo = {
  intro:
    "The Git Diff Exposure Checker scans a pasted unified diff for eight added-line patterns — private-key headers, AWS access-key IDs, GitHub and Slack tokens, JWT-like values, Authorization bearer headers, email addresses and phone numbers — plus secret-like variable assignments and sensitive destination filenames such as .env, id_rsa or *.pem. It inspects only added lines and the +++ destination paths, and every finding is reported redacted, as a code, severity, file index and line number rather than the matched value. It is for developers doing a last look before `git push`, or before pasting a patch into an issue, a chat or a model prompt.",
  useCases: [
    "You are about to open a public pull request and want to confirm the diff does not add an AWS key, a gh* token or a customer email address to the repository.",
    "Someone asks you to paste a patch into a support ticket, and you want to know first whether the added lines include a bearer token or a hard-coded password assignment.",
    "A teammate's branch adds a new config file and you want to check whether the destination path matches a sensitive pattern like .env, .aws/credentials, .npmrc or a .pem key before it is merged.",
  ],
  benefits: [
    [
      "Findings are redacted by construction",
      "Each hit is reported as a label, severity, file number and line number with the evidence field literally set to a redacted placeholder, so the report can be shared without leaking the value.",
    ],
    [
      "Reads added lines only",
      "It tracks @@ hunk headers to know the real new-file line numbers, and ignores context and removed lines, so it flags what your change introduces rather than what was already there.",
    ],
    [
      "Filters obvious placeholders",
      "A secret-like assignment is only flagged when the value is at least 6 characters and does not start with example, sample, placeholder, changeme, redacted, an angle-bracket token, process.env or a ${VAR} reference.",
    ],
  ],
  faqs: [
    [
      "What exactly does it detect in a diff?",
      "Eight line patterns — PRIVATE KEY block headers, AWS AKIA/ASIA access-key IDs, GitHub ghp_/gho_/ghu_/ghs_/ghr_ tokens, Slack xox tokens, JWT-like three-part eyJ values, Authorization bearer headers, email addresses and phone numbers — plus generic assignments whose key contains segments like password, secret, token, credential or pairs like api_key and client_secret. Separately, destination filenames matching .env, id_rsa/id_ed25519, authorized_keys, credentials, secrets, .aws/credentials, .npmrc, .pypirc or .pem/.p12/.pfx/.key/.keystore/.jks are flagged as high severity.",
    ],
    [
      "How big a diff can I paste?",
      "Up to 300,000 characters, 20,000 lines, 500 files and 15,000 added lines; exceeding any of those stops the scan with an explicit limit message rather than silently truncating. At most 800 individual findings are listed, with higher-severity findings displacing lower ones, though the counts remain complete.",
    ],
    [
      "Does a clean result mean my change has no secrets?",
      "No. A clear result means none of the configured patterns matched, and the tool states this explicitly — encoded, unusual or custom-format credentials can pass through untouched. Equally, a match can be test data or a public example, so treat every finding as a review cue rather than proof of exposure.",
    ],
    [
      "Does it connect to GitHub or check whether a token is live?",
      "No. It never opens a repository, runs Git, follows paths, executes code, validates credentials or contacts any provider — it reads the pasted text in your browser and nothing else. Binary patches and 'Binary files ... differ' markers are counted and flagged as not inspected, and if a real credential is found, revoke and rotate it through that provider's own workflow.",
    ],
  ],
};

export default seo;
