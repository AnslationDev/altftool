"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";

export default function StatsSection() {
  return (
    <section className="section">
      <div className="home-stats-shell relative overflow-hidden px-6 py-7 text-[var(--foreground)] md:px-10">
        <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,31rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(27rem,33rem)]">
          <div className="max-w-[34rem]">
            <div className="home-reference-badge">
              <span className="home-reference-badge-icon">
                <WandSparkles className="h-3.5 w-3.5" />
              </span>
              Find Better Tools, Faster
            </div>

            <h2 className="section-title mt-6 max-w-[30rem] text-[var(--foreground)]">
              Ready to speed up your{" "}
              <span className="bg-[linear-gradient(135deg,#14B8A6_0%,#0EA5E9_100%)] bg-clip-text text-transparent">
                workflow?
              </span>
            </h2>

            <p className="mt-4 max-w-[28rem] text-[0.98rem] font-semibold leading-7 text-[var(--muted-foreground)]">
              Join thousands of productive people and find the right tools today.
            </p>

            <div className="mt-8 home-stats-email-card flex min-w-0 flex-col rounded-[1.2rem] border border-[var(--home-border)] p-1.5 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-[var(--muted-foreground)]">
                <Mail className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  suppressHydrationWarning
                  className="min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                />
              </div>
              <Link
                href="/tools/all"
                className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#0D9488,#0EA5E9)] px-7 text-[1.02rem] font-bold text-white shadow-[0_14px_28px_rgba(20,184,166,0.22)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#0D9488,#0EA5E9)] sm:min-w-[15.75rem]"
              >
                Explore Tools
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 text-[var(--muted-foreground)] md:flex-row md:flex-wrap md:items-center md:gap-0 lg:flex-nowrap">
              <div className="flex items-center gap-3 pr-0 text-[0.98rem] font-semibold whitespace-nowrap md:pr-6">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                <span>Trusted &amp; Secure</span>
              </div>
              <div className="hidden h-7 w-px bg-[color-mix(in_srgb,var(--home-border)_85%,transparent)] md:block" />
              <div className="flex items-center gap-3 text-[0.98rem] font-semibold whitespace-nowrap md:px-6">
                <Zap className="h-5 w-5 text-[var(--primary)]" />
                <span>Save Time</span>
              </div>
              <div className="hidden h-7 w-px bg-[color-mix(in_srgb,var(--home-border)_85%,transparent)] md:block" />
              <div className="flex items-center gap-3 text-[0.98rem] font-semibold whitespace-nowrap md:pl-6">
                <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                <span>Curated with Care</span>
              </div>
            </div>
          </div>

          <div className="relative order-first mx-auto w-full max-w-[22rem] lg:order-none lg:mx-0 lg:ml-auto lg:max-w-none">
            <div className="home-stats-visual-wrap relative flex min-h-[10.5rem] items-center justify-center px-0 py-1 sm:min-h-[12rem] lg:min-h-[12.5rem]">
              <Image
                src="/assets/cta-tools-visual-transparent-v3.png"
                alt=""
                aria-hidden
                width={1536}
                height={1024}
                className="home-stats-visual-art h-auto w-full max-w-[22rem] object-contain sm:max-w-[25rem] lg:max-w-[29rem]"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
