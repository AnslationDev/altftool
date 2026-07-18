"use client";

// Lightweight "how this works" helper cards shown under the Sections tab —
// mirrors the reference mockup so the editor reads as a guided, self-explaining
// tool. Purely informational (static content).

import { Route, ListChecks, Sparkles } from "lucide-react";

const ROUTES = ["/lander/zara", "/lander/canva", "/lander/chatgpt", "/lander/notion", "/lander/github"];
const STEPS = [
  "Create or edit a landing page from Admin",
  "Add sections (Hero, Features, FAQ, CTA…)",
  "Upload banners, images, videos",
  "Set SEO, ads, visibility & publish",
  "Page is live at /lander/[slug]",
];
const FEATURES = [
  "Route-wise dynamic pages",
  "Fully managed from Admin",
  "Firebase powered",
  "SEO & Ads integrated",
  "Mobile responsive",
  "High performance",
];

function Card({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface,var(--card))] p-4 shadow-[var(--shadow-sm)]">
      <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-[var(--primary)]"><Icon className="h-3.5 w-3.5" /> {title}</h4>
      {children}
    </div>
  );
}

export default function PageInfoCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card icon={Route} title="Route example">
        <ul className="space-y-1">
          {ROUTES.map((r) => <li key={r} className="font-mono text-xs text-[var(--muted)]">{r}</li>)}
        </ul>
      </Card>
      <Card icon={ListChecks} title="How it works">
        <ol className="space-y-1">
          {STEPS.map((s, i) => <li key={i} className="text-xs text-[var(--muted)]"><span className="font-bold text-[var(--foreground)]">{i + 1}.</span> {s}</li>)}
        </ol>
      </Card>
      <Card icon={Sparkles} title="Key features">
        <ul className="space-y-1">
          {FEATURES.map((f) => <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><span className="text-[var(--success,#10B981)]">✓</span> {f}</li>)}
        </ul>
      </Card>
    </div>
  );
}
