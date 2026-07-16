"use client";

import { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  FileJson,
  FileSpreadsheet,
  File,
  Clipboard,
  X,
} from "lucide-react";
import { SUPPORTED_FORMATS } from "../utils/constants";

const formatIcons = {
  json: FileJson,
  markdown: FileText,
  txt: File,
  html: FileText,
  csv: FileSpreadsheet,
};

export default function UploadZone({ onFilesSelected, onPasteContent }) {
  const [dragOver, setDragOver] = useState(false);
  const [pastedContent, setPastedContent] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const textareaRef = useRef(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.length) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
      "text/markdown": [".md",".markdown"],
      "text/plain": [".txt"],
      "text/html": [".html",".htm"],
      "text/csv": [".csv"],
    },
    multiple: true,
  });

  const handlePasteSubmit = () => {
    if (pastedContent.trim()) {
      onPasteContent(pastedContent);
      setPastedContent("");
      setShowPaste(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragActive || dragOver
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-[--border] hover:border-primary/50 hover:bg-[--surface-soft]"
        }`}
        onDragOver={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-[--foreground]">
              {isDragActive
                ? "Drop files here"
                : "Drag & drop your chat export"}
            </p>
            <p className="mt-1 text-sm text-[--muted]">
              or click to browse files
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {SUPPORTED_FORMATS.map((fmt) => {
              const Icon = formatIcons[fmt.value] || File;
              return (
                <span
                  key={fmt.value}
                  className="inline-flex items-center gap-1 rounded-md bg-[--surface-soft] px-2.5 py-1 text-xs font-medium text-[--muted]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {fmt.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-[--border]" />
        <span className="text-xs font-medium text-[--muted]">OR</span>
        <div className="flex-1 border-t border-[--border]" />
      </div>

      {!showPaste ? (
        <button
          onClick={() => setShowPaste(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[--border] bg-[--surface] px-4 py-3 text-sm font-medium text-[--muted] transition-colors hover:border-primary/40 hover:text-[--foreground]"
        >
          <Clipboard className="h-4 w-4" />
          Paste your chat conversation
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-[--border] bg-[--surface] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[--foreground]">
              Paste chat content
            </span>
            <button
              onClick={() => {
                setShowPaste(false);
                setPastedContent("");
              }}
              className="rounded-lg p-1 text-[--muted] transition-colors hover:bg-[--surface-soft] hover:text-[--foreground]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={pastedContent}
            onChange={(e) => setPastedContent(e.target.value)}
            placeholder="Paste your ChatGPT conversation JSON, Markdown, TXT or CSV here..."
            className="min-h-[120px] w-full resize-y rounded-lg border border-[--border] bg-[--page] p-3 text-sm text-[--foreground] placeholder:text-[--muted] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowPaste(false);
                setPastedContent("");
              }}
              className="rounded-lg border border-[--border] px-4 py-2 text-sm font-medium text-[--muted] transition-colors hover:bg-[--surface-soft] hover:text-[--foreground]"
            >
              Cancel
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={!pastedContent.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Parse Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
