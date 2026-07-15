"use client";

import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatBytes, formatMs } from "../utils/trace";
import { CARD, FOCUS_RING } from "./ui.jsx";

const KIND_STYLES = {
  success: {
    backgroundColor: "var(--anslation-ds-success-soft)",
    color: "color-mix(in srgb, var(--anslation-ds-success) 72%, var(--foreground))",
  },
  warning: {
    backgroundColor: "var(--anslation-ds-warning-soft)",
    color: "color-mix(in srgb, var(--anslation-ds-warning) 72%, var(--foreground))",
  },
  danger: {
    backgroundColor: "var(--anslation-ds-danger-soft)",
    color: "color-mix(in srgb, var(--anslation-ds-danger) 75%, var(--foreground))",
  },
};

export default function RedirectDetails({ chain }) {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section aria-label="Redirect details" className={`${CARD} p-4 sm:p-5`}>
      <h2 className="mb-3 text-sm font-bold tracking-tight text-(--foreground)">
        Redirect Details
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-(--border) bg-(--muted)">
              {["#", "URL", "Status Code", "Type", "Response Time", "Size", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground) first:rounded-l-[8px] last:rounded-r-[8px]"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {chain.map((step) => {
              const open = openIndex === step.index;
              const headerEntries = Object.entries(step.headers || {});
              return (
                <Fragment key={step.index}>
                  <tr className="align-middle transition hover:bg-(--muted)">
                    <td className="px-3 py-3 text-xs font-bold tabular-nums text-(--muted-foreground)">
                      {step.index + 1}
                    </td>
                    <td className="max-w-[220px] px-3 py-3">
                      <a
                        href={step.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-mono text-xs font-semibold text-(--foreground) underline decoration-(--border) underline-offset-2 transition hover:text-(--primary-hover) dark:hover:text-(--primary)"
                        title={step.url}
                      >
                        {step.url}
                      </a>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="rounded-[6px] px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums"
                        style={KIND_STYLES[step.kind]}
                      >
                        {step.status ?? "ERR"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-medium text-(--muted-foreground)">
                      {step.statusText}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold tabular-nums text-(--foreground)">
                      {formatMs(step.responseTime)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold tabular-nums text-(--foreground)">
                      {formatBytes(step.sizeBytes)}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-label={`${open ? "Hide" : "Show"} headers for step ${step.index + 1}`}
                        onClick={() => setOpenIndex(open ? -1 : step.index)}
                        disabled={!headerEntries.length}
                        className={`flex h-7 w-7 items-center justify-center rounded-[6px] text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) disabled:opacity-40 ${FOCUS_RING}`}
                      >
                        <ChevronDown
                          size={15}
                          aria-hidden="true"
                          className={`transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={7} className="bg-(--muted) px-3 py-3">
                        <dl className="grid gap-x-6 gap-y-1.5 font-mono text-[11px] leading-5 sm:grid-cols-2">
                          {headerEntries.map(([key, value]) => (
                            <div key={key} className="flex min-w-0 gap-2">
                              <dt className="shrink-0 font-bold text-(--muted-foreground)">{key}:</dt>
                              <dd className="truncate text-(--foreground)" title={String(value)}>
                                {String(value)}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
