"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card } from "@altftool/ui";
import { Braces, GitFork, Search } from "lucide-react";

const sampleJson = `{
  "project": { "id": "p-100", "name": "Launch Hub" },
  "teams": [
    { "id": "team-design", "name": "Design", "projectId": "p-100" },
    { "id": "team-web", "name": "Web", "projectId": "p-100" }
  ],
  "tasks": [
    { "id": "task-1", "ownerId": "team-design", "status": "blocked" },
    { "id": "task-2", "ownerId": "team-web", "status": "ready" }
  ]
}`;

function walkJson(value, path = "$", rows = [], references = []) {
  const type = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  rows.push({ path, type, preview: type === "object" || type === "array" ? `${Object.keys(value || {}).length} children` : String(value) });

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      const childPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;
      if (/id$/i.test(key) && typeof child !== "object") {
        references.push({ path: childPath, key, value: String(child) });
      }
      walkJson(child, childPath, rows, references);
    });
  }

  return { rows, references };
}

function buildRelationships(references) {
  const ids = references.filter((item) => item.key.toLowerCase() === "id");
  const targets = new Map(ids.map((item) => [item.value, item.path]));

  return references
    .filter((item) => item.key.toLowerCase() !== "id" && targets.has(item.value))
    .map((item) => ({ from: item.path, to: targets.get(item.value), value: item.value }));
}

export default function JsonRelationshipMapperPage() {
  const [input, setInput] = useState(sampleJson);
  const analysis = useMemo(() => {
    try {
      const parsed = JSON.parse(input);
      const { rows, references } = walkJson(parsed);
      return { ok: true, rows, references, relationships: buildRelationships(references) };
    } catch (error) {
      return { ok: false, error: error.message, rows: [], references: [], relationships: [] };
    }
  }, [input]);

  const stats = [
    { label: "Paths", value: analysis.rows.length },
    { label: "ID-like fields", value: analysis.references.length },
    { label: "Links", value: analysis.relationships.length },
  ];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge tone="primary">Local JSON analysis</Badge>
            <h1 className="mt-3 text-2xl font-bold">JSON Relationship Mapper</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              Paste JSON to inspect nested paths, detect ID references, and understand how records connect without sending data anywhere.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setInput(sampleJson)}>Load sample</Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <Card className="p-4">
          <label className="text-sm font-semibold text-(--foreground)" htmlFor="json-input">JSON input</label>
          <textarea
            id="json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="mt-3 min-h-[420px] w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]"
            spellCheck={false}
          />
          {!analysis.ok ? <p className="mt-3 rounded-md border border-(--border) bg-(--muted) p-3 text-sm text-(--foreground)">Parse error: {analysis.error}</p> : null}
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-(--foreground)">{stat.value}</p>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><GitFork className="h-5 w-5 text-(--primary)" /> Inferred relationships</h2>
            <div className="mt-3 space-y-2">
              {analysis.relationships.length ? analysis.relationships.map((item) => (
                <div key={`${item.from}-${item.to}`} className="rounded-md border border-(--border) bg-(--background) p-3 text-sm">
                  <p className="font-semibold text-(--foreground)">{item.value}</p>
                  <p className="mt-1 break-all text-xs text-(--muted-foreground)">{item.from} → {item.to}</p>
                </div>
              )) : <p className="text-sm text-(--muted-foreground)">No reference links found yet. Fields ending in ID are matched to `id` values.</p>}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Search className="h-5 w-5 text-(--primary)" /> Structure paths</h2>
            <div className="mt-3 max-h-72 overflow-auto rounded-lg border border-(--border)">
              {analysis.rows.slice(0, 80).map((row) => (
                <div key={row.path} className="grid grid-cols-[1fr_auto] gap-3 border-b border-(--border) p-2 text-xs last:border-b-0">
                  <span className="break-all font-mono text-(--foreground)">{row.path}</span>
                  <span className="text-(--muted-foreground)">{row.type}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
