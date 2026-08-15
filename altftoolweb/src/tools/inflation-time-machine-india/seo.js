const seo = {
  title: "India Inflation Calculator: CPI FY 2011-12",
  metaDescription:
    "Restates a rupee amount into another financial year on India's CPI (Combined) series from FY 2011-12, with cumulative and compound annual inflation.",
  steps: [
    "Enter the 'Amount (INR)' and choose the year it belongs to under 'In the money of financial year'.",
    "Choose the target year under 'Restate into financial year'; years beyond the published series are marked (projected) and use the 'Assumed inflation after FY 2024-25 (%)' rate.",
    "Read cumulative inflation, average annual inflation, purchasing power lost and the 'CPI index used' pair on FY 2011-12 = 100, then press 'Copy result'.",
  ],
  intro:
    "This tool restates a rupee amount in the money of a different financial year by chaining India's published annual average all-India CPI (Combined) inflation rates into a price index. It runs in both directions — forward to show what an old salary or price would need to be today, and backwards to express a current figure in older money — and reports cumulative inflation, the compound average annual rate and the share of purchasing power lost. Because a single consistent rural-plus-urban index only exists from FY 2011-12, the series starts there rather than splicing on the older and non-comparable CPI-IW.",
  useCases: [
    "Checking whether a salary that has risen from FY 2014-15 to today has actually kept pace with prices or only looks bigger.",
    "Restating an old project cost or property price into current rupees before comparing it with a new quotation.",
    "Setting a retirement or education target by projecting today's expense forward at an assumed rate anchored to the 4% policy target.",
  ],
  benefits: [
    ["Official series, not guesses", "Uses published annual average CPI (Combined) inflation rather than a single flat assumption."],
    ["Works both ways", "Inflates a past amount to today or deflates a present amount into any earlier year."],
    ["Honest about its limits", "Marks projected years separately and refuses to splice incompatible pre-2011 indices."],
  ],
  faqs: [
    [
      "How do I calculate what an old rupee amount is worth today?",
      "Multiply the amount by the ratio of the two years' price indices: value_today = amount x index_today / index_then. Using the CPI (Combined) series, Rs 10,000 of FY 2011-12 money is worth roughly Rs 20,700 in FY 2024-25 money, because the index roughly doubled over those thirteen years.",
    ],
    [
      "What has average inflation in India been over the last decade?",
      "Around 5% to 6% a year on the CPI (Combined) measure. The compound average from FY 2011-12 to FY 2024-25 works out near 5.8%, with the highest readings above 9% in FY 2012-13 and FY 2013-14 and the lowest around 3.4% in FY 2018-19.",
    ],
    [
      "What is India's official inflation target?",
      "4% consumer price inflation, with a tolerance band of 2 percentage points either side, so 2% to 6%. The target is notified by the Central Government under section 45ZA of the Reserve Bank of India Act and is what the Monetary Policy Committee is mandated to achieve.",
    ],
    [
      "Why does this tool not go back before 2011?",
      "Because the all-India CPI (Combined) series on base 2012 = 100 begins then, and it is the first index covering both rural and urban households. Older series such as CPI-IW measure a different basket for a different population, so chaining them onto CPI (Combined) would produce a number that looks precise but is not comparable.",
    ],
  ],
};

export default seo;
