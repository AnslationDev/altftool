// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ifsc-decoder-validator",
  "title": "IFSC Decoder & Validator",
  "description": "Validate an IFSC code's format and decode its bank and branch identifiers.",
  "badge": "India-Specific Utilities",
  "category": [
    "Finance",
    "India"
  ],
  "icon": "landmark",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "ifsc",
      "label": "IFSC code",
      "type": "text",
      "default": "HDFC0001234",
      "placeholder": "Example: HDFC0001234"
    },
    {
      "key": "normalize",
      "label": "Normalize input",
      "type": "toggle",
      "default": true,
      "checkboxLabel": "Remove spaces and use uppercase"
    }
  ],
  "presets": [
    {
      "label": "HDFC example",
      "values": {
        "ifsc": "HDFC0001234",
        "normalize": true
      }
    },
    {
      "label": "SBI example",
      "values": {
        "ifsc": "SBIN0000456",
        "normalize": true
      }
    }
  ],
  "note": "Validates and decodes the IFSC structure locally. Bank-prefix labels are a convenience list; confirm the exact active branch against the RBI or the bank."
},
  compute: (values) => {
      const raw = String(values.ifsc || "");
      const code = values.normalize ? raw.replace(/\s+/g, "").toUpperCase() : raw;
      const valid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code);
      const banks = { SBIN: "State Bank of India", HDFC: "HDFC Bank", ICIC: "ICICI Bank", UTIB: "Axis Bank", PUNB: "Punjab National Bank", BARB: "Bank of Baroda", CNRB: "Canara Bank", BKID: "Bank of India", KKBK: "Kotak Mahindra Bank", IDIB: "Indian Bank", UBIN: "Union Bank of India", YESB: "YES Bank", INDB: "IndusInd Bank", IOBA: "Indian Overseas Bank" };
      const prefix = code.slice(0, 4);
      return { result: valid ? "Structurally valid IFSC" : "Invalid IFSC structure", caption: valid ? (banks[prefix] || "Bank prefix not in local convenience list") : "Expected 4 letters, 0, then 6 letters/digits", rows: [["Normalized", code || "—"], ["Bank prefix", valid ? (prefix || "—") : "—"], ["Bank", valid ? (banks[prefix] || "Confirm with RBI") : "—"], ["Branch identifier", valid ? code.slice(5) : "—"]] };
    },
};

export default spec;
