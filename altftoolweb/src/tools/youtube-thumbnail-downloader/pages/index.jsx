"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Video } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function getVideoId(input) {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const patterns = [/youtu\.be\/([a-zA-Z0-9_-]{11})/, /v=([a-zA-Z0-9_-]{11})/, /shorts\/([a-zA-Z0-9_-]{11})/, /embed\/([a-zA-Z0-9_-]{11})/];
  return patterns.map((pattern) => value.match(pattern)?.[1]).find(Boolean) || "";
}

const sizes = [
  ["Max resolution", "maxresdefault.jpg"],
  ["HD", "hqdefault.jpg"],
  ["Standard", "sddefault.jpg"],
  ["Medium", "mqdefault.jpg"],
];

export default function ToolHome() {
  const [input, setInput] = useState("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  const [copied, setCopied] = useState("");
  const videoId = useMemo(() => getVideoId(input), [input]);
  const thumbnails = useMemo(() => sizes.map(([label, file]) => [label, videoId ? `https://img.youtube.com/vi/${videoId}/${file}` : ""]), [videoId]);

  const copyUrl = async (label, url) => {
    setCopied((await safeCopyText(url)) ? label : "");
    setTimeout(() => setCopied(""), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Video className="h-4 w-4" />
            Creator utility
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">YouTube Thumbnail Downloader</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Paste a YouTube URL or video ID to preview available thumbnail sizes and copy direct image links.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <label className="block">
            <span className="text-sm font-semibold">YouTube URL or video ID</span>
            <input value={input} onChange={(event) => setInput(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
          </label>
          <p className="mt-3 break-all text-sm font-semibold text-[var(--muted-foreground)]">Video ID: {videoId || "Not detected"}</p>
          {copied && <p className="mt-2 text-sm font-semibold text-green-600">{copied} copied</p>}
        </section>

        <section className="tool-card-grid">
          {thumbnails.map(([label, url]) => (
            <div key={label} className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="aspect-video bg-[var(--muted)]">
                {url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{label}</h2>
                  <p className="mt-1 break-all text-xs text-[var(--muted-foreground)]">{url || "Enter a valid video URL"}</p>
                </div>
                <div className="tool-action-grid w-full sm:w-auto">
                  <button type="button" disabled={!url} onClick={() => copyUrl(label, url)} className="btn-secondary min-h-10 px-3 py-2 disabled:opacity-50">
                    <Copy className="h-4 w-4" />
                    Copy
                  </button>
                  <a href={url || "#"} target="_blank" rel="noreferrer" className="btn-primary min-h-10 px-3 py-2">
                    <Download className="h-4 w-4" />
                    Open
                  </a>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
