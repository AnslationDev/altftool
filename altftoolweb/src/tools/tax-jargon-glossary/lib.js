/**
 * A plain-language glossary of Indian tax, GST, investing and banking terms.
 *
 * Every entry names the statute or rule it comes from, so a reader can verify it:
 *  - "Income-tax Act" references are to the Income-tax Act, 1961.
 *  - "CGST Act" references are to the Central Goods and Services Tax Act, 2017.
 *  - Rates and thresholds that change with each Finance Act are stated only where they are
 *    stable and well established; where a figure moves often the rule is described instead.
 */

/** Buckets used for filtering. */
export const CATEGORIES = ["Income tax", "GST", "Investing", "Banking & credit", "Compliance"];

/**
 * The glossary. `aka` holds abbreviations and alternate spellings so search finds the entry
 * whichever way a person types it.
 */
export const GLOSSARY = [
  {
    term: "Assessment Year",
    aka: ["AY"],
    category: "Income tax",
    source: "Section 2(9), Income-tax Act",
    definition:
      "The year in which the income of the previous year is taxed. It always runs one year behind: income earned in FY 2025-26 is assessed in AY 2026-27.",
    example: "Your return for the year ending 31 March 2026 is filed for AY 2026-27.",
  },
  {
    term: "Previous Year",
    aka: ["financial year", "FY"],
    category: "Income tax",
    source: "Section 3, Income-tax Act",
    definition:
      "The year in which the income is actually earned — 1 April to 31 March. Tax law calls it the previous year; everyone else calls it the financial year.",
    example: "Salary received in December 2025 belongs to the previous year 2025-26.",
  },
  {
    term: "Gross Total Income",
    aka: ["GTI"],
    category: "Income tax",
    source: "Section 80B(5), Income-tax Act",
    definition:
      "The total of income under all five heads — salary, house property, business or profession, capital gains and other sources — before any Chapter VI-A deduction.",
    example: "Salary plus rent plus bank interest, added up, is your gross total income.",
  },
  {
    term: "Total Income",
    aka: ["taxable income", "net income"],
    category: "Income tax",
    source: "Section 2(45), Income-tax Act",
    definition:
      "Gross total income minus Chapter VI-A deductions. This is the figure the slab rates are applied to.",
    example: "GTI of Rs 9,00,000 less an 80C claim of Rs 1,50,000 gives a total income of Rs 7,50,000.",
  },
  {
    term: "Deduction",
    aka: ["Chapter VI-A", "80C"],
    category: "Income tax",
    source: "Chapter VI-A, Income-tax Act",
    definition:
      "An amount subtracted from income before the slab rates are applied, so it saves tax at your marginal rate. Section 80C alone is capped at Rs 1,50,000 a year and is available only under the old regime.",
    example: "For someone in the 30% bracket, a Rs 1,50,000 deduction saves Rs 45,000 of tax.",
  },
  {
    term: "Rebate",
    aka: ["87A"],
    category: "Income tax",
    source: "Section 87A, Income-tax Act",
    definition:
      "A subtraction from the tax already computed, not from income, available to a resident individual whose total income stays within a specified ceiling. It saves tax rupee for rupee.",
    example: "A rebate wipes out the tax entirely for small incomes, leaving nothing to pay.",
  },
  {
    term: "Surcharge",
    category: "Income tax",
    source: "Annual Finance Act",
    definition:
      "An extra levy charged as a percentage of the income tax itself, applying only above specified income thresholds. It is calculated on tax, not on income.",
    example: "A 10% surcharge on Rs 3,00,000 of tax adds Rs 30,000 before cess.",
  },
  {
    term: "Health and Education Cess",
    aka: ["cess"],
    category: "Income tax",
    source: "Annual Finance Act",
    definition:
      "A 4% levy charged on income tax plus surcharge. It is the last step of the calculation and cannot be reduced by any deduction.",
    example: "Tax of Rs 1,00,000 attracts Rs 4,000 of cess, so Rs 1,04,000 is payable.",
  },
  {
    term: "Marginal Relief",
    category: "Income tax",
    source: "Provisos to the Finance Act rate schedule",
    definition:
      "A cap that stops the extra tax from exceeding the extra income when you just cross a surcharge or rebate threshold, so earning one rupee more never leaves you worse off.",
    example: "Without it, crossing a surcharge threshold by Rs 1,000 could add far more than Rs 1,000 of tax.",
  },
  {
    term: "TDS",
    aka: ["tax deducted at source", "withholding tax"],
    category: "Income tax",
    source: "Chapter XVII-B, Income-tax Act",
    definition:
      "Tax the payer deducts before paying you and deposits with the government against your PAN. It is an advance payment of your tax, not a separate tax.",
    example: "A bank deducts 10% on deposit interest under section 194A, or 20% if no PAN is on record.",
  },
  {
    term: "TCS",
    aka: ["tax collected at source"],
    category: "Income tax",
    source: "Section 206C, Income-tax Act",
    definition:
      "Tax the seller collects from the buyer on specified transactions and deposits against the buyer's PAN. Like TDS, it is credited back when you file.",
    example: "Remittances abroad under the Liberalised Remittance Scheme attract TCS above a specified limit.",
  },
  {
    term: "Form 16",
    category: "Income tax",
    source: "Section 203, Income-tax Act read with Rule 31",
    definition:
      "The certificate an employer issues showing salary paid and tax deducted. Part A carries the TDS deposited, Part B the salary breakup and deductions used to compute it.",
    example: "Form 16 helps you file a return; it is not the return itself.",
  },
  {
    term: "Form 16A",
    category: "Income tax",
    source: "Section 203, Income-tax Act read with Rule 31",
    definition:
      "The TDS certificate for non-salary payments such as interest, rent, professional fees or commission.",
    example: "A bank issues Form 16A each quarter for TDS on your deposit interest.",
  },
  {
    term: "Form 26AS",
    aka: ["tax credit statement"],
    category: "Income tax",
    source: "Section 203AA and Rule 114-I, Income-tax Act",
    definition:
      "Your consolidated tax credit statement: TDS and TCS deposited against your PAN, advance tax and self-assessment tax paid, and refunds issued.",
    example: "If a deductor never deposits the tax, it will not appear here and you cannot claim credit for it.",
  },
  {
    term: "Annual Information Statement",
    aka: ["AIS", "TIS"],
    category: "Income tax",
    source: "Section 285BB, Income-tax Act",
    definition:
      "A wider statement than Form 26AS, listing financial transactions reported to the department — interest, dividends, securities trades, property deals and foreign remittances — with a facility to give feedback on wrong entries.",
    example: "Mismatches between AIS and your return are a common trigger for a notice.",
  },
  {
    term: "Advance Tax",
    category: "Income tax",
    source: "Sections 207 to 211, Income-tax Act",
    definition:
      "Tax paid during the year rather than after it, due when your net tax liability for the year is Rs 10,000 or more. It falls in four instalments, cumulatively 15%, 45%, 75% and 100% by 15 June, 15 September, 15 December and 15 March.",
    example: "Missing an instalment attracts interest under sections 234B and 234C.",
  },
  {
    term: "Self-Assessment Tax",
    category: "Income tax",
    source: "Section 140A, Income-tax Act",
    definition:
      "The balance tax you pay yourself before filing the return, after adjusting TDS, TCS and advance tax already paid.",
    example: "A return cannot be validly filed while self-assessment tax remains unpaid.",
  },
  {
    term: "Capital Gain",
    category: "Income tax",
    source: "Section 45, Income-tax Act",
    definition:
      "Profit arising on the transfer of a capital asset, taxed in the year of transfer. It is short-term or long-term depending on how long the asset was held.",
    example: "Selling shares, mutual fund units, land or gold can all give rise to a capital gain.",
  },
  {
    term: "Long-Term Capital Gain",
    aka: ["LTCG"],
    category: "Income tax",
    source: "Sections 2(29A), 112 and 112A, Income-tax Act",
    definition:
      "Gain on an asset held beyond the statutory holding period — 12 months for listed securities and units, 24 months for most other assets. Listed equity and equity fund gains are taxed under section 112A at 12.5% above an annual exemption of Rs 1,25,000.",
    example: "Selling listed shares after 18 months produces a long-term gain.",
  },
  {
    term: "Short-Term Capital Gain",
    aka: ["STCG"],
    category: "Income tax",
    source: "Sections 2(42A) and 111A, Income-tax Act",
    definition:
      "Gain on an asset sold within the statutory holding period. On listed equity and equity funds that have suffered securities transaction tax, section 111A charges 20%; other short-term gains are taxed at your slab rate.",
    example: "Selling listed shares after five months produces a short-term gain.",
  },
  {
    term: "Indexation",
    aka: ["cost inflation index", "CII"],
    category: "Income tax",
    source: "Second proviso to section 48, Income-tax Act",
    definition:
      "Adjusting the cost of an asset for inflation using the notified Cost Inflation Index, so only the real gain is taxed. The Finance (No. 2) Act 2024 withdrew indexation for most long-term gains, retaining a limited option for resident individuals and HUFs on immovable property acquired before 23 July 2024.",
    example: "Indexation lowers the taxable gain when an asset was held through a high-inflation period.",
  },
  {
    term: "Set-off and Carry Forward",
    category: "Income tax",
    source: "Sections 70 to 74, Income-tax Act",
    definition:
      "Adjusting a loss against income of the same or another head in the same year, and carrying the unabsorbed part to later years. Business losses generally carry forward 8 years; capital losses can only be set against capital gains.",
    example: "A short-term capital loss can be set against a long-term capital gain, but not the other way round.",
  },
  {
    term: "Presumptive Taxation",
    aka: ["44AD", "44ADA"],
    category: "Income tax",
    source: "Sections 44AD, 44ADA and 44AE, Income-tax Act",
    definition:
      "A scheme that deems profit as a fixed percentage of turnover so small taxpayers need not maintain detailed books — 8% of turnover under section 44AD, or 6% on digital receipts, and 50% of gross receipts for eligible professionals under section 44ADA.",
    example: "Declaring less than the deemed profit pulls you back into books of account and a tax audit.",
  },
  {
    term: "Tax Audit",
    aka: ["44AB"],
    category: "Income tax",
    source: "Section 44AB, Income-tax Act",
    definition:
      "A chartered accountant's audit of business or professional accounts, required once turnover or gross receipts cross the prescribed limits, or when a presumptive taxpayer declares lower profits.",
    example: "The audit report is filed in Form 3CA or 3CB with the statement in Form 3CD.",
  },
  {
    term: "PAN",
    aka: ["permanent account number"],
    category: "Income tax",
    source: "Section 139A, Income-tax Act",
    definition:
      "A ten-character alphanumeric identifier issued by the Income Tax Department. The fourth character shows the holder's status — P for an individual, C for a company, H for a HUF, F for a firm.",
    example: "Quoting PAN is compulsory for specified transactions listed in Rule 114B.",
  },
  {
    term: "TAN",
    category: "Income tax",
    source: "Section 203A, Income-tax Act",
    definition:
      "The ten-character account number a deductor must obtain and quote on every TDS return, challan and certificate. It is separate from PAN.",
    example: "An employer needs a TAN before it can deposit salary TDS.",
  },
  {
    term: "Belated Return",
    category: "Income tax",
    source: "Section 139(4), Income-tax Act",
    definition:
      "A return filed after the due date but within the deadline the section allows. It attracts a late fee under section 234F and forfeits the right to carry forward most losses.",
    example: "Filing late still beats not filing, because it stops interest and penalty from growing.",
  },
  {
    term: "Revised Return",
    category: "Income tax",
    source: "Section 139(5), Income-tax Act",
    definition:
      "A corrected return filed to fix an omission or wrong statement in an earlier return, within the time the section allows. It fully replaces the original.",
    example: "Forgetting to report savings interest is a typical reason to revise.",
  },
  {
    term: "Updated Return",
    aka: ["ITR-U"],
    category: "Income tax",
    source: "Section 139(8A), Income-tax Act",
    definition:
      "A return filed after the revision window closes, allowed only to declare additional income and always with additional tax on top. It cannot be used to claim a refund or increase a loss.",
    example: "It is a way to regularise missed income, not a way to reduce tax.",
  },
  {
    term: "Clubbing of Income",
    category: "Income tax",
    source: "Sections 60 to 64, Income-tax Act",
    definition:
      "Rules that tax income in the hands of the person who really controls the asset rather than the nominal owner — most commonly a spouse or a minor child. Section 10(32) allows only Rs 1,500 per minor child to be excluded.",
    example: "Interest on a deposit gifted to a spouse remains taxable in the giver's hands.",
  },
  {
    term: "Residential Status",
    aka: ["resident", "non-resident", "NRI", "RNOR"],
    category: "Income tax",
    source: "Section 6, Income-tax Act",
    definition:
      "The test that decides how much of your worldwide income India can tax. The basic test is 182 days in India during the year, or 60 days in the year together with 365 days across the four preceding years.",
    example: "A resident is taxed on global income; a non-resident only on income that arises in India.",
  },
  {
    term: "DTAA",
    aka: ["double taxation avoidance agreement", "tax treaty"],
    category: "Income tax",
    source: "Sections 90 and 91, Income-tax Act",
    definition:
      "A treaty between India and another country that stops the same income being taxed twice, either by exempting it in one country or by giving credit for the tax paid in the other.",
    example: "A tax residency certificate is usually required before treaty benefits can be claimed.",
  },
  {
    term: "Form 15G and 15H",
    category: "Income tax",
    source: "Section 197A, Income-tax Act",
    definition:
      "Self-declarations that no tax is payable on your total income, filed with a bank so it does not deduct TDS on interest. Form 15H is for those aged 60 and above; Form 15G for everyone else eligible.",
    example: "Filing one when tax is actually payable is a false declaration and carries penal consequences.",
  },
  {
    term: "GSTIN",
    category: "GST",
    source: "Section 25, CGST Act",
    definition:
      "The 15-character GST registration number. The first two digits are the state code, the next ten the PAN, the thirteenth the entity number in that state, and the last a check digit.",
    example: "27AAAAA0000A1Z5 is registered in Maharashtra, whose state code is 27.",
  },
  {
    term: "CGST, SGST and IGST",
    category: "GST",
    source: "CGST Act and IGST Act, 2017",
    definition:
      "The three components of GST. A supply within a state is split equally into central GST and state GST; a supply across states carries integrated GST at the combined rate instead.",
    example: "An 18% intra-state supply is 9% CGST plus 9% SGST; inter-state it is 18% IGST.",
  },
  {
    term: "Input Tax Credit",
    aka: ["ITC"],
    category: "GST",
    source: "Sections 16 and 17, CGST Act",
    definition:
      "Credit for the GST you paid on business purchases, set against the GST you collect on sales. It requires a valid tax invoice, actual receipt of the goods or services, and the supplier having filed and paid.",
    example: "Section 17(5) blocks credit on items such as personal motor cars and staff club memberships.",
  },
  {
    term: "Reverse Charge",
    aka: ["RCM"],
    category: "GST",
    source: "Sections 9(3) and 9(4), CGST Act",
    definition:
      "A mechanism where the recipient, not the supplier, pays the GST to the government on notified supplies. The recipient can usually claim it back as input tax credit.",
    example: "Goods transport agency services and legal services from an advocate commonly fall under reverse charge.",
  },
  {
    term: "Composition Scheme",
    category: "GST",
    source: "Section 10, CGST Act",
    definition:
      "A simplified GST option for small taxpayers below a prescribed turnover, paying a flat percentage of turnover with quarterly payment and an annual return. Input tax credit cannot be claimed and no tax can be collected from customers.",
    example: "A composition dealer issues a bill of supply, not a tax invoice.",
  },
  {
    term: "E-way Bill",
    category: "GST",
    source: "Rule 138, CGST Rules",
    definition:
      "An electronic document required before moving a consignment of goods worth more than Rs 50,000. It carries a unique number that must accompany the vehicle.",
    example: "Validity depends on the distance to be covered, with one day for every 200 km of ordinary cargo.",
  },
  {
    term: "HSN and SAC",
    category: "GST",
    source: "Notifications under section 168, CGST Act",
    definition:
      "Classification codes that fix the rate — the Harmonised System of Nomenclature for goods and the Services Accounting Code for services. How many digits you must quote depends on turnover.",
    example: "A wrong HSN can mean charging the wrong rate, which becomes a demand later.",
  },
  {
    term: "Tax Invoice and Bill of Supply",
    category: "GST",
    source: "Sections 31 and 31(3)(c), CGST Act",
    definition:
      "A tax invoice shows GST separately and lets the buyer claim input tax credit. A bill of supply is issued when no GST can be charged — by a composition dealer or for exempt supplies — and carries no credit.",
    example: "Issuing a tax invoice when you are on the composition scheme is not permitted.",
  },
  {
    term: "Place of Supply",
    category: "GST",
    source: "Sections 10 to 13, IGST Act",
    definition:
      "The rule that decides whether a transaction is intra-state or inter-state, and therefore whether CGST and SGST or IGST applies. It usually follows delivery for goods and the recipient's location for services.",
    example: "Getting it wrong means paying the right amount under the wrong head and having to correct it.",
  },
  {
    term: "CAGR",
    aka: ["compound annual growth rate"],
    category: "Investing",
    source: "Standard finance formula",
    definition:
      "The single annual rate that would take a starting value to an ending value over a period: (end/start)^(1/years) - 1. It works only for one lump sum with no additions or withdrawals.",
    example: "Rs 1,00,000 growing to Rs 2,00,000 over 10 years is a CAGR of 7.18%.",
  },
  {
    term: "XIRR",
    category: "Investing",
    source: "Standard finance formula",
    definition:
      "The annualised return on a series of cash flows on irregular dates — the correct measure for an SIP, where CAGR would be meaningless because money went in at many different times.",
    example: "Every instalment date matters, which is why XIRR needs the dates and not just the amounts.",
  },
  {
    term: "NAV",
    aka: ["net asset value"],
    category: "Investing",
    source: "SEBI (Mutual Funds) Regulations, 1996",
    definition:
      "The per-unit value of a mutual fund scheme: total assets minus liabilities, divided by units outstanding. It is declared once each business day.",
    example: "A low NAV does not make a fund cheap — the NAV level says nothing about future returns.",
  },
  {
    term: "Total Expense Ratio",
    aka: ["TER", "expense ratio"],
    category: "Investing",
    source: "Regulation 52, SEBI (Mutual Funds) Regulations",
    definition:
      "The annual cost of running a scheme, expressed as a percentage of assets and already deducted from the NAV. A direct plan carries a lower ratio than a regular plan because it pays no distributor commission.",
    example: "A 1% difference in expense ratio compounds into a large gap over twenty years.",
  },
  {
    term: "Exit Load",
    category: "Investing",
    source: "SEBI (Mutual Funds) Regulations, 1996",
    definition:
      "A charge deducted when you redeem units within a specified period of buying them, meant to discourage short holding. It is a percentage of the redemption value.",
    example: "Many equity funds charge 1% for redemption within one year.",
  },
  {
    term: "Securities Transaction Tax",
    aka: ["STT"],
    category: "Investing",
    source: "Chapter VII, Finance (No. 2) Act, 2004",
    definition:
      "A small tax collected on the exchange on trades in listed securities. Paying it is what makes equity gains eligible for the concessional rates under sections 111A and 112A.",
    example: "STT is not a deductible expense against capital gains.",
  },
  {
    term: "Repo Rate",
    category: "Banking & credit",
    source: "Reserve Bank of India monetary policy",
    definition:
      "The rate at which the RBI lends overnight to banks against government securities. It is the policy rate that most floating loan rates are now benchmarked to.",
    example: "A repo cut usually reaches home loan borrowers within a quarter through the external benchmark.",
  },
  {
    term: "EBLR and MCLR",
    category: "Banking & credit",
    source: "RBI circulars on lending rate benchmarks",
    definition:
      "The two systems for pricing bank loans. MCLR is an internal, cost-based benchmark; EBLR ties the rate to an external benchmark such as the repo rate, so policy changes pass through faster and more visibly.",
    example: "Retail floating rate loans sanctioned after October 2019 are generally on an external benchmark.",
  },
  {
    term: "EMI",
    aka: ["equated monthly instalment"],
    category: "Banking & credit",
    source: "Standard amortisation formula",
    definition:
      "The fixed monthly payment on a loan, computed as P x i x (1+i)^n / ((1+i)^n - 1), where i is the monthly rate and n the number of months. Early instalments are mostly interest; later ones mostly principal.",
    example: "Rs 30,00,000 for 20 years at 9% works out to an EMI of about Rs 26,992.",
  },
  {
    term: "Flat Rate vs Reducing Balance",
    category: "Banking & credit",
    source: "RBI fair practices guidance on rate disclosure",
    definition:
      "A flat rate charges interest on the full original principal for the whole tenure; a reducing balance rate charges only on what is still owed. The same flat number is roughly twice as expensive.",
    example: "A 12% flat rate over several years is close to 21-22% on a reducing balance basis.",
  },
  {
    term: "Credit Score",
    aka: ["CIBIL", "credit bureau"],
    category: "Banking & credit",
    source: "Credit Information Companies (Regulation) Act, 2005",
    definition:
      "A three-digit summary of your borrowing history maintained by licensed credit information companies, typically on a 300 to 900 scale. Repayment history and credit utilisation drive most of it.",
    example: "You are entitled to a free full credit report from each bureau once a year.",
  },
  {
    term: "Nominee and Legal Heir",
    category: "Compliance",
    source: "Section 45ZA, Banking Regulation Act and succession law",
    definition:
      "A nominee is only a receiver and custodian of the asset; ownership passes under a will or under succession law to the legal heirs. Naming a nominee speeds up release but does not decide who finally owns the money.",
    example: "A will, not a nomination, determines who inherits.",
  },
  {
    term: "Digital Signature Certificate",
    aka: ["DSC"],
    category: "Compliance",
    source: "Information Technology Act, 2000",
    definition:
      "An electronic credential issued by a licensed certifying authority that signs filings with legal effect. Class 3 certificates are the ones company, GST and tender filings require.",
    example: "A company director's e-form filings with the MCA must be signed with a DSC.",
  },
  {
    term: "Books of Account",
    category: "Compliance",
    source: "Section 44AA and Rule 6F, Income-tax Act",
    definition:
      "The records the law requires you to keep — cash book, journal, ledger, bills and vouchers — with a prescribed list for specified professions above a receipts threshold. They must be retained for six years from the end of the assessment year.",
    example: "Failing to keep them attracts a penalty of Rs 25,000 under section 271A.",
  },
];

/** Every entry, sorted alphabetically by term. */
export function allTerms() {
  return GLOSSARY.slice().sort((a, b) => a.term.localeCompare(b.term));
}

function normalise(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Relevance weights, highest first, so the ordering is explicit rather than accidental. */
export const MATCH_WEIGHTS = {
  exactTerm: 100,
  termStartsWith: 80,
  exactAlias: 70,
  aliasStartsWith: 60,
  termContains: 50,
  aliasContains: 40,
  sourceContains: 25,
  definitionContains: 20,
};

/**
 * Search the glossary.
 *
 * @param {object} input
 * @param {string} input.query      Free text; empty returns everything in the chosen category.
 * @param {string} input.category   One of CATEGORIES, or "All".
 * @param {Array} input.entries     Defaults to GLOSSARY; injectable for testing.
 */
export function searchGlossary({ query = "", category = "All", entries = GLOSSARY } = {}) {
  if (!Array.isArray(entries)) {
    return { error: "The glossary could not be read." };
  }
  if (typeof query !== "string") {
    return { error: "The search text must be plain text." };
  }
  if (category !== "All" && !CATEGORIES.includes(category)) {
    return { error: "Choose a valid category." };
  }

  const pool = category === "All" ? entries : entries.filter((entry) => entry.category === category);
  const q = normalise(query);

  if (q === "") {
    return {
      query: "",
      category,
      total: entries.length,
      results: pool
        .slice()
        .sort((a, b) => a.term.localeCompare(b.term))
        .map((entry) => ({ ...entry, score: 0, matchedOn: null })),
      matchCount: pool.length,
    };
  }

  const scored = [];
  for (const entry of pool) {
    const term = normalise(entry.term);
    const aliases = (entry.aka ?? []).map(normalise);
    let score = 0;
    let matchedOn = null;

    if (term === q) {
      score = MATCH_WEIGHTS.exactTerm;
      matchedOn = "term";
    } else if (term.startsWith(q)) {
      score = MATCH_WEIGHTS.termStartsWith;
      matchedOn = "term";
    } else if (aliases.some((alias) => alias === q)) {
      score = MATCH_WEIGHTS.exactAlias;
      matchedOn = "abbreviation";
    } else if (aliases.some((alias) => alias.startsWith(q))) {
      score = MATCH_WEIGHTS.aliasStartsWith;
      matchedOn = "abbreviation";
    } else if (term.includes(q)) {
      score = MATCH_WEIGHTS.termContains;
      matchedOn = "term";
    } else if (aliases.some((alias) => alias.includes(q))) {
      score = MATCH_WEIGHTS.aliasContains;
      matchedOn = "abbreviation";
    } else if (normalise(entry.source).includes(q)) {
      score = MATCH_WEIGHTS.sourceContains;
      matchedOn = "section";
    } else if (
      normalise(entry.definition).includes(q) ||
      normalise(entry.example).includes(q)
    ) {
      score = MATCH_WEIGHTS.definitionContains;
      matchedOn = "definition";
    }

    if (score > 0) scored.push({ ...entry, score, matchedOn });
  }

  scored.sort((a, b) => b.score - a.score || a.term.localeCompare(b.term));

  return {
    query,
    category,
    total: entries.length,
    matchCount: scored.length,
    results: scored,
  };
}

/** Count of entries in each category, for the filter buttons. */
export function categoryCounts(entries = GLOSSARY) {
  const counts = { All: entries.length };
  for (const name of CATEGORIES) {
    counts[name] = entries.filter((entry) => entry.category === name).length;
  }
  return counts;
}
