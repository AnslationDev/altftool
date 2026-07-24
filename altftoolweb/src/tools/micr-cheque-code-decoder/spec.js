// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "micr-cheque-code-decoder",
  "title": "MICR Cheque Code Decoder",
  "description": "MICR city, bank aur branch fields explain kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "Finance",
    "India"
  ],
  "icon": "scan-line",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "micr",
      "label": "9-digit MICR code",
      "type": "text",
      "default": "400002001"
    },
    {
      "key": "strip",
      "label": "Remove spaces",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Normalize pasted code"
    }
  ],
  "presets": [
    {
      "label": "Mumbai example",
      "values": {
        "micr": "400002001",
        "strip": true
      }
    }
  ],
  "note": "Decodes the standard 3+3+3 MICR structure. It does not confirm that a cheque or bank account is genuine."
},
  compute: (values) => {
      const code = values.strip ? String(values.micr || "").replace(/\D/g, "") : String(values.micr || "");
      const valid = /^\d{9}$/.test(code);
      return { result: valid ? "Valid 9-digit MICR structure" : "Invalid MICR structure", caption: valid ? "City · bank · branch fields decoded" : "Enter exactly 9 digits", rows: [["Normalized", code || "—"], ["City code", valid ? code.slice(0, 3) : "—"], ["Bank code", valid ? code.slice(3, 6) : "—"], ["Branch code", valid ? code.slice(6, 9) : "—"]] };
    },
};

export default spec;
