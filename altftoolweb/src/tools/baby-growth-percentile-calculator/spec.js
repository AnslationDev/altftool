// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "baby-growth-percentile-calculator",
  "title": "Baby Growth Percentile Calculator",
  "description": "A rough weight-for-age percentile estimate for babies 0–24 months.",
  "badge": "Health",
  "category": [
    "Health"
  ],
  "icon": "baby",
  "iconColor": "text-pink-500",
  "fields": [
    {
      "key": "sex",
      "label": "Sex",
      "type": "select",
      "default": "male",
      "choices": [
        {
          "value": "male",
          "label": "Boy"
        },
        {
          "value": "female",
          "label": "Girl"
        }
      ]
    },
    {
      "key": "age_months",
      "label": "Age (months)",
      "type": "number",
      "default": "6",
      "min": 0,
      "max": 24
    },
    {
      "key": "weight",
      "label": "Weight (kg)",
      "type": "number",
      "default": "7.5",
      "min": 0
    }
  ],
  "note": "A simplified estimate — always use your pediatrician's official growth charts."
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
      const rawAge = num(values.age_months);
      const a = Math.max(0, Math.min(24, rawAge));
      // WHO weight-for-age anchor points (median kg, SD kg) at 0, 3, 6, 9, 12,
      // 18 and 24 months, interpolated linearly between them.
      //
      // The previous formula was `base + a * (a < 6 ? 0.7 : 0.35)`, which
      // re-applied a flat rate to the whole age instead of accumulating it. It
      // was low by 2.5 kg at 6 months and jumped 7.43 -> 5.40 kg across the
      // 5.9/6.0-month boundary, so the same infant read the 48th percentile one
      // day and the 99th the next.
      const ANCHORS = values.sex === "female"
        ? [[0, 3.2, 0.4], [3, 5.8, 0.7], [6, 7.3, 0.8], [9, 8.2, 0.9], [12, 8.9, 1.0], [18, 10.2, 1.2], [24, 11.5, 1.3]]
        : [[0, 3.3, 0.4], [3, 6.4, 0.7], [6, 7.9, 0.8], [9, 8.9, 0.9], [12, 9.6, 1.0], [18, 10.9, 1.2], [24, 12.2, 1.3]];
      let lo = ANCHORS[0], hi = ANCHORS[ANCHORS.length - 1];
      for (let i = 0; i < ANCHORS.length - 1; i += 1) {
        if (a >= ANCHORS[i][0] && a <= ANCHORS[i + 1][0]) { lo = ANCHORS[i]; hi = ANCHORS[i + 1]; break; }
      }
      const span = hi[0] - lo[0];
      const t = span > 0 ? (a - lo[0]) / span : 0;
      const median = lo[1] + (hi[1] - lo[1]) * t;
      const sd = lo[2] + (hi[2] - lo[2]) * t;
      const z = (num(values.weight) - median) / sd;
      const pct = Math.round(100 * (0.5 * (1 + erf(z / Math.SQRT2))));
      function erf(x) { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
      const percentile = Math.max(1, Math.min(99, pct));
      const mod100 = percentile % 100;
      const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : percentile % 10 === 1 ? "st" : percentile % 10 === 2 ? "nd" : percentile % 10 === 3 ? "rd" : "th";
      // The chart only has anchor points for 0-24 months, so an age typed
      // outside that range is silently clamped above to the nearest anchor.
      // Say so in the caption instead of presenting the percentile as if it
      // were computed for the age the user actually typed.
      const clampNote = Number.isFinite(rawAge) && rawAge !== a
        ? ` Age entered was ${rawAge} month${rawAge === 1 ? "" : "s"} — showing the ${a}-month estimate, the ${a === 24 ? "oldest" : "youngest"} this simplified table supports.`
        : "";
      return { result: `~${percentile}${suffix} percentile`, caption: `Median for age ≈ ${median.toFixed(1)} kg${clampNote}`, rows: [["Your baby", num(values.weight).toFixed(1) + " kg"], ["Z-score", z.toFixed(2)]] };
    },
};

export default spec;
