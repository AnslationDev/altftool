const seo = {
  intro:
    "Masking a number means replacing its middle digits so it can still be recognised without being reusable, and the safe defaults are already written down: PCI DSS permits at most the first six and the last four digits of a payment card to be displayed, while a UIDAI masked Aadhaar reveals only the final four. This tool applies those presets to an account, card or Aadhaar number, verifies the Luhn checksum for cards and the Verhoeff checksum for Aadhaar to work out what it is looking at, and warns when your settings would expose more than the rule allows. It also redacts every long digit run inside a pasted block of text, entirely in the browser.",
  useCases: [
    "Attaching a bank statement line to a support ticket without exposing the full account number.",
    "Sharing a payment failure screenshot with a developer who needs the card's first six digits and nothing else.",
    "Cleaning a spreadsheet or email thread before forwarding it outside the finance team.",
  ],
  benefits: [
    ["Presets match real standards", "Six-and-four for cards and last-four for Aadhaar come from PCI DSS and UIDAI, not from guesswork."],
    ["Knows what it is masking", "Luhn and Verhoeff checks identify cards and Aadhaar numbers so the tool can warn when a setting is too permissive."],
    ["Nothing leaves the browser", "The number is processed locally, which matters because sending sensitive numbers to a server to hide them defeats the purpose."],
  ],
  faqs: [
    [
      "How many digits of a card number can I safely show?",
      "At most the first six and the last four. PCI DSS limits the maximum displayed elements of a primary account number to the BIN and the last four digits, and anything beyond that needs a documented business justification. Showing only the last four is safer still, and the CVV, PIN and full magnetic-stripe data must never be displayed or stored.",
    ],
    [
      "How should a bank account number be masked?",
      "Reveal the last four digits and hide everything before them, which is the convention banks themselves use in statements and apps. Pair it with care about context — an account number with an IFSC and a name is far more useful to a fraudster than the number alone, so mask the account even when the IFSC is left visible.",
    ],
    [
      "What is a masked Aadhaar and when should I use one?",
      "A masked Aadhaar shows only the last four digits, with the first eight replaced. UIDAI offers it as a download option in myAadhaar precisely so it can be used as proof of identity without disclosing the full twelve-digit number. Use it wherever a copy of Aadhaar is being handed over for verification rather than for authentication.",
    ],
    [
      "Is masking enough to make a screenshot safe to share?",
      "Not on its own. Text under a coloured highlight, a semi-transparent box or a blur can often be recovered, and PDFs frequently keep the original text under a drawn rectangle. Crop the image or paint over the region with an opaque fill and re-export it as a flattened file, and check that the number does not also appear in a filename, a URL or the document metadata.",
    ],
  ],
};

export default seo;
