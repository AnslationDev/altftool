"use client";
import { BarChart3, BookOpen, Brain, Grid3X3, Play } from "lucide-react";
import HumanBenchmark from "./components/HumanBenchmark";

export default function ReflexLabPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-secondary hb-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `.hb-wrapper,.hb-wrapper *{transition:none!important;}` }} />
      <HumanBenchmarkHeader />
      <HumanBenchmark />
    </div>
  );
}

function HumanBenchmarkHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/95 px-4 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
        <a href="#overview" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Brain className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-black leading-none text-[var(--foreground)]">AltF Reflex Lab</span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--secondary-foreground)]">Cognitive Lab</span>
          </span>
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          <HeaderLink href="#overview" icon={<BarChart3 className="h-4 w-4" />} label="Overview" />
          <HeaderLink href="#tests" icon={<Grid3X3 className="h-4 w-4" />} label="Tests" />
          <HeaderLink href="#scores" icon={<Brain className="h-4 w-4" />} label="Scores" />
          {/* Server-rendered explainer in components/TestGuides.jsx. */}
          <HeaderLink href="#test-guides" icon={<BookOpen className="h-4 w-4" />} label="Guide" />
        </nav>

        <a
          href="#tests"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-black text-[var(--primary-foreground)] shadow-lg"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          Start
        </a>
      </div>
    </header>
  );
}

function HeaderLink({ href, icon, label }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)]/70 px-3 py-2 text-sm font-bold text-[var(--secondary-foreground)] hover:text-[var(--primary)]"
    >
      {icon}
      {label}
    </a>
  );
}
