const seo = {
  title: "Bank Locker Cost Estimator - Rent, GST, RBI Liability Cap",
  metaDescription:
    "Price a bank locker over the years you will hold it: rent plus 18% GST, the 3-year term deposit blocked, and the gap above RBI's 100x-rent liability cap.",
  steps: [
    "Pick a Locker size (Small, Medium, Large, Extra large) and Branch centre (Metro, Urban, Semi-urban, Rural) to pre-fill an indicative figure, then replace Annual locker rent before GST (INR) with the number from your bank's schedule of charges.",
    "Set How many years will you keep it?, Value of what you will keep inside (INR), Fixed deposit rate on the security deposit (% per year) and Contents insurance premium rate (% of value per year), and tick \"My bank asks for a security term deposit (3 years' rent)\" if yours does.",
    "Total cost over the period appears with rows for annual rent plus 18% GST, Term deposit blocked as security, Interest that deposit earns over the period, Bank's maximum liability (100x annual rent), Uninsured gap the bank will not cover and Net cost after deposit interest, next to lists of what the bank is and is not liable for; Copy result copies the estimate.",
  ],
  intro:
    "This estimator prices a bank safe deposit locker over the years you plan to hold it: rent plus 18% GST, the term deposit a bank may block as security, and the protection gap left by the RBI rule that caps a bank's liability at 100 times the prevailing annual rent. It applies the revised locker guidelines issued by the Reserve Bank of India on 18 August 2021, in force from 1 January 2022, which also list exactly which losses the bank must answer for and which it need not. Enter your rent and the value of what you intend to store, and the gap that a separate contents policy would need to cover is calculated for you.",
  useCases: [
    "A family storing ₹15,00,000 of jewellery in a ₹4,000-a-year locker discovering the bank's liability tops out at ₹4,00,000 and pricing a separate jewellery policy for the difference.",
    "Comparing a large locker in a metro branch against a medium one in a semi-urban branch across a five-year holding period, GST included.",
    "Checking whether a bank is entitled to insist on a three-year term deposit before allotting a locker, and what that deposit earns while it sits blocked.",
  ],
  benefits: [
    ["Shows the real ceiling", "Converts the 100-times-rent liability rule into a rupee figure against your own contents."],
    ["GST and security deposit included", "Counts the 18% tax and the blocked term deposit that rent tables leave out."],
    ["Sorts covered from uncovered events", "Lists which losses the RBI puts on the bank and which fall entirely on you."],
  ],
  faqs: [
    [
      "How much will a bank pay if my locker is robbed?",
      "Up to 100 times the prevailing annual rent of the locker, and no more. On a locker renting at ₹4,000 a year that ceiling is ₹4,00,000, whatever the value of what was inside. The cap applies to loss from fire, theft, burglary, robbery, dacoity, building collapse or fraud by bank employees.",
    ],
    [
      "Does the bank insure the contents of my locker?",
      "No. The RBI's 2021 locker guidelines expressly bar banks from offering insurance of locker contents, because the bank never knows what is stored there. Cover has to be bought separately, usually as a jewellery or valuables section of a householders package policy, and the insurer will want a valuation.",
    ],
    [
      "Can a bank force me to open a fixed deposit to get a locker?",
      "A bank may take a term deposit at the time of allotment covering three years' rent plus the cost of breaking open the locker, but it may not insist on one from an existing locker holder or from a customer who already runs a satisfactory operative account. Linking a locker to an insurance policy or investment product is not permitted.",
    ],
    [
      "Is GST charged on bank locker rent?",
      "Yes, locker rent is a taxable service and attracts GST at 18%, so a ₹4,000 rent is billed as ₹4,720. Rent is collected in advance, and if you surrender the locker mid-term the bank must refund the unused portion proportionately.",
    ],
  ],
};

export default seo;
