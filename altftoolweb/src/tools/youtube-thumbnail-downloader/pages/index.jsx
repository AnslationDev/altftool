"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Play,
  Rocket,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function getVideoId(input) {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /v=([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  return patterns.map((pattern) => value.match(pattern)?.[1]).find(Boolean) || "";
}

const sizes = [
  { label: "Max Resolution", file: "maxresdefault.jpg", badge: "4K", dimensions: "3840 x 2160 px", tone: "primary", quality: "Ultra sharp preview" },
  { label: "HD Quality", file: "hqdefault.jpg", badge: "HD", dimensions: "1280 x 720 px", tone: "secondary", quality: "Best for posts" },
  { label: "Standard Quality", file: "sddefault.jpg", badge: "SD", dimensions: "640 x 480 px", tone: "success", quality: "Lightweight image" },
  { label: "Medium Quality", file: "mqdefault.jpg", badge: "MD", dimensions: "320 x 180 px", tone: "warning", quality: "Quick sharing" },
];

const features = [
  { title: "Multiple Sizes", description: "Download in different resolutions", icon: ImageIcon, tone: "primary" },
  { title: "Instant Preview", description: "See all available thumbnails instantly", icon: Zap, tone: "secondary" },
  { title: "Direct Links", description: "Get direct image links to use anywhere", icon: Link2, tone: "success" },
  { title: "High Quality", description: "Original quality thumbnails from YouTube", icon: ShieldCheck, tone: "warning" },
];

const toneClass = {
  primary: {
    text: "text-[var(--primary)]",
    soft: "bg-[color-mix(in_srgb,var(--primary)_12%,var(--card))]",
    border: "border-[color-mix(in_srgb,var(--primary)_22%,var(--border))]",
    button: "bg-[linear-gradient(135deg,var(--primary),var(--anslation-ds-primary-hover))] text-[var(--primary-foreground)]",
  },
  secondary: {
    text: "text-[var(--secondary)]",
    soft: "bg-[color-mix(in_srgb,var(--secondary)_12%,var(--card))]",
    border: "border-[color-mix(in_srgb,var(--secondary)_22%,var(--border))]",
    button: "bg-[linear-gradient(135deg,var(--secondary),var(--primary))] text-[var(--primary-foreground)]",
  },
  success: {
    text: "text-[var(--anslation-ds-success)]",
    soft: "bg-[var(--anslation-ds-success-soft)]",
    border: "border-[color-mix(in_srgb,var(--anslation-ds-success)_22%,var(--border))]",
    button: "bg-[var(--anslation-ds-success)] text-white",
  },
  warning: {
    text: "text-[var(--anslation-ds-warning)]",
    soft: "bg-[var(--anslation-ds-warning-soft)]",
    border: "border-[color-mix(in_srgb,var(--anslation-ds-warning)_24%,var(--border))]",
    button: "bg-[var(--anslation-ds-warning)] text-white",
  },
};

export default function ToolHome() {
  const [input, setInput] = useState("https://www.youtube.com/watch?v=aqz-KE-bpKQ");
  const [copied, setCopied] = useState("");
  const [activeVideoId, setActiveVideoId] = useState("aqz-KE-bpKQ");
  const [status, setStatus] = useState("");
  const detectedVideoId = useMemo(() => getVideoId(input), [input]);
  const videoId = activeVideoId;
  const thumbnails = useMemo(
    () => sizes.map(({ label, file }) => [label, videoId ? `https://i.ytimg.com/vi/${videoId}/${file}` : ""]),
    [videoId]
  );
  const sizeCount = thumbnails.filter(([, url]) => url).length;

  const showCopied = (message) => {
    setCopied(message);
    setTimeout(() => setCopied(""), 1400);
  };

  const showStatus = (message) => {
    setStatus(message);
    setTimeout(() => setStatus(""), 1800);
  };

  const previewThumbnails = () => {
    const nextVideoId = getVideoId(input);
    if (!nextVideoId) {
      showStatus("Please enter a valid YouTube URL or 11 character video ID.");
      return;
    }
    setActiveVideoId(nextVideoId);
    setInput((value) => value.trim());
    showStatus("Thumbnails updated");
    requestAnimationFrame(() => {
      document.getElementById("available-thumbnails")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const copyUrl = async (label, url) => {
    if (!url) return;
    const success = await safeCopyText(url);
    showCopied(success ? `${label} copied` : "Copy failed");
  };

  const copyAllLinks = async () => {
    if (!videoId) return;
    const allLinks = thumbnails.filter(([, url]) => url).map(([, url]) => url).join("\n");
    const success = await safeCopyText(allLinks);
    showCopied(success ? "All links copied" : "Copy failed");
  };

  const downloadThumbnail = async (label, url) => {
    if (!url) return;
    try {
      const response = await fetch(url, { mode: "cors", cache: "no-store" });
      if (!response.ok) throw new Error("Thumbnail download failed");
      const blob = await response.blob();
      const extension = blob.type.includes("png") ? "png" : "jpg";
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `youtube-${activeVideoId}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      showStatus(`${label} download started`);
    } catch {
      showStatus("Download blocked by browser. Opening image in a new tab.");
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--primary)_8%,transparent),transparent_34%),var(--background)] px-3 py-5 text-[var(--foreground)] sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <section className="overflow-hidden rounded-[var(--anslation-ds-radius-xl)] border border-[color-mix(in_srgb,var(--primary)_16%,var(--border))] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-lg)]">
          <div className="relative isolate min-h-[258px] overflow-hidden bg-[linear-gradient(112deg,var(--anslation-ds-footer)_0%,color-mix(in_srgb,var(--primary)_15%,var(--anslation-ds-footer))_50%,color-mix(in_srgb,var(--secondary)_16%,var(--anslation-ds-footer))_100%)] px-5 py-5 sm:px-8 lg:px-10">
            <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_95%_12%,var(--secondary)_0_1.5px,transparent_2.5px),radial-gradient(circle_at_74%_62%,var(--primary)_0_1.5px,transparent_2.5px)] [background-size:18px_18px,34px_34px]" />
            <div className="absolute -right-10 top-0 -z-10 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] blur-3xl" />
            <div className="absolute bottom-[-76px] left-[42%] -z-10 h-44 w-[520px] rounded-[50%] border border-white/10" />
            <div className="absolute bottom-[-52px] left-[44%] -z-10 h-36 w-[470px] rounded-[50%] border border-[color-mix(in_srgb,var(--secondary)_20%,transparent)]" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-center">
              <div className="min-w-0">
                <div className="inline-flex h-8 items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-white/12 px-3 text-[11px] font-bold uppercase text-white shadow-[var(--anslation-ds-shadow-sm)] ring-1 ring-white/12 backdrop-blur-md">
                  <Rocket className="h-3.5 w-3.5 text-[var(--secondary)]" />
                  Marketing tool
                </div>
                <h1 className="mt-4 max-w-4xl text-[2rem] font-extrabold leading-tight text-white sm:text-[2.6rem] lg:text-[3.15rem]">
                  YouTube{" "}
                  <span className="bg-[linear-gradient(135deg,var(--primary),var(--secondary))] bg-clip-text text-transparent">
                    Thumbnail Downloader
                  </span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82 sm:text-base">
                  Paste a YouTube URL or video ID to preview available thumbnail sizes
                  <br className="hidden sm:block" /> and copy direct image links.
                </p>

                <form
                  className="mt-5 flex max-w-[850px] flex-col gap-2 rounded-[var(--anslation-ds-radius-lg)] border border-white/55 bg-white p-1.5 shadow-[var(--anslation-ds-shadow-lg)] transition focus-within:ring-4 focus-within:ring-[color-mix(in_srgb,var(--secondary)_28%,transparent)] sm:flex-row sm:items-center"
                  onSubmit={(event) => {
                    event.preventDefault();
                    previewThumbnails();
                  }}
                >
                  <label className="flex min-h-10 min-w-0 flex-1 items-center gap-3 rounded-[var(--anslation-ds-radius)] px-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-white">
                      <Link2 className="h-4.5 w-4.5" />
                    </span>
                    <span className="sr-only">YouTube URL or video ID</span>
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="https://www.youtube.com/watch?v=aqz-KE-bpKQ"
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500"
                    />
                  </label>
                  <button
                    type="submit"
                    className="group inline-flex h-10 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-4 text-xs font-bold text-white shadow-[var(--anslation-ds-shadow-md)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-white/80 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none sm:min-w-[184px]"
                  >
                    Preview Thumbnails <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transform-none" />
                  </button>
                </form>
                {status && (
                  <p className="mt-3 inline-flex rounded-[var(--anslation-ds-radius)] bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 ring-1 ring-white/10">
                    {status}
                  </p>
                )}

                <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-white/10 px-3 py-1.5 text-xs text-white/85 ring-1 ring-white/10">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--secondary)]" />
                  <span className="font-semibold">{detectedVideoId && detectedVideoId !== activeVideoId ? "Detected ID:" : "Video ID:"}</span>
                  <span className="min-w-0 truncate rounded-[6px] bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white">
                    {detectedVideoId || activeVideoId || "Not detected"}
                  </span>
                  <button
                    type="button"
                    onClick={() => videoId && copyUrl("Video ID", videoId)}
                    disabled={!videoId}
                    className="rounded-[6px] p-1.5 text-white/85 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Copy video ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative hidden min-h-[218px] lg:block">
                <div className="absolute right-8 top-14 h-24 w-60 -skew-x-12 rounded-[var(--anslation-ds-radius-xl)] bg-[linear-gradient(135deg,var(--primary),var(--secondary))] opacity-75 shadow-[var(--anslation-ds-shadow-lg)]" />
                <div className="absolute right-16 top-24 h-14 w-48 -skew-x-12 rounded-[var(--anslation-ds-radius-lg)] border border-white/16 bg-white/12 shadow-[inset_0_1px_0_color-mix(in_srgb,white_18%,transparent)]" />
                <div className="absolute right-76 top-11 flex h-11 w-11 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-white/10 bg-white/10 text-[var(--primary)] shadow-[var(--anslation-ds-shadow-sm)] backdrop-blur-md">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="absolute right-16 top-8 flex h-[98px] w-[138px] rotate-3 items-center justify-center rounded-[var(--anslation-ds-radius-xl)] bg-[var(--anslation-ds-danger)] shadow-[var(--anslation-ds-shadow-lg)] ring-1 ring-white/20">
                  <Play className="ml-1.5 h-12 w-12 fill-white text-white" />
                </div>
                <div className="absolute right-20 top-[92px] flex h-[62px] w-[62px] items-center justify-center rounded-full border-[3px] border-white bg-[linear-gradient(135deg,var(--secondary),var(--primary))] text-white shadow-[var(--anslation-ds-shadow-lg)]">
                  <Download className="h-7 w-7" />
                </div>
                <div className="absolute right-0 top-24 flex h-10 w-10 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-white/10 bg-white/10 text-[var(--secondary)] backdrop-blur-md">
                  <ExternalLink className="h-4.5 w-4.5" />
                </div>
                <div className="absolute right-2 top-6 h-2.5 w-2.5 rounded-[3px] border-2 border-[var(--secondary)]" />
                <div className="absolute right-72 top-28 text-2xl font-bold text-[var(--secondary)]">+</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 bg-[color-mix(in_srgb,var(--card)_92%,var(--background))] p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
            {features.map(({ title, description, icon: Icon, tone }) => (
              <div key={title} className="group flex gap-4 rounded-[var(--anslation-ds-radius-lg)] border border-transparent p-3 transition hover:border-[var(--border)] hover:bg-[var(--card)] hover:shadow-[var(--anslation-ds-shadow-sm)]">
                <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius-xl)] border transition group-hover:-translate-y-0.5 ${toneClass[tone].border} ${toneClass[tone].soft}`}>
                  <Icon className={`h-8 w-8 ${toneClass[tone].text}`} />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-sm font-bold sm:text-base ${toneClass[tone].text}`}>{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="available-thumbnails" className="relative scroll-mt-24 overflow-hidden rounded-[var(--anslation-ds-radius-xl)] border border-[color-mix(in_srgb,var(--primary)_18%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_94%,var(--primary)),var(--card))] p-5 shadow-[var(--anslation-ds-shadow-lg)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-[var(--anslation-ds-radius-lg)] border border-[color-mix(in_srgb,var(--primary)_18%,var(--border))] bg-[var(--badge-bg)] text-[var(--primary)] shadow-[var(--anslation-ds-shadow-sm)]">
                <ImageIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[var(--foreground)]">Available Thumbnail Sizes</h2>
                  <span className="inline-flex rounded-[6px] bg-[var(--badge-bg)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
                    {sizeCount} sizes found
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Preview, copy, or download direct thumbnail files.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={copyAllLinks}
              disabled={!videoId}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-[var(--primary)] bg-[var(--card)] px-4 text-sm font-bold text-[var(--primary)] shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-0.5 hover:bg-[var(--badge-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none"
            >
              <Copy className="h-4 w-4" /> Copy All Links
            </button>
          </div>
          {copied && (
            <p className="relative mt-4 inline-flex rounded-[var(--anslation-ds-radius)] bg-[var(--anslation-ds-success-soft)] px-3 py-2 text-sm font-bold text-[var(--anslation-ds-success)]">
              {copied}
            </p>
          )}

          <div className="relative mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {sizes.map(({ label, file, badge, dimensions, tone, quality }) => {
              const url = videoId ? `https://i.ytimg.com/vi/${videoId}/${file}` : "";
              return (
                <article key={label} className="group overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--primary)_28%,var(--border))] hover:shadow-[var(--anslation-ds-shadow-md)] motion-reduce:transform-none">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--muted)]">
                    {url ? (
                      <img src={url} alt={`${label} thumbnail`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transform-none" />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--muted-foreground)]">
                        Enter a valid video URL
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
                    <span className={`absolute bottom-3 left-3 rounded-[6px] px-2.5 py-1 text-sm font-black text-white shadow-[var(--anslation-ds-shadow-md)] ${toneClass[tone].button}`}>
                      {badge}
                    </span>
                    <span className="absolute right-3 top-3 rounded-[6px] bg-black/45 px-2 py-1 text-[10px] font-bold uppercase text-white/90 backdrop-blur-md">
                      {quality}
                    </span>
                  </div>
                  <div className="space-y-4 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="min-w-0 flex-1 text-base font-bold text-[var(--foreground)]">{label}</h3>
                        <span className={`rounded-[6px] px-2 py-0.5 text-xs font-bold ${toneClass[tone].soft} ${toneClass[tone].text}`}>
                          {badge}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{dimensions}</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_86%,var(--card))] px-3 py-2 shadow-[inset_0_1px_0_color-mix(in_srgb,var(--card)_65%,transparent)]">
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-[var(--foreground)]">{url || "No link available"}</span>
                      <button
                        type="button"
                        onClick={() => copyUrl(label, url)}
                        disabled={!url}
                        className="shrink-0 rounded-[6px] p-1 text-[var(--primary)] transition hover:bg-[var(--badge-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Copy ${label} link`}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadThumbnail(label, url)}
                      disabled={!url}
                      className={`group/button inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] text-sm font-bold shadow-[var(--anslation-ds-shadow-md)] transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transform-none ${toneClass[tone].button}`}
                    >
                      <Download className="h-4 w-4 transition group-hover/button:translate-y-0.5 motion-reduce:transform-none" /> Download
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-[var(--anslation-ds-radius-lg)] border border-[color-mix(in_srgb,var(--anslation-ds-success)_25%,var(--border))] bg-[var(--anslation-ds-success-soft)] px-5 py-4 text-sm font-medium text-[var(--anslation-ds-success)]">
          <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>These are direct links from YouTube CDN. You can use them freely in your projects.</p>
        </div>
      </div>
    </main>
  );
}
