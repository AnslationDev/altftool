// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "bond-yield-calculator",
  "title": "Bond Yield Calculator",
  "description": "Current yield and approximate yield-to-maturity for a bond.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "landmark",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "face_value",
      "label": "Face value",
      "type": "number",
      "default": "1000"
    },
    {
      "key": "coupon_rate",
      "label": "Coupon rate (%/yr)",
      "type": "number",
      "default": "6"
    },
    {
      "key": "price",
      "label": "Market price",
      "type": "number",
      "default": "950"
    },
    {
      "key": "years",
      "label": "Years to maturity",
      "type": "number",
      "default": "10"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const fv = num(values.face_value), c = num(values.coupon_rate) / 100, p = num(values.price), y = num(values.years);
      if (p <= 0 || y <= 0) return { result: "—", caption: "Enter price and years" };
      const coupon = fv * c;
      const current = (coupon / p) * 100;
      const ytm = ((coupon + (fv - p) / y) / ((fv + p) / 2)) * 100;
      return { result: "Current yield " + current.toFixed(2) + "%", rows: [["Annual coupon", money(coupon)], ["Approx. YTM", ytm.toFixed(2) + "%"], ["Discount/premium", money(p - fv)]] };
    },
};

export default spec;
