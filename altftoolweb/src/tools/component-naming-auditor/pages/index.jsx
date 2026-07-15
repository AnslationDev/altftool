"use client";

import { useMemo, useState } from "react";
import { Badge, Card } from "@altftool/ui";
import { CaseSensitive, CheckCircle2 } from "lucide-react";

const sampleInput = `src/components/UserCard.jsx
export default function UserCard() {}

src/components/profile-card.jsx
const profilecard = () => null

src/tools/report/ReportPanel.jsx
function ReportPanel() {}`;

function extractNames(value) {
  const fileMatches = [...value.matchAll(/(?:^|\n)([\w./-]+\.(?:jsx|tsx|js|ts))/g)].map((match) => match[1]);
  const componentMatches = [...value.matchAll(/\b(?:function|const|class)\s+([A-Za-z][A-Za-z0-9]*)/g)].map((match) => match[1]);
  return { fileMatches, componentMatches };
}

function isPascalCase(value) {
  return /^[A-Z][A-Za-z0-9]*$/.test(value);
}

export default function ComponentNamingAuditorPage() {
  const [input, setInput] = useState(sampleInput);
  const analysis = useMemo(() => {
    const { fileMatches, componentMatches } = extractNames(input);
    const duplicateNames = componentMatches.filter((name, index) => componentMatches.indexOf(name) !== index);
    const issues = [
      ...componentMatches.filter((name) => !isPascalCase(name)).map((name) => ({ label: name, issue: "Component should use PascalCase." })),
      ...fileMatches.filter((file) => /[a-z]-/.test(file.split("/").pop() || "")).map((file) => ({ label: file, issue: "Consider matching component-style file naming." })),
      ...duplicateNames.map((name) => ({ label: name, issue: "Duplicate component declaration." })),
    ];
    return { fileMatches, componentMatches, issues };
  }, [input]);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <Badge tone="primary">React naming QA</Badge>
        <h1 className="mt-3 text-2xl font-bold">Component Naming Auditor</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
          Paste component files or snippets to catch naming drift before it turns into a codebase scavenger hunt.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="component-input">File paths and component snippets</label>
          <textarea id="component-input" value={input} onChange={(event) => setInput(event.target.value)} className="mt-3 min-h-96 w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" spellCheck={false} />
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Files</p><p className="mt-2 text-3xl font-bold">{analysis.fileMatches.length}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Components</p><p className="mt-2 text-3xl font-bold">{analysis.componentMatches.length}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Issues</p><p className="mt-2 text-3xl font-bold">{analysis.issues.length}</p></Card>
          </div>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><CaseSensitive className="h-5 w-5 text-(--primary)" /> Naming findings</h2>
            <div className="mt-4 space-y-2">
              {analysis.issues.length ? analysis.issues.map((item) => (
                <div key={`${item.label}-${item.issue}`} className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <p className="font-mono text-sm">{item.label}</p>
                  <p className="mt-1 text-xs text-(--muted-foreground)">{item.issue}</p>
                </div>
              )) : <p className="flex items-center gap-2 text-sm text-(--muted-foreground)"><CheckCircle2 className="h-4 w-4 text-(--primary)" /> No naming issues found.</p>}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
