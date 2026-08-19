/**
 * ALTFTool — hand-written India hub content for /locations/india.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The /locations/[geo] route used to render one template with the place name
 * swapped in, which is the textbook doorway pattern. Only locations that can
 * carry genuinely distinct, verifiable content are indexable now (see
 * DIFFERENTIATED_GEOS in src/platform/seo/geoEntities.js). India qualifies
 * because the tool registry actually ships India-localised tooling: GST,
 * income tax and ITR, EMI, PPF/NPS, PAN/Aadhaar/IFSC formats, UPI, stamp duty,
 * Indian land units and more.
 *
 * INTEGRITY RULES FOR THIS FILE
 * -----------------------------
 * - Every slug below MUST exist in src/platform/registry/toolMetaMap.js and in
 *   toolRuntimeMap.js. Unknown slugs are dropped at render time rather than
 *   rendered as dead links.
 * - Group copy is written FROM what the tools actually do (their registry
 *   descriptions), never from imagination. No ratings, no user counts, no
 *   prices, no dates that were not verified.
 * - `note` overrides exist only for tools whose registry description is
 *   written in Hinglish; the override is an English restatement of the SAME
 *   capability, not a new claim.
 * - Rates that change with legislation (GST slab percentages, exemption
 *   limits) are deliberately NOT stated here. Structural facts that do not
 *   drift (CGST+SGST vs IGST, PAN is 10 characters, the financial year runs
 *   1 April – 31 March) are safe and are what answer engines can cite.
 */

/** English restatements for registry descriptions written in Hinglish. */
export const INDIA_TOOL_NOTES = Object.freeze({
  "tds-calculator-by-section":
    "Pick an Income Tax section, enter the payment amount, and get the TDS due against that section's threshold and rate.",
  "post-office-scheme-calculator":
    "Compare maturity estimates for NSC, Kisan Vikas Patra and the Monthly Income Scheme side by side.",
  "aadhaar-secure-qr-verifier":
    "Decodes a supported Aadhaar Secure QR in the browser and reports the signature status. It does not contact UIDAI.",
  "ifsc-decoder-validator":
    "Validates IFSC structure and resolves the bank, branch and location a code points to.",
  "micr-cheque-code-decoder":
    "Explains the city, bank and branch fields inside the 9-digit MICR line printed on an Indian cheque.",
  "indian-mobile-number-validator":
    "Checks a number against the +91 country code and India's mobile numbering series.",
  "voter-id-format-validator":
    "Validates and normalises EPIC (voter ID) number patterns.",
  "driving-licence-number-decoder":
    "Parses an Indian licence number into its state, RTO office and year-of-issue fields.",
  "pin-code-region-lookup":
    "Resolves a six-digit PIN code to its postal circle, state and district.",
  "devanagari-transliteration-keyboard":
    "Types Devanagari from Roman Hindi with live transliteration as you type.",
  "section-138-notice-draft-assistant":
    "Structures a cheque-bounce notice under Section 138 against a versioned checklist. It drafts; it does not send or file.",
  "dpdp-consent-notice-checker":
    "Inspects a consent notice for completeness against a versioned India DPDP Act checklist.",
});

/**
 * India tool groups, organised by the job a person in India is trying to do.
 * `heading` is phrased as a question wherever a real question exists, because
 * retrieval chunks on headings.
 */
export const INDIA_TOOL_GROUPS = Object.freeze([
  {
    id: "gst",
    label: "GST",
    heading: "Which GST tools does AltFTool have for Indian businesses?",
    answer:
      "Eight tools cover the GST work a small business repeats every month: adding or removing GST from a price, splitting it into CGST + SGST for an intra-state supply or IGST for an inter-state one, setting off input tax credit, looking up an HSN or SAC code, validating a customer's GSTIN, and producing a GST-bearing quotation or purchase order. None of them file a GST return — filing happens on the GST portal.",
    slugs: [
      "gst-calculator",
      "gst-reverse-calculator",
      "gst-input-tax-credit-calculator",
      "hsn-code-gst-rate-finder",
      "gstin-format-validator",
      "quotation-generator",
      "purchase-order-generator",
      "number-to-words-converter",
    ],
  },
  {
    id: "income-tax",
    label: "Income tax",
    heading: "Which income tax calculators cover Indian salary and deductions?",
    answer:
      "Twelve calculators work in the old-regime / new-regime split that Indian income tax runs on, including the deductions that only exist here: HRA exemption by the least-of-three rule with metro and non-metro limits, professional tax by state salary slabs, the higher basic exemption for residents aged 60+ and 80+, health insurance under Section 80D, education loan interest under Section 80E across its eight-year window, and the flat 30% VDA tax with 1% TDS that applies to crypto under Sections 115BBH and 194S.",
    slugs: [
      "income-tax-calculator",
      "income-tax-slab-visualizer",
      "standard-deduction-impact-calculator",
      "senior-citizen-income-tax-calculator",
      "hra-exemption-calculator",
      "rent-receipt-generator-hra",
      "professional-tax-calculator",
      "section-80d-deduction-calculator",
      "section-80e-deduction-calculator",
      "equity-capital-gains-tax-calculator",
      "crypto-tax-calculator-india",
      "80tta-vs-80ttb-calculator",
    ],
  },
  {
    id: "itr-tds",
    label: "ITR & TDS",
    heading: "Which tools help before filing an ITR?",
    answer:
      "Four checkers tell you which return form applies to your income sources — ITR-1 Sahaj, ITR-2 or ITR-3 — and build the document checklist you need before you start. Four more handle TDS: monthly TDS on salary, the rate and threshold for a given section, TDS on a specific payment, and TDS on fixed deposit interest under Section 194A with Form 15G and 15H eligibility.",
    slugs: [
      "itr-1-eligibility-checker",
      "itr-2-applicability-checker",
      "itr-3-applicability-checker",
      "itr-document-checklist-builder",
      "tds-on-salary-calculator",
      "tds-rate-finder-by-section",
      "tds-calculator-by-section",
      "tds-on-fd-interest-calculator",
    ],
  },
  {
    id: "salary",
    label: "Salary & CTC",
    heading: "How do I work out take-home pay from an Indian CTC?",
    answer:
      "Indian offer letters quote annual CTC, not take-home. The in-hand calculator converts CTC to monthly pay after PF, professional tax and income tax; the EPF tools project the retirement corpus that the 12% employee/employer split builds, including the EPS cap; the EPS-95 calculator estimates the monthly pension that service buys; and the gratuity and notice-period tools price the two things that come up when you leave a job — gratuity on the 15/26 formula in the Payment of Gratuity Act, and the cost of an unserved notice period.",
    slugs: [
      "salary-in-hand-calculator",
      "epf-calculator",
      "epf-maturity-calculator",
      "eps-pension-calculator",
      "gratuity-calculator-india",
      "notice-period-buyout-calculator",
    ],
  },
  {
    id: "loans",
    label: "Loans & EMI",
    heading: "Which EMI and loan calculators use Indian lending conventions?",
    answer:
      "Twelve calculators are built around the EMI, the monthly instalment Indian lenders quote for everything from a two-wheeler to a loan against property. They include the two conversions Indian borrowers most often get wrong: a flat interest rate converted to its true reducing-balance equivalent, and the real cost of a prepayment or an EMI moratorium. Two of the twelve compute the Section 80C principal and Section 24(b) interest deductions a home loan earns.",
    slugs: [
      "loan-emi-calculator",
      "home-loan-prepayment-calculator",
      "home-affordability-calculator",
      "home-loan-tax-benefit-calculator",
      "section-24b-home-loan-interest-deduction",
      "car-loan-emi-calculator",
      "two-wheeler-loan-calculator",
      "personal-loan-emi-calculator",
      "education-loan-emi-calculator",
      "loan-against-property-calculator",
      "flat-vs-reducing-rate-converter",
      "emi-moratorium-impact-calculator",
    ],
  },
  {
    id: "schemes",
    label: "Savings schemes",
    heading: "Which government savings scheme calculators are available?",
    answer:
      "Eight calculators model Indian small-savings and pension schemes by their actual rules rather than as generic compound interest: PPF over its 15-year term with the loan and withdrawal windows, NPS to age 60 with the mandatory annuity share, Sukanya Samriddhi over 15 years of deposits and 21-year maturity, Atal Pension Yojana by joining age and pension slab, the Senior Citizen Savings Scheme quarterly payout, and post office NSC, KVP and MIS.",
    slugs: [
      "ppf-calculator",
      "ppf-maturity-calculator",
      "nps-calculator",
      "nps-tier-1-corpus-calculator",
      "sukanya-samriddhi-calculator",
      "atal-pension-yojana-calculator",
      "senior-citizen-savings-scheme-calculator",
      "post-office-scheme-calculator",
    ],
  },
  {
    id: "investing",
    label: "SIP & investing",
    heading: "Which SIP and market tools account for Indian charges?",
    answer:
      "Five SIP tools cover the monthly-instalment investing pattern that dominates Indian mutual funds, including annual step-ups and the three-year ELSS lock-in tracked instalment by instalment. The expense-ratio tool shows what a regular plan costs against a direct plan over a long horizon. Two brokerage calculators add the charges that only apply on Indian exchanges — STT, stamp duty, SEBI and exchange transaction charges, GST on brokerage, and DP charges — so the figure you see is the real net profit.",
    slugs: [
      "sip-calculator",
      "step-up-sip-calculator",
      "goal-based-sip-calculator",
      "lumpsum-vs-sip-comparator",
      "elss-lock-in-tracker",
      "expense-ratio-impact-calculator",
      "brokerage-calculator",
      "brokerage-charges-calculator",
    ],
  },
  {
    id: "identifiers",
    label: "PAN, Aadhaar & IFSC",
    heading: "How can I check PAN, Aadhaar, IFSC and other Indian formats?",
    answer:
      "Nine tools validate, decode or mask Indian identifiers. Eight of them check structure and checksums in your browser tab — a PAN's 10-character pattern and holder type, a 12-digit Aadhaar's checksum, an 11-character IFSC's bank and branch. (The 15-character GSTIN validator, which extracts the embedded state code and PAN, is in the GST group above.) The exception is the PIN code lookup, which sends the six-digit PIN through AltFTool to a postal directory to return the circle and district. None of them confirm that a real person or account exists behind a number.",
    slugs: [
      "pan-format-validator",
      "aadhaar-masking-tool",
      "aadhaar-secure-qr-verifier",
      "ifsc-decoder-validator",
      "micr-cheque-code-decoder",
      "indian-mobile-number-validator",
      "voter-id-format-validator",
      "pin-code-region-lookup",
      "digilocker-consent-scope-translator",
    ],
  },
  {
    id: "upi",
    label: "UPI",
    heading: "Which UPI tools are here, and do any of them move money?",
    answer:
      "No AltFTool tool can move money. These five build or inspect UPI artefacts only: generate a payment QR from a VPA and payee name, decode a pasted collect request to see the payee and amount before you approve it in your own app, compare a merchant QR against a trusted copy to spot a tampered payload, plan AutoPay mandate dates, and split a restaurant bill with GST shared proportionally.",
    slugs: [
      "upi-qr-code-generator",
      "upi-collect-request-decoder",
      "merchant-qr-tamper-comparator",
      "upi-autopay-mandate-calendar",
      "restaurant-bill-splitter",
    ],
  },
  {
    id: "property",
    label: "Property & land",
    heading: "Which property and land tools use Indian units and state rules?",
    answer:
      "Stamp duty and registration fees are set state by state in India, so the estimator covers 23 states and union territories separately. The land area converter handles bigha, katha, kanal, guntha and cent using the value the specific state actually uses — those units differ between states, which is why a single national conversion factor is wrong. The gold calculator prices jewellery the way an Indian shop bills it: purity rate plus making charges and wastage.",
    slugs: [
      "stamp-duty-estimator",
      "land-area-converter",
      "rent-vs-buy-calculator",
      "gold-jewellery-calculator",
    ],
  },
  {
    id: "vehicles",
    label: "Vehicles & RTO",
    heading: "Which vehicle and driving licence tools cover India?",
    answer:
      "Five tools follow the Indian RTO system: decode a registration plate into its state, RTO district and series; parse a licence number into its state, RTO and year; practise for a learner's licence with RTO-style questions; compute Insured Declared Value from ex-showroom price using the IRDAI depreciation grid; and work out the No Claim Bonus slab after claim-free years.",
    slugs: [
      "number-plate-decoder",
      "driving-licence-number-decoder",
      "rto-mock-test",
      "vehicle-insurance-idv-calculator",
      "no-claim-bonus-calculator",
    ],
  },
  {
    id: "everyday",
    label: "Everyday India",
    heading: "What else on AltFTool is India-specific?",
    answer:
      "Nine tools sit outside money and paperwork: daily mandi rates for crops and vegetables from AGMARKNET, Indian public holidays and long-weekend windows, a Panchang calculator, CGPA-to-percentage conversion using CBSE, VTU and Mumbai University multipliers, a Devanagari transliteration keyboard and Hindi Varnamala, plus checkers for DLT SMS sender IDs, DPDP Act consent notices and Section 138 cheque-bounce notices.",
    slugs: [
      "mandi-bhav",
      "indian-holiday-finder",
      "daily-panchang-calculator",
      "cgpa-to-percentage-converter",
      "devanagari-transliteration-keyboard",
      "hindi-vernamala",
      "dlt-sms-sender-id-explainer",
      "dpdp-consent-notice-checker",
      "section-138-notice-draft-assistant",
    ],
  },
]);

/**
 * What "India-specific" concretely means on this site. Structural conventions
 * only — deliberately no rates or limits, because those change with the
 * Finance Act and a stale number is worse than no number.
 */
export const INDIA_CONVENTIONS = Object.freeze([
  {
    convention: "Currency",
    detail: "Rupees (₹, INR)",
    where: "Every calculator in the groups below shows amounts in ₹.",
  },
  {
    convention: "Number format",
    detail: "Lakh and crore, grouped 2-2-3",
    where:
      "₹12,34,567 rather than ₹1,234,567. The number-to-words converter writes cheque and invoice amounts in the Indian system.",
  },
  {
    convention: "Financial year",
    detail: "1 April – 31 March",
    where:
      "Income tax, TDS and ITR tools are scoped to the Indian FY, not the calendar year.",
  },
  {
    convention: "Indirect tax",
    detail: "GST — CGST + SGST intra-state, IGST inter-state",
    where:
      "GST, invoicing, brokerage, jewellery and bill-splitting tools apply the split rather than a single sales-tax line.",
  },
  {
    convention: "Identifier formats",
    detail: "PAN 10 chars · Aadhaar 12 digits · GSTIN 15 chars · IFSC 11 chars · PIN 6 digits",
    where: "The PAN, Aadhaar, GSTIN and IFSC validators check structure and checksum in your browser; the PIN lookup queries a postal directory.",
  },
  {
    convention: "Land measurement",
    detail: "Bigha, katha, kanal, guntha, cent — values vary by state",
    where: "The land area converter uses the value for the state you pick.",
  },
]);

/**
 * What the India tools explicitly do NOT do. Stated up front because the
 * boundary is the fact people most need — and the one an answer engine is
 * most likely to get wrong if nobody writes it down.
 */
export const INDIA_LIMITS = Object.freeze([
  "No tool files a return or a form. ITR, GST returns, TDS returns and tax payments are done on the Income Tax and GST portals.",
  "No tool moves money. The UPI tools build or inspect a QR or a collect-request payload; the payment itself happens in your own bank or UPI app.",
  "The identity tools do not query a government database. PAN, Aadhaar, GSTIN, IFSC, EPIC and licence tools check format, checksum and encoded fields only — a well-formed number is not a real or valid one. Two tools here do reach a live source and say so on their own page: the PIN code lookup queries a postal directory, and the mandi rates tool reads the government's AGMARKNET open-data feed.",
  "No tool is tax, legal or investment advice. Every figure is an estimate for planning, and rates change with the Finance Act and with quarterly small-savings notifications.",
  "Almost nothing leaves your browser. The calculators and validators process the number, salary or document you type in your own tab, and no account is created. The two lookup tools named above are the exception — they have to send your query to fetch a live answer.",
]);

/**
 * Hand-written FAQ. Every answer is self-contained (it makes sense lifted out
 * of the page) and states a limit as often as a capability, because limits are
 * the part people and answer engines actually need.
 */
export const INDIA_FAQS = Object.freeze([
  {
    question: "Can AltFTool file my ITR, GST return or any government form?",
    answer:
      "No. AltFTool's India tools calculate, validate, decode and generate documents. Filing an income tax return, filing a GST return, paying tax, updating Aadhaar or applying for a licence all happen on the relevant government portal, and no AltFTool tool connects to one.",
  },
  {
    question: "Do the income tax calculators use the old regime or the new regime?",
    answer:
      "The main income tax calculator compares both. It shows the old and new regime side by side with deductions, rebate, surcharge, cess and a slab-wise breakup, so you can see which one costs you less rather than being pushed into one.",
  },
  {
    question: "Is my PAN or Aadhaar number sent anywhere when I use the validators?",
    answer:
      "No. The PAN, Aadhaar and GSTIN tools check format and checksum inside your browser tab, and they offer masked output so you can share a redacted list safely. They cannot confirm that a number belongs to a real person or account, because they never look it up anywhere. Two other India tools do send your input out to answer it — the PIN code lookup and the mandi rates feed — and each says so on its own page.",
  },
  {
    question: "Are the Indian tax rates and scheme interest rates kept current?",
    answer:
      "Rates in India change with the annual Finance Act and with quarterly small-savings notifications. Treat every figure these tools produce as an estimate for planning, and confirm the current rate on the Income Tax Department, GST or India Post site before you act on it.",
  },
  {
    question: "Do I need an account, and is there a cost?",
    answer:
      "No account and no payment. The India tools are open in the browser, the same as the rest of the AltFTool directory.",
  },
  {
    question: "Are there separate pages for Indian states and cities?",
    answer:
      "Yes, as directory shortcuts, but the tools behind them are identical. The genuinely state-dependent tools handle the variation inside the tool itself: the stamp duty estimator covers 23 states and union territories, professional tax is computed from state salary slabs, and the land area converter changes the bigha or katha value by state.",
  },
]);
