// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "voter-id-format-validator",
  "title": "Voter ID Format Validator",
  "description": "Validate and normalize the EPIC number pattern on an Indian voter ID.",
  "badge": "India-Specific Utilities",
  "category": [
    "India",
    "Productivity"
  ],
  "icon": "badge-check",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "epic",
      "label": "EPIC / Voter ID",
      "type": "text",
      "default": "ABC1234567"
    },
    {
      "key": "normalize",
      "label": "Normalize",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Remove spaces and use uppercase"
    }
  ],
  "presets": [
    {
      "label": "EPIC example",
      "values": {
        "epic": "ABC1234567",
        "normalize": true
      }
    }
  ],
  "note": "Checks the common EPIC pattern only. It does not confirm enrolment, identity, constituency, or record status; use the Election Commission's official services."
},
  compute: (values) => {
      const raw = String(values.epic || "");
      const code = values.normalize ? raw.replace(/\s+/g, "").toUpperCase() : raw;
      const valid = /^[A-Z]{3}\d{7}$/.test(code);
      return { result: valid ? "Valid common EPIC format" : "Invalid common EPIC format", caption: valid ? "Format only — official verification still required" : "Expected 3 letters followed by 7 digits", rows: [["Normalized", code || "—"], ["Letter block", code.slice(0, 3) || "—"], ["Serial block", code.slice(3) || "—"]] };
    },
};

export default spec;
