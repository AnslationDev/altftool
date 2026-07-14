"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card } from "@altftool/ui";
import { AlertTriangle, PackageCheck, TrendingUp } from "lucide-react";

const samplePackage = `{
  "dependencies": {
    "next": "15.4.0",
    "react": "18.3.1",
    "firebase": "11.0.0",
    "lucide-react": "0.468.0"
  }
}`;

const sampleTargets = `next 16.2.6
react 19.2.5
firebase 12.9.0
lucide-react 0.562.0`;

function parseVersion(value = "") {
  const match = String(value).match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : [0, 0, 0];
}

function changeType(current, target) {
  const [currentMajor, currentMinor, currentPatch] = parseVersion(current);
  const [targetMajor, targetMinor, targetPatch] = parseVersion(target);
  if (targetMajor > currentMajor) return "major";
  if (targetMinor > currentMinor) return "minor";
  if (targetPatch > currentPatch) return "patch";
  return "same";
}

function parseTargets(value) {
  return Object.fromEntries(
    value
      .split(/\n+/)
      .map((line) => line.trim().split(/\s+/))
      .filter(([name, version]) => name && version),
  );
}

export default function DependencyUpgradeImpactEstimatorPage() {
  const [packageText, setPackageText] = useState(samplePackage);
  const [targetText, setTargetText] = useState(sampleTargets);

  const analysis = useMemo(() => {
    try {
      const parsed = JSON.parse(packageText);
      const targets = parseTargets(targetText);
      const dependencies = { ...parsed.dependencies, ...parsed.devDependencies };
      const critical = new Set(["next", "react", "react-dom", "firebase", "typescript", "eslint"]);
      const rows = Object.entries(dependencies).map(([name, current]) => {
        const target = targets[name] || current;
        const type = changeType(current, target);
        const base = { same: 0, patch: 12, minor: 34, major: 68 }[type];
        const score = Math.min(100, base + (critical.has(name) ? 18 : 0));
        return { name, current, target, type, score, critical: critical.has(name) };
      });
      return { ok: true, rows };
    } catch (error) {
      return { ok: false, error: error.message, rows: [] };
    }
  }, [packageText, targetText]);

  const averageRisk = analysis.rows.length
    ? Math.round(analysis.rows.reduce((total, row) => total + row.score, 0) / analysis.rows.length)
    : 0;
  const majorCount = analysis.rows.filter((row) => row.type === "major").length;

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <Badge tone="primary">Upgrade planning</Badge>
        <h1 className="mt-3 text-2xl font-bold">Dependency Upgrade Impact Estimator</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
          Compare current package versions with target versions and triage upgrades by semantic version jump and framework-critical risk.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="package-json">package.json</label>
          <textarea id="package-json" value={packageText} onChange={(event) => setPackageText(event.target.value)} className="mt-3 min-h-72 w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" spellCheck={false} />
        </Card>
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="target-versions">Target versions</label>
          <textarea id="target-versions" value={targetText} onChange={(event) => setTargetText(event.target.value)} className="mt-3 min-h-72 w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" spellCheck={false} />
          <Button className="mt-3" variant="secondary" onClick={() => { setPackageText(samplePackage); setTargetText(sampleTargets); }}>Load sample</Button>
        </Card>
      </section>

      {!analysis.ok ? <Card className="p-4 text-sm">Parse error: {analysis.error}</Card> : (
        <section className="grid gap-4 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="grid gap-4">
            <Card className="p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-(--muted-foreground)"><TrendingUp className="h-4 w-4" /> Average risk</p>
              <p className="mt-2 text-4xl font-bold">{averageRisk}%</p>
            </Card>
            <Card className="p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-(--muted-foreground)"><AlertTriangle className="h-4 w-4" /> Major upgrades</p>
              <p className="mt-2 text-4xl font-bold">{majorCount}</p>
            </Card>
          </div>
          <Card className="overflow-hidden">
            <div className="border-b border-(--border) p-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><PackageCheck className="h-5 w-5 text-(--primary)" /> Upgrade matrix</h2>
            </div>
            <div className="divide-y divide-(--border)">
              {analysis.rows.map((row) => (
                <div key={row.name} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-semibold">{row.name}</p>
                    <p className="mt-1 text-xs text-(--muted-foreground)">{row.current} → {row.target} · {row.type}{row.critical ? " · critical package" : ""}</p>
                  </div>
                  <Badge tone={row.score > 65 ? "neutral" : "success"}>{row.score > 65 ? "Review carefully" : "Low friction"}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </main>
  );
}
