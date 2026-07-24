// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "loan-fee-extractor",
  "title": "Loan Fee Extractor",
  "description": "Agreement se fees, penalties, reset clauses aur hidden charges extract kare.",
  "badge": "Consumer, Family & Personal Resilience",
  "category": [
    "Finance",
    "Security & Privacy"
  ],
  "icon": "scan-text",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "agreement",
      "label": "Loan agreement text",
      "type": "textarea",
      "default": "Processing fee: ₹2,500. Late payment charge: 2% per month. Prepayment penalty: 3% of outstanding principal. Interest rate may reset every 12 months."
    },
    {
      "key": "currency",
      "label": "Currency label",
      "type": "text",
      "default": "INR"
    },
    {
      "key": "include_context",
      "label": "Include matched context",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Show extracted clause snippets"
    }
  ],
  "presets": [
    {
      "label": "Fee clauses",
      "values": {
        "agreement": "Processing fee: ₹2,500. Late payment charge: 2% per month. Prepayment penalty: 3%. Rate resets annually.",
        "currency": "INR",
        "include_context": true
      }
    }
  ],
  "note": "Local keyword and amount extraction, not legal interpretation. Read the full agreement and key-fact statement; confirm fees, interest, tax, reset clauses, and lender disclosures."
},
  compute: (values) => {
      const text = String(values.agreement || "");
      const sentences = text.split(/(?<=[.!?])\s+|\r?\n/).map((sentence) => sentence.trim()).filter(Boolean);
      const rules = [["Processing / origination", /processing|origination|application fee/i], ["Late payment", /late|overdue|default charge/i], ["Prepayment / foreclosure", /prepay|foreclos|early repayment/i], ["Rate reset", /reset|floating|benchmark|spread/i], ["Insurance / add-on", /insurance|protection plan|add-on/i], ["Collection / bounce", /collection|bounce|dishonou?r|ecs|nach/i]];
      const findings = [];
      for (const [type, pattern] of rules) {
        const matches = sentences.filter((sentence) => pattern.test(sentence));
        for (const sentence of matches) {
          const amounts = sentence.match(/(?:₹|rs\.?|inr|\$)?\s*\d[\d,]*(?:\.\d+)?\s*%?/gi) || [];
          findings.push([type, amounts.join(", ") || "No numeric amount found", values.include_context ? sentence.slice(0, 240) : "Context hidden"]);
        }
      }
      return { result: findings.length + " possible fee / reset clause(s)", caption: values.currency + " · review every match manually", rows: [["Text characters", text.length], ["Clause types", new Set(findings.map((row) => row[0])).size]], table: { headers: ["Type", "Amount / rate", "Context"], rows: findings }, list: findings.length ? [] : ["No configured fee keywords found; manually review schedules, annexures, and key-fact statements."] };
    },
};

export default spec;
