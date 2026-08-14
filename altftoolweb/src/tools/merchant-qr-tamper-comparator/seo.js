const seo = {
  title: "UPI QR Tamper Check: Compare Merchant QR Payloads",
  metaDescription:
    "Put a trusted upi:// payload beside the current one and compare pa, pn, mid, am, cu, tr and tid field by field. Decoded locally, never opened.",
  steps: [
    "Paste the trusted reference upi:// payload on one side and the current displayed QR on the other, or press Upload QR image for a JPEG, PNG or WebP file.",
    "Tick the independently-trusted reference confirmation, then press 'Compare selected UPI fields'.",
    "Read the matching, mismatching and not-checkable counts and the per-field table, then press Download counts-only report for merchant-qr-comparison-counts.csv.",
  ],
  intro:
    "The Merchant QR Tamper Comparator puts a trusted UPI QR payload side by side with a current one and reports, field by field, whether they still agree. It parses each upi:// URI and compares eight fields — payment action, payee VPA (pa), payee name (pn), merchant ID (mid), fixed amount (am), currency (cu), transaction reference (tr) and transaction ID (tid) — under documented normalisation, and flags payloads carrying duplicate parameters or invisible Unicode controls as not checkable rather than guessing. Shop owners, auditors and anyone who maintains a printed QR at a counter get a deterministic difference report without any payment app being opened.",
  useCases: [
    "You keep a photo of the QR sticker you printed on day one, and this morning it looks slightly different — you decode both images here to see whether the payee VPA still matches.",
    "A staff member reports a customer's app showing an unfamiliar merchant name at checkout, and you need to confirm whether the pn field on the counter QR changed while the VPA stayed the same.",
    "You are auditing QR codes across several branches and want a per-field match/mismatch record for each counter without scanning any of them with a payment app.",
  ],
  benefits: [
    ["It never opens the link", "Only upi: URIs are parsed, and they are read as text — nothing is launched, no payment flow is started, and any other scheme is rejected outright."],
    ["Normalised comparison, stated rules", "VPA and action are lower-cased, currency upper-cased, amount compared at two decimals and payee name whitespace-collapsed, so cosmetic differences are not reported as tampering."],
    ["Honest about what it cannot judge", "Duplicate parameter keys or hidden bidirectional Unicode mark a field not-checkable instead of match, because an ambiguous payload cannot be safely compared by eye."],
  ],
  faqs: [
    [
      "Which QR fields does it actually compare?",
      "Eight: the UPI action (pay, collect, request or mandate), pa, pn, mid, am, cu, tr and tid. Fields missing from both payloads are reported as not checkable; a field present on only one side is reported as a mismatch.",
    ],
    [
      "Does uploading a QR image send it anywhere?",
      "No. The image is drawn to a canvas in your browser and decoded locally with jsQR, and the payload text never leaves the page. Uploads are limited to JPEG, PNG and WebP, and the decoder retries across nine overlapping regions of the image so a sticker photographed off-centre still reads.",
    ],
    [
      "What does an invisible Unicode warning mean?",
      "It means the payload contains zero-width or bidirectional control characters (the U+200B-U+200F and U+202A-U+202E ranges, among others) that can make two different strings render identically. Any field containing them is marked not checkable, because a visual comparison of that field would be unreliable.",
    ],
    [
      "A field mismatched — does that prove the QR was tampered with?",
      "No. A mismatch means the two payloads differ, which can equally come from a legitimately reissued QR, a new transaction reference, or a different amount deliberately encoded. Treat the report as a prompt to verify with your payment service provider or bank through their own channel before accepting payments on that code.",
    ],
  ],
};

export default seo;
