"use client";

import { useState, useId } from "react";
import Link from "next/link";
import {
  Mail, Zap, Clock, MapPin, Star, ArrowRight,
  Check, Users, Newspaper, Bell, Globe, ChevronRight,
} from "lucide-react";

// ─── data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { icon: Users,     value: "6M+",  label: "Daily active readers", sublabel: "across all newsletters" },
  { icon: Newspaper, value: "3–7",  label: "Issues per week",      sublabel: "based on your preference" },
  { icon: MapPin,    value: "500+", label: "Cities covered",       sublabel: "with hyper-local reporting" },
];

const FEATURES = [
  { icon: Zap,   title: "Breaking alerts",    desc: "Instant notifications for major stories in your area, delivered before anyone else." },
  { icon: Clock, title: "Morning briefing",   desc: "Start every day with a crisp 5-minute digest of what matters locally." },
  { icon: Globe, title: "Topic customization",desc: "Choose politics, tech, sports, business — your feed, your rules." },
  { icon: Bell,  title: "Event reminders",    desc: "Never miss a local event, town hall, or community moment again." },
];

const TESTIMONIALS = [
  { name: "Priya S.",   text: "I get all my local news from this newsletter. It's the first thing I read every morning.", stars: 5 },
  { name: "James K.",  text: "Incredibly well-curated. Replaced my habit of doom-scrolling social media completely.", stars: 5 },
  { name: "Anika M.",  text: "The local section is brilliant. I finally feel connected to what's happening nearby.", stars: 4 },
];

const FREQUENCIES = [
  { id: "daily",   label: "Daily" },
  { id: "weekly",  label: "Weekly" },
  { id: "breaking",label: "Breaking only" },
];

// ─── sub-components ───────────────────────────────────────────────────────────

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < count ? "fill-amber-400 text-amber-400" : "text-[var(--border)]"}
        />
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, sublabel }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
        <Icon size={18} />
      </div>
      <div className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">{value}</div>
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{sublabel}</p>
      </div>
    </div>
  );
}

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

// ─── form ─────────────────────────────────────────────────────────────────────

function SubscribeForm() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  function validate(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setState("loading");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <Check size={20} />
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">You&apos;re in! 🎉</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Check <span className="font-medium text-[var(--foreground)]">{email}</span> for a confirmation link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* email input */}
      <div className="space-y-1.5">
        <label htmlFor={emailId} className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Email address
        </label>
        <div className={`
          flex items-center gap-2 overflow-hidden rounded-xl border
          bg-[var(--card)] px-4 py-3 transition
          ${error ? "border-red-500/50 focus-within:border-red-500" : "border-[var(--border)] focus-within:border-[var(--foreground)]/30"}
        `}>
          <Mail size={15} className="shrink-0 text-[var(--muted-foreground)]" />
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@example.com"
            autoComplete="email"
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* frequency */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Frequency</p>
        <div className="flex gap-2">
          {FREQUENCIES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFrequency(f.id)}
              className={`
                flex-1 rounded-xl border py-2.5 text-xs font-medium transition
                ${frequency === f.id
                  ? "border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* submit */}
      <button
        type="submit"
        disabled={state === "loading"}
        className="
          flex w-full items-center justify-center gap-2
          rounded-xl bg-[var(--primary)] px-5 py-3
          text-sm font-semibold text-[var(--primary-foreground)]
          transition hover:opacity-90 active:scale-[0.99]
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        {state === "loading" ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Subscribing…
          </>
        ) : (
          <>
            Subscribe free <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-[var(--muted-foreground)]">
        No spam, ever. Unsubscribe in one click.{" "}
        <Link href="/policypages/privacy" className="underline underline-offset-2 hover:text-[var(--foreground)] transition">Privacy policy</Link>.
      </p>
    </form>
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
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Free · No credit card
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
            Local news that{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[var(--primary)]">matters</span>
              <span className="absolute inset-x-0 bottom-1 h-3 -z-0 bg-[var(--primary)]/10 rounded" />
            </span>
            <br />
            delivered daily.
          </h1>

          <p className="text-base leading-relaxed text-[var(--muted-foreground)]">
            Join 6 million readers getting the best local stories — politics, tech, business, sports — curated and delivered to your inbox every morning.
          </p>

          {/* social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["bg-violet-500","bg-sky-500","bg-emerald-500","bg-amber-500"].map((c, i) => (
                <div key={i} className={`h-8 w-8 rounded-full border-2 border-[var(--background)] ${c} flex items-center justify-center text-xs font-bold text-white`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <StarRating count={5} />
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">Loved by 6M+ readers</p>
            </div>
          </div>
        </div>

        {/* right: form card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-md sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Subscribe for free</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Get local updates delivered to your inbox.</p>
          </div>
          <SubscribeForm />
        </div>
      </section>

      {/* ── stats ─────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Trusted by millions</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Join a community that stays informed, every single day.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── features ──────────────────────────────────────────────────── */}
      <section className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Everything in your inbox</h2>
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            NewsRoom delivers more than just headlines. We bring full context, local perspective, and the stories that affect your community.
          </p>
        </div>
        <div className="space-y-6">
          {FEATURES.map((f) => <FeatureRow key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── testimonials ──────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">What readers say</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map(({ name, text, stars }) => (
            <div key={name} className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <StarRating count={stars} />
              <p className="flex-1 text-sm leading-relaxed text-[var(--foreground)]">&quot;{text}&quot;</p>
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">{name}</p>
            </div>
          ))}
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
          <h2 className="text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl">Ready to stay informed?</h2>
          <p className="mx-auto max-w-md text-sm text-[var(--muted-foreground)]">
            Start your free subscription today. Cancel anytime. No hidden fees.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#top" className="
              flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3
              text-sm font-semibold text-[var(--primary-foreground)]
              transition hover:opacity-90
            ">
              Get started <ArrowRight size={15} />
            </a>
            <Link
              href="/news"
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Browse news first <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}