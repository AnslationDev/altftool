"use client";

import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Eye,
  Globe2,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const defaults = {
  title: "AltFTool - Your Daily Digital Tools",
  description: "Fast, clean, and practical web tools for everyday work.",
  url: "https://altftool.com/tools/all",
  image: "https://altftool.com/og-image.png",
  keywords: "tools, developer tools, productivity",
  siteName: "AltFTool",
  robots: "index, follow",
  author: "AltFTool",
  locale: "en_US",
  type: "website",
  themeColor: "#2563eb",
  favicon: "https://altftool.com/favicon.ico",
  twitterSite: "@altftool",
};

const robotOptions = ["index, follow", "noindex, follow", "index, nofollow", "noindex, nofollow"];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function domainFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "example.com";
  }
}

function statusForLength(value, min, max) {
  const length = value.trim().length;
  if (length >= min && length <= max) return "good";
  if (length > 0 && length < min) return "short";
  return "long";
}

function Field({ label, value, onChange, helper, textarea = false, type = "text" }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--foreground)]">
        {label}
        {helper ? <span className="text-xs font-medium text-[var(--muted-foreground)]">{helper}</span> : null}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 min-h-28 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-7 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
        />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[var(--foreground)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
      >
        {children}
      </select>
    </label>
  );
}

function QualityItem({ label, state, detail }) {
  const styles =
    state === "good"
      ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200"
      : state === "short"
        ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200";

  return (
    <div className={`rounded-lg border p-3 ${styles}`}>
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs leading-5 opacity-85">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ title, children, icon: Icon }) {
  return (
    <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)]">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      {children}
    </section>
  );
}

export default function ToolHome() {
  const [form, setForm] = useState(defaults);
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [copied, setCopied] = useState("");
  const tagsRef = useRef(null);

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const checks = useMemo(() => {
    const titleState = statusForLength(form.title, 45, 60);
    const descriptionState = statusForLength(form.description, 120, 160);
    const hasHttps = form.url.startsWith("https://");
    const hasImage = /^https?:\/\//.test(form.image);
    const hasKeywords = form.keywords.split(",").filter((item) => item.trim()).length >= 2;
    const score =
      [titleState === "good", descriptionState === "good", hasHttps, hasImage, hasKeywords, Boolean(form.siteName)].filter(Boolean).length *
      16 +
      4;

    return {
      score: Math.min(score, 100),
      titleState,
      descriptionState,
      hasHttps,
      hasImage,
      hasKeywords,
    };
  }, [form]);

  const tags = useMemo(() => {
    const title = escapeHtml(form.title);
    const description = escapeHtml(form.description);
    const url = escapeHtml(form.url);
    const image = escapeHtml(form.image);
    const siteName = escapeHtml(form.siteName);
    const author = escapeHtml(form.author);
    const locale = escapeHtml(form.locale);
    const themeColor = escapeHtml(form.themeColor);
    const favicon = escapeHtml(form.favicon);
    const twitterSite = escapeHtml(form.twitterSite);

    return [
      `<meta charset="utf-8" />`,
      `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
      `<title>${title}</title>`,
      `<meta name="description" content="${description}" />`,
      form.keywords ? `<meta name="keywords" content="${escapeHtml(form.keywords)}" />` : "",
      author ? `<meta name="author" content="${author}" />` : "",
      `<meta name="robots" content="${escapeHtml(form.robots)}" />`,
      themeColor ? `<meta name="theme-color" content="${themeColor}" />` : "",
      favicon ? `<link rel="icon" href="${favicon}" />` : "",
      `<link rel="canonical" href="${url}" />`,
      `<meta property="og:type" content="${escapeHtml(form.type)}" />`,
      `<meta property="og:title" content="${title}" />`,
      `<meta property="og:description" content="${description}" />`,
      `<meta property="og:url" content="${url}" />`,
      image ? `<meta property="og:image" content="${image}" />` : "",
      siteName ? `<meta property="og:site_name" content="${siteName}" />` : "",
      locale ? `<meta property="og:locale" content="${locale}" />` : "",
      `<meta name="twitter:card" content="${twitterCard}" />`,
      twitterSite ? `<meta name="twitter:site" content="${twitterSite}" />` : "",
      `<meta name="twitter:title" content="${title}" />`,
      `<meta name="twitter:description" content="${description}" />`,
      image ? `<meta name="twitter:image" content="${image}" />` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [form, twitterCard]);

  const copyTags = async () => {
    const didCopy = await safeCopyText(tags);
    if (!didCopy && tagsRef.current) {
      tagsRef.current.focus();
      tagsRef.current.select();
      setCopied("selected");
    } else {
      setCopied(didCopy ? "tags" : "failed");
    }
    setTimeout(() => setCopied(""), 1400);
  };

  const downloadTags = () => {
    const blob = new Blob([tags], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meta-tags.html";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 2xl:py-8">
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="grid gap-6 p-6 2xl:grid-cols-[minmax(0,1fr)_320px] 2xl:p-8">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <Code2 className="h-4 w-4" />
                SEO utility
              </div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Meta Tag Generator</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Generate production-ready SEO, Open Graph, Twitter, robots, canonical, author, and theme meta tags with live previews.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                <span className="rounded-full bg-[var(--muted)] px-3 py-1">{form.title.length} title chars</span>
                <span className="rounded-full bg-[var(--muted)] px-3 py-1">{form.description.length} description chars</span>
                <span className="rounded-full bg-[var(--muted)] px-3 py-1">{tags.split("\n").length} tags</span>
              </div>
            </div>
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5">
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">SEO readiness</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-semibold text-[var(--primary)]">{checks.score}</span>
                <span className="pb-2 text-sm font-semibold text-[var(--muted-foreground)]">/ 100</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${checks.score}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(360px,480px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Content</h2>
                <button
                  type="button"
                  onClick={() => setForm(defaults)}
                  className="btn-secondary min-h-10 px-3 py-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
              <div className="grid gap-4">
                <Field
                  label="Page title"
                  value={form.title}
                  helper={`${form.title.length}/60`}
                  onChange={(value) => setValue("title", value)}
                />
                <Field
                  label="Description"
                  value={form.description}
                  helper={`${form.description.length}/160`}
                  onChange={(value) => setValue("description", value)}
                  textarea
                />
                <Field label="Keywords" value={form.keywords} onChange={(value) => setValue("keywords", value)} />
                <Field label="Author" value={form.author} onChange={(value) => setValue("author", value)} />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-lg font-semibold">Indexing & Identity</h2>
              <div className="grid gap-4">
                <Field label="Canonical URL" value={form.url} onChange={(value) => setValue("url", value)} />
                <Field label="Site name" value={form.siteName} onChange={(value) => setValue("siteName", value)} />
                <Field label="Favicon URL" value={form.favicon} onChange={(value) => setValue("favicon", value)} />
                <Field label="Theme color" value={form.themeColor} type="color" onChange={(value) => setValue("themeColor", value)} />
                <SelectField label="Robots" value={form.robots} onChange={(value) => setValue("robots", value)}>
                  {robotOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-4 text-lg font-semibold">Social Metadata</h2>
              <div className="grid gap-4">
                <Field label="Social image URL" value={form.image} onChange={(value) => setValue("image", value)} />
                <Field label="Twitter site" value={form.twitterSite} onChange={(value) => setValue("twitterSite", value)} />
                <SelectField label="Open Graph type" value={form.type} onChange={(value) => setValue("type", value)}>
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                  <option value="profile">Profile</option>
                </SelectField>
                <SelectField label="Twitter card" value={twitterCard} onChange={setTwitterCard}>
                  <option value="summary_large_image">Summary large image</option>
                  <option value="summary">Summary</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </SelectField>
                <Field label="Locale" value={form.locale} onChange={(value) => setValue("locale", value)} />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Generated tags</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Copy-ready HTML for your document head.</p>
                </div>
                <div className="tool-action-grid w-full sm:w-auto sm:min-w-[14rem]">
                  <button
                    type="button"
                    onClick={downloadTags}
                    className="btn-secondary min-h-10 px-3 py-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button type="button" onClick={copyTags} className="btn-primary min-h-10 px-3 py-2">
                    <Copy className="h-4 w-4" />
                    {copied === "tags" ? "Copied" : copied === "selected" ? "Selected" : copied === "failed" ? "Copy failed" : "Copy"}
                  </button>
                </div>
              </div>
              <textarea
                ref={tagsRef}
                value={tags}
                readOnly
                aria-label="Generated meta tags"
                className="mt-4 h-[460px] w-full max-w-full resize-none overflow-auto whitespace-pre rounded-lg bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-[var(--primary)] sm:text-sm"
              />
            </div>

            <div className="tool-card-grid">
              <QualityItem
                label="Title length"
                state={checks.titleState}
                detail="Best search titles are usually around 45-60 characters."
              />
              <QualityItem
                label="Description length"
                state={checks.descriptionState}
                detail="Strong meta descriptions are usually around 120-160 characters."
              />
              <QualityItem label="Canonical URL" state={checks.hasHttps ? "good" : "long"} detail="Use a secure HTTPS canonical URL when possible." />
              <QualityItem label="Social image" state={checks.hasImage ? "good" : "long"} detail="Add an absolute image URL for rich social previews." />
            </div>

            <PreviewCard title="Google preview" icon={Search}>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm text-green-700 dark:text-green-400">{domainFromUrl(form.url)}</p>
                <h3 className="mt-1 line-clamp-2 text-xl font-medium text-blue-700 dark:text-blue-400">{form.title || "Page title"}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">{form.description || "Meta description preview."}</p>
              </div>
            </PreviewCard>

            <PreviewCard title="Social preview" icon={Share2}>
              <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
                <div className="aspect-[1.91/1] bg-[var(--muted)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {form.image ? <img src={form.image} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="p-4">
                  <p className="truncate text-xs uppercase text-[var(--muted-foreground)]">{domainFromUrl(form.url)}</p>
                  <h3 className="mt-2 line-clamp-2 text-xl font-semibold">{form.title || "Page title"}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">{form.description || "Description preview."}</p>
                </div>
              </div>
            </PreviewCard>

            <PreviewCard title="Metadata summary" icon={Globe2}>
              <div className="tool-compact-grid">
                <div className="rounded-lg bg-[var(--muted)] p-4">
                  <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-2 text-sm font-semibold">Robots</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{form.robots}</p>
                </div>
                <div className="rounded-lg bg-[var(--muted)] p-4">
                  <Eye className="h-5 w-5 text-[var(--primary)]" />
                  <p className="mt-2 text-sm font-semibold">Twitter card</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{twitterCard}</p>
                </div>
              </div>
            </PreviewCard>
          </div>
        </section>
      </div>
    </main>
  );
}
