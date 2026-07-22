"use client";

import { useState } from "react";
import { Copy, Sparkles } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function normalize(r) {
  return typeof r === "string"
    ? { result: r, caption: "", list: [] }
    : { result: r.result ?? "", caption: r.caption ?? "", list: r.list ?? [] };
}

/**
 * Shared primitive for "press a button, get a result" generators.
 *
 * props:
 *  - title, description, buttonLabel?
 *  - generate() -> string | { result: string, caption?: string, list?: string[] }
 */
export default function GeneratorTool({ title, description, buttonLabel = "Generate", generate }) {
  const [out, setOut] = useState(() => normalize(generate()));
  const [copied, setCopied] = useState(false);

  const run = () => setOut(normalize(generate()));

  const copy = async () => {
    const text = out.list.length ? out.list.join("\n") : out.result;
    if (!(await safeCopyText(text))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Sparkles className="h-4 w-4" />
            Generator
          </div>
          <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
          ) : null}
        </section>

        <section className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-[var(--anslation-ds-shadow-sm)]">
          {out.list.length ? (
            <ul className="mb-5 grid gap-2 text-left">
              {out.list.map((item, i) => (
                <li
                  key={`${item}-${i}`}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-2 min-h-16 break-words text-2xl font-semibold text-[var(--primary)]">
              {out.result || "—"}
            </p>
          )}
          {out.caption ? (
            <p className="mb-5 text-sm text-[var(--muted-foreground)]">{out.caption}</p>
          ) : null}

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={run}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-6 font-semibold text-[var(--primary-foreground)] transition hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              {buttonLabel}
            </button>
            <button type="button" onClick={copy} className="btn-secondary min-h-11 px-4">
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
