const seo = {
  intro:
    "The Cookie Consent Banner Text Generator writes the first-layer banner copy and the settings-panel text behind it, switching between the opt-in model used under the ePrivacy Directive Art. 5(3), UK PECR reg. 6 and India's DPDP Act, 2023, and the opt-out model used under the CCPA as amended by the CPRA. It produces a headline, body, button labels, per-category descriptions and a withdrawal line, then flags the drafting mistakes regulators penalise most, such as a missing first-layer reject button or pre-ticked non-essential toggles. Aimed at product and marketing teams preparing copy for legal review.",
  useCases: [
    "Replace an accept-only banner with copy that puts Reject all on the same layer as Accept all, as the EDPB's deceptive-design guidelines require.",
    "Write the second-layer settings panel that explains what analytics, advertising and functional cookies each do, in language a visitor understands.",
    "Switch an existing EU banner to CPRA wording for a California audience, where the primary control is a Do Not Sell or Share opt-out rather than prior consent.",
  ],
  benefits: [
    ["Model-aware wording", "Opt-in and opt-out regimes get genuinely different copy, not the same paragraph with a swapped citation."],
    ["Dark-pattern checks", "Flags pre-ticked toggles, missing reject buttons and cookie lifetimes beyond the 13 months CNIL recommends."],
    ["Both layers covered", "Generates the banner and the settings-panel category descriptions together, so they stay consistent."],
  ],
  faqs: [
    [
      "Does a cookie banner need a Reject all button?",
      "Yes, wherever consent is the legal basis. Refusing must be as easy as accepting, so a Reject all control belongs on the same layer as Accept all — the EDPB's Guidelines 03/2022 on deceptive design treat an accept-only first layer as invalid, and French, Italian and Irish regulators have all fined sites for it. Only strictly necessary cookies may be set before a choice is made.",
    ],
    [
      "Are pre-ticked cookie checkboxes allowed?",
      "No. The Court of Justice of the EU held in C-673/17 (Planet49) that a pre-ticked box does not amount to valid consent, because consent requires a clear affirmative action. India's DPDP Act, 2023 s.6 sets the same standard. Every non-essential toggle must start switched off.",
    ],
    [
      "How long can a cookie consent last before you ask again?",
      "There is no fixed statutory maximum, but France's CNIL recommends that analytics cookies and the identifiers they generate expire after no more than 13 months, and that a refusal is respected for at least 6 months before the banner reappears. Re-prompting a user who said no every visit is treated as pressure rather than a free choice.",
    ],
    [
      "Do I need a cookie banner if I only use strictly necessary cookies?",
      "No. Cookies strictly necessary to deliver a service the user explicitly requested are exempt from the consent requirement in ePrivacy Directive Art. 5(3) and PECR reg. 6(4), so a plain cookie notice in your privacy policy is enough. You still need the notice; you do not need the consent gate. This tool is a drafting aid and not legal advice — have counsel confirm which of your cookies genuinely qualify.",
    ],
  ],
};

export default seo;
