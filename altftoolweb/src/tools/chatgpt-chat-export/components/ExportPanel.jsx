"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
  File,
  Printer,
  Share2,
  Copy,
  Check,
  Eye,
} from "lucide-react";
import {
  exportAs,
  copyToClipboard,
  printConversation,
} from "../utils/exporter";
import toast from "react-hot-toast";

const exportFormats = [
  { value: "pdf", label: "PDF", icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
  { value: "docx", label: "DOCX", icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
  { value: "markdown", label: "Markdown", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
  { value: "html", label: "HTML", icon: FileText, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/20" },
  { value: "txt", label: "TXT", icon: File, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-950/20" },
  { value: "json", label: "JSON", icon: FileJson, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/20" },
  { value: "csv", label: "CSV", icon: FileSpreadsheet, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/20" },
];

export default function ExportPanel({ conversation, settings }) {
  const [exporting, setExporting] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await exportAs(conversation, format, {
        pageSize: settings.pageSize,
        orientation: settings.orientation,
        darkTheme: settings.pdfDarkTheme,
        margins: settings.margins,
        theme: settings.pdfDarkTheme ? "dark" : "light",
      });
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  const handleCopy = async () => {
    const text = conversation.messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");
    try {
      await copyToClipboard(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handlePrint = () => {
    printConversation(conversation);
  };

  if (!conversation?.messages?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[--foreground]">
        Export Options
      </h3>

      <div className="flex flex-wrap gap-2">
        {exportFormats.map((fmt) => {
          const Icon = fmt.icon;
          const isLoading = exporting === fmt.value;
          return (
            <button
              key={fmt.value}
              onClick={() => handleExport(fmt.value)}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 rounded-lg border border-[--border] px-3 py-2 text-sm font-medium transition-all hover:border-[--border-strong] hover:bg-[--surface-soft] disabled:opacity-50 ${fmt.bg}`}
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icon className={`h-4 w-4 ${fmt.color}`} />
              )}
              {fmt.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy to Clipboard"}
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: conversation.title,
                text: conversation.messages.map((m) => m.content).join("\n"),
              });
            } else {
              toast.error("Share not supported on this browser");
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-sm font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  );
}
