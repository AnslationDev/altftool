const seo = {
  title: "GST Composition Scheme Calculator: Levy & Limit",
  metaDescription:
    "Estimate composition levy from taxable turnover with trader (1%), restaurant (5%) and service (6%) presets, plus an annualized turnover-limit check.",
  steps: [
    "Pick a Business type preset — Trader / supplier of goods, Manufacturer, Restaurant service, Other eligible service or Custom — to pre-fill the rate and turnover limit.",
    "Enter Taxable turnover for period, Exempt / non-GST turnover, Composition rate (%), Turnover limit and Period months.",
    "Read the levy payable, monthly reserve, annualized turnover and limit headroom in the Composition result panel, then click 'Copy estimate' for an accountant-ready note.",
  ],
  intro:
    "Estimate the GST composition levy payable from turnover and business type. The calculator separates taxable turnover, exempt or non-GST turnover and the selected composition rate so small businesses can sanity-check quarterly cash flow.",
  useCases: [
    "Planning quarterly GST cash outflow under the composition scheme.",
    "Comparing trader, manufacturer and restaurant composition rates.",
    "Checking whether turnover is approaching the eligibility limit.",
  ],
  benefits: [
    ["Rate presets", "Use common presets for trader, manufacturer, restaurant or a custom notified rate."],
    ["Turnover warning", "Highlights when annualized turnover may cross your entered scheme limit."],
    ["Copyable note", "Creates a short explanation for accountant review."],
  ],
  faqs: [
    [
      "What turnover should I enter?",
      "Enter the taxable turnover on which composition levy applies. Keep exempt, non-GST and reverse-charge values separate for your accountant.",
    ],
    [
      "Can a service provider use this calculator?",
      "Use it only for broad planning. Composition eligibility and rates depend on current GST notifications and your activity mix.",
    ],
  ],
};

export default seo;
