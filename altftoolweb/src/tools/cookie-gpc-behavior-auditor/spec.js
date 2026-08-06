// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "cookie-gpc-behavior-auditor",
  "title": "Cookie & GPC Behavior Auditor",
  "description": "Test how a site responds to a cookie reject action and to Global Privacy Control.",
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
      "label": "Observed requests, response headers, or test notes",
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
        "text": "reject. blocked. sec-gpc. cookie preference. manage preferences. not preselected",
        "strict": true
      }
    }
  ],
  "outputLabel": "Audit report"
},
  compute: (values) => {
      const source = String(values.text || "");
      const lower = source.toLowerCase();
      const checks = [{"name":"Reject is available","patterns":["reject","decline"]},{"name":"Reject stops non-essential tags","patterns":["blocked","not loaded","no analytics"]},{"name":"GPC signal tested","patterns":["sec-gpc","global privacy control","gpc"]},{"name":"Preference persists","patterns":["cookie preference","consent saved","persist"]},{"name":"Change-control route","patterns":["manage preferences","cookie settings"]},{"name":"No preselected consent","patterns":["not preselected","default off","unchecked"]}];
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
