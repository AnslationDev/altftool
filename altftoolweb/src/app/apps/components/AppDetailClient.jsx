"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  HardDrive,
  Heart,
  Info,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Wifi,
} from "lucide-react";
import AppCard from "./AppCard";
import DownloadButton from "./DownloadButton";
import { AppIconSvg, AppScreenSvg } from "./AppVisualAssets";

const statIcons = {
  Developer: User,
  Category: Info,
  Downloads: Download,
  Size: HardDrive,
  Version: BadgeCheck,
  Updated: CalendarDays,
};

function AppScreenMock({ app, index }) {
  return (
    <div className="h-full overflow-hidden rounded-[30px] bg-transparent shadow-[0_22px_54px_rgba(4,18,13,0.22)]">
      <AppScreenSvg app={app} index={index} className="block h-full w-full rounded-[30px]" />
    </div>
  );
}

export default function AppDetailClient({ app, relatedApps }) {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const stats = [
    ["Developer", app.developer],
    ["Category", app.category],
    ["Downloads", app.downloads],
    ["Size", app.apkSize],
    ["Version", app.version],
    ["Updated", app.lastUpdated],
  ];
  const screenshotIndexes = useMemo(
    () => [activeScreenshot, (activeScreenshot + 1) % 3, (activeScreenshot + 2) % 3],
    [activeScreenshot],
  );
  const goToPreviousScreenshot = () => {
    setActiveScreenshot((current) => (current + 2) % 3);
  };
  const goToNextScreenshot = () => {
    setActiveScreenshot((current) => (current + 1) % 3);
  };

  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#0f3f2e]">
      <section className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-12">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-[#5c6b62]">
          <Link href="/apps" className="inline-flex items-center gap-1 text-[#5F8F00] hover:text-[#0f3f2e]">
            <ChevronLeft size={16} aria-hidden="true" />
            Apps
          </Link>
          <span>/</span>
          <span>{app.name}</span>
        </nav>

        <div className="mt-5">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <AppIconSvg app={app} className="h-28 w-28 rounded-[24px] shadow-[0_18px_40px_rgba(15,63,46,0.18)]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[34px] font-black leading-tight tracking-normal text-[#0f3f2e] sm:text-[42px]">{app.name}</h1>
                <BadgeCheck size={26} className="fill-[#5F8F00] text-white" aria-hidden="true" />
              </div>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5c6b62]">{app.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-base font-black text-[#0f3f2e]">{app.rating}</span>
                <span className="text-sm text-amber-400">★★★★★</span>
                <span className="text-sm font-semibold text-[#5c6b62]">({app.reviewCount} Reviews)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {stats.map(([label, value]) => {
              const Icon = statIcons[label];
              return (
                <div key={label} className="min-h-[92px] rounded-[18px] border border-[#d9d4c6] bg-[#f8f5eb] p-4 shadow-[0_12px_28px_rgba(15,63,46,0.055)]">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#5c6b62]">
                    <Icon size={15} className="text-[#5F8F00]" aria-hidden="true" />
                    {label}
                  </div>
                  <p className="mt-3 text-sm font-black text-[#0f3f2e]">{value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <DownloadButton href={app.apkUrl} className="bg-[#5F8F00] text-white hover:bg-[#4f7800] sm:min-w-72" />
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[#c8d99a] bg-[#f2f7dc] px-6 text-sm font-black text-[#0f3f2e] transition hover:bg-[#e8f8b9]">
              <Heart size={18} aria-hidden="true" />
              Add to Wishlist
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-10 sm:px-6 lg:px-8 lg:pb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {app.highlights.map((item, index) => {
            const icons = [ShieldCheck, Sparkles, BadgeCheck, Wifi, MonitorSmartphone];
            const Icon = icons[index % icons.length];
            return (
              <div key={item} className="flex min-h-[104px] items-center gap-4 rounded-[18px] border border-[#d9d4c6] bg-[#fffdf7] p-5 shadow-[0_12px_30px_rgba(15,63,46,0.065)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#5F8F00] text-white">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0f3f2e]">{item}</p>
                  <p className="text-xs font-semibold text-[#5c6b62]">Verified by AppHub</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-12 sm:px-6 lg:px-8 lg:pb-14">
        <div className="relative rounded-[28px] border border-[#d9d4c6]/70 bg-[#0f3f2e] p-5 shadow-[0_22px_54px_rgba(15,63,46,0.16)] md:p-7">
          <button
            type="button"
            onClick={goToPreviousScreenshot}
            className="absolute left-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#5F8F00] text-white shadow-[0_12px_30px_rgba(15,63,46,0.18)] transition hover:-translate-x-0.5 hover:bg-[#4f7800]"
            aria-label="Previous screenshot"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <div className="overflow-hidden px-4 md:px-16">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {screenshotIndexes.map((index) => (
                <div
                  key={`${app.slug}-${index}`}
                  className={`${index === activeScreenshot ? "block" : "hidden"} h-[470px] md:block md:h-[560px]`}
                >
                <AppScreenMock app={app} index={index} />
              </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={goToNextScreenshot}
            className="absolute right-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#5F8F00] text-white shadow-[0_12px_30px_rgba(15,63,46,0.18)] transition hover:translate-x-0.5 hover:bg-[#4f7800]"
            aria-label="Next screenshot"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <div className="mt-6 flex justify-center gap-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveScreenshot(index)}
                aria-label={`Show screenshot ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  activeScreenshot === index ? "w-8 bg-[#5F8F00]" : "w-2.5 bg-white/35"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_0.48fr] lg:px-8 lg:pb-14">
        <div className="space-y-8">
          <div className="rounded-[24px] border border-[#d9d4c6] bg-[#fffdf7] p-8 shadow-[0_16px_40px_rgba(15,63,46,0.075)]">
            <h2 className="text-2xl font-black text-[#0f3f2e]">About {app.name}</h2>
            <p className="mt-5 text-[15px] font-semibold leading-8 text-[#5c6b62]">{app.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {app.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-[16px] bg-[#f2f7dc] p-4 text-sm font-bold text-[#385145]">
                  <BadgeCheck size={22} className="text-[#5F8F00]" aria-hidden="true" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d9d4c6] bg-[#fffdf7] p-8 shadow-[0_16px_40px_rgba(15,63,46,0.075)]">
            <h2 className="text-2xl font-black text-[#0f3f2e]">Ratings & Reviews</h2>
            <div className="mt-6 grid gap-9 lg:grid-cols-[0.38fr_1fr]">
              <div className="flex items-end gap-3">
                <span className="text-7xl font-black text-[#0f3f2e]">{app.rating}</span>
                <div className="pb-2">
                  <p className="text-amber-400">★★★★★</p>
                  <p className="text-sm font-semibold text-[#5c6b62]">{app.reviewCount} Reviews</p>
                </div>
              </div>
              <div className="space-y-3 pt-1">
                {[5, 4, 3, 2, 1].map((rating, index) => (
                  <div key={rating} className="grid grid-cols-[32px_1fr_44px] items-center gap-3 text-xs font-bold text-[#5c6b62]">
                    <span>{rating} ★</span>
                    <span className="h-4 overflow-hidden rounded-full bg-[#e3ddce]">
                      <span
                        className="block h-full rounded-full bg-[#0f3f2e]"
                        style={{ width: `${[88, 42, 24, 12, 8][index]}%` }}
                      />
                    </span>
                    <span>{["8.2K", "2.6K", "1.0K", "300", "300"][index]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {app.reviews.map((review) => (
                <article key={`${review.name}-${review.date}`} className="min-h-[154px] rounded-[20px] border border-[#d9d4c6] bg-[#f8f5eb] p-6 shadow-[0_12px_30px_rgba(15,63,46,0.065)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-[#0f3f2e]">{review.name}</p>
                    <p className="text-xs font-semibold text-[#5c6b62]">{review.date}</p>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#5c6b62]">{review.text}</p>
                  <p className="mt-3 text-xs font-bold text-[#5F8F00]">Helpful</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="rounded-[24px] border border-[#d9d4c6] bg-[#fffdf7] p-8 shadow-[0_16px_40px_rgba(15,63,46,0.075)]">
            <h2 className="text-xl font-black text-[#0f3f2e]">App Information</h2>
            <dl className="mt-6 space-y-5">
              {stats.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-[#e3ddce] pb-3 text-sm last:border-b-0">
                  <dt className="font-bold text-[#5c6b62]">{label}</dt>
                  <dd className="text-right font-extrabold text-[#0f3f2e]">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-b border-[#e3ddce] pb-3 text-sm">
                <dt className="font-bold text-[#5c6b62]">Compatibility</dt>
                <dd className="text-right font-extrabold text-[#0f3f2e]">{app.androidRequired}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="font-bold text-[#5c6b62]">File Type</dt>
                <dd className="text-right font-extrabold text-[#0f3f2e]">APK</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[24px] border border-[#d9d4c6] bg-[#0f3f2e] p-8 shadow-[0_16px_40px_rgba(15,63,46,0.12)]">
            <h2 className="text-2xl font-black text-white">How To Install</h2>
            <ol className="mt-7 space-y-6">
              {["Tap Download APK", "Open the downloaded file", "Allow install from browser if asked", "Tap Install and open the app"].map(
                (step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5F8F00] text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <span className="pt-1.5 text-sm font-bold text-white/82">{step}</span>
                  </li>
                )
              )}
            </ol>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <h2 className="text-xl font-black text-[#0f3f2e]">You may also like</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {relatedApps.map((relatedApp) => (
            <AppCard key={relatedApp.slug} app={relatedApp} compact descriptionFullWidth />
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 z-20 border-t border-[#254d3d] bg-[#0f3f2e]/96 p-4 shadow-[0_-12px_34px_rgba(15,63,46,0.2)] backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AppIconSvg app={app} className="h-14 w-14 rounded-[16px] shadow-[0_12px_24px_rgba(15,63,46,0.18)]" />
            <div>
              <p className="font-black text-white">{app.name}</p>
              <p className="text-xs font-semibold text-white/68">{app.downloads} downloads · {app.apkSize} APK</p>
            </div>
          </div>
          <DownloadButton href={app.apkUrl} className="w-full bg-[#5F8F00] text-white hover:bg-[#4f7800] sm:min-w-72 sm:w-auto" />
        </div>
      </div>
    </main>
  );
}
