const seo = {
  intro:
    "This checker tells you which of your filings legally require a digital signature certificate and which accept an electronic verification code instead, naming the rule behind each answer. It applies rule 12(3) of the Income-tax Rules for returns, rule 26(1) of the CGST Rules for GST, rule 8 of the Companies (Registration Offices and Fees) Rules for MCA e-forms, and the e-procurement requirements that make an encryption certificate necessary alongside the signing one. Since the Controller of Certifying Authorities stopped Class 2 issuance on 1 January 2021, every answer here is a Class 3 certificate.",
  useCases: [
    "A new private limited company working out how many tokens to buy before its first AOC-4 and GST return.",
    "A proprietor with no tax audit checking whether a DSC is needed at all, or whether Aadhaar OTP verification is enough.",
    "A contractor about to bid on the CPP Portal finding out that a signature-only certificate cannot open a sealed bid.",
  ],
  benefits: [
    ["Rule cited for every answer", "Each verdict names the section, rule or portal requirement it rests on."],
    ["Signature vs encryption", "Flags the filings that need a combination certificate rather than signing alone."],
    ["Counts the tokens", "A DSC is personal and non-transferable, so the result is one certificate per signatory."],
  ],
  faqs: [
    [
      "Which filings compulsorily need a digital signature certificate?",
      "Every MCA e-form, the income tax return of a company or of any person audited under section 44AB, GST filings by a company or LLP under rule 26(1), DGFT and ICEGATE filings, IP e-filings, EPFO employer attestations and all government e-tenders. Other taxpayers may verify by EVC or Aadhaar OTP instead.",
    ],
    [
      "Is Class 2 DSC still valid?",
      "No new Class 2 certificates have been issued since 1 January 2021, following the revised CCA Interoperability Guidelines. Class 3 is now the single class used for MCA, income tax, GST, DGFT, e-tendering and every other application, so any renewal will be a Class 3 certificate.",
    ],
    [
      "What is the difference between a signing and an encryption certificate?",
      "A signing certificate proves who submitted a document and that it has not been altered. An encryption certificate is what lets a sealed bid be encrypted to the recipient and decrypted at the opening event. E-tender and e-auction portals need both, which is why they ask for a combination certificate rather than a signature-only one.",
    ],
    [
      "Can two directors share one digital signature token?",
      "No. A DSC is issued in a named individual's capacity and the private key must stay in that person's hardware crypto token, certified to FIPS 140-2 Level 2 or higher. Sharing it means one person is signing in another's name, which defeats the legal effect the Information Technology Act gives the signature. Buy one certificate per signatory.",
    ],
  ],
};

export default seo;
