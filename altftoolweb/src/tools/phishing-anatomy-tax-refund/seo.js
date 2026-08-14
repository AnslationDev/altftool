const seo = {
  title: "Fake Income Tax Refund SMS: DIN Check and Scanner",
  metaDescription:
    "Takes the fake refund notice apart line by line and scores anything you paste against 13 markers, reading the real domain behind every link.",
  steps: [
    "Paste the SMS, email or WhatsApp message into the Scan a message box — defanged addresses written as bad[.]online and hxxp:// are read as written.",
    "The Risk score updates as you type, with Markers matched, Points from the wording, Points from the links and the Strongest link problem listed under it.",
    "Check The links in that message panel, which prints the Real domain behind each host, then press Copy result for the findings or Reset to restore the specimen.",
  ],
  intro:
    "This explainer dissects the fake income tax refund notice — an approved amount, a bank-account mismatch, and a link that wants your net banking login — and names the tell in each line. It sets the message against two rules that settle it: refunds are credited only to a bank account already pre-validated on the e-filing portal and linked to your PAN, and every departmental communication issued since 1 October 2019 carries a Document Identification Number. A scanner scores anything you paste against 13 weighted markers and reads the registrable domain behind each link.",
  useCases: [
    "Check a refund SMS or email that arrived in filing season before entering anything on the page it links to.",
    "Verify whether a notice is genuine by looking for a DIN and authenticating it on the e-filing portal.",
    "Show a first-time filer why incometax.gov.in is checkable in a way that incometaxindia-refund.online never is.",
    "Give an accounting team a shared reference for the refund phishing their clients forward every year.",
  ],
  benefits: [
    [
      "Anchored to real rules",
      "The DIN requirement and the pre-validated-account rule give you two checks that do not depend on how convincing the message looks.",
    ],
    [
      "Domain-level link reading",
      "The inspector resolves the registrable domain, handles gov.in and co.in suffixes, and flags punycode, userinfo tricks, shorteners and bare IP hosts.",
    ],
    [
      "Nothing is uploaded",
      "Every rule runs in your browser, so a notice you are unsure about never leaves the tab.",
    ],
  ],
  faqs: [
    [
      "Does the Income Tax Department send refund links by SMS or email?",
      "No. A refund is credited directly to the bank account you pre-validated on the e-filing portal and linked to your PAN, so there is nothing to claim and no link to click. Refund status is visible only inside your own e-filing account at incometax.gov.in.",
    ],
    [
      "How do I check whether an income tax notice is genuine?",
      "Look for the Document Identification Number. Every communication issued by the department since 1 October 2019 carries a computer-generated DIN, one issued without a valid DIN is treated as never issued, and you can verify it under \"Authenticate notice/order issued by ITD\" on the e-filing portal.",
    ],
    [
      "The email came from an address containing incometaxindia. Is that proof?",
      "No. Only the domain after the @ identifies a sender, and words like incometaxindia can appear anywhere inside a domain that someone else registered. Genuine departmental mail comes from the incometax.gov.in family of addresses, and .gov.in cannot be registered by a private party.",
    ],
    [
      "What should I do if I entered my net banking details on a refund page?",
      "Call your bank on the number printed on your card and have the login and card locked, then call 1930 and file at cybercrime.gov.in with the message and the full link. Check your actual refund status by typing incometax.gov.in yourself; this is general guidance, not tax or legal advice.",
    ],
  ],
};

export default seo;
