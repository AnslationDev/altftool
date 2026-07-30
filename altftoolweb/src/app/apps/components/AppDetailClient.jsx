"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Heart,
  Info,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  User,
  Wifi,
} from "lucide-react";
import AppCard from "./AppCard";
import DownloadButton from "./DownloadButton";
import { AppIconSvg, AppScreenSvg } from "./AppVisualAssets";

const statIcons = {
  Developer: User,
  Category: Info,
  Size: HardDrive,
  Version: BadgeCheck,
  Updated: CalendarDays,
};

function AppScreenMock({ app, index }) {
  return (
    <div className="relative h-full overflow-hidden rounded-[30px] bg-transparent shadow-[0_22px_54px_rgba(2,6,23,0.22)]">
      <span className="absolute left-4 top-4 z-10 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
        Illustrative preview
      </span>
      <AppScreenSvg app={app} index={index} className="block h-full w-full rounded-[30px]" />
    </div>
  );
}

const WISHLIST_STORAGE_KEY = "ALTFT_APPS_WISHLIST";

function readWishlist() {
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AppDetailClient({ app, relatedApps }) {
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const hasDownload = Boolean(app.apkUrl);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsWishlisted(readWishlist().includes(app.slug));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [app.slug]);

  const toggleWishlist = () => {
    const current = readWishlist();
    const next = current.includes(app.slug)
      ? current.filter((slug) => slug !== app.slug)
      : [...current, app.slug];
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage can be unavailable in private browsing; UI state still updates.
    }
    setIsWishlisted(next.includes(app.slug));
  };

  const stats = [
    ["Developer", app.developer],
    ["Category", app.category],
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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto max-w-[1320px] px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-12">
        <nav className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-[var(--muted-foreground)]">
          <Link href="/apps" className="inline-flex items-center gap-1 text-[var(--primary)] hover:text-[var(--foreground)]">
            <ChevronLeft size={16} aria-hidden="true" />
            Apps
          </Link>
          <span>/</span>
          <span>{app.name}</span>
        </nav>

        <div className="mt-5">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <AppIconSvg app={app} className="h-28 w-28 rounded-[24px] shadow-[0_18px_40px_rgba(15,23,42,0.18)]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[30px] font-bold leading-[1.2] tracking-normal text-[var(--foreground)] [font-family:var(--home-font-display)] sm:text-[38px] sm:leading-[1.1]">{app.name}</h1>
              </div>
              <p className="mt-3 max-w-2xl text-[15px] font-normal leading-[1.7] text-[var(--muted-foreground)]">{app.tagline}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map(([label, value]) => {
              const Icon = statIcons[label];
              return (
                <div key={label} className="min-h-[92px] rounded-[18px] border border-[var(--home-border)] bg-[var(--section-highlight)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.055)] transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_34%,var(--home-border))] hover:shadow-[0_16px_34px_rgba(2,6,23,0.12)]">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-[var(--muted-foreground)] [font-family:var(--font-geist-sans)]">
                    <Icon size={15} className="text-[var(--primary)]" aria-hidden="true" />
                    {label}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">{value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {hasDownload ? (
              <DownloadButton href={app.apkUrl} className="sm:min-w-72" />
            ) : (
              <p className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--home-border)] bg-[var(--section-highlight)] px-6 text-sm font-semibold text-[var(--muted-foreground)] sm:min-w-72">
                Download coming soon
              </p>
            )}
            <button
              type="button"
              onClick={toggleWishlist}
              aria-pressed={isWishlisted}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] border border-[color-mix(in_srgb,var(--primary)_24%,var(--home-border))] bg-[var(--home-primary-soft)] px-6 text-sm font-semibold text-[var(--foreground)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--home-hover)] hover:shadow-[0_8px_24px_rgba(2,6,23,0.1)]"
            >
              <Heart size={18} aria-hidden="true" className={isWishlisted ? "fill-[var(--primary)] text-[var(--primary)]" : ""} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
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
              <div key={item} className="flex min-h-[104px] items-center gap-4 rounded-[18px] border border-[var(--home-border)] bg-[var(--card)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.065)] transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--home-border))] hover:shadow-[0_16px_36px_rgba(2,6,23,0.12)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[var(--primary)] text-[var(--primary-foreground)]">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-12 sm:px-6 lg:px-8 lg:pb-14">
        <div className="relative rounded-[28px] border border-[var(--home-border)] bg-[var(--footer-bg)] p-5 shadow-[0_22px_54px_rgba(15,23,42,0.16)] md:p-7">
          <button
            type="button"
            onClick={goToPreviousScreenshot}
            className="absolute left-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:-translate-x-0.5 hover:bg-[var(--primary-hover)]"
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
            className="absolute right-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:translate-x-0.5 hover:bg-[var(--primary-hover)]"
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
                  activeScreenshot === index ? "w-8 bg-[var(--primary)]" : "w-2.5 bg-white/35"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_0.48fr] lg:px-8 lg:pb-14">
        <div className="space-y-8">
          <div className="rounded-[24px] border border-[var(--home-border)] bg-[var(--card)] p-8 shadow-[0_16px_40px_rgba(15,23,42,0.075)] transition duration-200 hover:shadow-[0_20px_48px_rgba(2,6,23,0.1)]">
            <h2 className="text-[22px] font-semibold leading-[1.3] text-[var(--foreground)] [font-family:var(--home-font-display)]">About {app.name}</h2>
            <p className="mt-5 text-[15px] font-normal leading-8 text-[var(--muted-foreground)]">{app.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {app.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-[16px] bg-[var(--home-primary-soft)] p-4 text-sm font-medium text-[var(--foreground)]">
                  <BadgeCheck size={22} className="text-[var(--primary)]" aria-hidden="true" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="rounded-[24px] border border-[var(--home-border)] bg-[var(--card)] p-8 shadow-[0_16px_40px_rgba(15,23,42,0.075)] transition duration-200 hover:shadow-[0_20px_48px_rgba(2,6,23,0.1)]">
            <h2 className="text-[22px] font-semibold leading-[1.3] text-[var(--foreground)] [font-family:var(--home-font-display)]">App Information</h2>
            <dl className="mt-6 space-y-5">
              {stats.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-[var(--home-border)] pb-3 text-sm last:border-b-0">
                  <dt className="font-medium text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--foreground)]">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-b border-[var(--home-border)] pb-3 text-sm">
                <dt className="font-medium text-[var(--muted-foreground)]">Compatibility</dt>
                <dd className="text-right font-semibold text-[var(--foreground)]">{app.androidRequired}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <dt className="font-medium text-[var(--muted-foreground)]">File Type</dt>
                <dd className="text-right font-semibold text-[var(--foreground)]">
                  {hasDownload ? "APK" : "Not published"}
                </dd>
              </div>
            </dl>
          </div>

          {hasDownload ? (
            <div className="rounded-xl border border-[var(--home-border)] bg-[var(--footer-bg)] p-8 shadow-md transition duration-150 hover:shadow-lg motion-reduce:transition-none">
              <h2 className="text-[22px] font-semibold leading-[1.3] text-white [font-family:var(--home-font-display)]">How To Install</h2>
              <ol className="mt-7 space-y-6">
                {["Tap Download APK", "Open the downloaded file", "Allow install from browser if asked", "Tap Install and open the app"].map(
                  (step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)]">
                        {index + 1}
                      </span>
                      <span className="pt-1.5 text-sm font-medium text-white/82">{step}</span>
                    </li>
                  )
                )}
              </ol>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--home-border)] bg-[var(--section-highlight)] p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Download availability</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                No installable APK has been published for this app yet.
              </p>
            </div>
          )}
        </aside>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <h2 className="text-[22px] font-semibold leading-[1.3] text-[var(--foreground)] [font-family:var(--home-font-display)]">You may also like</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {relatedApps.map((relatedApp) => (
            <AppCard key={relatedApp.slug} app={relatedApp} compact descriptionFullWidth />
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 z-20 border-t border-[var(--home-border)] bg-[color-mix(in_srgb,var(--footer-bg)_96%,transparent)] p-4 shadow-[0_-12px_34px_rgba(15,23,42,0.2)] backdrop-blur">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AppIconSvg app={app} className="h-14 w-14 rounded-[16px] shadow-[0_12px_24px_rgba(15,23,42,0.18)]" />
            <div>
              <p className="font-semibold text-white">{app.name}</p>
              <p className="text-xs font-semibold text-white/68">
                {app.category} · {app.apkSize}
              </p>
            </div>
          </div>
          {hasDownload ? (
            <DownloadButton href={app.apkUrl} className="w-full sm:min-w-72 sm:w-auto" />
          ) : (
            <p className="w-full rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white/72 sm:w-auto sm:min-w-72">
              Download coming soon
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
