"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Button, EmptyState } from "@altftool/ui";
import {
  Upload, FileSearch, Download, Share2, BarChart3, Grid3X3, List,
  Heart, Trash2, X, Copy, Check, AlertCircle,
} from "lucide-react";
import { useFileExplorer } from "../hooks/useFileExplorer";
import UploadZone from "../components/UploadZone";
import MetadataViewer from "../components/MetadataViewer";
import PreviewPanel from "../components/PreviewPanel";
import StatisticsCards from "../components/StatisticsCards";
import SearchPanel from "../components/SearchPanel";
import ExportDialog from "../components/ExportDialog";
import HashGenerator from "../components/HashGenerator";

export default function FileMetadataMain() {
  const explorer = useFileExplorer();
  const [showExport, setShowExport] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">File Metadata Explorer</h1>
            <p className="text-sm text-(--muted-foreground) mt-1">
              Extract detailed metadata from files — all processing stays in your browser.
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => explorer.setView(explorer.view === "cards" ? "list" : "cards")}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-10 sm:w-10"
              title="Toggle view"
              aria-label={explorer.view === "cards" ? "Switch to list view" : "Switch to card view"}
            >
              {explorer.view === "cards" ? <List size="18" /> : <Grid3X3 size="18" />}
            </button>
            {explorer.files.length > 0 && (
              <>
                <button onClick={() => setShowExport(true)} aria-label="Export metadata" className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-10 sm:w-10" title="Export">
                  <Download size="18" />
                </button>
                <button onClick={explorer.clearAll} aria-label="Clear all files" className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--card) border border-(--border) text-(--muted-foreground) hover:border-(--border-strong) hover:text-(--danger) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-10 sm:w-10" title="Clear all">
                  <Trash2 size="18" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <UploadZone onFilesAdded={explorer.processFiles} loading={explorer.loading} />

          {explorer.files.length > 0 && (
            <StatisticsCards stats={explorer.summaryStats} />
          )}

          {explorer.files.length > 0 && (
            <SearchPanel search={explorer.search} onChange={explorer.setSearch} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`${explorer.selectedFile ? "lg:col-span-7" : "lg:col-span-12"}`}>
            {explorer.filteredFiles.length === 0 ? (
              <EmptyState
                icon={<FileSearch size="32" />}
                title={explorer.files.length === 0 ? "No files uploaded" : "No files match your search"}
                description={explorer.files.length === 0 ? "Upload files to explore their metadata" : "Try a different search term"}
              />
            ) : explorer.view === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {explorer.filteredFiles.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => explorer.setSelectedFile(f)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      explorer.selectedFile?.id === f.id
                        ? "border-(--primary) bg-(--primary-soft)"
                        : "border-(--border) bg-(--card) hover:border-(--border-strong) hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg bg-(--muted) flex items-center justify-center text-xs font-bold text-(--muted-foreground)`}>
                        {f.meta.extension?.slice(0, 3) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-(--foreground) truncate">{f.meta.fileName}</p>
                        <p className="text-xs text-(--muted-foreground)">
                          {f.meta.type || "Unknown"} • {f.meta.sizeFormatted || "—"}
                        </p>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); explorer.toggleFavorite(f); }}
                          aria-label={`Toggle favorite for ${f.meta.fileName}`}
                          className="flex h-9 w-9 items-center justify-center rounded hover:bg-(--card) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                        >
                          <Heart size="14" className={explorer.favorites.find((fav) => fav.id === f.id) ? "fill-(--danger) text-(--danger)" : ""} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); explorer.removeFile(f.id); }}
                          aria-label={`Remove ${f.meta.fileName}`}
                          className="flex h-9 w-9 items-center justify-center rounded hover:bg-(--card) text-(--muted-foreground) hover:text-(--danger) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                        >
                          <X size="14" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-(--border) overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-(--muted)">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-(--muted-foreground)">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-(--muted-foreground)">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-(--muted-foreground)">Size</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-(--muted-foreground)">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {explorer.filteredFiles.map((f) => (
                      <tr
                        key={f.id}
                        onClick={() => explorer.setSelectedFile(f)}
                        className="cursor-pointer hover:bg-(--muted) transition"
                      >
                        <td className="px-3 py-2 text-(--foreground) font-medium truncate max-w-[200px]">{f.meta.fileName}</td>
                        <td className="px-3 py-2 text-(--muted-foreground)">{f.meta.type || "—"}</td>
                        <td className="px-3 py-2 text-(--muted-foreground)">{f.meta.sizeFormatted || "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={(e) => { e.stopPropagation(); explorer.removeFile(f.id); }} aria-label={`Remove ${f.meta.fileName}`} className="inline-flex h-9 w-9 items-center justify-center rounded text-(--muted-foreground) hover:text-(--danger) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)">
                            <X size="14" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {explorer.selectedFile && (
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-(--foreground)">Details</h3>
                <button
                  onClick={() => explorer.setSelectedFile(null)}
                  aria-label="Close details panel"
                  className="flex h-9 w-9 items-center justify-center rounded hover:bg-(--muted) text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)"
                >
                  <X size="16" />
                </button>
              </div>
              <PreviewPanel fileData={explorer.selectedFile} />
              <MetadataViewer fileData={explorer.selectedFile} />
              <HashGenerator fileData={explorer.selectedFile} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-2">How to Use</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-(--muted-foreground)">
              <li>Drag & drop files or click to browse.</li>
              <li>Files are processed entirely in your browser — nothing is uploaded.</li>
              <li>Click any file to view detailed metadata.</li>
              <li>Export results as JSON, CSV, or print.</li>
            </ol>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold text-(--foreground) mb-4">FAQ</h2>
            <div className="space-y-3">
              {[
                { q: "Are my files uploaded?", a: "No. All processing happens locally in your browser. Files never leave your device." },
                { q: "What file types are supported?", a: "Images (JPEG, PNG, GIF, WebP, SVG), text files, PDFs, documents, audio, and video." },
                { q: "How is the file hash generated?", a: "A hash is computed from the file name and size using a fast checksum algorithm." },
              ].map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-sm font-semibold text-(--foreground)">{faq.q}</h3>
                  <p className="text-sm text-(--muted-foreground)">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        files={explorer.files}
      />
    </div>
  );
}
