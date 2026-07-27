"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";
import { GhostButton } from "./ui";
import { extensionFor, mimeFor } from "../_lib/formats";

/**
 * Download the current output as a file named after the tool + target format.
 * @param {{ value: string, slug: string, format: string, disabled?: boolean, onDone?: (msg: string) => void }} props
 */
export default function DownloadButton({ value, slug, format, disabled, onDone }) {
  const handleDownload = useCallback(() => {
    if (!value) {
      onDone?.("Nothing to download yet");
      return;
    }
    const ext = extensionFor(format);
    const blob = new Blob([value], { type: `${mimeFor(format)};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    onDone?.("File downloaded");
  }, [value, slug, format, onDone]);

  return (
    <GhostButton
      icon={Download}
      label={`Download .${extensionFor(format)}`}
      onClick={handleDownload}
      disabled={disabled || !value}
    />
  );
}
