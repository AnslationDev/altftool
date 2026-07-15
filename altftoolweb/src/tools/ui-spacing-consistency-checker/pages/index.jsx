"use client";

import { useMemo, useState } from "react";
import { Badge, Card } from "@altftool/ui";
import { Ruler, ScanLine } from "lucide-react";

const sampleCode = `<section className="p-5 md:p-8 gap-4">
  <div className="mt-3 mb-6 rounded-lg px-4 py-3" />
  <button style={{ marginTop: "18px", padding: "12px 20px" }}>Save</button>
</section>`;

function extractSpacing(value) {
  const tailwindMatches = [...value.matchAll(/\b(?:p|m|gap|space-[xy]|px|py|pt|pr|pb|pl|mt|mr|mb|ml)-(\d+(?:\.\d+)?)\b/g)].map((match) => ({
    source: match[0],
    pixels: Number(match[1]) * 4,
  }));
  const pixelMatches = [...value.matchAll(/(\d+)px/g)].map((match) => ({
    source: match[0],
    pixels: Number(match[1]),
  }));
  return [...tailwindMatches, ...pixelMatches];
}

export default function UiSpacingConsistencyCheckerPage() {
  const [code, setCode] = useState(sampleCode);
  const values = useMemo(() => extractSpacing(code), [code]);
  const offScale = values.filter((item) => item.pixels % 4 !== 0);
  const duplicates = new Map();
  values.forEach((item) => duplicates.set(item.pixels, (duplicates.get(item.pixels) || 0) + 1));

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 text-(--foreground)">
      <section className="rounded-lg border border-(--border) bg-(--card) p-5 shadow-sm">
        <Badge tone="primary">Design-system audit</Badge>
        <h1 className="mt-3 text-2xl font-bold">UI Spacing Consistency Checker</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
          Paste JSX, HTML, or CSS snippets to catch spacing values that drift away from a clean 4px rhythm.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
        <Card className="p-4">
          <label className="text-sm font-semibold" htmlFor="spacing-code">Code snippet</label>
          <textarea id="spacing-code" value={code} onChange={(event) => setCode(event.target.value)} className="mt-3 min-h-96 w-full rounded-lg border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary) focus:shadow-[var(--anslation-ds-focus-ring)]" spellCheck={false} />
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Values</p><p className="mt-2 text-3xl font-bold">{values.length}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Off scale</p><p className="mt-2 text-3xl font-bold">{offScale.length}</p></Card>
            <Card className="p-4"><p className="text-xs font-semibold uppercase text-(--muted-foreground)">Unique sizes</p><p className="mt-2 text-3xl font-bold">{duplicates.size}</p></Card>
          </div>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Ruler className="h-5 w-5 text-(--primary)" /> Spacing inventory</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {values.map((item, index) => (
                <div key={`${item.source}-${index}`} className="rounded-lg border border-(--border) bg-(--background) p-3">
                  <p className="font-mono text-sm">{item.source}</p>
                  <p className="mt-1 text-xs text-(--muted-foreground)">{item.pixels}px · {item.pixels % 4 === 0 ? "on 4px scale" : "off scale"}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><ScanLine className="h-5 w-5 text-(--primary)" /> Recommendation</h2>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {offScale.length ? "Round off-scale values to the nearest 4px step and prefer shared Tailwind spacing utilities." : "Spacing looks consistent with the 4px scale."}
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
