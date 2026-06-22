"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  DatabaseZap,
  Link2,
  UsersRound,
} from "lucide-react";

const features = [
  {
    title: "Data Sync and Backup",
    description:
      "Keep task progress, tool paths, and saved workflows organized across everyday productivity sessions.",
    icon: DatabaseZap,
    tone: "home-icon-violet",
  },
  {
    title: "Task Attachments",
    description:
      "Collect files, links, notes, and references around the tool workflow you are completing.",
    icon: Link2,
    tone: "home-icon-cyan",
  },
  {
    title: "Task Collaboration",
    description:
      "Share useful tools and workflow context with teammates, creators, or clients without extra setup.",
    icon: UsersRound,
    tone: "home-icon-emerald",
  },
];

function AnimatedMetric({ value, suffix, start }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!start) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      const frameId = requestAnimationFrame(() => setDisplayValue(value));
      return () => cancelAnimationFrame(frameId);
    }

    let frameId;
    const startTime = performance.now();
    const duration = 1100;

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [start, value]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

export default function ProductivityPreviewSection() {
  const sectionRef = useRef(null);
  const [metricsActive, setMetricsActive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMetricsActive(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.28,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[var(--home-border)] bg-[var(--card)] px-5 py-8 shadow-[var(--home-shadow-md)] sm:rounded-[2rem] md:px-10 md:py-10 lg:px-14">
        <div className="pointer-events-none absolute -left-16 top-8 h-72 w-72 rounded-full bg-[var(--home-primary-soft)] blur-2xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-[var(--home-accent-soft)] blur-2xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.45fr_1fr]">
          <div className="relative mx-auto min-h-[320px] w-full max-w-[30rem] sm:min-h-[350px] lg:mx-0">
            <div className="absolute inset-x-4 top-2 h-[19rem] rounded-[2.5rem] bg-[linear-gradient(145deg,var(--home-primary-soft),color-mix(in_srgb,var(--card)_82%,transparent))] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:inset-x-7 sm:h-[20rem]" />
            <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] blur-3xl" />
            <div className="absolute right-6 bottom-8 h-28 w-28 rounded-full bg-[color-mix(in_srgb,#0891b2_12%,transparent)] blur-2xl" />

            <div className="absolute left-1/2 top-7 z-10 w-[min(84%,20.5rem)] -translate-x-1/2 rounded-[1.5rem] border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_96%,transparent)] p-4 shadow-[0_24px_50px_rgba(55,49,120,0.14)] backdrop-blur sm:top-8 sm:w-[20.5rem] sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-black text-[var(--foreground)]">
                  Tasks List
                </span>
                <span className="rounded-full bg-[var(--home-primary-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-normal text-[var(--primary)]">
                  Auto saved
                </span>
              </div>

              {["Choose correct tool", "Compress image assets", "Share final link"].map((item, index) => (
                <div
                  key={item}
                  className="mb-3 flex items-center gap-3 rounded-xl bg-[var(--home-surface)] px-3 py-2.5 last:mb-0"
                >
                  <span
                    className={`home-premium-icon ${
                      index === 0 ? "home-icon-emerald" : "home-icon-cyan"
                    } grid h-7 w-7 shrink-0 place-items-center rounded-full`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-xs font-bold text-[var(--muted-foreground)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="home-premium-icon home-icon-rose absolute left-4 top-[6.4rem] z-20 grid h-14 w-14 rotate-[-10deg] place-items-center rounded-2xl shadow-[0_18px_34px_rgba(108,77,246,0.16)] sm:left-7 sm:top-28 sm:h-16 sm:w-16">
              <DatabaseZap className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>

            <div className="absolute bottom-7 left-8 z-30 rounded-2xl border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_96%,transparent)] px-4 py-3 shadow-[0_18px_34px_rgba(55,49,120,0.12)] backdrop-blur">
              <div className="flex h-11 items-end gap-1.5">
                {[28, 44, 36, 58, 48, 70, 55, 78].map((height, index) => (
                  <span
                    key={`${height}-${index}`}
                    className="w-2 rounded-full bg-[var(--primary)] opacity-85"
                    style={{ height: `${height * 0.78}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute bottom-10 right-7 z-30 flex rounded-full border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_96%,transparent)] p-1.5 shadow-[0_16px_32px_rgba(55,49,120,0.10)] backdrop-blur sm:right-10">
              {["M", "A", "N", "+9"].map((avatar) => (
                <span
                  key={avatar}
                  className="-ml-1.5 grid h-8 w-8 first:ml-0 place-items-center rounded-full border-2 border-[var(--card)] bg-[var(--home-primary-soft)] text-[11px] font-black text-[var(--primary)] shadow-[var(--home-shadow-sm)] sm:h-9 sm:w-9 sm:text-xs"
                >
                  {avatar}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-8">
            <div>
              <p className="text-4xl font-black text-[var(--primary)]">
                <AnimatedMetric value={29} suffix="M+" start={metricsActive} />
              </p>
              <p className="mt-2 max-w-xs text-sm font-semibold leading-6 text-[var(--muted-foreground)] lg:max-w-[10rem]">
                Workflows saved over time
              </p>
            </div>
            <div className="h-px bg-[var(--home-border)]" />
            <div>
              <p className="text-4xl font-black text-[var(--primary)]">
                <AnimatedMetric value={100} suffix="M+" start={metricsActive} />
              </p>
              <p className="mt-2 max-w-xs text-sm font-semibold leading-6 text-[var(--muted-foreground)] lg:max-w-[10rem]">
                Total tasks created and completed
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {features.map(({ title, description, icon: Icon, tone }) => (
              <article key={title} className="flex gap-4">
                <span className={`home-premium-icon ${tone} grid h-11 w-11 shrink-0 place-items-center rounded-xl`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-base font-black text-[var(--foreground)]">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                    {description}
                  </span>
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
