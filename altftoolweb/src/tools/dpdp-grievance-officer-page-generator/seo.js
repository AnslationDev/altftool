const seo = {
  title: "Grievance Officer Page Generator for Indian Sites",
  metaDescription:
    "Officer name, email, phone, address plus statutory windows — 24h/15 days under IT Rules, 48h/one month under E-Commerce Rules — as Markdown, HTML or text.",
  steps: [
    "Fill Registered entity name, Website URL, Officer name, email, phone and postal address, then set Which rules apply — personal data only (DPDP Act, 2023), intermediary (IT Rules, 2021), e-commerce entity, or both.",
    "Leave Acknowledge within (hours, blank = statutory) and Resolve within (days, blank = statutory) empty to take the rule's own windows, or type your own — a promise slower than the rule is flagged.",
    "Switch the Published page output between Markdown, HTML and Plain text, clear the nine-item Checklist (named officer, email, phone, postal address, both windows, escalation route, page date, DPO), then press Copy page.",
  ],
  intro:
    "This generator writes the grievance redressal block an Indian website has to publish: the named officer, a working email, a phone number, a postal address and the exact time limits within which complaints are acknowledged and decided. It encodes the three regimes that fix those limits — Rule 3(2) of the IT (Intermediary Guidelines) Rules, 2021, Rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020, and section 13 of the Digital Personal Data Protection Act, 2023 — and flags any promise on your page that is slower than the rule allows. Output is available as Markdown, ready-to-paste HTML or plain text.",
  useCases: [
    "Publishing a /grievance-redressal page for a D2C store that sells to Indian consumers and needs the 48-hour acknowledgement and one-month redressal wording from the E-Commerce Rules.",
    "Adding a Resident Grievance Officer block to a social or UGC platform that must acknowledge in 24 hours and dispose of complaints in 15 days.",
    "Updating a privacy policy footer after appointing a Data Protection Officer as a Significant Data Fiduciary under the DPDP Act.",
    "Auditing an existing grievance page to check it names a person, a phone number and a postal address rather than only a support form.",
  ],
  benefits: [
    ["Statutory timelines built in", "The 24-hour, 48-hour, 15-day and one-month windows come from the rule that applies to your business type."],
    ["Warns on weak promises", "If you enter a slower response window than the rule permits, the page tells you which rule you are undercutting."],
    ["Paste-ready output", "Markdown, semantic HTML with mailto and tel links, or plain text for a PDF policy pack."],
  ],
  faqs: [
    [
      "Who has to appoint a Grievance Officer in India?",
      "Every intermediary under Rule 3(2) of the IT Rules, 2021 and every e-commerce entity under Rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020 must appoint one and publish the officer's name and contact details on the website or app. Separately, section 8(9) of the DPDP Act, 2023 requires a Data Fiduciary to publish the contact of a Data Protection Officer or of a person who can answer questions about how personal data is processed.",
    ],
    [
      "How fast must a Grievance Officer respond?",
      "Under IT Rules Rule 3(2)(a) the complaint must be acknowledged within 24 hours and disposed of within 15 days. Under E-Commerce Rules Rule 4(5) it is 48 hours to acknowledge and one month from receipt to redress. Complaints about non-consensual intimate imagery must be acted on within 24 hours under Rule 3(2)(b).",
    ],
    [
      "What can a user do if the Grievance Officer does not fix the problem?",
      "For content and platform complaints, a user may appeal to a Grievance Appellate Committee within 30 days of the officer's decision under Rule 3A of the IT Rules, 2021. For personal data complaints, section 13(3) of the DPDP Act requires the person to exhaust the company's grievance route first, after which they may complain to the Data Protection Board of India. Consumer complaints can go to the National Consumer Helpline on 1915.",
    ],
    [
      "Does the DPDP Act set a deadline for answering a data grievance?",
      "The Act itself does not print a number of days — section 13 requires a readily available means of grievance redressal and leaves the response period to the rules made under it. Until that period binds you, publish the period you will actually meet and hold to it, and take legal advice on your specific obligations rather than relying on a template.",
    ],
  ],
};

export default seo;
