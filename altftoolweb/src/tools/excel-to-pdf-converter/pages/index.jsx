"use client";

import { useState, useRef, useMemo } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  LayoutList,
  RefreshCw,
  FileText,
  Loader2
} from "lucide-react";
import * as XLSX from "xlsx";

export default function ToolHome() {
  const [fileData, setFileData] = useState(null); // stores { name, size, workbook }
  const [activeSheetName, setActiveSheetName] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

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
  const htmlTable = useMemo(() => {
    if (!fileData || !activeSheetName) return { __html: "" };

    const worksheet = fileData.workbook.Sheets[activeSheetName];
    // Generate HTML table string
    const tableString = XLSX.utils.sheet_to_html(worksheet, { id: "excel-table", editable: false });
    return { __html: tableString };
  }, [fileData, activeSheetName]);

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !fileData) return;

    try {
      setIsGenerating(true);
      // Dynamically import html2pdf.js only on the client side
      const html2pdf = (await import("html2pdf.js")).default;

      const safeName = fileData.name.replace(/\.[^/.]+$/, "");
      const fileName = `${safeName}-${activeSheetName}.pdf`;

      const element = previewRef.current;

      const opt = {
        margin:       10,
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
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
            <FileText className="h-4 w-4" />
            File Converter Utility
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Excel to PDF <span className="text-[var(--primary)]">Converter</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
            Easily convert your XLS and XLSX spreadsheet files into beautifully formatted PDF documents. Perfect for sharing data securely and preparing tables for print.
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

          {/* RIGHT COLUMN: Output Preview */}
          <div className="flex flex-col lg:col-span-8 h-full min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold">Preview Document</h2>

              {fileData && (
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                  className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--primary)]/90 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              {!fileData ? (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-10 text-center text-[var(--muted-foreground)]">
                  <FileText className="mb-4 h-16 w-16 opacity-10" />
                  <p className="text-lg font-medium text-[var(--foreground)]">No document generated</p>
                  <p className="mt-1">Upload an Excel file to preview it here.</p>
                </div>
              ) : (
                <div className="h-full max-h-[600px] w-full overflow-auto bg-gray-50/50 p-6">
                  {/* The actual HTML content to be converted into PDF */}
                  <div
                    ref={previewRef}
                    className="bg-white mx-auto shadow-sm border border-gray-200 p-8 min-h-[1056px] w-[793px]"
                    style={{ boxSizing: "border-box" }}
                  >
                    <div className="mb-6 border-b pb-4">
                      <h2 className="text-2xl font-bold text-gray-800">{fileData.name}</h2>
                      <p className="text-gray-500 mt-1">Sheet: {activeSheetName}</p>
                    </div>

                    {/* Rendered Table styling injected specifically for the PDF */}
                    <style dangerouslySetInnerHTML={{ __html: `
                      #excel-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                      }
                      #excel-table th, #excel-table td {
                        border: 1px solid #e5e7eb;
                        padding: 6px 10px;
                        text-align: left;
                        white-space: nowrap;
                      }
                      #excel-table th {
                        background-color: #f9fafb;
                        font-weight: bold;
                        color: #374151;
                      }
                      #excel-table tr:nth-child(even) {
                        background-color: #fdfdfd;
                      }
                    `}} />

                    <div
                      className="overflow-hidden"
                      dangerouslySetInnerHTML={htmlTable}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
