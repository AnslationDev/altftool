// ============================================================================
// handcrafted-tools.mjs — hand-authored, high-quality specs for the 49 toolkit
// tools. Every compute is a real, correct function with matching field keys,
// sensible defaults, and rich multi-output results. Validated in the sandbox
// before it is written, then emitted through the normal ToolRuntime pipeline.
//
//   node automation/handcrafted-tools.mjs [--dry]
// ============================================================================
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeSpec, emitTool } from "./lib/spec.mjs";
import { validateRawSpec } from "./generator/validate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS = path.resolve(__dirname, "..", "src/tools");
const DRY = process.argv.includes("--dry");

const num = (v) => (typeof v === "number" ? v : Number(v));
const money = (n) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—");

const S = [
  // ---------------------------------------------------------------- dates
  {
    slug: "age-in-days-calculator", title: "Age in Days Calculator", category: ["Calculator"],
    description: "See exactly how old you are in days, weeks, months and hours from your birth date.",
    icon: "calendar", iconColor: "text-rose-600",
    fields: [{ key: "birth_date", label: "Date of birth", type: "date", default: "" }],
    presets: [{ label: "Y2K baby", values: { birth_date: "2000-01-01" } }],
    note: "Calculated against today's date, in your local time zone.",
    compute: (values) => {
      const b = new Date(values.birth_date);
      if (isNaN(b)) return { result: "—", caption: "Pick your date of birth" };
      const now = new Date();
      const days = Math.floor((now - b) / 86400000);
      if (days < 0) return { result: "—", caption: "That date is in the future" };
      let y = now.getFullYear() - b.getFullYear();
      let m = now.getMonth() - b.getMonth();
      if (now.getDate() < b.getDate()) m--;
      if (m < 0) { y--; m += 12; }
      return {
        result: days.toLocaleString() + " days old",
        caption: `${y} years, ${m} months`,
        rows: [["Weeks", Math.floor(days / 7).toLocaleString()], ["Months", (y * 12 + m).toLocaleString()], ["Hours", (days * 24).toLocaleString()], ["Next birthday in", (() => { const n = new Date(now.getFullYear(), b.getMonth(), b.getDate()); if (n < now) n.setFullYear(now.getFullYear() + 1); return Math.ceil((n - now) / 86400000) + " days"; })()]],
      };
    },
  },
  {
    slug: "days-between-dates-calculator", title: "Days Between Dates Calculator", category: ["Calculator"],
    description: "Count the days, weeks and months between any two dates.",
    icon: "calendar-range", iconColor: "text-indigo-600",
    fields: [{ key: "start", label: "Start date", type: "date", default: "" }, { key: "end", label: "End date", type: "date", default: "" }],
    presets: [{ label: "This year", values: { start: "2026-01-01", end: "2026-12-31" } }],
    compute: (values) => {
      const a = new Date(values.start), b = new Date(values.end);
      if (isNaN(a) || isNaN(b)) return { result: "—", caption: "Pick both dates" };
      const days = Math.round((b - a) / 86400000);
      const abs = Math.abs(days);
      return { result: abs.toLocaleString() + " days", caption: days < 0 ? "end is before start" : `${Math.floor(abs / 7)} weeks ${abs % 7} days`, rows: [["Weeks", (abs / 7).toFixed(1)], ["Months", (abs / 30.44).toFixed(1)], ["Years", (abs / 365.25).toFixed(2)]] };
    },
  },
  {
    slug: "business-days-calculator", title: "Business Days Calculator", category: ["Calculator"],
    description: "Count working days (Mon–Fri) between two dates, excluding weekends.",
    icon: "briefcase", iconColor: "text-blue-600",
    fields: [{ key: "start", label: "Start date", type: "date", default: "" }, { key: "end", label: "End date", type: "date", default: "" }],
    compute: (values) => {
      const a = new Date(values.start), b = new Date(values.end);
      if (isNaN(a) || isNaN(b) || b < a) return { result: "—", caption: "Pick a valid date range" };
      let count = 0; const d = new Date(a);
      while (d <= b) { const g = d.getDay(); if (g !== 0 && g !== 6) count++; d.setDate(d.getDate() + 1); }
      const total = Math.round((b - a) / 86400000) + 1;
      return { result: count.toLocaleString() + " business days", rows: [["Total days", total], ["Weekend days", total - count]] };
    },
  },

  // ---------------------------------------------------------------- finance
  {
    slug: "cagr-calculator", title: "CAGR Calculator", category: ["Finance"],
    description: "Compound annual growth rate from a starting value, ending value and number of years.",
    icon: "trending-up", iconColor: "text-lime-600",
    fields: [{ key: "initial", label: "Initial value", type: "number", default: "10000" }, { key: "final", label: "Final value", type: "number", default: "25000" }, { key: "years", label: "Years", type: "number", default: "5" }],
    compute: (values) => {
      const p = num(values.initial), f = num(values.final), y = num(values.years);
      if (p <= 0 || y <= 0) return { result: "—", caption: "Enter positive initial value and years" };
      const cagr = (Math.pow(f / p, 1 / y) - 1) * 100;
      return { result: cagr.toFixed(2) + "% per year", rows: [["Total growth", ((f / p - 1) * 100).toFixed(2) + "%"], ["Multiple", (f / p).toFixed(2) + "×"], ["Absolute gain", money(f - p)]] };
    },
  },
  {
    slug: "bond-yield-calculator", title: "Bond Yield Calculator", category: ["Finance"],
    description: "Current yield and approximate yield-to-maturity for a bond.",
    icon: "landmark", iconColor: "text-emerald-600",
    fields: [{ key: "face_value", label: "Face value", type: "number", default: "1000" }, { key: "coupon_rate", label: "Coupon rate (%/yr)", type: "number", default: "6" }, { key: "price", label: "Market price", type: "number", default: "950" }, { key: "years", label: "Years to maturity", type: "number", default: "10" }],
    compute: (values) => {
      const fv = num(values.face_value), c = num(values.coupon_rate) / 100, p = num(values.price), y = num(values.years);
      if (p <= 0 || y <= 0) return { result: "—", caption: "Enter price and years" };
      const coupon = fv * c;
      const current = (coupon / p) * 100;
      const ytm = ((coupon + (fv - p) / y) / ((fv + p) / 2)) * 100;
      return { result: "Current yield " + current.toFixed(2) + "%", rows: [["Annual coupon", money(coupon)], ["Approx. YTM", ytm.toFixed(2) + "%"], ["Discount/premium", money(p - fv)]] };
    },
  },
  {
    slug: "car-loan-calculator", title: "Car Loan Calculator", category: ["Finance"],
    description: "Monthly payment, total interest and total cost for a car loan.",
    icon: "car", iconColor: "text-blue-600",
    fields: [{ key: "price", label: "Car price", type: "number", default: "25000" }, { key: "down", label: "Down payment", type: "number", default: "5000" }, { key: "rate", label: "Interest rate (%/yr)", type: "number", default: "7" }, { key: "years", label: "Loan term (years)", type: "number", default: "5" }],
    compute: (values) => {
      const loan = Math.max(0, num(values.price) - num(values.down));
      const r = num(values.rate) / 100 / 12, n = num(values.years) * 12;
      if (loan <= 0 || n <= 0) return { result: "—", caption: "Enter loan amount and term" };
      const emi = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      return { result: money(emi) + " / month", rows: [["Loan amount", money(loan)], ["Total interest", money(total - loan)], ["Total cost", money(total + num(values.down))]] };
    },
  },
  {
    slug: "mortgage-affordability-calculator", title: "Mortgage Affordability Calculator", category: ["Finance"],
    description: "How much home you can afford, using the 28/36 debt-to-income rule.",
    icon: "home", iconColor: "text-teal-600",
    fields: [{ key: "annual_income", label: "Gross annual income", type: "number", default: "90000" }, { key: "monthly_debts", label: "Other monthly debts", type: "number", default: "500" }, { key: "rate", label: "Interest rate (%/yr)", type: "number", default: "6.5" }, { key: "years", label: "Term (years)", type: "number", default: "30" }, { key: "down", label: "Down payment", type: "number", default: "40000" }],
    compute: (values) => {
      const monthly = num(values.annual_income) / 12;
      if (monthly <= 0) return { result: "—", caption: "Enter your income" };
      const maxPayment = Math.min(monthly * 0.28, monthly * 0.36 - num(values.monthly_debts));
      if (maxPayment <= 0) return { result: "—", caption: "Existing debts exceed the 36% limit" };
      const r = num(values.rate) / 100 / 12, n = num(values.years) * 12;
      const loan = r === 0 ? maxPayment * n : (maxPayment * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
      return { result: "Home up to " + money(loan + num(values.down)), rows: [["Max monthly payment", money(maxPayment)], ["Max loan", money(loan)], ["+ your down payment", money(num(values.down))]] };
    },
  },
  {
    slug: "capital-gains-calculator", title: "Capital Gains Calculator", category: ["Finance"],
    description: "Work out your capital gain, tax owed and net profit on an investment.",
    icon: "coins", iconColor: "text-amber-600",
    fields: [{ key: "buy_price", label: "Buy price (per unit)", type: "number", default: "100" }, { key: "sell_price", label: "Sell price (per unit)", type: "number", default: "150" }, { key: "quantity", label: "Quantity", type: "number", default: "100" }, { key: "tax_rate", label: "Tax rate (%)", type: "number", default: "15" }],
    compute: (values) => {
      const gain = (num(values.sell_price) - num(values.buy_price)) * num(values.quantity);
      const tax = gain > 0 ? gain * (num(values.tax_rate) / 100) : 0;
      return { result: (gain >= 0 ? "Gain " : "Loss ") + money(Math.abs(gain)), rows: [["Tax owed", money(tax)], ["Net profit", money(gain - tax)], ["Return", (((num(values.sell_price) - num(values.buy_price)) / num(values.buy_price)) * 100).toFixed(2) + "%"]] };
    },
  },
  {
    slug: "margin-calculator", title: "Profit Margin Calculator", category: ["Finance"],
    description: "Gross margin, markup and profit from cost and selling price.",
    icon: "badge-percent", iconColor: "text-green-600",
    fields: [{ key: "cost", label: "Cost", type: "number", default: "60" }, { key: "price", label: "Selling price", type: "number", default: "100" }],
    compute: (values) => {
      const c = num(values.cost), p = num(values.price);
      if (p <= 0) return { result: "—", caption: "Enter a selling price" };
      const profit = p - c;
      return { result: ((profit / p) * 100).toFixed(2) + "% margin", rows: [["Profit", money(profit)], ["Markup", c > 0 ? ((profit / c) * 100).toFixed(2) + "%" : "—"]] };
    },
  },
  {
    slug: "markup-calculator", title: "Markup Calculator", category: ["Finance"],
    description: "Add a markup percentage to a cost to get the selling price and profit.",
    icon: "tag", iconColor: "text-orange-600",
    fields: [{ key: "cost", label: "Cost", type: "number", default: "60" }, { key: "markup", label: "Markup (%)", type: "number", default: "40" }],
    compute: (values) => {
      const c = num(values.cost), price = c * (1 + num(values.markup) / 100);
      return { result: money(price), caption: "selling price", rows: [["Profit", money(price - c)], ["Margin", price > 0 ? (((price - c) / price) * 100).toFixed(2) + "%" : "—"]] };
    },
  },
  {
    slug: "break-even-units-calculator", title: "Break-Even Units Calculator", category: ["Business"],
    description: "How many units you must sell to cover your costs.",
    icon: "target", iconColor: "text-rose-600",
    fields: [{ key: "fixed_costs", label: "Fixed costs", type: "number", default: "10000" }, { key: "price", label: "Price per unit", type: "number", default: "50" }, { key: "variable_cost", label: "Variable cost per unit", type: "number", default: "30" }],
    compute: (values) => {
      const cm = num(values.price) - num(values.variable_cost);
      if (cm <= 0) return { result: "—", caption: "Price must exceed variable cost" };
      const units = num(values.fixed_costs) / cm;
      return { result: Math.ceil(units).toLocaleString() + " units", rows: [["Contribution margin/unit", money(cm)], ["Break-even revenue", money(Math.ceil(units) * num(values.price))]] };
    },
  },
  {
    slug: "contribution-margin-calculator", title: "Contribution Margin Calculator", category: ["Business"],
    description: "Contribution margin per unit, ratio and total.",
    icon: "chart-column", iconColor: "text-indigo-600",
    fields: [{ key: "price", label: "Price per unit", type: "number", default: "50" }, { key: "variable_cost", label: "Variable cost per unit", type: "number", default: "30" }, { key: "units", label: "Units sold", type: "number", default: "1000" }],
    compute: (values) => {
      const cm = num(values.price) - num(values.variable_cost);
      return { result: money(cm) + " / unit", rows: [["CM ratio", num(values.price) > 0 ? ((cm / num(values.price)) * 100).toFixed(1) + "%" : "—"], ["Total contribution", money(cm * num(values.units))]] };
    },
  },
  {
    slug: "churn-rate-calculator", title: "Churn Rate Calculator", category: ["Marketing"],
    description: "Customer churn and retention rate for a period.",
    icon: "user-minus", iconColor: "text-red-600",
    fields: [{ key: "start_customers", label: "Customers at start", type: "number", default: "1000" }, { key: "churned", label: "Customers lost", type: "number", default: "50" }],
    compute: (values) => {
      const s = num(values.start_customers);
      if (s <= 0) return { result: "—", caption: "Enter starting customers" };
      const churn = (num(values.churned) / s) * 100;
      return { result: churn.toFixed(2) + "% churn", rows: [["Retention rate", (100 - churn).toFixed(2) + "%"], ["Customers remaining", (s - num(values.churned)).toLocaleString()]] };
    },
  },
  {
    slug: "conversion-rate-calculator", title: "Conversion Rate Calculator", category: ["Marketing"],
    description: "Conversion rate from visitors and conversions, with optional revenue.",
    icon: "percent", iconColor: "text-violet-600",
    fields: [{ key: "visitors", label: "Visitors", type: "number", default: "5000" }, { key: "conversions", label: "Conversions", type: "number", default: "150" }, { key: "value", label: "Value per conversion", type: "number", default: "0", required: false }],
    compute: (values) => {
      const v = num(values.visitors);
      if (v <= 0) return { result: "—", caption: "Enter visitor count" };
      const rate = (num(values.conversions) / v) * 100;
      const rows = [["Visitors per conversion", num(values.conversions) > 0 ? Math.round(v / num(values.conversions)) : "—"]];
      if (num(values.value) > 0) rows.push(["Revenue", money(num(values.conversions) * num(values.value))]);
      return { result: rate.toFixed(2) + "% conversion", rows };
    },
  },
  {
    slug: "hourly-to-salary-calculator", title: "Hourly to Salary Calculator", category: ["Finance"],
    description: "Convert an hourly wage into daily, weekly, monthly and yearly pay.",
    icon: "banknote", iconColor: "text-emerald-600",
    fields: [{ key: "rate", label: "Hourly rate", type: "number", default: "25" }, { key: "hours", label: "Hours per week", type: "number", default: "40" }, { key: "weeks", label: "Weeks per year", type: "number", default: "52" }],
    compute: (values) => {
      const weekly = num(values.rate) * num(values.hours);
      const annual = weekly * num(values.weeks);
      return { result: money(annual) + " / year", rows: [["Monthly", money(annual / 12)], ["Weekly", money(weekly)], ["Daily", money(num(values.rate) * (num(values.hours) / 5))]] };
    },
  },

  // ---------------------------------------------------------------- health / fitness
  {
    slug: "bmr-calculator", title: "BMR Calculator", category: ["Health"],
    description: "Basal metabolic rate (calories at rest) via the Mifflin-St Jeor equation, plus daily needs.",
    icon: "flame", iconColor: "text-orange-600",
    fields: [{ key: "sex", label: "Sex", type: "select", default: "male", choices: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] }, { key: "weight", label: "Weight (kg)", type: "number", default: "70" }, { key: "height", label: "Height (cm)", type: "number", default: "175" }, { key: "age", label: "Age", type: "number", default: "30" }],
    compute: (values) => {
      const bmr = 10 * num(values.weight) + 6.25 * num(values.height) - 5 * num(values.age) + (values.sex === "female" ? -161 : 5);
      return { result: Math.round(bmr).toLocaleString() + " kcal/day", caption: "at complete rest", rows: [["Sedentary", Math.round(bmr * 1.2).toLocaleString()], ["Lightly active", Math.round(bmr * 1.375).toLocaleString()], ["Active", Math.round(bmr * 1.55).toLocaleString()], ["Very active", Math.round(bmr * 1.725).toLocaleString()]] };
    },
  },
  {
    slug: "body-surface-area-calculator", title: "Body Surface Area Calculator", category: ["Health"],
    description: "Estimate body surface area (BSA) using the Mosteller and Du Bois formulas.",
    icon: "ruler", iconColor: "text-teal-600",
    fields: [{ key: "weight", label: "Weight (kg)", type: "number", default: "70" }, { key: "height", label: "Height (cm)", type: "number", default: "175" }],
    compute: (values) => {
      const w = num(values.weight), h = num(values.height);
      if (w <= 0 || h <= 0) return { result: "—", caption: "Enter weight and height" };
      const mosteller = Math.sqrt((h * w) / 3600);
      const dubois = 0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425);
      return { result: mosteller.toFixed(2) + " m²", caption: "Mosteller formula", rows: [["Du Bois formula", dubois.toFixed(2) + " m²"]] };
    },
  },
  {
    slug: "blood-alcohol-content-calculator", title: "Blood Alcohol Content Calculator", category: ["Health"],
    description: "Estimate BAC from standard drinks using the Widmark formula. For education only.",
    icon: "wine", iconColor: "text-rose-600",
    fields: [{ key: "drinks", label: "Standard drinks", type: "number", default: "3" }, { key: "weight", label: "Body weight (kg)", type: "number", default: "70" }, { key: "sex", label: "Sex", type: "select", default: "male", choices: [{ value: "male", label: "Male" }, { value: "female", label: "Female" }] }, { key: "hours", label: "Hours since first drink", type: "number", default: "2" }],
    note: "An estimate only — never use it to decide whether to drive.",
    compute: (values) => {
      const grams = num(values.drinks) * 14;
      const r = values.sex === "female" ? 0.55 : 0.68;
      const bac = Math.max(0, (grams / (num(values.weight) * 1000 * r)) * 100 - 0.015 * num(values.hours));
      return { result: bac.toFixed(3) + "% BAC", caption: bac >= 0.08 ? "Over the common 0.08% legal limit" : "Under 0.08%", rows: [["Alcohol consumed", grams.toFixed(0) + " g"], ["Approx. burned off", (0.015 * num(values.hours) * 100).toFixed(1) + " units"]] };
    },
  },
  {
    slug: "calorie-burn-calculator", title: "Calorie Burn Calculator", category: ["Fitness"],
    description: "Estimate calories burned for an activity using MET values, weight and time.",
    icon: "activity", iconColor: "text-orange-600",
    fields: [{ key: "activity", label: "Activity", type: "select", default: "5", choices: [{ value: "3.5", label: "Walking (brisk)" }, { value: "8", label: "Running" }, { value: "7.5", label: "Cycling" }, { value: "6", label: "Swimming" }, { value: "5", label: "Weight training" }, { value: "8.5", label: "Jump rope" }] }, { key: "weight", label: "Weight (kg)", type: "number", default: "70" }, { key: "minutes", label: "Duration (minutes)", type: "number", default: "30" }],
    compute: (values) => {
      const met = num(values.activity);
      const cals = (met * 3.5 * num(values.weight)) / 200 * num(values.minutes);
      return { result: Math.round(cals).toLocaleString() + " kcal", rows: [["Per minute", (cals / num(values.minutes)).toFixed(1) + " kcal"], ["Per hour", Math.round((cals / num(values.minutes)) * 60).toLocaleString() + " kcal"]] };
    },
  },
  {
    slug: "calorie-deficit-calculator", title: "Calorie Deficit Calculator", category: ["Fitness"],
    description: "The daily calorie deficit needed to reach a goal weight by a target date.",
    icon: "trending-down", iconColor: "text-lime-600",
    fields: [{ key: "current_weight", label: "Current weight (kg)", type: "number", default: "80" }, { key: "goal_weight", label: "Goal weight (kg)", type: "number", default: "72" }, { key: "weeks", label: "Weeks to goal", type: "number", default: "12" }],
    compute: (values) => {
      const lose = num(values.current_weight) - num(values.goal_weight);
      if (lose <= 0) return { result: "—", caption: "Goal should be below current weight" };
      if (num(values.weeks) <= 0) return { result: "—", caption: "Enter a number of weeks" };
      const dailyDeficit = (lose * 7700) / (num(values.weeks) * 7);
      return { result: Math.round(dailyDeficit).toLocaleString() + " kcal/day deficit", caption: `to lose ${lose} kg in ${num(values.weeks)} weeks`, rows: [["Weekly loss", (lose / num(values.weeks)).toFixed(2) + " kg"], ["Total to lose", lose.toFixed(1) + " kg"]] };
    },
  },
  {
    slug: "baby-growth-percentile-calculator", title: "Baby Growth Percentile Calculator", category: ["Health"],
    description: "A rough weight-for-age percentile estimate for babies 0–24 months.",
    icon: "baby", iconColor: "text-pink-500",
    fields: [{ key: "sex", label: "Sex", type: "select", default: "male", choices: [{ value: "male", label: "Boy" }, { value: "female", label: "Girl" }] }, { key: "age_months", label: "Age (months)", type: "number", default: "6" }, { key: "weight", label: "Weight (kg)", type: "number", default: "7.5" }],
    note: "A simplified estimate — always use your pediatrician's official growth charts.",
    compute: (values) => {
      const a = Math.max(0, Math.min(24, num(values.age_months)));
      // Approximate WHO median + SD (kg) by age, interpolated.
      const base = values.sex === "female" ? 3.2 : 3.3;
      const median = base + a * (a < 6 ? 0.7 : 0.35);
      const sd = 0.35 + a * 0.03;
      const z = (num(values.weight) - median) / sd;
      const pct = Math.round(100 * (0.5 * (1 + erf(z / Math.SQRT2))));
      function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
      return { result: "~" + Math.max(1, Math.min(99, pct)) + "th percentile", caption: `Median for age ≈ ${median.toFixed(1)} kg`, rows: [["Your baby", num(values.weight).toFixed(1) + " kg"], ["Z-score", z.toFixed(2)]] };
    },
  },
  {
    slug: "child-height-predictor", title: "Child Height Predictor", category: ["Health"],
    description: "Predict a child's adult height from the parents' heights (mid-parental method).",
    icon: "ruler", iconColor: "text-indigo-500",
    fields: [{ key: "mother", label: "Mother's height (cm)", type: "number", default: "165" }, { key: "father", label: "Father's height (cm)", type: "number", default: "178" }, { key: "sex", label: "Child's sex", type: "select", default: "male", choices: [{ value: "male", label: "Boy" }, { value: "female", label: "Girl" }] }],
    note: "A statistical estimate (±8.5 cm). Actual height depends on nutrition, health and genetics.",
    compute: (values) => {
      const m = num(values.mother), f = num(values.father);
      if (m <= 0 || f <= 0) return { result: "—", caption: "Enter both parents' heights" };
      const mid = values.sex === "female" ? (m + f - 13) / 2 : (m + f + 13) / 2;
      return { result: mid.toFixed(1) + " cm", caption: "predicted adult height", rows: [["Likely range", (mid - 8.5).toFixed(0) + "–" + (mid + 8.5).toFixed(0) + " cm"], ["In feet", Math.floor(mid / 30.48) + "′" + Math.round((mid / 2.54) % 12) + "″"]] };
    },
  },

  // ---------------------------------------------------------------- math / science
  {
    slug: "ohms-law-calculator", title: "Ohm's Law Calculator", category: ["Science"],
    description: "Enter any two of voltage, current and resistance to find the third — plus power.",
    icon: "zap", iconColor: "text-yellow-500",
    fields: [{ key: "voltage", label: "Voltage (V)", type: "number", default: "12", required: false }, { key: "current", label: "Current (A)", type: "number", default: "2", required: false }, { key: "resistance", label: "Resistance (Ω)", type: "number", default: "", required: false }],
    note: "Leave one field blank and fill the other two.",
    compute: (values) => {
      let V = values.voltage === "" ? null : num(values.voltage);
      let I = values.current === "" ? null : num(values.current);
      let R = values.resistance === "" ? null : num(values.resistance);
      const known = [V, I, R].filter((x) => x !== null).length;
      if (known < 2) return { result: "—", caption: "Enter any two values" };
      if (V === null) V = I * R; else if (I === null) I = R ? V / R : 0; else if (R === null) R = I ? V / I : 0;
      const P = V * I;
      return { result: (R).toFixed(2) + " Ω", caption: `V=${V.toFixed(2)}  I=${I.toFixed(2)}  R=${R.toFixed(2)}`, rows: [["Voltage", V.toFixed(2) + " V"], ["Current", I.toFixed(2) + " A"], ["Resistance", R.toFixed(2) + " Ω"], ["Power", P.toFixed(2) + " W"]] };
    },
  },
  {
    slug: "density-calculator", title: "Density Calculator", category: ["Science"],
    description: "Density from mass and volume, with common unit conversions.",
    icon: "box", iconColor: "text-cyan-600",
    fields: [{ key: "mass", label: "Mass (g)", type: "number", default: "100" }, { key: "volume", label: "Volume (cm³ / mL)", type: "number", default: "50" }],
    compute: (values) => {
      const v = num(values.volume);
      if (v === 0) return { result: "—", caption: "Volume can't be zero" };
      const d = num(values.mass) / v;
      return { result: d.toFixed(3) + " g/cm³", rows: [["kg/m³", (d * 1000).toFixed(0)], ["vs water", d > 1 ? "sinks" : "floats"]] };
    },
  },
  {
    slug: "quadratic-equation-solver", title: "Quadratic Equation Solver", category: ["Math"],
    description: "Solve ax² + bx + c = 0 — real or complex roots, discriminant and vertex.",
    icon: "sigma", iconColor: "text-indigo-600",
    fields: [{ key: "a", label: "a", type: "number", default: "1" }, { key: "b", label: "b", type: "number", default: "-3" }, { key: "c", label: "c", type: "number", default: "2" }],
    compute: (values) => {
      const a = num(values.a), b = num(values.b), c = num(values.c);
      if (a === 0) return { result: "—", caption: "a can't be zero (not quadratic)" };
      const d = b * b - 4 * a * c;
      const vx = -b / (2 * a), vy = a * vx * vx + b * vx + c;
      let res;
      if (d > 0) { const s = Math.sqrt(d); res = `x₁ = ${((-b + s) / (2 * a)).toFixed(3)}, x₂ = ${((-b - s) / (2 * a)).toFixed(3)}`; }
      else if (d === 0) res = `x = ${(-b / (2 * a)).toFixed(3)} (double root)`;
      else { const s = Math.sqrt(-d); res = `x = ${(-b / (2 * a)).toFixed(2)} ± ${(s / (2 * a)).toFixed(2)}i`; }
      return { result: res, rows: [["Discriminant", d.toFixed(2)], ["Nature", d > 0 ? "two real roots" : d === 0 ? "one real root" : "two complex roots"], ["Vertex", `(${vx.toFixed(2)}, ${vy.toFixed(2)})`]] };
    },
  },
  {
    slug: "factorial-calculator", title: "Factorial Calculator", category: ["Math"],
    description: "Exact factorial (n!) of a whole number using big integers.",
    icon: "x", iconColor: "text-rose-600",
    fields: [{ key: "n", label: "n (0–2000)", type: "number", default: "20" }],
    compute: (values) => {
      const n = Math.floor(num(values.n));
      if (isNaN(n) || n < 0 || n > 2000) return { result: "—", caption: "Enter a whole number 0–2000" };
      let f = 1n; for (let i = 2n; i <= BigInt(n); i++) f *= i;
      const s = f.toString();
      return { result: n + "! = " + (s.length > 30 ? s.slice(0, 30) + "…" : s), caption: s.length + " digits", rows: [["Full value", s]] };
    },
  },
  {
    slug: "lcm-and-gcd-calculator", title: "LCM and GCD Calculator", category: ["Math"],
    description: "Greatest common divisor and least common multiple of two numbers.",
    icon: "divide", iconColor: "text-emerald-600",
    fields: [{ key: "a", label: "First number", type: "number", default: "12" }, { key: "b", label: "Second number", type: "number", default: "18" }],
    compute: (values) => {
      let a = Math.abs(Math.floor(num(values.a))), b = Math.abs(Math.floor(num(values.b)));
      if (!a || !b) return { result: "—", caption: "Enter two whole numbers" };
      const gcd = (x, y) => { while (y) { [x, y] = [y, x % y]; } return x; };
      const g = gcd(a, b);
      return { result: `GCD ${g} · LCM ${(a / g) * b}`, rows: [["GCD (HCF)", g], ["LCM", (a / g) * b]] };
    },
  },
  {
    slug: "permutation-combination-calculator", title: "Permutation & Combination Calculator", category: ["Math"],
    description: "nPr and nCr for choosing r items from n.",
    icon: "shuffle", iconColor: "text-violet-600",
    fields: [{ key: "n", label: "Total items (n)", type: "number", default: "6" }, { key: "r", label: "Chosen (r)", type: "number", default: "3" }],
    compute: (values) => {
      const n = Math.floor(num(values.n)), r = Math.floor(num(values.r));
      if (n < 0 || r < 0 || r > n) return { result: "—", caption: "Need 0 ≤ r ≤ n" };
      const fact = (x) => { let f = 1; for (let i = 2; i <= x; i++) f *= i; return f; };
      const nPr = fact(n) / fact(n - r);
      const nCr = nPr / fact(r);
      return { result: `${nCr.toLocaleString()} combinations`, rows: [["Permutations (nPr)", nPr.toLocaleString()], ["Combinations (nCr)", nCr.toLocaleString()]] };
    },
  },
  {
    slug: "mean-median-mode-calculator", title: "Mean, Median & Mode Calculator", category: ["Math"],
    description: "Mean, median, mode, range and standard deviation from a list of numbers.",
    icon: "sigma", iconColor: "text-blue-600",
    fields: [{ key: "numbers", label: "Numbers (comma or space separated)", type: "textarea", default: "4, 8, 15, 16, 23, 42, 8" }],
    compute: (values) => {
      const arr = (String(values.numbers).match(/-?\d+(\.\d+)?/g) || []).map(Number);
      if (!arr.length) return { result: "—", caption: "Enter some numbers" };
      const sum = arr.reduce((a, b) => a + b, 0), mean = sum / arr.length;
      const s = [...arr].sort((a, b) => a - b), mid = Math.floor(s.length / 2);
      const median = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
      const freq = {}; let mode = s[0], best = 0;
      for (const x of arr) { freq[x] = (freq[x] || 0) + 1; if (freq[x] > best) { best = freq[x]; mode = x; } }
      const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
      return { result: "Mean " + mean.toFixed(2), rows: [["Median", median], ["Mode", best > 1 ? mode : "none"], ["Range", s[s.length - 1] - s[0]], ["Std. dev (pop)", sd.toFixed(2)], ["Count", arr.length]] };
    },
  },
  {
    slug: "standard-deviation-calculator", title: "Standard Deviation Calculator", category: ["Math"],
    description: "Population or sample standard deviation, variance and mean.",
    icon: "sigma", iconColor: "text-cyan-600",
    fields: [{ key: "numbers", label: "Numbers", type: "textarea", default: "2, 4, 4, 4, 5, 5, 7, 9" }, { key: "type", label: "Type", type: "select", default: "population", choices: [{ value: "population", label: "Population" }, { value: "sample", label: "Sample" }] }],
    compute: (values) => {
      const arr = (String(values.numbers).match(/-?\d+(\.\d+)?/g) || []).map(Number);
      if (arr.length < 2) return { result: "—", caption: "Enter at least two numbers" };
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const div = values.type === "sample" ? arr.length - 1 : arr.length;
      const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / div;
      return { result: "σ = " + Math.sqrt(variance).toFixed(4), caption: values.type + " standard deviation", rows: [["Variance", variance.toFixed(4)], ["Mean", mean.toFixed(4)], ["Count", arr.length]] };
    },
  },

  // ---------------------------------------------------------------- developer / text
  {
    slug: "crc32-calculator", title: "CRC32 Calculator", category: ["Developer"],
    description: "Compute the CRC32 checksum of text as a hex value.",
    icon: "hash", iconColor: "text-orange-600",
    fields: [{ key: "text", label: "Text", type: "textarea", default: "hello world" }],
    compute: (values) => {
      const t = String(values.text);
      let c; const table = [];
      for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
      let crc = 0xffffffff;
      for (let i = 0; i < t.length; i++) crc = table[(crc ^ t.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
      crc = (crc ^ 0xffffffff) >>> 0;
      return { result: "0x" + crc.toString(16).padStart(8, "0"), rows: [["Decimal", crc.toString()], ["Length", t.length + " chars"]] };
    },
  },
  {
    slug: "camel-case-converter", title: "Camel Case Converter", category: ["Developer"],
    description: "Convert any phrase to camelCase — plus PascalCase and CONSTANT_CASE.",
    icon: "case-sensitive", iconColor: "text-blue-600",
    fields: [{ key: "text", label: "Text", type: "textarea", default: "my variable name here" }],
    compute: (values) => {
      const parts = String(values.text).trim().split(/[^a-zA-Z0-9]+/).filter(Boolean);
      if (!parts.length) return { result: "—", caption: "Enter some text" };
      const camel = parts.map((p, i) => i === 0 ? p.toLowerCase() : p[0].toUpperCase() + p.slice(1).toLowerCase()).join("");
      return { result: camel, rows: [["PascalCase", camel[0].toUpperCase() + camel.slice(1)], ["CONSTANT_CASE", parts.map((p) => p.toUpperCase()).join("_")]] };
    },
  },
  {
    slug: "kebab-case-converter", title: "Kebab Case Converter", category: ["Developer"],
    description: "Convert any phrase to kebab-case — plus snake_case and a URL slug.",
    icon: "case-sensitive", iconColor: "text-amber-600",
    fields: [{ key: "text", label: "Text", type: "textarea", default: "My Variable Name Here" }],
    compute: (values) => {
      const parts = String(values.text).trim().split(/[^a-zA-Z0-9]+/).filter(Boolean).map((p) => p.toLowerCase());
      if (!parts.length) return { result: "—", caption: "Enter some text" };
      return { result: parts.join("-"), rows: [["snake_case", parts.join("_")], ["dot.case", parts.join(".")]] };
    },
  },
  {
    slug: "line-break-remover", title: "Line Break Remover", category: ["Text"],
    description: "Join multi-line text into one line with your chosen separator.",
    icon: "wrap-text", iconColor: "text-cyan-600",
    fields: [{ key: "text", label: "Text", type: "textarea", default: "line one\nline two\nline three" }, { key: "separator", label: "Join with", type: "select", default: "space", choices: [{ value: "space", label: "Space" }, { value: "comma", label: "Comma" }, { value: "none", label: "Nothing" }] }],
    compute: (values) => {
      const sep = values.separator === "comma" ? ", " : values.separator === "none" ? "" : " ";
      const lines = String(values.text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      return { result: lines.join(sep) || "—", rows: [["Lines joined", lines.length], ["Characters", lines.join(sep).length]] };
    },
  },
  {
    slug: "tweet-character-counter", title: "Tweet Character Counter", category: ["Social Media"],
    description: "Count characters against the 280 limit, with words and tweets needed.",
    icon: "type", iconColor: "text-sky-500",
    fields: [{ key: "text", label: "Your tweet", type: "textarea", default: "" }],
    compute: (values) => {
      const t = String(values.text);
      const words = (t.match(/\S+/g) || []).length;
      const left = 280 - t.length;
      return { result: t.length + " / 280", caption: left >= 0 ? left + " characters left" : Math.abs(left) + " over the limit", rows: [["Words", words], ["Lines", t ? t.split(/\n/).length : 0], ["Tweets needed", Math.max(1, Math.ceil(t.length / 280))]] };
    },
  },
  {
    slug: "bubble-text-generator", title: "Bubble Text Generator", category: ["Fun"],
    description: "Turn your text into Ⓑⓤⓑⓑⓛⓔ circled letters for bios and posts.",
    icon: "circle", iconColor: "text-pink-600",
    fields: [{ key: "text", label: "Text", type: "textarea", default: "bubble text" }],
    compute: (values) => {
      const map = (ch) => {
        const c = ch.charCodeAt(0);
        if (ch >= "a" && ch <= "z") return String.fromCodePoint(0x24d0 + (c - 97));
        if (ch >= "A" && ch <= "Z") return String.fromCodePoint(0x24b6 + (c - 65));
        if (ch >= "1" && ch <= "9") return String.fromCodePoint(0x2460 + (c - 49));
        if (ch === "0") return "⓪";
        return ch;
      };
      const out = String(values.text).split("").map(map).join("");
      return { result: out || "—" };
    },
  },

  // ---------------------------------------------------------------- content generators
  {
    slug: "blog-title-generator", title: "Blog Title Generator", category: ["Content Creation"],
    description: "Generate catchy blog title ideas from a keyword and tone.",
    icon: "heading", iconColor: "text-fuchsia-600", regenerate: true,
    fields: [{ key: "keyword", label: "Topic / keyword", type: "text", default: "email marketing" }, { key: "tone", label: "Tone", type: "select", default: "howto", choices: [{ value: "howto", label: "How-to" }, { value: "listicle", label: "Listicle" }, { value: "bold", label: "Bold" }] }],
    compute: (values) => {
      const k = (values.keyword || "your topic").trim();
      const K = k.replace(/\b\w/g, (c) => c.toUpperCase());
      const n = [7, 9, 11, 13, 5][Math.floor(Math.random() * 5)];
      const pools = {
        howto: [`How to Master ${K} in 2026`, `A Beginner's Guide to ${K}`, `How to Get Started With ${K} (Step by Step)`, `The Right Way to Do ${K}`],
        listicle: [`${n} ${K} Tips That Actually Work`, `${n} Mistakes to Avoid With ${K}`, `${n} ${K} Tools You Need Today`, `Top ${n} ${K} Ideas for Beginners`],
        bold: [`Everything You Know About ${K} Is Wrong`, `Why ${K} Matters More Than Ever`, `The Ultimate Guide to ${K}`, `Stop Struggling With ${K} — Do This Instead`],
      };
      const pool = pools[values.tone] || pools.howto;
      const pick = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
      return { list: pick };
    },
  },
  {
    slug: "blog-outline-generator", title: "Blog Outline Generator", category: ["Content Creation"],
    description: "Generate a structured blog outline (intro, sections, conclusion, FAQ) for any topic.",
    icon: "list-tree", iconColor: "text-emerald-600",
    fields: [{ key: "topic", label: "Topic", type: "text", default: "starting a podcast" }, { key: "sections", label: "Main sections", type: "range", default: 4, min: 2, max: 8, step: 1 }],
    compute: (values) => {
      const t = (values.topic || "your topic").trim();
      const T = t.replace(/\b\w/g, (c) => c.toUpperCase());
      const n = Math.max(2, Math.min(8, num(values.sections)));
      const angles = ["Why it matters", "Getting started", "Key steps", "Common mistakes", "Best tools", "Tips for beginners", "Advanced strategies", "Real examples"];
      const list = [`# ${T}: The Complete Guide`, `## Introduction — hook + what readers will learn`];
      for (let i = 0; i < n; i++) list.push(`## ${i + 1}. ${angles[i]} of ${t}`);
      list.push("## Conclusion — recap + call to action", "## FAQ — 3 common questions");
      return { result: `Outline with ${n + 4} sections`, list };
    },
  },
  {
    slug: "blog-post-ideas", title: "Blog Post Idea Generator", category: ["Content Creation"],
    description: "Generate fresh blog post angles for any topic.",
    icon: "lightbulb", iconColor: "text-amber-500", regenerate: true,
    fields: [{ key: "topic", label: "Topic / niche", type: "text", default: "home fitness" }],
    compute: (values) => {
      const t = (values.topic || "your topic").trim();
      const templates = [`The ultimate beginner's guide to ${t}`, `10 common ${t} mistakes (and how to fix them)`, `${t} on a budget: what really works`, `A day in the life of a ${t} enthusiast`, `${t} myths everyone still believes`, `How I improved my ${t} in 30 days`, `The best ${t} tools of 2026`, `${t} vs. the alternatives: an honest comparison`];
      return { list: [...templates].sort(() => Math.random() - 0.5).slice(0, 5) };
    },
  },
  {
    slug: "call-to-action-generator", title: "Call-to-Action Generator", category: ["Marketing"],
    description: "Generate punchy CTA button and headline variations.",
    icon: "megaphone", iconColor: "text-red-500", regenerate: true,
    fields: [{ key: "offer", label: "What you're offering", type: "text", default: "free trial" }],
    compute: (values) => {
      const o = (values.offer || "it").trim();
      const ctas = [`Start your ${o} now`, `Get ${o} — free`, `Claim your ${o} today`, `Yes, I want ${o}!`, `Try ${o} risk-free`, `Unlock ${o} instantly`, `Grab ${o} before it's gone`, `Join now and get ${o}`];
      return { list: [...ctas].sort(() => Math.random() - 0.5).slice(0, 5) };
    },
  },
  {
    slug: "band-name-generator", title: "Band Name Generator", category: ["Fun"],
    description: "Generate band name ideas by genre.",
    icon: "music", iconColor: "text-purple-600", regenerate: true,
    fields: [{ key: "genre", label: "Genre", type: "select", default: "rock", choices: [{ value: "rock", label: "Rock" }, { value: "indie", label: "Indie" }, { value: "metal", label: "Metal" }, { value: "electronic", label: "Electronic" }] }],
    compute: (values) => {
      const words = {
        rock: [["Electric", "Velvet", "Midnight", "Broken", "Wild"], ["Wolves", "Kings", "Riot", "Echoes", "Thunder"]],
        indie: [["Lonely", "Paper", "Golden", "Quiet", "Neon"], ["Foxes", "Waves", "Ghosts", "Rivers", "Bloom"]],
        metal: [["Iron", "Blackened", "Savage", "Eternal", "Crimson"], ["Reign", "Abyss", "Vein", "Wrath", "Tombs"]],
        electronic: [["Neon", "Digital", "Chrome", "Solar", "Static"], ["Pulse", "Circuit", "Drift", "Signal", "Void"]],
      };
      const [a, b] = words[values.genre] || words.rock;
      const pick = () => "The " + a[Math.floor(Math.random() * a.length)] + " " + b[Math.floor(Math.random() * b.length)];
      const set = new Set(); while (set.size < 5) set.add(pick());
      return { list: [...set] };
    },
  },
  {
    slug: "changelog-generator", title: "Changelog Generator", category: ["Developer"],
    description: "Turn a list of changes into a clean, categorised Keep-a-Changelog entry.",
    icon: "file-text", iconColor: "text-slate-600",
    fields: [{ key: "version", label: "Version", type: "text", default: "1.2.0" }, { key: "changes", label: "Changes (one per line, start with add/fix/change/remove)", type: "textarea", default: "add dark mode\nfix login crash\nchange button colors\nremove legacy API" }],
    compute: (values) => {
      const buckets = { Added: [], Fixed: [], Changed: [], Removed: [] };
      for (const raw of String(values.changes).split("\n").map((l) => l.trim()).filter(Boolean)) {
        const l = raw.toLowerCase();
        const key = l.startsWith("fix") ? "Fixed" : l.startsWith("change") || l.startsWith("update") ? "Changed" : l.startsWith("remove") || l.startsWith("delete") ? "Removed" : "Added";
        buckets[key].push(raw.replace(/^(add|added|fix|fixed|change|changed|update|updated|remove|removed|delete)\s*/i, ""));
      }
      const today = new Date().toISOString().slice(0, 10);
      const list = [`## [${values.version}] - ${today}`];
      for (const [k, v] of Object.entries(buckets)) if (v.length) { list.push(`### ${k}`); v.forEach((x) => list.push(`- ${x}`)); }
      return { result: `Changelog for v${values.version}`, list };
    },
  },
  {
    slug: "chore-chart-maker", title: "Chore Chart Maker", category: ["Productivity"],
    description: "Fairly assign a list of chores across people, round-robin.",
    icon: "list-checks", iconColor: "text-teal-600",
    fields: [{ key: "chores", label: "Chores (one per line)", type: "textarea", default: "Dishes\nVacuum\nTrash\nLaundry\nBathroom\nGroceries" }, { key: "people", label: "People (one per line)", type: "textarea", default: "Alex\nSam\nJordan" }],
    compute: (values) => {
      const chores = String(values.chores).split("\n").map((l) => l.trim()).filter(Boolean);
      const people = String(values.people).split("\n").map((l) => l.trim()).filter(Boolean);
      if (!chores.length || !people.length) return { result: "—", caption: "Add chores and people" };
      const rows = chores.map((c, i) => [c, people[i % people.length]]);
      return { result: `${chores.length} chores across ${people.length} people`, table: { headers: ["Chore", "Assigned to"], rows } };
    },
  },
  {
    slug: "bucket-list-maker", title: "Bucket List Goal Planner", category: ["Lifestyle"],
    description: "Turn a goal and target date into a plan with a countdown and milestones.",
    icon: "map-pin", iconColor: "text-rose-500",
    fields: [{ key: "goal", label: "Your goal", type: "text", default: "Visit Japan" }, { key: "target", label: "Target date", type: "date", default: "" }],
    compute: (values) => {
      const goal = (values.goal || "").trim();
      if (!goal) return { result: "—", caption: "Enter a goal" };
      const rows = [];
      let caption = "";
      const t = new Date(values.target);
      if (!isNaN(t)) {
        const days = Math.ceil((t - new Date()) / 86400000);
        caption = days >= 0 ? `${days} days to go` : `${Math.abs(days)} days overdue`;
        rows.push(["Target", t.toLocaleDateString()], ["Countdown", (days >= 0 ? days : 0) + " days"], ["Save per week", "set a small weekly step"]);
      }
      return { result: "🎯 " + goal, caption, rows, list: ["1. Break it into 3 milestones", "2. Set a monthly reminder", "3. Track progress weekly"] };
    },
  },
  {
    slug: "coin-toss-streak-game", title: "Coin Toss Streak Game", category: ["Fun"],
    description: "Flip 20 coins at once and see the longest run of the same side.",
    icon: "circle-dollar-sign", iconColor: "text-amber-600", regenerate: true,
    fields: [],
    compute: () => {
      let seq = "", best = 1, cur = 1, last = "";
      for (let i = 0; i < 20; i++) { const f = Math.random() < 0.5 ? "H" : "T"; seq += f; if (f === last) { cur++; best = Math.max(best, cur); } else cur = 1; last = f; }
      const heads = seq.split("").filter((c) => c === "H").length;
      return { result: seq.match(/.{1,10}/g).join(" "), caption: "Longest streak: " + best, rows: [["Heads", heads], ["Tails", 20 - heads]] };
    },
  },
  {
    slug: "magic-8-ball", title: "Magic 8 Ball", category: ["Fun"],
    description: "Ask a yes/no question and let the Magic 8 Ball decide.",
    icon: "circle-help", iconColor: "text-slate-800", regenerate: true,
    fields: [{ key: "question", label: "Your question", type: "text", default: "", required: false }],
    compute: (values) => {
      const a = ["It is certain", "Without a doubt", "Yes — definitely", "Most likely", "Outlook good", "Signs point to yes", "Reply hazy, try again", "Ask again later", "Cannot predict now", "Don't count on it", "My reply is no", "Very doubtful", "Outlook not so good"];
      return { result: "🎱 " + a[Math.floor(Math.random() * a.length)], caption: values.question ? `"${values.question}"` : "Ask a yes/no question, then shake" };
    },
  },

  // ---------------------------------------------------------------- design / misc
  {
    slug: "box-shadow-generator", title: "CSS Box Shadow Generator", category: ["Design"],
    description: "Build a CSS box-shadow and copy the ready-to-use rule.",
    icon: "square", iconColor: "text-indigo-500",
    fields: [{ key: "x", label: "Horizontal offset (px)", type: "range", default: 4, min: -50, max: 50, step: 1 }, { key: "y", label: "Vertical offset (px)", type: "range", default: 6, min: -50, max: 50, step: 1 }, { key: "blur", label: "Blur (px)", type: "range", default: 12, min: 0, max: 100, step: 1 }, { key: "spread", label: "Spread (px)", type: "range", default: 0, min: -50, max: 50, step: 1 }, { key: "color", label: "Color", type: "text", default: "rgba(0,0,0,0.25)" }, { key: "inset", label: "Inset", type: "toggle", default: false, checkboxLabel: "Inner shadow" }],
    compute: (values) => {
      const css = `${values.inset ? "inset " : ""}${num(values.x)}px ${num(values.y)}px ${num(values.blur)}px ${num(values.spread)}px ${values.color}`;
      return { result: css, caption: "box-shadow value", rows: [["Full rule", `box-shadow: ${css};`]] };
    },
  },
  {
    slug: "carpet-area-calculator", title: "Carpet / Floor Area Calculator", category: ["Utility"],
    description: "Calculate floor area and material needed for a room.",
    icon: "ruler", iconColor: "text-teal-600",
    fields: [{ key: "length", label: "Length", type: "number", default: "5" }, { key: "width", label: "Width", type: "number", default: "4" }, { key: "unit", label: "Unit", type: "select", default: "m", choices: [{ value: "m", label: "Meters" }, { value: "ft", label: "Feet" }] }],
    compute: (values) => {
      const l = num(values.length), w = num(values.width);
      if (l <= 0 || w <= 0) return { result: "—", caption: "Enter length and width" };
      const area = l * w;
      const sqm = values.unit === "ft" ? area * 0.092903 : area;
      const sqft = values.unit === "ft" ? area : area * 10.7639;
      return { result: area.toFixed(2) + " " + (values.unit === "ft" ? "sq ft" : "m²"), rows: [["Square meters", sqm.toFixed(2)], ["Square feet", sqft.toFixed(2)], ["+10% wastage", (area * 1.1).toFixed(2)]] };
    },
  },
];

// ---------------------------------------------------------------------------
// compute() bodies use num()/money() for brevity; inject self-contained
// definitions as the first statements so each function stands alone (works in
// the sandbox AND the browser, with no module-scope dependencies).
const PREAMBLE = ' const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";';
function selfContained(fn) {
  const src = fn.toString();
  return src.replace(/=>\s*\{/, "=> {" + PREAMBLE);
}

async function main() {
  let ok = 0; const fails = [];
  for (const s of S) {
    const raw = { ...s, compute: selfContained(s.compute) };
    const v = await validateRawSpec({ slug: s.slug, name: s.title, category: s.category }, raw);
    if (!v.ok) { fails.push([s.slug, v.error]); continue; }
    if (!DRY) emitTool(v.spec, TOOLS);
    ok++;
    console.log(`  ✅ ${s.slug}`);
  }
  console.log(`\n${DRY ? "[dry] " : ""}authored ${ok}/${S.length} tools`);
  if (fails.length) { console.log("FAILURES:"); for (const [slug, err] of fails) console.log(`  ❌ ${slug} — ${err}`); process.exit(1); }
}
main();
