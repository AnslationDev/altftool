// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "insurance-policy-comparator",
  "title": "Insurance Policy Comparator",
  "description": "Compare insurance policies on coverage, exclusions, waiting periods and limits.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Finance",
    "Lifestyle"
  ],
  "icon": "shield-check",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "policies",
      "label": "Policy comparison rows",
      "type": "textarea",
      "default": "Policy A | 12000 | 500000 | 30 days | 10% co-pay | Room cap ₹5,000 | Pre-existing 3 years\nPolicy B | 14500 | 750000 | 60 days | No co-pay | No room cap | Pre-existing 2 years",
      "hint": "Policy | premium | coverage | waiting | co-pay | key limits | exclusions"
    },
    {
      "key": "priority",
      "label": "Primary comparison priority",
      "type": "select",
      "default": "coverage",
      "choices": [
        {
          "value": "coverage",
          "label": "Higher coverage"
        },
        {
          "value": "premium",
          "label": "Lower premium"
        },
        {
          "value": "waiting",
          "label": "Shorter waiting period"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "Two health policies",
      "values": {
        "policies": "Policy A | 12000 | 500000 | 30 days | 10% co-pay | Room cap | PED 3 years\nPolicy B | 14500 | 750000 | 60 days | No co-pay | No room cap | PED 2 years",
        "priority": "coverage"
      }
    }
  ],
  "note": "Comparison organizer only. Read official policy wording, schedules, exclusions, sub-limits, network, claims rules, renewability, taxes, and current insurer disclosures."
},
  compute: (values) => {
      const parsed = String(values.policies || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split("|").map((cell) => cell.trim()));
      const parseAmt = (s) => { const n = Number(String(s ?? "").replace(/[,₹$\s]/g, "")); return Number.isFinite(n) ? n : NaN; };
      const toDays = (s) => { const m = String(s || "").match(/([\d.]+)\s*(day|week|month|year)/i); if (!m) return 9999; const n = parseFloat(m[1]); const u = m[2].toLowerCase(); return u.startsWith("year") ? n * 365 : u.startsWith("month") ? n * 30 : u.startsWith("week") ? n * 7 : n; };
      const rows = parsed.map((row) => [row[0] || "—", parseAmt(row[1]), parseAmt(row[2]), row[3] || "—", row[4] || "—", row[5] || "—", row[6] || "—"]);
      const ranked = [...rows].sort((a, b) => values.priority === "premium" ? (Number.isNaN(a[1]) ? Infinity : a[1]) - (Number.isNaN(b[1]) ? Infinity : b[1]) : values.priority === "coverage" ? (Number.isNaN(b[2]) ? -Infinity : b[2]) - (Number.isNaN(a[2]) ? -Infinity : a[2]) : toDays(a[3]) - toDays(b[3]));
      const premiums = rows.map((row) => row[1]).filter(Number.isFinite);
      const coverages = rows.map((row) => row[2]).filter(Number.isFinite);
      return { result: ranked.length ? ranked[0][0] + " ranks first for " + values.priority : "No policies entered", caption: "Ranking uses only the entered fields", rows: [["Policies compared", rows.length], ["Lowest premium", premiums.length ? Math.min(...premiums) : "—"], ["Highest coverage", coverages.length ? Math.max(...coverages) : "—"]], table: { headers: ["Policy", "Premium", "Coverage", "Waiting", "Co-pay", "Limits", "Exclusions"], rows: ranked } };
    },
};

export default spec;
