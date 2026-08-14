// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "identity-minimizing-dsar-planner",
  "title": "Identity-Minimizing DSAR Planner",
  "description": "Plan the minimum identity proof needed to verify a privacy request.",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Productivity"
  ],
  "icon": "badge-check",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "request",
      "label": "Request type",
      "type": "select",
      "default": "access",
      "choices": [
        {
          "value": "access",
          "label": "Access / copy"
        },
        {
          "value": "correction",
          "label": "Correction"
        },
        {
          "value": "deletion",
          "label": "Deletion"
        },
        {
          "value": "account",
          "label": "Account control"
        }
      ]
    },
    {
      "key": "risk",
      "label": "Disclosure risk",
      "type": "select",
      "default": "medium",
      "choices": [
        {
          "value": "low",
          "label": "Low"
        },
        {
          "value": "medium",
          "label": "Medium"
        },
        {
          "value": "high",
          "label": "High"
        }
      ]
    },
    {
      "key": "factors",
      "label": "Already-held verification factors",
      "type": "textarea",
      "default": "Signed-in session\nVerified email\nRecent support ticket ID"
    },
    {
      "key": "sensitive",
      "label": "Sensitive data involved",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "The response may expose sensitive or third-party data"
    }
  ],
  "presets": [
    {
      "label": "Signed-in access request",
      "values": {
        "request": "access",
        "risk": "medium",
        "factors": "Signed-in session\nVerified email",
        "sensitive": false
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions."
},
  compute: (values) => {
      const factors = String(values.factors || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
      let needed = values.risk === "high" ? 3 : values.risk === "medium" ? 2 : 1;
      if (values.sensitive) needed += 1;
      const selected = factors.slice(0, Math.min(needed, factors.length));
      return { result: selected.length + " existing factor(s) selected", caption: "Target " + needed + " proportionate factor(s) for " + values.request, rows: [["Available factors", factors.length], ["Target assurance", values.risk], ["Sensitive context", values.sensitive ? "Yes" : "No"]], list: [...selected.map((item) => "Use: " + item), "Avoid requesting new identity documents unless the risk cannot be managed with already-held factors.", "Delete temporary proof promptly under a documented schedule."] };
    },
};

export default spec;
