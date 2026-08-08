const seo = {
  title: "Price Evidence Locker: SHA-256 Record of an Offer",
  metaDescription:
    "Log a listing's URL, seller, price, offer terms and capture date, then hash them with your screenshot into one SHA-256 manifest. It does not notarise.",
  steps: [
    "Fill \"Product or offer URL\", \"Seller\", \"Observed price\", \"Offer claim and conditions\" and \"Capture date\".",
    "Attach the optional \"Screenshot or saved page\" file — its name, size and contents are folded into the same SHA-256 digest.",
    "Read the Evidence manifest with its 12-character reference and full 64-character SHA-256, then press Download to save price-evidence-locker.txt.",
  ],
  intro:
    "The Price Evidence Locker records what a listing said and when — URL, seller, observed price, the offer claim and its conditions, and the capture date — then hashes all of it together with any screenshot you attach into a single SHA-256 checksum, producing a manifest you can keep alongside the original file. It is for shoppers dealing with a price that changed between the ad and the checkout, or a discount whose conditions quietly moved, who want a dated record instead of a vague memory. The checksum covers the attached file's name, size and contents, so a later alteration to either the metadata or the screenshot produces a different digest.",
  useCases: [
    "A retailer advertised a phone at one price, charged more at checkout, and you want a dated note of the listing and its terms before opening a complaint.",
    "You spotted a '30% off until 31 July, new customers only' banner and want the exact wording and conditions preserved in case the seller later disputes what was on offer.",
    "You are collecting several quotes for the same product across sellers and want a consistent, checksummed record of each price and delivery claim on the day you saw it.",
  ],
  benefits: [
    [
      "One checksum over metadata and screenshot together",
      "The SHA-256 is computed over the URL, seller, price, claim, capture date and the attached file's name, size and content, so the record and its evidence are bound rather than kept as two loose items.",
    ],
    [
      "Claims and conditions captured, not just the number",
      "The offer text field keeps the qualifying conditions — deadline, eligibility, delivery inclusion — which is usually where a dispute actually turns.",
    ],
    [
      "Tells you when the record is weak",
      "A manifest with no file attached is labelled metadata-only, so you know at a glance that you have your own note rather than a copy of what the page displayed.",
    ],
  ],
  faqs: [
    [
      "Does this prove what a website showed on a given date?",
      "No, and it says so. It creates a local manifest and checksum from what you entered; it does not independently timestamp, notarise, or verify that a remote page displayed anything. Anyone needing a stronger record should keep the original screenshot, order confirmation and transaction records too.",
    ],
    [
      "What hash does it use, and what goes into it?",
      "SHA-256, computed in your browser via the Web Crypto API over the URL, seller, observed price, claim text, capture date and the attached file's name, size and contents joined together. The first 12 hex characters are shown as a short manifest reference, with the full 64-character digest in the output.",
    ],
    [
      "Do I have to attach a screenshot?",
      "No, the file field is optional — but attaching a saved page or screenshot is what makes the record worth keeping, because it pulls the file's contents into the checksum. Without it you get a metadata-only manifest based purely on what you typed.",
    ],
    [
      "Is the screenshot uploaded anywhere?",
      "No. The file is read and hashed in your browser and the manifest is generated locally, so the evidence never leaves your device. Store the original file unchanged next to the downloaded manifest — if the file is edited or re-saved, the checksum will no longer match. For a formal dispute or legal claim, consult the relevant consumer body or a qualified adviser about what evidence they require.",
    ],
  ],
};

export default seo;
