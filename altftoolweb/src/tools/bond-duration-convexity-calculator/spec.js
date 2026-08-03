// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bond-duration-convexity-calculator",
  "title": "Bond Duration & Convexity Calculator",
  "description": "Calculate a bond's Macaulay duration, modified duration, and convexity to measure its price sensitivity to interest rate changes.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Finance",
    "Calculator"
  ],
  "icon": "landmark",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "face",
      "label": "Face value",
      "type": "number",
      "default": 1000,
      "min": 0.01
    },
    {
      "key": "coupon",
      "label": "Annual coupon rate (%)",
      "type": "number",
      "default": 6,
      "min": 0
    },
    {
      "key": "yield_rate",
      "label": "Yield to maturity (%)",
      "type": "number",
      "default": 7
    },
    {
      "key": "years",
      "label": "Years to maturity",
      "type": "number",
      "default": 8,
      "min": 0.1
    },
    {
      "key": "frequency",
      "label": "Payments per year",
      "type": "select",
      "default": "2",
      "choices": [
        {
          "value": "1",
          "label": "Annual"
        },
        {
          "value": "2",
          "label": "Semiannual"
        },
        {
          "value": "4",
          "label": "Quarterly"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "8-year bond",
      "values": {
        "face": 1000,
        "coupon": 6,
        "yield_rate": 7,
        "years": 8,
        "frequency": "2"
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
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
    },
};

export default spec;
