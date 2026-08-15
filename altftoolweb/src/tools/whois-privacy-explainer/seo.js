const seo = {
  title: "WHOIS Privacy Explainer: What a Lookup Still Shows",
  metaDescription:
    "Field-by-field: which registrant details a WHOIS or RDAP lookup publishes under ICANN's Registration Data Policy, and what a proxy service costs you.",
  steps: [
    "Pick who the domain is registered to, what it is for, which kind of top-level domain, and any Privacy service in use.",
    "Tick what you put on the registration — Registrant Organization filled in, your home address, your personal phone and email.",
    "The Personal exposure score out of 100 marks each field published, redacted, masked or anonymised, with what privacy costs you.",
  ],
  intro:
    "WHOIS Privacy Explainer works out, field by field, what a public registration lookup shows for a domain and scores how much personal data that exposes. It reflects how registration data actually works today: under ICANN's Registration Data Policy, generic TLD registrant fields are redacted by default for natural persons, State/Province and Country stay public, and the email is replaced by an anonymised address or a web form. It also spells out what a privacy or proxy service costs you in disputes, transfers and proof of ownership.",
  useCases: [
    "Check whether registering a personal domain will publish your home address before you pay for it.",
    "Understand why your name is redacted but a company name you typed into the organisation field is not.",
    "Decide between a privacy service, a proxy service and simply supplying a service address.",
    "Explain to a client why a country-code registry that bans privacy services needs a different approach entirely.",
  ],
  benefits: [
    ["Field-level, not vague", "Name, organisation, street, city, state, country, phone and email are each resolved to published, redacted, masked or anonymised."],
    ["Reflects current policy", "Built around ICANN's Registration Data Policy and the RDAP transition, not the pre-2018 open WHOIS everyone remembers."],
    ["Honest about the downsides", "Disputes, transfers, ownership proof and abuse reports all get harder behind a proxy, and that is stated rather than glossed over."],
  ],
  faqs: [
    [
      "Is my personal information public in WHOIS?",
      "For a generic TLD, mostly not. ICANN's Registration Data Policy requires registrars to redact personal registrant fields by default and to replace the email with an anonymised address or a web form. Registrant State/Province and Country remain public, and anything you typed into the Registrant Organization field is published because a company name is not personal data.",
    ],
    [
      "Do I still need to pay for WHOIS privacy?",
      "On a generic TLD, usually not — the default redaction already covers the personal fields. It is worth paying where the registry publishes registrant data by default, and it is worth nothing at all on registries that publish almost nothing or that prohibit privacy services outright. Check the specific registry's policy before buying an add-on.",
    ],
    [
      "What is the difference between domain privacy and a proxy service?",
      "With a privacy service you remain the registrant and only the contact details shown publicly are masked. With a proxy service the provider is the registrant of record, which is a real change in who holds the name on paper — if the provider suspends your account or fails, proving the domain is yours becomes a support matter rather than a fact on the record.",
    ],
    [
      "Can someone still find out who owns a domain behind a privacy service?",
      "Through a formal process, yes. A UDRP or URS complaint, a court order or a valid law-enforcement request routes through the provider to the underlying registrant. Privacy raises the cost of casual lookups and stops address harvesting; it is not anonymity, and it is not legal advice — consult a qualified adviser if a dispute is likely.",
    ],
  ],
};

export default seo;
