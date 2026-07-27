"use client";

import Link from "next/link";
import { Mail, Zap, Clock, Bell, Globe, ChevronRight } from "lucide-react";

// ─── data ─────────────────────────────────────────────────────────────────────
//
// Nothing on this page may assert subscriber counts, coverage figures, ratings
// or reader quotes. The newsletter has not launched, there is no subscriber
// list, and there is no backend to accept an address — so the page must not
// collect one or claim that a confirmation email was sent.

const PLANNED_FEATURES = [
  { icon: Zap, title: "Breaking alerts", desc: "Notifications for major stories in the topics you follow." },
  { icon: Clock, title: "Morning briefing", desc: "A short daily digest of the stories we published overnight." },
  { icon: Globe, title: "Topic choices", desc: "Pick politics, tech, sports or business — your feed, your rules." },
  { icon: Bell, title: "Event reminders", desc: "Reminders for local events, town halls and community moments." },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function FeatureRow({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{desc}</p>
      </div>
    </div>
  );
}

// ─── signup notice ────────────────────────────────────────────────────────────
//
// Deliberately NOT a form. There is no endpoint to store an address and no
// system that can send a confirmation, so asking for an email would be a
// promise we cannot keep.

function SignupNotice() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-md sm:p-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
        <Mail size={18} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-[var(--foreground)]">
        Newsletter signup is coming soon
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        Sign-ups are not open yet, so we are not collecting email addresses on this page.
        When the briefing launches we will announce it on the AltFTool News homepage.
      </p>
      <Link
        href="/news"
        className="
          mt-6 inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)]
          px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)]
          transition hover:opacity-90 active:scale-[0.99]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
          focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
        "
      >
        Read AltFTool News <ChevronRight size={15} />
      </Link>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-20 pb-20">

      {/* ── hero ─────────────────────────────────────────────────────── */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center">

        {/* left: copy */}
        <div className="space-y-6">
          {/* eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)]" />
            Not launched yet
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
            A daily news briefing,{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[var(--primary)]">coming soon</span>
              <span className="absolute inset-x-0 bottom-1 h-3 -z-0 bg-[var(--primary)]/10 rounded" />
            </span>
            .
          </h1>

          <p className="text-base leading-relaxed text-[var(--muted-foreground)]">
            We are building an email briefing around the stories we publish on AltFTool News —
            politics, tech, business and sports. It is not live yet, and sign-ups are not open.
          </p>
        </div>

        {/* right: signup notice */}
        <SignupNotice />
      </section>

      {/* ── planned features ──────────────────────────────────────────── */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">What we are planning</h2>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            These are the things we want the briefing to do when it launches. Nothing here is
            available yet.
          </p>
        </div>
        <div className="space-y-6">
          {PLANNED_FEATURES.map((f) => <FeatureRow key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── bottom CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center sm:p-12">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-[var(--primary)]/5 blur-3xl" />

        <div className="relative space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
            <Mail size={22} />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl">Read the news in the meantime</h2>
          <p className="mx-auto max-w-md text-sm text-[var(--muted-foreground)]">
            The newsletter is not open for sign-ups. Until it is, the full AltFTool News feed is
            free to read in your browser.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/news"
              className="
                flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-6 py-3
                text-sm font-medium text-[var(--muted-foreground)] transition
                hover:bg-[var(--muted)] hover:text-[var(--foreground)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
                focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
              "
            >
              Browse news <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
