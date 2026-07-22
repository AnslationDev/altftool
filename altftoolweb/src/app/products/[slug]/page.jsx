import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { PRODUCT_SUITE_CATALOG, getProductSuiteBySlug } from "@altftool/core/product-suites";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const ProductWorkspace = dynamic(() => import("./ProductWorkspace"), {
  loading: () => <WorkspaceSkeleton />,
});

export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_SUITE_CATALOG.map((suite) => ({ slug: suite.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const suite = getProductSuiteBySlug(slug);
  if (!suite) return {};
  return createPageMetadata({
    title: `${suite.name} - ${suite.eyebrow}`,
    description: suite.description,
    path: `/products/${suite.slug}`,
    keywords: [suite.name, ...suite.capabilities],
  });
}

export default async function ProductSuitePage({ params }) {
  const { slug } = await params;
  const suite = getProductSuiteBySlug(slug);
  if (!suite) notFound();
  const statusTone = suite.status === "working" ? "success" : suite.status === "beta" ? "info" : "neutral";

  return (
    <>
      <JsonLd
        id={`altf-product-${suite.slug}-schema`}
        data={[
          createCollectionPageJsonLd({ path: `/products/${suite.slug}`, name: suite.name, description: suite.description }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: suite.name, path: `/products/${suite.slug}` },
          ]),
        ]}
      />
      <main className="min-h-screen bg-background text-foreground">
        <section className="border-b border-border bg-card">
          <div className="section mx-auto py-10 sm:py-12">
            <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
              <ArrowLeft className="h-4 w-4" /> All products
            </Link>
            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex min-h-6 items-center rounded-full border px-2 text-xs font-semibold ${statusTone === "success" ? "border-[var(--anslation-ds-success)] text-[var(--anslation-ds-success)]" : statusTone === "info" ? "border-[var(--anslation-ds-info)] text-[var(--anslation-ds-info)]" : "border-border text-muted-foreground"}`}>{suite.status === "working" ? "Working" : suite.status === "beta" ? "Public beta" : "Security gated"}</span>
                  <span className="text-sm font-medium text-primary">{suite.eyebrow}</span>
                </div>
                <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{suite.name}</h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{suite.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {suite.status === "gated" ? <LockKeyhole className="h-5 w-5 text-primary" /> : <ShieldCheck className="h-5 w-5 text-primary" />}
                {suite.privacy}
              </div>
            </div>
          </div>
        </section>

        <section className="section mx-auto py-8 sm:py-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <ProductWorkspace suite={suite} />
            <aside className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-base font-semibold">What this workspace covers</h2>
                <ul className="mt-4 space-y-3">
                  {suite.capabilities.map((capability) => (
                    <li key={capability} className="flex gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {capability}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="text-base font-semibold">Focused tools</h2>
                <div className="mt-3 divide-y divide-border">
                  {suite.relatedTools.map(([label, href]) => (
                    <Link key={href} href={href} className="flex min-h-12 items-center justify-between gap-3 py-3 text-sm font-medium outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary">
                      {label}<ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="min-h-96 animate-pulse rounded-lg border border-border bg-card p-5" aria-label="Loading product workspace">
      <div className="h-6 w-48 rounded-md bg-muted" />
      <div className="mt-4 h-24 rounded-md bg-muted" />
      <div className="mt-4 h-10 w-32 rounded-md bg-muted" />
    </div>
  );
}
