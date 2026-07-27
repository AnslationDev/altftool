const seo = {
  intro:
    "This library provides five copy-ready password policy regular expressions — from the NIST SP 800-63B minimum of 8 characters, through the classic corporate upper/lower/digit and four-class complexity rules built from stacked (?=.*X) lookaheads, to a 12–64 character length-first passphrase policy. Every token of every pattern is explained, and each policy states plainly what it cannot do, because NIST's current guidance favours length and breached-password screening over composition rules.",
  useCases: [
    "A developer implementing a signup form whose security review demands the classic 8+ upper/lower/digit policy",
    "An auditor-facing team needing the four-class complexity regex with a defensible definition of 'special character'",
    "An engineer modernising a policy to NIST-style length-first rules and needing the 12–64 character passphrase pattern",
  ],
  benefits: [
    ["Lookaheads explained", "Each (?=.*X) assertion is broken down token by token, so the pattern is understood, not pasted blind."],
    ["Symbol-class done right", "The four-class pattern uses [^A-Za-z0-9] instead of a hardcoded symbol list, so no user's symbol is silently rejected."],
    ["NIST-grounded caveats", "Every policy notes where it conflicts with SP 800-63B, which discourages mandatory composition rules."],
  ],
  faqs: [
    [
      "What is the regex for a password with uppercase, lowercase, number and special character?",
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$ — four lookaheads each scan the string for one required class, then .{8,} enforces the length. Using [^A-Za-z0-9] for the special character accepts any symbol; patterns that enumerate symbols like [@$!%*?&] reject users whose symbol is not on the list.",
    ],
    [
      "How does (?=.*[A-Z]) work in a password regex?",
      "It is a zero-width lookahead: from the start of the string it checks that some position ahead contains an uppercase letter, without consuming any characters. Because each lookahead returns to the start position, you can stack several to enforce independent 'must contain' rules in a single pattern before the final .{8,} does the real matching.",
    ],
    [
      "What password length does NIST recommend?",
      "NIST SP 800-63B requires user-chosen passwords to be at least 8 characters and says verifiers should permit at least 64. Notably, it recommends against mandatory composition rules (forced symbols and digits) and instead advises checking candidates against lists of breached or commonly used passwords.",
    ],
    [
      "Is a regex enough to enforce password strength?",
      "No — a regex can only check length and character classes, and predictable choices like Password1! sail through every composition rule. Combine a minimal length regex with a breached-password check and a strength estimator such as zxcvbn, and always hash with a slow algorithm like bcrypt or Argon2; this tool is informational, not a security review.",
    ],
  ],
};

export default seo;
