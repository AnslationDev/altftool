"use client";

import { useState } from "react";
import { Copy, ImageIcon, UploadCloud } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

export default function ToolHome() {
  const [dataUrl, setDataUrl] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setFileInfo({ name: file.name, size: file.size, type: file.type });
    const reader = new FileReader();
    reader.onload = () => setDataUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const copyData = async () => {
    setCopied(await safeCopyText(dataUrl));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] lg:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ImageIcon className="h-4 w-4" />
            Encoding utility
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Image to Base64</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert local images into Base64 data URLs for HTML, CSS, tests, and quick embeds.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center hover:bg-[var(--muted)]">
              <UploadCloud className="h-10 w-10 text-[var(--primary)]" />
              <span className="mt-3 text-sm font-semibold">Upload image</span>
              <input data-testid="image-to-base64-file-input" type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>
            {fileInfo && (
              <div className="mt-5 space-y-2 text-sm">
                <p className="rounded-lg bg-[var(--muted)] px-3 py-2"><strong>Name:</strong> {fileInfo.name}</p>
                <p className="rounded-lg bg-[var(--muted)] px-3 py-2"><strong>Size:</strong> {formatBytes(fileInfo.size)}</p>
                <p className="rounded-lg bg-[var(--muted)] px-3 py-2"><strong>Type:</strong> {fileInfo.type || "Unknown"}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Base64 output</h2>
              <button type="button" disabled={!dataUrl} onClick={copyData} className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            {dataUrl ? (
              <>
                <div className="mb-4 max-h-64 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dataUrl} alt="" className="max-h-64 w-full object-contain" />
                </div>
                <textarea data-testid="tool-output" readOnly value={dataUrl} className="min-h-64 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs outline-none" />
              </>
            ) : (
              <div data-testid="tool-output" className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] text-sm text-[var(--muted-foreground)]">
                Base64 data URL will appear here.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
