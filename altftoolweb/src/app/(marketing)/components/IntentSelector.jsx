import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  FlaskConical,
  LayoutGrid,
  ShoppingBag,
  Workflow,
  Wrench,
} from "lucide-react";
import { PUBLIC_ROUTE_FAMILIES } from "@/platform/navigation/publicRouteTaxonomy";

const familyIcons = {
  platform: LayoutGrid,
  tools: Wrench,
  automation: Workflow,
  business: BriefcaseBusiness,
  commerce: ShoppingBag,
  learn: BookOpen,
  experiences: FlaskConical,
};

const visibleFamilies = PUBLIC_ROUTE_FAMILIES.filter((family) =>
  Object.hasOwn(familyIcons, family.id),
);

export default function IntentSelector() {
  return (
    <section
      className="border-b border-border bg-surface-soft"
      aria-labelledby="home-paths-title"
    >
      <div className="mx-auto w-full max-w-[var(--anslation-ds-container)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Start by goal
            </p>
            <h2
              id="home-paths-title"
              className="mt-2 text-2xl font-bold text-foreground sm:text-3xl"
            >
              One platform, clearly organized
            </h2>
            <span
              className="mt-3 block h-1 w-12 rounded-full bg-gradient-to-r from-primary to-secondary"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Each area has a distinct purpose. Choose the result you need and
              continue through a focused route.
            </p>
          </div>
          <Link
            href="/site-map"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary transition-colors duration-150 hover:text-[var(--primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            View complete site map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleFamilies.map((family) => {
            const Icon = familyIcons[family.id];
            return (
              <Link
                key={family.id}
                href={family.href}
                className="group flex min-h-44 flex-col rounded-lg border border-border bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 motion-reduce:transform-none"
              >
                <span className="grid h-10 w-10 place-items-center rounded-md bg-muted text-primary transition duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {family.shortTitle}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  {family.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Open
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
