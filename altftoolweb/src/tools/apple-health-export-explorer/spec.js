// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "apple-health-export-explorer",
  "title": "Apple Health Export Explorer",
  "description": "Health export ko readable local charts me convert kare.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Health & Fitness",
    "Developer"
  ],
  "icon": "file-heart",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "xml",
      "label": "Apple Health export.xml content or Record lines",
      "type": "textarea",
      "default": "<Record type=\"HKQuantityTypeIdentifierStepCount\" value=\"8421\" unit=\"count\" startDate=\"2026-07-20\"/>\n<Record type=\"HKQuantityTypeIdentifierHeartRate\" value=\"72\" unit=\"count/min\" startDate=\"2026-07-20\"/>"
    },
    {
      "key": "limit",
      "label": "Maximum records to summarize",
      "type": "number",
      "default": 5000,
      "min": 1,
      "max": 50000
    }
  ],
  "presets": [
    {
      "label": "Two records",
      "values": {
        "xml": "<Record type=\"HKQuantityTypeIdentifierStepCount\" value=\"8421\" unit=\"count\" startDate=\"2026-07-20\"/>\n<Record type=\"HKQuantityTypeIdentifierHeartRate\" value=\"72\" unit=\"count/min\" startDate=\"2026-07-20\"/>",
        "limit": 5000
      }
    }
  ],
  "note": "Local lightweight XML attribute explorer. Apple Health types/units are heterogeneous; it does not fully parse nested workout/routes, clinical records, timezone semantics, provenance, or medical meaning."
},
  compute: (values) => {
      const text = String(values.xml || ""), limit = Math.max(1, Math.min(50000, Number(values.limit) || 5000)), matches = [...text.matchAll(/<Record\b([^>]+)\/?\s*>/g)].slice(0, limit);
      const attributes = (source) => Object.fromEntries([...source.matchAll(/([A-Za-z]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
      const records = matches.map((match) => attributes(match[1])), groups = new Map();
      for (const record of records) { const type = String(record.type || "Unknown").replace(/^HK\w+Identifier/, ""); const current = groups.get(type) || { count: 0, samples: [], unit: record.unit || "" }; current.count += 1; const number = Number(record.value); if (Number.isFinite(number)) current.samples.push(number); groups.set(type, current); }
      const rows = [...groups.entries()].map(([type, group]) => [type, group.count, group.unit || "—", group.samples.length ? (group.samples.reduce((sum, value) => sum + value, 0) / group.samples.length).toFixed(4) : "Non-numeric", group.samples.length ? Math.min(...group.samples) : "—", group.samples.length ? Math.max(...group.samples) : "—"]).sort((a, b) => b[1] - a[1]);
      return { result: records.length + " Record element(s) parsed", caption: groups.size + " type(s)", rows: [["Input characters", text.length], ["Limit", limit], ["Types", groups.size]], table: { headers: ["Type", "Count", "Unit", "Mean", "Min", "Max"], rows } };
    },
};

export default spec;
