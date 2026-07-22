"use client";

import { useState, useRef, useMemo } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  Download,
  Copy,
  CheckCircle2,
  Eye,
  Code2,
  LayoutList,
  RefreshCw
} from "lucide-react";
import * as XLSX from "xlsx";
import { safeCopyText } from "@/shared/utils/clipboard";

export default function ToolHome() {
  const [fileData, setFileData] = useState(null); // stores { name, size, workbook }
  const [activeSheetName, setActiveSheetName] = useState("");

  const [copiedCode, setCopiedCode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" or "code"

  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        setFileData({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + " KB",
          workbook: workbook
        });
        setActiveSheetName(workbook.SheetNames[0]);
        setActiveTab("preview");

      } catch (error) {
        console.error("Error converting file:", error);
        alert("There was an error parsing the file. Please ensure it's a valid Excel format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Generate HTML for the active sheet dynamically
  const { htmlTable, fullHtml } = useMemo(() => {
    if (!fileData || !activeSheetName) return { htmlTable: "", fullHtml: "" };

    const worksheet = fileData.workbook.Sheets[activeSheetName];
    // Generate HTML table string
    const tableString = XLSX.utils.sheet_to_html(worksheet, { id: "excel-table", editable: false });

    const docHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fileData.name} - ${activeSheetName}</title>
<style>
  :root {
    --bg-color: #f8fafc;
    --text-color: #334155;
    --border-color: #e2e8f0;
    --header-bg: #f1f5f9;
    --row-alt-bg: #fdfdfd;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin: 20px;
    background-color: var(--bg-color);
    color: var(--text-color);
  }
  .table-container {
    overflow-x: auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    padding: 1px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0;
    font-size: 14px;
  }
  th, td {
    border: 1px solid var(--border-color);
    padding: 12px 16px;
    text-align: left;
    white-space: nowrap;
  }
  tr:nth-child(even) {
    background-color: var(--row-alt-bg);
  }
  th {
    background-color: var(--header-bg);
    font-weight: 600;
    position: sticky;
    top: 0;
  }
</style>
</head>
<body>
  <div style="margin-bottom: 20px;">
    <h2 style="margin:0 0 8px 0;">${fileData.name}</h2>
    <p style="margin:0; color:#64748b; font-size:14px;">Sheet: <strong>${activeSheetName}</strong></p>
  </div>
  <div class="table-container">
    ${tableString}
  </div>
</body>
</html>`;

    return { htmlTable: tableString, fullHtml: docHtml };
  }, [fileData, activeSheetName]);

  const handleCopyCode = async () => {
    if (!fullHtml) return;
    setCopiedCode(await safeCopyText(fullHtml));
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!fullHtml) return;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = fileData.name.replace(/\.[^/.]+$/, "");
    a.href = url;
    a.download = `${safeName}-${activeSheetName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFileData(null);
    setActiveSheetName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-1.5 text-sm font-semibold text-[var(--primary)]">
            <FileSpreadsheet className="h-4 w-4" />
            File Converter Utility
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Excel to HTML <span className="text-[var(--primary)]">Converter</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            Convert XLS and XLSX spreadsheet files into clean, responsive HTML documents. Perfect for transferring and previewing tabular data natively in the browser with advanced multi-sheet support.
          </p>
        </section>

        {/* Main Workspace */}
        <div className="grid gap-8 lg:grid-cols-12">

          {/* LEFT COLUMN: Uploader & Metadata */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            {!fileData ? (
              <div
                className={`group relative flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent)]"
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110">
                  <UploadCloud className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Drag & drop your file here
                </h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Supports .xlsx, .xls, .csv
                </p>
                <button
                  type="button"
                  className="mt-6 rounded-full bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[var(--primary)]/90"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)] line-clamp-1" title={fileData.name}>
                      {fileData.name}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Size: {fileData.size}</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                    title="Upload another file"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                    <LayoutList className="h-4 w-4" />
                    Available Sheets
                  </h4>
                  <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-2">
                    {fileData.workbook.SheetNames.map((sheet) => (
                      <button
                        key={sheet}
                        onClick={() => setActiveSheetName(sheet)}
                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSheetName === sheet
                            ? "bg-[var(--primary)] text-primary-foreground font-medium"
                            : "bg-[var(--accent)]/50 text-[var(--foreground)] hover:bg-[var(--accent)]"
                        }`}
                      >
                        {sheet}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Output Preview & Code */}
          <div className="flex flex-col lg:col-span-8 h-full min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center rounded-lg bg-[var(--card)] p-1 border border-[var(--border)] shadow-sm">
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === "preview"
                      ? "bg-[var(--primary)] text-primary-foreground shadow"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Visual Preview
                </button>
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === "code"
                      ? "bg-[var(--primary)] text-primary-foreground shadow"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Code2 className="h-4 w-4" />
                  HTML Source
                </button>
              </div>

              {fullHtml && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)] transition-colors shadow-sm"
                  >
                    {copiedCode ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copiedCode ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleDownloadHtml}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--primary)]/90 shadow-sm transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Save HTML
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              {!fullHtml ? (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-10 text-center text-[var(--muted-foreground)]">
                  <FileCode className="mb-4 h-16 w-16 opacity-10" />
                  <p className="text-lg font-medium text-[var(--foreground)]">No output generated</p>
                  <p className="mt-1">Upload an Excel file to see the HTML conversion here.</p>
                </div>
              ) : activeTab === "preview" ? (
                <div className="h-full w-full absolute inset-0">
                  <iframe
                    title="HTML Preview"
                    srcDoc={fullHtml}
                    className="h-full w-full border-none bg-white"
                  />
                </div>
              ) : (
                <div className="h-full absolute inset-0 overflow-auto bg-[#0d1117] p-6">
                  <pre className="text-sm font-mono text-[#c9d1d9] whitespace-pre-wrap break-all">
                    <code>{fullHtml}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
