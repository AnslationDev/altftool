const seo = {
  title: "Phone Number Regex: E.164, India, US/Canada & UK Patterns",
  metaDescription:
    "Copy-ready regex for E.164, Indian mobiles starting 6–9, US/Canada NANP and UK numbers — each with a live tester and a list of what it cannot verify.",
  steps: [
    "Pick a Region / format — E.164 canonical, India mobile (TRAI), US / Canada (NANP), United Kingdom (Ofcom) or Loose international (CRM input) — and type a number into 'Test a phone number'.",
    "Read the instant Match or No match verdict, the pattern's scope, and its Accepts/Rejects example chips — the NANP pattern passes 415-555-2671 and rejects 115-555-2671.",
    "Press Copy regex to take the /pattern/ into your codebase, and read 'Known limitations of this pattern' so you ship knowing what the regex cannot verify.",
  ],
  intro:
    "This library provides copy-ready regular expressions for validating phone numbers in the formats developers actually meet: the ITU-T E.164 canonical form (+ and up to 15 digits), Indian 10-digit mobiles starting 6–9 per the TRAI numbering plan, US/Canada numbers under NANP rules, UK numbers with the Ofcom trunk-0 / +44 convention, and a loose 8–15-digit international catch-all. Every pattern has a live tester and an explicit list of what it cannot verify, so you know exactly what you are shipping.",
  useCases: [
    "A developer normalising a signup form to store numbers in E.164 before sending OTPs through an SMS gateway",
    "An Indian fintech validating that a mobile field is a 10-digit number starting 6–9 with an optional +91 prefix",
    "A CRM team accepting loosely formatted international numbers now and normalising them with a phone library later",
  ],
  benefits: [
    ["Region-correct rules", "India's 6–9 first-digit rule, NANP's 2–9 area-code rule and the E.164 15-digit ceiling are encoded, not guessed."],
    ["Live testing", "Paste any number and instantly see whether the selected pattern accepts it before copying the regex."],
    ["Honest scope notes", "Each pattern states what it cannot check — assignment, reachability, landlines, extensions — so validation gaps are known upfront."],
  ],
  faqs: [
    [
      "What is the regex for E.164 phone number format?",
      "^\\+[1-9]\\d{1,14}$ — a plus sign followed by 2 to 15 digits whose first digit is 1–9. E.164 is the ITU-T standard for international numbers, caps them at 15 digits, and is the format SMS and voice APIs such as Twilio require, so it is the right shape to store in your database.",
    ],
    [
      "How do I validate an Indian mobile number with regex?",
      "Use ^(?:\\+91[\\s-]?|0)?[6-9]\\d{4}[\\s-]?\\d{5}$ — an optional +91 or trunk 0, then 10 digits starting with 6, 7, 8 or 9, which is the current range for Indian mobiles under the DoT numbering plan. Note this rejects Indian landlines, which use an STD code plus a 6–8 digit subscriber number instead.",
    ],
    [
      "Why does my US phone regex reject numbers starting with 1?",
      "Because under the North American Numbering Plan neither the 3-digit area code nor the 3-digit exchange code may begin with 0 or 1 — those digits are reserved for trunk and operator prefixes. A correct NANP pattern therefore uses [2-9]\\d{2} for both, which is why 115-555-2671 fails while 415-555-2671 passes.",
    ],
    [
      "Can regex tell me if a phone number is real?",
      "No — regex can only confirm the digits fit a numbering-plan shape, not that the number is assigned, in service or reachable. For correctness beyond format, use a numbering-plan library like libphonenumber for country-specific length and range checks, and an OTP or call for actual verification.",
    ],
  ],
};

export default seo;
