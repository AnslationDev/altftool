"use client";

import { useState } from "react";
import { Check, Copy, ScanBarcode, Trash2 } from "lucide-react";

export default function RecentScans({ history, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyValue = async (entry) => {
    try {
      await navigator.clipboard.writeText(entry.value);
      setCopiedId(entry.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <section aria-label="Recent scans" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-bold text-foreground">Recent Scans</h2>

      {history.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-6 py-8 text-center">
          <ScanBarcode aria-hidden="true" size={22} className="mb-2 text-muted-foreground" />
          <p className="text-xs leading-5 text-muted-foreground">
            Your scans appear here — history stays on this device only.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-2 py-2">Preview</th>
                <th scope="col" className="px-2 py-2">Type</th>
                <th scope="col" className="px-2 py-2">Decoded Value</th>
                <th scope="col" className="px-2 py-2">Date &amp; Time</th>
                <th scope="col" className="px-2 py-2">Source</th>
                <th scope="col" className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-b-0 hover:bg-muted/40">
                  <td className="px-2 py-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.thumb}
                      alt={`${entry.format} scan preview`}
                      className="h-9 w-12 rounded border border-border bg-background object-contain"
                    />
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-xs font-semibold text-foreground">
                    {entry.format}
                  </td>
                  <td className="max-w-64 truncate px-2 py-2.5 font-mono text-xs text-foreground" title={entry.value}>
                    {entry.value}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-xs text-muted-foreground">
                    {new Date(entry.scannedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-xs text-muted-foreground">
                    {entry.source}
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => copyValue(entry)}
                        aria-label={`Copy value ${entry.value}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {copiedId === entry.id ? (
                          <Check aria-hidden="true" size={14} className="text-success" />
                        ) : (
                          <Copy aria-hidden="true" size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        aria-label={`Delete scan of ${entry.value}`}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <Trash2 aria-hidden="true" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
