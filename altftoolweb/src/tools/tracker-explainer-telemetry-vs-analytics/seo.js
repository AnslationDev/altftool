const seo = {
  intro:
    "Telemetry vs Analytics Explainer sorts 20 real product-measurement signals — crash stacks, cold-start timings, page paths, session replay, persistent visitor ids — into telemetry (measures the build) and analytics (measures the person), then runs a consent test against the ePrivacy Directive's Article 5(3) device-storage rule and the GDPR's personal-data rule. Tick what your product actually collects, set a retention period, and it scores the plan against five concrete checks, flags anything that needs consent, and drafts a plain-language measurement notice you can paste into a privacy page and edit.",
  useCases: [
    "Deciding whether a new crash-reporting or product-analytics SDK needs a consent banner before it ships.",
    "Working out which fields in an existing event schema are telemetry, which are analytics, and which quietly became both once a device id got attached.",
    "Drafting the 'what we measure' section of a privacy notice from the actual signal list instead of copying a template.",
    "Checking a retention setting against the CNIL audience-measurement exemption's published checkpoints before a compliance review.",
  ],
  benefits: [
    [
      "Classifies by what it measures, not by vendor label",
      "The telemetry/analytics line runs on subject and identifier, not on what a dashboard calls itself — a session-replay tool and a crash reporter get scored on the same rules.",
    ],
    [
      "Names the specific consent trigger",
      "Each flagged signal says whether it writes to the device, identifies a person, or is a common route for accidental PII, so the consent requirement is traceable to a reason.",
    ],
    [
      "Produces an editable notice, not just a verdict",
      "The generated notice lists exactly what is collected, where it goes, how long it is kept and how to turn it off — a draft, not a template with blanks.",
    ],
  ],
  faqs: [
    [
      "What is the actual difference between telemetry and analytics?",
      "Telemetry measures the software: crash rate, cold start time, request latency. It answers whether a release is healthy. Analytics measures the person: sessions, funnels, cohorts. It answers what people did. The same field can be either depending on how it is keyed — a feature-flag exposure aggregated by build is telemetry, the same exposure keyed to a visitor id is analytics.",
    ],
    [
      "Does telemetry need consent if it doesn't identify anyone?",
      "It can. The ePrivacy Directive's Article 5(3) covers storing or reading information on a user's device, not identifying a person — a rotating install id or a feature-flag bucketing value written to storage triggers it unless the storage is strictly necessary for the service the user asked for. Purely aggregated, in-memory counters that never touch the device are the safe case.",
    ],
    [
      "Is an IP address personal data if I only use it for analytics?",
      "The Court of Justice of the EU held in Breyer (C-582/14, 19 October 2016) that a dynamic IP address can be personal data in the hands of a website operator, so storing raw IPs for analytics does not sit outside the GDPR. Truncating the last octet before storage is the common way to keep country-level geography while dropping the identifying part.",
    ],
    [
      "How long can I keep analytics data without extra justification?",
      "There is no single EU-wide number, but France's CNIL publishes an exemption for narrowly configured, first-party audience measurement with outer limits of 13 months for the identifier and 25 months for data derived from it. Other national authorities set different limits, and the exemption stops applying the moment identifiers are shared with a third-party advertising network.",
    ],
  ],
};

export default seo;
