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
      const states = { AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar", CH: "Chandigarh", CG: "Chhattisgarh", DD: "Daman and Diu", DL: "Delhi", DN: "Dadra and Nagar Haveli", GA: "Goa", GJ: "Gujarat", HP: "Himachal Pradesh", HR: "Haryana", JH: "Jharkhand", JK: "Jammu and Kashmir", KA: "Karnataka", KL: "Kerala", LA: "Ladakh", LD: "Lakshadweep", MH: "Maharashtra", ML: "Meghalaya", MN: "Manipur", MP: "Madhya Pradesh", MZ: "Mizoram", NL: "Nagaland", OD: "Odisha", PB: "Punjab", PY: "Puducherry", RJ: "Rajasthan", SK: "Sikkim", TN: "Tamil Nadu", TR: "Tripura", TS: "Telangana", UK: "Uttarakhand", UP: "Uttar Pradesh", WB: "West Bengal" };
      return { result: match ? "Common DL structure decoded" : "Unrecognized common DL structure", caption: match ? (states[match[1]] || "State code " + match[1]) : "Expected state(2) + RTO(2) + year(4) + serial(7)", rows: [[values.normalize ? "Normalized" : "Raw input", code || "—"], ["State", match ? (states[match[1]] || match[1]) : "—"], ["RTO code", match ? match[2] : "—"], ["Issue-year field", match ? match[3] : "—"], ["Serial", match ? match[4] : "—"]] };
    },
};

export default spec;
