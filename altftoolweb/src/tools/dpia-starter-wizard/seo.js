const seo = {
  intro:
    "The DPIA Starter Wizard turns a short description of a new feature into a first-pass privacy risk rating out of 11 and the outline of a data protection impact assessment. It scores processing scale, whether sensitive data or vulnerable people are involved, and whether the data touches high-risk categories such as location, biometrics, health, children, financial data or profiling, then subtracts credit for up to three safeguards you list. Privacy, product and engineering teams get a structured starting point and a Lower, Medium or High initial rating before the formal assessment begins.",
  useCases: [
    "A product team is about to start building location-based recommendations and needs to know, in one sitting, whether this is going to need a full DPIA before design is locked.",
    "You are triaging a backlog of twenty proposed features and want a consistent way to rank which ones the privacy team should assess first.",
    "An engineer has to justify to a reviewer why a feature is low risk and needs the safeguards written down alongside the data categories rather than argued from memory.",
  ],
  benefits: [
    [
      "Safeguards actually move the score",
      "Each mitigation you list reduces the risk score, up to three, so the rating reflects the controls you have already built rather than the raw data alone.",
    ],
    [
      "High-risk categories detected from your own words",
      "Mentioning location, biometrics, health, children, financial data, tracking or profiling adds to the score automatically, matching the categories regulators single out.",
    ],
    [
      "Ends with the sections you still owe",
      "The output lists the parts a scan cannot do for you — necessity and proportionality, data flow mapping, risks to people, mitigation owners, and the review schedule.",
    ],
  ],
  faqs: [
    [
      "When is a DPIA legally required?",
      "Under GDPR Article 35 a DPIA is required whenever processing is likely to result in a high risk to people's rights and freedoms, and is explicitly required for systematic large-scale evaluation or profiling with significant effects, large-scale processing of special-category data, and systematic large-scale monitoring of publicly accessible areas. European guidance treats meeting two or more of its nine high-risk criteria as a strong signal that one is needed; confirm the position with your DPO or privacy counsel.",
    ],
    [
      "How is the risk score calculated?",
      "Scale contributes 1 for small, 2 for medium and 4 for large or systematic processing; sensitive data or vulnerable people adds 4; a high-risk data category adds 3; and each listed safeguard subtracts 1 up to a maximum of 3. The total runs to 11, with 7 and above rated High and 4 to 6 rated Medium.",
    ],
    [
      "Does a High rating mean we cannot ship the feature?",
      "No, it means the feature needs a full assessment and documented mitigations before it proceeds. If a completed DPIA still shows high residual risk that you cannot reduce, GDPR Article 36 requires you to consult your supervisory authority before starting the processing.",
    ],
    [
      "Is the output a finished DPIA?",
      "No. It is a structured starter that captures the feature, data, affected people and safeguards and gives an initial rating, but a real DPIA also documents necessity and proportionality, the full data lifecycle, risks to individuals, named mitigation owners and formal sign-off. Have a qualified privacy professional complete and approve it.",
    ],
  ],
};

export default seo;
