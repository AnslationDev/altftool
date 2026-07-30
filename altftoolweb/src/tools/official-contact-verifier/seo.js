const seo = {
  intro:
    "The Official Contact Verifier compares a contact detail taken from a message against a reference you looked up independently, and returns one of five verdicts: exact match, letter-case difference, related hostname, same origin with a different address, or simply different. Before comparing it strips zero-width and bidirectional Unicode characters — the invisible marks used to disguise a lookalike address — and flags any hostname using punycode (an xn-- label), which is how homograph domains are built. It handles hostnames, full URLs, email addresses, phone numbers and account handles, entirely in your browser: a string match is evidence the two values agree, not proof that the message or its sender is genuine.",
  useCases: [
    "A text claims to be from your bank with a link — you open the bank's app or card statement, copy the real domain from there, and check whether the two hostnames are actually the same.",
    "An invoice arrives from a known supplier but the reply-to address looks slightly off, and you want to know whether it differs only by case or is a genuinely different domain.",
    "Someone calls claiming to be from a government office; you find the published number through an official source and compare it against the number that called, ignoring spacing and dashes.",
  ],
  benefits: [
    [
      "Catches invisible-character tricks",
      "Zero-width and bidirectional Unicode marks are stripped before comparison and reported, so a padded lookalike cannot pass as identical.",
    ],
    [
      "Names the near-miss, not just pass or fail",
      "A subdomain relationship, a case-only difference and a same-origin path change each get their own verdict instead of collapsing into a vague warning.",
    ],
    [
      "Refuses to run on a circular reference",
      "The comparison is gated behind an explicit confirmation that the reference was not copied from the message being checked — the failure mode that makes most manual checks worthless.",
    ],
  ],
  faqs: [
    [
      "Does a match prove the message is genuine?",
      "No. A match means only that the two strings you entered agree under the tool's normalization rules. It does not query any official directory, verify who owns the domain or number, detect a compromised account, or establish that the message is authentic. Always initiate contact yourself through a source you already trust.",
    ],
    [
      "How do I spot a fake lookalike domain?",
      "Compare the ASCII hostname character by character, and treat any label beginning with xn-- as a warning sign — that prefix marks a punycode-encoded internationalized domain, which is how Cyrillic or Greek letters are used to imitate Latin ones. The tool flags punycode hostnames explicitly and also removes hidden zero-width characters before matching.",
    ],
    [
      "Why must I confirm I obtained the reference independently?",
      "Because comparing a message's contact against a number printed in the same message proves nothing — a scam supplies both. The comparison stays locked until you tick the confirmation that the reference did not come from the message, caller, QR code, popup or link under scrutiny.",
    ],
    [
      "What formats does it accept?",
      "Five: a bare hostname, a complete http or https URL, one email address, a phone number of 7 to 15 digits with an optional leading + country code (spaces, dashes, dots and brackets are ignored), and an account handle with or without a leading @. Each input is capped at 2,000 characters.",
    ],
  ],
};

export default seo;
