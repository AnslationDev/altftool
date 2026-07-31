// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "driving-licence-number-decoder",
  "title": "Driving Licence Number Decoder",
  "description": "Parse an Indian driving licence number into its state, RTO, issue-year and serial fields, and identify the state it was issued in.",
  "badge": "India-Specific Utilities",
  "category": [
    "India",
    "Productivity"
  ],
  "icon": "car-front",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "licence",
      "label": "Driving licence number",
      "type": "text",
      "default": "DL-0420110012345"
    },
    {
      "key": "normalize",
      "label": "Normalize",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Strip punctuation and use uppercase"
    }
  ],
  "presets": [
    {
      "label": "Delhi example",
      "values": {
        "licence": "DL-0420110012345",
        "normalize": true
      }
    }
  ],
  "note": "Parses a common state/RTO/year/serial structure. Older and state-specific formats vary; this does not confirm licence validity or ownership."
},
  compute: (values) => {
      const raw = String(values.licence || "");
      const code = values.normalize ? raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase() : raw;
      const match = code.match(/^([A-Z]{2})(\d{2})(\d{4})(\d{7})$/);
      const states = { DL: "Delhi", MH: "Maharashtra", GJ: "Gujarat", KA: "Karnataka", TN: "Tamil Nadu", UP: "Uttar Pradesh", RJ: "Rajasthan", WB: "West Bengal", HR: "Haryana", PB: "Punjab", MP: "Madhya Pradesh", KL: "Kerala", TS: "Telangana", AP: "Andhra Pradesh" };
      return { result: match ? "Common DL structure decoded" : "Unrecognized common DL structure", caption: match ? (states[match[1]] || "State code " + match[1]) : "Expected state(2) + RTO(2) + year(4) + serial(7)", rows: [["Normalized", code || "—"], ["State", match ? (states[match[1]] || match[1]) : "—"], ["RTO code", match ? match[2] : "—"], ["Issue-year field", match ? match[3] : "—"], ["Serial", match ? match[4] : "—"]] };
    },
};

export default spec;
