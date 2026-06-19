"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, ImagePlus, FolderOpen } from "lucide-react";
import { ACCEPTED_TYPES } from "../../lib/imageProcessing";
import { isImageFile } from "../../lib/utils";
import { UploadArt } from "../illustrations/Spots";
import ToolArt from "../illustrations/ToolArt";
import { getTool } from "../../data/tools";
import { motion, useReducedMotion } from "../../lib/motion";

/**
 * Premium, accessible upload area with drag & drop, click, and paste.
 */
export default function Dropzone({
  onFiles,
  multiple = false,
  title,
  subtitle,
  compact = false,
  enablePaste = true,
  slug,
  accept = ACCEPTED_TYPES,
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const reduce = useReducedMotion();
  const accent = slug ? getTool(slug)?.accent || "#2563eb" : "#2563eb";

  const handleFiles = useCallback(
    (list) => {
      const files = Array.from(list || []).filter(isImageFile);
      if (!files.length) return;
      onFiles(multiple ? files : [files[0]]);
    },
    [onFiles, multiple]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // paste-to-upload
  useEffect(() => {
    if (!enablePaste) return;
    const onPaste = (e) => {
      const files = Array.from(e.clipboardData?.files || []).filter(isImageFile);
      if (files.length) handleFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [enablePaste, handleFiles]);

  if (compact) {
    return (
      <div
        className="ali-dropzone flex items-center gap-3 p-3 text-left cursor-pointer"
        data-drag={drag}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        aria-label="Upload image"
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white" style={{ background: "var(--ali-grad)" }}>
          {drag ? <ImagePlus size={20} /> : <UploadCloud size={20} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{title || "Drop an image or click to browse"}</span>
          <span className="block truncate text-xs" style={{ color: "var(--ali-muted)" }}>{subtitle || "JPG · PNG · WEBP · paste also works"}</span>
        </span>
        <span className="ali-btn ali-btn-ghost shrink-0" style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}><FolderOpen size={14} /> Browse</span>
      </div>
    );
  }

  return (
    <motion.div
      className="ali-dropzone p-8 text-center cursor-pointer sm:p-14"
      data-drag={drag}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      aria-label="Upload image"
      animate={reduce ? undefined : { scale: drag ? 1.012 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
      <div className="flex flex-col items-center gap-5">
        <motion.div animate={reduce ? undefined : { y: drag ? -6 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
          {slug ? (
            <ToolArt slug={slug} accent={accent} size={drag ? 270 : 250} />
          ) : (
            <UploadArt size={drag ? 140 : 124} className="transition-all" />
          )}
        </motion.div>
        <div>
          <p className="text-lg font-bold sm:text-xl">
            {title || (drag ? "Drop to upload" : "Drag & drop your image here")}
          </p>
          <p className="mt-1.5 text-sm" style={{ color: "var(--ali-muted)" }}>
            {subtitle || (multiple ? "or click to select multiple files" : "or click to browse")}
          </p>
        </div>
        <button type="button" className="ali-btn ali-btn-primary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
          <FolderOpen size={16} /> Choose {multiple ? "images" : "an image"}
        </button>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {["JPG", "PNG", "WEBP", "GIF"].map((f) => <span key={f} className="ali-chip" style={{ padding: "0.3rem 0.7rem" }}>{f}</span>)}
          <span className="text-xs" style={{ color: "var(--ali-muted)" }}>· or paste from clipboard</span>
        </div>
      </div>
    </motion.div>
  );
}
