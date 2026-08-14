const seo = {
  title: "TDS Calculator by Section: 194C, 194J, 194Q Rates",
  metaDescription:
    "Pick 194C, 194H, 194-I, 194J or 194Q and get the TDS on a payment — with the threshold tested, the rate applied and the 20% no-PAN floor under 206AA.",
  steps: [
    "Choose the payment in the \"Section / payment type\" menu — 194C contractor at 1% (individual/HUF) or 2%, 194H commission at 5%, 194-I rent at 10% or 2%, 194J at 10% or 2%, or 194Q purchase of goods at 0.1%.",
    "Type the sum into \"Payment / aggregate amount (₹)\", untick \"Deductee has furnished a valid PAN\" if no PAN was given so the rate is lifted to the 20% section 206AA floor, and use \"Override rate (%) — 0 keeps section rate\" for a lower-deduction certificate.",
    "Read the estimated TDS with its Section, Amount, Threshold used, Rate and Net after TDS rows — a sum under the threshold reads \"Simplified threshold not crossed\" — then Copy the summary or Download it as tds-calculator-by-section.txt.",
  ],
  intro:
    "This calculator works out the tax deducted at source on an Indian payment by applying the rate for the section you select to the amount, once that amount crosses the section's threshold. It covers eight common cases — 194C contractor payments at 1% for individuals/HUF and 2% otherwise, 194H commission at 5%, 194-I rent at 10% for land and building or 2% for plant and equipment, 194J at 10% for professional fees and 2% for technical fees, and 194Q purchase of goods at 0.1% — and raises the rate to at least 20% when the deductee has no valid PAN, as section 206AA requires. It shows the threshold used, the rate applied, the TDS amount and the net payable, so you can see which figure drove the result.",
  useCases: [
    "You are paying a freelance designer's ₹1,00,000 invoice and need to know whether it falls under 194J professional at 10% or 194C contractor at 1% before you release the payment",
    "A vendor has not given you their PAN and you want to see what the 206AA floor does to the deduction on the invoice sitting in front of you",
    "You are reconciling a quarter's TDS entries and want to re-run each payment against its section threshold to find the ones where nothing should have been deducted at all",
  ],
  benefits: [
    ["Threshold and rate shown separately", "The output names the threshold it tested against and the percentage it applied, so a zero result is visibly \"below threshold\" rather than an unexplained blank."],
    ["Handles the no-PAN case properly", "Turn off valid PAN and the rate is lifted to 20% — or kept higher if the section rate already exceeds it — instead of silently using the normal rate."],
    ["Rate override for special cases", "A lower-deduction certificate or a rate you have been directed to use can be typed in directly, replacing the built-in section rate."],
  ],
  faqs: [
    [
      "What happens if the deductee has no PAN?",
      "The rate goes to 20% as a floor. Section 206AA requires deduction at the higher of the applicable section rate, the rate in force, or 20% when the deductee has not furnished a valid PAN — so a 194C payment jumps from 1% to 20%, while a section already above 20% keeps its own higher rate.",
    ],
    [
      "Is TDS deducted on the whole payment or only the excess over the threshold?",
      "On the whole payment. Once the amount crosses the section threshold, the rate applies to the full sum, not just the portion above it — which is why a ₹31,000 contractor payment against a ₹30,000 threshold is deducted on all ₹31,000, and a ₹29,000 one is not deducted at all.",
    ],
    [
      "Which thresholds does this use?",
      "The simplified per-section figures built into the tool: ₹30,000 for 194C and both 194J categories, ₹15,000 for 194H commission, ₹2,40,000 for 194-I rent and ₹50,00,000 for 194Q purchases. Real cases also involve aggregate annual limits, and thresholds and rates are revised by the Finance Act, so confirm the figures for the financial year you are filing for.",
    ],
    [
      "Can I rely on this for my TDS return?",
      "No — treat it as an illustrative check, not a filing figure. It does not handle surcharge and cess, treaty relief for non-residents, lower-deduction or nil-deduction certificates under section 197, aggregate-limit tests across the year, or mid-year rate changes. Have a chartered accountant or tax professional confirm anything you actually deposit or report.",
    ],
  ],
};

export default seo;
