"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  Filter,
  LockKeyhole,
  Search,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card, Input } from "@altftool/ui";
import { PRODUCT_SUITE_STATUSES } from "@altftool/core/product-suites";

// Suite states come from the catalogue's own label map, so the table and the
// detail pages always print the same wording.
const SUITE_STATUS_LABELS = PRODUCT_SUITE_STATUSES;

const STATUS_TONES = {
  live: "success",
  active: "info",
  partial: "warning",
  planned: "neutral",
  gated: "neutral",
};

const STATUS_LABELS = {
  live: "Working",
  active: "Public beta",
  partial: "Partial",
  planned: "Planned",
  gated: "Security gated",
};

export default function ProductsDirectory({ phases, products, suites, answer, faqs = [] }) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("all");
  const suitePaths = useMemo(
    () => new Map(suites.map((suite) => [suite.productId, `/products/${suite.slug}`])),
    [suites],
  );
  // Counted from the catalogue at render time so the headline numbers cannot
  // drift when a suite is added or its status changes.
  const suiteCounts = useMemo(
    () => ({
      working: suites.filter((suite) => suite.status === "working").length,
      beta: suites.filter((suite) => suite.status === "beta").length,
      gated: suites.filter((suite) => suite.status === "gated").length,
    }),
    [suites],
  );
  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesPhase = phase === "all" || product.phase === phase;
      const matchesQuery = !normalized || `${product.name} ${product.summary}`.toLowerCase().includes(normalized);
      return matchesPhase && matchesQuery;
    });
  }, [phase, products, query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-card">
        <div className="section mx-auto py-12 sm:py-16">
          <div className="max-w-3xl">
            <Badge tone="info" className="mb-4"><Blocks className="h-4 w-4" /> Product suite</Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">AltFTool products: one platform, focused workspaces</h1>
            <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
            {/* Answer-first: a self-contained sentence with counts derived from
                the catalogue, so it stays true and can be quoted alone. */}
            <p className="mt-4 text-base leading-7 text-foreground sm:text-lg">{answer}</p>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Start with a purpose-built workspace, then move into the exact AltFTool utility you need. Product states are shown honestly so beta and security-gated work is never mistaken for finished software.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric icon={CheckCircle2} label="Working workspaces" value={suiteCounts.working} />
            <Metric icon={Sparkles} label="In public beta" value={suiteCounts.beta} />
            <Metric icon={LockKeyhole} label="Security gated" value={suiteCounts.gated} />
          </div>
        </div>
      </section>

      <section className="section mx-auto py-8 sm:py-10">
        <div className="mb-6">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Blocks className="h-4 w-4" aria-hidden="true" />
            Workspace directory
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Pick your workspace</h2>
          <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-xl">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products by task or outcome"
              className="w-full !pl-10 transition duration-150 focus:border-primary focus:ring-[3px] focus:ring-primary/25 motion-reduce:transition-none"
            />
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Filter products by phase">
            <Filter className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <FilterButton active={phase === "all"} onClick={() => setPhase("all")}>All</FilterButton>
            {phases.map((item) => (
              <FilterButton key={item.id} active={phase === item.id} onClick={() => setPhase(item.id)}>
                {item.label}
              </FilterButton>
            ))}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground" role="status">
          {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
        </p>
        {visibleProducts.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => {
              const href = suitePaths.get(product.id) || product.publicPath;
              return (
                <Card key={product.id} className="group flex min-h-64 flex-col border-transparent bg-card p-5 shadow-sm ring-1 ring-border transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40 motion-reduce:transform-none motion-reduce:transition-none">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none">
                      <Blocks className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <Badge tone={STATUS_TONES[product.status] || "neutral"}>{STATUS_LABELS[product.status] || product.status}</Badge>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">{product.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{product.summary}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{product.priority} · {product.phase}</span>
                    {href ? (
                      <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-primary outline-none transition duration-150 hover:bg-muted active:scale-[0.98] focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none motion-reduce:transition-none">
                        Open <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="mt-4 border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No matching product</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try a broader search or reset the phase filter.</p>
            <Button className="mt-5" onClick={() => { setQuery(""); setPhase("all"); }}>Reset filters</Button>
          </Card>
        )}
      </section>

      {/* A real table of every workspace and its true state. This is the most
          extractable shape for the one fact this page exists to convey, and it
          is rendered from the catalogue rather than transcribed. */}
      <section className="section mx-auto pb-10 sm:pb-12" aria-labelledby="workspace-table-heading">
        <h2 id="workspace-table-heading" className="text-2xl font-bold sm:text-3xl">
          Which AltFTool product workspaces are available?
        </h2>
        <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
        <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Every AltFTool product workspace with its release state</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 font-semibold">Workspace</th>
                <th scope="col" className="px-4 py-3 font-semibold">State</th>
                <th scope="col" className="px-4 py-3 font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody>
              {suites.map((suite) => (
                <tr key={suite.slug} className="border-b border-border last:border-0">
                  <th scope="row" className="px-4 py-3 align-top font-semibold">
                    <Link
                      href={`/products/${suite.slug}`}
                      className="rounded-sm text-primary outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-primary/35"
                    >
                      {suite.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 align-top text-muted-foreground">{SUITE_STATUS_LABELS[suite.status] || suite.status}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{suite.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {faqs.length ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold sm:text-3xl">Questions about AltFTool products</h2>
            <span className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary" aria-hidden="true" />
            <dl className="mt-5 divide-y divide-border rounded-lg border border-border bg-card px-5">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-4">
                  <dt className="text-base font-semibold text-foreground">{faq.question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-3 border-border bg-background p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary"><Icon className="h-5 w-5" /></span>
      <span><strong className="block text-xl">{value}</strong><span className="text-sm text-muted-foreground">{label}</span></span>
    </Card>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <Button variant={active ? "primary" : "secondary"} size="sm" onClick={onClick} aria-pressed={active} className="shrink-0">
      {children}
    </Button>
  );
}
