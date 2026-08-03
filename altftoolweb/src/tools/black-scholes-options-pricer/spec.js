// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "black-scholes-options-pricer",
  "title": "Black-Scholes Options Pricer",
  "description": "Price a European call or put option from spot, strike, volatility, and rate inputs, and calculate all five Greeks.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Finance",
    "Calculator"
  ],
  "icon": "chart-candlestick",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "spot",
      "label": "Spot price",
      "type": "number",
      "default": 100,
      "min": 0.0001
    },
    {
      "key": "strike",
      "label": "Strike price",
      "type": "number",
      "default": 105,
      "min": 0.0001
    },
    {
      "key": "time",
      "label": "Time to expiry (years)",
      "type": "number",
      "default": 0.5,
      "min": 0.0001
    },
    {
      "key": "rate",
      "label": "Risk-free rate (%)",
      "type": "number",
      "default": 5
    },
    {
      "key": "volatility",
      "label": "Volatility (%)",
      "type": "number",
      "default": 25,
      "min": 0.0001
    },
    {
      "key": "dividend",
      "label": "Dividend yield (%)",
      "type": "number",
      "default": 0
    },
    {
      "key": "option",
      "label": "Option type",
      "type": "select",
      "default": "call",
      "choices": [
        {
          "value": "call",
          "label": "European call"
        },
        {
          "value": "put",
          "label": "European put"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "Call example",
      "values": {
        "spot": 100,
        "strike": 105,
        "time": 0.5,
        "rate": 5,
        "volatility": 25,
        "dividend": 0,
        "option": "call"
      }
    }
  ],
  "note": "European Black–Scholes estimate with continuous rates/dividend yield. It omits early exercise, discrete dividends, transaction costs, liquidity, jumps, and volatility smile; not investment advice."
},
  compute: (values) => {
      const S = Number(values.spot), K = Number(values.strike), T = Number(values.time), r = Number(values.rate) / 100, sigma = Number(values.volatility) / 100, q = Number(values.dividend) / 100;
      if (!(S > 0 && K > 0 && T > 0 && sigma > 0)) return { result: "—", caption: "Spot, strike, time, and volatility must be positive" };
      const erf = (x) => { const sign = x < 0 ? -1 : 1; const a = Math.abs(x); const t = 1 / (1 + 0.3275911 * a); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a); return sign * y; };
      const N = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));
      const pdf = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
      const rootT = Math.sqrt(T);
      const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * rootT);
      const d2 = d1 - sigma * rootT;
      const discQ = Math.exp(-q * T), discR = Math.exp(-r * T);
      const call = S * discQ * N(d1) - K * discR * N(d2);
      const put = K * discR * N(-d2) - S * discQ * N(-d1);
      const isCall = values.option === "call";
      const delta = isCall ? discQ * N(d1) : discQ * (N(d1) - 1);
      const gamma = discQ * pdf(d1) / (S * sigma * rootT);
      const vega = S * discQ * pdf(d1) * rootT / 100;
      const thetaCall = (-(S * discQ * pdf(d1) * sigma) / (2 * rootT) - r * K * discR * N(d2) + q * S * discQ * N(d1)) / 365;
      const thetaPut = (-(S * discQ * pdf(d1) * sigma) / (2 * rootT) + r * K * discR * N(-d2) - q * S * discQ * N(-d1)) / 365;
      const rho = (isCall ? K * T * discR * N(d2) : -K * T * discR * N(-d2)) / 100;
      const price = isCall ? call : put;
      return { result: price.toFixed(4), caption: isCall ? "European call value" : "European put value", rows: [["Delta", delta.toFixed(6)], ["Gamma", gamma.toFixed(6)], ["Vega / 1 vol point", vega.toFixed(6)], ["Theta / day", (isCall ? thetaCall : thetaPut).toFixed(6)], ["Rho / 1 rate point", rho.toFixed(6)], ["d1 / d2", d1.toFixed(4) + " / " + d2.toFixed(4)]] };
    },
};

export default spec;
