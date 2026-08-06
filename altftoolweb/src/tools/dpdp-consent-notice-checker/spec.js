// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "dpdp-consent-notice-checker",
  "title": "DPDP Consent Notice Checker",
  "description": "Inspect a consent notice for completeness against a versioned India DPDP checklist.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Business"
  ],
  "icon": "scan-search",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "text",
      "label": "Consent notice",
      "type": "textarea",
      "default": "",
      "placeholder": "Paste the notice, policy, payload, or observations here…"
    },
    {
      "key": "strict",
      "label": "Strict review",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Require every checklist signal"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "text": "data fiduciary. personal data. purpose. consent. withdraw. rights. grievance. plain language",
        "strict": true
      }
    }
  ],
  "outputLabel": "Audit report",
  "note": "Checklist aid for India DPDP notice review; it does not certify statutory compliance. Confirm current rules and sector-specific duties with qualified counsel."
},
  compute: (values) => {
      const source = String(values.text || "");
      const lower = source.toLowerCase();
      const checks = [{"name":"Data fiduciary identity","patterns":["data fiduciary","organisation","organization"]},{"name":"Personal data described","patterns":["personal data","data collected"]},{"name":"Purpose stated","patterns":["purpose","why we collect"]},{"name":"Consent action","patterns":["consent","agree"]},{"name":"Withdrawal route","patterns":["withdraw","revoke consent"]},{"name":"Rights route","patterns":["rights","access","correction"]},{"name":"Grievance contact","patterns":["grievance","complaint"]},{"name":"Language clarity","patterns":["plain language","clear language"]}];
      const rows = checks.map((check) => {
        const hit = check.patterns.some((pattern) => lower.includes(String(pattern).toLowerCase()));
        return [check.name, hit ? "Found" : "Missing"];
      });
      const found = rows.filter((row) => row[1] === "Found").length;
      const score = checks.length ? Math.round((found / checks.length) * 100) : 0;
      const missing = rows.filter((row) => row[1] === "Missing").map((row) => row[0]);
      return {
        result: score + "% checklist coverage",
        caption: values.strict && missing.length ? missing.length + " required signal(s) need review" : found + " of " + checks.length + " signals found",
        rows,
        list: missing.length ? missing.map((item) => "Review: " + item) : ["All configured signals were found. Verify wording and legal accuracy manually."],
      };
    },
};

export default spec;
