export const BLOG_EXPORT_COLUMNS = [
  "id",
  "title",
  "slug",
  "author",
  "category",
  "status",
  "created_at",
  "updated_at",
  "published_at",
  "word_count",
  "content_html",
];

export function toJsDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.toMillis === "function") return new Date(value.toMillis());
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function timestampToIso(value) {
  const date = toJsDate(value);
  return date ? date.toISOString() : "";
}

/**
 * Returns the most relevant "publish/created" Date for a blog so the
 * Export modal can filter by a selected date range entirely client-side.
 */
export function getBlogTimelineDate(blog = {}) {
  return (
    toJsDate(blog.publishedAt) ||
    toJsDate(blog.createdAt) ||
    toJsDate(blog.date) ||
    toJsDate(blog.updatedAt) ||
    null
  );
}

export function getWordCount(html = "") {
  const text = String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

export function normalizeBlogExportRow(blog = {}) {
  const content = String(blog.description || blog.content_html || blog.content || "");

  return {
    id: blog.id || "",
    title: blog.heading || blog.title || "",
    slug: blog.slug || "",
    author: blog.author || "",
    category: blog.category || "",
    status: blog.status || "draft",
    created_at: timestampToIso(blog.createdAt || blog.created_at),
    updated_at: timestampToIso(blog.updatedAt || blog.updated_at),
    published_at: timestampToIso(blog.publishedAt || blog.published_at || (blog.status === "published" ? blog.date : "")),
    word_count: getWordCount(content),
    content_html: content,
  };
}

export function csvEscape(value) {
  const raw = String(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

export function rowsToCsv(rows = []) {
  const header = BLOG_EXPORT_COLUMNS.join(",");
  const body = rows
    .map((row) => BLOG_EXPORT_COLUMNS.map((column) => csvEscape(row[column])).join(","))
    .join("\n");

  return `\uFEFF${header}${body ? `\n${body}` : "\n"}`;
}

export function rowsToCsvBlob(rows = []) {
  return new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8" });
}

/* \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   Minimal, dependency-free (uses the already-bundled
   jszip) Office Open XML (.xlsx) writer. Builds a
   valid single-sheet workbook with a bold header row
   and inline-string cells \u2014 no SheetJS required.
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Strip control chars that are illegal in XML 1.0 (keep tab/newline/cr).
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function columnLetter(index) {
  let n = index + 1;
  let letter = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function buildSheetXml(columns, rows) {
  const headerCells = columns
    .map(
      (col, c) =>
        `<c r="${columnLetter(c)}1" s="1" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(col)}</t></is></c>`,
    )
    .join("");
  const headerRow = `<row r="1">${headerCells}</row>`;

  const bodyRows = rows
    .map((row, r) => {
      const rowNumber = r + 2;
      const cells = columns
        .map(
          (col, c) =>
            `<c r="${columnLetter(c)}${rowNumber}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(row[col])}</t></is></c>`,
        )
        .join("");
      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");

  const lastCol = columnLetter(Math.max(columns.length - 1, 0));
  const dimension = `A1:${lastCol}${rows.length + 1}`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${dimension}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><sheetData>${headerRow}${bodyRows}</sheetData></worksheet>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF0FDFA"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

const WORKBOOK_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Blogs" sheetId="1" r:id="rId1"/></sheets></workbook>`;

const WORKBOOK_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

let _jsZipPromise;
function loadJsZip() {
  _jsZipPromise ||= import("jszip").then((module) => module.default || module);
  return _jsZipPromise;
}

export async function rowsToXlsxBlob(rows = [], columns = BLOG_EXPORT_COLUMNS) {
  const JSZip = await loadJsZip();
  const zip = new JSZip();

  zip.file("[Content_Types].xml", CONTENT_TYPES_XML);
  zip.folder("_rels").file(".rels", ROOT_RELS_XML);
  const xl = zip.folder("xl");
  xl.file("workbook.xml", WORKBOOK_XML);
  xl.file("styles.xml", STYLES_XML);
  xl.folder("_rels").file("workbook.xml.rels", WORKBOOK_RELS_XML);
  xl.folder("worksheets").file("sheet1.xml", buildSheetXml(columns, rows));

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
