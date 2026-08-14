const seo = {
  title: "Black-Scholes Options Pricer with All Five Greeks",
  metaDescription:
    "Price a European call or put from spot, strike, time, rate, volatility and dividend yield, with Delta, Gamma, Vega per vol point, Theta per day and Rho.",
  steps: [
    "Enter Spot price, Strike price, 'Time to expiry (years)', 'Risk-free rate (%)', 'Volatility (%)' and 'Dividend yield (%)', or press the 'Call example' preset to load spot 100, strike 105, 0.5 years, 5% and 25%.",
    "Set 'Option type' to European call or European put; d1 and d2 are recomputed from the Black-Scholes-Merton formula on every change.",
    "Read the option value with Delta, Gamma, 'Vega / 1 vol point', 'Theta / day', 'Rho / 1 rate point' and 'd1 / d2', then press Copy or Download for black-scholes-options-pricer.txt.",
  ],
  intro:
    "The Black-Scholes Options Pricer computes the theoretical value of a European call or put from six inputs — spot, strike, time to expiry in years, risk-free rate, volatility and continuous dividend yield — using the Black-Scholes-Merton formula, and returns the five Greeks alongside it. Delta, Gamma, Vega, Theta and Rho are reported in trading units: Vega per one volatility point, Theta per calendar day and Rho per one rate point. It is built for students, analysts and traders who want a fair-value reference and a sensitivity read on one screen.",
  useCases: [
    "You are quoted 3.20 for an option and want to know whether that is rich or cheap against a 25% volatility assumption before you decide the trade is worth doing.",
    "You hold a position and need to know how much it moves for a one-point change in implied volatility, so you read Vega directly rather than repricing twice by hand.",
    "You are working through a derivatives course problem set and want to check your hand-computed d1 and d2 against a reference implementation.",
  ],
  benefits: [
    ["Greeks in the units desks actually quote", "Vega is scaled per one volatility point and Rho per one rate point, and Theta is divided by 365 to give decay per calendar day, so the numbers are directly usable."],
    ["Dividends handled properly", "A continuous dividend yield q enters the Merton extension, discounting the spot by e^(-qT), so index and dividend-paying names are not mispriced as if they yielded nothing."],
    ["Shows the intermediate terms", "d1 and d2 are printed alongside the price, which is what you need to check a hand calculation or trace where an unexpected value came from."],
  ],
  faqs: [
    [
      "What inputs does Black-Scholes need?",
      "Six: spot price, strike, time to expiry in years, the risk-free rate, volatility, and dividend yield. Rate, volatility and yield are entered as percentages here and converted to decimals internally, and time is in years — so a three-month option is 0.25.",
    ],
    [
      "Does this work for American options?",
      "No. It prices European exercise only, meaning exercise at expiry. American puts in particular can be worth more because of the right to exercise early, so this value is a lower bound for them rather than a correct price.",
    ],
    [
      "What does Vega of 0.19 mean?",
      "The option gains roughly 0.19 in value if implied volatility rises by one percentage point — for example from 25% to 26% — with everything else unchanged. Vega here is deliberately divided by 100 to express it per volatility point rather than per unit of sigma.",
    ],
    [
      "Why does my broker's price differ from this?",
      "Black-Scholes assumes constant volatility, continuous trading, no transaction costs and lognormal returns. Real markets show a volatility smile, discrete dividends, jumps and bid-ask spreads, so quoted prices legitimately diverge. This is an educational estimate, not investment advice — talk to a licensed adviser before trading.",
    ],
  ],
};

export default seo;
