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
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions.",
  "confirmReset": "Reset and clear both pasted policy versions? This cannot be undone."
},
  compute: (values) => {
      const normalize = (line) => values.ignore_case ? line.trim().toLowerCase() : line.trim();
      const before = String(values.before || "").split(/\r?\n/).filter((line) => line.trim());
      const after = String(values.after || "").split(/\r?\n/).filter((line) => line.trim());
      // Multiset (not Set) membership: a line that appears N times on one
      // side and M times on the other must show |N-M| adds/removes, not be
      // silently treated as unchanged just because the normalized text is
      // present on both sides at least once.
      const countLines = (lines) => {
        const counts = new Map();
        for (const line of lines) {
          const key = normalize(line);
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        return counts;
      };
      const beforeCounts = countLines(before);
      const afterCounts = countLines(after);
      const removedSeen = new Map();
      const removed = before.filter((line) => {
        const key = normalize(line);
        const deficit = (beforeCounts.get(key) || 0) - (afterCounts.get(key) || 0);
        const seen = removedSeen.get(key) || 0;
        if (seen >= deficit) return false;
        removedSeen.set(key, seen + 1);
        return true;
      });
      const addedSeen = new Map();
      const added = after.filter((line) => {
        const key = normalize(line);
        const surplus = (afterCounts.get(key) || 0) - (beforeCounts.get(key) || 0);
        const seen = addedSeen.get(key) || 0;
        if (seen >= surplus) return false;
        addedSeen.set(key, seen + 1);
        return true;
      });
      const sensitive = [...added, ...removed].filter((line) => /\b(collect|share|retain|delete|sell|consent|right|transfer|processor|cookie)/i.test(line));
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
