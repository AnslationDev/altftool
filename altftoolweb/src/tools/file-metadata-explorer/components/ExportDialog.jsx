import { useState } from "react";
import { Modal, Button } from "@altftool/ui";
import { FileJson, FileText, Printer, Download, Check } from "lucide-react";

export default function ExportDialog({ open, onClose, files }) {
  const [copied, setCopied] = useState(false);

  const getExportData = () => {
    return files.map((f) => ({
      fileName: f.meta.fileName,
      type: f.meta.type,
      extension: f.meta.extension,
      size: f.meta.sizeFormatted,
      mimeType: f.meta.mimeType,
      lastModified: f.meta.lastModified,
      hash: f.meta.hash,
      width: f.meta.width,
      height: f.meta.height,
      duration: f.meta.duration,
      charCount: f.meta.charCount,
      wordCount: f.meta.wordCount,
      lineCount: f.meta.lineCount,
      language: f.meta.language,
      pageCount: f.meta.pageCount,
    }));
  };

  const handleExport = (format) => {
    const data = getExportData();
    let content = "";
    let ext = "";
    let mime = "";

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      ext = "json";
      mime = "application/json";
    } else if (format === "csv") {
      const headers = Object.keys(data[0] || {});
      const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
      content = [headers.join(","), ...rows].join("\n");
      ext = "csv";
      mime = "text/csv";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `file-metadata.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const data = getExportData();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    const data = getExportData();
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>File Metadata Report</title>
      <style>body{font-family:system-ui;padding:2rem;color:#111;max-width:800px;margin:0 auto}
      table{width:100%;border-collapse:collapse;margin-top:1rem}
      th,td{border:1px solid #ddd;padding:0.5rem;text-align:left;font-size:13px}
      th{background:#f5f5f5;font-weight:600}
      h1{font-size:1.5rem;margin-bottom:0.5rem}
      .meta{color:#666;font-size:0.85rem}
      </style></head><body>
      <h1>File Metadata Report</h1>
      <p class="meta">${data.length} files | ${new Date().toLocaleString()}</p>
      <table><thead><tr>${Object.keys(data[0]||{}).map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${data.map(row => `<tr>${Object.values(row).map(v => `<td>${v ?? "—"}</td>`).join("")}</tr>`).join("")}
      </tbody></table></body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Metadata" size="sm">
      <div className="space-y-3">
        {files.length === 0 ? (
          <p className="text-sm text-(--muted-foreground) text-center py-4">No files to export</p>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-(--muted) border border-(--border)">
              <FileJson size="16" className="text-(--primary)" />
              <span className="text-sm text-(--foreground)">Export {files.length} file(s)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" className="justify-start" onClick={() => handleExport("json")}>
                <FileJson size="16" /> JSON
              </Button>
              <Button variant="secondary" className="justify-start" onClick={() => handleExport("csv")}>
                <FileText size="16" /> CSV
              </Button>
            </div>
            <Button variant="secondary" className="w-full justify-start" onClick={handleCopy}>
              {copied ? <Check size="16" className="text-(--primary)" /> : <FileJson size="16" />}
              {copied ? "Copied!" : "Copy as JSON"}
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={handlePrint}>
              <Printer size="16" /> Print Report
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
