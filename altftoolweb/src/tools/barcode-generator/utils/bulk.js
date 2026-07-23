import JsBarcode from "jsbarcode";
import JSZip from "jszip";
import Papa from "papaparse";
import { ALL_FORMATS } from "./barcodeFormats.js";
import { downloadBlob } from "./exporters.js";

export const SAMPLE_CSV = `data,format
A123B456C789,CODE128
5901234123457,EAN13
96385074,EAN8
123456789999,UPC
CODE-39,CODE39
1234567,MSI
`;

export function downloadSampleCsv() {
  downloadBlob(new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" }), "barcode-sample.csv");
}

const VALID_FORMATS = new Set(ALL_FORMATS.map((format) => format.value).filter((v) => v !== "QR"));

// Parse a CSV file into rows of { data, format }. The first column is the
// value; an optional second column (or a `format` header) picks the format.
export function parseCsv(text, defaultFormat) {
  const parsed = Papa.parse(text.trim(), { skipEmptyLines: true });
  let rows = parsed.data;
  if (!rows.length) return [];

  const header = rows[0].map((cell) => String(cell).trim().toLowerCase());
  const hasHeader = header.some((cell) => ["data", "value", "text", "code", "format"].includes(cell));
  const dataIndex = hasHeader ? Math.max(0, header.findIndex((c) => ["data", "value", "text", "code"].includes(c))) : 0;
  const formatIndex = hasHeader ? header.findIndex((c) => c === "format") : 1;
  if (hasHeader) rows = rows.slice(1);

  return rows
    .map((row) => {
      const data = String(row[dataIndex] ?? "").trim();
      const rawFormat = String(row[formatIndex] ?? "").trim().toUpperCase();
      const format = VALID_FORMATS.has(rawFormat)
        ? rawFormat
        : rawFormat === "PHARMACODE"
          ? "pharmacode"
          : rawFormat === "CODABAR"
            ? "codabar"
            : defaultFormat !== "QR" && VALID_FORMATS.has(defaultFormat)
              ? defaultFormat
              : "CODE128";
      return { data, format, requested: rawFormat };
    })
    .filter((row) => row.data);
}

// Render every row to PNG on an offscreen canvas and zip the results.
// Returns per-row results so the UI can show what succeeded.
export async function generateBulkZip(rows, options) {
  const zip = new JSZip();
  const results = [];
  const canvas = document.createElement("canvas");

  rows.forEach((row, index) => {
    try {
      if (row.requested === "QR") throw new Error("QR is not supported in bulk mode");
      let valid = true;
      JsBarcode(canvas, row.data, {
        format: row.format,
        width: options.barWidth,
        height: options.height,
        displayValue: options.showText,
        background: options.background,
        lineColor: options.lineColor,
        fontSize: options.fontSize,
        margin: options.margin,
        valid: (ok) => {
          valid = ok;
        },
      });
      if (!valid) throw new Error(`"${row.data}" is not valid ${row.format} data`);
      const base64 = canvas.toDataURL("image/png").split(",")[1];
      const safeName = row.data.replace(/[^a-z0-9_-]+/gi, "_").slice(0, 40) || `barcode-${index + 1}`;
      zip.file(`${String(index + 1).padStart(3, "0")}-${row.format}-${safeName}.png`, base64, { base64: true });
      results.push({ ...row, ok: true });
    } catch (error) {
      results.push({ ...row, ok: false, error: error.message || "Failed to render" });
    }
  });

  const succeeded = results.filter((row) => row.ok).length;
  let blob = null;
  if (succeeded > 0) {
    blob = await zip.generateAsync({ type: "blob" });
  }
  return { results, succeeded, blob };
}
