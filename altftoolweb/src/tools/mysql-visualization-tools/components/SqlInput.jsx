"use client";

import { Database, RefreshCcw } from "lucide-react";
import Panel from "./Panel";

export default function SqlInput({ sql, setSql, query, setQuery, status }) {
  return (
    <Panel title="SQL Schema Input" icon={Database}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 break-words text-xs text-(--muted-foreground) [overflow-wrap:anywhere]">
          CREATE TABLE statements are parsed instantly.
        </p>
        <div className="flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-200">
          <RefreshCcw size={14} />
          {status}
        </div>
      </div>

      <textarea
        value={sql}
        onChange={(event) => setSql(event.target.value)}
        spellCheck={false}
        placeholder="Paste your MySQL CREATE TABLE statements here."
        className="min-h-[190px] w-full min-w-0 resize-y rounded-lg border border-(--border) bg-(--card) p-3 font-mono text-sm leading-6 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30 [overflow-wrap:anywhere]"
      />

      <div className="mt-4">
        <label className="mb-2 block text-sm font-bold text-(--foreground)">
          Query Visualization
        </label>
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          spellCheck={false}
          placeholder="Paste a SELECT query to see referenced schema pieces."
          className="min-h-[80px] w-full min-w-0 resize-y rounded-lg border border-(--border) bg-(--card) p-3 font-mono text-sm leading-6 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30 [overflow-wrap:anywhere]"
        />
      </div>
    </Panel>
  );
}
