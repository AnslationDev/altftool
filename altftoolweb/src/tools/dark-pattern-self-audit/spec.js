// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "dark-pattern-self-audit",
  "title": "Dark-Pattern Self-Audit",
  "description": "Manipulative consent, checkout aur cancellation UX flag kare.",
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
      "label": "Consent, checkout, or cancellation copy and observations",
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
        "text": "equal prominence. not preselected. neutral copy. total price. cancel button. single prompt",
        "strict": true
      }
    }
  ],
  "outputLabel": "Audit report",
  "note": "A self-audit prompt, not a definitive legal determination. Test the complete journey with keyboard, mobile, and assistive technology."
},
  compute: (values) => {
      const source = String(values.text || "");
      const lower = source.toLowerCase();
      const checks = [{"name":"Equal visual choice","patterns":["equal prominence","same size","balanced"]},{"name":"No preselection","patterns":["not preselected","unchecked"]},{"name":"No confirmshaming","patterns":["neutral copy","no guilt"]},{"name":"No hidden cost","patterns":["total price","all fees"]},{"name":"Cancellation is direct","patterns":["cancel button","self-service cancellation"]},{"name":"No repeated obstruction","patterns":["single prompt","no repeated prompt"]}];
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
