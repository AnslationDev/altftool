"use client";

import { useMemo, useState } from "react";
import { ImageIcon, UploadCloud } from "lucide-react";

const tagNames = {
  0x010f: "Camera make",
  0x0110: "Camera model",
  0x0112: "Orientation",
  0x0131: "Software",
  0x0132: "Modified date",
  0x829a: "Exposure time",
  0x829d: "F-number",
  0x8827: "ISO speed",
  0x9003: "Original date",
  0x9004: "Digitized date",
  0x9209: "Flash",
  0x920a: "Focal length",
  0xa002: "Image width",
  0xa003: "Image height",
  0x8825: "GPS directory",
};

const gpsTagNames = {
  0x0001: "GPS latitude ref",
  0x0002: "GPS latitude",
  0x0003: "GPS longitude ref",
  0x0004: "GPS longitude",
  0x0005: "GPS altitude ref",
  0x0006: "GPS altitude",
};

const typeSizes = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
};

function readAscii(view, start, length) {
  let output = "";
  for (let index = 0; index < length; index += 1) {
    const code = view.getUint8(start + index);
    if (code !== 0) output += String.fromCharCode(code);
  }
  return output;
}

function readValue(view, tiffStart, entryOffset, littleEndian) {
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  const byteLength = (typeSizes[type] || 1) * count;
  const valueOffset = byteLength <= 4 ? entryOffset + 8 : tiffStart + view.getUint32(entryOffset + 8, littleEndian);

  if (type === 2) return readAscii(view, valueOffset, count);
  if (type === 3) {
    const values = Array.from({ length: count }, (_, index) => view.getUint16(valueOffset + index * 2, littleEndian));
    return values.length === 1 ? values[0] : values.join(", ");
  }
  if (type === 4) {
    const values = Array.from({ length: count }, (_, index) => view.getUint32(valueOffset + index * 4, littleEndian));
    return values.length === 1 ? values[0] : values.join(", ");
  }
  if (type === 5) {
    const values = Array.from({ length: count }, (_, index) => {
      const numerator = view.getUint32(valueOffset + index * 8, littleEndian);
      const denominator = view.getUint32(valueOffset + index * 8 + 4, littleEndian) || 1;
      const decimal = numerator / denominator;
      return Number.isInteger(decimal) ? String(decimal) : decimal.toFixed(4);
    });
    return values.length === 1 ? values[0] : values.join(", ");
  }
  return `Type ${type}, ${count} value(s)`;
}

function readIfd(view, tiffStart, offset, littleEndian, names = tagNames) {
  const rows = [];
  const entries = view.getUint16(tiffStart + offset, littleEndian);

  for (let index = 0; index < entries; index += 1) {
    const entryOffset = tiffStart + offset + 2 + index * 12;
    const tag = view.getUint16(entryOffset, littleEndian);
    const name = names[tag] || `Tag 0x${tag.toString(16).padStart(4, "0")}`;
    const value = readValue(view, tiffStart, entryOffset, littleEndian);
    rows.push({ tag, name, value });

    if (tag === 0x8825 && Number.isFinite(Number(value))) {
      rows.push(...readIfd(view, tiffStart, Number(value), littleEndian, gpsTagNames));
    }
  }

  return rows;
}

function parseExif(buffer) {
  const view = new DataView(buffer);
  if (view.getUint16(0) !== 0xffd8) throw new Error("EXIF parsing currently supports JPEG images.");

  let offset = 2;
  while (offset < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const length = view.getUint16(offset + 2);

    if (marker === 0xe1 && readAscii(view, offset + 4, 6) === "Exif") {
      const tiffStart = offset + 10;
      const endian = readAscii(view, tiffStart, 2);
      const littleEndian = endian === "II";
      const firstIfd = view.getUint32(tiffStart + 4, littleEndian);
      return readIfd(view, tiffStart, firstIfd, littleEndian);
    }

    offset += 2 + length;
  }

  throw new Error("No EXIF metadata found in this image.");
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

export default function ToolHome() {
  const [fileInfo, setFileInfo] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  const importantRows = useMemo(
    () => rows.filter((row) => ["Camera make", "Camera model", "Original date", "ISO speed", "F-number", "Focal length"].includes(row.name)),
    [rows],
  );

  const handleFile = async (file) => {
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size, type: file.type || "Unknown" });
    setRows([]);
    setError("");
    setPreview(URL.createObjectURL(file));

    try {
      const buffer = await file.arrayBuffer();
      setRows(parseExif(buffer));
    } catch (parseError) {
      setError(parseError.message);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ImageIcon className="h-4 w-4" />
            Image metadata
          </div>
          <h1 className="text-4xl font-semibold leading-tight">EXIF Data Viewer</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Inspect JPEG image metadata locally, including camera details, capture dates, and GPS fields when present.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center hover:bg-[var(--muted)]">
              <UploadCloud className="h-10 w-10 text-[var(--primary)]" />
              <span className="mt-3 text-sm font-semibold">Upload JPEG image</span>
              <span className="mt-1 text-xs text-[var(--muted-foreground)]">Metadata is parsed in your browser</span>
              <input type="file" accept="image/jpeg,image/jpg" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>

            {preview && (
              <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="max-h-72 w-full object-cover" />
              </div>
            )}

            {fileInfo && (
              <div className="mt-5 grid gap-2 text-sm">
                <div className="flex justify-between gap-4 rounded-lg bg-[var(--muted)] px-3 py-2">
                  <span className="text-[var(--muted-foreground)]">File</span>
                  <span className="text-right font-semibold">{fileInfo.name}</span>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-[var(--muted)] px-3 py-2">
                  <span className="text-[var(--muted-foreground)]">Size</span>
                  <span className="font-semibold">{formatBytes(fileInfo.size)}</span>
                </div>
                <div className="flex justify-between gap-4 rounded-lg bg-[var(--muted)] px-3 py-2">
                  <span className="text-[var(--muted-foreground)]">Type</span>
                  <span className="font-semibold">{fileInfo.type}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            {error ? (
              <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">{error}</p>
            ) : null}

            {importantRows.length ? (
              <div className="tool-card-grid mb-5">
                {importantRows.map((row) => (
                  <div key={`${row.name}-${row.value}`} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{row.name}</p>
                    <p className="mt-2 break-words text-sm font-semibold">{String(row.value)}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {rows.length ? (
              <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--muted)] text-xs uppercase text-[var(--muted-foreground)]">
                    <tr>
                      <th className="px-4 py-3">Field</th>
                      <th className="px-4 py-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {rows.map((row) => (
                      <tr key={`${row.tag}-${row.name}-${row.value}`}>
                        <td className="px-4 py-3 font-semibold">{row.name}</td>
                        <td className="break-all px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{String(row.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted-foreground)]">
                Upload a JPEG image to view its EXIF fields.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
