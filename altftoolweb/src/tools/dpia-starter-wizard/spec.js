// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "dpia-starter-wizard",
  "title": "DPIA Starter Wizard",
  "description": "Score a new feature's privacy risk and outline the structure of a Data Protection Impact Assessment (DPIA).",
  "badge": "Privacy Operations & Compliance",
  "category": [
    "Security & Privacy",
    "Business"
  ],
  "icon": "clipboard-list",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "feature",
      "label": "Feature or project",
      "type": "text",
      "default": "Location-based recommendations"
    },
    {
      "key": "data",
      "label": "Personal data involved",
      "type": "textarea",
      "default": "Precise location, device identifier, preference history"
    },
    {
      "key": "people",
      "label": "Affected people",
      "type": "text",
      "default": "Signed-in customers"
    },
    {
      "key": "scale",
      "label": "Scale",
      "type": "select",
      "default": "medium",
      "choices": [
        {
          "value": "small",
          "label": "Small / limited"
        },
        {
          "value": "medium",
          "label": "Medium"
        },
        {
          "value": "large",
          "label": "Large / systematic"
        }
      ]
    },
    {
      "key": "sensitive",
      "label": "Sensitive or vulnerable context",
      "type": "toggle",
      "default": false,
      "checkboxLabel": "Includes sensitive data or vulnerable people"
    },
    {
      "key": "mitigations",
      "label": "Existing safeguards",
      "type": "textarea",
      "default": "Opt-in, coarse-location fallback, short retention, access logging"
    }
  ],
  "presets": [
    {
      "label": "Location feature",
      "values": {
        "feature": "Location recommendations",
        "data": "Precise location and device ID",
        "people": "Customers",
        "scale": "medium",
        "sensitive": false,
        "mitigations": "Opt-in and 30-day retention"
      }
    }
  ],
  "note": "Runs locally in your browser. Review the generated report before relying on it for legal, financial, medical, or safety decisions."
},
  compute: (values) => {
      const text = (values.data + " " + values.feature + " " + values.people).toLowerCase();
      let score = values.scale === "large" ? 4 : values.scale === "medium" ? 2 : 1;
      if (values.sensitive) score += 4;
      if (/location|biometric|health|children|financial|tracking|profil/.test(text)) score += 3;
      const mitigations = String(values.mitigations || "").split(/[,;.\n]+/).map((item) => item.trim()).filter(Boolean);
      score = Math.max(0, score - Math.min(3, mitigations.length));
      const level = score >= 7 ? "High" : score >= 4 ? "Medium" : "Lower";
      return { result: level + " initial privacy risk", caption: "Structured starter for " + values.feature, rows: [["Risk score", score + "/11"], ["Affected people", values.people], ["Safeguards listed", mitigations.length]], list: ["Describe necessity and proportionality", "Map collection, sharing, retention, and deletion", "Record risks to people, not only the business", "Assign mitigation owners and residual risk", "Schedule approval and review"] };
    },
};

export default spec;
