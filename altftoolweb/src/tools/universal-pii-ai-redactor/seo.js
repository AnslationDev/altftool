const seo = {
  intro:
    "The Universal PII & AI Input Redactor scans pasted text for 15 categories of sensitive data — names, emails, phones, addresses, dates of birth, Aadhaar, PAN, passport, US SSN, payment cards, bank accounts, IBAN, IP and MAC addresses, and API keys or tokens — and rewrites them before you send the text to a chatbot, a vendor or a colleague. Detection is not pure pattern matching: card numbers must pass the Luhn checksum, IBANs must satisfy MOD-97, and IPv4 octets must be within range, which cuts the false positives that plain regex tools produce. You choose how each hit is replaced, and the text never leaves the page.",
  useCases: [
    "You want an AI assistant to summarise a customer support thread, but the thread is full of real emails, order numbers and a card the customer pasted in frustration.",
    "You are attaching a production log to a public bug report and need the bearer tokens, API keys and internal IP addresses gone before it goes anywhere.",
    "You are sharing a spreadsheet extract or a case note with an external analyst and must keep the records linkable — the same person appearing as the same placeholder throughout.",
  ],
  benefits: [
    [
      "Checksum-verified detection",
      "Card candidates are Luhn-validated and IBANs MOD-97 validated, so a 16-digit order reference is not silently mangled as a card number.",
    ],
    [
      "Stable placeholders keep meaning",
      "In label mode the same email or phone always maps to the same token, so [EMAIL_1] appearing twice still tells the reader it is one person.",
    ],
    [
      "Counts-only audit report",
      "The downloadable JSON report lists how many hits and how many unique values were found per category, and contains none of the values themselves.",
    ],
  ],
  faqs: [
    [
      "What is the difference between the three redaction modes?",
      "Smart labels replace each value with a numbered token such as [EMAIL_1] or [CARD_2], reusing the same token for the same value so relationships in the text survive. Partial mask keeps the last four characters for phones, cards and bank accounts and the last two elsewhere, while Remove values replaces every hit with a flat [REDACTED].",
    ],
    [
      "Does my text get uploaded anywhere?",
      "No. Detection and replacement run entirely in your browser, so nothing is sent to a server, and the JSON report you can download contains only per-category counts, not the detected values.",
    ],
    [
      "How does it avoid flagging ordinary numbers as credit cards?",
      "A 13 to 19 digit run is only treated as a card if it passes the Luhn mod-10 checksum, and strings of one repeated digit are rejected outright. The same principle applies elsewhere: IBANs must give a MOD-97 remainder of 1, IPv4 octets must be 255 or lower, and phone candidates must have 10 to 15 digits.",
    ],
    [
      "Should I trust it to catch everything before I share a document?",
      "No automated detector is complete — unlabelled names, free-text addresses, internal identifiers and anything in an unusual format can slip through, and some categories only match when they carry an explicit label such as Address: or Account number:. Read the redacted output line by line before sharing, and follow your organisation's data-handling rules for regulated records.",
    ],
  ],
};

export default seo;
