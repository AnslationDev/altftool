const seo = {
  title: "GDPR Article 20 Data Portability Request Generator",
  metaDescription:
    "Drafts a GDPR Art. 20 portability letter, switches to an Art. 15 access request when the lawful basis rules it out, and dates the reply deadline.",
  steps: [
    "Fill Your full name, Organisation holding your data, Your email address and Username or account reference, then set Applicable law, Lawful basis they rely on, Export format you want and Date you send the request.",
    "Tick the boxes under Categories you want exported — each is tagged you supplied it, observed from your use or derived by them — and choosing Legitimate interests or Legal obligation rewrites the letter as an Article 15 access request instead.",
    "Read the They must reply by date with the Portability right applies and Format is machine-readable rows, then press Copy request to take the drafted letter, or Reset to clear the form.",
  ],
  intro:
    "The Data Portability Request Generator drafts a GDPR Article 20 request for a machine-readable copy of your personal data, and first checks whether Article 20 actually applies — it attaches only to automated processing based on consent or a contract, and only to data you provided or that was observed from your use of the service. Where it does not apply, the letter is rewritten as an Article 15 access request so you still get the data. It also calculates the reply deadline: one calendar month under Art. 12(3), or 45 days under Cal. Civ. Code s.1798.130(a)(2).",
  useCases: [
    "Export your listening or watching history before moving from one streaming service to a competitor.",
    "Get a structured copy of order history and account details from a marketplace you are closing an account with.",
    "Check whether a bank relying on legal obligation owes you portability at all, before sending a request it can lawfully refuse.",
  ],
  benefits: [
    ["Eligibility checked first", "Selecting legitimate interests or legal obligation switches the letter to an access request instead of citing a right that does not apply."],
    ["Scope split correctly", "Separates data you provided and data observed from inferred data such as scores and interest profiles, which sits outside Article 20."],
    ["Format pushed the right way", "Flags PDF as non-machine-readable, the most common way an export technically complies while being unusable."],
  ],
  faqs: [
    [
      "What is the right to data portability?",
      "GDPR Article 20 gives you the right to receive personal data you provided to a controller in a structured, commonly used and machine-readable format, and to transmit it to another controller. It applies only where the processing is automated and based on consent or on a contract, and Article 20(2) adds a right to have the data sent directly from one controller to another where technically feasible.",
    ],
    [
      "Does portability cover everything a company holds about me?",
      "No. Article 29 Working Party Guidelines WP242 rev.01 limit it to data you actively provided, such as form entries and uploads, and data observed from your activity, such as search history, location and raw device logs. Data the controller derived or inferred — credit scores, risk ratings, advertising interest profiles — falls outside Article 20, though you can still request it under the Article 15 right of access.",
    ],
    [
      "Can a company send my data export as a PDF?",
      "It should not. Article 20(1) requires a structured, commonly used and machine-readable format, and a PDF of formatted tables or a set of scanned images does not let you re-use or transmit the data. JSON, CSV and XML all satisfy the requirement. If you receive a PDF, ask again citing Article 20(1) and specify the format you want.",
    ],
    [
      "Does India's DPDP Act give a right to data portability?",
      "No. The Digital Personal Data Protection Act, 2023 gives a Data Principal the right to a summary of their personal data and the processing activities under section 11, and rights to correction and erasure under section 12, but it contains no standalone portability right. You can still ask for a machine-readable export as a matter of practice. This is informational content, not legal advice.",
    ],
  ],
};

export default seo;
