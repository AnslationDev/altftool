const seo = {
  title: "Email Regex Library: 5 Patterns from HTML5 to RFC 5322",
  metaDescription:
    "Five copy-ready email validation regexes ranked by strictness — including the WHATWG HTML5 browser pattern — each with a live tester and honest limits.",
  steps: [
    "Pick one of the five patterns from the 'Strictness level' dropdown — from a minimal sanity check up to the WHATWG HTML5 browser regex and an RFC 5322-flavoured pattern.",
    "Type an address into 'Test an email address' — the verdict flips between 'Match' and 'No match' live, with the pattern's accept and reject examples listed underneath.",
    "Click 'Copy regex' to copy the selected pattern as /source/flags, and check 'Known limitations of this pattern' before shipping it.",
  ],
  intro:
    "This library gives you five copy-ready regular expressions for email validation, ordered by strictness — from a minimal one-@ sanity check to the exact WHATWG HTML5 browser regex and an RFC 5322-flavoured pattern with quoted local parts and IPv4 domain literals. Each pattern comes with a live tester, example accept/reject strings, and an honest list of what it cannot catch, so developers can pick the right strictness for a signup form, an API validator or a data-cleaning script.",
  useCases: [
    "A frontend developer matching server-side validation to the exact regex browsers use for input type=email",
    "A backend engineer choosing a stricter TLD-requiring pattern for a public SaaS signup form",
    "A data analyst cleaning a CSV of contact addresses and needing to know why user@localhost or a..b@x.com slip through a loose pattern",
  ],
  benefits: [
    ["Strictness levels, not one regex", "Five graded patterns from loosest to RFC 5322-flavoured, so you match validation strength to the job."],
    ["Honest limitation notes", "Every pattern lists exactly which invalid addresses it still accepts and which valid ones it rejects."],
    ["Live testing built in", "Paste any address and see instantly whether the selected pattern accepts it before you copy the regex."],
  ],
  faqs: [
    [
      "What is the best regex for email validation?",
      "For most web forms, the WHATWG HTML5 pattern is the best default because it is the exact regex browsers apply to input type=email, so client and server agree. Stricter is not automatically better: the full RFC 5322 grammar accepts addresses like \"john doe\"@example.com that many mail systems reject, and the only real proof an address works is a confirmation email.",
    ],
    [
      "Why does the HTML5 email regex accept user@localhost?",
      "Because the HTML Standard deliberately allows dotless domains — the spec itself calls this a willful violation of RFC 5322, since intranet addresses like user@localhost are legitimate. If you only want public-internet addresses, use the hardened variant in this library that requires a final alphabetic label of 2–63 characters.",
    ],
    [
      "Can a regex fully validate an email address per RFC 5322?",
      "No practical regex can — RFC 5322 allows nested comments and folding whitespace that regular expressions cannot fully express, and even a syntactically perfect address may not exist. Regex should check format only; deliverability requires an MX lookup or a confirmation message.",
    ],
    [
      "What length limits apply to email addresses?",
      "RFC 5321 limits the local part (before the @) to 64 octets and the domain to 255 octets, with 254 characters as the practical maximum for the whole address. None of the common validation regexes enforce these limits, so add an explicit length check in code alongside the pattern.",
    ],
  ],
};

export default seo;
