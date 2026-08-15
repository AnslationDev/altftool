const seo = {
  title: "Fake Parcel SMS: Redelivery Fee Scam, Line",
  metaDescription:
    "Paste a parcel-on-hold message and score it against 13 weighted markers; the link inspector reads the registrable domain, not the brand word. Runs in-tab.",
  intro:
    "This explainer takes the fake delivery SMS apart — the \"your parcel is on hold, pay a small redelivery fee\" message — and names the tell in each line, from the tiny fee that exists only to open a card form to the OTP that approves a far larger amount than the page shows. A scanner scores any message you paste against 13 weighted markers of the same family and inspects every link separately, reading the registrable domain rather than the brand word so indiapost-redelivery.top is shown for what it is. Written for anyone in India who gets three delivery messages a week and cannot check each one against an order.",
  useCases: [
    "Check a parcel-on-hold SMS against the carrier's real domain before paying a Rs.25 or Rs.49 fee.",
    "Explain to a family member why the amount in their bank's OTP message, not the amount on the web page, is what they are approving.",
    "Decide whether a customs-clearance demand on an inbound international parcel came from the carrier or from a scammer.",
    "Brief a small e-commerce support team on the delivery-fee scam their customers keep reporting.",
  ],
  benefits: [
    [
      "Reads the domain, not the brand word",
      "The link inspector resolves the registrable domain, handles gov.in and co.in suffixes, and flags shorteners, punycode, bare IPs and userinfo tricks.",
    ],
    [
      "Weighted markers",
      "A CVV request scores 13 points and a mention of a held parcel scores 7, so the verdict reflects what actually separates a scam from a real notification.",
    ],
    [
      "Private by construction",
      "The rules run in your browser; a message you are unsure about is never uploaded.",
    ],
  ],
  faqs: [
    [
      "Is the India Post redelivery fee SMS real?",
      "No. India Post does not collect redelivery or address-correction fees through an SMS link, and its tracking lives on indiapost.gov.in — a .gov.in address nobody else can register. Any variant asking for card details to release a parcel is a phishing message.",
    ],
    [
      "Why do these scams ask for only Rs.25?",
      "Because the fee is not the fraud. A small amount is below the threshold at which most people stop to verify, and the card number, expiry and CVV typed on the payment page are worth far more than the charge itself.",
    ],
    [
      "I entered an OTP for a small delivery fee and lost a much bigger amount. How?",
      "The OTP approves whatever the bank's own message says, not what the web page claims. Scam pages display Rs.25 while the request sent to your bank is a larger debit or a recurring e-mandate, so the amount and merchant in your bank's SMS are the only figures that count.",
    ],
    [
      "What should I do after paying a fake delivery fee?",
      "Call your bank on the number printed on the card and block it, then call 1930 — the national cyber-crime helpline — and file a complaint at cybercrime.gov.in with screenshots. Reporting within the first hours gives the best chance of the receiving account being frozen; this is general guidance, not legal advice.",
    ],
  ],
};

export default seo;
