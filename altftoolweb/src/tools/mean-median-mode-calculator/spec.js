// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "mean-median-mode-calculator",
  "title": "Mean, Median & Mode Calculator",
  "description": "Mean, median, mode, range and standard deviation from a list of numbers.",
  "badge": "Math",
  "category": [
    "Math"
  ],
  "icon": "sigma",
  "iconColor": "text-blue-600",
  "fields": [
    {
      "key": "numbers",
      "label": "Numbers (comma or space separated)",
      "type": "textarea",
      "default": "4, 8, 15, 16, 23, 42, 8"
    }
  ]
},
  compute: (values) => { const num=(v)=>typeof v==="number"?v:Number(v); const money=(n)=>Number.isFinite(Number(n))?Number(n).toLocaleString(undefined,{maximumFractionDigits:2}):"—";
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
};

export default spec;
