// Shared "keep exploring" band for site-wide internal linking.
//
// Server component — pair it with getRelatedContent()/getRelatedContentForPreset()
// from a page.jsx or another server component. Styling follows the
// RouteDiscoveryBand pattern and master.md tokens (light + dark via semantic
// variables, AA contrast, visible focus, reduced-motion safe).

import Link from "next/link";
import {
  AppWindow,
  ArrowRight,
  BookOpen,
  Calculator,
  Compass,
  FileText,
  FlaskConical,
  Gamepad2,
  ImageIcon,
  LayoutGrid,
  MapPin,
  Newspaper,
  Smartphone,
  Sparkles,
  Star,
  Tags,
  TrendingUp,
  Workflow,
  Wrench,
} from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import { createItemListJsonLd } from "@/platform/seo/generateMetadata";

const SECTION_ICONS = {
  tools: Wrench,
  toolCategories: LayoutGrid,
  blogs: BookOpen,
  top9: Star,
  top11: Star,
  deals: Tags,
  apps: Smartphone,
  products: AppWindow,
  experiences: FlaskConical,
  signals: TrendingUp,
  calculators: Calculator,
  pdfTools: FileText,
  imageTools: ImageIcon,
  locations: MapPin,
  news: Newspaper,
  games: Gamepad2,
  n8n: Workflow,
  hubs: Sparkles,
};

const linkCardClass =
  "group flex h-full flex-col justify-between rounded-[8px] border border-(--border) bg-(--background) p-3 transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 motion-reduce:transform-none sm:p-4";

export default function RelatedContentSection({
  eyebrow = "Discover more",
  title = "Related on AltFTool",
  description,
  items = [],
  path,
  jsonLdName,
  id,
  className = "",
  embedded = false,
}) {
  if (!items.length) return null;

  const headingId =
    id ||
    `related-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;
  const showEyebrow = eyebrow && eyebrow !== title;
  const jsonLd =
    path && jsonLdName
      ? createItemListJsonLd({
          path,
          name: jsonLdName,
          items: items.map((item) => ({ name: item.title, path: item.href })),
        })
      : null;
  if (jsonLd) {
    // Pages may already emit their own ItemList (#item-list) — keep this
    // band's schema id distinct so the two never collide.
    jsonLd["@id"] = String(jsonLd["@id"]).replace(/#item-list$/, "#related-content");
  }

  return (
    <section
      aria-labelledby={headingId}
      className={`${
        embedded
          ? "rounded-[12px] border border-(--border)"
          : "border-t border-(--border)"
      } bg-(--card) text-(--foreground) ${className}`}
    >
      {jsonLd ? <JsonLd id={`${headingId}-jsonld`} data={jsonLd} /> : null}
      <div
        className={
          embedded
            ? "w-full px-4 py-6 sm:px-5 sm:py-7"
            : "mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-5 sm:py-8 lg:px-8"
        }
      >
        <div className="mb-5 max-w-2xl">
          {showEyebrow ? (
            <div className="mb-3 inline-flex h-8 items-center gap-2 rounded-[7px] border border-(--border) bg-(--background) px-3 text-xs font-semibold text-(--primary-text)">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              {eyebrow}
            </div>
          ) : null}
          <h2
            id={headingId}
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-(--muted-foreground)">
              {description}
            </p>
          ) : null}
        </div>

        <nav aria-label={`${title} links`}>
          <ul className="grid list-none gap-2 p-0 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {items.map((item) => {
              const Icon = SECTION_ICONS[item.section] || ArrowRight;
              return (
                <li key={item.href} className="min-w-0">
                  <Link href={item.href} className={linkCardClass}>
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[7px] bg-(--muted) text-(--primary)">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {item.sectionLabel ? (
                          <span className="rounded-full border border-(--border) px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
                            {item.sectionLabel}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-sm font-semibold text-(--foreground)">
                        {item.title}
                      </h3>
                      {item.description ? (
                        <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-(--primary-text)">
                      Open
                      <ArrowRight
                        className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:transform-none"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
