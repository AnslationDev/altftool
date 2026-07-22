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

export default function ProductsDirectory({ phases, products, suites }) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("all");
  const suitePaths = useMemo(
    () => new Map(suites.map((suite) => [suite.productId, `/products/${suite.slug}`])),
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
            <h1 className="text-3xl font-bold sm:text-4xl">One platform, focused workspaces</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Start with a purpose-built workspace, then move into the exact AltFTool utility you need. Product states are shown honestly so beta and security-gated work is never mistaken for finished software.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric icon={CheckCircle2} label="Working products" value={products.filter((item) => item.status === "live").length} />
            <Metric icon={Sparkles} label="Public betas" value={products.filter((item) => item.status === "active").length} />
            <Metric icon={LockKeyhole} label="Security gated" value={products.filter((item) => item.status === "gated").length} />
          </div>
        </div>
      </section>

      <section className="section mx-auto py-8 sm:py-10">
        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-xl">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products by task or outcome"
              className="w-full !pl-10"
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
                <Card key={product.id} className="flex min-h-64 flex-col border-border bg-card p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                      <Blocks className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <Badge tone={STATUS_TONES[product.status] || "neutral"}>{STATUS_LABELS[product.status] || product.status}</Badge>
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">{product.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{product.summary}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{product.priority} · {product.phase}</span>
                    {href ? (
                      <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-primary outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
                        Open <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
