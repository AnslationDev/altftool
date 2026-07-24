import path from "node:path";
import { fileURLToPath } from "node:url";
import backlog from "./new-tasks-backlog.json" with { type: "json" };
import { emitTool } from "./lib/spec.mjs";
import { validateRawSpec } from "./generator/validate.mjs";
import { qualityLint } from "./verify/quality.mjs";

const automationDir = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(automationDir, "..", "src", "tools");
const requested = new Set(
  (process.argv.find((arg) => arg.startsWith("--slugs=")) || "")
    .replace("--slugs=", "")
    .split(",")
    .filter(Boolean),
);
const dryRun = process.argv.includes("--dry");
const entryBySlug = new Map(backlog.tools.map((entry) => [entry.slug, entry]));

const base = (slug, raw) => {
  const entry = entryBySlug.get(slug);
  if (!entry) throw new Error(`Missing backlog entry for ${slug}`);
  return {
    slug,
    title: entry.name,
    description: entry.description,
    badge: raw.badge || entry.category,
    category: raw.category,
    icon: raw.icon || "calculator",
    iconColor: "text-primary",
    note:
      raw.note ||
      "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision.",
    ...raw,
  };
};

function delimitedWorkbench(slug, {
  headers,
  sample,
  category = ["Productivity", "Business"],
  icon = "table-properties",
  note,
}) {
  return base(slug, {
    category,
    icon,
    note,
    fields: [
      { key: "records", label: "Records, one per line", type: "textarea", default: sample, hint: `Use | between: ${headers.join(" | ")}` },
      { key: "complete", label: "Completeness review", type: "toggle", default: true, checkboxLabel: "Flag rows with missing columns" },
    ],
    presets: [{ label: "Example records", values: { records: sample, complete: true } }],
    compute: `(values) => {
      const headers = ${JSON.stringify(headers)};
      const rows = String(values.records || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const incomplete = rows.filter((row) => row.length < headers.length || row.slice(0, headers.length).some((cell) => !cell)).length;
      return { result: rows.length + " structured record(s)", caption: values.complete ? incomplete + " incomplete row(s)" : headers.length + " tracked fields", rows: [["Complete", Math.max(0, rows.length - incomplete)], ["Needs review", incomplete], ["Columns", headers.length]], table: { headers, rows: rows.map((row) => headers.map((_, index) => row[index] || "—")).slice(0, 200) } };
    }`,
  });
}

const specs = [
  base("black-scholes-options-pricer", {
    category: ["Finance", "Calculator"],
    icon: "chart-candlestick",
    fields: [
      { key: "spot", label: "Spot price", type: "number", min: 0.0001, default: 100 },
      { key: "strike", label: "Strike price", type: "number", min: 0.0001, default: 105 },
      { key: "time", label: "Time to expiry (years)", type: "number", min: 0.0001, default: 0.5 },
      { key: "rate", label: "Risk-free rate (%)", type: "number", default: 5 },
      { key: "volatility", label: "Volatility (%)", type: "number", min: 0.0001, default: 25 },
      { key: "dividend", label: "Dividend yield (%)", type: "number", default: 0 },
      { key: "option", label: "Option type", type: "select", default: "call", choices: [{ value: "call", label: "European call" }, { value: "put", label: "European put" }] },
    ],
    presets: [{ label: "Call example", values: { spot: 100, strike: 105, time: 0.5, rate: 5, volatility: 25, dividend: 0, option: "call" } }],
    note: "European Black–Scholes estimate with continuous rates/dividend yield. It omits early exercise, discrete dividends, transaction costs, liquidity, jumps, and volatility smile; not investment advice.",
    compute: `(values) => {
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
    }`,
  }),
  base("bond-duration-convexity-calculator", {
    category: ["Finance", "Calculator"],
    icon: "landmark",
    fields: [
      { key: "face", label: "Face value", type: "number", min: 0.01, default: 1000 },
      { key: "coupon", label: "Annual coupon rate (%)", type: "number", min: 0, default: 6 },
      { key: "yield_rate", label: "Yield to maturity (%)", type: "number", default: 7 },
      { key: "years", label: "Years to maturity", type: "number", min: 0.1, default: 8 },
      { key: "frequency", label: "Payments per year", type: "select", default: "2", choices: [{ value: "1", label: "Annual" }, { value: "2", label: "Semiannual" }, { value: "4", label: "Quarterly" }] },
    ],
    presets: [{ label: "8-year bond", values: { face: 1000, coupon: 6, yield_rate: 7, years: 8, frequency: "2" } }],
    compute: `(values) => {
      const face = Number(values.face), couponRate = Number(values.coupon) / 100, y = Number(values.yield_rate) / 100, years = Number(values.years), m = Number(values.frequency);
      const periods = Math.max(1, Math.round(years * m)), rate = y / m, coupon = face * couponRate / m;
      if (!(face > 0 && years > 0 && m > 0 && 1 + rate > 0)) return { result: "—", caption: "Enter a valid positive face value and term" };
      let price = 0, weighted = 0, convex = 0;
      const schedule = [];
      for (let t = 1; t <= periods; t += 1) {
        const cash = coupon + (t === periods ? face : 0);
        const pv = cash / Math.pow(1 + rate, t);
        price += pv; weighted += (t / m) * pv;
        convex += t * (t + 1) * pv;
        if (t <= 12 || t === periods) schedule.push([t, (t / m).toFixed(2), cash.toFixed(2), pv.toFixed(2)]);
      }
      const macaulay = weighted / price;
      const modified = macaulay / (1 + rate);
      const annualConvexity = convex / (price * Math.pow(1 + rate, 2) * m * m);
      return { result: modified.toFixed(4) + " years modified duration", caption: "Price " + price.toFixed(2), rows: [["Macaulay duration", macaulay.toFixed(4) + " years"], ["Modified duration", modified.toFixed(4) + " years"], ["Convexity", annualConvexity.toFixed(4)], ["Approx. 1% yield price change", (-modified * 0.01 + 0.5 * annualConvexity * 0.0001).toFixed(4)]], table: { headers: ["Period", "Years", "Cash flow", "Present value"], rows: schedule } };
    }`,
  }),
  base("wacc-calculator", {
    category: ["Finance", "Calculator"],
    icon: "scale",
    fields: [
      { key: "equity", label: "Market value of equity", type: "number", min: 0, default: 800000 },
      { key: "debt", label: "Market value of debt", type: "number", min: 0, default: 200000 },
      { key: "cost_equity", label: "Cost of equity (%)", type: "number", default: 12 },
      { key: "cost_debt", label: "Pre-tax cost of debt (%)", type: "number", default: 7 },
      { key: "tax", label: "Marginal tax rate (%)", type: "number", default: 25 },
    ],
    presets: [{ label: "80/20 structure", values: { equity: 800000, debt: 200000, cost_equity: 12, cost_debt: 7, tax: 25 } }],
    compute: `(values) => {
      const E = Math.max(0, Number(values.equity) || 0), D = Math.max(0, Number(values.debt) || 0), total = E + D;
      if (!total) return { result: "—", caption: "Enter equity or debt value" };
      const Re = Number(values.cost_equity) / 100, Rd = Number(values.cost_debt) / 100, tax = Number(values.tax) / 100;
      const afterDebt = Rd * (1 - tax), wacc = (E / total) * Re + (D / total) * afterDebt;
      return { result: (wacc * 100).toFixed(3) + "% WACC", rows: [["Equity weight", ((E / total) * 100).toFixed(2) + "%"], ["Debt weight", ((D / total) * 100).toFixed(2) + "%"], ["After-tax debt cost", (afterDebt * 100).toFixed(3) + "%"], ["Equity contribution", ((E / total) * Re * 100).toFixed(3) + "%"], ["Debt contribution", ((D / total) * afterDebt * 100).toFixed(3) + "%"]] };
    }`,
  }),
  base("sharpe-sortino-calculator", {
    category: ["Finance", "Calculator"],
    icon: "chart-line",
    fields: [
      { key: "returns", label: "Periodic returns (%)", type: "textarea", default: "1.2, -0.4, 2.1, 0.8, -1.1, 1.7, 0.5, 1.0" },
      { key: "risk_free", label: "Risk-free return per period (%)", type: "number", default: 0.2 },
      { key: "target", label: "Minimum acceptable return (%)", type: "number", default: 0 },
      { key: "periods", label: "Periods per year", type: "number", min: 1, default: 12 },
    ],
    presets: [{ label: "Monthly series", values: { returns: "1.2, -0.4, 2.1, 0.8, -1.1, 1.7, 0.5, 1.0", risk_free: 0.2, target: 0, periods: 12 } }],
    compute: `(values) => {
      const series = String(values.returns || "").split(/[\\s,;]+/).map(Number).filter(Number.isFinite).map((value) => value / 100);
      if (series.length < 2) return { result: "—", caption: "Enter at least two returns" };
      const rf = Number(values.risk_free) / 100, target = Number(values.target) / 100, periods = Math.max(1, Number(values.periods) || 1);
      const mean = series.reduce((sum, value) => sum + value, 0) / series.length;
      const variance = series.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (series.length - 1);
      const stdev = Math.sqrt(variance);
      const downside = Math.sqrt(series.reduce((sum, value) => sum + Math.min(0, value - target) ** 2, 0) / series.length);
      const sharpe = stdev ? ((mean - rf) / stdev) * Math.sqrt(periods) : 0;
      const sortino = downside ? ((mean - target) / downside) * Math.sqrt(periods) : 0;
      return { result: sharpe.toFixed(4) + " Sharpe", caption: sortino.toFixed(4) + " Sortino", rows: [["Observations", series.length], ["Mean / period", (mean * 100).toFixed(4) + "%"], ["Std. deviation", (stdev * 100).toFixed(4) + "%"], ["Downside deviation", (downside * 100).toFixed(4) + "%"], ["Annualized Sharpe", sharpe.toFixed(4)], ["Annualized Sortino", sortino.toFixed(4)]] };
    }`,
  }),
  base("apr-to-apy-converter", {
    category: ["Finance", "Calculator"],
    icon: "percent",
    fields: [
      { key: "apr", label: "Nominal APR (%)", type: "number", default: 12 },
      { key: "compounds", label: "Compounds per year", type: "number", min: 1, default: 12 },
      { key: "continuous", label: "Continuous compounding", type: "toggle", default: false, checkboxLabel: "Use e^APR instead of periodic compounding" },
    ],
    presets: [{ label: "12% monthly", values: { apr: 12, compounds: 12, continuous: false } }],
    compute: `(values) => {
      const apr = Number(values.apr) / 100, n = Math.max(1, Number(values.compounds) || 1);
      const apy = values.continuous ? Math.exp(apr) - 1 : Math.pow(1 + apr / n, n) - 1;
      return { result: (apy * 100).toFixed(6) + "% APY", caption: values.continuous ? "Continuous compounding" : n + " compounding period(s) per year", rows: [["Nominal APR", (apr * 100).toFixed(6) + "%"], ["Effective APY", (apy * 100).toFixed(6) + "%"], ["Effective uplift", ((apy - apr) * 100).toFixed(6) + " percentage points"]] };
    }`,
  }),
  base("mirr-calculator", {
    category: ["Finance", "Calculator"],
    icon: "chart-no-axes-combined",
    fields: [
      { key: "cashflows", label: "Cash flows from period 0", type: "textarea", default: "-100000, 25000, 30000, 35000, 40000" },
      { key: "finance_rate", label: "Finance rate (%)", type: "number", default: 8 },
      { key: "reinvest_rate", label: "Reinvestment rate (%)", type: "number", default: 10 },
    ],
    presets: [{ label: "Five periods", values: { cashflows: "-100000, 25000, 30000, 35000, 40000", finance_rate: 8, reinvest_rate: 10 } }],
    compute: `(values) => {
      const flows = String(values.cashflows || "").split(/[\\s,;]+/).map(Number).filter(Number.isFinite);
      if (flows.length < 2) return { result: "—", caption: "Enter at least two cash flows" };
      const fr = Number(values.finance_rate) / 100, rr = Number(values.reinvest_rate) / 100, n = flows.length - 1;
      let pvNegative = 0, fvPositive = 0;
      flows.forEach((flow, index) => {
        if (flow < 0) pvNegative += flow / Math.pow(1 + fr, index);
        else if (flow > 0) fvPositive += flow * Math.pow(1 + rr, n - index);
      });
      if (!(pvNegative < 0 && fvPositive > 0)) return { result: "—", caption: "Series needs at least one negative and one positive flow" };
      const mirr = Math.pow(fvPositive / -pvNegative, 1 / n) - 1;
      return { result: (mirr * 100).toFixed(5) + "% MIRR per period", rows: [["Periods", n], ["PV of negative flows", pvNegative.toFixed(2)], ["FV of positive flows", fvPositive.toFixed(2)], ["Finance rate", (fr * 100).toFixed(3) + "%"], ["Reinvestment rate", (rr * 100).toFixed(3) + "%"]] };
    }`,
  }),
  base("a-b-test-significance-calculator", {
    category: ["Business", "Calculator"],
    icon: "split",
    fields: [
      { key: "visitors_a", label: "Variant A visitors", type: "number", min: 1, default: 1000 },
      { key: "conversions_a", label: "Variant A conversions", type: "number", min: 0, default: 100 },
      { key: "visitors_b", label: "Variant B visitors", type: "number", min: 1, default: 1000 },
      { key: "conversions_b", label: "Variant B conversions", type: "number", min: 0, default: 125 },
      { key: "confidence", label: "Confidence target (%)", type: "select", default: "95", choices: [{ value: "90", label: "90%" }, { value: "95", label: "95%" }, { value: "99", label: "99%" }] },
    ],
    presets: [{ label: "10% vs 12.5%", values: { visitors_a: 1000, conversions_a: 100, visitors_b: 1000, conversions_b: 125, confidence: "95" } }],
    note: "Two-sided pooled z-test approximation. It assumes independent randomized observations, one planned analysis, and valid conversion counting; sequential peeking and multiple comparisons need correction.",
    compute: `(values) => {
      const n1 = Number(values.visitors_a), x1 = Number(values.conversions_a), n2 = Number(values.visitors_b), x2 = Number(values.conversions_b);
      if (!(n1 > 0 && n2 > 0 && x1 >= 0 && x2 >= 0 && x1 <= n1 && x2 <= n2)) return { result: "—", caption: "Conversions must be between 0 and visitors" };
      const p1 = x1 / n1, p2 = x2 / n2, pooled = (x1 + x2) / (n1 + n2), se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
      const z = se ? (p2 - p1) / se : 0;
      const erf = (x) => { const sign = x < 0 ? -1 : 1; const a = Math.abs(x); const t = 1 / (1 + 0.3275911 * a); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a); return sign * y; };
      const cdf = (value) => 0.5 * (1 + erf(value / Math.sqrt(2)));
      const pValue = 2 * (1 - cdf(Math.abs(z)));
      const alpha = 1 - Number(values.confidence) / 100, significant = pValue < alpha;
      const uplift = p1 ? ((p2 - p1) / p1) * 100 : 0;
      return { result: significant ? "Statistically significant" : "Not significant at target", caption: "Two-sided p-value " + pValue.toFixed(6), rows: [["A conversion", (p1 * 100).toFixed(3) + "%"], ["B conversion", (p2 * 100).toFixed(3) + "%"], ["Relative uplift", uplift.toFixed(3) + "%"], ["z score", z.toFixed(5)], ["p-value", pValue.toFixed(6)], ["Confidence target", values.confidence + "%"]] };
    }`,
  }),
  base("confidence-interval-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "brackets",
    fields: [
      { key: "estimate", label: "Sample estimate", type: "number", default: 50 },
      { key: "standard_error", label: "Standard error", type: "number", min: 0, default: 2.5 },
      { key: "confidence", label: "Confidence level", type: "select", default: "95", choices: [{ value: "90", label: "90%" }, { value: "95", label: "95%" }, { value: "99", label: "99%" }] },
      { key: "percent", label: "Display estimate as percent", type: "toggle", default: false, checkboxLabel: "Append percentage units" },
    ],
    presets: [{ label: "Mean 50 ± SE 2.5", values: { estimate: 50, standard_error: 2.5, confidence: "95", percent: false } }],
    note: "Normal critical-value interval from an already-computed standard error. Small samples, skew, clustering, weighting, finite populations, and estimated variance may require a t, exact, bootstrap, or survey-specific method.",
    compute: `(values) => {
      const estimate = Number(values.estimate), se = Math.max(0, Number(values.standard_error) || 0), critical = { "90": 1.644854, "95": 1.959964, "99": 2.575829 }[values.confidence] || 1.959964;
      const margin = critical * se, suffix = values.percent ? "%" : "";
      return { result: (estimate - margin).toFixed(6) + suffix + " to " + (estimate + margin).toFixed(6) + suffix, caption: values.confidence + "% normal confidence interval", rows: [["Estimate", estimate + suffix], ["Standard error", se + suffix], ["Critical value", critical], ["Margin of error", margin.toFixed(6) + suffix]] };
    }`,
  }),
  base("bayesian-update-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "brain-circuit",
    fields: [
      { key: "prior", label: "Prior probability (%)", type: "number", min: 0, max: 100, default: 10 },
      { key: "sensitivity", label: "P(evidence | hypothesis) (%)", type: "number", min: 0, max: 100, default: 90 },
      { key: "false_positive", label: "P(evidence | not hypothesis) (%)", type: "number", min: 0, max: 100, default: 5 },
    ],
    presets: [{ label: "10% prior, strong evidence", values: { prior: 10, sensitivity: 90, false_positive: 5 } }],
    compute: `(values) => {
      const prior = Math.max(0, Math.min(1, Number(values.prior) / 100)), sensitivity = Math.max(0, Math.min(1, Number(values.sensitivity) / 100)), falsePositive = Math.max(0, Math.min(1, Number(values.false_positive) / 100));
      const evidence = sensitivity * prior + falsePositive * (1 - prior);
      const posterior = evidence ? (sensitivity * prior) / evidence : 0;
      const priorOdds = prior < 1 ? prior / Math.max(1e-12, 1 - prior) : Number.MAX_SAFE_INTEGER;
      const likelihoodRatio = falsePositive ? sensitivity / falsePositive : Number.MAX_SAFE_INTEGER;
      return { result: (posterior * 100).toFixed(6) + "% posterior", rows: [["Prior", (prior * 100).toFixed(4) + "%"], ["Evidence probability", (evidence * 100).toFixed(4) + "%"], ["Prior odds", priorOdds.toFixed(6)], ["Likelihood ratio", likelihoodRatio.toFixed(6)], ["Posterior odds", (priorOdds * likelihoodRatio).toFixed(6)]] };
    }`,
  }),
  base("shannon-entropy-explorer", {
    category: ["Education & Science", "Developer"],
    icon: "binary",
    modes: [{ id: "text", label: "Text symbols" }, { id: "probabilities", label: "Probabilities" }],
    fields: [
      { key: "input", label: "Text or comma-separated probabilities", type: "textarea", default: "abracadabra" },
      { key: "base", label: "Logarithm base", type: "select", default: "2", choices: [{ value: "2", label: "2 · bits" }, { value: "2.718281828", label: "e · nats" }, { value: "10", label: "10 · hartleys" }] },
    ],
    presets: [{ label: "abracadabra", mode: "text", values: { input: "abracadabra", base: "2" } }, { label: "Fair four outcomes", mode: "probabilities", values: { input: "0.25, 0.25, 0.25, 0.25", base: "2" } }],
    compute: `(values, mode) => {
      const base = Number(values.base) || 2;
      let probabilities = [], labels = [];
      if (mode === "probabilities") {
        const raw = String(values.input || "").split(/[\\s,;]+/).map(Number).filter((value) => Number.isFinite(value) && value >= 0);
        const total = raw.reduce((sum, value) => sum + value, 0);
        probabilities = total ? raw.map((value) => value / total) : [];
        labels = raw.map((_, index) => "p" + (index + 1));
      } else {
        const counts = new Map();
        for (const symbol of [...String(values.input || "")]) counts.set(symbol, (counts.get(symbol) || 0) + 1);
        const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
        labels = [...counts.keys()].map((symbol) => symbol === " " ? "␠" : symbol);
        probabilities = [...counts.values()].map((count) => count / Math.max(1, total));
      }
      const entropy = probabilities.reduce((sum, p) => p > 0 ? sum - p * (Math.log(p) / Math.log(base)) : sum, 0);
      const maximum = probabilities.length > 1 ? Math.log(probabilities.length) / Math.log(base) : 0;
      return { result: entropy.toFixed(8) + (base === 2 ? " bits" : base === 10 ? " hartleys" : " nats"), caption: probabilities.length + " normalized outcome(s)", rows: [["Maximum entropy", maximum.toFixed(8)], ["Normalized entropy", maximum ? (entropy / maximum).toFixed(6) : "0"], ["Perplexity (base 2)", Math.pow(2, entropy * Math.log(base) / Math.log(2)).toFixed(6)]], table: { headers: ["Outcome", "Probability", "Information"], rows: probabilities.map((p, index) => [labels[index], p.toFixed(8), p > 0 ? (-Math.log(p) / Math.log(base)).toFixed(8) : "0"]) } };
    }`,
  }),
  base("sample-size-power-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "flask-conical",
    fields: [
      { key: "effect", label: "Standardized effect size (Cohen d)", type: "number", min: 0.0001, default: 0.5 },
      { key: "power", label: "Target power (%)", type: "select", default: "80", choices: [{ value: "80", label: "80%" }, { value: "90", label: "90%" }, { value: "95", label: "95%" }] },
      { key: "alpha", label: "Two-sided alpha", type: "select", default: "0.05", choices: [{ value: "0.10", label: "0.10" }, { value: "0.05", label: "0.05" }, { value: "0.01", label: "0.01" }] },
      { key: "groups", label: "Independent groups", type: "select", default: "2", choices: [{ value: "1", label: "One mean / paired difference" }, { value: "2", label: "Two equal independent groups" }] },
    ],
    presets: [{ label: "d=0.5, 80% power", values: { effect: 0.5, power: "80", alpha: "0.05", groups: "2" } }],
    note: "Large-sample normal approximation for a standardized mean effect. Attrition, unequal groups, clustering, repeated measures, noncompliance, multiple outcomes, and discrete tests require a tailored power analysis.",
    compute: `(values) => {
      const d = Math.abs(Number(values.effect)), zAlpha = { "0.10": 1.644854, "0.05": 1.959964, "0.01": 2.575829 }[values.alpha] || 1.959964, zPower = { "80": 0.841621, "90": 1.281552, "95": 1.644854 }[values.power] || 0.841621, groups = Number(values.groups);
      if (!(d > 0)) return { result: "—", caption: "Effect size must be positive" };
      const multiplier = groups === 2 ? 2 : 1;
      const perGroup = Math.ceil(multiplier * Math.pow((zAlpha + zPower) / d, 2));
      return { result: perGroup + (groups === 2 ? " per group" : " observations"), caption: groups === 2 ? (perGroup * 2) + " total for two equal groups" : "One-sample / paired approximation", rows: [["Effect size", d], ["Power", values.power + "%"], ["Two-sided alpha", values.alpha], ["z alpha", zAlpha], ["z power", zPower], ["Suggested +15% attrition", Math.ceil(perGroup / 0.85) + (groups === 2 ? " per group" : "")]] };
    }`,
  }),
  base("bootstrap-confidence-workbench", {
    category: ["Education & Science", "Calculator"],
    icon: "repeat-2",
    fields: [
      { key: "data", label: "Numeric sample", type: "textarea", default: "12, 15, 18, 19, 22, 25, 27, 31" },
      { key: "iterations", label: "Bootstrap iterations", type: "number", min: 100, max: 20000, default: 2000 },
      { key: "confidence", label: "Confidence level (%)", type: "select", default: "95", choices: [{ value: "90", label: "90%" }, { value: "95", label: "95%" }, { value: "99", label: "99%" }] },
      { key: "seed", label: "Seed", type: "number", default: 104729 },
    ],
    presets: [{ label: "Eight values", values: { data: "12, 15, 18, 19, 22, 25, 27, 31", iterations: 2000, confidence: "95", seed: 104729 } }],
    note: "Seeded percentile bootstrap for the sample mean. Dependence, time series, clusters, small or biased samples, extreme tails, and parameter boundaries may need a different bootstrap design or BCa interval.",
    compute: `(values) => {
      const data = String(values.data || "").split(/[\\s,;]+/).map(Number).filter(Number.isFinite);
      if (!data.length) return { result: "—", caption: "Enter numeric sample values" };
      const iterations = Math.max(100, Math.min(20000, Math.round(Number(values.iterations) || 1000)));
      let seed = (Math.round(Number(values.seed)) >>> 0) || 1;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      const means = [];
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        let total = 0;
        for (let index = 0; index < data.length; index += 1) total += data[Math.floor(random() * data.length)];
        means.push(total / data.length);
      }
      means.sort((a, b) => a - b);
      const alpha = (100 - Number(values.confidence)) / 200;
      const quantile = (p) => means[Math.min(means.length - 1, Math.max(0, Math.floor(p * (means.length - 1))))];
      const sampleMean = data.reduce((sum, value) => sum + value, 0) / data.length;
      return { result: quantile(alpha).toFixed(6) + " to " + quantile(1 - alpha).toFixed(6), caption: values.confidence + "% seeded percentile interval for mean", rows: [["Sample size", data.length], ["Sample mean", sampleMean.toFixed(6)], ["Iterations", iterations], ["Seed", values.seed], ["Bootstrap median", quantile(0.5).toFixed(6)]] };
    }`,
  }),
  base("probability-distribution-fitter", {
    category: ["Education & Science", "Calculator"],
    icon: "chart-spline",
    fields: [
      { key: "data", label: "Numeric sample", type: "textarea", default: "4.2, 5.1, 5.4, 5.8, 6.0, 6.3, 6.9, 7.2" },
      { key: "positive_only", label: "Compare positive-only models", type: "toggle", default: true, checkboxLabel: "Include exponential and lognormal when all values are positive" },
    ],
    presets: [{ label: "Positive sample", values: { data: "4.2, 5.1, 5.4, 5.8, 6.0, 6.3, 6.9, 7.2", positive_only: true } }],
    note: "Method-of-moments parameters and AIC-style log-likelihood ranking for exploratory comparison. It is not a goodness-of-fit test and does not validate independence, censoring, tails, mixtures, or model assumptions.",
    compute: `(values) => {
      const data = String(values.data || "").split(/[\\s,;]+/).map(Number).filter(Number.isFinite);
      if (data.length < 2) return { result: "—", caption: "Enter at least two numbers" };
      const n = data.length, mean = data.reduce((sum, value) => sum + value, 0) / n, variance = data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n, sd = Math.sqrt(Math.max(variance, 1e-12));
      const normalLL = data.reduce((sum, value) => sum - Math.log(sd * Math.sqrt(2 * Math.PI)) - ((value - mean) ** 2) / (2 * variance), 0);
      const models = [["Normal", mean.toFixed(5) + ", " + sd.toFixed(5), (2 * 2 - 2 * normalLL).toFixed(4)]];
      if (values.positive_only && data.every((value) => value > 0)) {
        const lambda = 1 / mean, expLL = data.reduce((sum, value) => sum + Math.log(lambda) - lambda * value, 0);
        const logs = data.map(Math.log), logMean = logs.reduce((sum, value) => sum + value, 0) / n, logVar = logs.reduce((sum, value) => sum + (value - logMean) ** 2, 0) / n, logSd = Math.sqrt(Math.max(logVar, 1e-12));
        const logLL = data.reduce((sum, value) => sum - Math.log(value * logSd * Math.sqrt(2 * Math.PI)) - ((Math.log(value) - logMean) ** 2) / (2 * logVar), 0);
        models.push(["Exponential", "λ=" + lambda.toFixed(5), (2 - 2 * expLL).toFixed(4)]);
        models.push(["Lognormal", "μ=" + logMean.toFixed(5) + ", σ=" + logSd.toFixed(5), (4 - 2 * logLL).toFixed(4)]);
      }
      models.sort((a, b) => Number(a[2]) - Number(b[2]));
      return { result: models[0][0] + " ranks first by entered-data AIC", caption: "Lower AIC is better only within these candidate models", rows: [["Observations", n], ["Mean", mean.toFixed(6)], ["Std. deviation", sd.toFixed(6)]], table: { headers: ["Model", "Estimated parameters", "AIC"], rows: models } };
    }`,
  }),
  base("monte-carlo-risk-scenario-lab", {
    category: ["Finance", "Calculator"],
    icon: "dice-5",
    fields: [
      { key: "starting", label: "Starting value", type: "number", default: 100000 },
      { key: "mean_return", label: "Mean annual return (%)", type: "number", default: 7 },
      { key: "volatility", label: "Annual volatility (%)", type: "number", min: 0, default: 18 },
      { key: "years", label: "Years", type: "number", min: 1, max: 100, default: 10 },
      { key: "simulations", label: "Simulations", type: "number", min: 100, max: 20000, default: 5000 },
      { key: "seed", label: "Seed", type: "number", default: 424242 },
    ],
    presets: [{ label: "10-year scenario", values: { starting: 100000, mean_return: 7, volatility: 18, years: 10, simulations: 5000, seed: 424242 } }],
    note: "Seeded lognormal illustration with constant independent annual return/volatility inputs. Real returns are not normally distributed or stable; no result is a forecast or investment advice.",
    compute: `(values) => {
      const starting = Number(values.starting), mean = Number(values.mean_return) / 100, vol = Math.max(0, Number(values.volatility) / 100), years = Math.max(1, Math.round(Number(values.years) || 1)), simulations = Math.max(100, Math.min(20000, Math.round(Number(values.simulations) || 1000)));
      let seed = (Math.round(Number(values.seed)) >>> 0) || 1;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return Math.max(1e-12, seed / 4294967296); };
      const normal = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
      const outcomes = [];
      for (let run = 0; run < simulations; run += 1) {
        let value = starting;
        for (let year = 0; year < years; year += 1) value *= Math.exp((mean - 0.5 * vol * vol) + vol * normal());
        outcomes.push(value);
      }
      outcomes.sort((a, b) => a - b);
      const q = (p) => outcomes[Math.floor(p * (outcomes.length - 1))];
      const lossChance = outcomes.filter((value) => value < starting).length / outcomes.length;
      return { result: q(0.5).toFixed(2) + " median outcome", caption: simulations + " seeded paths over " + years + " years", rows: [["5th percentile", q(0.05).toFixed(2)], ["25th percentile", q(0.25).toFixed(2)], ["75th percentile", q(0.75).toFixed(2)], ["95th percentile", q(0.95).toFixed(2)], ["Chance below start", (lossChance * 100).toFixed(2) + "%"], ["Seed", values.seed]] };
    }`,
  }),
  base("correlation-simpsons-paradox-visualizer", {
    category: ["Education & Science", "Calculator"],
    icon: "chart-scatter",
    fields: [
      { key: "data", label: "Grouped x/y observations", type: "textarea", default: "A | 1 | 4\nA | 2 | 5\nA | 3 | 6\nB | 6 | 1\nB | 7 | 2\nB | 8 | 3", hint: "Group | x | y" },
      { key: "minimum", label: "Minimum observations per group", type: "number", min: 2, default: 2 },
    ],
    presets: [{ label: "Reversal example", values: { data: "A | 1 | 4\nA | 2 | 5\nA | 3 | 6\nB | 6 | 1\nB | 7 | 2\nB | 8 | 3", minimum: 2 } }],
    note: "Exploratory Pearson correlations. Correlation is not causation; small samples, nonlinear relationships, outliers, weighting, measurement error, and omitted variables can dominate the result.",
    compute: `(values) => {
      const rows = String(values.data || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [group, x, y] = line.split("|").map((cell) => cell.trim()); return { group, x: Number(x), y: Number(y) }; }).filter((row) => row.group && Number.isFinite(row.x) && Number.isFinite(row.y));
      const corr = (items) => { if (items.length < 2) return 0; const mx = items.reduce((sum, row) => sum + row.x, 0) / items.length, my = items.reduce((sum, row) => sum + row.y, 0) / items.length; const num = items.reduce((sum, row) => sum + (row.x - mx) * (row.y - my), 0), dx = Math.sqrt(items.reduce((sum, row) => sum + (row.x - mx) ** 2, 0)), dy = Math.sqrt(items.reduce((sum, row) => sum + (row.y - my) ** 2, 0)); return dx && dy ? num / (dx * dy) : 0; };
      const groups = new Map();
      for (const row of rows) groups.set(row.group, [...(groups.get(row.group) || []), row]);
      const minimum = Math.max(2, Number(values.minimum) || 2);
      const groupRows = [...groups.entries()].filter(([, items]) => items.length >= minimum).map(([group, items]) => [group, items.length, corr(items).toFixed(6)]);
      const aggregate = corr(rows);
      const groupSigns = groupRows.map((row) => Math.sign(Number(row[2]))).filter(Boolean);
      const reversal = groupSigns.length && groupSigns.every((sign) => sign === groupSigns[0]) && Math.sign(aggregate) && Math.sign(aggregate) !== groupSigns[0];
      return { result: reversal ? "Possible Simpson’s-paradox reversal" : "No full sign reversal detected", caption: "Aggregate r = " + aggregate.toFixed(6), rows: [["Observations", rows.length], ["Groups", groups.size], ["Aggregate correlation", aggregate.toFixed(6)]], table: { headers: ["Group", "n", "Within-group Pearson r"], rows: groupRows }, list: ["Inspect group definitions, sample sizes, plots, weights, and plausible confounders before interpreting any correlation."] };
    }`,
  }),
  base("three-phase-power-calculator", {
    category: ["Electronics", "Calculator"],
    icon: "zap",
    fields: [
      { key: "voltage", label: "Line-to-line voltage (V)", type: "number", min: 0, default: 400 },
      { key: "current", label: "Line current (A)", type: "number", min: 0, default: 50 },
      { key: "power_factor", label: "Power factor", type: "number", min: 0, max: 1, default: 0.9 },
      { key: "efficiency", label: "Efficiency (%)", type: "number", min: 0, max: 100, default: 95 },
    ],
    presets: [{ label: "400 V · 50 A", values: { voltage: 400, current: 50, power_factor: 0.9, efficiency: 95 } }],
    note: "Balanced three-phase estimate using line voltage/current. Confirm system topology, harmonics, waveform, phase balance, motor duty, cable limits, and applicable electrical standards with a qualified professional.",
    compute: `(values) => {
      const V = Math.max(0, Number(values.voltage) || 0), I = Math.max(0, Number(values.current) || 0), pf = Math.max(0, Math.min(1, Number(values.power_factor) || 0)), efficiency = Math.max(0, Math.min(1, Number(values.efficiency) / 100));
      const va = Math.sqrt(3) * V * I, watts = va * pf, output = watts * efficiency, reactive = Math.sqrt(Math.max(0, va * va - watts * watts));
      return { result: (watts / 1000).toFixed(4) + " kW input", rows: [["Apparent power", (va / 1000).toFixed(4) + " kVA"], ["Reactive power", (reactive / 1000).toFixed(4) + " kVAr"], ["Estimated output", (output / 1000).toFixed(4) + " kW"], ["Power factor", pf], ["Efficiency", (efficiency * 100).toFixed(2) + "%"]] };
    }`,
  }),
  base("voltage-drop-wire-gauge-calculator", {
    category: ["Electronics", "Calculator"],
    icon: "cable",
    fields: [
      { key: "system", label: "Circuit", type: "select", default: "dc", choices: [{ value: "dc", label: "DC / single-phase 2-wire" }, { value: "three", label: "Balanced three-phase" }] },
      { key: "voltage", label: "Nominal voltage (V)", type: "number", min: 0.1, default: 230 },
      { key: "current", label: "Current (A)", type: "number", min: 0, default: 20 },
      { key: "length", label: "One-way length (m)", type: "number", min: 0, default: 30 },
      { key: "material", label: "Conductor", type: "select", default: "copper", choices: [{ value: "copper", label: "Copper" }, { value: "aluminum", label: "Aluminium" }] },
      { key: "area", label: "Conductor area (mm²)", type: "number", min: 0.01, default: 4 },
      { key: "limit", label: "Target maximum drop (%)", type: "number", min: 0.1, default: 3 },
    ],
    presets: [{ label: "230 V copper", values: { system: "dc", voltage: 230, current: 20, length: 30, material: "copper", area: 4, limit: 3 } }],
    note: "Resistance-only room-temperature estimate. It does not size a conductor for ampacity, temperature, insulation, grouping, fault current, starting current, reactance, terminals, or local code.",
    compute: `(values) => {
      const V = Number(values.voltage), I = Math.max(0, Number(values.current) || 0), L = Math.max(0, Number(values.length) || 0), area = Number(values.area), rho = values.material === "aluminum" ? 0.0282 : 0.0175, factor = values.system === "three" ? Math.sqrt(3) : 2;
      if (!(V > 0 && area > 0)) return { result: "—", caption: "Voltage and conductor area must be positive" };
      const resistance = rho * factor * L / area, drop = I * resistance, percent = drop / V * 100, limit = Math.max(0.1, Number(values.limit) || 3), requiredArea = rho * factor * L * I / (V * limit / 100);
      return { result: drop.toFixed(4) + " V drop", caption: percent.toFixed(3) + "% · " + (percent <= limit ? "within entered target" : "above entered target"), rows: [["Loop/equivalent resistance", resistance.toFixed(6) + " Ω"], ["Load voltage", (V - drop).toFixed(4) + " V"], ["Entered area", area + " mm²"], ["Minimum area for target (resistance only)", requiredArea.toFixed(3) + " mm²"], ["Target", limit + "%"]] };
    }`,
  }),
  base("rlc-resonance-filter-calculator", {
    category: ["Electronics", "Calculator"],
    icon: "audio-waveform",
    fields: [
      { key: "resistance", label: "Resistance R (Ω)", type: "number", min: 0, default: 50 },
      { key: "inductance", label: "Inductance L (mH)", type: "number", min: 0.0001, default: 10 },
      { key: "capacitance", label: "Capacitance C (µF)", type: "number", min: 0.0001, default: 1 },
      { key: "topology", label: "Topology", type: "select", default: "series", choices: [{ value: "series", label: "Series RLC" }, { value: "parallel", label: "Parallel RLC approximation" }] },
    ],
    presets: [{ label: "50 Ω · 10 mH · 1 µF", values: { resistance: 50, inductance: 10, capacitance: 1, topology: "series" } }],
    compute: `(values) => {
      const R = Math.max(0, Number(values.resistance) || 0), L = Number(values.inductance) / 1000, C = Number(values.capacitance) / 1000000;
      if (!(L > 0 && C > 0)) return { result: "—", caption: "L and C must be positive" };
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const q = values.topology === "parallel" ? (R ? R * Math.sqrt(C / L) : 0) : (R ? Math.sqrt(L / C) / R : 0);
      const bandwidth = q ? f0 / q : 0, lower = Math.max(0, f0 - bandwidth / 2), upper = f0 + bandwidth / 2;
      return { result: f0.toFixed(4) + " Hz resonance", caption: values.topology + " approximation", rows: [["Angular frequency", (2 * Math.PI * f0).toFixed(4) + " rad/s"], ["Q factor", q.toFixed(5)], ["Bandwidth", bandwidth.toFixed(4) + " Hz"], ["Approx. lower / upper", lower.toFixed(4) + " / " + upper.toFixed(4) + " Hz"], ["Characteristic impedance", Math.sqrt(L / C).toFixed(4) + " Ω"]] };
    }`,
  }),
  base("e-series-component-finder", {
    category: ["Electronics", "Calculator"],
    icon: "resistor",
    fields: [
      { key: "target", label: "Target value (Ω, F, or H)", type: "number", min: 0.000000001, default: 4720 },
      { key: "series", label: "Preferred-number series", type: "select", default: "24", choices: [{ value: "6", label: "E6" }, { value: "12", label: "E12" }, { value: "24", label: "E24" }, { value: "48", label: "E48" }, { value: "96", label: "E96" }] },
    ],
    presets: [{ label: "4.72 kΩ in E24", values: { target: 4720, series: "24" } }],
    compute: `(values) => {
      const target = Number(values.target), count = Number(values.series);
      if (!(target > 0 && count > 0)) return { result: "—", caption: "Target and series must be positive" };
      const decade = Math.floor(Math.log10(target)), candidates = [];
      for (let d = decade - 1; d <= decade + 1; d += 1) for (let index = 0; index < count; index += 1) candidates.push(Math.pow(10, d) * Math.pow(10, index / count));
      candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
      const unique = [...new Set(candidates.map((value) => Number(value.toPrecision(count <= 24 ? 2 : 3))))].sort((a, b) => Math.abs(a - target) - Math.abs(b - target)).slice(0, 6);
      const closest = unique[0];
      return { result: closest.toLocaleString(undefined, { maximumSignificantDigits: count <= 24 ? 2 : 3 }) + " nearest E" + count + " value", caption: (((closest - target) / target) * 100).toFixed(4) + "% error", rows: [["Target", target], ["Nearest below", Math.max(...unique.filter((value) => value <= target), 0)], ["Nearest above", Math.min(...unique.filter((value) => value >= target), Number.MAX_SAFE_INTEGER)]], table: { headers: ["Candidate", "Error %"], rows: unique.map((value) => [value, (((value - target) / target) * 100).toFixed(5)]) } };
    }`,
  }),
  base("beam-deflection-stress-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "ruler",
    fields: [
      { key: "load_case", label: "Simply supported load case", type: "select", default: "point", choices: [{ value: "point", label: "Center point load" }, { value: "uniform", label: "Uniform load over full span" }] },
      { key: "load", label: "Load P (N) or w (N/m)", type: "number", min: 0, default: 1000 },
      { key: "length", label: "Span L (m)", type: "number", min: 0.0001, default: 2 },
      { key: "elasticity", label: "Elastic modulus E (GPa)", type: "number", min: 0.0001, default: 200 },
      { key: "inertia", label: "Second moment I (cm⁴)", type: "number", min: 0.0001, default: 500 },
      { key: "section_modulus", label: "Section modulus Z (cm³)", type: "number", min: 0.0001, default: 100 },
    ],
    presets: [{ label: "Steel center load", values: { load_case: "point", load: 1000, length: 2, elasticity: 200, inertia: 500, section_modulus: 100 } }],
    note: "Linear elastic, small-deflection, ideal simply supported formulas. It is not a structural design check; verify supports, load combinations, stability, shear, local effects, fatigue, safety factors, and governing code.",
    compute: `(values) => {
      const load = Math.max(0, Number(values.load) || 0), L = Number(values.length), E = Number(values.elasticity) * 1e9, I = Number(values.inertia) * 1e-8, Z = Number(values.section_modulus) * 1e-6;
      if (!(L > 0 && E > 0 && I > 0 && Z > 0)) return { result: "—", caption: "L, E, I, and Z must be positive" };
      const point = values.load_case === "point";
      const moment = point ? load * L / 4 : load * L * L / 8;
      const deflection = point ? load * L ** 3 / (48 * E * I) : 5 * load * L ** 4 / (384 * E * I);
      const stress = moment / Z;
      return { result: (deflection * 1000).toFixed(6) + " mm maximum deflection", caption: point ? "Center point load" : "Uniform load", rows: [["Maximum moment", moment.toFixed(4) + " N·m"], ["Bending stress", (stress / 1e6).toFixed(4) + " MPa"], ["Span / deflection", deflection ? (L / deflection).toFixed(1) : "—"], ["E", (E / 1e9).toFixed(3) + " GPa"], ["I", (I * 1e8).toFixed(3) + " cm⁴"]] };
    }`,
  }),
  base("reynolds-number-pipe-flow-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "waves",
    fields: [
      { key: "density", label: "Fluid density (kg/m³)", type: "number", min: 0.0001, default: 998 },
      { key: "viscosity", label: "Dynamic viscosity (mPa·s)", type: "number", min: 0.0001, default: 1.002 },
      { key: "velocity", label: "Mean velocity (m/s)", type: "number", min: 0, default: 2 },
      { key: "diameter", label: "Pipe inside diameter (mm)", type: "number", min: 0.0001, default: 50 },
      { key: "length", label: "Pipe length (m)", type: "number", min: 0, default: 20 },
      { key: "roughness", label: "Absolute roughness (mm)", type: "number", min: 0, default: 0.045 },
    ],
    presets: [{ label: "Water in 50 mm pipe", values: { density: 998, viscosity: 1.002, velocity: 2, diameter: 50, length: 20, roughness: 0.045 } }],
    note: "Steady, fully developed single-phase pipe-flow estimate using Darcy–Weisbach and a Swamee–Jain turbulent approximation. Verify fittings, entrances, elevation, temperature, compressibility, cavitation, and code.",
    compute: `(values) => {
      const rho = Number(values.density), mu = Number(values.viscosity) / 1000, velocity = Math.max(0, Number(values.velocity) || 0), diameter = Number(values.diameter) / 1000, length = Math.max(0, Number(values.length) || 0), roughness = Math.max(0, Number(values.roughness) || 0) / 1000;
      if (!(rho > 0 && mu > 0 && diameter > 0)) return { result: "—", caption: "Density, viscosity, and diameter must be positive" };
      const Re = rho * velocity * diameter / mu;
      const regime = Re < 2300 ? "Laminar" : Re < 4000 ? "Transitional" : "Turbulent";
      const friction = Re > 0 ? (Re < 2300 ? 64 / Re : 0.25 / Math.pow(Math.log10(roughness / (3.7 * diameter) + 5.74 / Math.pow(Re, 0.9)), 2)) : 0;
      const pressureDrop = friction * (length / diameter) * (rho * velocity * velocity / 2), headLoss = pressureDrop / (rho * 9.80665), flow = velocity * Math.PI * diameter * diameter / 4;
      return { result: Re.toFixed(2) + " Reynolds number", caption: regime, rows: [["Darcy friction factor", friction.toFixed(7)], ["Pressure drop", pressureDrop.toFixed(3) + " Pa"], ["Head loss", headLoss.toFixed(5) + " m"], ["Volumetric flow", (flow * 1000).toFixed(5) + " L/s"], ["Relative roughness", (roughness / diameter).toFixed(7)]] };
    }`,
  }),
  base("bolt-torque-preload-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "nut",
    fields: [
      { key: "diameter", label: "Nominal diameter (mm)", type: "number", min: 0.0001, default: 10 },
      { key: "torque", label: "Applied torque (N·m)", type: "number", min: 0, default: 45 },
      { key: "k_factor", label: "Nut factor K", type: "number", min: 0.01, default: 0.2 },
      { key: "proof_load", label: "Proof load target (kN)", type: "number", min: 0, default: 40 },
    ],
    presets: [{ label: "M10 · 45 N·m", values: { diameter: 10, torque: 45, k_factor: 0.2, proof_load: 40 } }],
    note: "Simplified T=K·F·d estimate. Real preload varies greatly with threads, lubrication, coatings, reuse, tightening method, embedment, joint stiffness, and temperature; use approved fastener procedures.",
    compute: `(values) => {
      const diameter = Number(values.diameter) / 1000, torque = Math.max(0, Number(values.torque) || 0), K = Number(values.k_factor), proof = Math.max(0, Number(values.proof_load) || 0) * 1000;
      if (!(diameter > 0 && K > 0)) return { result: "—", caption: "Diameter and K factor must be positive" };
      const preload = torque / (K * diameter), targetTorque = K * proof * diameter;
      return { result: (preload / 1000).toFixed(4) + " kN estimated preload", rows: [["Applied torque", torque.toFixed(3) + " N·m"], ["Nut factor K", K], ["Entered proof target", (proof / 1000).toFixed(3) + " kN"], ["Torque for entered target", targetTorque.toFixed(3) + " N·m"], ["Estimated % of entered target", proof ? (preload / proof * 100).toFixed(2) + "%" : "—"]] };
    }`,
  }),
  base("ideal-gas-law-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "flask-round",
    fields: [
      { key: "solve", label: "Solve for", type: "select", default: "pressure", choices: [{ value: "pressure", label: "Pressure P" }, { value: "volume", label: "Volume V" }, { value: "moles", label: "Amount n" }, { value: "temperature", label: "Temperature T" }] },
      { key: "pressure", label: "Pressure P (kPa)", type: "number", default: 101.325 },
      { key: "volume", label: "Volume V (L)", type: "number", default: 24.465 },
      { key: "moles", label: "Amount n (mol)", type: "number", default: 1 },
      { key: "temperature", label: "Temperature T (K)", type: "number", default: 298.15 },
    ],
    presets: [{ label: "1 mol at 25°C", values: { solve: "pressure", pressure: 101.325, volume: 24.465, moles: 1, temperature: 298.15 } }],
    note: "Ideal-gas approximation with R=8.314462618 kPa·L·mol⁻¹·K⁻¹. Real gases can deviate at high pressure, low temperature, phase boundaries, or reactive conditions.",
    compute: `(values) => {
      const R = 8.314462618, P = Number(values.pressure), V = Number(values.volume), n = Number(values.moles), T = Number(values.temperature);
      let result, unit;
      if (values.solve === "pressure") { if (!(V > 0)) return { result: "—", caption: "Volume must be positive" }; result = n * R * T / V; unit = "kPa"; }
      else if (values.solve === "volume") { if (!(P > 0)) return { result: "—", caption: "Pressure must be positive" }; result = n * R * T / P; unit = "L"; }
      else if (values.solve === "moles") { if (!(R * T > 0)) return { result: "—", caption: "Temperature must be positive" }; result = P * V / (R * T); unit = "mol"; }
      else { if (!(n * R > 0)) return { result: "—", caption: "Moles must be positive" }; result = P * V / (n * R); unit = "K"; }
      return { result: result.toFixed(8) + " " + unit, caption: "PV = nRT", rows: [["P", P + " kPa"], ["V", V + " L"], ["n", n + " mol"], ["T", T + " K"], ["R", R + " kPa·L/(mol·K)"]] };
    }`,
  }),
  base("dilution-molarity-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "beaker",
    modes: [{ id: "dilution", label: "C₁V₁ = C₂V₂" }, { id: "molarity", label: "Molarity from mass" }],
    fields: [
      { key: "c1", label: "Stock concentration C₁", type: "number", min: 0, default: 2, mode: "dilution" },
      { key: "v1", label: "Stock volume V₁ (mL)", type: "number", min: 0, default: 25, mode: "dilution" },
      { key: "c2", label: "Final concentration C₂", type: "number", min: 0.0001, default: 0.5, mode: "dilution" },
      { key: "mass", label: "Solute mass (g)", type: "number", min: 0, default: 5.844, mode: "molarity" },
      { key: "molar_mass", label: "Molar mass (g/mol)", type: "number", min: 0.0001, default: 58.44, mode: "molarity" },
      { key: "volume_l", label: "Solution volume (L)", type: "number", min: 0.0001, default: 1, mode: "molarity" },
    ],
    presets: [{ label: "Dilute 2 M to 0.5 M", mode: "dilution", values: { c1: 2, v1: 25, c2: 0.5 } }, { label: "NaCl example", mode: "molarity", values: { mass: 5.844, molar_mass: 58.44, volume_l: 1 } }],
    note: "Arithmetic aid only. Follow laboratory safety, compatibility, volumetric-glassware, temperature, purity, hydration, significant-figure, and hazardous-material procedures.",
    compute: `(values, mode) => {
      if (mode === "molarity") {
        const mass = Number(values.mass), molarMass = Number(values.molar_mass), volume = Number(values.volume_l);
        if (!(molarMass > 0 && volume > 0)) return { result: "—", caption: "Molar mass and volume must be positive" };
        const moles = mass / molarMass, molarity = moles / volume;
        return { result: molarity.toFixed(8) + " mol/L", rows: [["Moles", moles.toFixed(8)], ["Mass", mass + " g"], ["Molar mass", molarMass + " g/mol"], ["Volume", volume + " L"]] };
      }
      const c1 = Number(values.c1), v1 = Number(values.v1), c2 = Number(values.c2);
      if (!(c2 > 0)) return { result: "—", caption: "Final concentration must be positive" };
      const v2 = c1 * v1 / c2, diluent = v2 - v1;
      return { result: v2.toFixed(8) + " mL final volume", rows: [["Stock volume", v1 + " mL"], ["Diluent to add", diluent.toFixed(8) + " mL"], ["Dilution factor", c1 && c2 ? (c1 / c2).toFixed(8) : "—"], ["C₁V₁", (c1 * v1).toFixed(8)]] };
    }`,
  }),
  base("radioactive-decay-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "atom",
    fields: [
      { key: "initial", label: "Initial quantity / activity", type: "number", min: 0, default: 100 },
      { key: "half_life", label: "Half-life", type: "number", min: 0.0001, default: 5 },
      { key: "time", label: "Elapsed time (same units)", type: "number", min: 0, default: 12 },
      { key: "target", label: "Target remaining quantity", type: "number", min: 0, default: 10 },
    ],
    presets: [{ label: "100 over 12 years", values: { initial: 100, half_life: 5, time: 12, target: 10 } }],
    note: "Single-isotope exponential decay estimate. Real samples may involve decay chains, branching, detector efficiency, background, shielding, contamination controls, or regulated handling.",
    compute: `(values) => {
      const initial = Math.max(0, Number(values.initial) || 0), half = Number(values.half_life), time = Math.max(0, Number(values.time) || 0), target = Math.max(0, Number(values.target) || 0);
      if (!(half > 0)) return { result: "—", caption: "Half-life must be positive" };
      const lambda = Math.log(2) / half, remaining = initial * Math.exp(-lambda * time), fraction = initial ? remaining / initial : 0;
      const targetTime = initial > 0 && target > 0 && target <= initial ? Math.log(initial / target) / lambda : 0;
      return { result: remaining.toFixed(8) + " remaining", caption: (fraction * 100).toFixed(6) + "% of initial", rows: [["Decay constant", lambda.toFixed(8) + " per time unit"], ["Elapsed half-lives", (time / half).toFixed(6)], ["Decayed quantity", (initial - remaining).toFixed(8)], ["Time to entered target", targetTime ? targetTime.toFixed(8) : "Target must be >0 and ≤ initial"]] };
    }`,
  }),
  base("buffer-ph-calculator", {
    category: ["Education & Science", "Calculator"],
    icon: "flask-conical",
    fields: [
      { key: "pka", label: "Acid pKa", type: "number", default: 4.76 },
      { key: "acid", label: "Acid concentration or moles", type: "number", min: 0.000000001, default: 0.1 },
      { key: "base", label: "Conjugate-base concentration or moles", type: "number", min: 0.000000001, default: 0.1 },
      { key: "temperature", label: "Temperature note (°C)", type: "number", default: 25 },
    ],
    presets: [{ label: "Equal acetate buffer", values: { pka: 4.76, acid: 0.1, base: 0.1, temperature: 25 } }],
    note: "Henderson–Hasselbalch approximation using entered activities as concentrations/moles. It ignores activity coefficients, dilution, multiple equilibria, ionic strength, and temperature-dependent pKa unless you supply it.",
    compute: `(values) => {
      const pKa = Number(values.pka), acid = Number(values.acid), base = Number(values.base), temperature = Number(values.temperature);
      if (!(acid > 0 && base > 0)) return { result: "—", caption: "Acid and base quantities must be positive" };
      const ratio = base / acid, pH = pKa + Math.log10(ratio);
      return { result: pH.toFixed(6) + " estimated pH", caption: "Henderson–Hasselbalch at entered pKa", rows: [["pKa", pKa], ["Base / acid ratio", ratio.toFixed(8)], ["Acid fraction", (acid / (acid + base)).toFixed(6)], ["Base fraction", (base / (acid + base)).toFixed(6)], ["Temperature note", temperature + " °C"]] };
    }`,
  }),
  base("uncertainty-propagation-workbench", {
    category: ["Education & Science", "Calculator"],
    icon: "sigma",
    fields: [
      { key: "components", label: "Product/power components", type: "textarea", default: "Length | 10 | 0.1 | 2\nWidth | 5 | 0.05 | 1\nScale | 2 | 0.02 | -1", hint: "Name | value | standard uncertainty | exponent" },
      { key: "correlation", label: "Assume independent inputs", type: "toggle", default: true, checkboxLabel: "Use root-sum-square relative uncertainty" },
      { key: "coverage", label: "Coverage factor k", type: "number", min: 0.1, default: 2 },
    ],
    presets: [{ label: "Area-style product", values: { components: "Length | 10 | 0.1 | 1\nWidth | 5 | 0.05 | 1", correlation: true, coverage: 2 } }],
    note: "First-order propagation for y=∏xᵃ. The independent mode omits covariance; the conservative mode sums absolute relative terms. Nonlinearity and non-normal inputs may require a validated Monte Carlo model.",
    compute: `(values) => {
      const rows = String(values.components || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [name, value, uncertainty, exponent] = line.split("|").map((cell) => cell.trim()); return { name, value: Number(value), uncertainty: Math.abs(Number(uncertainty)), exponent: Number(exponent) }; }).filter((row) => row.name && Number.isFinite(row.value) && row.value !== 0 && Number.isFinite(row.uncertainty) && Number.isFinite(row.exponent));
      if (!rows.length) return { result: "—", caption: "Enter valid non-zero components" };
      const result = rows.reduce((product, row) => product * Math.pow(row.value, row.exponent), 1);
      const terms = rows.map((row) => Math.abs(row.exponent * row.uncertainty / row.value));
      const relative = values.correlation ? Math.sqrt(terms.reduce((sum, term) => sum + term * term, 0)) : terms.reduce((sum, term) => sum + term, 0);
      const standard = Math.abs(result) * relative, coverage = Math.max(0.1, Number(values.coverage) || 2);
      return { result: result.toFixed(8) + " ± " + (standard * coverage).toFixed(8), caption: "Expanded uncertainty with k=" + coverage, rows: [["Combined standard uncertainty", standard.toFixed(8)], ["Relative standard uncertainty", (relative * 100).toFixed(6) + "%"], ["Components", rows.length], ["Independence assumed", values.correlation ? "Yes" : "No — conservative sum"]], table: { headers: ["Component", "Value", "u", "Exponent", "Relative contribution"], rows: rows.map((row, index) => [row.name, row.value, row.uncertainty, row.exponent, (terms[index] * 100).toFixed(6) + "%"]) } };
    }`,
  }),
  base("dimensional-consistency-checker", {
    category: ["Education & Science", "Developer"],
    icon: "brackets",
    fields: [
      { key: "left", label: "Left-side dimension vector", type: "text", default: "M1 L1 T-2" },
      { key: "right", label: "Right-side dimension vector", type: "text", default: "M1 L1 T-2" },
      { key: "symbols", label: "Allowed base symbols", type: "text", default: "M,L,T,I,Θ,N,J" },
    ],
    presets: [{ label: "Force = mass × acceleration", values: { left: "M1 L1 T-2", right: "M1 L1 T-2", symbols: "M,L,T,I,Θ,N,J" } }, { label: "Mismatch", values: { left: "L1", right: "L1 T-1", symbols: "M,L,T,I,Θ,N,J" } }],
    note: "Compares entered base-dimension exponents; it does not parse an algebraic equation or verify numerical unit conversions. Enter each side after reducing it to base dimensions.",
    compute: `(values) => {
      const allowed = String(values.symbols || "").split(/[\\s,;]+/).map((item) => item.trim()).filter(Boolean);
      const parse = (text) => {
        const map = new Map(allowed.map((symbol) => [symbol, 0]));
        const tokens = String(text || "").match(/([A-Za-zΘ]+)\\s*\\^?\\s*(-?\\d+(?:\\.\\d+)?)/g) || [];
        for (const token of tokens) { const match = token.match(/([A-Za-zΘ]+)\\s*\\^?\\s*(-?\\d+(?:\\.\\d+)?)/); if (match) map.set(match[1], Number(match[2])); }
        return map;
      };
      const left = parse(values.left), right = parse(values.right), symbols = [...new Set([...allowed, ...left.keys(), ...right.keys()])];
      const rows = symbols.map((symbol) => [symbol, left.get(symbol) || 0, right.get(symbol) || 0, (left.get(symbol) || 0) === (right.get(symbol) || 0) ? "Match" : "Mismatch"]);
      const mismatches = rows.filter((row) => row[3] === "Mismatch");
      return { result: mismatches.length ? "Dimensionally inconsistent" : "Dimension vectors match", caption: mismatches.length + " exponent mismatch(es)", table: { headers: ["Base dimension", "Left exponent", "Right exponent", "Status"], rows }, list: ["A matching dimension is necessary but not sufficient for a physically correct equation."] };
    }`,
  }),
  base("calibration-curve-lod-loq-workbench", {
    category: ["Education & Science", "Calculator"],
    icon: "chart-scatter",
    fields: [
      { key: "points", label: "Calibration points", type: "textarea", default: "0 | 0.02\n1 | 1.03\n2 | 2.05\n3 | 3.08\n4 | 4.02\n5 | 5.11", hint: "Concentration x | response y" },
      { key: "lod_factor", label: "LOD sigma factor", type: "number", min: 0, default: 3.3 },
      { key: "loq_factor", label: "LOQ sigma factor", type: "number", min: 0, default: 10 },
    ],
    presets: [{ label: "Six-point curve", values: { points: "0 | 0.02\n1 | 1.03\n2 | 2.05\n3 | 3.08\n4 | 4.02\n5 | 5.11", lod_factor: 3.3, loq_factor: 10 } }],
    note: "Unweighted ordinary least-squares and residual-standard-deviation illustration. Validated analytical methods may require blank SD, replicate low levels, weighting, heteroscedasticity checks, matrix effects, and jurisdiction-specific guidance.",
    compute: `(values) => {
      const points = String(values.points || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map(Number)).filter((row) => row.length >= 2 && row.every(Number.isFinite));
      if (points.length < 3) return { result: "—", caption: "Enter at least three valid x/y points" };
      const n = points.length, mx = points.reduce((sum, row) => sum + row[0], 0) / n, my = points.reduce((sum, row) => sum + row[1], 0) / n;
      const sxx = points.reduce((sum, row) => sum + (row[0] - mx) ** 2, 0), sxy = points.reduce((sum, row) => sum + (row[0] - mx) * (row[1] - my), 0);
      if (!sxx) return { result: "—", caption: "x values need variation" };
      const slope = sxy / sxx, intercept = my - slope * mx;
      const residuals = points.map((row) => row[1] - (intercept + slope * row[0])), sigma = Math.sqrt(residuals.reduce((sum, value) => sum + value * value, 0) / Math.max(1, n - 2));
      const syy = points.reduce((sum, row) => sum + (row[1] - my) ** 2, 0), r2 = syy ? 1 - residuals.reduce((sum, value) => sum + value * value, 0) / syy : 1;
      const lod = slope ? Number(values.lod_factor) * sigma / Math.abs(slope) : 0, loq = slope ? Number(values.loq_factor) * sigma / Math.abs(slope) : 0;
      return { result: "LOD " + lod.toFixed(8) + " · LOQ " + loq.toFixed(8), caption: "y = " + slope.toFixed(8) + "x + " + intercept.toFixed(8), rows: [["Slope", slope.toFixed(8)], ["Intercept", intercept.toFixed(8)], ["Residual SD", sigma.toFixed(8)], ["R²", r2.toFixed(8)], ["Points", n]], table: { headers: ["x", "y", "Fitted y", "Residual"], rows: points.map((row, index) => [row[0], row[1], (intercept + slope * row[0]).toFixed(8), residuals[index].toFixed(8)]) } };
    }`,
  }),
  base("measurement-error-budget-builder", {
    category: ["Education & Science", "Calculator"],
    icon: "list-tree",
    fields: [
      { key: "sources", label: "Uncertainty sources", type: "textarea", default: "Repeatability | 0.12 | normal | 1\nResolution | 0.05 | rectangular | 1\nReference standard | 0.08 | normal-k2 | 1", hint: "Source | stated uncertainty | distribution | sensitivity coefficient" },
      { key: "coverage", label: "Output coverage factor k", type: "number", min: 0.1, default: 2 },
      { key: "correlated", label: "Treat sources as independent", type: "toggle", default: true, checkboxLabel: "Combine standard components by root-sum-square" },
    ],
    presets: [{ label: "Three sources", values: { sources: "Repeatability | 0.12 | normal | 1\nResolution | 0.05 | rectangular | 1\nReference standard | 0.08 | normal-k2 | 1", coverage: 2, correlated: true } }],
    note: "GUM-style first-order organizer. Distribution labels are simplified: rectangular÷√3, triangular÷√6, normal-k2÷2. Correlations, degrees of freedom, bias, drift, model uncertainty, and traceability need expert review.",
    compute: `(values) => {
      const rows = String(values.sources || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name = "Source", stated = "0", distribution = "normal", sensitivity = "1"] = line.split("|").map((cell) => cell.trim());
        const divisor = distribution === "rectangular" ? Math.sqrt(3) : distribution === "triangular" ? Math.sqrt(6) : distribution === "normal-k2" ? 2 : 1;
        const standard = Math.abs(Number(stated) || 0) / divisor, coefficient = Number(sensitivity) || 0, contribution = standard * coefficient;
        return { name, stated: Math.abs(Number(stated) || 0), distribution, coefficient, standard, contribution };
      });
      const combined = values.correlated ? Math.sqrt(rows.reduce((sum, row) => sum + row.contribution ** 2, 0)) : rows.reduce((sum, row) => sum + Math.abs(row.contribution), 0);
      const coverage = Math.max(0.1, Number(values.coverage) || 2), expanded = combined * coverage;
      return { result: expanded.toFixed(8) + " expanded uncertainty", caption: "Combined standard uncertainty " + combined.toFixed(8) + " · k=" + coverage, rows: [["Sources", rows.length], ["Independent RSS", values.correlated ? "Yes" : "No — absolute sum"], ["Coverage factor", coverage]], table: { headers: ["Source", "Stated u", "Distribution", "Sensitivity", "Standard u", "Contribution"], rows: rows.map((row) => [row.name, row.stated, row.distribution, row.coefficient, row.standard.toFixed(8), row.contribution.toFixed(8)]) } };
    }`,
  }),
  base("brand-deal-rate-calculator", {
    category: ["Business", "Marketing"],
    icon: "badge-dollar-sign",
    fields: [
      { key: "reach", label: "Expected qualified reach", type: "number", min: 0, default: 50000 },
      { key: "cpm", label: "Base CPM", type: "number", min: 0, default: 20 },
      { key: "deliverables", label: "Number of deliverables", type: "number", min: 1, default: 2 },
      { key: "production", label: "Production cost / time value", type: "number", min: 0, default: 500 },
      { key: "usage", label: "Paid usage uplift (%)", type: "number", min: 0, default: 30 },
      { key: "exclusivity", label: "Exclusivity uplift (%)", type: "number", min: 0, default: 20 },
      { key: "agency", label: "Agency / management fee (%)", type: "number", min: 0, default: 10 },
    ],
    presets: [{ label: "50k reach campaign", values: { reach: 50000, cpm: 20, deliverables: 2, production: 500, usage: 30, exclusivity: 20, agency: 10 } }],
    note: "Negotiation range, not a market quote or guarantee. Audience quality, rights, whitelisting, territory, duration, revisions, category conflict, taxes, and payment risk can materially change the rate.",
    compute: `(values) => {
      const reach = Math.max(0, Number(values.reach) || 0), cpm = Math.max(0, Number(values.cpm) || 0), deliverables = Math.max(1, Number(values.deliverables) || 1), production = Math.max(0, Number(values.production) || 0);
      const media = reach / 1000 * cpm * deliverables, subtotal = media + production, rights = subtotal * (Number(values.usage) + Number(values.exclusivity)) / 100, beforeFee = subtotal + rights, fee = beforeFee * Number(values.agency) / 100, total = beforeFee + fee;
      return { result: total.toFixed(2) + " estimated quote", caption: (total * 0.85).toFixed(2) + "–" + (total * 1.25).toFixed(2) + " conversation range", rows: [["Media value", media.toFixed(2)], ["Production", production.toFixed(2)], ["Usage + exclusivity", rights.toFixed(2)], ["Management fee", fee.toFixed(2)], ["Deliverables", deliverables]] };
    }`,
  }),
  delimitedWorkbench("creator-income-tracker", {
    headers: ["Date", "Client / platform", "Income stream", "Gross", "Fees", "Withholding", "Net received", "Invoice / payout ref"],
    sample: "2026-07-01 | Brand A | Sponsorship | 50000 | 5000 | 5000 | 40000 | INV-101\n2026-07-15 | Platform B | Ad revenue | 18000 | 900 | 1800 | 15300 | PAY-77",
    category: ["Business", "Finance"],
    icon: "wallet-cards",
  }),
  base("creator-contract-rights-timeline", {
    category: ["Business", "Text & Writing"],
    icon: "calendar-range",
    fields: [
      { key: "terms", label: "Contract rights and dates", type: "textarea", default: "Campaign starts 2026-08-01 and ends 2026-08-31. Brand may use the content in paid social for 90 days. Category exclusivity lasts 60 days after posting. Renewal option requires written agreement 15 days before expiry." },
      { key: "anchor", label: "Posting / effective date", type: "date", default: "2026-08-15" },
      { key: "usage_days", label: "Usage duration (days)", type: "number", min: 0, default: 90 },
      { key: "exclusive_days", label: "Exclusivity duration (days)", type: "number", min: 0, default: 60 },
      { key: "notice_days", label: "Renewal notice before expiry (days)", type: "number", min: 0, default: 15 },
    ],
    presets: [{ label: "90-day usage", values: { terms: "Paid social usage for 90 days; category exclusivity for 60 days.", anchor: "2026-08-15", usage_days: 90, exclusive_days: 60, notice_days: 15 } }],
    note: "Timeline organizer only, not contract interpretation or legal advice. The signed wording controls; review territory, media, sublicensing, edits, AI use, name/likeness, termination, morality, indemnity, and payment.",
    compute: `(values) => {
      const anchor = new Date(values.anchor + "T00:00:00");
      const add = (days) => { const date = new Date(anchor); date.setDate(date.getDate() + Math.max(0, Number(days) || 0)); return date; };
      const usageEnd = add(values.usage_days), exclusiveEnd = add(values.exclusive_days), notice = new Date(usageEnd); notice.setDate(notice.getDate() - Math.max(0, Number(values.notice_days) || 0));
      const format = (date) => Number.isNaN(date.getTime()) ? "Invalid date" : date.toISOString().slice(0, 10);
      const text = String(values.terms || "").toLowerCase();
      const signals = [["Paid usage", /paid|whitelist|boost/.test(text)], ["Exclusivity", /exclusiv|competitor/.test(text)], ["Renewal", /renew|extend/.test(text)], ["Territory", /territory|worldwide|country/.test(text)], ["Edits / derivatives", /edit|derivative|modify/.test(text)]];
      return { result: "Rights timeline from " + format(anchor), caption: signals.filter((row) => row[1]).length + " clause signal(s) found", rows: [["Usage end", format(usageEnd)], ["Exclusivity end", format(exclusiveEnd)], ["Renewal review", format(notice)]], table: { headers: ["Clause signal", "Mentioned"], rows: signals.map((row) => [row[0], row[1] ? "Yes" : "Not found"]) } };
    }`,
  }),
  base("royalty-split-waterfall-calculator", {
    category: ["Finance", "Business"],
    icon: "git-branch",
    fields: [
      { key: "gross", label: "Gross receipts", type: "number", min: 0, default: 100000 },
      { key: "platform", label: "Platform / distributor fee (%)", type: "number", min: 0, default: 15 },
      { key: "recoupment", label: "Recoupable balance", type: "number", min: 0, default: 10000 },
      { key: "splits", label: "Collaborator splits", type: "textarea", default: "Creator A | 60\nCreator B | 25\nProducer | 15", hint: "Payee | percent of post-fee, post-recoupment pool" },
    ],
    presets: [{ label: "60/25/15 split", values: { gross: 100000, platform: 15, recoupment: 10000, splits: "Creator A | 60\nCreator B | 25\nProducer | 15" } }],
    note: "Arithmetic reconciliation only. The governing contract may apply fees, reserves, taxes, recoupment, cross-collateralization, rounding, and splits in a different order.",
    compute: `(values) => {
      const gross = Math.max(0, Number(values.gross) || 0), platformFee = gross * Math.max(0, Number(values.platform) || 0) / 100, afterFee = gross - platformFee, recouped = Math.min(afterFee, Math.max(0, Number(values.recoupment) || 0)), pool = afterFee - recouped;
      const splits = String(values.splits || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [name, percent] = line.split("|").map((cell) => cell.trim()); return [name || "Payee", Math.max(0, Number(percent) || 0)]; });
      const totalPercent = splits.reduce((sum, row) => sum + row[1], 0), cents = Math.round(pool * 100);
      let allocated = 0;
      const rows = splits.map((row, index) => { const amountCents = index === splits.length - 1 ? cents - allocated : Math.round(cents * row[1] / Math.max(1, totalPercent)); allocated += amountCents; return [row[0], row[1] + "%", (amountCents / 100).toFixed(2)]; });
      return { result: pool.toFixed(2) + " distributable pool", caption: totalPercent + "% entered splits normalized for allocation", rows: [["Gross", gross.toFixed(2)], ["Platform fee", platformFee.toFixed(2)], ["Recouped", recouped.toFixed(2)], ["Allocated cents", allocated]], table: { headers: ["Payee", "Entered split", "Allocated"], rows } };
    }`,
  }),
  base("gig-platform-fee-normalizer", {
    category: ["Finance", "Business"],
    icon: "scale",
    fields: [
      { key: "offers", label: "Gig offers", type: "textarea", default: "Platform A | 5000 | 15 | 300 | 6 | 2\nPlatform B | 4600 | 8 | 150 | 5 | 1.5", hint: "Platform | gross | fee % | travel/expenses | paid hours | unpaid admin hours" },
      { key: "tax_rate", label: "Estimated withholding / tax reserve (%)", type: "number", min: 0, default: 10 },
    ],
    presets: [{ label: "Two platforms", values: { offers: "Platform A | 5000 | 15 | 300 | 6 | 2\nPlatform B | 4600 | 8 | 150 | 5 | 1.5", tax_rate: 10 } }],
    compute: `(values) => {
      const tax = Math.max(0, Number(values.tax_rate) || 0) / 100;
      const rows = String(values.offers || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name, grossRaw, feeRaw, expenseRaw, paidRaw, adminRaw] = line.split("|").map((cell) => cell.trim());
        const gross = Number(grossRaw) || 0, fee = gross * (Number(feeRaw) || 0) / 100, expense = Number(expenseRaw) || 0, hours = Math.max(0.01, (Number(paidRaw) || 0) + (Number(adminRaw) || 0)), net = (gross - fee - expense) * (1 - tax);
        return [name || "Platform", gross.toFixed(2), fee.toFixed(2), expense.toFixed(2), hours.toFixed(2), net.toFixed(2), (net / hours).toFixed(2)];
      }).sort((a, b) => Number(b[6]) - Number(a[6]));
      return { result: rows.length ? rows[0][0] + " has highest entered effective rate" : "No offers entered", caption: (tax * 100).toFixed(2) + "% reserve assumption", table: { headers: ["Platform", "Gross", "Fee", "Expenses", "Total hours", "Net after reserve", "Effective/hour"], rows } };
    }`,
  }),
  base("scope-creep-change-order-builder", {
    category: ["Business", "Productivity"],
    icon: "file-plus-2",
    fields: [
      { key: "project", label: "Project", type: "text", default: "Website launch" },
      { key: "original", label: "Original included scope", type: "textarea", default: "Five pages, one revision round, delivery by 2026-08-15." },
      { key: "request", label: "New request", type: "textarea", default: "Add three landing pages and a second revision round." },
      { key: "hours", label: "Additional hours", type: "number", min: 0, default: 18 },
      { key: "rate", label: "Hourly / blended rate", type: "number", min: 0, default: 1500 },
      { key: "expenses", label: "Additional expenses", type: "number", min: 0, default: 3000 },
      { key: "days", label: "Deadline extension (days)", type: "number", min: 0, default: 7 },
    ],
    presets: [{ label: "Extra pages", values: { project: "Website launch", original: "Five pages, one revision.", request: "Three extra pages and another revision.", hours: 18, rate: 1500, expenses: 3000, days: 7 } }],
    compute: `(values) => {
      const labour = Math.max(0, Number(values.hours) || 0) * Math.max(0, Number(values.rate) || 0), expenses = Math.max(0, Number(values.expenses) || 0), total = labour + expenses;
      return { result: total.toFixed(2) + " change-order value", caption: Math.max(0, Number(values.days) || 0) + " calendar-day extension", rows: [["Project", values.project], ["Additional labour", labour.toFixed(2)], ["Expenses", expenses.toFixed(2)], ["Additional hours", values.hours], ["Extension", values.days + " days"]], list: ["Original scope: " + values.original, "Requested change: " + values.request, "Acceptance: confirm price, schedule, dependencies, revision count, and authorized approver before work starts."] };
    }`,
  }),
  base("multi-currency-payout-reconciler", {
    category: ["Finance", "Business"],
    icon: "arrow-left-right",
    fields: [
      { key: "payouts", label: "Payout rows", type: "textarea", default: "INV-101 | USD | 1000 | 83.10 | 25 | 50 | 80525\nINV-102 | EUR | 500 | 90.20 | 10 | 25 | 43975", hint: "Invoice | currency | gross foreign | FX to base | platform fee base | withholding base | received base" },
      { key: "tolerance", label: "Match tolerance (base currency)", type: "number", min: 0, default: 1 },
    ],
    presets: [{ label: "USD/EUR payouts", values: { payouts: "INV-101 | USD | 1000 | 83.10 | 25 | 50 | 80525\nINV-102 | EUR | 500 | 90.20 | 10 | 25 | 43975", tolerance: 1 } }],
    compute: `(values) => {
      const tolerance = Math.max(0, Number(values.tolerance) || 0);
      const rows = String(values.payouts || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [invoice, currency, grossRaw, fxRaw, feeRaw, withholdingRaw, receivedRaw] = line.split("|").map((cell) => cell.trim());
        const gross = Number(grossRaw) || 0, fx = Number(fxRaw) || 0, fee = Number(feeRaw) || 0, withholding = Number(withholdingRaw) || 0, received = Number(receivedRaw) || 0, expected = gross * fx - fee - withholding, variance = received - expected;
        return [invoice || "—", currency || "—", gross.toFixed(2), fx.toFixed(6), expected.toFixed(2), received.toFixed(2), variance.toFixed(2), Math.abs(variance) <= tolerance ? "Match" : "Review"];
      });
      return { result: rows.filter((row) => row[7] === "Match").length + "/" + rows.length + " payouts match", caption: "Tolerance ±" + tolerance, table: { headers: ["Invoice", "Currency", "Gross", "FX", "Expected base", "Received", "Variance", "Status"], rows } };
    }`,
  }),
  base("gig-earnings-mileage-analyzer", {
    category: ["Finance", "Business"],
    icon: "car",
    fields: [
      { key: "shifts", label: "Gig shifts", type: "textarea", default: "2026-07-20 | 4200 | 8 | 75 | 12 | 300\n2026-07-21 | 3600 | 6.5 | 52 | 8 | 250", hint: "Date | gross earnings | total hours | business km | other expenses | tips included" },
      { key: "cost_per_km", label: "Vehicle cost per km", type: "number", min: 0, default: 8 },
      { key: "reserve", label: "Tax / reserve (%)", type: "number", min: 0, default: 10 },
    ],
    presets: [{ label: "Two shifts", values: { shifts: "2026-07-20 | 4200 | 8 | 75 | 12 | 300\n2026-07-21 | 3600 | 6.5 | 52 | 8 | 250", cost_per_km: 8, reserve: 10 } }],
    compute: `(values) => {
      const kmCost = Math.max(0, Number(values.cost_per_km) || 0), reserveRate = Math.max(0, Number(values.reserve) || 0) / 100;
      const rows = String(values.shifts || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [date, grossRaw, hoursRaw, kmRaw, expenseRaw] = line.split("|").map((cell) => cell.trim());
        const gross = Number(grossRaw) || 0, hours = Math.max(0.01, Number(hoursRaw) || 0), km = Math.max(0, Number(kmRaw) || 0), expense = Math.max(0, Number(expenseRaw) || 0), vehicle = km * kmCost, preReserve = gross - vehicle - expense, net = preReserve * (1 - reserveRate);
        return [date || "—", gross.toFixed(2), hours.toFixed(2), km.toFixed(1), vehicle.toFixed(2), expense.toFixed(2), net.toFixed(2), (net / hours).toFixed(2)];
      });
      const totals = rows.reduce((acc, row) => [acc[0] + Number(row[1]), acc[1] + Number(row[2]), acc[2] + Number(row[3]), acc[3] + Number(row[6])], [0, 0, 0, 0]);
      return { result: totals[3].toFixed(2) + " estimated net", caption: totals[1] ? (totals[3] / totals[1]).toFixed(2) + " effective per hour" : "No hours", rows: [["Gross", totals[0].toFixed(2)], ["Hours", totals[1].toFixed(2)], ["Business km", totals[2].toFixed(1)]], table: { headers: ["Date", "Gross", "Hours", "km", "Vehicle cost", "Other expense", "Net", "Net/hour"], rows } };
    }`,
  }),
  delimitedWorkbench("freelance-payment-late-fee-tracker", {
    headers: ["Invoice", "Client", "Issued", "Due", "Amount", "Paid date / status", "Agreed late-fee term", "Evidence"],
    sample: "INV-101 | Client A | 2026-06-01 | 2026-06-30 | 50000 | Unpaid | 1% per month in signed contract | Contract §5\nINV-102 | Client B | 2026-07-01 | 2026-07-15 | 18000 | 2026-07-14 | None | Bank reference",
    category: ["Finance", "Business"],
    icon: "calendar-clock",
    note: "Tracking organizer only. Apply late fees only where the signed agreement and applicable law allow them; confirm tax, interest caps, notice, dispute, and collection rules.",
  }),
  base("invoice-to-time-log-reconciler", {
    category: ["Finance", "Business"],
    icon: "clock-3",
    fields: [
      { key: "logs", label: "Time-log rows", type: "textarea", default: "Research | 5.5 | 1500\nDesign | 8 | 1800\nReview | 2 | 1500", hint: "Activity | hours | rate" },
      { key: "invoice", label: "Invoice lines", type: "textarea", default: "Research | 8250\nDesign | 14400\nReview | 2500", hint: "Activity | invoiced amount" },
      { key: "tolerance", label: "Amount tolerance", type: "number", min: 0, default: 1 },
    ],
    presets: [{ label: "Three lines", values: { logs: "Research | 5.5 | 1500\nDesign | 8 | 1800\nReview | 2 | 1500", invoice: "Research | 8250\nDesign | 14400\nReview | 2500", tolerance: 1 } }],
    compute: `(values) => {
      const tolerance = Math.max(0, Number(values.tolerance) || 0), expected = new Map(), invoiced = new Map();
      for (const line of String(values.logs || "").split(/\\r?\\n/).map((item) => item.trim()).filter(Boolean)) { const [name, hours, rate] = line.split("|").map((cell) => cell.trim()); expected.set(name, (expected.get(name) || 0) + (Number(hours) || 0) * (Number(rate) || 0)); }
      for (const line of String(values.invoice || "").split(/\\r?\\n/).map((item) => item.trim()).filter(Boolean)) { const [name, amount] = line.split("|").map((cell) => cell.trim()); invoiced.set(name, (invoiced.get(name) || 0) + (Number(amount) || 0)); }
      const names = [...new Set([...expected.keys(), ...invoiced.keys()])], rows = names.map((name) => { const exp = expected.get(name) || 0, inv = invoiced.get(name) || 0, variance = inv - exp; return [name, exp.toFixed(2), inv.toFixed(2), variance.toFixed(2), Math.abs(variance) <= tolerance ? "Match" : "Review"]; });
      return { result: rows.filter((row) => row[4] === "Match").length + "/" + rows.length + " lines match", caption: "Tolerance ±" + tolerance, table: { headers: ["Activity", "Expected from log", "Invoiced", "Variance", "Status"], rows } };
    }`,
  }),
  delimitedWorkbench("deliverable-revision-ledger", {
    headers: ["Deliverable", "Version", "Sent at", "Feedback source", "Requested change", "Included / extra", "Approval", "Evidence ref"],
    sample: "Landing page | v1 | 2026-07-10 | Client email | Shorter hero copy | Included 1/2 | Pending | msg-104\nLanding page | v2 | 2026-07-14 | Client call | Approved | Included 2/2 | Approved | call-notes-22",
    category: ["Business", "Productivity"],
    icon: "history",
  }),
  base("wearable-sleep-csv-analyzer", {
    category: ["Health & Fitness", "Developer"],
    icon: "moon-star",
    fields: [
      { key: "data", label: "Sleep export rows", type: "textarea", default: "2026-07-20 | 420 | 85 | 72 | 55\n2026-07-21 | 455 | 91 | 68 | 62\n2026-07-22 | 390 | 79 | 75 | 48", hint: "Date | sleep minutes | efficiency % | resting HR | HRV" },
      { key: "baseline", label: "Baseline nights", type: "number", min: 2, default: 7 },
    ],
    presets: [{ label: "Three nights", values: { data: "2026-07-20 | 420 | 85 | 72 | 55\n2026-07-21 | 455 | 91 | 68 | 62\n2026-07-22 | 390 | 79 | 75 | 48", baseline: 7 } }],
    note: "Personal trend summary, not a medical interpretation. Wearable algorithms and fields differ; symptoms, sleep disorders, medication, illness, pregnancy, and clinical decisions require qualified care.",
    compute: `(values) => {
      const rows = String(values.data || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [date, minutes, efficiency, hr, hrv] = line.split("|").map((cell) => cell.trim()); return [date, Number(minutes), Number(efficiency), Number(hr), Number(hrv)]; }).filter((row) => row.slice(1).every(Number.isFinite));
      if (!rows.length) return { result: "—", caption: "Enter valid sleep rows" };
      const average = (index) => rows.reduce((sum, row) => sum + row[index], 0) / rows.length, avgMinutes = average(1), avgEfficiency = average(2), avgHr = average(3), avgHrv = average(4);
      const table = rows.map((row) => [row[0], (row[1] / 60).toFixed(2), row[2].toFixed(1) + "%", row[3], row[4], (row[1] - avgMinutes).toFixed(0) + " min"]);
      return { result: (avgMinutes / 60).toFixed(2) + " h average sleep", caption: rows.length + " night(s) entered", rows: [["Average efficiency", avgEfficiency.toFixed(1) + "%"], ["Average resting HR", avgHr.toFixed(1)], ["Average HRV", avgHrv.toFixed(1)], ["Baseline setting", values.baseline + " nights"]], table: { headers: ["Date", "Sleep hours", "Efficiency", "Resting HR", "HRV", "Sleep vs average"], rows: table } };
    }`,
  }),
  base("hrv-readiness-trend-tracker", {
    category: ["Health & Fitness", "Productivity"],
    icon: "heart-pulse",
    fields: [
      { key: "data", label: "Daily HRV readings", type: "textarea", default: "2026-07-17 | 55\n2026-07-18 | 58\n2026-07-19 | 60\n2026-07-20 | 54\n2026-07-21 | 62\n2026-07-22 | 48\n2026-07-23 | 51", hint: "Date | personal HRV value" },
      { key: "window", label: "Rolling baseline window", type: "number", min: 3, default: 7 },
      { key: "threshold", label: "Deviation flag (%)", type: "number", min: 0, default: 15 },
    ],
    presets: [{ label: "Seven readings", values: { data: "2026-07-17 | 55\n2026-07-18 | 58\n2026-07-19 | 60\n2026-07-20 | 54\n2026-07-21 | 62\n2026-07-22 | 48\n2026-07-23 | 51", window: 7, threshold: 15 } }],
    note: "Personal-device trend aid, not a readiness score, diagnosis, or training prescription. Compare only consistent device/conditions and consider sleep, illness, alcohol, medication, stress, and symptoms.",
    compute: `(values) => {
      const readings = String(values.data || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [date, value] = line.split("|").map((cell) => cell.trim()); return [date, Number(value)]; }).filter((row) => Number.isFinite(row[1]));
      const window = Math.max(3, Math.round(Number(values.window) || 7)), threshold = Math.max(0, Number(values.threshold) || 0);
      const table = readings.map((row, index) => { const start = Math.max(0, index - window), previous = readings.slice(start, index), baseline = previous.length ? previous.reduce((sum, item) => sum + item[1], 0) / previous.length : row[1], deviation = baseline ? (row[1] - baseline) / baseline * 100 : 0; return [row[0], row[1], baseline.toFixed(2), deviation.toFixed(2) + "%", Math.abs(deviation) >= threshold && previous.length >= 3 ? "Review context" : "Within entered band"]; });
      const last = table.at(-1);
      return { result: last ? last[3] + " latest baseline deviation" : "No readings", caption: window + "-reading window · ±" + threshold + "% flag", rows: [["Readings", readings.length], ["Latest HRV", last ? last[1] : "—"], ["Latest baseline", last ? last[2] : "—"]], table: { headers: ["Date", "HRV", "Prior baseline", "Deviation", "Context flag"], rows: table } };
    }`,
  }),
  base("apple-health-export-explorer", {
    category: ["Health & Fitness", "Developer"],
    icon: "file-heart",
    fields: [
      { key: "xml", label: "Apple Health export.xml content or Record lines", type: "textarea", default: "<Record type=\"HKQuantityTypeIdentifierStepCount\" value=\"8421\" unit=\"count\" startDate=\"2026-07-20\"/>\n<Record type=\"HKQuantityTypeIdentifierHeartRate\" value=\"72\" unit=\"count/min\" startDate=\"2026-07-20\"/>" },
      { key: "limit", label: "Maximum records to summarize", type: "number", min: 1, max: 50000, default: 5000 },
    ],
    presets: [{ label: "Two records", values: { xml: "<Record type=\"HKQuantityTypeIdentifierStepCount\" value=\"8421\" unit=\"count\" startDate=\"2026-07-20\"/>\n<Record type=\"HKQuantityTypeIdentifierHeartRate\" value=\"72\" unit=\"count/min\" startDate=\"2026-07-20\"/>", limit: 5000 } }],
    note: "Local lightweight XML attribute explorer. Apple Health types/units are heterogeneous; it does not fully parse nested workout/routes, clinical records, timezone semantics, provenance, or medical meaning.",
    compute: `(values) => {
      const text = String(values.xml || ""), limit = Math.max(1, Math.min(50000, Number(values.limit) || 5000)), matches = [...text.matchAll(/<Record\\b([^>]+)\\/?\\s*>/g)].slice(0, limit);
      const attributes = (source) => Object.fromEntries([...source.matchAll(/([A-Za-z]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
      const records = matches.map((match) => attributes(match[1])), groups = new Map();
      for (const record of records) { const type = String(record.type || "Unknown").replace(/^HK\\w+Identifier/, ""); const current = groups.get(type) || { count: 0, samples: [], unit: record.unit || "" }; current.count += 1; const number = Number(record.value); if (Number.isFinite(number)) current.samples.push(number); groups.set(type, current); }
      const rows = [...groups.entries()].map(([type, group]) => [type, group.count, group.unit || "—", group.samples.length ? (group.samples.reduce((sum, value) => sum + value, 0) / group.samples.length).toFixed(4) : "Non-numeric", group.samples.length ? Math.min(...group.samples) : "—", group.samples.length ? Math.max(...group.samples) : "—"]).sort((a, b) => b[1] - a[1]);
      return { result: records.length + " Record element(s) parsed", caption: groups.size + " type(s)", rows: [["Input characters", text.length], ["Limit", limit], ["Types", groups.size]], table: { headers: ["Type", "Count", "Unit", "Mean", "Min", "Max"], rows } };
    }`,
  }),
  base("gpx-home-zone-privacy-scrubber", {
    category: ["Security & Privacy", "Developer"],
    icon: "map-pinned",
    fields: [
      { key: "gpx", label: "GPX text", type: "textarea", default: "<?xml version=\"1.0\"?><gpx><trk><trkseg>\n<trkpt lat=\"19.0760\" lon=\"72.8777\"><ele>10</ele></trkpt>\n<trkpt lat=\"19.0800\" lon=\"72.8800\"><ele>11</ele></trkpt>\n<trkpt lat=\"19.0900\" lon=\"72.8900\"><ele>12</ele></trkpt>\n</trkseg></trk></gpx>" },
      { key: "remove_start", label: "Start points to remove", type: "number", min: 0, default: 1 },
      { key: "remove_end", label: "End points to remove", type: "number", min: 0, default: 1 },
      { key: "round", label: "Coordinate decimal places", type: "number", min: 2, max: 7, default: 5 },
    ],
    presets: [{ label: "Trim first/last", values: { gpx: "<gpx><trk><trkseg><trkpt lat=\"19.0760\" lon=\"72.8777\"></trkpt><trkpt lat=\"19.0800\" lon=\"72.8800\"></trkpt><trkpt lat=\"19.0900\" lon=\"72.8900\"></trkpt></trkseg></trk></gpx>", remove_start: 1, remove_end: 1, round: 5 } }],
    note: "Removes entered numbers of first/last trkpt elements and rounds remaining coordinates locally. Inspect waypoints, routes, timestamps, metadata, photos, and repeated home visits before sharing.",
    outputLabel: "Scrubbed GPX",
    compute: `(values) => {
      const text = String(values.gpx || ""), points = [...text.matchAll(/<trkpt\\b[\\s\\S]*?<\\/trkpt>|<trkpt\\b[^>]*\\/>/g)].map((match) => ({ raw: match[0], index: match.index }));
      const start = Math.max(0, Math.round(Number(values.remove_start) || 0)), end = Math.max(0, Math.round(Number(values.remove_end) || 0)), keepStart = Math.min(points.length, start), keepEnd = Math.max(keepStart, points.length - end), round = Math.max(2, Math.min(7, Math.round(Number(values.round) || 5)));
      let cursor = 0, output = "";
      points.forEach((point, index) => { output += text.slice(cursor, point.index); if (index >= keepStart && index < keepEnd) output += point.raw.replace(/(lat|lon)="(-?\\d+(?:\\.\\d+)?)"/g, (_, key, number) => key + "=\\"" + Number(number).toFixed(round) + "\\""); cursor = point.index + point.raw.length; });
      output += text.slice(cursor);
      return { result: output || "—", caption: Math.max(0, keepEnd - keepStart) + "/" + points.length + " track points retained", rows: [["Start removed", keepStart], ["End removed", Math.max(0, points.length - keepEnd)], ["Coordinate decimals", round], ["Output characters", output.length]] };
    }`,
  }),
  base("smart-meter-interval-analyzer", {
    category: ["Lifestyle", "Calculator"],
    icon: "gauge",
    fields: [
      { key: "intervals", label: "Interval energy rows", type: "textarea", default: "2026-07-20 00:00 | 0.4 | off-peak\n2026-07-20 00:30 | 0.3 | off-peak\n2026-07-20 18:00 | 2.2 | peak\n2026-07-20 18:30 | 2.5 | peak", hint: "Timestamp | kWh | tariff label" },
      { key: "peak_threshold", label: "High interval threshold (kWh)", type: "number", min: 0, default: 2 },
    ],
    presets: [{ label: "Four intervals", values: { intervals: "2026-07-20 00:00 | 0.4 | off-peak\n2026-07-20 00:30 | 0.3 | off-peak\n2026-07-20 18:00 | 2.2 | peak\n2026-07-20 18:30 | 2.5 | peak", peak_threshold: 2 } }],
    compute: `(values) => {
      const threshold = Math.max(0, Number(values.peak_threshold) || 0), rows = String(values.intervals || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [time, kwh, tariff] = line.split("|").map((cell) => cell.trim()); return [time, Number(kwh), tariff || "Unlabelled"]; }).filter((row) => Number.isFinite(row[1]));
      const total = rows.reduce((sum, row) => sum + row[1], 0), groups = new Map();
      for (const row of rows) groups.set(row[2], (groups.get(row[2]) || 0) + row[1]);
      const high = rows.filter((row) => row[1] >= threshold).sort((a, b) => b[1] - a[1]);
      return { result: total.toFixed(4) + " kWh entered usage", caption: high.length + " high interval(s)", rows: [["Intervals", rows.length], ["Average", rows.length ? (total / rows.length).toFixed(4) + " kWh" : "—"], ["Maximum", rows.length ? Math.max(...rows.map((row) => row[1])).toFixed(4) + " kWh" : "—"]], table: { headers: ["Tariff label", "kWh", "Share"], rows: [...groups.entries()].map(([label, value]) => [label, value.toFixed(4), total ? (value / total * 100).toFixed(2) + "%" : "0%"]) }, list: high.slice(0, 10).map((row) => row[0] + ": " + row[1] + " kWh") };
    }`,
  }),
  base("ev-charging-tou-optimizer", {
    category: ["Lifestyle", "Calculator"],
    icon: "battery-charging",
    fields: [
      { key: "needed", label: "Energy needed at battery (kWh)", type: "number", min: 0, default: 45 },
      { key: "power", label: "Charger power (kW)", type: "number", min: 0.1, default: 7.2 },
      { key: "efficiency", label: "Charging efficiency (%)", type: "number", min: 1, max: 100, default: 90 },
      { key: "windows", label: "Tariff windows", type: "textarea", default: "00:00-06:00 | 5.5\n06:00-18:00 | 8.0\n18:00-22:00 | 12.0\n22:00-24:00 | 6.0", hint: "Start-end | price per kWh" },
    ],
    presets: [{ label: "45 kWh overnight", values: { needed: 45, power: 7.2, efficiency: 90, windows: "00:00-06:00 | 5.5\n06:00-18:00 | 8.0\n18:00-22:00 | 12.0\n22:00-24:00 | 6.0" } }],
    note: "Simplified full-power schedule; confirm charger/car limits, tapering, battery conditioning, departure time, demand charges, taxes, and utility tariff rules.",
    compute: `(values) => {
      const needed = Math.max(0, Number(values.needed) || 0), power = Number(values.power), efficiency = Math.max(0.01, Math.min(1, Number(values.efficiency) / 100));
      if (!(power > 0)) return { result: "—", caption: "Charger power must be positive" };
      const grid = needed / efficiency, hours = grid / power;
      const windows = String(values.windows || "").split(/\\r?\\n/).map((line) => { const [range, price] = line.split("|").map((cell) => cell.trim()); const [start, end] = String(range || "").split("-"); const toHour = (value) => { const [h, m] = String(value || "").split(":").map(Number); return (h === 24 ? 24 : h || 0) + (m || 0) / 60; }; return { range, price: Number(price), duration: Math.max(0, toHour(end) - toHour(start)) }; }).filter((row) => Number.isFinite(row.price) && row.duration > 0).sort((a, b) => a.price - b.price);
      let remaining = hours, cost = 0;
      const plan = windows.map((tariff) => { const use = Math.min(remaining, tariff.duration); remaining -= use; const energy = use * power, itemCost = energy * tariff.price; cost += itemCost; return [tariff.range, tariff.price, use.toFixed(3), energy.toFixed(3), itemCost.toFixed(2)]; }).filter((row) => Number(row[2]) > 0);
      return { result: cost.toFixed(2) + " estimated charging cost", caption: hours.toFixed(3) + " charging hours · " + (remaining > 0 ? remaining.toFixed(2) + " h do not fit" : "fits entered windows"), rows: [["Battery energy", needed + " kWh"], ["Grid energy", grid.toFixed(3) + " kWh"], ["Charger power", power + " kW"]], table: { headers: ["Window", "Price/kWh", "Hours", "Grid kWh", "Cost"], rows: plan } };
    }`,
  }),
  base("ev-road-trip-charge-planner", {
    category: ["Lifestyle", "Calculator"],
    icon: "route",
    fields: [
      { key: "battery", label: "Usable battery (kWh)", type: "number", min: 0.1, default: 60 },
      { key: "efficiency", label: "Consumption (kWh/100 km)", type: "number", min: 0.1, default: 18 },
      { key: "start_soc", label: "Start state of charge (%)", type: "number", min: 0, max: 100, default: 90 },
      { key: "reserve_soc", label: "Arrival reserve (%)", type: "number", min: 0, max: 90, default: 15 },
      { key: "legs", label: "Route legs", type: "textarea", default: "Home to Stop 1 | 180\nStop 1 to Stop 2 | 210\nStop 2 to Destination | 160", hint: "Leg | distance km" },
      { key: "target_soc", label: "Charge-to target at stops (%)", type: "number", min: 1, max: 100, default: 80 },
    ],
    presets: [{ label: "550 km trip", values: { battery: 60, efficiency: 18, start_soc: 90, reserve_soc: 15, legs: "Home to Stop 1 | 180\nStop 1 to Stop 2 | 210\nStop 2 to Destination | 160", target_soc: 80 } }],
    note: "Energy arithmetic, not a live charger/route planner. Weather, elevation, speed, traffic, battery temperature, HVAC, degradation, charging curve, detours, outages, and reserve needs can materially change the trip.",
    compute: `(values) => {
      const battery = Number(values.battery), consumption = Number(values.efficiency) / 100, reserve = Number(values.reserve_soc), target = Number(values.target_soc);
      if (!(battery > 0 && consumption > 0)) return { result: "—", caption: "Battery and consumption must be positive" };
      let soc = Math.max(0, Math.min(100, Number(values.start_soc))), totalCharge = 0;
      const rows = String(values.legs || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line, index, all) => {
        const [name, distanceRaw] = line.split("|").map((cell) => cell.trim()), distance = Math.max(0, Number(distanceRaw) || 0), energy = distance * consumption, usedSoc = energy / battery * 100, arrival = soc - usedSoc;
        let charge = 0;
        if (index < all.length - 1 && arrival < target) { charge = Math.max(0, target - arrival) / 100 * battery; soc = target; } else soc = arrival;
        totalCharge += charge;
        return [name || "Leg", distance, energy.toFixed(2), arrival.toFixed(1) + "%", arrival >= reserve ? "Above reserve" : "Below reserve", charge.toFixed(2) + " kWh"];
      });
      return { result: totalCharge.toFixed(2) + " kWh planned stop charging", caption: reserve + "% entered reserve", table: { headers: ["Leg", "km", "Energy", "Arrival SOC", "Reserve", "Charge before next"], rows } };
    }`,
  }),
  base("ev-battery-degradation-analyzer", {
    category: ["Lifestyle", "Calculator"],
    icon: "battery-medium",
    fields: [
      { key: "logs", label: "Battery observations", type: "textarea", default: "2025-01-01 | 60 | 330 | 20000\n2025-07-01 | 58.5 | 320 | 32000\n2026-01-01 | 57.8 | 315 | 45000\n2026-07-01 | 56.9 | 309 | 59000", hint: "Date | estimated usable kWh | displayed range km | odometer km" },
      { key: "nominal", label: "New usable capacity (kWh)", type: "number", min: 0.1, default: 60 },
    ],
    presets: [{ label: "Four observations", values: { logs: "2025-01-01 | 60 | 330 | 20000\n2025-07-01 | 58.5 | 320 | 32000\n2026-01-01 | 57.8 | 315 | 45000\n2026-07-01 | 56.9 | 309 | 59000", nominal: 60 } }],
    note: "Trend estimate from user-entered observations, not a battery-health diagnostic or warranty test. Range varies with conditions; use consistent measurement methods and official service diagnostics.",
    compute: `(values) => {
      const nominal = Number(values.nominal), rows = String(values.logs || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [date, capacity, range, odometer] = line.split("|").map((cell) => cell.trim()); return [date, Number(capacity), Number(range), Number(odometer)]; }).filter((row) => row.slice(1).every(Number.isFinite));
      const table = rows.map((row) => [row[0], row[1].toFixed(2), nominal > 0 ? (row[1] / nominal * 100).toFixed(2) + "%" : "—", row[2], row[3]]);
      const first = rows[0], last = rows.at(-1), loss = first && last ? first[1] - last[1] : 0, km = first && last ? last[3] - first[3] : 0;
      return { result: last && nominal > 0 ? (last[1] / nominal * 100).toFixed(2) + "% latest entered capacity" : "No observations", caption: loss.toFixed(3) + " kWh change across entered period", rows: [["Observations", rows.length], ["Capacity change", (-loss).toFixed(3) + " kWh"], ["Odometer span", km + " km"], ["Change per 10,000 km", km ? (-loss / km * 10000).toFixed(3) + " kWh" : "—"]], table: { headers: ["Date", "Usable kWh", "% of new", "Range km", "Odometer"], rows: table } };
    }`,
  }),
  base("heat-pump-vs-furnace-estimator", {
    category: ["Lifestyle", "Calculator"],
    icon: "thermometer-sun",
    fields: [
      { key: "heat_need", label: "Annual useful heat need (kWh)", type: "number", min: 0, default: 12000 },
      { key: "cop", label: "Seasonal heat-pump COP", type: "number", min: 0.1, default: 3.2 },
      { key: "electric_price", label: "Electricity price / kWh", type: "number", min: 0, default: 8 },
      { key: "fuel_price", label: "Fuel price / kWh input", type: "number", min: 0, default: 4 },
      { key: "furnace_efficiency", label: "Furnace seasonal efficiency (%)", type: "number", min: 1, max: 100, default: 90 },
      { key: "fixed_hp", label: "Heat-pump annual fixed cost", type: "number", min: 0, default: 0 },
      { key: "fixed_furnace", label: "Furnace annual fixed cost", type: "number", min: 0, default: 0 },
    ],
    presets: [{ label: "12 MWh heat need", values: { heat_need: 12000, cop: 3.2, electric_price: 8, fuel_price: 4, furnace_efficiency: 90, fixed_hp: 0, fixed_furnace: 0 } }],
    note: "Running-cost comparison only. Real sizing requires climate/load calculations, design temperatures, capacity at low temperature, defrost, ducts/radiators, backup heat, tariffs, maintenance, installation, and emissions factors.",
    compute: `(values) => {
      const heat = Math.max(0, Number(values.heat_need) || 0), cop = Number(values.cop), electric = Math.max(0, Number(values.electric_price) || 0), fuel = Math.max(0, Number(values.fuel_price) || 0), efficiency = Math.max(0.01, Number(values.furnace_efficiency) / 100);
      if (!(cop > 0)) return { result: "—", caption: "COP must be positive" };
      const hpEnergy = heat / cop, furnaceEnergy = heat / efficiency, hpCost = hpEnergy * electric + Number(values.fixed_hp), furnaceCost = furnaceEnergy * fuel + Number(values.fixed_furnace), difference = furnaceCost - hpCost;
      return { result: (difference >= 0 ? "Heat pump lower by " : "Furnace lower by ") + Math.abs(difference).toFixed(2), rows: [["Heat-pump electricity", hpEnergy.toFixed(2) + " kWh"], ["Heat-pump cost", hpCost.toFixed(2)], ["Furnace fuel input", furnaceEnergy.toFixed(2) + " kWh"], ["Furnace cost", furnaceCost.toFixed(2)], ["Break-even COP", electric > 0 ? (heat * electric / Math.max(1e-9, furnaceCost - Number(values.fixed_hp))).toFixed(3) : "—"]] };
    }`,
  }),
  base("csv-carbon-footprint-analyzer", {
    category: ["Lifestyle", "Calculator"],
    icon: "leaf",
    fields: [
      { key: "activities", label: "Activity rows", type: "textarea", default: "Grid electricity | 1200 | kWh | 0.7\nPetrol | 180 | litre | 2.31\nFlight | 1500 | passenger-km | 0.15", hint: "Activity | quantity | unit | kg CO₂e per unit" },
      { key: "household", label: "People sharing footprint", type: "number", min: 1, default: 1 },
    ],
    presets: [{ label: "Energy and travel", values: { activities: "Grid electricity | 1200 | kWh | 0.7\nPetrol | 180 | litre | 2.31\nFlight | 1500 | passenger-km | 0.15", household: 1 } }],
    note: "User-supplied-factor estimate. Emission factors vary by country, year, fuel pathway, radiative forcing, allocation, and scope; use an authoritative inventory for reporting.",
    compute: `(values) => {
      const people = Math.max(1, Number(values.household) || 1), rows = String(values.activities || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [activity, quantity, unit, factor] = line.split("|").map((cell) => cell.trim()); const q = Number(quantity) || 0, f = Number(factor) || 0; return [activity || "Activity", q, unit || "unit", f, q * f]; });
      const total = rows.reduce((sum, row) => sum + row[4], 0);
      return { result: total.toFixed(3) + " kg CO₂e entered total", caption: (total / people).toFixed(3) + " kg CO₂e per person", rows: [["Activities", rows.length], ["People", people], ["Tonnes CO₂e", (total / 1000).toFixed(6)]], table: { headers: ["Activity", "Quantity", "Unit", "Factor kg/unit", "kg CO₂e"], rows: rows.map((row) => [...row.slice(0, 4), row[4].toFixed(3)]) } };
    }`,
  }),
  base("solar-self-consumption-optimizer", {
    category: ["Lifestyle", "Calculator"],
    icon: "sun",
    fields: [
      { key: "intervals", label: "Generation and load intervals", type: "textarea", default: "08:00 | 0.8 | 0.5\n10:00 | 2.4 | 0.8\n12:00 | 3.5 | 1.0\n14:00 | 2.8 | 0.7\n18:00 | 0.2 | 2.0", hint: "Time | solar kWh | household load kWh" },
      { key: "flex_load", label: "Flexible appliance energy (kWh)", type: "number", min: 0, default: 2 },
    ],
    presets: [{ label: "Day profile", values: { intervals: "08:00 | 0.8 | 0.5\n10:00 | 2.4 | 0.8\n12:00 | 3.5 | 1.0\n14:00 | 2.8 | 0.7\n18:00 | 0.2 | 2.0", flex_load: 2 } }],
    note: "Interval energy-shift illustration. It assumes the flexible load can fit one interval and ignores power limits, duration, battery, forecast error, export caps, safety, appliance needs, and tariffs.",
    compute: `(values) => {
      const flex = Math.max(0, Number(values.flex_load) || 0), rows = String(values.intervals || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [time, solar, load] = line.split("|").map((cell) => cell.trim()); const generation = Number(solar) || 0, demand = Number(load) || 0, direct = Math.min(generation, demand); return [time, generation, demand, direct, Math.max(0, generation - demand)]; });
      const totalSolar = rows.reduce((sum, row) => sum + row[1], 0), direct = rows.reduce((sum, row) => sum + row[3], 0), best = [...rows].sort((a, b) => b[4] - a[4])[0], shifted = best ? Math.min(flex, best[4]) : 0;
      return { result: best ? "Best entered start: " + best[0] : "No intervals", caption: shifted.toFixed(3) + " kWh flexible load covered by surplus", rows: [["Solar generation", totalSolar.toFixed(3) + " kWh"], ["Direct self-consumption", direct.toFixed(3) + " kWh"], ["Current self-consumption", totalSolar ? (direct / totalSolar * 100).toFixed(2) + "%" : "—"], ["After one shift", totalSolar ? ((direct + shifted) / totalSolar * 100).toFixed(2) + "%" : "—"]], table: { headers: ["Time", "Solar", "Load", "Direct use", "Surplus"], rows: rows.map((row) => [row[0], ...row.slice(1).map((value) => value.toFixed(3))]) } };
    }`,
  }),
  base("home-battery-tou-simulator", {
    category: ["Lifestyle", "Calculator"],
    icon: "battery-charging",
    fields: [
      { key: "intervals", label: "Load and price intervals", type: "textarea", default: "00:00 | 1.0 | 5\n06:00 | 1.5 | 8\n18:00 | 3.0 | 12\n22:00 | 1.2 | 6", hint: "Time | load kWh | price per kWh" },
      { key: "capacity", label: "Usable battery capacity (kWh)", type: "number", min: 0, default: 8 },
      { key: "power", label: "Charge/discharge per interval (kWh)", type: "number", min: 0, default: 3 },
      { key: "efficiency", label: "Round-trip efficiency (%)", type: "number", min: 1, max: 100, default: 90 },
    ],
    presets: [{ label: "Four tariff intervals", values: { intervals: "00:00 | 1.0 | 5\n06:00 | 1.5 | 8\n18:00 | 3.0 | 12\n22:00 | 1.2 | 6", capacity: 8, power: 3, efficiency: 90 } }],
    note: "Simplified price-arbitrage illustration that charges at the cheapest entered interval and discharges at expensive intervals. It omits interval duration, solar, reserve, degradation, demand charges, export, controls, and tariff rules.",
    compute: `(values) => {
      const capacity = Math.max(0, Number(values.capacity) || 0), perInterval = Math.max(0, Number(values.power) || 0), efficiency = Math.max(0.01, Math.min(1, Number(values.efficiency) / 100));
      const rows = String(values.intervals || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [time, load, price] = line.split("|").map((cell) => cell.trim()); return { time, load: Math.max(0, Number(load) || 0), price: Math.max(0, Number(price) || 0) }; });
      const baseline = rows.reduce((sum, row) => sum + row.load * row.price, 0), cheapest = [...rows].sort((a, b) => a.price - b.price)[0], expensive = [...rows].sort((a, b) => b.price - a.price);
      let stored = Math.min(capacity, perInterval * efficiency), chargeInput = stored / efficiency, simulated = baseline + (cheapest ? chargeInput * cheapest.price : 0), discharged = 0;
      const plan = expensive.map((row) => { const use = Math.min(stored, perInterval, row.load); stored -= use; discharged += use; simulated -= use * row.price; return [row.time, row.price, use.toFixed(3), (use * row.price).toFixed(2)]; }).filter((row) => Number(row[2]) > 0);
      return { result: Math.max(0, baseline - simulated).toFixed(2) + " estimated savings", caption: "Baseline " + baseline.toFixed(2) + " · simulated " + simulated.toFixed(2), rows: [["Charge interval", cheapest?.time || "—"], ["Grid energy charged", chargeInput.toFixed(3) + " kWh"], ["Energy discharged", discharged.toFixed(3) + " kWh"], ["Capacity", capacity + " kWh"]], table: { headers: ["Discharge time", "Price", "Battery kWh", "Avoided cost"], rows: plan } };
    }`,
  }),
  base("appliance-load-shift-planner", {
    category: ["Lifestyle", "Productivity"],
    icon: "clock",
    fields: [
      { key: "windows", label: "Tariff windows", type: "textarea", default: "00:00-06:00 | 5\n06:00-18:00 | 8\n18:00-22:00 | 12\n22:00-24:00 | 6", hint: "Window | price per kWh" },
      { key: "appliances", label: "Flexible appliances", type: "textarea", default: "Dishwasher | 1.2\nWater heater | 3.0\nLaundry | 0.8", hint: "Appliance | cycle kWh" },
      { key: "max_parallel", label: "Maximum parallel cycles", type: "number", min: 1, default: 1 },
    ],
    presets: [{ label: "Three appliances", values: { windows: "00:00-06:00 | 5\n06:00-18:00 | 8\n18:00-22:00 | 12\n22:00-24:00 | 6", appliances: "Dishwasher | 1.2\nWater heater | 3.0\nLaundry | 0.8", max_parallel: 1 } }],
    note: "Cost-ordering aid only. Respect appliance instructions, ventilation, noise, hot-water hygiene, fire/electrical safety, supervision, demand limits, and household needs.",
    compute: `(values) => {
      const windows = String(values.windows || "").split(/\\r?\\n/).map((line) => { const [window, price] = line.split("|").map((cell) => cell.trim()); return [window, Number(price)]; }).filter((row) => Number.isFinite(row[1])).sort((a, b) => a[1] - b[1]);
      const appliances = String(values.appliances || "").split(/\\r?\\n/).map((line) => { const [name, energy] = line.split("|").map((cell) => cell.trim()); return [name, Math.max(0, Number(energy) || 0)]; }).filter((row) => row[0]);
      const parallel = Math.max(1, Math.round(Number(values.max_parallel) || 1)), rows = appliances.map((item, index) => { const window = windows[Math.floor(index / parallel) % Math.max(1, windows.length)] || ["—", 0]; return [item[0], item[1].toFixed(3), window[0], window[1], (item[1] * window[1]).toFixed(2)]; });
      return { result: rows.reduce((sum, row) => sum + Number(row[4]), 0).toFixed(2) + " scheduled energy cost", caption: parallel + " parallel cycle(s) allowed", table: { headers: ["Appliance", "kWh", "Suggested window", "Price/kWh", "Cost"], rows } };
    }`,
  }),
  base("utility-tariff-csv-comparator", {
    category: ["Lifestyle", "Calculator"],
    icon: "scale",
    fields: [
      { key: "usage", label: "Usage by tariff label", type: "textarea", default: "off-peak | 180\nstandard | 220\npeak | 90", hint: "Label | kWh" },
      { key: "tariffs", label: "Tariff plans", type: "textarea", default: "Plan A | 150 | off-peak:5, standard:8, peak:12\nPlan B | 250 | off-peak:4, standard:7.5, peak:11", hint: "Plan | fixed charge | label:price, label:price" },
      { key: "tax", label: "Tax / surcharge (%)", type: "number", min: 0, default: 0 },
    ],
    presets: [{ label: "Two plans", values: { usage: "off-peak | 180\nstandard | 220\npeak | 90", tariffs: "Plan A | 150 | off-peak:5, standard:8, peak:12\nPlan B | 250 | off-peak:4, standard:7.5, peak:11", tax: 0 } }],
    compute: `(values) => {
      const usage = new Map(String(values.usage || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [label, kwh] = line.split("|").map((cell) => cell.trim()); return [label, Math.max(0, Number(kwh) || 0)]; })), tax = Math.max(0, Number(values.tax) || 0) / 100;
      const rows = String(values.tariffs || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name, fixedRaw, ratesRaw] = line.split("|").map((cell) => cell.trim()), fixed = Math.max(0, Number(fixedRaw) || 0), rates = new Map(String(ratesRaw || "").split(",").map((pair) => { const [label, price] = pair.split(":").map((cell) => cell.trim()); return [label, Number(price) || 0]; }));
        const energy = [...usage.entries()].reduce((sum, [label, kwh]) => sum + kwh * (rates.get(label) || 0), 0), subtotal = fixed + energy, total = subtotal * (1 + tax);
        return [name || "Plan", fixed.toFixed(2), energy.toFixed(2), total.toFixed(2), [...usage.keys()].filter((label) => !rates.has(label)).join(", ") || "None"];
      }).sort((a, b) => Number(a[3]) - Number(b[3]));
      return { result: rows.length ? rows[0][0] + " is lowest for entered profile" : "No plans", caption: rows.length ? rows[0][3] + " estimated total" : "Add tariff rows", rows: [["Usage labels", usage.size], ["Plans", rows.length], ["Tax / surcharge", (tax * 100).toFixed(2) + "%"]], table: { headers: ["Plan", "Fixed", "Energy", "Total", "Missing labels"], rows } };
    }`,
  }),
  base("home-heat-loss-retrofit-estimator", {
    category: ["Lifestyle", "Calculator"],
    icon: "house",
    fields: [
      { key: "surfaces", label: "Building surfaces", type: "textarea", default: "Walls | 120 | 1.5 | 0.3\nRoof | 80 | 0.8 | 0.18\nWindows | 20 | 3.0 | 1.2", hint: "Surface | area m² | current U W/m²K | improved U" },
      { key: "delta_t", label: "Design indoor-outdoor difference (K)", type: "number", min: 0, default: 20 },
      { key: "hours", label: "Annual equivalent heating hours", type: "number", min: 0, default: 1800 },
      { key: "heat_cost", label: "Useful heat cost per kWh", type: "number", min: 0, default: 5 },
    ],
    presets: [{ label: "Walls, roof, windows", values: { surfaces: "Walls | 120 | 1.5 | 0.3\nRoof | 80 | 0.8 | 0.18\nWindows | 20 | 3.0 | 1.2", delta_t: 20, hours: 1800, heat_cost: 5 } }],
    note: "Steady-state fabric-only illustration. A proper assessment needs climate data, geometry, thermal bridges, airtightness/ventilation, moisture, solar/internal gains, system efficiency, comfort, embodied impacts, and local retrofit practice.",
    compute: `(values) => {
      const delta = Math.max(0, Number(values.delta_t) || 0), hours = Math.max(0, Number(values.hours) || 0), cost = Math.max(0, Number(values.heat_cost) || 0);
      const rows = String(values.surfaces || "").split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [name, area, currentU, improvedU] = line.split("|").map((cell) => cell.trim()); const A = Number(area) || 0, oldU = Number(currentU) || 0, newU = Number(improvedU) || 0, oldLoss = A * oldU * delta, newLoss = A * newU * delta; return [name || "Surface", A, oldU, newU, oldLoss, newLoss, oldLoss - newLoss]; });
      const oldWatts = rows.reduce((sum, row) => sum + row[4], 0), newWatts = rows.reduce((sum, row) => sum + row[5], 0), savedKwh = (oldWatts - newWatts) * hours / 1000;
      return { result: savedKwh.toFixed(2) + " kWh/year fabric saving", caption: (savedKwh * cost).toFixed(2) + " entered-cost saving", rows: [["Current design heat loss", oldWatts.toFixed(2) + " W"], ["Improved design heat loss", newWatts.toFixed(2) + " W"], ["Reduction", oldWatts ? ((oldWatts - newWatts) / oldWatts * 100).toFixed(2) + "%" : "—"]], table: { headers: ["Surface", "Area", "Current U", "Improved U", "Current W", "Improved W", "Saved W"], rows: rows.map((row) => [...row.slice(0, 4), ...row.slice(4).map((value) => value.toFixed(2))]) } };
    }`,
  }),
];

let built = 0;
for (const raw of specs) {
  if (requested.size && !requested.has(raw.slug)) continue;
  const entry = entryBySlug.get(raw.slug);
  const validation = await validateRawSpec(
    {
      slug: raw.slug,
      name: raw.title,
      description: raw.description,
      category: raw.category,
    },
    raw,
  );
  if (!validation.ok) throw new Error(`${raw.slug}: ${validation.error}`);
  const quality = qualityLint(validation.spec);
  if (quality.grade === "poor") {
    throw new Error(
      `${raw.slug}: quality ${quality.score} (${quality.issues
        .map((issue) => issue.code)
        .join(", ")})`,
    );
  }
  if (!dryRun) emitTool(validation.spec, toolsDir);
  built += 1;
  console.log(
    `${dryRun ? "Validated" : "Built"} ${entry.id} ${raw.slug} · quality ${quality.score}`,
  );
}
console.log(`${dryRun ? "Validated" : "Built"} ${built} P2 workbenches.`);
