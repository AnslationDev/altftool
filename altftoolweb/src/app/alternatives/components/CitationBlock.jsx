"use client";

// Research-provenance block for the two hubs other sites actually cite.
//
// This is not a call to action and must not become one. It answers the three
// questions a writer has when they want to reference a figure from these
// pages — which URL is canonical, when was the data read, and how should the
// page be credited — and then stops. No "share this", no social buttons, no
// badge to embed.
//
// Everything factual is passed in from the page and derived there from the
// corpus at render time: counts, dates and coverage are never written into
// this file, so they cannot go stale.
//
// It lives under /alternatives rather than /deals because the coupling between
// the two families already runs one way (deals/data/paidProducts.js imports
// alternatives/data/incumbents.js) and a UI import in the other direction
// would make it circular.
//
// The only reason this is a client component is the copy button: an
// attribution line you have to select by hand is one a writer will retype
// wrongly. Everything else here renders as static markup.

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Quote } from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35";

/**
 * @param {object} props
 * @param {string} [props.id]            Anchor for the block itself.
 * @param {string} [props.heading]
 * @param {string} props.url             Absolute canonical URL of the page.
 * @param {string} props.attribution     The one-line credit, ready to copy.
 * @param {string} [props.checkedFrom]   ISO date, oldest source check.
 * @param {string} [props.checkedTo]     ISO date, newest source check.
 * @param {React.ReactNode} props.coverage What the page actually contains.
 * @param {{label: string, fragment: string}[]} [props.anchors] Deep links into
 *   the page, so a citing article can point at one section rather than the top.
 * @param {React.ReactNode} [props.note] Provenance caveat, shown last.
 */
export default function CitationBlock({
  id = "cite-this",
  heading = "Cite this page",
  url,
  attribution,
  checkedFrom,
  checkedTo,
  coverage,
  anchors = [],
  note,
}) {
  const [status, setStatus] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = useCallback(async () => {
    const ok = await safeCopyText(attribution);
    setStatus(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    if (ok) {
      timer.current = setTimeout(() => setStatus("idle"), 2400);
    }
  }, [attribution]);

  const copied = status === "copied";
  const singleDate = !checkedFrom || checkedFrom === checkedTo;

  return (
    <aside
      id={id}
      aria-labelledby={`${id}-heading`}
      className="mt-12 scroll-mt-24 rounded-[12px] border border-(--border) bg-(--surface) p-4 sm:p-5"
    >
      <h2
        id={`${id}-heading`}
        className="flex items-center gap-2 text-base font-semibold tracking-tight text-(--foreground)"
      >
        <Quote className="h-4 w-4 flex-none text-(--primary)" aria-hidden="true" />
        {heading}
      </h2>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm leading-6 sm:grid-cols-[max-content_1fr]">
        <dt className="font-semibold text-(--foreground)">Canonical URL</dt>
        <dd className="text-(--muted-foreground)">
          <a
            href={url}
            className={`break-all underline underline-offset-2 hover:text-(--primary-text) ${focusRing}`}
          >
            {url}
          </a>
        </dd>

        {checkedTo ? (
          <>
            <dt className="font-semibold text-(--foreground)">Sources checked</dt>
            <dd className="text-(--muted-foreground)">
              {singleDate ? (
                <time dateTime={checkedTo}>{checkedTo}</time>
              ) : (
                <>
                  <time dateTime={checkedFrom}>{checkedFrom}</time>
                  {" to "}
                  <time dateTime={checkedTo}>{checkedTo}</time>
                </>
              )}
            </dd>
          </>
        ) : null}

        {coverage ? (
          <>
            <dt className="font-semibold text-(--foreground)">Covers</dt>
            <dd className="text-(--muted-foreground)">{coverage}</dd>
          </>
        ) : null}

        {anchors.length ? (
          <>
            <dt className="font-semibold text-(--foreground)">Link to a section</dt>
            <dd className="text-(--muted-foreground)">
              {anchors.map((anchor, index) => (
                <span key={anchor.fragment}>
                  {index > 0 ? ", " : ""}
                  <a
                    href={`#${anchor.fragment}`}
                    className={`underline underline-offset-2 hover:text-(--primary-text) ${focusRing}`}
                  >
                    {anchor.label}
                  </a>
                  <span className="text-(--muted-foreground)">{` (#${anchor.fragment})`}</span>
                </span>
              ))}
            </dd>
          </>
        ) : null}
      </dl>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
        Attribution line
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <code className="min-w-0 flex-1 break-words rounded-[8px] border border-(--border) bg-(--muted) px-3 py-2 text-xs leading-6 text-(--foreground)">
          {attribution}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex min-h-[40px] flex-none items-center justify-center gap-2 rounded-[8px] border border-(--border) bg-(--surface) px-4 text-sm font-semibold text-(--primary-text) transition hover:border-(--primary) motion-reduce:transition-none ${focusRing}`}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        {copied ? "Attribution line copied to the clipboard." : ""}
        {status === "failed"
          ? "Copying failed. Select the attribution line and copy it manually."
          : ""}
      </p>
      {status === "failed" ? (
        <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">
          This browser blocked the copy — select the line above and copy it manually.
        </p>
      ) : null}

      {note ? (
        <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">{note}</p>
      ) : null}
    </aside>
  );
}
