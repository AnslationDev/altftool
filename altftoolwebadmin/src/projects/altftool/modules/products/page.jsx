import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Gauge,
  Layers3,
  LockKeyhole,
  Radar,
  Wrench,
} from "lucide-react";
import {
  PRODUCT_PHASES,
  PRODUCT_REGISTRY,
  PRODUCT_STATUSES,
  getProductProgress,
} from "@altftool/core/products";
import {
  SIGNAL_CATALOG,
  SIGNAL_DATA_AS_OF,
  formatSearchVolume,
} from "@altftool/core/signals";

const STATUS_STYLES = {
  live: "bg-success-soft text-success",
  active: "bg-primary-soft text-primary",
  partial: "bg-warning-soft text-warning",
  planned: "bg-surface-soft text-muted",
  gated: "bg-danger-soft text-danger",
};

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const progress = getProductProgress();

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <header className="border-b border-border pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
              <Radar className="h-4 w-4" aria-hidden="true" /> Product control center
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">AltFTool worldwide roadmap</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              One source of truth for active products, phased expansion, security gates, and the public Signals research catalog.
            </p>
          </div>
          <Link href="https://altftool.com/signals" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            Open public Signals <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section aria-label="Product progress" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Layers3} label="Total products" value={progress.total} />
        <Metric icon={CheckCircle2} label="Live" value={progress.live} />
        <Metric icon={Wrench} label="Active build" value={progress.active} />
        <Metric icon={Clock3} label="Partial + planned" value={progress.planned + progress.partial} />
        <Metric icon={LockKeyhole} label="Security gated" value={progress.gated} />
      </section>

      <section className="space-y-4" aria-labelledby="roadmap-title">
        <div>
          <h2 id="roadmap-title" className="text-xl font-semibold text-foreground">Product phases</h2>
          <p className="mt-1 text-sm text-muted">Existing products are consolidated before new public routes are opened.</p>
        </div>
        <div className="space-y-5">
          {PRODUCT_PHASES.map((phase) => {
            const products = PRODUCT_REGISTRY.filter((product) => product.phase === phase.id);
            return (
              <section key={phase.id} className="rounded-lg border border-border bg-card" aria-labelledby={`phase-${phase.id}`}>
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 id={`phase-${phase.id}`} className="font-semibold text-foreground">{phase.label}</h3>
                  <span className="text-xs tabular-nums text-muted">{products.length} products</span>
                </div>
                <div className="divide-y divide-border">
                  {products.map((product) => (
                    <article key={product.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.5fr)_auto] lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-foreground">{product.name}</h4>
                          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-semibold text-muted">{product.priority}</span>
                        </div>
                        <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_STYLES[product.status]}`}>
                          {PRODUCT_STATUSES[product.status]}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-muted">{product.summary}</p>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {product.publicPath && <Link href={`https://altftool.com${product.publicPath}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-soft">Public <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
                        {product.adminPath && <Link href={product.adminPath} className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-soft">Admin <ArrowUpRight className="h-3.5 w-3.5" /></Link>}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="signals-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="signals-title" className="text-xl font-semibold text-foreground">Signals catalog</h2>
            <p className="mt-1 text-sm text-muted">Research snapshot {SIGNAL_DATA_AS_OF}. Scores are editorial and volumes remain directional.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><Gauge className="h-4 w-4" />{SIGNAL_CATALOG.length} tracked</span>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border bg-surface-soft text-xs text-muted">
                <tr><th className="px-4 py-3 font-semibold">Signal</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Momentum</th><th className="px-4 py-3 text-right font-semibold">Demand</th><th className="px-4 py-3 text-right font-semibold">Score</th><th className="px-4 py-3 font-semibold">Public</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SIGNAL_CATALOG.map((signal) => (
                  <tr key={signal.slug} className="hover:bg-surface-soft">
                    <td className="px-4 py-3"><p className="font-semibold text-foreground">{signal.name}</p><p className="mt-0.5 text-xs text-muted">{signal.query}</p></td>
                    <td className="px-4 py-3 text-muted">{signal.category}</td>
                    <td className="px-4 py-3 text-muted">{signal.momentum}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{formatSearchVolume(signal.searchVolume)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{signal.opportunityScore}</td>
                    <td className="px-4 py-3"><Link href={`https://altftool.com/signals/${signal.slug}`} target="_blank" rel="noreferrer" aria-label={`Open ${signal.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:border-primary hover:text-primary"><ArrowUpRight className="h-4 w-4" /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
