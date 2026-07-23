"use client";

export function downloadText(content, filename, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function readUploadedFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File could not be read."));
    reader.readAsText(file);
  });
}

export function parseCsv(text) {
  const rows = [];
  let cell = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

export function csvToEditorText(text, inputType) {
  const rows = parseCsv(text);
  if (!rows.length) return "";
  const [header, ...body] = rows;
  if (inputType === "params") {
    const keyIndex = header.findIndex((cell) => /^key$/i.test(cell.trim()));
    const valueIndex = header.findIndex((cell) => /^value$/i.test(cell.trim()));
    const rowsToUse = keyIndex >= 0 && valueIndex >= 0 ? body : rows;
    return rowsToUse
      .map((cells) => {
        const key = keyIndex >= 0 ? cells[keyIndex] : cells[0];
        const value = valueIndex >= 0 ? cells[valueIndex] : cells[1];
        return key ? `${key}=${value ?? ""}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  const objects = body.map((cells) =>
    header.reduce((record, key, index) => {
      if (key) record[key] = cells[index] ?? "";
      return record;
    }, {})
  );
  return JSON.stringify(objects, null, 2);
}
