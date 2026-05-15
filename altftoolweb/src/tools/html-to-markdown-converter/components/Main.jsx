"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import {
  CheckCircle,
  Clipboard,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode,
  FileText,
  Loader2,
  RefreshCw,
  Settings2,
  Sparkles,
  Trash2,
  UploadCloud,
  Wand2,
  XCircle,
} from "lucide-react";

const SAMPLE_HTML = `<!doctype html>
<html>
  <head>
    <title>Product Launch Notes</title>
    <style>.hidden { display: none; }</style>
  </head>
  <body>
    <article class="post">
      <h1>Product Launch Notes</h1>
      <p>We shipped <strong>AltF Tool Studio</strong> with a cleaner workflow for creators and developers.</p>

      <h2>Highlights</h2>
      <ul>
        <li>Faster browser-side tools</li>
        <li>Better export controls</li>
        <li><a href="https://example.com/docs">Documentation updates</a></li>
      </ul>

      <blockquote>
        <p>Good tools should feel simple without being shallow.</p>
      </blockquote>

      <h2>Release Table</h2>
      <table>
        <thead>
          <tr><th>Feature</th><th>Status</th><th>Owner</th></tr>
        </thead>
        <tbody>
          <tr><td>HTML Import</td><td>Done</td><td>Content</td></tr>
          <tr><td>Markdown Export</td><td>Done</td><td>Docs</td></tr>
        </tbody>
      </table>

      <pre><code class="language-js">const launch = "ready";
console.log(launch);</code></pre>

      <p><img src="https://example.com/cover.png" alt="Launch cover"></p>
    </article>
  </body>
</html>`;

const defaultOptions = {
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  fence: "```",
  emDelimiter: "*",
  strongDelimiter: "**",
  linkStyle: "inlined",
  linkReferenceStyle: "full",
  keepLinks: true,
  keepImages: true,
  stripScripts: true,
  stripStyles: true,
  stripComments: true,
  stripClassAndStyle: true,
  preserveLineBreaks: true,
  gfmTables: true,
  frontMatter: false,
};

function downloadText(content, filename, type = "text/markdown") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function stripIndentNoise(markdown) {
  return markdown
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/^\s+|\s+$/g, "");
}

function removeComments(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((node) => node.remove());
}

function getDocumentFragment(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || "", "text/html");
  return doc.body || doc.documentElement;
}

function cleanHtml(html, options) {
  if (!html.trim()) return "";

  const root = getDocumentFragment(html).cloneNode(true);

  if (options.stripScripts) {
    root.querySelectorAll("script, noscript, iframe, object, embed").forEach((node) => node.remove());
  }

  if (options.stripStyles) {
    root.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove());
  }

  if (options.stripComments) {
    removeComments(root);
  }

  root.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on")) node.removeAttribute(attribute.name);
      if (options.stripClassAndStyle && ["class", "style", "id"].includes(name)) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return root.innerHTML.trim();
}

function createTurndown(options) {
  const service = new TurndownService({
    headingStyle: options.headingStyle,
    bulletListMarker: options.bulletListMarker,
    codeBlockStyle: options.codeBlockStyle,
    fence: options.fence,
    emDelimiter: options.emDelimiter,
    strongDelimiter: options.strongDelimiter,
    linkStyle: options.linkStyle,
    linkReferenceStyle: options.linkReferenceStyle,
    br: options.preserveLineBreaks ? "  \n" : "\n",
  });

  if (options.gfmTables) {
    service.use(gfm);
  }

  service.addRule("stripImages", {
    filter: (node) => node.nodeName === "IMG" && !options.keepImages,
    replacement: () => "",
  });

  service.addRule("stripLinks", {
    filter: (node) => node.nodeName === "A" && !options.keepLinks,
    replacement: (content) => content,
  });

  service.addRule("languageCodeBlocks", {
    filter: (node) => {
      return (
        node.nodeName === "PRE" &&
        node.firstChild &&
        node.firstChild.nodeName === "CODE"
      );
    },
    replacement: (content, node) => {
      const codeNode = node.firstChild;
      const className = codeNode.getAttribute("class") || "";
      const language = className.match(/language-([a-z0-9_-]+)/i)?.[1] || "";
      const code = codeNode.textContent.replace(/\n$/, "");
      return `\n\n${options.fence}${language}\n${code}\n${options.fence}\n\n`;
    },
  });

  return service;
}

function buildFrontMatter(html, markdown) {
  const root = getDocumentFragment(html);
  const title =
    root.querySelector("title")?.textContent?.trim() ||
    root.querySelector("h1")?.textContent?.trim() ||
    "Converted HTML";
  const description = root.querySelector("meta[name='description']")?.getAttribute("content") || "";
  const date = new Date().toISOString().slice(0, 10);
  const safeTitle = title.replaceAll('"', '\\"');
  const safeDescription = description.replaceAll('"', '\\"');

  return `---\ntitle: "${safeTitle}"\ndescription: "${safeDescription}"\ndate: "${date}"\n---\n\n${markdown}`;
}

function calculateStats(html, markdown) {
  const root = getDocumentFragment(html);
  const text = root.textContent || "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    htmlChars: html.length,
    markdownChars: markdown.length,
    words,
    tags: root.querySelectorAll("*").length,
    links: root.querySelectorAll("a[href]").length,
    images: root.querySelectorAll("img").length,
    tables: root.querySelectorAll("table").length,
    codeBlocks: root.querySelectorAll("pre, code").length,
  };
}

const markdownPreviewComponents = {
  h1: ({ children }) => (
    <h1 className="mb-4 border-b border-(--border) pb-3 text-3xl font-bold leading-tight text-(--foreground)">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-7 text-2xl font-semibold leading-tight text-(--foreground)">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-xl font-semibold leading-tight text-(--foreground)">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-3 leading-7 text-(--foreground)">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-(--primary) underline decoration-(--primary)/40 underline-offset-4 hover:decoration-(--primary)"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-6 text-(--foreground)">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6 text-(--foreground)">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-lg border-l-4 border-(--primary) bg-(--section-highlight) px-4 py-3 italic text-(--foreground)">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-5 overflow-x-auto rounded-lg border border-(--border)">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-(--card) text-xs uppercase text-(--muted-foreground)">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-(--border) px-4 py-3 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-(--border) px-4 py-3 text-(--foreground)">
      {children}
    </td>
  ),
  pre: ({ children }) => (
    <pre className="my-5 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
      {children}
    </pre>
  ),
  code: ({ className = "", children }) => {
    const value = String(children);
    const isBlock = className || value.includes("\n");

    if (isBlock) {
      return (
        <code className={`${className} font-mono text-sm text-slate-100`}>
          {children}
        </code>
      );
    }

    return (
      <code className="rounded-md border border-(--border) bg-(--card) px-1.5 py-0.5 font-mono text-sm text-(--foreground)">
        {children}
      </code>
    );
  },
  img: ({ alt, src }) => (
    <span className="my-5 block overflow-hidden rounded-lg border border-(--border) bg-(--card)">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || "Markdown image"}
        className="max-h-[420px] w-full object-contain"
        onError={(event) => {
          event.currentTarget.style.display = "none";
          event.currentTarget.nextElementSibling?.classList.remove("hidden");
        }}
      />
      <span className="hidden px-4 py-3 text-sm text-(--muted-foreground)">
        Image preview unavailable{src ? `: ${src}` : ""}
      </span>
      {alt && (
        <span className="block border-t border-(--border) px-4 py-2 text-xs text-(--muted-foreground)">
          {alt}
        </span>
      )}
    </span>
  ),
};

export default function MainComponent() {
  const [htmlInput, setHtmlInput] = useState(SAMPLE_HTML);
  const [markdown, setMarkdown] = useState("");
  const [cleanedHtml, setCleanedHtml] = useState("");
  const [options, setOptions] = useState(defaultOptions);
  const [activeView, setActiveView] = useState("markdown");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [fileName, setFileName] = useState("converted");

  const fileInputRef = useRef(null);

  const stats = useMemo(
    () => calculateStats(cleanedHtml || htmlInput, markdown),
    [cleanedHtml, htmlInput, markdown],
  );
  const previewMarkdown = useMemo(
    () => markdown.replace(/^---\s*\n[\s\S]*?\n---\s*/, "").trim(),
    [markdown],
  );

  const updateOption = (key, value) => {
    setOptions((previous) => ({ ...previous, [key]: value }));
  };

  const convertHtml = useCallback((source, nextOptions) => {
    setIsConverting(true);
    setError("");

    try {
      const cleaned = cleanHtml(source, nextOptions);
      const service = createTurndown(nextOptions);
      let output = stripIndentNoise(service.turndown(cleaned));

      if (nextOptions.frontMatter) {
        output = buildFrontMatter(source, output);
      }

      setCleanedHtml(cleaned);
      setMarkdown(output);
      setStatus("HTML converted to Markdown.");
    } catch (err) {
      console.error("HTML to Markdown conversion failed:", err);
      setError("Could not convert this HTML. Check for malformed markup and try again.");
    } finally {
      setIsConverting(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => convertHtml(htmlInput, options), 250);
    return () => window.clearTimeout(timer);
  }, [convertHtml, htmlInput, options]);

  const copyValue = async (value, label) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1400);
  };

  const handleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    setHtmlInput(text);
    setFileName(file.name.replace(/\.[^/.]+$/, "") || "converted");
    setStatus(`Loaded ${file.name}.`);
  };

  const resetTool = () => {
    setHtmlInput("");
    setMarkdown("");
    setCleanedHtml("");
    setError("");
    setStatus("");
    setFileName("converted");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="heading">HTML to Markdown Converter</h1>
        <p className="description mt-3">
          Convert full HTML documents or fragments into clean Markdown with GFM
          tables, links, images, code blocks, preview, copy, and download controls.
        </p>
      </div>

      <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row 2xl:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <FileCode className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-(--foreground)">Input HTML</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                Paste HTML, upload an .html file, or load the sample.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm,.txt,text/html,text/plain"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              Upload HTML
            </button>
            <button
              type="button"
              onClick={() => {
                setHtmlInput(SAMPLE_HTML);
                setFileName("product-launch-notes");
              }}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Load Sample
            </button>
            <button
              type="button"
              onClick={resetTool}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={htmlInput}
          onChange={(event) => setHtmlInput(event.target.value)}
          spellCheck={false}
          placeholder="<article><h1>Hello</h1><p>Paste HTML here...</p></article>"
          className="mt-5 min-h-80 w-full resize-y rounded-lg border border-(--border) bg-(--background) px-4 py-3 font-mono text-sm leading-6 text-(--foreground) outline-none transition focus:border-(--primary)"
        />
      </section>

      {(error || status) && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            error
              ? "border-red-500/40 bg-red-500/10 text-red-600"
              : "border-green-500/40 bg-green-500/10 text-green-700"
          }`}
        >
          {error ? (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{error || status}</p>
        </div>
      )}

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="bg-(--card) border border-(--border) rounded-lg p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Output</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Switch between Markdown source, rendered preview, and cleaned HTML.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["markdown", FileText, "Markdown"],
                  ["preview", Eye, "Preview"],
                  ["html", Code2, "Clean HTML"],
                ].map(([key, Icon, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveView(key)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      activeView === key
                        ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                        : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 min-h-96 overflow-auto rounded-lg border border-(--border) bg-(--background)">
              {isConverting ? (
                <div className="flex h-96 items-center justify-center text-(--muted-foreground)">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Converting...
                </div>
              ) : activeView === "preview" ? (
                <div className="min-h-96 p-5">
                  {previewMarkdown ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownPreviewComponents}
                    >
                      {previewMarkdown}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-(--border) text-sm text-(--muted-foreground)">
                      Markdown preview will appear here.
                    </div>
                  )}
                </div>
              ) : (
                <pre className="min-h-96 whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-(--foreground)">
                  {activeView === "html"
                    ? cleanedHtml || "Cleaned HTML will appear here."
                    : markdown || "Markdown output will appear here."}
                </pre>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => convertHtml(htmlInput, options)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Convert Now
              </button>
              <button
                type="button"
                onClick={() => copyValue(markdown, "markdown")}
                disabled={!markdown}
                className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Copy className="h-4 w-4" />
                {copied === "markdown" ? "Copied" : "Copy Markdown"}
              </button>
              <button
                type="button"
                onClick={() => copyValue(cleanedHtml, "html")}
                disabled={!cleanedHtml}
                className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Clipboard className="h-4 w-4" />
                {copied === "html" ? "Copied" : "Copy Clean HTML"}
              </button>
              <button
                type="button"
                onClick={() => downloadText(markdown, `${fileName || "converted"}.md`)}
                disabled={!markdown}
                className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Download .md
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-(--card) border border-(--border) rounded-lg p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">
                  Conversion Settings
                </h2>
                <p className="text-sm text-(--muted-foreground)">
                  Control Markdown style and cleanup behavior.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-(--foreground)">
                  Heading style
                </span>
                <select
                  value={options.headingStyle}
                  onChange={(event) => updateOption("headingStyle", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  <option value="atx">ATX: # Heading</option>
                  <option value="setext">Setext: Heading underline</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-(--foreground)">
                  Link style
                </span>
                <select
                  value={options.linkStyle}
                  onChange={(event) => updateOption("linkStyle", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  <option value="inlined">Inline links</option>
                  <option value="referenced">Reference links</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-(--foreground)">
                  Bullet marker
                </span>
                <select
                  value={options.bulletListMarker}
                  onChange={(event) => updateOption("bulletListMarker", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  <option value="-">Dash: -</option>
                  <option value="*">Asterisk: *</option>
                  <option value="+">Plus: +</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-(--foreground)">
                  Code fence
                </span>
                <select
                  value={options.fence}
                  onChange={(event) => updateOption("fence", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  <option value="```">Backticks: ```</option>
                  <option value="~~~">Tildes: ~~~</option>
                </select>
              </label>

              <div className="space-y-2">
                {[
                  ["gfmTables", "GitHub tables"],
                  ["keepLinks", "Keep links"],
                  ["keepImages", "Keep images"],
                  ["preserveLineBreaks", "Preserve line breaks"],
                  ["frontMatter", "Add front matter"],
                  ["stripScripts", "Remove scripts"],
                  ["stripStyles", "Remove styles"],
                  ["stripClassAndStyle", "Remove class/style/id attrs"],
                  ["stripComments", "Remove comments"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateOption(key, !options[key])}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                      options[key]
                        ? "border-(--primary) bg-(--section-highlight)"
                        : "border-(--border) bg-(--background)"
                    }`}
                  >
                    <span className="font-medium text-(--foreground)">{label}</span>
                    <span className="text-xs text-(--muted-foreground)">
                      {options[key] ? "On" : "Off"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-(--card) border border-(--border) rounded-lg p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-(--foreground)">Stats</h2>
                <p className="text-sm text-(--muted-foreground)">
                  Input and output structure.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[
                ["HTML chars", stats.htmlChars],
                ["Markdown chars", stats.markdownChars],
                ["Words", stats.words],
                ["HTML tags", stats.tags],
                ["Links", stats.links],
                ["Images", stats.images],
                ["Tables", stats.tables],
                ["Code nodes", stats.codeBlocks],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg bg-(--background) px-3 py-2"
                >
                  <span className="text-(--muted-foreground)">{label}</span>
                  <span className="font-semibold text-(--foreground)">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
