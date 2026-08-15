const seo = {
  title: "Central Govt HRA Calculator: 30/20/10% by City Class",
  metaDescription:
    "7th Pay Commission HRA on your Level pay at 30%, 20% or 10% by X, Y or Z city, with the ₹5,400/₹3,600/₹1,800 floors and the 10(13A) exemption.",
  steps: [
    "Enter Basic pay in the pay matrix (per month), Current dearness allowance (%), the Rent you actually pay and the number of months.",
    "Choose your City classification for HRA — X, Y or Z — and tick the box if you rent in Delhi, Mumbai, Kolkata or Chennai, the only four cities that get the 50% cap.",
    "Read the Monthly HRA entitlement with the floor applied, then the exempt and taxable split under Exemption under section 10(13A) below it.",
  ],
  intro:
    "This calculator works out House Rent Allowance for a central government employee under the 7th Central Pay Commission: a percentage of the pay drawn in your Level in the pay matrix, set by the city class you are posted in and by how far dearness allowance has risen. Since DA crossed 50% with effect from 1 January 2024, the rates are 30%, 20% and 10% for X, Y and Z class cities, subject to monthly floors of ₹5,400, ₹3,600 and ₹1,800. It then applies Rule 2A of the Income-tax Rules to show how much of that HRA escapes tax under section 10(13A) and how much does not.",
  useCases: [
    "A Level 10 officer on ₹56,100 posted in Bengaluru checking that 30% HRA applies but only the 40% salary cap is available for the tax exemption, because Bengaluru is X class yet not one of the four Rule 2A metros.",
    "An employee at the ₹18,000 minimum of the matrix in a Z class town confirming the ₹1,800 floor applies where 8% of pay would have been only ₹1,440.",
    "Working out the rent at which the entire HRA would become exempt, before signing a new lease and submitting proofs to the drawing and disbursing officer.",
  ],
  benefits: [
    ["Rate follows your DA", "Picks the 24/16/8, 27/18/9 or 30/20/10 slab from the dearness allowance you enter."],
    ["Floors applied automatically", "Uses the ₹5,400, ₹3,600 and ₹1,800 minimums whenever the percentage falls short."],
    ["Separates two different city rules", "X/Y/Z decides your allowance; only Delhi, Mumbai, Kolkata and Chennai get the 50% tax cap."],
  ],
  faqs: [
    [
      "What is the current HRA rate for central government employees?",
      "30% of basic pay in X class cities, 20% in Y class and 10% in Z class. These raised rates took effect once dearness allowance crossed 50%, which happened with effect from 1 January 2024. Before that the rates were 27%, 18% and 9%, and originally 24%, 16% and 8% under the 7 July 2017 order.",
    ],
    [
      "What is the minimum HRA a government employee can get?",
      "₹5,400 a month in an X class city, ₹3,600 in Y class and ₹1,800 in Z class. These floors come from the Department of Expenditure order of 7 July 2017 and equal 30%, 20% and 10% of the minimum pay of ₹18,000, so they mainly protect employees at the bottom of the pay matrix.",
    ],
    [
      "Which cities are X, Y and Z class for HRA?",
      "X class covers urban agglomerations with a population of 50 lakh and above, Y class covers 5 lakh to 50 lakh, and Z class is everything below. The binding list is the one notified by the Department of Expenditure using 2011 Census figures, so check your station against that list rather than assuming from population alone.",
    ],
    [
      "How much HRA is tax free for a government employee?",
      "The least of three amounts under Rule 2A: the HRA actually received, the rent you paid minus 10% of salary, and 50% of salary if you rent in Delhi, Mumbai, Kolkata or Chennai or 40% anywhere else. Salary here means basic pay plus dearness allowance. The exemption exists only under the old tax regime — the default regime under section 115BAC does not allow it.",
    ],
  ],
};

export default seo;
