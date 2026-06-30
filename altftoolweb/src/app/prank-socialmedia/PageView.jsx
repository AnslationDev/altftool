"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Check, MonitorSmartphone, Zap, Palette, Download, Layers, Eye } from "lucide-react";
import { Navbar } from "./components/site/Navbar";
import { Button } from "./components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { TEMPLATES } from "./lib/templates";

export default function Page() {
  return (
    <div className="min-h-screen bg-hero animate-gradient">
      <Navbar />
      <Hero />
      <Templates />
      <Features />
      <HowItWorks />
      <FAQ />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-sky/40 blur-3xl animate-float" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-mint/40 blur-3xl animate-float-slow" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Studio-grade mockup generator
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Create <span className="gradient-text">Ultra Realistic</span> Social Mockups Instantly
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            Design pixel-perfect WhatsApp chats, Instagram DMs, tweets and notification screens — all in your browser. Customize every detail, switch devices, and export in one click.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Link href="/prank-socialmedia/templates">Start Creating <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="/prank-socialmedia/templates">Explore Templates</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["No signup", "Free to use", "Exports as PNG", "Realistic UI clones"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />{f}</li>
            ))}
          </ul>
        </div>
        <div className="relative h-[520px]">
          <FloatingPreviews />
        </div>
      </div>
    </section>
  );
}

function FloatingPreviews() {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-4 top-4 w-60 rotate-[-6deg] animate-float">
        <div className="gradient-border p-3 shadow-soft">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-white">
            <div className="h-7 w-7 rounded-full bg-white/30" />
            <div>
              <p className="text-xs font-semibold">Alex</p>
              <p className="text-[10px] opacity-80">online</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-emerald-100 px-3 py-1.5 text-xs text-emerald-900">Got the design 🔥</div>
            <div className="w-fit max-w-[80%] rounded-2xl rounded-bl-sm bg-secondary px-3 py-1.5 text-xs">It looks amazing!</div>
          </div>
        </div>
      </div>
      <div className="absolute right-2 top-24 w-56 rotate-[5deg] animate-float-slow">
        <div className="gradient-border p-3 shadow-soft">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400" />
            <div className="text-xs">
              <p className="font-semibold">@mockly</p>
              <p className="text-muted-foreground">just now</p>
            </div>
          </div>
          <p className="mt-2 text-xs">Shipping a brand new editor today ✨</p>
          <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
            <span>♥ 2.4k</span><span>💬 312</span><span>↻ 88</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-12 w-64 rotate-[-2deg] animate-float">
        <div className="glass-strong rounded-2xl p-3 shadow-glow animate-glow-pulse">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500 text-white text-xs font-bold">M</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Mockly</p>
                <p className="text-[10px] text-muted-foreground">now</p>
              </div>
              <p className="text-xs text-muted-foreground">Your export is ready to download.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Templates() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20" id="templates">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Templates</p>
          <h2 className="mt-1 text-3xl font-bold md:text-4xl">A studio for every screen</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">14 carefully crafted generators — every pixel modeled after the real thing.</p>
        </div>
        <Button asChild variant="ghost" className="hidden md:inline-flex">
          <Link href="/prank-socialmedia/templates">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TEMPLATES.slice(0, 8).map((t, i) => (
          <Link
            key={t.slug}
            href={`/prank-socialmedia/editor/${t.slug}`}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group animate-fade-up gradient-border overflow-hidden p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-glow"
          >
            <div className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${t.accent} text-white shadow-glow`}>
              <t.icon className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.short}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${t.ready ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {t.ready ? "Ready" : "Polishing"}
              </span>
              <span className="font-medium text-primary opacity-0 transition group-hover:opacity-100">Open editor →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Eye, title: "Real-time live preview", desc: "Every keystroke updates the mock instantly." },
    { icon: Layers, title: "Exact UI clones", desc: "Typography, spacing, ticks, badges — all to spec." },
    { icon: MonitorSmartphone, title: "Mobile + desktop", desc: "Designed responsive from day one." },
    { icon: Palette, title: "Light, dark, AMOLED", desc: "Switch themes with one click." },
    { icon: Zap, title: "Browser-based", desc: "No installs. Nothing leaves your device." },
    { icon: Download, title: "Instant PNG export", desc: "High-resolution screenshots in a click." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium text-primary">Features</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">Built like a real product</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <div key={i} className="glass animate-fade-up rounded-2xl p-6 transition hover:shadow-glow" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-gradient-mint text-primary"><f.icon className="h-5 w-5" /></div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Choose a template", d: "Pick from 14 social and system mockups." },
    { n: "02", t: "Customize content", d: "Edit names, messages, themes, devices." },
    { n: "03", t: "Export your screenshot", d: "Download a crisp PNG instantly." },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium text-primary">How it works</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">Three steps. That&apos;s it.</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={i} className="gradient-border p-7 shadow-soft animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="gradient-text text-5xl font-bold">{s.n}</span>
            <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: "Is Mockly free?", a: "Yes. Every template is free to use in your browser, with unlimited exports." },
    { q: "Is it responsive?", a: "Mockly works on mobile, tablet and desktop. Editors adapt their layout to your screen." },
    { q: "Can I export screenshots?", a: "Yes — every editor includes a one-click PNG export at high resolution." },
    { q: "Is it for entertainment only?", a: "Strictly. Mockly is meant for parody, design, and educational mockups — never for fraud or impersonation." },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-primary">FAQ</p>
        <h2 className="mt-1 text-3xl font-bold md:text-4xl">Questions, answered</h2>
      </div>
      <Accordion type="single" collapsible className="glass rounded-2xl px-4">
        {qs.map((item, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
