// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "elimination-diet-correlation-log",
  "title": "Elimination Diet Correlation Log",
  "description": "Log foods and reactions, and surface the possible patterns between them.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Health & Wellness",
    "Productivity"
  ],
  "icon": "salad",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "entries",
      "label": "Food and reaction log",
      "type": "textarea",
      "default": "2026-07-20 | Milk, oats | Bloating | 6 | 3\n2026-07-21 | Rice, vegetables | None | 0 | 2\n2026-07-22 | Milk, tea | Bloating | 5 | 4",
      "hint": "Date | foods (comma-separated) | symptom | severity 0–10 | hours after"
    },
    {
      "key": "minimum",
      "label": "Minimum food appearances",
      "type": "number",
      "default": 1,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Example log",
      "values": {
        "entries": "2026-07-20 | Milk, oats | Bloating | 6 | 3\n2026-07-21 | Rice, vegetables | None | 0 | 2\n2026-07-22 | Milk, tea | Bloating | 5 | 4",
        "minimum": 1
      }
    }
  ],
  "note": "Shows co-occurrence, not causation or diagnosis. Elimination diets can cause nutritional harm; involve a qualified clinician/dietitian for severe reactions, children, pregnancy, chronic illness, or broad restriction."
},
  compute: (values) => {
      const minimum = Math.max(1, Number(values.minimum) || 1);
      const lines = String(values.entries || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const foods = new Map();
      for (const row of lines) {
        const severity = Math.max(0, Math.min(10, Number(row[3]) || 0));
        for (const food of String(row[1] || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)) {
          const current = foods.get(food) || { count: 0, total: 0, symptoms: new Set() };
          current.count += 1; current.total += severity; if (row[2]) current.symptoms.add(row[2]); foods.set(food, current);
        }
      }
      const rows = [...foods.entries()].filter(([, data]) => data.count >= minimum).map(([food, data]) => [food, data.count, (data.total / data.count).toFixed(1), [...data.symptoms].join(", ") || "—"]).sort((a, b) => Number(b[2]) - Number(a[2]));
      return { result: rows.length + " food pattern(s) summarized", caption: lines.length + " dated observations; no causal claim", rows: [["Log entries", lines.length], ["Foods meeting minimum", rows.length]], table: { headers: ["Food", "Appearances", "Average entered severity", "Symptoms noted"], rows }, list: ["Change one planned variable at a time where clinically appropriate and record portion, timing, medication, sleep, and illness as possible confounders."] };
    },
};

export default spec;
