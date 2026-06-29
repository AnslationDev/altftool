"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  BLOG_EXPORT_COLUMNS,
  downloadBlob,
  getBlogTimelineDate,
  normalizeBlogExportRow,
  rowsToCsvBlob,
  rowsToXlsxBlob,
} from "./blogExportUtils";

const STATUS_OPTIONS = [
  ["published", "Published"],
  ["draft", "Draft"],
  ["all", "All"],
];

const FORMATS = [
  { id: "xlsx", label: "Excel", sub: ".xlsx", icon: FileSpreadsheet },
  { id: "csv", label: "CSV", sub: ".csv", icon: FileText },
];

/* Inclusive day-bounded range check against a blog's timeline date. */
function withinRange(date, from, to) {
  if (!date) return !from && !to; // undated blogs only pass when no range is set
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export default function BlogExportModal({ open, blogs = [], onClose }) {
  const [format, setFormat] = useState("xlsx");
  const [status, setStatus] = useState("published");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [exporting, setExporting] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(blogs.map((blog) => blog.category).filter(Boolean))).sort(),
    [blogs],
  );

  /* Live preview of how many blogs match the current filter selection. */
  const matchCount = useMemo(() => {
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999`) : null;
    return blogs.filter((blog) => {
      if (status !== "all" && (blog.status || "draft") !== status) return false;
      if (selectedCategories.length && !selectedCategories.includes(blog.category)) return false;
      return withinRange(getBlogTimelineDate(blog), fromDate, toDate);
    }).length;
  }, [blogs, status, from, to, selectedCategories]);

  if (!open) return null;

  const invalidRange = from && to && from > to;

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const runExport = async () => {
    if (invalidRange) {
      emitAlert({ type: "error", message: "“From” date must be before “To” date." });
      return;
    }
    setExporting(true);
    try {
      const fromDate = from ? new Date(`${from}T00:00:00`) : null;
      const toDate = to ? new Date(`${to}T23:59:59.999`) : null;

      const rows = blogs
        .filter((blog) => {
          if (status !== "all" && (blog.status || "draft") !== status) return false;
          if (selectedCategories.length && !selectedCategories.includes(blog.category)) return false;
          return withinRange(getBlogTimelineDate(blog), fromDate, toDate);
        })
        .map(normalizeBlogExportRow);

      if (!rows.length) {
        emitAlert({ type: "info", message: "No blogs matched this export filter." });
        return;
      }

      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `altftool-blogs-${status}-${stamp}.${format}`;
      const blob = format === "xlsx"
        ? await rowsToXlsxBlob(rows, BLOG_EXPORT_COLUMNS)
        : rowsToCsvBlob(rows);

      downloadBlob(blob, filename);
      emitAlert({ type: "success", message: `Exported ${rows.length} blog${rows.length === 1 ? "" : "s"} as ${format.toUpperCase()}.` });
      logAuditEvent({
        module: "blogs",
        action: "BLOG_EXPORT",
        entityType: "blog",
        entityId: null,
        summary: `Exported ${rows.length} ${status} blog row${rows.length === 1 ? "" : "s"} as ${format}`,
        changes: { format, status, from, to, categories: selectedCategories, rowCount: rows.length },
        route: "/altftool/blogs",
      });
      onClose();
    } catch (error) {
      console.error("[blog-export]", error);
      emitAlert({ type: "error", message: error.message || "Export failed" });
    } finally {
      setExporting(false);
    }
  };

  const fieldLabel = "space-y-1.5 text-xs font-bold uppercase tracking-wider text-muted";
  const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Export blogs">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-lg">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Export blogs</p>
            <h2 className="mt-1 text-xl font-bold text-foreground">Download filtered blog data</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-border p-2 text-muted transition hover:bg-surface-soft" aria-label="Close export modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Format</p>
            <div className="grid grid-cols-2 gap-3">
              {FORMATS.map(({ id, label, sub, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormat(id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    format === id
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border bg-surface text-foreground hover:bg-surface-soft"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>
                    <span className="block text-sm font-bold leading-tight">{label}</span>
                    <span className="block text-xs text-muted">{sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <label className={fieldLabel}>
              From
              <input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className={inputClass} />
            </label>
            <label className={fieldLabel}>
              To
              <input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className={inputClass} />
            </label>
          </div>
          {invalidRange && (
            <p className="-mt-1 text-xs font-semibold text-danger">“From” date must be on or before “To” date.</p>
          )}

          {/* Status */}
          <label className={fieldLabel}>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
              {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          {/* Categories */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
              Categories <span className="font-medium normal-case text-muted">(optional)</span>
            </p>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-auto rounded-xl border border-border bg-surface-soft p-3">
              {categories.length ? categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    selectedCategories.includes(category) ? "bg-primary text-primary-foreground" : "bg-surface text-muted hover:bg-surface-soft"
                  }`}
                >
                  {category}
                </button>
              )) : <span className="text-sm text-muted">No categories available.</span>}
            </div>
          </div>

          <button
            type="button"
            onClick={runExport}
            disabled={exporting || invalidRange || matchCount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting
              ? "Preparing export…"
              : matchCount === 0
                ? "No blogs match these filters"
                : `Export ${matchCount} blog${matchCount === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
