const seo = {
  title: "TAN Format Validator: Check AAAA99999A Offline",
  metaDescription:
    "Check a TAN against the four letters, five digits, one letter pattern in your browser — it names the failing position and decodes the location code.",
  steps: [
    "Stay on Single TAN and type the ten characters into the TAN field (placeholder AAAA99999A), or switch to Bulk list and paste one TAN per line into the 'One TAN per line' box.",
    "The pattern check runs as you type, entirely in the browser — a malformed entry raises an alert naming the failing character and, where it can, a 'Did you mean' suggestion.",
    "Read Structure for the grouped TAN plus Location code (positions 1-3), Income-tax office city, Deductor name initial (position 4), Serial (positions 5-9) and Final letter (position 10) — or a valid/invalid verdict per row in bulk mode — then press Copy result.",
  ],
  intro:
    "A TAN is the ten-character Tax Deduction and Collection Account Number that section 203A of the Income-tax Act requires every deductor to quote, built as four letters, five digits and one closing letter. This validator checks that structure offline, splits the number into its location code, deductor initial, serial and final letter, and names the exact position that is wrong when it fails. It is built for payroll and accounts teams reconciling TDS challans, and for developers adding a client-side format check before an API call.",
  useCases: [
    "Screening a column of deductor TANs from a vendor master before uploading a Form 26Q return.",
    "Catching the classic letter-O-for-zero typo in positions 5 to 9 of a hand-keyed TAN.",
    "Adding an offline regex check to a form so obviously malformed TANs never reach the Income Tax API.",
  ],
  benefits: [
    ["Character-level errors", "Names the failing position instead of just saying invalid, and suggests the likely fix."],
    ["Bulk mode", "Paste a whole list and get a valid or invalid verdict for every line at once."],
    ["Nothing leaves the browser", "The check is pure pattern matching in JavaScript, so no TAN is transmitted or stored."],
  ],
  faqs: [
    [
      "What is the correct format of a TAN?",
      "A TAN is exactly ten characters in the pattern AAAA99999A: three letters for the city of the allotting income-tax office, a fourth letter that is the initial of the deductor's name, five digits, and one final letter. Anything longer, shorter or out of that order is not a TAN.",
    ],
    [
      "Can a TAN be verified offline?",
      "Only its structure. A TAN has no published check digit, so an offline tool can prove the shape is right but never that the number was actually allotted. Use the Know your TAN service on the Income Tax e-filing portal to confirm the deductor's name against a TAN.",
    ],
    [
      "What is the difference between TAN and PAN?",
      "A PAN is five letters, four digits and one letter and identifies a taxpayer; a TAN is four letters, five digits and one letter and identifies a person who deducts or collects tax at source. A business normally holds both, and quoting a PAN where a TAN is required makes the TDS statement invalid.",
    ],
    [
      "What is the penalty for not having a TAN?",
      "Section 272BB provides a penalty of Rs 10,000 for failing to apply for a TAN or for quoting a wrong TAN in challans, statements or certificates. Banks also refuse TDS challans that do not carry a valid TAN, so the deposit itself can fail.",
    ],
  ],
};

export default seo;
