const seo = {
  title: "Card Number Regex by Network: Visa, Mastercard, Amex",
  metaDescription:
    "Copy card-format regex for Visa, Mastercard (incl. 2221-2720), Amex, RuPay, Discover, JCB and Diners, with ISO 7813 grouping and last-4 masking.",
  steps: [
    "Type a public test number such as 4111 1111 1111 1111 into 'Card-style number (test numbers only)' — never a real card number.",
    "Pick a network under 'Pattern to copy' and press 'Copy regex' to put the full pattern, slashes included, on your clipboard.",
    "Read the detected network, digit count, ISO 7813 display grouping and the PCI-style masked form with only the last 4 digits visible.",
  ],
  intro:
    "This library provides card number format regular expressions by network — Visa (13/16/19 digits, prefix 4), Mastercard including the 2221–2720 series added in 2016, American Express (15 digits, 34/37), RuPay, Discover, JCB and Diners Club — for input formatting, masking and network badges, explicitly not verification. It also demonstrates ISO 7813-style display grouping (4-4-4-4, Amex 4-6-5, Diners 4-6-4) and PCI-style masking that shows only the last four digits.",
  useCases: [
    "A checkout form developer showing the right network badge and input grouping as the user types a test card number",
    "An engineer building a masked card display (•••• •••• •••• 1111) for a saved-payment-methods screen",
    "A QA engineer generating format-valid fixtures per network for UI tests using the public test numbers",
  ],
  benefits: [
    ["Mastercard 2-series included", "The 2221–2720 range is encoded precisely — patterns that only check 51–55 reject millions of real cards."],
    ["Formatting and masking built in", "Grouping follows the embossing convention per length, and masking shows only the last 4 digits."],
    ["Overlaps documented", "The RuPay/Discover 65-prefix collision is surfaced instead of silently resolved wrong."],
  ],
  faqs: [
    [
      "What is the regex for a Visa card number?",
      "^4[0-9]{12}(?:[0-9]{3})?(?:[0-9]{3})?$ — a leading 4 followed by 12 more digits, optionally extended to 16 or 19 digits. It identifies the format only; it does not run a Luhn check or confirm the card exists, so use it for UI hints, not validation of payment ability.",
    ],
    [
      "How do I detect the card network from the number?",
      "Match the leading digits against each network's IIN ranges: 4 is Visa, 51–55 and 2221–2720 are Mastercard, 34/37 are Amex, 6011/65 are Discover, 3528–3589 are JCB, 300–305/36/38 are Diners, and RuPay uses 508, 60, 65, 81 and 82. Some ranges collide — 65 is both RuPay and Discover — so a regex gives a hint while an up-to-date BIN database gives the answer.",
    ],
    [
      "Why shouldn't I use regex to validate credit card numbers?",
      "Because format-valid numbers are trivially fake: a regex cannot run the Luhn checksum, look up the issuer, or know whether the account is open. Real validation happens at authorisation time through a PCI DSS-certified payment gateway; client-side patterns should only drive formatting, masking and network badges.",
    ],
    [
      "How should a card number be masked for display?",
      "PCI DSS Requirement 3.3 allows displaying at most the first 6 and last 4 digits; the common safe default is last-4 only, rendered with the network's grouping, like •••• •••• •••• 1111 for a 16-digit card or •••• •••••• •0005 for a 15-digit Amex. Everything else should be masked at rest and in logs.",
    ],
  ],
};

export default seo;
