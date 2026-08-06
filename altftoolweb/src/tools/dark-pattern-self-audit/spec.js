// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "dark-pattern-self-audit",
  "title": "Dark-Pattern Self-Audit",
  "description": "Flag manipulative consent, checkout and cancellation patterns in your own product.",
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
      // Multi-word phrases only — bare single common words (the old "balanced"
      // and "unchecked" entries) matched incidental, unrelated uses of those
      // words elsewhere in the pasted text and produced a false "Found" for a
      // signal the same text was actually failing.
      const checks = [{"name":"Equal visual choice","patterns":["equal prominence","same size","equal weight"]},{"name":"No preselection","patterns":["not preselected","not pre-ticked","unchecked by default"]},{"name":"No confirmshaming","patterns":["neutral copy","no guilt"]},{"name":"No hidden cost","patterns":["total price","all fees"]},{"name":"Cancellation is direct","patterns":["cancel button","self-service cancellation"]},{"name":"No repeated obstruction","patterns":["single prompt","no repeated prompt"]}];
      const rows = checks.map((check) => {
        const hit = check.patterns.some((pattern) => lower.includes(String(pattern).toLowerCase()));
        return [check.name, hit ? "Found" : "Missing"];
      });
      const found = rows.filter((row) => row[1] === "Found").length;
      const missing = rows.filter((row) => row[1] === "Missing").map((row) => row[0]);
      // Strict mode refuses partial credit: every signal has to be evidenced
      // to score as compliant, so one unaddressed item still shows as needing
      // review instead of being averaged into a comfortable-looking
      // percentage. With strict off, coverage is the proportional score.
      const score = values.strict
        ? (missing.length === 0 ? 100 : 0)
        : (checks.length ? Math.round((found / checks.length) * 100) : 0);
      return {
        result: score + "% checklist coverage",
        caption: values.strict && missing.length ? missing.length + " required signal(s) need review" : found + " of " + checks.length + " signals found",
        rows,
        list: missing.length ? missing.map((item) => "Review: " + item) : ["All configured signals were found. Verify wording and legal accuracy manually."],
      };
    },
};

export default spec;
