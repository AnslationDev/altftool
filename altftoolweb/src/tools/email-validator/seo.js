const seo = {
  title: "Email Validator — Free MX, Syntax & Bulk Checker",
  h1: "Email Validator",
  metaDescription:
    "Validate email syntax, MX records, disposable domains and typos, then score up to 100 addresses at once. Free, no signup, CSV export.",
  intro:
    "The Email Validator scores an address out of 100 in two passes. First it checks syntax in your browser against the RFC length and character limits — 254 characters total, 64 for the local part, exactly one @, no spaces, no leading, trailing or consecutive dots, and a domain that matches the labelled-hostname pattern. Then it looks up the domain's MX, A and AAAA records live through Google Public DNS over HTTPS (dns.google/resolve), so a domain with no mail routing is caught rather than guessed at. On top of that it runs a Levenshtein distance check against 13 common providers to catch typos like gmai.com, and flags disposable domains, role-based inboxes and higher-risk TLDs. Only the domain half of the address is ever sent to the DNS resolver; the local part stays on your device, and the tool never pings a mailbox over SMTP.",
  useCases: [
    "Clean a lead list or newsletter export before import by pasting up to 100 addresses into bulk mode and downloading the scored CSV.",
    "Catch signup typos like hello@gmai.com or user@hotmial.com before a welcome email hard-bounces.",
    "Confirm that a client's or vendor's domain actually has MX records configured before you send a campaign to it.",
  ],
  benefits: [
    [
      "Real MX lookups, not just a regex",
      "Every syntactically valid address triggers live MX, A and AAAA queries over DNS-over-HTTPS, so domains with no mail routing score 45 points lower instead of passing a pattern test.",
    ],
    [
      "Typo suggestions from edit distance",
      "A Levenshtein comparison against 13 major providers flags any domain within two edits and proposes the correction, e.g. \"Did you mean user@gmail.com?\"",
    ],
    [
      "Bulk scoring with CSV export",
      "Paste up to 100 addresses separated by line breaks, commas or semicolons; duplicates are dropped and results export as email-validation-results.csv with status, score, DNS state, suggestion and signals.",
    ],
    [
      "Honest about mailbox existence",
      "The result panel marks the mailbox check as \"Not pinged\" rather than implying a deliverability guarantee it cannot make without SMTP access.",
    ],
  ],
  faqs: [
    [
      "how to check if an email address is valid",
      "Paste the address and validate — the tool checks syntax first, then queries the domain's DNS records. An address passes as Valid only if it clears every syntax rule (254-character total limit, 64-character local part, single @, no consecutive or edge dots, supported characters) and scores 80 or above after DNS and risk deductions.",
    ],
    [
      "does this email validator check if the mailbox actually exists?",
      "No. It verifies format and whether the domain is configured to receive mail, but it never opens an SMTP connection to a mail server. The results panel labels the mailbox check \"Not pinged\" — proving a specific inbox exists requires SMTP probing or a confirmation email.",
    ],
    [
      "how many emails can I validate at once?",
      "100 per run. Bulk mode splits your input on whitespace, commas and semicolons, removes duplicates, then keeps the first 100 addresses. Each one gets its own DNS lookup, so a full list takes a few seconds to finish.",
    ],
    [
      "what does the 0-100 email score mean?",
      "Scores start at 100 and lose points per risk signal: 70 for failed syntax, 45 for a domain with no MX, A or AAAA records, 35 for a disposable domain, 20 for a likely typo, 12 for a role-based inbox or MX-less fallback, 8 for a higher-risk TLD, 4 for a free consumer provider. 80 and above reads Valid, 55-79 Risky, below 55 Poor, and any syntax failure is Invalid regardless of score.",
    ],
    [
      "how does it detect temporary or disposable email addresses?",
      "It matches the domain against a built-in list of 14 known throwaway providers, including mailinator.com, 10minutemail.com, guerrillamail.com, yopmail.com, temp-mail.org, sharklasers.com and maildrop.cc. A match costs 35 points and is labelled \"Disposable domain\".",
    ],
    [
      "is my email list uploaded to a server?",
      "The addresses themselves are not. Syntax parsing, scoring, typo detection and CSV generation all run in your browser. The one network request is a DNS-over-HTTPS query to dns.google that contains only the domain part — the name before the @ never leaves your device. No account or signup is required.",
    ],
    [
      "why does it say \"possible typo\" on my domain?",
      "Because the domain is within a Levenshtein edit distance of 2 from a common provider — one or two inserted, deleted or swapped characters. gmai.com, gmial.com and hotmial.com all trigger it. The check is a suggestion, not a rejection, so a legitimate lookalike domain still validates, just 20 points lower.",
    ],
    [
      "what is the maximum length of an email address?",
      "254 characters for the whole address and 64 for the local part before the @. This validator enforces both limits and reports them as separate errors, alongside checks for spaces, multiple @ symbols, and dots at the start, end or doubled up.",
    ],
  ],
  steps: [
    "Enter one address in Single mode, or switch to Bulk and paste up to 100 addresses separated by line breaks, commas or semicolons.",
    "Press Validate — syntax is checked on-device first, then MX, A and AAAA records are fetched for the domain over DNS-over-HTTPS.",
    "Review the 0-100 score, DNS records and risk signals, then copy the text report or export bulk results as email-validation-results.csv.",
  ],
};

export default seo;
