// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "analytics-pii-checker",
  "title": "Analytics PII Checker",
  "description": "Detect personal data accidentally transmitted inside your analytics payloads.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Developer"
  ],
  "icon": "shield-alert",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "payload",
      "label": "Analytics payload or request log",
      "type": "textarea",
      "default": "{\"event\":\"checkout\",\"email\":\"person@example.com\",\"order_id\":\"A-100\"}"
    },
    {
      "key": "include_values",
      "label": "Show masked findings",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Include masked examples in the report"
    }
  ],
  "presets": [
    {
      "label": "JSON payload",
      "values": {
        "payload": "{\"email\":\"person@example.com\",\"phone\":\"+91 9876543210\",\"ip\":\"203.0.113.10\"}",
        "include_values": true
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions."
},
  compute: (values) => {
      const text = String(values.payload || "");
      const detectors = [
        ["Email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
        ["Phone", /(?:\+?\d[\d .()-]{7,}\d)/g],
        ["IPv4", /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
        ["Authorization token", /(?:authorization|bearer|api[_-]?key|token)[\"'=:\s]+[A-Za-z0-9._-]{8,}/gi],
        ["Sensitive key", /[\"']?(?:name|email|phone|address|dob|aadhaar|pan|passport|user_id)[\"']?\s*[:=]/gi],
      ];
      const findings = [];
      for (const [type, pattern] of detectors) {
        const matches = [...text.matchAll(pattern)];
        if (!matches.length) continue;
        const sample = matches[0][0];
        const masked = sample.length < 5 ? "•••" : sample.slice(0, 2) + "…" + sample.slice(-2);
        findings.push([type, matches.length, values.include_values ? masked : "Hidden"]);
      }
      return { result: findings.length ? findings.reduce((sum, row) => sum + row[1], 0) + " possible exposure(s)" : "No configured PII signals found", caption: findings.length + " detector type(s) triggered", table: { headers: ["Type", "Count", "Masked example"], rows: findings }, list: findings.length ? ["Confirm whether each value is necessary, documented, consented, and appropriately minimized."] : ["Review custom identifiers and nested payload fields manually."] };
    },
};

export default spec;
