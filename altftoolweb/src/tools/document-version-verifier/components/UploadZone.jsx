"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Trash2, CheckCircle2, AlertCircle, FolderPlus, ArrowRight, RefreshCw } from "lucide-react";

const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt", "rtf", "csv", "json", "xml", "html", "md"];

export default function UploadZone({
  fileList,
  selectedDocAIndex,
  selectedDocBIndex,
  onFilesAdded,
  onRemoveFile,
  onSelectDocA,
  onSelectDocB,
  onClearAll,
  isLoading,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Upload Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition-all duration-300 ${isDragging
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
            : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-400"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.rtf,.csv,.json,.xml,.html,.md"
          className="hidden"
          onChange={handleFileInput}
        />
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 mb-4 shadow-inner">
          <Upload className="h-8 w-8 animate-bounce" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Drop your documents here or click to browse
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload up to 10 files (200MB max per file). Privacy guaranteed — 100% processed in your browser.
        </p>

        {/* Action Buttons & Format Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <FileText className="h-4 w-4" />
            Select Files
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            <FolderPlus className="h-4 w-4" />
            Upload Folder
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {SUPPORTED_EXTENSIONS.map((ext) => (
            <span
              key={ext}
              className="rounded-lg bg-slate-200/70 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              .{ext}
            </span>
          ))}
        </div>
      </div>

      {/* Uploaded File List & Active Comparison Selectors */}
      {fileList.length > 0 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Uploaded Documents ({fileList.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select which files to assign as Original (Doc A) vs Updated (Doc B)
              </p>
            </div>
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
          </div>

          {/* Active Target Document Pickers */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
              <label className="block text-xs font-extrabold uppercase tracking-wide text-indigo-700 dark:text-indigo-300 mb-2">
                1. Original Document (Version A)
              </label>
              <select
                value={selectedDocAIndex}
                onChange={(e) => onSelectDocA(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none"
              >
                {fileList.map((file, idx) => (
                  <option key={idx} value={idx}>
                    [{idx + 1}] {file.name} ({Math.round(file.size / 1024)} KB)
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-4">
              <label className="block text-xs font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 mb-2">
                2. Updated Document (Version B)
              </label>
              <select
                value={selectedDocBIndex}
                onChange={(e) => onSelectDocB(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm font-semibold text-slate-900 dark:text-white shadow-sm focus:border-emerald-500 focus:outline-none"
              >
                {fileList.map((file, idx) => (
                  <option key={idx} value={idx}>
                    [{idx + 1}] {file.name} ({Math.round(file.size / 1024)} KB)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed File Items */}
          <div className="space-y-2">
            {fileList.map((file, idx) => {
              const isDocA = idx === selectedDocAIndex;
              const isDocB = idx === selectedDocBIndex;
              return (
                <div
                  key={idx}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${isDocA
                      ? "border-indigo-400 bg-indigo-50/70 dark:border-indigo-600 dark:bg-indigo-950/40"
                      : isDocB
                        ? "border-emerald-400 bg-emerald-50/70 dark:border-emerald-600 dark:bg-emerald-950/40"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs uppercase text-slate-700 dark:text-slate-200">
                      {file.name.split(".").pop()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {Math.round(file.size / 1024)} KB · Last Modified:{" "}
                        {new Date(file.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDocA && (
                      <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        Doc A (Original)
                      </span>
                    )}
                    {isDocB && (
                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                        Doc B (Updated)
                      </span>
                    )}
                    <button
                      onClick={() => onRemoveFile(idx)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
