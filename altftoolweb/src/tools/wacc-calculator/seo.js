const seo = {
  title: "WACC Calculator: Equity and After-Tax Debt Weights",
  metaDescription:
    "Work out WACC from the market values of equity and debt with (E/V)Re + (D/V)Rd(1-t), and see both weights, after-tax debt cost and each contribution.",
  steps: [
    "Under Inputs, enter Market value of equity, Market value of debt, Cost of equity (%), Pre-tax cost of debt (%) and Marginal tax rate (%), or tap the 80/20 structure example to load 800,000 / 200,000 / 12 / 7 / 25.",
    "The Result panel evaluates (E/V) x Re + (D/V) x Rd x (1 - t) as you type and prints the headline figure to three decimals — 10.650% WACC on those defaults.",
    "Read the Equity weight, Debt weight, After-tax debt cost, Equity contribution and Debt contribution cards, then use Copy or Download to save wacc-calculator.txt.",
  ],
  intro:
    "The WACC Calculator computes a company's weighted average cost of capital with the standard formula WACC = (E/V) × Re + (D/V) × Rd × (1 − t), weighting the cost of equity and the after-tax cost of debt by their market values. It is for anyone building a DCF, setting a hurdle rate, or checking whether a project clears the cost of the money funding it. Along with the headline percentage it breaks out the equity and debt weights, the after-tax debt cost, and how many percentage points each side contributes.",
  useCases: [
    "You are valuing a business in a DCF and need a defensible discount rate, so you enter market values of equity and debt rather than the book figures on the balance sheet.",
    "Your company is weighing a capital project with an expected 11% return and you want to know whether that clears the blended cost of capital once the tax shield on debt is counted.",
    "You are testing how much cheaper capital gets if you shift from an 80/20 to a 60/40 equity-debt structure, and you want the two WACC numbers side by side.",
  ],
  benefits: [
    ["Shows the contribution split", "You see how many percentage points come from equity and how many from debt, so it is obvious which lever actually moves your WACC."],
    ["The tax shield is explicit", "The after-tax cost of debt is displayed as its own line, so you can check the (1 − t) adjustment rather than trusting a single blended output."],
    ["Weights derived from what you enter", "Equity and debt weights are recomputed from the market values you supply, so changing one capital structure input updates both weights consistently."],
  ],
  faqs: [
    [
      "What is the WACC formula?",
      "WACC = (E/V) × Re + (D/V) × Rd × (1 − t), where E and D are the market values of equity and debt, V is E + D, Re is the cost of equity, Rd is the pre-tax cost of debt and t is the marginal tax rate. With the default inputs — 800,000 equity, 200,000 debt, 12% cost of equity, 7% pre-tax debt and a 25% tax rate — that gives 10.65%.",
    ],
    [
      "Why is the cost of debt multiplied by (1 − tax rate)?",
      "Because interest is generally tax-deductible, so each rupee or dollar of interest reduces taxable income and the true cost to the firm is lower than the coupon. At a 25% marginal rate, 7% pre-tax debt costs 5.25% after tax.",
    ],
    [
      "Should I use book value or market value of equity and debt?",
      "Market value. For a listed company that means share price times shares outstanding for equity; book equity reflects historical accounting and typically understates the equity weight, which biases the WACC downward. Use market value of debt too where an observable price exists, otherwise book value of debt is the usual approximation.",
    ],
    [
      "Can I use this WACC as my discount rate?",
      "It is the right starting point for discounting free cash flow to the firm, but WACC assumes the capital structure and risk profile stay roughly constant over the forecast. This tool is informational and does not account for country risk premia, changing leverage or project-specific risk — have material valuation work reviewed by a qualified finance professional.",
    ],
  ],
};

export default seo;
