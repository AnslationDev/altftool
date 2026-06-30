"use client";

import Link from "next/link";
import { Navbar } from "../components/site/Navbar";
import { TEMPLATES } from "../lib/templates";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-hero animate-gradient">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center animate-fade-up">
          <p className="text-sm font-medium text-primary">Templates</p>
          <h1 className="mt-1 text-4xl font-bold md:text-5xl">All <span className="gradient-text">14</span> generators</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Choose any template to jump straight into the editor. Ready ones are fully interactive; the rest are coming soon.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TEMPLATES.map((t, i) => (
            <Link
              key={t.slug}
              href={`/prank-socialmedia/editor/${t.slug}`}
              style={{ animationDelay: `${i * 40}ms` }}
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
                <span className="font-medium text-primary opacity-0 transition group-hover:opacity-100">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
