// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "privacy-policy-version-diff",
  "title": "Privacy Policy Version Diff",
  "description": "Highlight the privacy changes that actually matter between two policy versions.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Text & Writing"
  ],
  "icon": "file-diff",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "before",
      "label": "Previous policy",
      "type": "textarea",
      "default": "We collect email for account access.\nWe retain support messages for 12 months."
    },
    {
      "key": "after",
      "label": "Updated policy",
      "type": "textarea",
      "default": "We collect email and phone for account access.\nWe retain support messages for 24 months."
    },
    {
      "key": "ignore_case",
      "label": "Ignore letter case",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Treat capitalization-only changes as equal"
    }
  ],
  "presets": [
    {
      "label": "Retention change",
      "values": {
        "before": "We retain logs for 30 days.",
        "after": "We retain logs for 90 days.",
        "ignore_case": true
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions."
},
  compute: (values) => {
      const normalize = (line) => values.ignore_case ? line.trim().toLowerCase() : line.trim();
      const before = String(values.before || "").split(/\r?\n/).filter((line) => line.trim());
      const after = String(values.after || "").split(/\r?\n/).filter((line) => line.trim());
      const beforeSet = new Set(before.map(normalize));
      const afterSet = new Set(after.map(normalize));
      const removed = before.filter((line) => !afterSet.has(normalize(line)));
      const added = after.filter((line) => !beforeSet.has(normalize(line)));
      const sensitive = [...added, ...removed].filter((line) => /collect|share|retain|delete|sell|consent|right|transfer|processor|cookie/i.test(line));
      const rowLimit = 100;
      const changeLines = [...added.map((line) => "+ " + line), ...removed.map((line) => "− " + line)];
      const truncated = changeLines.length > rowLimit;
      const list = changeLines.slice(0, rowLimit);
      if (truncated) {
        list.push(
          "Showing the first " + rowLimit + " of " + changeLines.length +
            " changed line(s). Copy and download only include what's shown here — split larger policies into multiple comparisons."
        );
      }
      return { result: added.length + " added · " + removed.length + " removed", caption: sensitive.length + " privacy-sensitive changed line(s)", rows: [["Before lines", before.length], ["After lines", after.length], ["Sensitive changes", sensitive.length]], list };
    },
};

export default spec;
