const seo = {
  title: "Subject Access Request Letter: GDPR, DPDP or CCPA",
  metaDescription:
    "Draft a subject access request citing Article 15(1)(a)-(h), DPDP Section 11 or the CCPA, with the reply date computed: one calendar month or 45 days.",
  steps: [
    "Choose the law you are relying on, the date you are sending the request, your full name and your reply-to email.",
    "Tick the items under \"What to request\", each labelled with its Article 15 limb or CCPA equivalent, and choose how you want the copy delivered.",
    "Read the \"Response due by\" date, the latest date if extended and the regulator to escalate to, then press Copy letter.",
  ],
  intro:
    "A subject access request is a written demand that an organisation confirm whether it processes personal data about you and hand over a copy along with the supplementary information the law prescribes. This generator drafts that letter under the EU GDPR (Article 15), the UK GDPR, India's Digital Personal Data Protection Act 2023 (Section 11) or the California CCPA, citing the specific sub-articles for each item you tick. It also works out the date the reply is due — one calendar month under the GDPR family, 45 calendar days under the CCPA — so you know exactly when the organisation is late.",
  useCases: [
    "Ask a former employer for the personnel file, appraisal notes and internal emails that mention you before raising a grievance.",
    "Find out which data brokers and ad networks a retailer shared your purchase history with, using the Article 15(1)(c) recipients limb.",
    "Get the logic behind an automated credit or insurance decision under Article 15(1)(h) after an application was declined.",
    "Request the specific pieces of personal information a California business collected about you over the past 12 months and beyond.",
  ],
  benefits: [
    [
      "Cites the right sub-article",
      "Each item in the letter carries its own citation — Article 15(1)(a) to (h), 15(2), 15(3), or the matching Civil Code section for California.",
    ],
    [
      "Deadline computed, not guessed",
      "Calendar-month arithmetic clamps correctly, so a request sent on 31 January is due 28 February, not 3 March.",
    ],
    [
      "Pre-empts the usual stalling",
      "Wording covers the extension rules, identity verification limits and the requirement to state any exemption relied on in writing.",
    ],
  ],
  faqs: [
    [
      "How long does a company have to respond to a subject access request?",
      "Under the EU and UK GDPR the controller must respond without undue delay and at the latest within one calendar month of receiving the request, per Article 12(3). That can be extended by up to two further months for complex or numerous requests, but only if the controller tells you within the first month and explains why. Under the California CCPA the business has 45 calendar days, extendable once by another 45, and must confirm receipt within 10 business days.",
    ],
    [
      "Can a company charge me for a copy of my data?",
      "No, not for a normal request. Article 12(5) GDPR requires the response to be free of charge; a reasonable fee is only permitted where the request is manifestly unfounded or excessive, and the controller has to prove that. Cal. Civ. Code § 1798.130(a)(2) likewise requires disclosure free of charge.",
    ],
    [
      "What ID can they ask me for?",
      "Only what is genuinely necessary to identify you. Article 12(6) GDPR lets a controller ask for extra information only where it has reasonable doubts about your identity, so a request for a full passport scan when you have written from the email address already on your account is usually excessive. Californian businesses cannot require you to create an account in order to make a request.",
    ],
    [
      "What do I do if they ignore the letter or refuse?",
      "Escalate to the regulator. Article 77 GDPR gives you the right to complain to your supervisory authority — the ICO in the UK — and in California you can complain to the California Privacy Protection Agency or the Attorney General. Under India's DPDP Act, Section 13(3) requires you to exhaust the Data Fiduciary's own grievance redressal mechanism before approaching the Data Protection Board. This is general information, not legal advice; consult a solicitor or advocate if the data matters to a dispute.",
    ],
  ],
};

export default seo;
