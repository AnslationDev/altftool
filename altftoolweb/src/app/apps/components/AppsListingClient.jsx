"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Grid2X2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import AppCard from "./AppCard";
import { AppIconSvg } from "./AppVisualAssets";

const categories = [
  { label: "Productivity", count: "2 Apps", icon: "briefcase", fill: "from-emerald-500 to-emerald-700", glow: "group-hover:shadow-emerald-500/25" },
  { label: "Utilities", count: "2 Apps", icon: "spark", fill: "from-orange-400 to-orange-600", glow: "group-hover:shadow-orange-500/25" },
  { label: "Tools", count: "3 Apps", icon: "tools", fill: "from-violet-500 to-fuchsia-600", glow: "group-hover:shadow-violet-500/25" },
  { label: "Android", count: "7 Apps", icon: "grid", fill: "from-sky-500 to-blue-700", glow: "group-hover:shadow-blue-500/25" },
  { label: "Learning", count: "OCR Ready", icon: "cap", fill: "from-teal-400 to-cyan-700", glow: "group-hover:shadow-teal-500/25" },
  { label: "Security", count: "Safe APK", icon: "shield", fill: "from-rose-500 to-red-700", glow: "group-hover:shadow-rose-500/25" },
];

const safetyItems = [
  { title: "Verified APKs", detail: "Manual quality checks", icon: BadgeCheck },
  { title: "Malware-Free Apps", detail: "Security-first downloads", icon: ShieldCheck },
  { title: "Fast Downloads", detail: "Optimized APK delivery", icon: Sparkles },
  { title: "Regular Updates", detail: "Fresh versions tracked", icon: Grid2X2 },
  { title: "Top Rated Apps", detail: "Curated by user signals", icon: Star },
];

function CategorySvgIcon({ type }) {
  const common = "drop-shadow-[0_8px_14px_rgba(15,63,46,0.16)]";

  if (type === "briefcase") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="#ffffff" d="M17 14.5A6.5 6.5 0 0 1 23.5 8h1A6.5 6.5 0 0 1 31 14.5V16h5a5 5 0 0 1 5 5v4.4a36.5 36.5 0 0 1-34 0V21a5 5 0 0 1 5-5h5v-1.5Zm4 1.5h6v-1.5a2.5 2.5 0 0 0-2.5-2.5h-1a2.5 2.5 0 0 0-2.5 2.5V16Z" />
        <path fill="#ffffff" fillOpacity=".86" d="M7 29.4a40.2 40.2 0 0 0 34 0V35a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5v-5.6Zm14-1.2h6v4.5h-6v-4.5Z" />
      </svg>
    );
  }

  if (type === "spark") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="#ffffff" d="M23.3 6.7a2.1 2.1 0 0 1 3.9 0l3.4 8.7 8.8 3.4a2.1 2.1 0 0 1 0 3.9l-8.8 3.4-3.4 8.8a2.1 2.1 0 0 1-3.9 0l-3.4-8.8-8.8-3.4a2.1 2.1 0 0 1 0-3.9l8.8-3.4 3.4-8.7Z" />
        <path fill="#fff3d5" d="m10.4 31.2 1.8 4.5 4.5 1.8-4.5 1.8-1.8 4.5-1.8-4.5-4.5-1.8 4.5-1.8 1.8-4.5Zm27.3-22 1.2 3.2 3.2 1.2-3.2 1.3-1.2 3.1-1.3-3.1-3.1-1.3 3.1-1.2 1.3-3.2Z" />
      </svg>
    );
  }

  if (type === "tools") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="#ffffff" d="M18.1 7a10 10 0 0 0-7.9 13.8L5.7 25.3a4 4 0 0 0 0 5.7l11.3 11.3a4 4 0 0 0 5.7 0l4.5-4.5A10 10 0 0 0 41 27.9l-8 8-6.9-2.1-2-6.8 8-8A10 10 0 0 0 18.1 7Z" />
        <path fill="#e9ddff" d="m13.3 29.2 5.5 5.5-2.8 2.8-5.5-5.5 2.8-2.8Z" />
      </svg>
    );
  }

  if (type === "grid") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <rect width="15" height="15" x="7" y="7" fill="#ffffff" rx="4" />
        <rect width="15" height="15" x="26" y="7" fill="#dff5ff" rx="4" />
        <rect width="15" height="15" x="7" y="26" fill="#dff5ff" rx="4" />
        <rect width="15" height="15" x="26" y="26" fill="#ffffff" rx="4" />
      </svg>
    );
  }

  if (type === "cap") {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path fill="#ffffff" d="M4.8 19.3 24 10l19.2 9.3L24 28.6 4.8 19.3Z" />
        <path fill="#d8fff2" d="M13.5 25.3 24 30.5l10.5-5.2v7.6c0 3.2-4.7 6.1-10.5 6.1s-10.5-2.9-10.5-6.1v-7.6Z" />
        <path fill="#ffffff" d="M39.5 22.1h3.2v12.6h-3.2V22.1Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
      <path fill="#ffffff" d="M24 5.5 39 11v11.2c0 9.5-6.1 17.5-15 20.3-8.9-2.8-15-10.8-15-20.3V11l15-5.5Z" />
      <path fill="#ffe2e2" d="m21.9 28.8 10.3-10.3 3 3-13.3 13.3-7.2-7.2 3-3 4.2 4.2Z" />
    </svg>
  );
}

export default function AppsListingClient({ apps, searchQuery = "" }) {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredApps = normalizedQuery
    ? apps.filter((app) => {
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
      })
    : apps;

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#0f3f2e]">
      <section id="apphub-home" className="relative w-full scroll-mt-24 overflow-hidden border-b border-[#d9d4c6] bg-[#f8f5eb] px-4 pb-10 pt-5 shadow-[0_24px_68px_rgba(15,63,46,0.08)] sm:px-6 lg:px-8 lg:pb-12 lg:pt-7">
        <div
          className="absolute inset-x-0 bottom-0 h-[46%] rounded-tl-[72px] bg-gradient-to-r from-[#0f3f2e] via-[#174b37] to-[#0a2d22] opacity-[0.94]"
          style={{ clipPath: "polygon(0 24%, 100% 0, 100% 100%, 0 100%)" }}
        />
        <div className="absolute left-[8%] top-[-16%] h-80 w-80 rounded-full bg-[#5F8F00]/25 blur-3xl" />
        <div className="absolute right-[4%] top-[4%] h-72 w-72 rounded-full bg-[#0f3f2e]/18 blur-3xl" />

        <div className="relative mx-auto max-w-[1320px]">
          <div className="grid items-center gap-8 lg:grid-cols-[0.74fr_1fr]">
            <div className="z-10 lg:-translate-y-10">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d9d4c6] bg-white/90 px-3 py-2 text-[12px] font-black text-[#385145] shadow-[0_12px_28px_rgba(15,63,46,0.07)] backdrop-blur">
                <ShieldCheck size={15} className="text-[#5F8F00]" aria-hidden="true" />
                Trusted by 100K+ Users
              </div>
              <h1 className="mt-5 max-w-xl text-[34px] font-black leading-[1.08] tracking-normal text-[#0f3f2e] sm:text-[46px] lg:text-[52px]">
                Discover. Download. Enjoy the <span className="text-[#5F8F00]">Best Apps</span>
              </h1>
              <p className="mt-4 max-w-md text-[14px] font-semibold leading-7 text-[#5c6b62] lg:text-[16px]">
                Curated Android apps with clean APK downloads, verified quality, and a polished AppHub experience.
              </p>
            </div>

            <div className="relative z-10 min-h-[460px] sm:min-h-[540px] lg:min-h-[570px]">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl sm:h-[360px] sm:w-[360px] lg:h-[390px] lg:w-[390px]" />

              <div className="absolute left-1/2 top-[48%] w-[188px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border-[6px] border-[#0b241b] bg-white p-2 shadow-[0_28px_60px_rgba(15,63,46,0.26)] sm:top-[47%] sm:w-[236px] sm:rounded-[34px] sm:border-[8px] sm:p-2.5 lg:w-[288px]">
                <div className="rounded-[22px] bg-[#f4f1e8] p-2.5 sm:rounded-[25px] sm:p-3.5">
                  <div className="mx-auto mb-2.5 h-4 w-16 rounded-full bg-[#0b241b] sm:mb-3 sm:h-5 sm:w-20" />
                  <div className="rounded-[18px] bg-[#0f3f2e] p-3 text-white shadow-[0_16px_30px_rgba(15,63,46,0.26)] sm:rounded-[22px] sm:p-4">
                    <p className="text-[10px] font-bold text-white/75 sm:text-[12px]">AppHub dashboard</p>
                    <p className="mt-1.5 text-lg font-black text-[#5F8F00] sm:mt-2 sm:text-2xl">4 curated apps</p>
                    <div className="mt-3 h-1.5 rounded-full bg-white/20 sm:mt-4 sm:h-2">
                      <span className="block h-full w-[76%] rounded-full bg-[#5F8F00]" />
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
                    {apps.slice(0, 3).map((app) => (
                      <div key={app.slug} className="flex items-center gap-2 rounded-[14px] border border-[#d9d4c6] bg-white p-2 shadow-[0_8px_20px_rgba(15,63,46,0.055)] sm:gap-3 sm:rounded-[16px] sm:p-2.5">
                        <AppIconSvg app={app} className="h-7 w-7 rounded-[9px] sm:h-9 sm:w-9 sm:rounded-[11px]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-black text-[#0f3f2e] sm:text-[12px]">{app.name}</p>
                          <p className="text-[8px] font-bold text-[#738078] sm:text-[10px]">{app.downloads} downloads</p>
                        </div>
                        <span className="text-[9px] font-black text-[#0f3f2e] sm:text-[11px]">{app.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute left-0 top-8 w-[150px] rounded-[18px] border border-white/50 bg-white/84 p-2.5 shadow-[0_18px_40px_rgba(15,63,46,0.12)] backdrop-blur-xl sm:left-8 sm:top-24 sm:w-[214px] sm:rounded-[22px] sm:p-4 lg:left-16">
                <p className="text-[10px] font-black text-[#5c6b62] sm:text-[12px]">Trending Apps</p>
                <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
                  {apps.slice(0, 2).map((app) => (
                    <div key={app.slug} className="flex items-center gap-2 sm:gap-3">
                      <AppIconSvg app={app} className="h-7 w-7 rounded-[9px] sm:h-9 sm:w-9 sm:rounded-[11px]" />
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black text-[#0f3f2e] sm:text-[12px]">{app.name}</p>
                        <p className="text-[8px] font-bold text-[#738078] sm:text-[10px]">{app.rating} rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute right-0 top-9 w-[148px] rounded-[18px] border border-white/50 bg-white/84 p-2.5 shadow-[0_18px_40px_rgba(15,63,46,0.12)] backdrop-blur-xl sm:right-8 sm:top-24 sm:w-[206px] sm:rounded-[22px] sm:p-3 lg:right-14">
                <p className="text-[10px] font-black text-[#5c6b62] sm:text-[12px]">Download Statistics</p>
                <p className="mt-1 text-lg font-black text-[#0f3f2e] sm:mt-1.5 sm:text-[22px]">3.4M+</p>
                <div className="mt-2 overflow-hidden rounded-[14px] bg-[#f4f1e8]/80 p-2 sm:mt-2.5 sm:rounded-[16px] sm:p-2.5">
                  <svg viewBox="0 0 160 62" className="h-[42px] w-full sm:h-[62px]" role="img" aria-label="Download progress chart">
                    <defs>
                      <linearGradient id="download-chart-fill" x1="0" y1="0" x2="1" y2="0">
                        <stop stopColor="#0f3f2e" />
                        <stop offset="1" stopColor="#5F8F00" />
                      </linearGradient>
                    </defs>
                    <path d="M8 52 L28 44 L44 48 L62 34 L80 38 L98 24 L116 28 L134 14 L152 20" fill="none" stroke="#d9d4c6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 52 L28 44 L44 48 L62 34 L80 38 L98 24 L116 28 L134 14 L152 20" fill="none" stroke="url(#download-chart-fill)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 52 L28 44 L44 48 L62 34 L80 38 L98 24 L116 28 L134 14 L152 20 L152 58 L8 58 Z" fill="#5F8F00" opacity=".12" />
                    {[62, 98, 134, 152].map((cx, index) => (
                      <circle key={cx} cx={cx} cy={[34, 24, 14, 20][index]} r="4.2" fill="#fff" stroke="#5F8F00" strokeWidth="3" />
                    ))}
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-24 left-1 w-[152px] rounded-[18px] border border-white/50 bg-white/84 p-2.5 shadow-[0_18px_40px_rgba(15,63,46,0.12)] backdrop-blur-xl sm:left-8 sm:w-[188px] sm:rounded-[22px] sm:p-3 lg:bottom-28 lg:left-14 lg:w-[224px] lg:p-4">
                <p className="text-[10px] font-black text-[#5c6b62] sm:text-[12px]">Recently Added</p>
                <div className="mt-2 flex -space-x-2 sm:mt-3">
                  {apps.map((app) => (
                    <AppIconSvg key={app.slug} app={app} className="h-7 w-7 rounded-[9px] ring-2 ring-white sm:h-9 sm:w-9 sm:rounded-[11px] sm:ring-4 lg:h-10 lg:w-10 lg:rounded-[12px]" />
                  ))}
                </div>
                <p className="mt-2 text-[8px] font-bold text-[#5c6b62] sm:mt-3 sm:text-[10px] lg:text-[11px]">Fresh APKs reviewed weekly</p>
              </div>

              <div className="absolute bottom-24 right-1 w-[154px] rounded-[18px] border border-white/50 bg-white/84 p-2.5 shadow-[0_18px_40px_rgba(15,63,46,0.12)] backdrop-blur-xl sm:right-8 sm:w-[204px] sm:rounded-[22px] sm:p-3.5 lg:right-12 lg:w-[224px]">
                <p className="text-[10px] font-black text-[#5c6b62] sm:text-[12px]">Performance Insights</p>
                <p className="mt-1.5 text-base font-black text-[#0f3f2e] sm:mt-2 sm:text-xl">99.9% uptime</p>
                <div className="mt-2 grid gap-1.5 sm:mt-3 sm:gap-2">
                  {[92, 84, 76].map((value, index) => (
                    <div key={value} className="flex items-center gap-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#e3ddce]">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-[#0f3f2e] to-[#5F8F00] transition-all duration-300"
                          style={{ width: `${value}%` }}
                        />
                      </span>
                      <span className="w-6 text-right text-[8px] font-black text-[#0f3f2e] sm:w-7 sm:text-[10px]">{["92", "84", "76"][index]}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute left-1/2 top-[142px] -translate-x-1/2 rounded-full border border-white/50 bg-white/84 px-3 py-2 shadow-[0_14px_32px_rgba(15,63,46,0.12)] backdrop-blur-xl sm:top-12 sm:px-4 sm:py-3">
                <p className="text-[10px] font-black text-[#0f3f2e] sm:text-[12px]">Top Rated Apps · 4.7 ★</p>
              </div>

              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/50 bg-white/84 px-3 py-2 shadow-[0_14px_32px_rgba(15,63,46,0.12)] backdrop-blur-xl sm:bottom-7 sm:gap-3 sm:px-4 sm:py-3">
                <Users size={15} className="text-[#5F8F00] sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                <p className="text-[10px] font-black text-[#0f3f2e] sm:text-[12px]">User Activity +28%</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 grid items-stretch gap-4 rounded-[26px] bg-white/15 p-4 shadow-[0_16px_38px_rgba(15,63,46,0.14)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-5">
            {safetyItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="min-h-[110px] rounded-[20px] border border-white/45 bg-[#fffdf7]/88 p-4 shadow-[0_10px_26px_rgba(15,63,46,0.08)] sm:min-h-[126px] sm:p-5">
                  <Icon size={28} className="text-[#5F8F00]" aria-hidden="true" />
                  <p className="mt-4 text-[15px] font-black text-[#0f3f2e]">{item.title}</p>
                  <p className="mt-1 text-[12px] font-bold leading-5 text-[#5c6b62]">{item.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-[1384px] scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0f3f2e]">Browse by Categories</h2>
            <p className="mt-1 text-sm font-semibold text-[#5c6b62]">Find apps by workflow and purpose.</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-6">
          {categories.map((category) => {
            return (
              <div key={category.label} className="group relative min-h-[128px] overflow-hidden rounded-[18px] border border-[#d9d4c6] bg-gradient-to-br from-[#fffdf7] to-[#eef3d9] p-4 text-center shadow-[0_10px_24px_rgba(15,63,46,0.065)] transition duration-300 hover:-translate-y-1 hover:border-[#5F8F00]/70 hover:shadow-[0_18px_38px_rgba(15,63,46,0.12)] lg:min-h-[138px]">
                <span className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#5F8F00]/80 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className={`mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-gradient-to-br ${category.fill} p-2.5 text-white shadow-[0_12px_22px_rgba(15,63,46,0.14)] transition duration-300 group-hover:scale-105 group-hover:shadow-lg ${category.glow} sm:h-[58px] sm:w-[58px]`}>
                  <CategorySvgIcon type={category.icon} />
                </div>
                <p className="mt-3 text-[14px] font-black text-[#0f3f2e]">{category.label}</p>
                <p className="mt-1 text-xs font-semibold text-[#5c6b62]">{category.count}</p>
                <span className="mx-auto mt-2.5 block h-1 w-7 rounded-full bg-[#5F8F00] opacity-0 transition duration-300 group-hover:w-10 group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </section>

      <section id="featured-apps" className="mx-auto max-w-[1384px] scroll-mt-24 px-4 pb-10 pt-2 sm:px-6 lg:px-8 lg:pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0f3f2e]">Featured Apps</h2>
            <p className="mt-1 text-sm font-semibold text-[#5c6b62]">
              {normalizedQuery ? `Search results for "${searchQuery}"` : "Handpicked apps for you."}
            </p>
          </div>
          <span className="text-sm font-black text-[#5F8F00]">{filteredApps.length} apps</span>
        </div>
        {filteredApps.length ? (
          <div className="mt-5 grid grid-flow-col auto-cols-[82%] gap-5 overflow-x-auto pb-2 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
            {filteredApps.map((app) => (
              <AppCard key={app.slug} app={app} descriptionFullWidth />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-[#d9d4c6] bg-[#fffdf7] p-8 text-center shadow-[0_14px_34px_rgba(15,63,46,0.075)]">
            <p className="text-lg font-black text-[#0f3f2e]">No apps found</p>
            <p className="mt-2 text-sm font-semibold text-[#5c6b62]">Try searching by app name, category, or tool type.</p>
          </div>
        )}
      </section>


      <section id="top-rated-apps" className="mx-auto max-w-[1384px] scroll-mt-24 px-4 pb-14 pt-4 sm:px-6 lg:px-8 lg:pb-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0f3f2e]">Top Rated Apps</h2>
            <p className="mt-1 text-sm font-semibold text-[#5c6b62]">High quality apps loved by users.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-4">
          {filteredApps
            .slice()
            .sort((a, b) => Number(b.rating) - Number(a.rating))
            .map((app) => (
              <Link key={app.slug} href={`/apps/${app.slug}`} className="group flex min-h-[172px] flex-col justify-between rounded-[22px] border border-[#d9d4c6] bg-[#fffdf7] p-6 shadow-[0_14px_34px_rgba(15,63,46,0.075)] transition hover:-translate-y-1 hover:border-[#5F8F00]/60 hover:shadow-[0_22px_48px_rgba(15,63,46,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5F8F00]/25">
                <div className="flex items-center gap-4">
                  <AppIconSvg app={app} className="h-[72px] w-[72px] rounded-[20px]" />
                  <div className="min-w-0">
                    <p className="text-[17px] font-black text-[#0f3f2e] transition group-hover:text-[#5F8F00]">
                      {app.name}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#5c6b62]">{app.category}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[16px] font-black text-[#0f3f2e]">{app.rating}</span>
                      <span className="tracking-[1px] text-[#f5a400]" aria-label={`${app.rating} star rating`}>★★★★★</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-[#6b776f]">{app.reviews?.length ?? 0} reviews</p>
                  </div>
                  <span className="rounded-full bg-[#5F8F00]/12 px-3 py-1.5 text-xs font-black text-[#315200]">{app.downloads}</span>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
