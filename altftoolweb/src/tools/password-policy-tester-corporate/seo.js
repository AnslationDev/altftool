const seo = {
  intro:
    "Corporate Password Policy Tester evaluates a candidate password against the two rule sets that decide whether it is accepted and whether it is actually safe: the Active Directory complexity requirement — three of five character categories, and no sAMAccountName or display-name token longer than two characters inside it — and NIST SP 800-63B, which asks for at least 8 characters, a check against breached values, rejection of repetitive and sequential strings, and no composition rules or forced expiry. Each rule is reported separately alongside an entropy estimate and cracking times at online, bcrypt and NTLM attack rates, so you can see when a password passes the domain controller and still falls to a wordlist.",
  useCases: [
    "Find out why Active Directory rejects a new password without saying which rule it broke.",
    "Show a security committee why a four-word passphrase fails the three-category rule while being far stronger than what passes.",
    "Sanity-check a proposed minimum-length change from 8 to 14 characters before rolling it out.",
    "Explain to a team why Season+Year passwords survive every complexity check and none of the cracking runs.",
  ],
  benefits: [
    ["Two standards, side by side", "Separates what the domain controller enforces from what current guidance recommends."],
    ["Exact Microsoft rule", "Implements the documented three-of-five category test and the display-name token check, not a generic strength meter."],
    ["Runs offline", "Pure client-side JavaScript — the password is never sent, stored or logged."],
  ],
  faqs: [
    [
      "What are the Active Directory password complexity requirements?",
      "The password must not contain the account's sAMAccountName, must not contain any token of the display name longer than two characters, and must contain characters from at least three of five categories: uppercase A-Z, lowercase a-z, digits 0-9, non-alphanumeric characters, and Unicode letters that have no upper or lower case. Windows checks this when the password is set, before any strength scoring.",
    ],
    [
      "What are the default Windows password policy settings?",
      "In the default domain policy, password history remembers 24 passwords, minimum password age is 1 day, maximum password age is 42 days and minimum length is 7 characters. The CIS Benchmark for Windows recommends raising the minimum to 14. Fine-grained password policies can override all of these for specific groups.",
    ],
    [
      "Does NIST still recommend changing passwords every 90 days?",
      "No. NIST SP 800-63B says verifiers should not require memorised secrets to be changed on a schedule, and should force a change only when there is evidence the secret has been compromised. The reasoning is that forced rotation produces predictable increments — Summer2024 becoming Autumn2024 — which weaken rather than strengthen the password.",
    ],
    [
      "Is a long passphrase better than a complex short password?",
      "Yes, in almost every case. Length adds entropy faster than symbol substitution: 16 lowercase letters and spaces give more search space than 8 characters drawn from all four categories, and a passphrase is far easier to type and remember. The practical obstacle is policy, not maths — a passphrase with only letters and spaces uses two of the five Active Directory categories and will be rejected until one digit or symbol is added.",
    ],
  ],
};

export default seo;
