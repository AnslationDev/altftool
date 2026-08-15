const seo = {
  title: "Pest Control Cost Planner with 12-Month Budget Scenarios",
  metaDescription:
    "Pick pests, floor area and severity to build an editable 12-month pest-control budget with GST — demo rates to compare against real quotes.",
  steps: [
    "Tick the Pests to treat checkboxes and enter your Carpet area (sq ft), Property type and Infestation level.",
    "Choose the month under Plan starts in, and tick the GST option (18%, SAC 998531) if the provider is GST-registered.",
    "Read the Illustrative 12-month budget, the per-pest treatment rows and the treatment-cycle calendar, then use Copy plan to save the scenario.",
  ],
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
      "No. Its intervals, round counts and callback periods are illustrative demo assumptions for comparing scenarios, and they are not interchangeable with each other: in the demo catalogue the assumed callback period equals the full repeat interval only for cockroaches, mosquitoes, termites and wood borer, while for ants, bed bugs, rodents, lizards and houseflies it is shorter than the interval, leaving an assumed gap with no cover before the next cycle. Infestation, product label, property conditions and local rules can change the appropriate plan. Ask qualified providers for a written inspection-based schedule and written callback terms.",
    ],
    [
      "Are the displayed prices current provider quotes?",
      "No. They are an August 2026 demo baseline, not live market data. They also do not scale the way a round count suggests — a multi-round assumption carries a higher per-sq-ft rate as well as the extra round, so in the demo catalogue one bed-bug cycle works out at roughly five to six times a cockroach cycle for the same floor area once the assumed minimum call-out no longer binds, not twice it. Use the figures only to compare scenarios, then replace the displayed assumptions with itemised local quotes that state taxes, number of visits, products, exclusions and callback terms.",
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
