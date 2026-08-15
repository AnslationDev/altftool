const seo = {
  title: "Analytics PII Checker: Scan Event Payloads for Leaks",
  metaDescription:
    "Scans a pasted analytics payload for emails, phone numbers, IPv4 addresses, bearer tokens and keys like dob or user_id, showing masked examples only.",
  steps: [
    "Paste a JSON body or a captured request line into 'Analytics payload or request log', or press the 'JSON payload' example chip.",
    "Keep 'Include masked examples in the report' ticked so each hit shows only its first two and last two characters.",
    "Read the Type / Count / Masked example table for email, phone, IPv4, authorization token and sensitive-key hits, then Copy or Download analytics-pii-checker.txt.",
  ],
  intro:
    "The Analytics PII Checker scans a pasted analytics payload or request log for five classes of personal data that commonly leak into event tracking: email addresses, phone numbers, IPv4 addresses, authorization tokens and API keys, and sensitive property names such as name, email, address, dob, aadhaar, pan, passport and user_id. It reports how many matches each detector found and shows a masked example — first two and last two characters only — so you can confirm the hit without copying the raw value anywhere. It is a pattern-matching first pass for engineers reviewing what their tag manager actually sends, not a compliance assessment.",
  useCases: [
    "You are reviewing a checkout event before it ships and want to know whether the customer's email is riding along in the payload",
    "A tag manager change added a new custom dimension and you need to check the outgoing request log for a bearer token that was pasted in by mistake",
    "You are preparing a data-flow record and want a quick inventory of which identifier types appear in a sample of your event traffic",
  ],
  benefits: [
    ["Masks what it finds", "Matches are shown as the first two and last two characters, so a review does not turn into another copy of the personal data."],
    ["Covers keys as well as values", "It flags property names like dob, aadhaar or user_id even when the value itself looks harmless, because the field name is the leak."],
    ["Works on raw request logs", "Paste a JSON body or a captured request line — it matches on text, so nested payloads and query strings both get scanned."],
  ],
  faqs: [
    [
      "What kinds of personal data does this detect?",
      "Five: email addresses, phone numbers (any run of 9 or more digits with common separators), IPv4 addresses, authorization headers and API keys of 8 or more characters, and sensitive property names including name, email, phone, address, dob, aadhaar, pan, passport and user_id. Anything outside those patterns — a custom internal identifier, a hashed value, a free-text field — will not be caught.",
    ],
    [
      "Is an IP address personal data?",
      "Under GDPR, an IP address is generally treated as personal data because it can single out a device and, combined with other information, a person. Most analytics platforms therefore offer IP truncation or anonymisation. Whether a specific field is personal data in your jurisdiction is a legal question — this tool only tells you the value is present. Consult a privacy or legal professional for that determination.",
    ],
    [
      "Does my data get uploaded when I scan it?",
      "No. The scan runs in your browser on the text you paste; nothing is sent to a server, and the masked examples are generated locally. That is deliberate — a tool for finding leaked personal data should not be a place you send personal data.",
    ],
    [
      "A clean result means my analytics are compliant, right?",
      "No. A clean result means none of the five configured patterns matched the sample you pasted. It says nothing about custom identifiers, nested fields the regexes did not reach, other payloads on other pages, consent, retention, or lawful basis. Treat it as a first pass and review the remaining fields by hand.",
    ],
  ],
};

export default seo;
