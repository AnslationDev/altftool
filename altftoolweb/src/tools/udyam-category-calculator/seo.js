const seo = {
  title: "Udyam MSME Calculator: Micro, Small, Medium",
  metaDescription:
    "Apply the composite MSME test on the 1 April 2025 limits or the 2020 set: investment and turnover together, export turnover excluded, plus your headroom.",
  steps: [
    "Enter Investment in plant, machinery and equipment (INR) at written-down value, then Total turnover for the year (INR) and Of which export turnover (INR).",
    "Choose Which notified limits apply — Current limits (from 1 April 2025) or Earlier limits (1 July 2020 to 31 March 2025).",
    "Read Your MSME category with the Deciding test that settled it, the percentage of each limit used, and the Investment and Turnover headroom before moving up, then press Copy result.",
  ],
  intro:
    "This calculator tells you whether a business is a micro, small or medium enterprise by applying the composite classification test under the Micro, Small and Medium Enterprises Development Act, 2006 — an enterprise must be within both the investment-in-plant-and-machinery limit and the turnover limit of a category, and breaching either one moves it up. It uses the enhanced limits applicable from 1 April 2025 by default and keeps the 1 July 2020 limits available for earlier years, and it excludes export turnover exactly as the classification rules require. Useful before filing a Udyam registration, claiming an MSME benefit, or answering the enterprise-category question in a tender.",
  useCases: [
    "Checking which category to declare before filing a fresh Udyam registration for a manufacturing unit",
    "Working out whether a services firm whose turnover just crossed 10 crore has moved from micro to small",
    "Seeing how much investment or turnover headroom is left before the enterprise is reclassified upward",
    "Confirming that export revenue can be left out of turnover when answering an MSME category question in a tender",
  ],
  benefits: [
    [
      "Composite test, not one number",
      "Investment and turnover are checked together and the tool names which of the two actually decided your category.",
    ],
    [
      "Both notified limit sets",
      "Compare against the limits applicable from 1 April 2025 or the 1 July 2020 limits that applied until 31 March 2025.",
    ],
    [
      "Export turnover handled correctly",
      "Exports of goods and services are deducted before the turnover test, which is the rule most people miss.",
    ],
  ],
  faqs: [
    [
      "What are the MSME classification limits in India?",
      "From 1 April 2025 a micro enterprise has investment up to 2.5 crore and turnover up to 10 crore, a small enterprise up to 25 crore and 100 crore, and a medium enterprise up to 125 crore and 500 crore. Until 31 March 2025 the limits were 1 crore/5 crore for micro, 10 crore/50 crore for small and 50 crore/250 crore for medium.",
    ],
    [
      "What happens if my investment is within the micro limit but my turnover is not?",
      "You are classified in the higher category. The test is composite, so both conditions must be satisfied for a category; failing either one pushes the enterprise up. A firm with 50 lakh of machinery but 30 crore of turnover is a small enterprise, not micro.",
    ],
    [
      "Is export turnover counted for MSME classification?",
      "No. Turnover from exports of goods or services is excluded when computing the turnover figure for classification, which lets export-heavy firms retain micro or small status on a much larger total revenue base.",
    ],
    [
      "When does a change in category take effect?",
      "An upward reclassification takes effect from 1 April of the financial year following the year in which the limit was crossed, so benefits are not lost mid-year. If an enterprise falls below the limits, its existing status and benefits continue until the end of the current financial year. The Udyam portal derives investment and turnover automatically from PAN-linked income-tax and GST data.",
    ],
  ],
};

export default seo;
