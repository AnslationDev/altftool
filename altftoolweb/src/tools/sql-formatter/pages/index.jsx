"use client";

import { useMemo, useState } from "react";
import { Clipboard, FileCode2, RotateCcw, Wand2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const sampleSql =
  "select users.id, users.name, count(orders.id) as total_orders from users left join orders on users.id = orders.user_id where users.status = 'active' and orders.created_at >= '2026-01-01' group by users.id, users.name order by total_orders desc limit 25;";

const keywords = [
  "SELECT",
  "FROM",
  "WHERE",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "FULL JOIN",
  "JOIN",
  "ON",
  "AND",
  "OR",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
];

function formatSql(sql) {
  let output = sql.trim().replace(/\s+/g, " ");
  keywords
    .sort((a, b) => b.length - a.length)
    .forEach((keyword) => {
      const pattern = new RegExp(`\\b${keyword.replace(/\s+/g, "\\s+")}\\b`, "gi");
      output = output.replace(pattern, keyword);
    });

  ["FROM", "WHERE", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN", "JOIN", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET"].forEach((keyword) => {
    output = output.replace(new RegExp(`\\s+${keyword}\\b`, "g"), `\n${keyword}`);
  });
  output = output.replace(/\s+(AND|OR)\s+/g, "\n  $1 ");
  output = output.replace(/,\s*/g, ",\n  ");
  output = output.replace(/\(\s*/g, "(\n  ").replace(/\s*\)/g, "\n)");
  return output;
}

function minifySql(sql) {
  return sql.trim().replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
}

export default function ToolHome() {
  const [sql, setSql] = useState(sampleSql);
  const [mode, setMode] = useState("format");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => (mode === "format" ? formatSql(sql) : minifySql(sql)), [mode, sql]);

  const copyOutput = async () => {
    setCopied(await safeCopyText(output));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <FileCode2 className="h-4 w-4" />
            Query cleanup
          </div>
          <h1 className="text-4xl font-semibold leading-tight">SQL Formatter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Format messy SQL into readable query blocks or minify it for compact storage.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Input SQL</h2>
              <button type="button" onClick={() => setSql(sampleSql)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--muted)]">
                <RotateCcw className="h-4 w-4" />
                Sample
              </button>
            </div>
            <textarea
              value={sql}
              onChange={(event) => setSql(event.target.value)}
              className="mt-4 min-h-[440px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 outline-none focus:border-[var(--primary)]"
              spellCheck={false}
            />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid grid-cols-2 rounded-lg bg-[var(--muted)] p-1">
                {[
                  ["format", "Format"],
                  ["minify", "Minify"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMode(id)}
                    className={`rounded-md px-4 py-2 text-sm font-semibold ${mode === id ? "bg-[var(--card)] text-[var(--primary)] shadow-sm" : "text-[var(--muted-foreground)]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="mt-4 min-h-[440px] overflow-auto rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">
              {output || "Formatted SQL will appear here."}
            </pre>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]">
              <Wand2 className="h-4 w-4" />
              {sql.length} input characters
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
