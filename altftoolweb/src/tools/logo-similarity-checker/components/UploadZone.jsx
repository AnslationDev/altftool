"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, RefreshCw, Clipboard } from "lucide-react";
import toast from "react-hot-toast";

const ACCEPTED = { "image/png": [".png"], "image/svg+xml": [".svg"], "image/jpeg": [".jpg",".jpeg"], "image/webp": [".webp"] };

// Hoisted to module scope so identity stays stable across UploadZone
// re-renders -- when this was declared inline inside UploadZone's body,
// React remounted every DropZone (and re-created/revoked each preview's
// object URL) on any unrelated UploadZone state change, e.g. typing in the
// paste-URL modal.
function DropZone({ label, onUpload, currentFile, onPasteClick }) {
  const onDrop = useCallback((files) => { if (files?.[0]) onUpload(files[0]); }, [onUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED, multiple: false });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!currentFile) { setPreviewUrl(null); return; }
    const objectUrl = URL.createObjectURL(currentFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [currentFile]);

  return (
    <div className="flex-1">
      {currentFile ? (
        <div className="relative rounded-xl border border-[--border] bg-[--surface] overflow-hidden">
          <img src={previewUrl} alt={label} className="h-48 w-full object-contain bg-[--page]" />
          <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/5" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button onClick={() => onUpload(null)} aria-label="Remove image" className="rounded-lg bg-[--surface]/90 p-1.5 text-[--muted] shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"><X className="h-4 w-4" /></button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
            <p className="text-xs font-medium text-white truncate">{currentFile.name}</p>
            <p className="text-[10px] text-white/80">{formatSize(currentFile.size)}</p>
          </div>
        </div>
      ) : (
        <div {...getRootProps()} className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${isDragActive ? "border-primary bg-primary/5" : "border-[--border] hover:border-primary/50 hover:bg-[--surface-soft]"}`}>
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Upload className="h-6 w-6" /></div>
            <p className="text-sm font-medium text-[--foreground]">{label}</p>
            <p className="text-xs text-[--muted]">PNG, SVG, JPG, WEBP</p>
            <button onClick={(e) => { e.stopPropagation(); onPasteClick(); }}
              className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[--surface-soft] px-2.5 py-1 text-xs text-[--muted] transition-colors hover:text-[--foreground]"><Clipboard className="h-3 w-3" />Paste</button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

export default function UploadZone({ logoA, logoB, onUploadA, onUploadB, onSwap, onReset }) {
  const [pastingFor, setPastingFor] = useState(null);
  const [pasteText, setPasteText] = useState("");
  const pasteDebounceRef = useRef(null);
  const modalRef = useRef(null);
  const modalTitleId = "logo-similarity-paste-modal-title";

  useEffect(() => {
    return () => { if (pasteDebounceRef.current) clearTimeout(pasteDebounceRef.current); };
  }, []);

  const closePasteModal = useCallback(() => {
    setPastingFor(null);
    setPasteText("");
  }, []);

  // Escape-to-close and a Tab focus trap while the paste-URL dialog is open.
  useEffect(() => {
    if (!pastingFor) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closePasteModal();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pastingFor, closePasteModal]);

  const handlePasteTextChange = (e) => {
    const value = e.target.value;
    setPasteText(value);
    if (pasteDebounceRef.current) clearTimeout(pasteDebounceRef.current);
    if (value) {
      // Debounced preview-load attempt -- previously a new Image() load was
      // started on every keystroke with no debounce.
      pasteDebounceRef.current = setTimeout(() => {
        const img = new Image();
        img.src = value;
      }, 400);
    }
  };

  const handlePaste = () => {
    if (!pasteText.trim()) return;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `pasted-${pastingFor}.png`, { type: "image/png" });
              if (pastingFor === "A") onUploadA(file);
              else onUploadB(file);
              setPastingFor(null); setPasteText("");
            } else {
              toast.error("Could not load that image URL");
            }
          });
        } catch {
          toast.error("That image can't be loaded (blocked by the source site's CORS policy)");
        }
      };
      img.onerror = () => { toast.error("Failed to load image from that URL"); };
      if (pasteText.startsWith("data:") || pasteText.startsWith("http")) img.src = pasteText;
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <DropZone label="Upload Logo A" onUpload={(f) => onUploadA(f === null ? null : f)} currentFile={logoA} onPasteClick={() => setPastingFor("A")} />
        <div className="flex items-center gap-2">
          <button onClick={onSwap} disabled={!logoA && !logoB} aria-label="Swap Logo A and Logo B" className="rounded-lg border border-[--border] p-2 text-[--muted] transition-colors hover:bg-[--surface-soft] hover:text-[--foreground] disabled:opacity-30"><RefreshCw className="h-5 w-5" /></button>
        </div>
        <DropZone label="Upload Logo B" onUpload={(f) => onUploadB(f === null ? null : f)} currentFile={logoB} onPasteClick={() => setPastingFor("B")} />
      </div>

      {(logoA || logoB) && (
        <div className="flex justify-center">
          <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium text-[--muted] transition-colors hover:bg-[--surface-soft] hover:text-[--foreground]"><X className="h-3.5 w-3.5" />Reset Both</button>
        </div>
      )}

      {pastingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closePasteModal}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={modalTitleId} className="w-full max-w-md rounded-xl border border-[--border] bg-[--surface] p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 id={modalTitleId} className="mb-2 text-sm font-semibold text-[--foreground]">Paste Image URL for Logo {pastingFor}</h3>
            <input type="text" value={pasteText} onChange={handlePasteTextChange}
              placeholder="Paste image URL or data URL..." className="w-full rounded-lg border border-[--border] bg-[--page] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20" autoFocus />
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={closePasteModal} className="rounded-lg border border-[--border] px-3 py-1.5 text-sm font-medium text-[--muted] transition-colors hover:bg-[--surface-soft]">Cancel</button>
              <button onClick={handlePaste} disabled={!pasteText.trim()} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">Load</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
