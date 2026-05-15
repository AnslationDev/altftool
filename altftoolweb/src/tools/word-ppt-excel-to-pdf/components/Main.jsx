"use client";

import React, { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  AlertTriangle,
  Archive,
  CheckCircle,
  Clipboard,
  Download,
  FileOutput,
  FileSpreadsheet,
  FileText,
  FileUp,
  Loader2,
  Presentation,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";

const SUPPORTED_EXTENSIONS = ["docx", "pptx", "xlsx", "xls", "csv", "txt"];

const PAGE_SIZES = {
  a4: "A4",
  letter: "Letter",
};

const MARGIN_OPTIONS = {
  narrow: { label: "Narrow", value: 10 },
  normal: { label: "Normal", value: 18 },
  wide: { label: "Wide", value: 26 },
};

const DENSITY_OPTIONS = {
  compact: { label: "Compact", rowHeight: 16, fontSize: 7.5 },
  comfortable: { label: "Comfortable", rowHeight: 21, fontSize: 8.5 },
};

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function sanitizeFileName(name) {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "converted-document"
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getExtension(file) {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

function getFileKind(file) {
  const ext = getExtension(file);
  if (ext === "docx") return "word";
  if (ext === "pptx") return "ppt";
  if (["xlsx", "xls", "csv"].includes(ext)) return "excel";
  if (ext === "txt") return "text";
  return "unsupported";
}

function getKindLabel(kind) {
  return {
    word: "Word",
    ppt: "PowerPoint",
    excel: "Excel",
    text: "Text",
    unsupported: "Unsupported",
  }[kind];
}

function countWords(text) {
  const trimmed = String(text || "").trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function htmlToBlocks(html, fallbackText) {
  if (typeof window === "undefined" || !html) {
    return textToBlocks(fallbackText);
  }

  const document = new DOMParser().parseFromString(html, "text/html");
  const blockElements = Array.from(
    document.body.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,blockquote"),
  );
  const blocks = blockElements
    .map((node) => ({
      type: node.tagName.toLowerCase().startsWith("h")
        ? "heading"
        : node.tagName.toLowerCase() === "li"
          ? "list"
          : "paragraph",
      text: node.textContent?.replace(/\s+/g, " ").trim() || "",
    }))
    .filter((block) => block.text);

  return blocks.length ? blocks : textToBlocks(fallbackText);
}

function textToBlocks(text) {
  return String(text || "")
    .split(/\n{2,}|\r{2,}/)
    .map((chunk) => chunk.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((line) => ({
      type:
        line.length <= 70 && !/[.!?]$/.test(line) && /[A-Za-z]/.test(line)
          ? "heading"
          : "paragraph",
      text: line,
    }));
}

function rowsToText(rows) {
  return rows
    .map((row) => row.filter((cell) => String(cell || "").trim()).join(" "))
    .join(" ");
}

function extractXmlTexts(xmlString) {
  const xml = new DOMParser().parseFromString(xmlString, "application/xml");
  const textNodes = Array.from(xml.getElementsByTagName("*")).filter(
    (node) => node.localName === "t",
  );
  return textNodes
    .map((node) => node.textContent?.replace(/\s+/g, " ").trim() || "")
    .filter(Boolean);
}

function sortSlidePath(a, b) {
  const left = Number(a.match(/slide(\d+)\.xml$/)?.[1] || 0);
  const right = Number(b.match(/slide(\d+)\.xml$/)?.[1] || 0);
  return left - right;
}

async function analyzeWordFile(file) {
  const mammothModule = await import("mammoth/mammoth.browser.js");
  const mammoth = mammothModule.default || mammothModule;
  const arrayBuffer = await file.arrayBuffer();
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  const rawResult = await mammoth.extractRawText({ arrayBuffer });
  const blocks = htmlToBlocks(htmlResult.value, rawResult.value);
  const text = blocks.map((block) => block.text).join("\n");

  return {
    kind: "word",
    title: file.name.replace(/\.[^/.]+$/, ""),
    blocks,
    text,
    warnings: (htmlResult.messages || []).map((message) => message.message),
    stats: {
      sections: blocks.filter((block) => block.type === "heading").length,
      words: countWords(text),
      pages: 1,
    },
  };
}

async function analyzeExcelFile(file) {
  const XLSX = await import("xlsx");
  const ext = getExtension(file);
  const input = ext === "csv" ? await file.text() : await file.arrayBuffer();
  const workbook = XLSX.read(input, {
    type: ext === "csv" ? "string" : "array",
    cellDates: true,
    raw: false,
  });

  const sheets = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils
      .sheet_to_json(sheet, { header: 1, defval: "", raw: false })
      .map((row) => row.map((cell) => String(cell ?? "").trim()))
      .filter((row) => row.some((cell) => cell));
    const maxColumns = rows.reduce((max, row) => Math.max(max, row.length), 0);

    return {
      name: sheetName,
      rows,
      rowCount: rows.length,
      columnCount: maxColumns,
    };
  });

  const text = sheets.map((sheet) => rowsToText(sheet.rows)).join(" ");

  return {
    kind: "excel",
    title: file.name.replace(/\.[^/.]+$/, ""),
    sheets,
    text,
    warnings: [],
    stats: {
      sheets: sheets.length,
      rows: sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0),
      columns: Math.max(0, ...sheets.map((sheet) => sheet.columnCount)),
      words: countWords(text),
    },
  };
}

async function analyzePptFile(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
    .sort(sortSlidePath);
  const slides = [];

  for (const path of slidePaths) {
    const slideNumber = Number(path.match(/slide(\d+)\.xml$/)?.[1] || slides.length + 1);
    const xml = await zip.file(path).async("string");
    const texts = extractXmlTexts(xml);
    const notePath = `ppt/notesSlides/notesSlide${slideNumber}.xml`;
    const notes = zip.file(notePath)
      ? extractXmlTexts(await zip.file(notePath).async("string"))
      : [];

    slides.push({
      slideNumber,
      title: texts[0] || `Slide ${slideNumber}`,
      bullets: texts.slice(1),
      notes,
      text: [...texts, ...notes].join(" "),
    });
  }

  const text = slides.map((slide) => slide.text).join(" ");

  return {
    kind: "ppt",
    title: file.name.replace(/\.[^/.]+$/, ""),
    slides,
    text,
    warnings: slides.length
      ? []
      : ["No readable slide text was found in this PPTX file."],
    stats: {
      slides: slides.length,
      words: countWords(text),
      notes: slides.reduce((sum, slide) => sum + slide.notes.length, 0),
    },
  };
}

async function analyzeTextFile(file) {
  const text = await file.text();
  return {
    kind: "text",
    title: file.name.replace(/\.[^/.]+$/, ""),
    blocks: textToBlocks(text),
    text,
    warnings: [],
    stats: {
      lines: text.split(/\r?\n/).length,
      words: countWords(text),
    },
  };
}

async function analyzeFile(file) {
  const kind = getFileKind(file);
  if (kind === "word") return analyzeWordFile(file);
  if (kind === "excel") return analyzeExcelFile(file);
  if (kind === "ppt") return analyzePptFile(file);
  if (kind === "text") return analyzeTextFile(file);
  throw new Error(
    `Unsupported file type. Use ${SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(", ")}.`,
  );
}

function createPdfWriter(doc, options, sourceLabel) {
  const margin = MARGIN_OPTIONS[options.margin].value;
  const pageWidth = () => doc.internal.pageSize.getWidth();
  const pageHeight = () => doc.internal.pageSize.getHeight();
  const usableWidth = () => pageWidth() - margin * 2;
  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed <= pageHeight() - margin - 20) return;
    doc.addPage();
    y = margin;
  };

  const addText = (text, config = {}) => {
    const fontSize = config.fontSize || 10;
    const lineHeight = config.lineHeight || fontSize * 1.38;
    const indent = config.indent || 0;
    const maxWidth = usableWidth() - indent;
    const lines = doc.splitTextToSize(String(text || ""), maxWidth);

    ensureSpace(lines.length * lineHeight + (config.after || 6));
    doc.setFont("helvetica", config.bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(config.color || "#111827");
    doc.text(lines, margin + indent, y);
    y += lines.length * lineHeight + (config.after || 6);
  };

  const addSectionTitle = (text) => {
    ensureSpace(26);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor("#4f46e5");
    doc.text(String(text), margin, y);
    y += 20;
  };

  const addCover = (analysis, file) => {
    if (!options.includeCover) return;
    y = pageHeight() * 0.28;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor("#111827");
    doc.text(analysis.title || sanitizeFileName(file.name), margin, y, {
      maxWidth: usableWidth(),
    });
    y += 32;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor("#6b7280");
    doc.text(`${getKindLabel(analysis.kind)} converted to PDF`, margin, y);
    y += 22;
    doc.text(`Source: ${file.name}`, margin, y);
    y += 22;
    doc.text(`Generated in browser with AltFTool`, margin, y);
    doc.addPage();
    y = margin;
  };

  const addFooter = () => {
    const total = doc.getNumberOfPages();
    for (let page = 1; page <= total; page += 1) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor("#6b7280");
      doc.text(sourceLabel, margin, pageHeight() - 12);
      doc.text(`Page ${page} of ${total}`, pageWidth() - margin - 54, pageHeight() - 12);
    }
  };

  const setY = (nextY) => {
    y = nextY;
  };

  const getY = () => y;

  return {
    addCover,
    addFooter,
    addSectionTitle,
    addText,
    ensureSpace,
    getY,
    margin,
    pageHeight,
    pageWidth,
    setY,
    usableWidth,
  };
}

function addDocumentBlocks(writer, blocks) {
  blocks.forEach((block) => {
    if (block.type === "heading") {
      writer.addSectionTitle(block.text);
      return;
    }

    writer.addText(block.type === "list" ? `- ${block.text}` : block.text, {
      fontSize: 10,
      indent: block.type === "list" ? 12 : 0,
      after: 8,
    });
  });
}

function addSheetTable(doc, writer, sheet, options) {
  writer.addSectionTitle(sheet.name);
  const density = DENSITY_OPTIONS[options.density];
  const rows = sheet.rows.slice(0, options.maxRowsPerSheet);
  const columnCount = Math.min(
    options.maxColumns,
    Math.max(1, sheet.columnCount),
  );
  const colWidth = writer.usableWidth() / columnCount;

  if (!rows.length) {
    writer.addText("No readable rows found in this sheet.", { fontSize: 10 });
    return;
  }

  rows.forEach((row, rowIndex) => {
    const cellLines = Array.from({ length: columnCount }, (_, colIndex) => {
      const raw = row[colIndex] || "";
      return doc
        .splitTextToSize(String(raw), Math.max(18, colWidth - 8))
        .slice(0, options.density === "compact" ? 1 : 2);
    });
    const rowHeight =
      Math.max(1, ...cellLines.map((lines) => lines.length)) * (density.fontSize + 4) +
      8;

    writer.ensureSpace(rowHeight + 4);
    const y = writer.getY();
    const isHeader = rowIndex === 0;

    for (let colIndex = 0; colIndex < columnCount; colIndex += 1) {
      const x = writer.margin + colWidth * colIndex;
      doc.setDrawColor("#d1d5db");
      doc.setFillColor(isHeader ? "#ede9fe" : rowIndex % 2 ? "#ffffff" : "#f9fafb");
      doc.rect(x, y, colWidth, rowHeight, "FD");
      doc.setFont("helvetica", isHeader ? "bold" : "normal");
      doc.setFontSize(density.fontSize);
      doc.setTextColor("#111827");
      doc.text(cellLines[colIndex], x + 4, y + density.fontSize + 5);
    }

    writer.setY(y + rowHeight);
  });

  if (sheet.rows.length > rows.length) {
    writer.addText(
      `${sheet.rows.length - rows.length} more rows skipped by the row limit.`,
      { fontSize: 9, color: "#6b7280", after: 12 },
    );
  }
}

function addSlides(doc, writer, slides) {
  slides.forEach((slide, index) => {
    if (index > 0) {
      doc.addPage();
      writer.setY(writer.margin);
    }

    const slideWidth = writer.usableWidth();
    const slideHeight = writer.pageHeight() - writer.margin * 2 - 20;
    const x = writer.margin;
    const y = writer.getY();
    doc.setDrawColor("#c4b5fd");
    doc.setFillColor("#faf5ff");
    doc.roundedRect(x, y, slideWidth, slideHeight, 8, 8, "FD");
    writer.setY(y + 28);
    writer.addText(slide.title || `Slide ${slide.slideNumber}`, {
      fontSize: 18,
      bold: true,
      after: 18,
    });

    const bulletText = slide.bullets.length
      ? slide.bullets
      : ["No readable body text found on this slide."];
    bulletText.slice(0, 18).forEach((bullet) => {
      writer.addText(`- ${bullet}`, { fontSize: 11, indent: 12, after: 8 });
    });

    if (slide.notes.length) {
      writer.addSectionTitle("Notes");
      slide.notes.slice(0, 6).forEach((note) => {
        writer.addText(note, { fontSize: 9, color: "#4b5563", after: 6 });
      });
    }
  });
}

async function createPdfBlob(file, analysis, options) {
  const { jsPDF } = await import("jspdf");
  const orientation =
    options.orientation === "auto"
      ? analysis.kind === "excel" || analysis.kind === "ppt"
        ? "landscape"
        : "portrait"
      : options.orientation;
  const doc = new jsPDF({
    orientation,
    unit: "pt",
    format: options.pageSize,
  });
  const writer = createPdfWriter(doc, options, file.name);

  writer.addCover(analysis, file);

  if (options.includeSourceInfo) {
    writer.addText(`Source file: ${file.name}`, { fontSize: 9, color: "#6b7280" });
    writer.addText(`Input type: ${getKindLabel(analysis.kind)}`, {
      fontSize: 9,
      color: "#6b7280",
      after: 14,
    });
  }

  if (analysis.kind === "word" || analysis.kind === "text") {
    addDocumentBlocks(writer, analysis.blocks || textToBlocks(analysis.text));
  } else if (analysis.kind === "excel") {
    analysis.sheets.forEach((sheet, index) => {
      if (index > 0) {
        doc.addPage();
        writer.setY(writer.margin);
      }
      addSheetTable(doc, writer, sheet, options);
    });
  } else if (analysis.kind === "ppt") {
    addSlides(doc, writer, analysis.slides);
  }

  writer.addFooter();
  return doc.output("blob");
}

function getItemStats(item) {
  const stats = item.analysis?.stats || {};
  if (item.kind === "word") return `${stats.words || 0} words`;
  if (item.kind === "ppt") return `${stats.slides || 0} slides`;
  if (item.kind === "excel") return `${stats.sheets || 0} sheets, ${stats.rows || 0} rows`;
  if (item.kind === "text") return `${stats.lines || 0} lines`;
  return "Unsupported";
}

function Preview({ item, options }) {
  if (!item) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-(--border) bg-(--background) p-6 text-center text-(--muted-foreground)">
        <FileOutput className="mb-3 h-10 w-10" />
        <p className="font-medium">Upload a document to preview parsed content.</p>
      </div>
    );
  }

  if (item.status === "error") {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-600">
        {item.error}
      </div>
    );
  }

  if (!item.analysis) {
    return (
      <div className="rounded-lg border border-(--border) bg-(--background) p-5 text-(--muted-foreground)">
        Parsing preview...
      </div>
    );
  }

  if (item.analysis.kind === "excel") {
    const sheet = item.analysis.sheets[0];
    return (
      <div className="rounded-lg border border-(--border) bg-(--background) p-4">
        <h3 className="font-semibold text-(--foreground)">{sheet?.name || "Sheet"}</h3>
        <div className="mt-3 max-h-[420px] overflow-auto rounded-lg border border-(--border)">
          <table className="w-full min-w-[620px] text-left text-xs">
            <tbody className="divide-y divide-(--border)">
              {(sheet?.rows || []).slice(0, 20).map((row, rowIndex) => (
                <tr key={`${rowIndex}-${row.join("-")}`} className={rowIndex === 0 ? "bg-(--section-highlight) font-semibold" : "bg-(--card)"}>
                  {Array.from({ length: Math.min(options.maxColumns, sheet.columnCount || 1) }, (_, colIndex) => (
                    <td key={colIndex} className="border-r border-(--border) px-3 py-2 text-(--foreground)">
                      {row[colIndex] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (item.analysis.kind === "ppt") {
    return (
      <div className="grid max-h-[520px] gap-4 overflow-auto">
        {item.analysis.slides.slice(0, 8).map((slide) => (
          <div key={slide.slideNumber} className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Slide {slide.slideNumber}
            </p>
            <h3 className="mt-2 font-semibold text-(--foreground)">{slide.title}</h3>
            <ul className="mt-3 space-y-1 text-sm text-(--muted-foreground)">
              {slide.bullets.slice(0, 8).map((bullet, index) => (
                <li key={`${bullet}-${index}`}>- {bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-h-[520px] overflow-auto rounded-lg border border-(--border) bg-(--background) p-5">
      {(item.analysis.blocks || textToBlocks(item.analysis.text)).slice(0, 80).map((block, index) =>
        block.type === "heading" ? (
          <h3 key={`${block.text}-${index}`} className="mt-4 first:mt-0 font-semibold text-(--foreground)">
            {block.text}
          </h3>
        ) : (
          <p key={`${block.text}-${index}`} className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            {block.type === "list" ? `- ${block.text}` : block.text}
          </p>
        ),
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--card) p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {label}
          </p>
          <p className="text-xl font-bold text-(--foreground)">{value}</p>
          {detail && <p className="text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    pageSize: "a4",
    orientation: "auto",
    margin: "normal",
    density: "comfortable",
    includeCover: true,
    includeSourceInfo: true,
    maxRowsPerSheet: 80,
    maxColumns: 10,
  });

  const fileInputRef = useRef(null);

  const selectedItem = items.find((item) => item.id === selectedId) || items[0];
  const readyItems = items.filter((item) => item.status === "ready");
  const analyzingCount = items.filter((item) => item.status === "analyzing").length;
  const unsupportedCount = items.filter((item) => item.status === "error").length;

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        if (item.kind === "word") acc.word += 1;
        if (item.kind === "ppt") acc.ppt += 1;
        if (item.kind === "excel") acc.excel += 1;
        if (item.kind === "text") acc.text += 1;
        return acc;
      },
      { word: 0, ppt: 0, excel: 0, text: 0 },
    );
  }, [items]);

  const updateOption = (key, value) => {
    setOptions((previous) => ({ ...previous, [key]: value }));
  };

  const updateItem = (id, patch) => {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const addFiles = async (fileList) => {
    const nextFiles = Array.from(fileList || []);
    if (!nextFiles.length) return;

    const created = nextFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID?.() || Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      kind: getFileKind(file),
      status: "analyzing",
      analysis: null,
      error: "",
    }));

    setItems((previous) => [...previous, ...created]);
    setSelectedId((previous) => previous || created[0].id);
    setError("");
    setStatus("Parsing uploaded documents...");

    for (const item of created) {
      try {
        const analysis = await analyzeFile(item.file);
        updateItem(item.id, {
          kind: analysis.kind,
          status: "ready",
          analysis,
          error: "",
        });
      } catch (err) {
        console.error("Document analysis failed:", err);
        updateItem(item.id, {
          status: "error",
          error: err?.message || "Could not parse this file.",
        });
      }
    }

    setStatus("Documents parsed. Preview and convert to PDF.");
  };

  const removeItem = (id) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
    if (selectedId === id) {
      const remaining = items.filter((item) => item.id !== id);
      setSelectedId(remaining[0]?.id || "");
    }
  };

  const resetTool = () => {
    setItems([]);
    setSelectedId("");
    setStatus("");
    setError("");
    setProgress({ done: 0, total: 0 });
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const convertFiles = async () => {
    if (!readyItems.length) {
      setError("Upload at least one supported document before converting.");
      return;
    }

    setIsConverting(true);
    setError("");
    setStatus("Creating PDF files...");
    setProgress({ done: 0, total: readyItems.length });

    try {
      const outputs = [];

      for (let index = 0; index < readyItems.length; index += 1) {
        const item = readyItems[index];
        const blob = await createPdfBlob(item.file, item.analysis, options);
        outputs.push({
          filename: `${sanitizeFileName(item.name)}.pdf`,
          blob,
        });
        setProgress({ done: index + 1, total: readyItems.length });
      }

      if (outputs.length === 1) {
        downloadBlob(outputs[0].blob, outputs[0].filename);
      } else {
        setStatus("Packaging PDFs into ZIP...");
        const zip = new JSZip();
        outputs.forEach((output) => zip.file(output.filename, output.blob));
        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
        downloadBlob(zipBlob, "converted-pdfs.zip");
      }

      setStatus(
        outputs.length === 1
          ? "PDF downloaded successfully."
          : `${outputs.length} PDFs exported in a ZIP.`,
      );
    } catch (err) {
      console.error("PDF conversion failed:", err);
      setError("Could not create PDF output. Try fewer files or a smaller document.");
    } finally {
      setIsConverting(false);
    }
  };

  const copySummary = async () => {
    const summary = [
      "Document to PDF conversion queue",
      `Files: ${items.length}`,
      `Ready: ${readyItems.length}`,
      `Unsupported/failed: ${unsupportedCount}`,
      ...items.map((item, index) => `${index + 1}. ${item.name} - ${getKindLabel(item.kind)} - ${item.status}`),
    ].join("\n");
    await navigator.clipboard?.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 text-(--foreground)">
      <div className="text-center">
        <h1 className="heading">Word / PPT / Excel to PDF</h1>
        <p className="description mt-3">
          Convert DOCX, PPTX, XLSX, XLS, CSV, and TXT files into polished PDFs
          with batch queue, preview, layout controls, and ZIP export.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <FileOutput className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Office Document PDF Maker</h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Files are parsed locally in the browser. DOCX, sheets, and PPTX
                slides are rebuilt into PDF pages for sharing and archiving.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Ready to convert
            </p>
            <p className="mt-2 text-3xl font-bold text-(--primary)">{readyItems.length}</p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {items.length > 1 ? "Batch ZIP output" : "Single PDF output"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed bg-(--card) p-6 text-center transition ${
              isDragging
                ? "border-(--primary) bg-(--section-highlight)"
                : "border-(--border) hover:border-(--primary)"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".docx,.pptx,.xlsx,.xls,.csv,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
              Drop documents here
            </h2>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Supports DOCX, PPTX, XLSX, XLS, CSV, and TXT. Legacy DOC/PPT files
              should be saved as DOCX/PPTX first.
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => fileInputRef.current?.click()}
              disabled={isConverting}
            >
              <FileUp className="h-4 w-4" />
              Choose Files
            </button>
          </div>

          {items.length > 0 && (
            <div className="rounded-lg border border-(--border) bg-(--card) p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-(--foreground)">File Queue</h2>
                <button type="button" className="btn-secondary" onClick={resetTool}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedItem?.id === item.id
                        ? "border-(--primary) bg-(--section-highlight)"
                        : "border-(--border) bg-(--background)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-(--foreground)">{item.name}</p>
                        <p className="mt-1 text-xs text-(--muted-foreground)">
                          {formatBytes(item.size)} • {getKindLabel(item.kind)} • {getItemStats(item)}
                        </p>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        item.status === "ready"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : item.status === "error"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <Settings2 className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-(--foreground)">PDF Settings</h2>
            </div>

            <div className="tool-card-grid mt-5">
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Page Size</span>
                <select
                  value={options.pageSize}
                  onChange={(event) => updateOption("pageSize", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {Object.entries(PAGE_SIZES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Orientation</span>
                <select
                  value={options.orientation}
                  onChange={(event) => updateOption("orientation", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  <option value="auto">Auto</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Margin</span>
                <select
                  value={options.margin}
                  onChange={(event) => updateOption("margin", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {Object.entries(MARGIN_OPTIONS).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Table Density</span>
                <select
                  value={options.density}
                  onChange={(event) => updateOption("density", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {Object.entries(DENSITY_OPTIONS).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) px-3 py-3">
                <span className="text-sm font-medium text-(--foreground)">Include cover page</span>
                <input
                  type="checkbox"
                  checked={options.includeCover}
                  onChange={(event) => updateOption("includeCover", event.target.checked)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) px-3 py-3">
                <span className="text-sm font-medium text-(--foreground)">Include source details</span>
                <input
                  type="checkbox"
                  checked={options.includeSourceInfo}
                  onChange={(event) => updateOption("includeSourceInfo", event.target.checked)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
              </label>
            </div>

            <div className="tool-form-grid mt-4">
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Rows per Sheet</span>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={options.maxRowsPerSheet}
                  onChange={(event) => updateOption("maxRowsPerSheet", Math.max(10, Number(event.target.value) || 10))}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Max Columns</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={options.maxColumns}
                  onChange={(event) => updateOption("maxColumns", Math.max(2, Number(event.target.value) || 2))}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={convertFiles}
                disabled={!readyItems.length || isConverting || analyzingCount > 0}
              >
                {isConverting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isConverting ? "Converting..." : "Download PDF"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={copySummary}
                disabled={!items.length}
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy Summary"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {status && (
            <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
              {analyzingCount > 0 || isConverting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{status}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="tool-card-grid">
            <StatCard icon={FileText} label="Word" value={totals.word} detail="DOCX files" />
            <StatCard icon={Presentation} label="PPT" value={totals.ppt} detail="PPTX slides" />
            <StatCard icon={FileSpreadsheet} label="Excel" value={totals.excel} detail="Sheets/CSV" />
            <StatCard icon={Archive} label="Ready" value={readyItems.length} detail={items.length > 1 ? "ZIP export" : "PDF export"} />
          </div>

          {unsupportedCount > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">
                {unsupportedCount} file{unsupportedCount === 1 ? "" : "s"} could not be parsed. Convert legacy DOC/PPT files to DOCX/PPTX first.
              </p>
            </div>
          )}

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Document Preview</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Preview parsed content before creating the PDF.
                </p>
              </div>
              {selectedItem && (
                <span className="rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--muted-foreground)">
                  {getKindLabel(selectedItem.kind)} • {selectedItem.status}
                </span>
              )}
            </div>
            <Preview item={selectedItem} options={options} />
          </section>

          <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              Browser conversion rebuilds readable content into PDF. It is best
              for clean sharing copies; complex Office animations, macros, and
              exact desktop-app layout may not be identical.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
