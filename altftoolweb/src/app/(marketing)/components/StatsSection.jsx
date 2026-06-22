"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function StatsSection() {
  return (
    <section className="section pt-0">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--home-border)] bg-white px-6 py-7 text-[var(--foreground)] shadow-[0_24px_68px_rgba(55,49,120,0.1)] dark:bg-[var(--card)] md:px-10">
        <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-[color-mix(in_srgb,var(--primary)_13%,transparent)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-28 h-52 w-52 rounded-full bg-[rgba(123,227,232,0.22)] blur-3xl" />
        <Sparkles className="absolute right-32 top-8 h-5 w-5 text-[var(--primary)]/55" />
        <Sparkles className="absolute bottom-8 right-16 h-4 w-4 text-[#44C7D9]/70" />

        <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_0.92fr_auto]">
          <div>
            <h2 className="text-2xl font-black leading-tight md:text-3xl">
              Ready to speed up your workflow?
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted-foreground)]">
              Join thousands of productive people and find the right tools today.
            </p>
          </div>

          <div className="flex min-w-0 rounded-xl border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--home-surface)_70%,white)] p-1.5 shadow-[0_16px_38px_rgba(55,49,120,0.08)] dark:bg-[color-mix(in_srgb,var(--home-surface)_88%,#071426)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.3)]">
            <input
              type="email"
              placeholder="Enter your email"
              suppressHydrationWarning
              className="min-w-0 flex-1 rounded-lg border-0 bg-transparent px-4 text-sm font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
            />
            <Link
              href="/tools/all"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-black text-white transition hover:bg-[var(--primary-hover)]"
            >
              Explore Tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="hidden h-24 w-24 place-items-center lg:grid">
            <Image
              src="/assets/cta-workflow.svg"
              alt=""
              aria-hidden
              width={140}
              height={140}
              className="h-28 w-28"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
