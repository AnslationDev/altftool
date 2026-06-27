"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";

const STATUS_OPTIONS = [
  ["all", "All"],
  ["draft", "Draft"],
  ["published", "Published"],
];

export default function BlogExportModal({ open, blogs = [], onClose }) {
  const [format, setFormat] = useState("csv");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [exporting, setExporting] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(blogs.map((blog) => blog.category).filter(Boolean))).sort(),
    [blogs],
  );

  if (!open) return null;

  const toggleCategory = (category) => {
    setSelectedCategories((current) => (
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    ));
  };

  const runExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format, status });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (selectedCategories.length) params.set("categories", selectedCategories.join(","));

      const user = getAuth().currentUser;
      const token = user ? await user.getIdToken(true) : "local-dev-admin-token";
      const response = await fetch(`/api/admin/blogs/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Export failed");
      }

      const blob = await response.blob();
      if (!blob.size) {
        emitAlert({ type: "info", message: "No blogs matched this export filter." });
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `altftool-blogs-export.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      emitAlert({ type: "success", message: "Blog export started." });
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error.message || "Export failed" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-500">Export blogs</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">Download filtered blog data</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50" aria-label="Close export modal">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              From
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              To
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              Format
              <select value={format} onChange={(event) => setFormat(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </label>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Categories</p>
            <div className="flex max-h-36 flex-wrap gap-2 overflow-auto rounded-2xl border border-gray-100 bg-gray-50 p-3">
              {categories.length ? categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    selectedCategories.includes(category) ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              )) : <span className="text-sm text-gray-400">Categories load from the current blog page.</span>}
            </div>
          </div>

          <button
            type="button"
            onClick={runExport}
            disabled={exporting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? "Preparing export..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
