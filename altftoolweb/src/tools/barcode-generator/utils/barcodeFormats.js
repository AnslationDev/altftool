// 20+ supported symbologies: every JsBarcode format (including variants) plus
// QR via qrcode.react. `example` values are valid for their format.

export const SIZE_PRESETS = {
  small: { label: "Small (400×120)", barWidth: 1.5, height: 70, fontSize: 14, qrSize: 180 },
  medium: { label: "Medium (600×200)", barWidth: 2, height: 100, fontSize: 18, qrSize: 260 },
  large: { label: "Large (800×300)", barWidth: 3, height: 140, fontSize: 22, qrSize: 340 },
};

export const FORMAT_GROUPS = [
  {
    group: "Common",
    formats: [
      {
        value: "CODE128",
        label: "Code 128",
        example: "A123B456C789",
        maxLength: 80,
        description: "High density barcode used in logistics, shipping, and inventory.",
      },
      {
        value: "QR",
        label: "QR Code",
        example: "https://www.altftool.com",
        maxLength: 500,
        description: "2D matrix code for URLs, Wi-Fi, contacts, and long text. Scannable by phones.",
      },
      {
        value: "EAN13",
        label: "EAN-13",
        example: "5901234123457",
        maxLength: 13,
        description: "Worldwide retail product barcode. Needs 12–13 digits (checksum auto-verified).",
      },
      {
        value: "UPC",
        label: "UPC-A",
        example: "123456789999",
        maxLength: 12,
        description: "Standard retail barcode in North America. Needs 11–12 digits.",
      },
      {
        value: "CODE39",
        label: "Code 39",
        example: "CODE-39",
        maxLength: 40,
        description: "Alphanumeric barcode (A–Z, 0–9, -.$/+% and space) used in labels and badges.",
      },
    ],
  },
  {
    group: "Retail & packaging",
    formats: [
      {
        value: "EAN8",
        label: "EAN-8",
        example: "96385074",
        maxLength: 8,
        description: "Compact retail barcode for small packaging. Needs 7–8 digits.",
      },
      {
        value: "EAN5",
        label: "EAN-5 (add-on)",
        example: "54495",
        maxLength: 5,
        description: "5-digit add-on for book prices and periodicals.",
      },
      {
        value: "EAN2",
        label: "EAN-2 (add-on)",
        example: "53",
        maxLength: 2,
        description: "2-digit add-on for magazines and periodicals.",
      },
      {
        value: "ITF14",
        label: "ITF-14",
        example: "12345678901231",
        maxLength: 14,
        description: "Carton-level packaging barcode. Needs 13–14 digits.",
      },
    ],
  },
  {
    group: "Industrial",
    formats: [
      {
        value: "ITF",
        label: "ITF (Interleaved 2 of 5)",
        example: "1234567890",
        maxLength: 30,
        description: "Numeric barcode for industrial use. Needs an even number of digits.",
      },
      {
        value: "MSI",
        label: "MSI",
        example: "1234567",
        maxLength: 20,
        description: "Numeric barcode used for warehouse shelves and inventory.",
      },
      {
        value: "MSI10",
        label: "MSI (Mod 10)",
        example: "1234567",
        maxLength: 20,
        description: "MSI with a Mod 10 check digit appended automatically.",
      },
      {
        value: "MSI11",
        label: "MSI (Mod 11)",
        example: "1234567",
        maxLength: 20,
        description: "MSI with a Mod 11 check digit appended automatically.",
      },
      {
        value: "MSI1010",
        label: "MSI (Mod 1010)",
        example: "1234567",
        maxLength: 20,
        description: "MSI with two Mod 10 check digits appended automatically.",
      },
      {
        value: "MSI1110",
        label: "MSI (Mod 1110)",
        example: "1234567",
        maxLength: 20,
        description: "MSI with Mod 11 then Mod 10 check digits appended automatically.",
      },
      {
        value: "pharmacode",
        label: "Pharmacode",
        example: "1234",
        maxLength: 6,
        description: "Pharmaceutical packaging code. Accepts a number from 3 to 131070.",
      },
      {
        value: "codabar",
        label: "Codabar",
        example: "A1234567B",
        maxLength: 30,
        description: "Used by libraries, blood banks, and photo labs. Digits with A–D start/stop.",
      },
    ],
  },
  {
    group: "Code 128 variants",
    formats: [
      {
        value: "CODE128A",
        label: "Code 128 A",
        example: "EXAMPLE128",
        maxLength: 80,
        description: "Code 128 subset A: uppercase letters, digits, and control characters.",
      },
      {
        value: "CODE128B",
        label: "Code 128 B",
        example: "Example 128b",
        maxLength: 80,
        description: "Code 128 subset B: full ASCII including lowercase letters.",
      },
      {
        value: "CODE128C",
        label: "Code 128 C",
        example: "12345678",
        maxLength: 80,
        description: "Code 128 subset C: digit pairs only — the densest numeric encoding.",
      },
    ],
  },
];

export const ALL_FORMATS = FORMAT_GROUPS.flatMap((group) => group.formats);

export function getFormat(value) {
  return ALL_FORMATS.find((format) => format.value === value) || ALL_FORMATS[0];
}
