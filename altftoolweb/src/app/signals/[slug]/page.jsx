import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BarChart3, CheckCircle2, Gauge, Globe2 } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  SIGNAL_CATALOG,
  SIGNAL_DATA_AS_OF,
  formatSearchVolume,
  getSignalBySlug,
} from "@altftool/core/signals";
import LiveTrendPanel from "./LiveTrendPanel";

export const dynamicParams = false;

function pathLabel(path) {
  if (path === "/altflovepdf") return "AltF PDF Studio";
  return path.split("/").filter(Boolean).pop().split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function generateStaticParams() {
  return SIGNAL_CATALOG.map((signal) => ({ slug: signal.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const signal = getSignalBySlug(slug);
  if (!signal) return {};
  return createPageMetadata({
    title: `${signal.name} Demand and Opportunity Research`,
    description: signal.summary,
    path: `/signals/${signal.slug}`,
    keywords: [signal.query, `${signal.name} trend`, `${signal.name} market`],
  });
}

export default async function SignalDetailPage({ params }) {
  const { slug } = await params;
  const signal = getSignalBySlug(slug);
  if (!signal) notFound();
  const path = `/signals/${signal.slug}`;

  return (
    <>
      <JsonLd
        id={`signal-${signal.slug}-schema`}
        data={[
          createCollectionPageJsonLd({ path, name: `${signal.name} research`, description: signal.summary }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Signals", path: "/signals" },
            { name: signal.name, path },
          ]),
        ]}
      />
      <main id="main-content" className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-surface-soft">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <Link href="/signals" className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All signals
            </Link>
            <div className="mt-5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">{signal.category}</span>
                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">{signal.momentum}</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-normal sm:text-4xl">{signal.name}</h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{signal.summary}</p>
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Gauge className="h-4 w-4 text-primary" />Opportunity score</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{signal.opportunityScore}<span className="text-sm text-muted-foreground">/100</span></dd></div>
              <div className="rounded-lg border border-border bg-card p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><BarChart3 className="h-4 w-4 text-primary" />Monthly search</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{formatSearchVolume(signal.searchVolume)}</dd></div>
              <div className="rounded-lg border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">Competition</dt><dd className="mt-2 text-2xl font-semibold">{signal.competition}</dd></div>
              <div className="rounded-lg border border-border bg-card p-4"><dt className="flex items-center gap-2 text-xs text-muted-foreground"><Globe2 className="h-4 w-4 text-primary" />Coverage</dt><dd className="mt-2 text-2xl font-semibold">{signal.region}</dd></div>
            </dl>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div className="space-y-6">
            <LiveTrendPanel query={signal.query} />

            <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="blueprint-title">
              <p className="text-xs font-semibold uppercase text-primary">Opportunity blueprint</p>
              <h2 id="blueprint-title" className="mt-1 text-xl font-semibold">What a strong product should solve</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {signal.actions.map((action) => (
                  <li key={action} className="flex items-start gap-3 rounded-md bg-surface-soft p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-4" aria-label="Related signal information">
            <section className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-semibold">Use related AltFTool products</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Move from research to a working utility.</p>
              <div className="mt-4 space-y-2">
                {signal.relatedPaths.map((relatedPath) => (
                  <Link key={relatedPath} href={relatedPath} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-3 text-sm font-semibold transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {pathLabel(relatedPath)}
                    <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-surface-soft p-5 text-sm leading-6 text-muted-foreground">
              <h2 className="font-semibold text-foreground">Research notes</h2>
              <p className="mt-2">Snapshot reviewed {SIGNAL_DATA_AS_OF}. Search volume is a directional estimate where available. Opportunity score is AltFTool editorial research, not a promise of commercial success.</p>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
