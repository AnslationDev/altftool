"use client";

import { CheckCircle2, Code2, Play, Wand2, XCircle } from "lucide-react";
import Panel from "./Panel";

export default function SqlPracticeWorkspace({
  query,
  setQuery,
  onFormat,
  result,
  challenge,
  challengeStatus,
  page,
  setPage,
}) {
  const pageSize = 8;
  const visibleRows = result.rows.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(Math.ceil(result.rows.length / pageSize), 1);

  return (
    <Panel title="SQL Practice Workspace" icon={Code2}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-(--muted-foreground)">SELECT, WHERE, JOIN, ORDER BY, LIMIT, GROUP BY, and aggregations run locally.</div>
            <button type="button" onClick={onFormat} className="inline-flex items-center gap-2 rounded-lg border border-(--border) px-3 py-2 text-xs font-bold">
              <Wand2 className="h-3.5 w-3.5" /> Format
            </button>
          </div>
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-lg border border-(--border) bg-[#020617] p-4 font-mono text-sm leading-6 text-cyan-50 outline-none focus:border-cyan-400"
            placeholder="SELECT * FROM users WHERE id > 5 ORDER BY id LIMIT 10;"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold ${result.error ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"}`}>
              {result.error ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {result.error || result.meta}
            </span>
            {challenge && (
              <span className={`rounded-full px-3 py-1 font-bold ${challengeStatus === "pass" ? "bg-emerald-500/10 text-emerald-600" : challengeStatus === "fail" ? "bg-amber-500/10 text-amber-700" : "bg-cyan-500/10 text-cyan-700"}`}>
                {challengeStatus === "pass" ? "Challenge passed" : challengeStatus === "fail" ? "Result does not match yet" : challenge.prompt}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-lg border border-(--border)">
          <div className="flex items-center justify-between border-b border-(--border) bg-(--muted) px-3 py-2">
            <div className="inline-flex items-center gap-2 text-sm font-black"><Play className="h-4 w-4 text-cyan-500" /> Live Results</div>
            <div className="text-xs text-(--muted-foreground)">Page {page + 1} of {pageCount}</div>
          </div>
          <div className="max-h-[310px] overflow-auto">
            {result.columns.length ? (
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead className="sticky top-0 bg-(--background)">
                  <tr>{result.columns.map((column) => <th key={column} className="border-b border-(--border) px-3 py-2 font-black">{column}</th>)}</tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr key={index} className="odd:bg-(--muted)/35">
                      {result.columns.map((column) => <td key={column} className="border-b border-(--border) px-3 py-2">{String(row[column] ?? "")}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-5 text-sm text-(--muted-foreground)">Query results appear here instantly.</div>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-(--border) p-2">
            <button type="button" disabled={page === 0} onClick={() => setPage(Math.max(page - 1, 0))} className="rounded-md border border-(--border) px-3 py-1 text-xs font-bold disabled:opacity-40">Prev</button>
            <button type="button" disabled={page >= pageCount - 1} onClick={() => setPage(Math.min(page + 1, pageCount - 1))} className="rounded-md border border-(--border) px-3 py-1 text-xs font-bold disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
