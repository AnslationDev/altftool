"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  Grid2X2,
} from "lucide-react";
import AppCard from "./AppCard";
import { AppIconSvg } from "./AppVisualAssets";

const CATEGORY_META = [
  { label: "Productivity", icon: "briefcase" },
  { label: "Utilities", icon: "spark" },
  { label: "Tools", icon: "tools" },
];

function CategorySvgIcon({ type }) {
  const common = "drop-shadow-sm";

  if (type === "briefcase") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="currentColor" d="M17 14.5A6.5 6.5 0 0 1 23.5 8h1A6.5 6.5 0 0 1 31 14.5V16h5a5 5 0 0 1 5 5v4.4a36.5 36.5 0 0 1-34 0V21a5 5 0 0 1 5-5h5v-1.5Zm4 1.5h6v-1.5a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0-2.5 2.5V16Z" />
        <path fill="currentColor" fillOpacity=".86" d="M7 29.4a40.2 40.2 0 0 0 34 0V35a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5v-5.6Zm14-1.2h6v4.5h-6v-4.5Z" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="currentColor" d="M23.3 6.7a2.1 2.1 0 0 1 3.9 0l3.4 8.7 8.8 3.4a2.1 2.1 0 0 1 0 3.9l-8.8 3.4-3.4 8.8a2.1 2.1 0 0 1-3.9 0l-3.4-8.8-8.8-3.4a2.1 2.1 0 0 1 0-3.9l8.8-3.4 3.4-8.7Z" />
        <path fill="currentColor" fillOpacity=".75" d="m10.4 31.2 1.8 4.5 4.5 1.8-4.5 1.8-1.8 4.5-1.8-4.5-4.5-1.8 4.5-1.8 1.8-4.5Zm27.3-22 1.2 3.2 3.2 1.2-3.2 1.3-1.2 3.1-1.3-3.1-3.1-1.3 3.1-1.2 1.3-3.2Z" />
      </svg>
    );
  }

  if (type === "tools") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="currentColor" d="M18.1 7a10 10 0 0 0-7.9 13.8L5.7 25.3a4 4 0 0 0 0 5.7l11.3 11.3a4 4 0 0 0 5.7 0l4.5-4.5A10 10 0 0 0 41 27.9l-8 8-6.9-2.1-2-6.8 8-8A10 10 0 0 0 18.1 7Z" />
        <path fill="currentColor" fillOpacity=".75" d="m13.3 29.2 5.5 5.5-2.8 2.8-5.5-5.5 2.8-2.8Z" />
      </svg>
    );
  }

  if (type === "grid") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <rect width="15" height="15" x="7" y="7" fill="currentColor" rx="4" />
        <rect width="15" height="15" x="26" y="7" fill="currentColor" fillOpacity=".75" rx="4" />
        <rect width="15" height="15" x="7" y="26" fill="currentColor" fillOpacity=".75" rx="4" />
        <rect width="15" height="15" x="26" y="26" fill="currentColor" rx="4" />
      </svg>
    );
  }

  if (type === "cap") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="currentColor" d="M4.8 19.3 24 10l19.2 9.3L24 28.6 4.8 19.3Z" />
        <path fill="currentColor" fillOpacity=".75" d="M13.5 25.3 24 30.5l10.5-5.2v7.6c0 3.2-4.7 6.1-10.5 6.1s-10.5-2.9-10.5-6.1v-7.6Z" />
        <path fill="currentColor" d="M39.5 22.1h3.2v12.6h-3.2V22.1Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
      <path fill="currentColor" d="M24 5.5 39 11v11.2c0 9.5-6.1 17.5-15 20.3-8.9-2.8-15-10.8-15-20.3V11l15-5.5Z" />
      <path fill="currentColor" fillOpacity=".75" d="m21.9 28.8 10.3-10.3 3 3-13.3 13.3-7.2-7.2 3-3 4.2 4.2Z" />
    </svg>
  );
}

export default function AppsListingClient({ apps, searchQuery = "" }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categories = useMemo(() => {
    return CATEGORY_META.map((meta) => ({
      ...meta,
      appCount: apps.filter((app) => app.category === meta.label).length,
    }))
      .filter((category) => category.appCount > 0)
      .map((category) => ({
        ...category,
        count: `${category.appCount} App${category.appCount === 1 ? "" : "s"}`,
      }));
  }, [apps]);

  const availableDownloadCount = useMemo(
    () => apps.filter((app) => Boolean(app.apkUrl)).length,
    [apps],
  );

  const catalogueFacts = [
    {
      title: `${availableDownloadCount} APK${availableDownloadCount === 1 ? "" : "s"} available`,
      detail: "Only published files show a download action",
      icon: Download,
    },
    {
      title: "App details",
      detail: "Version, file size and Android requirement",
      icon: FileText,
    },
    {
      title: `${apps.length} documented apps`,
      detail: "Browse the complete AppHub catalogue",
      icon: Grid2X2,
    },
  ];

  const filteredApps = apps.filter((app) => {
    if (selectedCategory && app.category !== selectedCategory) return false;
    if (!normalizedQuery) return true;

    const searchableText = [
      app.name,
      app.category,
      app.tagline,
      app.shortDescription,
      app.description,
      ...(app.features || []),
      ...(app.highlights || []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section id="apphub-home" className="section home-hero-section relative scroll-mt-24 overflow-hidden">
        <div className="home-hero-band relative overflow-hidden lg:!min-h-[calc(100svh-64px)]">
          <div className="pointer-events-none absolute inset-0 home-subtle-grid opacity-70" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-r from-[var(--primary)] via-[#0EA5E9] to-[#38BDF8] opacity-72"
            style={{ clipPath: "polygon(0 34%, 100% 12%, 100% 100%, 0 100%)" }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[color-mix(in_srgb,var(--footer-bg)_38%,transparent)] to-transparent"
            style={{ clipPath: "polygon(0 34%, 100% 12%, 100% 100%, 0 100%)" }}
          />
          <div className="pointer-events-none absolute -left-40 top-10 h-[32rem] w-[32rem] rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] blur-3xl" />
          <div className="pointer-events-none absolute right-[-12rem] top-16 h-[30rem] w-[30rem] rounded-full bg-[color-mix(in_srgb,#38BDF8_12%,transparent)] blur-3xl" />

          <div className="home-hero-inner relative mx-auto max-w-[1320px] px-[var(--anslation-ds-gutter)] lg:!min-h-[calc(100svh-64px)]">
            <div className="grid items-center gap-8 lg:grid-cols-[0.86fr_0.88fr] xl:grid-cols-[0.9fr_0.84fr]">
              <div className="z-10 lg:-translate-y-10">
                <div className="home-reference-badge w-fit">
                  <Grid2X2 size={15} aria-hidden="true" />
                  {apps.length} Apps in the Catalogue
                </div>
                <h1 className="mt-6 max-w-[39rem] text-balance text-[clamp(2.55rem,4.35vw,3.85rem)] font-extrabold leading-[1.03] tracking-normal text-[var(--foreground)] [font-family:var(--home-font-display)]">
                  Discover. Download. Enjoy the <span className="bg-gradient-to-r from-[var(--primary)] to-[#38BDF8] bg-clip-text text-transparent">Best Apps</span>
                </h1>
                <p className="mt-6 max-w-[34rem] text-[1.04rem] font-semibold leading-8 text-[var(--muted-foreground)]">
                  Browse Android app details and download the APKs that are currently published.
                </p>
              </div>

              <div className="relative z-10 min-h-[460px] sm:min-h-[540px] lg:min-h-[555px]">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl sm:h-[360px] sm:w-[360px] lg:h-[390px] lg:w-[390px]" />

              <div className="absolute left-1/2 top-[48%] w-[188px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border-[6px] border-[#020617] bg-white p-2 shadow-[0_28px_60px_rgba(15,23,42,0.26)] sm:top-[47%] sm:w-[236px] sm:rounded-[34px] sm:border-[8px] sm:p-2.5 lg:w-[272px]">
                <div className="rounded-[22px] bg-[var(--home-surface)] p-2.5 sm:rounded-[25px] sm:p-3.5">
                  <div className="mx-auto mb-2.5 h-4 w-16 rounded-full bg-[var(--footer-bg)] sm:mb-3 sm:h-5 sm:w-20" />
                  <div className="rounded-[18px] bg-[var(--footer-bg)] p-3 text-white shadow-[0_16px_30px_rgba(15,23,42,0.24)] sm:rounded-[22px] sm:p-4">
                    <p className="text-[10px] font-bold text-white/75 sm:text-[12px]">AppHub dashboard</p>
                    <p className="mt-1.5 text-lg font-bold text-[#38BDF8] sm:mt-2 sm:text-2xl">Curated apps</p>
                    <div className="mt-3 h-1.5 rounded-full bg-white/20 sm:mt-4 sm:h-2">
                      <span className="block h-full w-[76%] rounded-full bg-[var(--primary)]" />
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
                    {apps.slice(0, 3).map((app) => (
                      <div key={app.slug} className="flex items-center gap-2 rounded-[14px] border border-[var(--home-border)] bg-[var(--card)] p-2 shadow-[var(--home-shadow-sm)] sm:gap-3 sm:rounded-[16px] sm:p-2.5">
                        <AppIconSvg app={app} className="h-7 w-7 rounded-[9px] sm:h-9 sm:w-9 sm:rounded-[11px]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-semibold text-[var(--foreground)] sm:text-[12px]">{app.name}</p>
                          <p className="text-[8px] font-medium text-[var(--muted-foreground)] sm:text-[10px]">
                            {app.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute left-0 top-8 w-[140px] rounded-[18px] border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_84%,transparent)] p-2.5 shadow-[var(--home-shadow-md)] backdrop-blur-xl sm:left-2 sm:top-24 sm:w-[196px] sm:rounded-[22px] sm:p-3.5 lg:left-4">
                <p className="text-[10px] font-semibold text-[var(--muted-foreground)] sm:text-[12px]">Catalogue Preview</p>
                <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
                  {apps.slice(0, 2).map((app) => (
                    <div key={app.slug} className="flex items-center gap-2 sm:gap-3">
                      <AppIconSvg app={app} className="h-7 w-7 rounded-[9px] sm:h-9 sm:w-9 sm:rounded-[11px]" />
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold text-[var(--foreground)] sm:text-[12px]">{app.name}</p>
                        <p className="text-[8px] font-medium text-[var(--muted-foreground)] sm:text-[10px]">{app.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute right-[-4px] top-9 w-[148px] rounded-[18px] border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_84%,transparent)] p-2.5 shadow-[var(--home-shadow-md)] backdrop-blur-xl sm:right-8 sm:top-24 sm:w-[206px] sm:rounded-[22px] sm:p-3 lg:right-14">
                <p className="text-[10px] font-semibold text-[var(--muted-foreground)] sm:text-[12px]">Published APKs</p>
                <p className="mt-1 text-lg font-bold text-[var(--foreground)] sm:mt-1.5 sm:text-[22px]">
                  {availableDownloadCount}
                </p>
                <p className="mt-1 text-[8px] font-medium text-[var(--muted-foreground)] sm:mt-1.5 sm:text-[10px]">
                  {`Available across ${apps.length} listed apps`}
                </p>
              </div>

              <div className="absolute bottom-24 left-1 w-[152px] rounded-[18px] border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_84%,transparent)] p-2.5 shadow-[var(--home-shadow-md)] backdrop-blur-xl sm:left-8 sm:w-[188px] sm:rounded-[22px] sm:p-3 lg:bottom-28 lg:left-14 lg:w-[224px] lg:p-4">
                <p className="text-[10px] font-semibold text-[var(--muted-foreground)] sm:text-[12px]">In the Catalogue</p>
                <div className="mt-2 flex -space-x-2 sm:mt-3">
                  {apps.slice(0, 5).map((app) => (
                    <AppIconSvg key={app.slug} app={app} className="h-7 w-7 rounded-[9px] ring-2 ring-white sm:h-9 sm:w-9 sm:rounded-[11px] sm:ring-4 lg:h-10 lg:w-10 lg:rounded-[12px]" />
                  ))}
                </div>
                <p className="mt-2 text-[8px] font-medium text-[var(--muted-foreground)] sm:mt-3 sm:text-[10px] lg:text-[11px]">
                  {`${apps.length} documented Android apps`}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 grid items-stretch gap-4 rounded-lg border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_76%,transparent)] p-4 shadow-md backdrop-blur-xl sm:grid-cols-3">
            {catalogueFacts.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="home-premium-card min-h-[110px] rounded-lg p-4 sm:min-h-[126px] sm:p-5">
                  <Icon size={28} className="text-[var(--primary)]" aria-hidden="true" />
                  <p className="mt-4 text-[15px] font-semibold text-[var(--foreground)]">{item.title}</p>
                  <p className="mt-1 text-[12px] font-medium leading-5 text-[var(--muted-foreground)]">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-[1384px] scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold leading-[1.3] text-[var(--foreground)] [font-family:var(--home-font-display)]">Browse by Categories</h2>
            <p className="mt-1 text-[13px] font-normal leading-[1.6] text-[var(--muted-foreground)]">Find apps by workflow and purpose.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const isActive = selectedCategory === category.label;
            return (
              <button
                key={category.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedCategory((prev) => (prev === category.label ? null : category.label))}
                className={`home-premium-card group relative min-h-[128px] overflow-hidden rounded-md p-4 text-center transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] lg:min-h-[138px] ${
                  isActive ? "border-[color-mix(in_srgb,var(--primary)_60%,var(--home-border))] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]" : ""
                }`}
              >
                <span className={`absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent transition ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                <div className="mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary p-2.5 text-primary-foreground shadow-sm transition duration-300 group-hover:scale-105 group-hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:h-[58px] sm:w-[58px]">
                  <CategorySvgIcon type={category.icon} />
                </div>
                <p className="mt-3 text-[14px] font-semibold text-[var(--foreground)]">{category.label}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">{category.count}</p>
                <span className={`mx-auto mt-2.5 block h-1 rounded-full bg-[var(--primary)] transition duration-300 ${isActive ? "w-10 opacity-100" : "w-7 opacity-0 group-hover:w-10 group-hover:opacity-100"}`} />
              </button>
            );
          })}
        </div>
      </section>

      <section id="featured-apps" className="mx-auto max-w-[1384px] scroll-mt-24 px-4 pb-10 pt-2 sm:px-6 lg:px-8 lg:pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-semibold leading-[1.3] text-[var(--foreground)] [font-family:var(--home-font-display)]">All Apps</h2>
            <p className="mt-1 text-[13px] font-normal leading-[1.6] text-[var(--muted-foreground)]">
              {normalizedQuery
                ? `Search results for "${searchQuery}"`
                : selectedCategory
                ? `Showing ${selectedCategory} apps`
                : "Every Android app in the AppHub catalogue."}
            </p>
          </div>
          <span className="text-sm font-semibold text-[var(--primary)]">{filteredApps.length} apps</span>
        </div>
        {filteredApps.length ? (
          <div className="mt-5 grid grid-flow-col auto-cols-[82%] gap-5 overflow-x-auto pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
            {filteredApps.map((app) => (
              <AppCard key={app.slug} app={app} descriptionFullWidth />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-[var(--home-border)] bg-[var(--card)] p-8 text-center shadow-[0_14px_34px_rgba(15,23,42,0.075)]">
            <p className="text-lg font-semibold text-[var(--foreground)]">No apps found</p>
            <p className="mt-2 text-sm font-normal text-[var(--muted-foreground)]">Try searching by app name, category, or tool type.</p>
          </div>
        )}
      </section>
    </main>
  );
}
