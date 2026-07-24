// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "indian-mobile-number-validator",
  "title": "Indian Mobile Number Validator",
  "description": "Country code aur numbering-series sanity checks kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "India",
    "Productivity"
  ],
  "icon": "smartphone",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "number",
      "label": "Indian mobile number",
      "type": "text",
      "default": "+91 98765 43210"
    },
    {
      "key": "strict",
      "label": "Strict mobile prefix",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Require first national digit 6–9"
    }
  ],
  "presets": [
    {
      "label": "+91 format",
      "values": {
        "number": "+91 98765 43210",
        "strict": true
      }
    },
    {
      "label": "10 digits",
      "values": {
        "number": "8765432109",
        "strict": true
      }
    }
  ],
  "note": "Checks syntax only. It does not reveal ownership, carrier status, SIM validity, or whether the number is safe."
},
  compute: (values) => {
      const raw = String(values.number || "").trim();
      let digits = raw.replace(/\D/g, "");
      if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
      else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
      const prefixOk = values.strict ? /^[6-9]/.test(digits) : /^\d/.test(digits);
      const valid = /^\d{10}$/.test(digits) && prefixOk;
      return { result: valid ? "Valid mobile-number format" : "Invalid mobile-number format", caption: valid ? "+91 " + digits.slice(0, 5) + " " + digits.slice(5) : "Expected 10 national digits" + (values.strict ? " beginning 6–9" : ""), rows: [["Normalized E.164", valid ? "+91" + digits : "—"], ["National number", digits || "—"], ["Length", digits.length], ["Prefix check", prefixOk ? "Pass" : "Fail"]] };
    },
};

export default spec;
