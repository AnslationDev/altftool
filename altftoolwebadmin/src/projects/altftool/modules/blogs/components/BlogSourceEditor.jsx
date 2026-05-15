"use client";

import { BookOpenCheck, FileText, Link2 } from "lucide-react";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function hostnameFromUrl(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function parseSourcesText(value = "") {
  if (Array.isArray(value)) {
    return value
      .map((source) => {
        if (typeof source === "string") return { title: cleanText(source), url: "", publisher: "" };
        return {
          title: cleanText(source?.title || source?.name || source?.label || source?.url),
          url: cleanText(source?.url || source?.href || ""),
          publisher: cleanText(source?.publisher || source?.site || source?.source || ""),
        };
      })
      .filter((source) => source.title || source.url);
  }

  return String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
      const urlMatch = line.match(/https?:\/\/[^\s|]+/i);
      const url = urlMatch?.[0] || "";
      const title = parts[0] && parts[0] !== url ? parts[0] : hostnameFromUrl(url) || line;
      const publisher = parts[2] || (parts[1] && parts[1] !== url ? parts[1] : hostnameFromUrl(url));

      return {
        title: cleanText(title),
        url: cleanText(url),
        publisher: cleanText(publisher),
      };
    })
    .filter((source) => source.title || source.url);
}

export function formatSourcesText(value = "") {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";

  return value
    .map((source) => {
      if (typeof source === "string") return source;
      return [source?.title || source?.name || source?.label, source?.url || source?.href, source?.publisher || source?.site]
        .filter(Boolean)
        .join(" | ");
    })
    .filter(Boolean)
    .join("\n");
}

export default function BlogSourceEditor({
  sourcesText = "",
  sourceNotes = "",
  onChange,
}) {
  const sources = parseSourcesText(sourcesText);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3">
        <div className="flex items-start gap-2">
          <BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-xs font-semibold text-blue-800">Citation format</p>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              Add one source per line: Title | URL | Publisher. Public posts show these as reader references and schema citations.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Link2 className="h-3.5 w-3.5 text-gray-400" />
          Sources
        </label>
        <textarea
          rows={5}
          value={sourcesText}
          onChange={(event) => onChange?.({ sourcesText: event.target.value })}
          placeholder={"Google Search Central | https://developers.google.com/search/docs | Google\nAltFTool editorial review | https://altftool.com/policypages/about | AltFTool"}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm transition placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        />
        <p className="text-[10px] text-gray-400">
          {sources.length} source{sources.length === 1 ? "" : "s"} parsed for the public reference block.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
          <FileText className="h-3.5 w-3.5 text-gray-400" />
          Source note
        </label>
        <textarea
          rows={3}
          value={sourceNotes}
          onChange={(event) => onChange?.({ sourceNotes: event.target.value })}
          placeholder="Explain what was checked, updated, or verified during editorial review."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm transition placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
        />
      </div>
    </div>
  );
}
