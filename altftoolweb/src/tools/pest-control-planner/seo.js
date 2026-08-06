const seo = {
  intro:
    "The Pest Control Planner creates an editable budget scenario from a dated demo catalogue of treatment approaches, repeat intervals, callback periods and Indian-rupee rate assumptions. It separates treatment-cycle starts from estimated technician visits and can model GST. The August 2026 demo defaults are not live market data, a provider quote, a recommended schedule or a promised warranty; replace them with written local terms before booking.",
  useCases: [
    "Comparing editable one-pest and multi-pest budget scenarios for the same floor area",
    "Seeing how an assumed multi-round treatment changes visit count without double-counting its cycle cost",
    "Taking a dated demo estimate to local providers and replacing assumptions with written quotes and callback terms",
  ],
  benefits: [
    ["Editable scenarios", "Change area, selected pests, severity, property type and chemistry preference to compare planning cases."],
    ["Assumptions stay visible", "The dated demo baseline is labelled clearly so an estimate is not mistaken for a live quote or warranty."],
    ["Cycles and visits separated", "The month table shows cycle starts while multi-round work is counted as multiple estimated technician visits."],
  ],
  faqs: [
    [
      "Does this tool prescribe how often pest control should be done?",
      "No. Its intervals, round counts and callback periods are illustrative demo assumptions for comparing scenarios. Infestation, product label, property conditions and local rules can change the appropriate plan. Ask qualified providers for a written inspection-based schedule.",
    ],
    [
      "Are the displayed prices current provider quotes?",
      "No. They are an August 2026 demo baseline, not live market data. Use them only to compare scenarios, then replace the displayed assumptions with itemised local quotes that state taxes, number of visits, products, exclusions and callback terms.",
    ],
    [
      "Why does the calendar show a cycle instead of every visit date?",
      "The planner works in whole months. It charges an assumed multi-round treatment in the month its cycle starts and separately counts the estimated technician visits. Exact follow-up dates can cross a month boundary, so confirm and record them from the provider's written schedule.",
    ],
    [
      "Is pest control safe with children and pets at home?",
      "Safety cannot be determined by this calculator or by an 'odourless' or 'herbal' label. Use qualified local providers, ask for the exact product label and safety data sheet, and follow its re-entry instructions. Seek appropriate medical advice for pregnancy, asthma, infants or other health concerns.",
    ],
  ],
};

export default seo;
